-- ============================================================
-- SAHABAT — Tindak lanjut Supabase security advisor
-- Supabase Migration 003
-- ============================================================
-- Dijalankan setelah 002. Semua temuan di sini berasal dari
-- `get_advisors(type: security)` terhadap project sungguhan, bukan tebakan.
--
-- CATATAN soal `rls_auto_enable()`: advisor menandainya sebagai SECURITY
-- DEFINER yang bisa dieksekusi anon. Itu praktis false positive — fungsi
-- bertipe `event_trigger` tidak bisa dipanggil langsung lewat RPC. Fungsi
-- itu justru berguna: ia otomatis menyalakan RLS pada setiap CREATE TABLE
-- di schema public, dan itulah alasan tabel-tabel tim sudah ber-RLS padahal
-- 001 tidak pernah menyalakannya. Biarkan.
-- ============================================================

-- ============================================================
-- 1. search_path mutable pada fungsi SECURITY DEFINER
-- ============================================================
-- Tanpa search_path tetap, pemanggil bisa membuat schema bayangan berisi
-- tabel/fungsi bernama sama, lalu fungsi definer ini mengeksekusi milik
-- penyerang dengan hak pemilik fungsi.
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $fn$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$fn$;

CREATE OR REPLACE FUNCTION tambah_poin(p_user_id UUID, p_poin INTEGER)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $fn$
BEGIN
  UPDATE profiles SET poin = poin + p_poin WHERE id = p_user_id;
END;
$fn$;

REVOKE ALL ON FUNCTION tambah_poin(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION tambah_poin(UUID, INTEGER) TO service_role;

-- ============================================================
-- 2. Helper auth_* terekspos ke anon lewat /rest/v1/rpc
-- ============================================================
-- Ketiganya hanya melihat auth.uid() milik pemanggil sendiri, jadi tidak
-- membocorkan data orang lain — untuk anon, auth.uid() NULL dan hasilnya
-- kosong. Tetap dicabut dari anon: tidak ada policy anon yang memakainya,
-- jadi tidak ada yang rusak, dan permukaan RPC publik jadi lebih kecil.
--
-- EXECUTE untuk `authenticated` SENGAJA DIPERTAHANKAN — jangan dicabut.
-- Ekspresi policy RLS dievaluasi dengan hak pengguna yang menjalankan query.
-- Mencabut EXECUTE dari authenticated membuat SETIAP policy yang memanggil
-- fungsi ini gagal, dan dashboard Guru BK mati total. Advisor menandai ini
-- sebagai peringatan, tapi di sini memang harus begitu.
REVOKE ALL ON FUNCTION auth_profil()     FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION auth_sekolah_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION auth_is_staf()    FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION auth_profil()     TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth_sekolah_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION auth_is_staf()    TO authenticated, service_role;

-- ============================================================
-- 3. handle_new_user() terekspos sebagai RPC publik
-- ============================================================
-- Ini fungsi trigger. Trigger tetap berjalan sebagai definer tanpa perlu
-- GRANT ke siapa pun, jadi tidak ada alasan ia bisa dipanggil dari internet.
REVOKE ALL ON FUNCTION handle_new_user() FROM PUBLIC, anon, authenticated;

-- ============================================================
-- 4. Pertegas batasan lacak_tiket
-- ============================================================
REVOKE ALL ON FUNCTION lacak_tiket(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION lacak_tiket(TEXT) TO service_role;

-- ============================================================
-- 5. YANG HARUS DIKERJAKAN MANUAL DI DASHBOARD (tidak bisa lewat SQL)
-- ============================================================
-- Advisor: "Leaked Password Protection Disabled".
-- Supabase Auth bisa mencocokkan password baru ke HaveIBeenPwned dan
-- menolak yang sudah bocor. Ini akun Guru BK yang memegang akses ke cerita
-- anak tentang kekerasan — password daur ulang di akun seperti itu adalah
-- jalan masuk yang paling murah bagi penyerang.
--
-- Aktifkan di: Dashboard -> Authentication -> Policies -> Password Security
-- https://supabase.com/docs/guides/auth/password-security
