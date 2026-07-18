# SAHABAT — Progress & File Map

_Snapshot komprehensif seluruh pekerjaan pada branch `main` (belum di-commit)._
_Kompetisi LIDM. Repo: `isnanice/SAHABAT`._

---

## 1. Ringkasan Eksekutif

**Yang tersedia sekarang:**

1. **Jalur lapor anonim ujung-ke-ujung** (spec §1a, §4.1) — RuangAman chat → Tinjau Draft (AI meringkas) → kirim ke Guru BK. `pelapor_id` selalu `null`.
2. **Deteksi krisis deterministik** (`lib/keamanan/crisis.js`) — 51/51 uji lolos, termasuk `BAHAYA_FISIK` (dikeroyok, hampir dibunuh).
3. **Dashboard Guru BK penuh** dengan data nyata (bukan mock) — daftar laporan, detail dengan audit-log, statistik, chart.
4. **Dashboard Kepala Sekolah** dengan shell yang sama (Analitik nyata; sisanya stub konsisten).
5. **Design system tersentralisasi** — semua warna dari Figma citra di `globals.css`, dipakai konsisten seluruh halaman.

**Kredensial akun demo (Supabase):**
| Peran | Email |
|---|---|
| Guru BK | `bk.demo@sahabat.test` |
| Guru BK sekolah lain (uji isolasi) | `bk.lain@sahabat.test` |
| Kepala Sekolah | `kepsek.demo@sahabat.test` |
| Landing utama Kepsek | `/kepala-sekolah/analitik` |
| Landing utama BK | `/guru-bk/dashboard` |

> Password akun demo SENGAJA tidak ditulis di sini — repo ini publik.
> Minta ke tim lewat kanal internal, atau reset lewat Supabase Auth UI.

---

## 2. Peta Direktori

```
sahabat/
├── design/                            # 34 ekspor PNG dari Figma citra (referensi)
├── supabase/migrations/               # 004_grant_tabel.sql adalah yang terakhir
├── scripts/seed.mjs                   # Bangkitkan 1 sekolah + 2 BK + kepsek + 24 laporan
├── docs/audit-crisis.md               # Lembar review 30 menit untuk Guru BK
├── PROGRESS.md                        # File ini
├── CODEX_HANDOFF.md                   # Prompt lanjut project di Codex
└── frontend/
    ├── package.json                   # Next.js 16.2.9, React 19, Tailwind v4, Recharts 3.8
    ├── postcss.config.mjs
    └── src/
        ├── app/
        │   ├── layout.js              # Root, memuat Geist + globals.css
        │   ├── globals.css            # ⭐ DESIGN TOKENS (semua warna Figma)
        │   ├── page.js                # Landing (redesign citra)
        │   ├── page.module.css
        │   ├── (auth)/
        │   │   ├── layout.js          # Split hero + form
        │   │   ├── layout.module.css
        │   │   ├── auth.module.css    # Gaya kartu form, tabs, tombol Google
        │   │   ├── login/page.js
        │   │   ├── register/page.js   # Peran DIKUNCI 'Siswa' + OAuth Google nyata
        │   │   ├── forgot-password/page.js
        │   │   └── atur-ulang-sandi/page.js
        │   ├── (dashboard)/
        │   │   ├── guru-bk/
        │   │   │   ├── layout.js      # ⭐ Auth guard + SidebarDashboard
        │   │   │   ├── dashboard/     # ⭐ Tinjauan Harian (DATA NYATA)
        │   │   │   ├── inbox/         # ⭐ Daftar Laporan (DATA NYATA, filter, CSV)
        │   │   │   ├── laporan/[id]/  # ⭐ Detail Laporan (audit-log AKTIF)
        │   │   │   ├── notifikasi/    # ⭐ Halaman Notifikasi (contoh, tabs berfungsi)
        │   │   │   ├── konseling/     # Manajemen sesi (contoh)
        │   │   │   ├── edukasi/       # Kelola modul + tombol Unggah
        │   │   │   ├── edukasi/unggah/# Form artikel + toolbar
        │   │   │   ├── buddy/         # Ruang Dukungan Sebaya (contoh)
        │   │   │   ├── pengaturan/    # Profil + Konfigurasi Platform
        │   │   │   ├── faq/           # Staff Hub + accordion FAQ
        │   │   │   ├── forum/         # (lama)
        │   │   │   ├── verifikasi/    # (lama)
        │   │   │   └── logbook/       # (lama)
        │   │   └── kepala-sekolah/
        │   │       ├── layout.js      # ⭐ Sama-sama SidebarDashboard, nav Kepsek
        │   │       ├── analitik/      # Chart Recharts (DATA NYATA)
        │   │       ├── dashboard/     # placeholder (belum di-stub)
        │   │       ├── eskalasi/      # StubDashboard konsisten
        │   │       ├── heatmap/       # StubDashboard
        │   │       ├── kinerja-bk/    # StubDashboard
        │   │       └── laporan/       # StubDashboard
        │   ├── ruang-aman/            # ⭐ Sidebar 2-kolom (Progress + ANON id)
        │   │   ├── page.js            #    chat streaming, panel krisis
        │   │   └── tinjau/page.js     # ⭐ Tinjau Draft (AI meringkas)
        │   ├── cek-laporan/           # Lacak tiket + timeline STATUS PERKEMBANGAN
        │   ├── lapor/                 # Form manual (fallback)
        │   ├── dukungan-sebaya/       # Publik (kartu buddy)
        │   ├── konseling/             # Publik (booking konselor)
        │   ├── tentang/               # Visi/Misi + Tim
        │   ├── fitur/                 # 4 kartu fitur
        │   ├── edukasi/               # 6 filter + 3+3 artikel, load-more
        │   ├── kontak-darurat/        # Nomor & hotline
        │   ├── privasi/               # Kebijakan
        │   ├── keluar/                # Route logout paksa
        │   └── api/
        │       ├── ai/
        │       │   ├── chatbot/       # NDJSON streaming ke deepseek-v4-flash
        │       │   └── ringkas/       # ⭐ Ringkas percakapan → draft laporan
        │       ├── laporan/
        │       │   ├── route.js       # ⭐ POST anonim + GET list (BK)
        │       │   └── [id]/route.js  # ⭐ GET/PATCH/POST (audit-log wajib)
        │       ├── tiket/lacak/       # POST cek tiket (rate-limited)
        │       ├── notifikasi/        # placeholder
        │       ├── analitik/
        │       ├── buddy/
        │       ├── konseling/
        │       ├── edukasi/
        │       └── forum/
        ├── components/
        │   ├── SidebarDashboard.js    # ⭐ Shell login BK+Kepsek (satu file)
        │   ├── StubDashboard.js       # Placeholder rapi untuk halaman kosong
        │   ├── HeaderDashboard.js     # (lama, tidak dipakai lagi)
        │   ├── KodeTiket.js           # Kartu tampil setelah lapor
        │   └── PanelDarurat.js        # Ambil-alih saat mode='krisis'
        ├── stores/
        │   ├── authStore.js
        │   └── chatbotStore.js        # State chat RuangAman
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useLaporan.js          # ⭐ Ambil laporan (RLS-scoped BK)
        │   ├── useAnalitik.js
        │   └── useRealtime.js
        ├── lib/
        │   ├── api.js                 # Klien fetch + x-sesi + ambilSesi()
        │   ├── ai/gateway.js          # panggilLLM + panggilLLMStream
        │   ├── keamanan/
        │   │   ├── crisis.js          # ⭐ Regex deterministik (51 uji lolos)
        │   │   ├── ratelimit.js
        │   │   └── tiket.js           # HMAC-SHA256, bentuk SAH-XXXX-XXXX
        │   ├── supabase/
        │   │   ├── client.js
        │   │   ├── server.js
        │   │   └── admin.js           # service_role (server-only)
        │   ├── utils/
        │   └── validations/
        └── middleware.js              # Matcher SENGAJA lepaskan /ruang-aman & /api/laporan
```

⭐ = file kunci yang menopang jalur anonim atau audit-log.

---

## 3. Fase Pekerjaan

### Fase A — Keamanan inti (sudah tercommit)
Commit `9eb755e`..`50b9c5c` di `main`. Ringkasnya:
- RLS ketat + isolasi antar sekolah (`002_hardening.sql`).
- HMAC-SHA256 hash tiket, format `SAH-XXXX-XXXX` (32⁸ keyspace) — `lib/keamanan/tiket.js`.
- Deteksi krisis regex — `lib/keamanan/crisis.js`, 4 kategori termasuk `BAHAYA_FISIK`.
- Rate limit per-sesi (`x-sesi` header), bukan per-IP — `lib/keamanan/ratelimit.js`.
- Audit `audit_akses` untuk setiap `GET /api/laporan/[id]` (server MENOLAK request kalau audit gagal).
- Trigger `handle_new_user()` **memaksa** role `SISWA`; siapa pun `signUp({role:'GURU_BK'})` tetap jadi siswa.
- Tombol Keluar di dashboard (sebelumnya tidak ada — sesi tak bisa diputus).

### Fase B — Desain publik (belum tercommit)
- **Design tokens diambil dari Figma citra** dan disentralkan di `globals.css`:
  - `--sahabat-ungu: #3525cd` (sebelumnya salah: `#4f46e5`)
  - `--sahabat-latar: #f8f9ff`, `--sahabat-muda: #eff4ff`, `--sahabat-garis: #d3e4fe`
  - `--sahabat-hijau: #006e2f`, `--sahabat-darurat: #ba1a1a`
- **Halaman publik dicocokkan ke desain** (satu per satu, terverifikasi di browser):
  - `/` — hero 2-baris + chat mockup + 4 section (Mengapa Sulit, Fitur, Alur, CTA)
  - `/tentang` — hero STOP BULLYING + Visi/Misi + Tim
  - `/fitur` — kartu Ruang Aman besar + 3 kartu + CTA "Sudah Siap Memulai Belum?"
  - `/edukasi` — search + 6 filter pills + 3 kartu + Muat Lebih Banyak (semua **berfungsi nyata**)
  - `/login`, `/register`, `/forgot-password`, `/atur-ulang-sandi` — split hero + form + Google OAuth
  - `/cek-laporan` — dilebarkan jadi "Lacak Laporan" + timeline STATUS PERKEMBANGAN + Catatan Keamanan
  - `/ruang-aman` — sidebar Progress Laporan + Identitas Sesi `ANON-XXXX` + Status Konselor
  - `/ruang-aman/tinjau` — Tinjau Draft dengan ringkasan AI + toggle anonim TERKUNCI ON
  - `/dukungan-sebaya` (baru) — kartu buddy + % Match + 6 filter minat
  - `/konseling` (baru) — pilih Guru BK + metode + kalender + slot

### Fase C — Shell dashboard (belum tercommit)
- **`SidebarDashboard`** — komponen tunggal dipakai BK & Kepsek:
  - Sidebar kiri: logo + nav (Dashboard/Report/Sebaya/Edukasi/Konseling/Pengaturan untuk BK; Analitik/Semua Laporan/Eskalasi/Titik Rawan/Kinerja BK untuk Kepsek).
  - Topbar: search, bell (dot merah), help, avatar, keluar.
  - Layout Guru BK & Kepala Sekolah keduanya sekarang render children di dalam shell yang sama.
- **`StubDashboard`** — placeholder konsisten "segera hadir" untuk halaman Kepsek yang belum bermodul.

### Fase D — Halaman dashboard (belum tercommit)
Semua verified saat login sebagai `bk.demo`:
- **Dashboard** (`/guru-bk/dashboard`) — 4 stat cards dari `useLaporan`, tren 6-bulan Recharts, donut resolusi, tabel kasus urgensi, titik rawan.
- **Report** (`/guru-bk/inbox`) — "Daftar Laporan" + tabs Semua/Tugas Saya + filter Urgensi/Status/Kategori + Export CSV + pagination.
- **Detail Laporan** (`/guru-bk/laporan/[id]`) — 2 kolom: Informasi Dasar / Kronologi / Bukti & Saksi / Balasan | Analisis AI / Timeline / Catatan Internal / Aksi Cepat / Update Status. Audit-log AKTIF.
- **Notifikasi** (`/guru-bk/notifikasi`) — tabs (Semua/Darurat/Pesan/Sistem) + Ringkasan Peringatan + Tindakan Cepat.
- **Konseling** (`/guru-bk/konseling`) — Sesi Aktif dengan timer jalan + Jadwal Hari Ini + Permintaan Baru + Catatan Terbaru.
- **Edukasi** (`/guru-bk/edukasi`) — Kinerja Konten + Tetapkan Konten + Perpustakaan Konten.
- **Unggah Konten** (`/guru-bk/edukasi/unggah`) — Detail Artikel + toolbar + Cover Image dropzone + Pengaturan Konten + Publikasi.
- **Ruang Dukungan Sebaya** (`/guru-bk/buddy`) — stat cards + Permintaan Tertunda + Perhatian + Daftar Teman Aktif.
- **Pengaturan** (`/guru-bk/pengaturan`) — Profil Konselor + Konfigurasi Platform + Keamanan Akun + Notifikasi.
- **FAQ / Staff Hub** (`/guru-bk/faq`) — Protokol Darurat + accordion FAQ + IT Helpdesk.

Kepsek: **Analitik** nyata (Recharts, 24 laporan / 3 krisis / 6 manual dari DB). Sisanya `StubDashboard`.

---

## 4. Invariant Keamanan (JANGAN DILANGGAR)

Semua ini sudah bekerja dan diuji live. Kalau kamu (atau kolaborator) mengubah, verifikasi ulang:

1. **`POST /api/laporan` TIDAK PERNAH membaca sesi login.** Tidak `auth.getUser()`, tidak `createClient()` sesi. Cukup `createAdminClient()` + input dari body. Melanggar ini = membocorkan siapa yang lapor.
2. **`/ruang-aman/*` dan `/api/laporan` di luar `middleware.js` matcher.** Jalur anonim tak boleh bergantung pada auth.
3. **`handle_new_user()` memaksa role `SISWA`.** Register mandiri tidak pernah jadi staf.
4. **`GET /api/laporan/[id]` menulis `audit_akses` — kalau gagal, request DITOLAK.** Tidak "coba tulis, kalau gagal lewati".
5. **Daftar laporan (`inbox`) TIDAK menampilkan cuplikan isi cerita.** Setiap pembacaan harus lewat detail (yang ter-audit).
6. **Toggle Anonim di `/ruang-aman/tinjau` TERKUNCI ON** dengan teks jujur "Laporan ini selalu anonim". `POST /api/laporan` tetap tidak baca sesi meskipun siswa login.
7. **Peran di form register TERKUNCI 'Siswa'** dan **TIDAK dikirim ke server**. Akun staf dibuat lewat `scripts/seed.mjs`.
8. **Kode tiket disimpan sebagai HMAC-SHA256** (bukan plaintext). `TICKET_PEPPER` wajib ≥ 32 karakter di env.
9. **Krisis dideteksi SEBELUM validasi panjang.** Anak menulis "pengen mati" (11 char) harus dapat panel darurat, bukan pesan "terlalu singkat".
10. **Deteksi krisis JANGAN pakai pola telanjang.** "Dibunuh nyokap" (idiom) beda dari "hampir dibunuh". Lihat `crisis.js`.

---

## 5. Konvensi Kode

- **Warna & tipografi**: gunakan token CSS di `globals.css`. Jangan hard-code hex. Kalau butuh warna baru, tambah token dulu.
- **Komentar berbahasa Indonesia** untuk penjelasan _mengapa_ (bukan _apa_ — nama variabel sudah jelas). Ini konvensi eksisting.
- **Nama fungsi & variabel utama berbahasa Indonesia** juga (`ambilSesi`, `hashKodeTiket`, `panggilLLM`, `kirimLaporan`, `deteksiKrisis`).
- **Tak ada `mock` di file produksi.** Kalau backend belum ada, tulis data contoh di komponen dan **beri komentar** yang menyebut ini contoh + apa yang akan menggantikan.
- **Halaman placeholder pakai `StubDashboard`**, bukan `<h1>Kepsek: xxx</h1>` mentah.
- **Setiap tombol harus melakukan sesuatu.** Tak boleh ada tombol yang menyala tapi diam saat diklik.

---

## 6. Apa yang Nyata vs Contoh

| Area | Data |
|---|---|
| Landing, tentang, fitur, edukasi | Statis (konten tetap) |
| Ruang Aman (chat) | **Nyata** — streaming ke gateway LLM |
| Tinjau Draft (ringkasan) | **Nyata** — panggil `/api/ai/ringkas` |
| Kirim laporan | **Nyata** — tersimpan di DB, anonim |
| Cek Laporan | **Nyata** — lookup by hash tiket |
| Dashboard BK (kartu, chart, tabel) | **Nyata** — `useLaporan` RLS-scoped |
| Detail Laporan | **Nyata** — audit-log aktif |
| Notifikasi | **Contoh** — struktur benar, data hard-coded |
| Konseling BK (dashboard sesi) | **Contoh** |
| Edukasi BK + Unggah | **Contoh** |
| Buddy BK | **Contoh** |
| Kepsek: Analitik | **Nyata** |
| Kepsek: sisanya | Stub |

---

## 7. KOREKSI PENTING — Backend edukasi/konseling/buddy/notifikasi SUDAH ADA

**Versi sebelumnya dokumen ini salah.** Draf awal PROGRESS.md/CODEX_HANDOFF.md
mengasumsikan modul edukasi, konseling, buddy, dan notifikasi belum punya
tabel/endpoint sama sekali, dan menyarankan membuat tabel baru dari nol
(termasuk `artikel_edukasi` yang REDUNDAN dengan `modul_edukasi` yang sudah
ada). Audit langsung ke database membuktikan itu keliru:

| Tabel | Status sebelum audit sesi ini |
|---|---|
| `modul_edukasi` (6 baris) + `progress_edukasi` | Sudah ada, sudah dipakai `/api/edukasi` (GET untuk siswa) |
| `notifikasi` (3 baris) | Sudah ada, `/api/notifikasi` GET/PATCH sudah jalan |
| `jadwal_konseling` + `pesan_konseling` | Sudah ada, `/api/konseling` GET/POST sudah ditulis |
| `buddy_requests` + `buddy_matches` + `buddy_messages` | Sudah ada, `/api/buddy` GET/POST sudah ditulis |
| `area_sekolah` (9 baris) + `laporan_area` | Sudah ada — bisa langsung memberi daya ke `/kepala-sekolah/heatmap` |

**Yang BENAR-BENAR jadi gap** (ditemukan lewat audit RLS + simulasi role, bukan tebakan):

1. **Bug nyata, sudah diperbaiki**: `jadwal_konseling` RLS aktif tapi **tidak
   pernah diberi GRANT INSERT/UPDATE ke `authenticated`**. Setiap siswa yang
   booking konseling lewat `POST /api/konseling` akan gagal dengan
   `42501 permission denied`. Dibuktikan lewat simulasi
   `SET LOCAL ROLE authenticated` sebelum diperbaiki.
2. **Bug isolasi sekolah, sudah diperbaiki**: `POST /api/konseling` memilih
   Guru BK dengan `.limit(1)` **tanpa filter sekolah** — siswa bisa
   dipasangkan ke Guru BK sekolah lain.
3. **Fitur hilang, sudah diperbaiki**: `buddy_requests` RLS cuma izinkan
   siswa lihat request-nya sendiri — **Guru BK tidak pernah bisa melihat
   siapa yang menunggu dipasangkan buddy**. Bukan error, tapi query yang
   akan selalu kosong di dashboard staf.
4. **Fitur hilang, sudah diperbaiki**: `modul_edukasi` tidak ada RLS
   INSERT/UPDATE untuk staf sama sekali — halaman "Unggah Konten Baru"
   sebelumnya 100% palsu (`setTimeout` + pesan sukses tanpa simpan apa pun).
5. **Kolom hilang, sudah diperbaiki**: `modul_edukasi` tidak punya kolom
   untuk isi artikel (cuma `konten_url` untuk link eksternal). Ditambah
   kolom `isi text`.

Semua diperbaiki di `supabase/migrations/005_perbaikan_grant_konseling_buddy.sql`
+ `frontend/src/app/api/edukasi/kelola/route.js` (endpoint baru, staf-only)
+ `frontend/src/app/api/konseling/route.js` (fix isolasi sekolah).

**Diuji live, bukan diasumsikan**:
- Simulasi RLS: booking same-school berhasil, cross-school ditolak `42501`.
- `POST /api/edukasi/kelola` dari browser (sesi BK asli) → `200 OK`, `aktif: true`.
- Modul baru langsung muncul di `/guru-bk/edukasi` (Perpustakaan Konten) dan
  `GET /api/edukasi` (yang dipakai `/siswa/edukasi`).
- Form "Unggah Konten Baru" diuji lewat interaksi UI asli (klik+ketik, bukan
  cuma panggil API) — berhasil submit dan redirect.

**Pelajaran untuk sesi berikutnya**: sebelum menulis TODO "buat modul X",
jalankan `list_tables` + cek RLS/GRANT dulu. Skema di project ini jauh
lebih matang dari yang terlihat di frontend — banyak "belum ada fitur"
sebenarnya "sudah ada tabel & API, cuma belum di-wire ke UI atau ada
grant yang lupa".

---

## 8. Yang Masih Beres / TODO (setelah koreksi di atas)

Prioritas dari tinggi ke rendah:

1. **Commit semua ke git** (banyak sekali file `M` dan `??` di `git status`).
2. **Wire sisa halaman BK ke data nyata**: `/guru-bk/konseling` (Jadwal Hari
   Ini) dan `/guru-bk/buddy` (Permintaan Tertunda, Daftar Teman Aktif) masih
   pakai data contoh di layar — tabelnya (`jadwal_konseling`, `buddy_requests`,
   `buddy_matches`) dan API-nya (`/api/konseling`, `/api/buddy`) sudah nyata
   dan sudah bisa staf akses (lihat §7). Tinggal ganti array hardcode dengan
   `fetch()`.
3. **Notifikasi realtime**: trigger DB yang otomatis insert ke `notifikasi`
   saat laporan baru urgensi TINGGI/KRITIS masuk. Tabel & RLS `notifikasi`
   sudah lengkap (SELECT+UPDATE self); yang belum ada cuma trigger INSERT-nya
   (sengaja tak ada grant INSERT untuk `authenticated` — insert harus lewat
   service_role/trigger, supaya user tak bisa notifikasi diri sendiri palsu).
4. **Halaman Kepsek nyata**: `/kepala-sekolah/heatmap` bisa langsung pakai
   `area_sekolah` + `laporan_area` yang sudah ada datanya (9 baris area).
   `eskalasi` dan `kinerja-bk` masih perlu query baru dari `laporan_bullying`.
5. **CSP nonce** — sekarang `unsafe-inline` masih ada.
6. **Rotasi kunci** — `sb_secret_c_ei0...` dan `sk-bLfNw...` pernah tampil di transkrip lama. User perlu rotasi sendiri.
7. **Fix ESLint error** di `hooks/useLaporan.js:35` (setState-in-effect) — sudah ada sebelum sesi ini.
8. **Cover Image / Kategori / Tag** di form Unggah Konten belum tersambung
   ke kolom DB (`modul_edukasi` tidak punya kolom kategori/tag terpisah,
   dan `thumbnail_url` belum ada uploader-nya). UI-nya real, datanya belum
   ikut tersimpan — jujur ditandai di komentar `unggah/page.js`.

---

## 8. Perintah Umum

```bash
# Dev server (dari frontend/)
npm run dev

# Build produksi (memvalidasi semua)
npm run build

# Seed database (bangkitkan akun + laporan demo)
node scripts/seed.mjs

# Test crisis detection
node --experimental-vm-modules scripts/test-crisis.mjs

# Login uji cepat (via console browser di /login)
# lihat CODEX_HANDOFF.md § "Uji login otomatis"
```

## 9. Env vars

```
NEXT_PUBLIC_SUPABASE_URL=https://pdcsgtjtqbgjssjtihzu.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...     # server only
LLM_API_KEY=sk-...                          # chenzk.top gateway
LLM_MODEL=deepseek-v4-flash
TICKET_PEPPER=<random ≥32 chars>            # HMAC pepper
SEKOLAH_DEMO=00000000-0000-0000-0000-000000000001
```
