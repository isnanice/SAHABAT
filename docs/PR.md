# Keamanan + Fase 3–5: jalur siswa, dashboard BK, analitik

Cara pakai: salin isi di bawah garis ke deskripsi Pull Request di GitHub.

---

## Ringkasan

Menutup lubang keamanan yang bisa dieksploitasi, membangun jalur siswa dan
dashboard Guru BK, dan memperbaiki beberapa bug yang membatalkan fungsi
produk. Semua temuan diverifikasi langsung terhadap database dan aplikasi
yang berjalan — bukan dugaan.

**10 commit · 26 file diubah · +2181 / −509**

## Kenapa ini perlu di-review serius

Beberapa perbaikan di sini menyentuh hal yang menentukan apakah anak yang
melapor benar-benar aman. Tolong minimal baca tiga bagian pertama.

---

## 1. Lubang keamanan yang terbukti ada di database kita

Semua ini saya uji langsung ke project Supabase, dan semuanya berhasil
sebelum diperbaiki:

| Lubang | Dampak |
|---|---|
| `profiles: update sendiri` tanpa `WITH CHECK` | Siswa yang login bisa `update({role:'GURU_BK'})` pada dirinya sendiri, lalu membaca **semua laporan** |
| `handle_new_user()` menyalin `role` dari metadata pendaftar | `signUp({data:{role:'GURU_BK'}})` dengan anon key yang publik = jadi Guru BK |
| **Rekursi tak hingga** di policy `profiles` | Setiap pembacaan laporan **meledak** — dashboard BK tidak mungkin memuat data |
| Nol isolasi antar sekolah | Tidak ada kolom sekolah **di mana pun**. Tiap BK membaca laporan semua sekolah |
| `laporan: siapa saja bisa buat` → `WITH CHECK (true)` | INSERT bebas untuk role publik |
| `chatbot_messages` izinkan `user_id IS NULL` | Transkrip chat sesi anonim terbaca siapa saja |

Ditambah: kode tiket disimpan **plaintext** dan dibangkitkan `Math.random()`
(bisa diprediksi — dan itu satu-satunya kredensial siswa anonim), pelacakan
tiket lewat URL path (bocor ke access log & riwayat browser komputer sekolah),
dan notifikasi laporan dikirim ke **semua Guru BK lintas sekolah** dengan kode
tiket di dalamnya.

## 2. Bug yang membatalkan fungsi produk

Ketiganya hanya muncul dengan **menjalankan** aplikasinya, bukan mem-build:

- **Tombol "Lapor Sekarang" di landing melempar ke halaman login.** Menunjuk
  `/siswa/lapor` yang terproteksi middleware. Di sistem yang seluruh gunanya
  melapor tanpa identitas.
- **Validasi berjalan sebelum deteksi krisis.** `"pengen mati"` (11 karakter)
  → *"Ceritakan minimal 15 karakter"*. Deteksi krisis tidak pernah jalan.
  Orang yang paling terpukul menulis paling sedikit — aturan itu menghukum
  persis orang yang paling tidak boleh dihukum.
- **Halaman "Lupa Kata Sandi" berbohong** — menampilkan "email terkirim"
  tanpa pernah mengirim apa pun.

Plus: form login sepenuhnya statis (tidak ada yang bisa masuk), login sukses
→ 404, middleware membuat jalur anonim bergantung pada Supabase Auth.

## 3. Klaim yang tidak benar, dihapus

| Sebelum | Sesudah |
|---|---|
| "100% aman dan tidak ada yang tahu identitasmu" | "Guru BK membaca ceritamu, tapi tidak bisa melihat namamu dari sistem ini" |
| "mengenkripsi untuk perlindungan privasi total" | "enkripsi at-rest + akses terbatas + audit log" |
| `#SBT-001` (berurutan) | `SAH-K4PM-9TXQ` (32⁸ acak, CSPRNG) |
| "Guru BK merespons 10 menit lalu" | "1×24 jam sekolah" |

**Ini juga perlu diperbaiki di proposal.** Proposal masih menjanjikan
"enkripsi end-to-end antara siswa dan Guru BK". Sistem ini tidak melakukan
itu dan tidak mungkin melakukannya — AI dan Guru BK harus bisa membaca
teksnya. Kalau juri bertanya "E2EE-nya diimplementasikan bagaimana?", tidak
ada jawaban. Usulan pengganti ada di `docs/` dan halaman `/privasi`.

## 4. Yang dibangun

- **Halaman siswa:** `/lapor`, layar kode tiket, `/cek-laporan`,
  `/ruang-aman` + panel darurat, `/kontak-darurat`, `/privasi`
- **Dashboard BK:** antrean (urut `urgensi_final`, badge krisis / AI-ragu /
  AI-gagal), detail + override + balas, **audit yang memblokir** — gagal
  mencatat = detail ditolak dibuka
- **Analitik kepala sekolah:** Recharts, dari keputusan manusia bukan tebakan AI
- **AI:** pindah ke gateway OpenAI-compatible (spec §2)

**Kecepatan submit: 4300ms → ~400ms.** Laporan disimpan dulu, klasifikasi AI
menyusul lewat `after()`. Fail-safe malah menguat: laporan sudah durable
sebelum AI disentuh.

## 5. Verifikasi

- **8/8** test case wajib spec §8
- **15/15** uji DAST (auth, IDOR, SQLi, mass assignment, rate limit, XSS
  tersimpan, kebocoran error, secret di bundle)
- **39/39** uji deteksi krisis, termasuk pembanding idiom Indonesia
  ("mati lampu", "capek setengah mati" — tidak boleh memicu)
- Build bersih, nol `sk-` di `src/`

## 6. Yang MASIH perlu manusia — tolong jangan dilewat

- [ ] **Guru BK / psikolog meninjau `docs/audit-crisis.md`** (30 menit, tanpa
      kode). Daftar pola krisis disusun AI dari tema literatur, **bukan**
      instrumen tervalidasi. Penelusuran menemukan belum ada leksikon krisis
      bahasa Indonesia yang tervalidasi & publik.
- [ ] **Telepon nomor hotline** (SEJIWA 119 ext 8, SAPA 129). Masih
      `terverifikasi_pada: null` — UI jujur menampilkan "belum diverifikasi".
      Nomor mati ke anak krisis lebih buruk daripada tidak ada nomor.
- [ ] **Perbaiki klaim E2EE di proposal**
- [ ] **Aktifkan Leaked password protection** di dashboard Supabase
- [ ] **Set `ALLOWED_ORIGIN`** ke domain produksi sebelum deploy (spec §5.5
      melarang `*`)

## Catatan untuk reviewer

File migrasi **bukan** sumber kebenaran di project ini. Database hidup
menyimpang jauh dari `001_initial_schema.sql`:

- Ada di 001, **tidak** di DB: `profiles.school_id`, `laporan_bullying.korban_id`, tabel `forum_likes`
- Ada di DB, **tidak** di 001: `nama_korban` / `nama_pelaku` / `nama_saksi`, RLS + 29 policy

Migrasi 002–004 sudah **diterapkan** ke project Supabase dan terverifikasi.

`AGENTS.md` sekarang memuat 10 aturan yang tidak bisa ditawar — tolong dibaca
sebelum menyentuh `src/lib/keamanan/` atau `supabase/migrations/`.
