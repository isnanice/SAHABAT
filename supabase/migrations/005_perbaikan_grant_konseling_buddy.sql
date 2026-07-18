-- 005_perbaikan_grant_konseling_buddy.sql
--
-- Audit menemukan dua tabel yang RLS-nya aktif tapi TIDAK PERNAH diberi GRANT
-- dasar ke role `authenticated` — bukan kegagalan kebijakan RLS, tapi lubang
-- satu tingkat di bawahnya. Dibuktikan dengan simulasi:
--
--   SET LOCAL ROLE authenticated;
--   INSERT INTO jadwal_konseling (...) VALUES (...);
--   -- ERROR: 42501 permission denied for table jadwal_konseling
--
-- Akibatnya: POST /api/konseling (siswa booking sesi) gagal total sejak awal
-- dibuat — bukan bug baru, tapi tabel yang lupa di-grant saat migrasinya
-- ditulis. Migrasi ini menutup celah itu dengan grant + RLS policy yang
-- sesuai idiom `auth_is_staf()` / `auth_sekolah_id()` yang sudah dipakai
-- laporan_bullying (lihat 002_hardening.sql).

-- ============================================================
-- jadwal_konseling: siswa booking, staf kelola sesi miliknya
-- ============================================================
GRANT INSERT, UPDATE ON public.jadwal_konseling TO authenticated;

-- Helper SECURITY DEFINER: profiles RLS cuma izinkan siswa lihat baris
-- dirinya sendiri (lihat profiles_self), jadi subquery biasa dari siswa ke
-- profil Guru BK akan selalu kosong bukan karena logikanya salah, tapi
-- karena RLS profiles memblokirnya. Pola ini meniru auth_is_staf() /
-- auth_sekolah_id() yang sudah ada di 002_hardening.sql.
CREATE OR REPLACE FUNCTION public.sekolah_id_milik(p_user_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT school_id FROM profiles WHERE id = p_user_id;
$$;

REVOKE ALL ON FUNCTION public.sekolah_id_milik(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sekolah_id_milik(uuid) TO authenticated;

-- Siswa membuat booking untuk dirinya sendiri, HANYA ke Guru BK di
-- sekolahnya sendiri. Diuji live: same-school OK, cross-school ditolak
-- 42501 (bukan cuma dijamin oleh logika di API route — sengaja, supaya
-- POST langsung ke endpoint dengan guru_bk_id sekolah lain tetap ditolak
-- di lapisan DB, bukan cuma "biasanya begitu dari UI").
CREATE POLICY jadwal_konseling_siswa_insert ON public.jadwal_konseling
  FOR INSERT TO authenticated
  WITH CHECK (
    siswa_id = auth.uid()
    AND sekolah_id_milik(guru_bk_id) = auth_sekolah_id()
  );

-- Siswa bisa update booking miliknya (mis. batalkan), staf bisa update
-- sesi yang ditugaskan padanya (konfirmasi, tandai selesai).
CREATE POLICY jadwal_konseling_kelola_update ON public.jadwal_konseling
  FOR UPDATE TO authenticated
  USING (siswa_id = auth.uid() OR (auth_is_staf() AND guru_bk_id = auth.uid()))
  WITH CHECK (siswa_id = auth.uid() OR (auth_is_staf() AND guru_bk_id = auth.uid()));

-- ============================================================
-- buddy_requests: staf sekolah yang sama boleh melihat & mengelola
-- permintaan siswa untuk dipasangkan buddy. Kebijakan lama
-- (buddy_req_self) cuma mengizinkan siswa lihat request-nya sendiri —
-- artinya Guru BK TIDAK PERNAH bisa melihat siapa yang menunggu
-- dipasangkan. Itu bukan bug teknis (tidak error), tapi fitur yang
-- terlihat berfungsi di UI staf padahal query-nya akan selalu kosong.
-- ============================================================
CREATE POLICY buddy_requests_staf_select ON public.buddy_requests
  FOR SELECT TO authenticated
  USING (
    auth_is_staf()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = buddy_requests.siswa_id AND p.school_id = auth_sekolah_id()
    )
  );

CREATE POLICY buddy_requests_staf_update ON public.buddy_requests
  FOR UPDATE TO authenticated
  USING (
    auth_is_staf()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = buddy_requests.siswa_id AND p.school_id = auth_sekolah_id()
    )
  )
  WITH CHECK (
    auth_is_staf()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = buddy_requests.siswa_id AND p.school_id = auth_sekolah_id()
    )
  );

-- ============================================================
-- buddy_matches: staf membuat pasangan buddy untuk sekolahnya sendiri.
-- Grant INSERT belum ada sama sekali — staf tidak bisa mencatat
-- pasangan buddy manapun sebelum ini.
-- ============================================================
GRANT INSERT, UPDATE ON public.buddy_matches TO authenticated;

CREATE POLICY buddy_matches_staf_insert ON public.buddy_matches
  FOR INSERT TO authenticated
  WITH CHECK (
    auth_is_staf()
    AND guru_bk_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = buddy_matches.siswa_id AND p.school_id = auth_sekolah_id()
    )
  );

CREATE POLICY buddy_matches_staf_update ON public.buddy_matches
  FOR UPDATE TO authenticated
  USING (auth_is_staf() AND guru_bk_id = auth.uid())
  WITH CHECK (auth_is_staf() AND guru_bk_id = auth.uid());

-- ============================================================
-- modul_edukasi: tidak punya kolom untuk isi artikel (cuma konten_url,
-- cocok untuk VIDEO/INFOGRAFIS eksternal). Halaman "Unggah Konten Baru"
-- (staf) menulis artikel langsung di platform, jadi butuh tempat menyimpan
-- teksnya. Penulisan tetap lewat service_role di API route
-- (/api/edukasi/kelola) setelah verifikasi peran — RLS tabel ini sengaja
-- tidak dibuka untuk INSERT/UPDATE langsung dari client manapun.
-- ============================================================
ALTER TABLE public.modul_edukasi ADD COLUMN IF NOT EXISTS isi text;
