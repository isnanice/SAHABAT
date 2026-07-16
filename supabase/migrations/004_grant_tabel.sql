-- ============================================================
-- SAHABAT — GRANT tabel yang hilang
-- Supabase Migration 004
-- ============================================================
-- TEMUAN: di project ini, `anon`, `authenticated`, dan `service_role` hanya
-- punya hak `Dxtm` (TRUNCATE, REFERENCES, TRIGGER, MAINTAIN) pada tabel
-- public — TANPA SELECT/INSERT/UPDATE/DELETE. Grant standar Supabase tidak
-- pernah terpasang.
--
-- Ini kondisi bawaan project, BUKAN akibat REVOKE di 002: `modul_edukasi`
-- tidak pernah masuk daftar REVOKE tapi polanya identik.
--
-- Akibatnya: supabase-js tidak pernah bisa membaca/menulis apa pun. Backend
-- memang tidak pernah berfungsi — konsisten dengan semua halaman dashboard
-- yang masih stub.
--
-- RLS dan GRANT adalah dua lapisan berbeda dan keduanya wajib ada:
--   GRANT  -> boleh menyentuh TABEL-nya?
--   RLS    -> BARIS mana yang boleh?
-- Tanpa GRANT, policy seketat apa pun tidak pernah dievaluasi. Dengan GRANT
-- tapi tanpa policy, RLS menolak semua. Yang kita mau: GRANT di tabel,
-- pembatasan di baris.
--
-- `anon` SENGAJA TIDAK diberi apa pun di sini. Jalur siswa anonim lewat
-- service_role di API route, bukan lewat PostgREST.
-- ============================================================

-- ============================================================
-- service_role — jalur server tepercaya
-- ============================================================
-- Melewati RLS, tapi TETAP butuh grant tabel. Ini yang dipakai
-- createAdminClient() untuk menyimpan laporan siswa anonim; tanpa ini,
-- setiap laporan gagal tersimpan dan siswa melihat pesan error.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================
-- authenticated — staf sekolah; RLS yang membatasi barisnya
-- ============================================================
-- Diberi per tabel, bukan borongan, supaya hak yang tidak dipakai tidak
-- diam-diam ikut terbuka.

-- Laporan: staf baca & ubah (policy membatasi ke sekolahnya sendiri).
-- Tidak ada INSERT: laporan hanya masuk lewat service_role di API route.
GRANT SELECT, UPDATE ON laporan_bullying TO authenticated;

-- Thread tiket: staf baca & balas.
GRANT SELECT, INSERT ON pesan_tiket TO authenticated;

-- Audit: staf hanya MENULIS; SELECT untuk kepala sekolah (policy membatasi).
-- Sengaja TANPA UPDATE/DELETE — audit log yang bisa dihapus subjeknya
-- bukan audit log.
GRANT SELECT, INSERT ON audit_akses TO authenticated;

GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON sekolah TO authenticated;
GRANT SELECT, UPDATE ON notifikasi TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON logbook_penanganan TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON chatbot_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON chatbot_messages TO authenticated;

GRANT SELECT ON jadwal_konseling TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pesan_konseling TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON buddy_requests TO authenticated;
GRANT SELECT ON buddy_matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON buddy_messages TO authenticated;

GRANT SELECT, INSERT ON forum_posts TO authenticated;
GRANT SELECT, INSERT ON forum_comments TO authenticated;

GRANT SELECT ON modul_edukasi TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON progress_edukasi TO authenticated;

GRANT SELECT ON area_sekolah TO authenticated;
GRANT SELECT ON laporan_area TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================
-- anon — pertegas: tidak ada apa-apa
-- ============================================================
-- Lapisan kedua di atas "tidak ada policy anon". Kalau nanti ada yang
-- membuat policy anon karena tidak sengaja, ketiadaan grant tetap menahan.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;

-- ============================================================
-- Default untuk tabel yang dibuat KEMUDIAN
-- ============================================================
-- Tanpa ini, tabel baru mengulang bug yang sama: dibuat, tampak jalan di
-- SQL editor (sebagai postgres), lalu gagal senyap lewat supabase-js.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO service_role;

-- Tabel baru TIDAK otomatis terbuka untuk authenticated — itu keputusan
-- sadar per tabel, bukan default. Gabungan `rls_auto_enable` (RLS otomatis
-- menyala) + tanpa grant default = tabel baru tertutup sampai seseorang
-- benar-benar memutuskan membukanya.
