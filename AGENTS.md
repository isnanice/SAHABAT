<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# SAHABAT — aturan yang tidak bisa ditawar

Sistem ini menyimpan cerita anak di bawah umur tentang kekerasan yang mereka
alami. Anak-anak itu menekan "kirim" karena percaya sistemnya aman. Kalau ragu
antara fitur keren dan aman, pilih aman — setiap kali.

Baca ini sebelum menyentuh apa pun di `src/lib/keamanan/`, `src/app/api/`, atau
`supabase/migrations/`.

## 1. Deteksi krisis jalan tanpa AI, dan mendahului AI

`src/lib/keamanan/crisis.js` sengaja tidak punya network call. Urutan di setiap
route adalah **rate limit → krisis → LLM**, dan itu bukan gaya penulisan.

Jangan pindahkan deteksi krisis ke belakang LLM — misalnya "biar AI yang
menilai konteksnya". Saat gateway AI mati, lapisan inilah satu-satunya yang
tersisa, dan justru saat itu ia paling dibutuhkan.

Kalau regex bilang krisis dan AI bilang RENDAH, **regex yang menang**. Lapisan
yang tidak bisa mati tidak boleh ditimpa lapisan yang bisa.

## 2. Fail-safe, bukan fail-silent

`klasifikasiLaporan()` **tidak pernah throw**. AI mati → laporan tetap masuk
dengan `ai_gagal = true` dan `urgensi_final = 'SEDANG'`, lalu Guru BK
membacanya manual.

Ini pernah salah: versi lama melempar error saat gateway down, jadi HTTP 500,
dan laporan anak hilang tanpa jejak sementara dia cuma melihat pesan error.
Jangan ulangi.

Kebalikannya juga berlaku: kalau insert DB benar-benar gagal, **katakan jujur**
dan jangan pernah menampilkan kode tiket untuk laporan yang tidak tersimpan.

## 3. Jangan percaya output LLM

Semua field dari model divalidasi terhadap whitelist di
`src/lib/ai/klasifikasi.js` sebelum menyentuh DB. Cerita siswa masuk ke prompt,
jadi harus dianggap input yang bisa bermusuhan. Yang terburuk boleh terjadi:
klasifikasi salah tapi tetap valid — lalu Guru BK mengoreksi lewat
`urgensi_final`.

## 4. RLS tolak-semua. Jangan bikin policy untuk `anon`

Tidak ada satu pun policy untuk role `anon`, di tabel mana pun. Itu disengaja.
Anon key terekspos ke browser lewat `NEXT_PUBLIC_SUPABASE_ANON_KEY` — policy
`anon` apa pun di `laporan_bullying` berarti seluruh laporan bullying terbaca
publik.

Jalur siswa anonim jalan lewat `service_role` di API route, bukan lewat RLS.
Frontend siswa tidak pernah query `laporan_bullying` langsung.

Tabel baru → **wajib** `ENABLE ROW LEVEL SECURITY` di migrasi yang sama.
Tabel tanpa RLS tetap bocor walau fiturnya belum dipakai.

## 5. Kode tiket

- Dibangkitkan dengan CSPRNG (`node:crypto`), **jangan** `Math.random()`.
- Yang disimpan hanya `hash(kode + TICKET_PEPPER)`. Jangan pernah simpan mentah.
- Ditampilkan **sekali**, ke siswa yang membuatnya. Jangan taruh di
  localStorage, jangan kirim lewat email, jangan masukkan ke isi notifikasi.
- Jangan taruh di URL/path — access log dan riwayat browser komputer sekolah
  membocorkannya.

## 6. Audit setiap akses Guru BK

Buka detail laporan tanpa insert `audit_akses` = bug, bukan optimasi.

## 7. Anonimitas itu struktural, bukan checkbox

Laporan anonim punya `pelapor_id IS NULL` — ditegakkan constraint DB
`laporan_anonim_tanpa_identitas`, bukan cuma niat baik di kode. Jangan tambahkan
field yang mengumpulkan nama orang lain lewat form anonim.

Rate limit pakai hash sesi, **jangan pernah IP** — IP sekolah dibagi satu NAT
untuk seluruh gedung, jadi selain melanggar privasi, itu memblokir seluruh
sekolah begitu satu anak melapor.

## 8. Jangan klaim "end-to-end encryption"

`ENCRYPTION_SECRET` adalah env var server, jadi server memegang kunci dan bisa
mendekripsi. Itu enkripsi **at-rest**, bukan E2EE. Klaim E2EE juga kontradiktif
dengan klasifikasi AI — model harus membaca teksnya.

Kalau menemukan klaim itu di proposal/UI/slide, ganti jadi
"enkripsi at-rest + akses terbatas + audit log".

## 9. Chatbot = asisten pelaporan, bukan teman curhat

Scope ini FINAL. Bot membantu menyusun laporan, lalu sesinya berujung. Bukan
konselor, tidak mendiagnosis, tidak menemani ngobrol tanpa akhir.

Bot yang menemani anak bercerita tanpa akhir membuat anak berhenti mencari
manusia, dan mengundang cerita self-harm ke sistem yang tidak bisa menolong.

## 10. Nomor hotline harus diverifikasi dulu

Lihat `src/lib/keamanan/hotline.js`. Nomor mati ke anak yang sedang krisis lebih
buruk daripada tidak ada nomor sama sekali — anak itu sudah mengumpulkan
keberanian sekali.

## Sebelum bilang "selesai"

```bash
grep -rn "sk-" frontend/src/        # harus kosong
grep -rni "pepper" frontend/src/    # hanya keamanan/tiket.js
```

Lalu jalankan 8 test case di `CLAUDE_CODE_SPEC.md` §8. Laporkan hasilnya apa
adanya — kalau ada yang gagal, bilang gagal.
