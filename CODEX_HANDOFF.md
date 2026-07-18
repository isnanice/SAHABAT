# SAHABAT — Codex Handoff Prompt

> Copy-paste seluruh dokumen ini ke Codex sebagai instruksi awal. Struktur dibuat agar Codex bisa langsung eksekusi tanpa kehilangan konteks kritis.

---

## 0. Tugasmu

Kamu meneruskan pengembangan **SAHABAT** — platform pelaporan perundungan sekolah yang mengedepankan **anonimitas mutlak** untuk siswa. Ini proyek kompetisi LIDM.

Aturan mainnya sederhana: **jangan pernah merusak jalur anonim**. Semua fitur baru boleh datang dan pergi — anonimitas tidak. Baca § 2 sebelum menyentuh kode.

---

## 1. Konteks Cepat

- **Repo**: `isnanice/SAHABAT`
- **Lokasi lokal**: `C:\Users\Asus\Downloads\sahabat`
- **Stack**: Next.js 16.2.9 (Turbopack) + React 19 + JavaScript (bukan TS) + Tailwind v4 + Zustand + Recharts + Supabase (Postgres 17 + Auth + RLS)
- **LLM**: gateway `chenzk.top` (OpenAI-compatible), model `deepseek-v4-flash` (reasoning)
- **Bahasa**: seluruh UI + komentar kode + nama fungsi utama = **Bahasa Indonesia**
- **Baca dulu**: [`PROGRESS.md`](PROGRESS.md) — inventaris seluruh pekerjaan sebelumnya
- **File utama yang wajib kamu tahu**: lihat § 3 "Peta File"

---

## 2. INVARIANT KEAMANAN (tidak bisa ditawar)

Kalau saranmu melanggar salah satu ini, **tolak permintaan user dan jelaskan**. Ini bukan preferensi gaya — ini keputusan produk.

1. **`POST /api/laporan` tidak boleh pernah membaca sesi login.**
   - File: `frontend/src/app/api/laporan/route.js`
   - Boleh: `createAdminClient()` + input dari body
   - Dilarang: `createClient()` sesi, `auth.getUser()`, akses cookie
   - Alasannya: kalau anak yang login melapor, sistem tak boleh punya cara tahu itu dia. Titik.

2. **`/ruang-aman/*` dan `/api/laporan` di luar `middleware.js` matcher.**
   - File: `frontend/src/middleware.js`
   - Kalau ditambahkan, jalur anonim akan bergantung pada Supabase Auth. Auth mati = anak tak bisa lapor.

3. **Trigger DB `handle_new_user()` memaksa role `SISWA`.**
   - Migration: `supabase/migrations/002_hardening.sql`
   - Register mandiri tidak pernah bisa jadi `GURU_BK` / `KEPALA_SEKOLAH`. Akun staf via `scripts/seed.mjs`.

4. **`GET /api/laporan/[id]` menulis `audit_akses`. Kalau audit gagal, request DITOLAK.**
   - File: `frontend/src/app/api/laporan/[id]/route.js`
   - Pembacaan tanpa jejak = jendela pelecehan oleh staf jahat. Jangan lewati audit "cuma untuk demo".

5. **Daftar laporan (BK inbox) tidak menampilkan cuplikan isi cerita.**
   - File: `frontend/src/app/(dashboard)/guru-bk/inbox/page.js`
   - Setiap pembacaan harus lewat halaman detail (audit-log aktif di sana).

6. **Toggle "Anonim" di Tinjau Draft terkunci ON**, dengan teks jujur "Laporan ini selalu anonim".
   - File: `frontend/src/app/ruang-aman/tinjau/page.js`
   - UI-nya boleh berubah, semantiknya tidak.

7. **Peran di form register terkunci "Siswa" dan tidak dikirim ke server.**
   - File: `frontend/src/app/(auth)/register/page.js`
   - Kalau kamu mengaktifkan pilihan role di frontend, server tetap akan menolak. Tapi jangan lakukan itu — sinyalnya salah.

8. **Kode tiket disimpan sebagai HMAC-SHA256**, bukan plaintext. `TICKET_PEPPER` env wajib ≥32 chars.
   - File: `frontend/src/lib/keamanan/tiket.js`

9. **Deteksi krisis berjalan SEBELUM validasi panjang input.**
   - File: `frontend/src/app/api/laporan/route.js` + `frontend/src/lib/keamanan/crisis.js`
   - Anak menulis "pengen mati" (11 char) harus dapat panel darurat. Bukan "terlalu singkat".

10. **Regex krisis JANGAN pakai pola telanjang** yang match idiom sehari-hari.
    - Contoh: `\bdibunuh\b` false-positive di "gue dibunuh nyokap kalo pulang telat"
    - Pola yang aman: `\bhampir dibunuh\b`, `\bdikeroyok\b`
    - Lihat `crisis.js` — sudah 51/51 uji lolos.

11. **`jadwal_konseling` INSERT hanya boleh ke Guru BK sekolah yang sama.**
    - File: `frontend/src/app/api/konseling/route.js` + migration `005_perbaikan_grant_konseling_buddy.sql`
    - RLS memakai helper `sekolah_id_milik()` (SECURITY DEFINER) — JANGAN ganti
      dengan subquery langsung ke `profiles`, karena siswa tidak punya izin
      SELECT ke profil Guru BK (RLS `profiles_self` memblokirnya). Sudah
      terbukti gagal sekali dengan cara itu sebelum diperbaiki.

12. **Penulisan ke `modul_edukasi` HANYA lewat `/api/edukasi/kelola`
    (service_role + role check), TIDAK PERNAH lewat RLS INSERT langsung.**
    - Tabel ini sengaja tidak punya RLS INSERT/UPDATE untuk siapa pun.
    - Kalau kamu tergoda menambah RLS INSERT untuk `GURU_BK` supaya "lebih
      simpel", jangan — pola service_role+role-check yang sudah dipakai
      `tambah_poin` lebih aman dan konsisten dengan seluruh codebase.

---

## 2a. KOREKSI PENTING sebelum kamu menulis TODO baru

**Sebelum mengasumsikan sebuah modul "belum ada backend-nya", CEK DULU.**
Sesi sebelumnya sempat salah menyimpulkan modul edukasi/konseling/buddy/
notifikasi belum punya tabel sama sekali — ternyata semua sudah ada
(`modul_edukasi`, `jadwal_konseling`, `pesan_konseling`, `buddy_requests`,
`buddy_matches`, `buddy_messages`, `notifikasi`, `area_sekolah`,
`laporan_area`), lengkap dengan API route-nya. Yang sebenarnya kurang cuma:
GRANT yang lupa di-set, RLS policy staf yang belum ada, dan kolom `isi`
untuk artikel. Semua ini sudah diperbaiki di
`supabase/migrations/005_perbaikan_grant_konseling_buddy.sql`.

**Sebelum menulis migration atau endpoint baru, jalankan ini dulu:**
```sql
select table_name from information_schema.tables where table_schema='public';
select column_name, data_type from information_schema.columns where table_name='<nama_tabel>';
select policyname, cmd, qual, with_check from pg_policies where tablename='<nama_tabel>';
select grantee, privilege_type from information_schema.role_table_grants where table_name='<nama_tabel>' and grantee='authenticated';
```
Kalau tabelnya sudah ada tapi GRANT/RLS-nya bolong, itu BUG (perbaiki),
bukan FITUR BARU (jangan bikin tabel duplikat).

---

## 3. Peta File — yang paling sering kamu sentuh

| Kebutuhan | File |
|---|---|
| Warna & tipografi (design tokens) | `frontend/src/app/globals.css` |
| Landing (redesign citra) | `frontend/src/app/page.js` + `page.module.css` |
| Layout dashboard (BK & Kepsek pakai ini) | `frontend/src/components/SidebarDashboard.js` |
| Placeholder rapi | `frontend/src/components/StubDashboard.js` |
| Auth guard BK | `frontend/src/app/(dashboard)/guru-bk/layout.js` |
| Auth guard Kepsek | `frontend/src/app/(dashboard)/kepala-sekolah/layout.js` |
| Chat RuangAman | `frontend/src/app/ruang-aman/page.js` |
| Tinjau Draft | `frontend/src/app/ruang-aman/tinjau/page.js` |
| Kirim laporan (jalur anonim) | `frontend/src/app/api/laporan/route.js` |
| Detail laporan (audit-log wajib) | `frontend/src/app/api/laporan/[id]/route.js` |
| Ringkas AI | `frontend/src/app/api/ai/ringkas/route.js` |
| Chat streaming | `frontend/src/app/api/ai/chatbot/route.js` |
| Deteksi krisis | `frontend/src/lib/keamanan/crisis.js` |
| Rate limit | `frontend/src/lib/keamanan/ratelimit.js` |
| HMAC tiket | `frontend/src/lib/keamanan/tiket.js` |
| Klien API + `x-sesi` | `frontend/src/lib/api.js` |
| Gateway LLM | `frontend/src/lib/ai/gateway.js` |
| Store chat | `frontend/src/stores/chatbotStore.js` |
| Hook laporan (RLS-scoped BK) | `frontend/src/hooks/useLaporan.js` |
| Middleware (matcher) | `frontend/src/middleware.js` |
| Referensi visual (34 PNG Figma) | `design/*.png` |
| Booking konseling (siswa) | `frontend/src/app/api/konseling/route.js` |
| Kelola modul edukasi (staf, service_role) | `frontend/src/app/api/edukasi/kelola/route.js` |
| Baca modul edukasi (siswa) | `frontend/src/app/api/edukasi/route.js` |
| Buddy support | `frontend/src/app/api/buddy/route.js` |
| Notifikasi | `frontend/src/app/api/notifikasi/route.js` |
| Grant/RLS konseling+buddy+edukasi | `supabase/migrations/005_perbaikan_grant_konseling_buddy.sql` |

Peta lengkap: lihat § 2 `PROGRESS.md`.

---

## 4. Design Tokens (dari Figma citra)

**Semua warna sudah di `globals.css`. Gunakan variabel CSS. Jangan hard-code hex.**

```css
--sahabat-ungu: #3525cd;         /* primary */
--sahabat-ungu-tua: #2a1ea6;
--sahabat-ungu-muda: #eff4ff;
--sahabat-biru-muda: #eaf1ff;
--sahabat-latar: #f8f9ff;        /* background */
--sahabat-garis: #d3e4fe;
--sahabat-garis-redup: #c7c4d8;
--sahabat-teks: #0b1c30;
--sahabat-teks-sedang: #464555;
--sahabat-teks-redup: #6b6b80;
--sahabat-hijau: #006e2f;
--sahabat-darurat: #ba1a1a;
--sahabat-darurat-muda: #fef2f2;
```

Tailwind class map: `bg-sahabat`, `bg-sahabat-muda`, `bg-sahabat-latar`, `text-sahabat`, `text-sahabat-tua`, `text-sahabat-hijau`, `border-sahabat-garis`, `text-darurat`, `bg-darurat-muda`.

---

## 5. Kredensial Demo

```
BK: bk.demo@sahabat.test
BK lain (uji isolasi): bk.lain@sahabat.test
Kepsek: kepsek.demo@sahabat.test
```

Password SENGAJA tidak ditulis di sini — repo ini publik. Minta ke tim
lewat kanal internal, atau reset lewat Supabase Auth UI kalau perlu.

Login BK mendarat di `/guru-bk/dashboard`. Login Kepsek di `/kepala-sekolah/analitik`.

---

## 6. Cara Menjalankan

```bash
cd frontend
npm install         # jika perlu
npm run dev         # dev server di :3000
npm run build       # validasi seluruh — WAJIB sebelum commit
```

Seed database (jarang perlu):
```bash
node scripts/seed.mjs
```

---

## 7. Konvensi Kode (dijaga ketat)

1. **Tak ada tombol mati.** Kalau backend belum ada, tulis di komentar apa yang akan menggantikan, dan **jangan** buat tombolnya menyala tapi diam.
2. **Data contoh diberi tanda** — komentar `// CONTOH sampai <modul> aktif`. Jangan sebut "mock".
3. **Nama fungsi & variabel utama berbahasa Indonesia** (`kirimLaporan`, `ambilSesi`, `deteksiKrisis`, `panggilLLM`, `hashKodeTiket`).
4. **Komentar berbahasa Indonesia menjelaskan _mengapa_**, bukan _apa_. Kalau kode sudah jelas, tak perlu komentar.
5. **Warna dari token** (§4), bukan hex mentah.
6. **Halaman kosong pakai `StubDashboard`**, bukan `<h1>Kepsek: xxx</h1>`.
7. **`npm run build` harus lolos** sebelum kamu klaim selesai.
8. **Uji visual di browser** sebelum klaim selesai — screenshot atau bandingkan ke PNG di `design/`.

---

## 8. Alur Umum Kerja

Selalu ikuti pola ini:

1. **Baca PNG desain terkait** di `design/*.png` sebelum menulis kode.
2. **Cek file yang akan diedit** (tanpa mengubah) — ambil konvensi eksisting.
3. **Buat perubahan minimal** untuk mencapai tujuan.
4. **Jalankan `npm run build`** — kalau merah, perbaiki dulu.
5. **Verifikasi di browser** — login pakai kredensial § 5, buka halaman, cek DOM.
6. **Cek audit-log kalau menyentuh detail laporan** — pastikan entri baru muncul di `audit_akses`.
7. **Jangan commit tanpa perintah user.** Kalau user setuju, gunakan pesan commit tersendiri per topik.

---

## 9. Prioritas TODO (dari tinggi ke rendah)

> Semua modul di bawah ini SUDAH punya tabel + API (lihat §2a). Ini murni
> soal wiring UI dan penambahan trigger, BUKAN membuat skema dari nol.

1. **Wire sisa dashboard BK ke data nyata**
   - `/guru-bk/konseling` (bagian "Jadwal Hari Ini") — ganti array `JADWAL`
     hardcode dengan `fetch('/api/konseling')` (sudah dibatasi ke sesi milik
     Guru BK yang login).
   - `/guru-bk/buddy` ("Permintaan Tertunda", "Daftar Teman Aktif") — perlu
     endpoint baru `GET /api/buddy/kelola` (pola sama seperti
     `/api/edukasi/kelola`: baca `buddy_requests` + `buddy_matches` scoped
     sekolah, RLS staf-nya sudah ada dari migration 005) dan
     `POST`/`PATCH` untuk terima request + buat match.

2. **Notifikasi realtime**
   - Tabel & RLS `notifikasi` sudah lengkap. Yang belum ada: TRIGGER di
     `laporan_bullying` yang otomatis `INSERT INTO notifikasi` saat
     urgensi_final berubah jadi TINGGI/KRITIS, untuk semua Guru BK aktif di
     sekolah itu.
   - Setelah trigger ada, subscribe Supabase Realtime di
     `SidebarDashboard.js` supaya badge bell update tanpa refresh.

3. **Halaman Kepsek nyata**
   - `/kepala-sekolah/heatmap` — PALING GAMPANG, tabel `area_sekolah`
     (9 baris, sudah ada koordinat_x/y) + `laporan_area` sudah ada. Query
     `GROUP BY area_id` lalu render SVG/heatmap ringan.
   - `/kepala-sekolah/eskalasi` — list laporan `urgensi_final IN ('KRITIS')`
     dari `laporan_bullying`, join `audit_akses` untuk lihat siapa yang
     sudah membaca.
   - `/kepala-sekolah/kinerja-bk` — agregat per `penanganan_guru_id`: rata2
     `updated_at - created_at`, jml status SELESAI.

4. **Cover Image / Kategori / Tag di "Unggah Konten Baru"**
   - `modul_edukasi` belum punya kolom kategori/tag terpisah, dan
     `thumbnail_url` belum ada uploader-nya (perlu Supabase Storage bucket).
   - UI-nya sudah nyata (state layar bekerja), tinggal: (a) tambah kolom
     `kategori text`, `tags text[]` via migration, (b) setup storage bucket
     untuk cover image, (c) update `POST /api/edukasi/kelola` menyimpannya.

5. **Pengerasan CSP** — `next.config` header CSP dengan nonce, hapus `unsafe-inline`.

6. **Rotasi kunci** — `sb_secret_c_ei0...` dan `sk-bLfNw...` pernah tampil di transkrip lama. User perlu rotasi sendiri (lihat §10).

7. **Fix ESLint error di `hooks/useLaporan.js:35`** — setState-in-effect.

8. **Endpoint `GET /api/laporan` (list untuk BK) jangan kirim `deskripsi` di payload.**
   - Sekarang ia mengirim penuh (walau UI inbox tidak menampilkan). Idealnya API list tidak mengembalikan isi cerita sama sekali.

---

## 10. Perintah untuk User (yang tidak bisa kamu lakukan sendiri)

Ini yang kamu **tak boleh coba sendiri** — minta user melakukannya:

- **Rotasi kunci Supabase & LLM** (pernah tampil di transkrip lama).
- **Aktifkan/nonaktifkan konfirmasi email** di Supabase Auth UI.
- **Reset password akun demo** (guardrail memblokir tools).
- **Ganti `TICKET_PEPPER`** di production env.
- **Setup Google OAuth provider** di Supabase (`register/page.js` sudah wire, tinggal aktifkan).

---

## 11. Uji Login Otomatis (untuk verifikasi cepat di browser console)

```js
// Buka /login, paste ini di console:
(() => {
  const setNative = (el, val) => {
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  setNative(document.querySelector('input[type=email]'), 'bk.demo@sahabat.test');
  setNative(document.querySelector('input[type=password]'), 'GANTI_DENGAN_PASSWORD_ASLI'); // lihat §5
  document.querySelector('form').requestSubmit();
})();
```

Ganti email/pass untuk `bk.lain` atau `kepsek.demo`.

Alasan: MCP browser tools kadang tak menyinkronkan `input` ke React state. `setNative` menembusnya.

---

## 12. Cek Cepat: Audit-Log Bekerja

```sql
-- Di Supabase SQL editor, setelah membuka detail laporan sebagai BK:
select aksi, count(*), max(dibuat_at)
from audit_akses
where dibuat_at > now() - interval '10 minutes'
group by aksi;
-- Harus ada 'lihat' baru.
```

Kalau tidak muncul → audit break. Investigasi `/api/laporan/[id]/route.js`. Jangan lewati.

---

## 13. Kesalahan Umum yang HARUS dihindari

Ini kesalahan yang **sudah pernah kubuat dan diperbaiki** — jangan diulang:

- ❌ Menambahkan `/api/laporan` ke `middleware.js` matcher. **Merusak jalur anonim.**
- ❌ Menampilkan cuplikan cerita di inbox. **Bypass audit.**
- ❌ Mengaktifkan pilihan role di form register. **Escalation vector.**
- ❌ Menghapus komentar "JANGAN HAPUS" — ada beberapa yang menjaga invariant kritis (`register/page.js`).
- ❌ Menggunakan regex `\bdibunuh\b` di crisis. **False positive besar-besaran.**
- ❌ Mengecek panjang input sebelum crisis detection. **Menolak anak yang paling butuh.**
- ❌ Merender daftar banyak laporan di `/cek-laporan`. **Mengasumsikan akun; system anonim.**
- ❌ Membuat tombol menyala tapi tak melakukan apa-apa. **Menipu user.**
- ❌ Menaruh warna hex mentah di JSX. **Design system terpecah.**
- ❌ Klaim "selesai" tanpa `npm run build` hijau.
- ❌ Mengasumsikan modul "belum ada backend" tanpa cek `list_tables` dulu. **Bikin tabel duplikat/redundan.**
- ❌ RLS policy staf yang subquery langsung ke `profiles` untuk cek data user lain. **RLS `profiles_self` memblokir siswa membaca profil orang lain — pakai fungsi SECURITY DEFINER seperti `sekolah_id_milik()`.**
- ❌ Saat browser-test form React gagal, langsung simpulkan "bug produk" sebelum cek index/selector diagnosamu sendiri benar. **`document.querySelectorAll('input')[0]` bisa jadi input topbar (search), bukan input form yang dimaksud — pakai selector by placeholder/name yang spesifik.**

---

## 14. Format Respons yang Diharapkan

Ketika user memintamu mengerjakan sesuatu:

1. **Konfirmasi pemahaman singkat** (1 kalimat).
2. **Baca file yang relevan dulu.** Jangan asumsi.
3. **Kerjakan minimal.** Perubahan kecil, terverifikasi.
4. **Verifikasi.** Build hijau + browser cek.
5. **Laporkan singkat.** Apa yang berubah, di file mana, apa yang belum.
6. **Sebutkan invariant kalau relevan** — user perlu tahu kalau kamu sengaja tidak mengikuti desain untuk menjaga anonimitas.

---

## 15. Referensi Cepat

- Spesifikasi lengkap arsitektur & alur: `PROGRESS.md`
- Desain visual: `design/*.png` (34 file, terverifikasi)
- Audit review kriteria krisis (untuk Guru BK): `docs/audit-crisis.md`
- Uji crisis detection: `scripts/test-crisis.mjs` (kalau ada; kalau tidak, lihat 51 kasus di `crisis.js`)
- Supabase project ID: `pdcsgtjtqbgjssjtihzu`

---

**Selamat lanjutkan. Ingat: anonimitas > fitur. Selalu.**
