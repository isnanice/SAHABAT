-- ============================================================
-- SAHABAT Platform — Pengamanan (Hardening)
-- Supabase Migration 002
-- ============================================================
-- CATATAN PENTING: database hidup MENYIMPANG JAUH dari file migrasi.
-- Diverifikasi langsung terhadap project pdcsgtjtqbgjssjtihzu:
--
--   ada di 001, TIDAK ada di DB : profiles.school_id, laporan_bullying.korban_id,
--                                 tabel forum_likes
--   ada di DB, TIDAK ada di 001 : laporan_bullying.nama_korban / nama_pelaku /
--                                 nama_saksi, RLS aktif + 29 policy
--
-- Akibatnya: sistem ini SEKARANG tidak punya multi-tenancy sama sekali
-- (tidak ada kolom sekolah di mana pun), dan kanal "anonim"-nya punya tiga
-- kolom teks bebas untuk menyimpan nama anak.
--
-- JANGAN memperlakukan file migrasi sebagai sumber kebenaran di project ini.
-- Periksa skema aslinya (information_schema) sebelum mengubah apa pun.
--
-- Yang diperbaiki migrasi ini terhadap policy yang ADA sekarang:
--
--   1. `laporan: siapa saja bisa buat` — INSERT, role public, WITH CHECK (true).
--      Siapa pun yang punya anon key (ada di bundle JS browser) bisa menulis
--      baris ke laporan_bullying, termasuk mengisi pelapor_id dengan UUID
--      siswa mana pun — mengarang laporan atas nama korban.
--   2. `profiles: update sendiri` — UPDATE tanpa WITH CHECK, jadi siswa yang
--      login bisa mengubah role-nya sendiri jadi GURU_BK dan membaca semua
--      laporan.
--   3. Tidak ada isolasi antar sekolah di mana pun: setiap GURU_BK membaca
--      laporan SEMUA sekolah.
--   4. `profiles: guru & kepsek lihat semua` men-query profiles dari dalam
--      policy profiles -> infinite recursion. Ini membuat pembacaan
--      laporan_bullying GAGAL TOTAL, bukan cuma lambat.
--   5. `chatbot_messages` mengizinkan `user_id IS NULL`, sehingga transkrip
--      chat sesi anonim terbaca oleh siapa saja.
--
-- Prinsip: tolak semua dulu, lalu buka sesempit mungkin.
-- Jalur siswa anonim TIDAK lewat RLS — lewat service_role di server.
-- ============================================================

-- ============================================================
-- 1. SEKOLAH — dibutuhkan untuk isolasi antar sekolah
-- ============================================================
-- CATATAN: 001 menulis `profiles.school_id`, tapi kolom itu TIDAK PERNAH ADA
-- di database sungguhan. Artinya sistem ini sekarang sama sekali tidak punya
-- multi-tenancy: tidak ada satu pun kolom yang menghubungkan siapa pun ke
-- sekolah tertentu. Kolomnya dibuat di sini.
CREATE TABLE IF NOT EXISTS sekolah (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  npsn TEXT UNIQUE,
  aktif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sekolah placeholder untuk membackfill baris lama.
INSERT INTO sekolah (id, nama, npsn)
VALUES ('00000000-0000-0000-0000-000000000001', 'Sekolah Demo SAHABAT', 'DEMO-001')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS school_id UUID;

UPDATE profiles SET school_id = '00000000-0000-0000-0000-000000000001'
WHERE school_id IS NULL;

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_school_fk;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_school_fk
  FOREIGN KEY (school_id) REFERENCES sekolah(id) ON DELETE RESTRICT;

-- ============================================================
-- 2. LAPORAN_BULLYING — anonimitas, hash tiket, pisah AI vs manusia
-- ============================================================

-- 2a. Isolasi antar sekolah. Tanpa kolom ini test §8.7 tidak bisa lulus:
-- laporan anonim punya pelapor_id NULL, jadi sekolah tidak bisa
-- disimpulkan lewat join ke profiles.
ALTER TABLE laporan_bullying ADD COLUMN IF NOT EXISTS sekolah_id UUID;

UPDATE laporan_bullying l
SET sekolah_id = COALESCE(
  (SELECT p.school_id FROM profiles p WHERE p.id = l.pelapor_id),
  '00000000-0000-0000-0000-000000000001'
)
WHERE sekolah_id IS NULL;

ALTER TABLE laporan_bullying
  ALTER COLUMN sekolah_id SET NOT NULL,
  ADD CONSTRAINT laporan_sekolah_fk
  FOREIGN KEY (sekolah_id) REFERENCES sekolah(id) ON DELETE RESTRICT;

-- 2b. Kode tiket: simpan hash, bukan plaintext.
-- Bocornya DB tidak boleh berarti semua tiket bisa dilacak orang luar.
ALTER TABLE laporan_bullying ADD COLUMN IF NOT EXISTS kode_tiket_hash TEXT;

-- CATATAN: baris lama kehilangan keterlacakan. Hash butuh TICKET_PEPPER
-- (secret server) yang tidak tersedia di dalam migrasi, jadi kode lama
-- tidak bisa di-backfill. Ini dapat diterima untuk DB pengembangan yang
-- isinya masih dummy. JANGAN jalankan ini di DB berisi laporan asli
-- tanpa merencanakan backfill lewat skrip server yang memegang pepper.
ALTER TABLE laporan_bullying DROP COLUMN IF EXISTS kode_tiket;

CREATE UNIQUE INDEX IF NOT EXISTS idx_laporan_kode_hash
  ON laporan_bullying(kode_tiket_hash);

-- 2c. Anonimitas ditegakkan STRUKTURAL, bukan sekadar checkbox.
--
-- Skema nyata berbeda dari 001: tidak ada `korban_id`, tapi ADA tiga kolom
-- teks bebas — `nama_korban`, `nama_pelaku`, `nama_saksi`. Di kanal yang
-- dijual sebagai anonim, kolom-kolom itu justru menyimpan nama anak di bawah
-- umur, termasuk nama orang yang DITUDUH, tanpa proses dan tanpa hak jawab.
-- Baris yang mengaku `anonim` tapi memuat nama bukan laporan anonim.
--
-- Constraint ini tidak menghapus kolomnya (jalur non-anonim boleh saja
-- dibangun tim nanti) — ia cuma memastikan `anonim = true` benar-benar
-- berarti tidak ada identitas yang menempel.
UPDATE laporan_bullying
SET pelapor_id = NULL, nama_korban = NULL, nama_pelaku = NULL, nama_saksi = NULL
WHERE anonim
  AND (pelapor_id IS NOT NULL OR nama_korban IS NOT NULL
       OR nama_pelaku IS NOT NULL OR nama_saksi IS NOT NULL);

ALTER TABLE laporan_bullying DROP CONSTRAINT IF EXISTS laporan_anonim_tanpa_identitas;
ALTER TABLE laporan_bullying
  ADD CONSTRAINT laporan_anonim_tanpa_identitas
  CHECK (
    NOT anonim OR (
      pelapor_id IS NULL AND nama_korban IS NULL
      AND nama_pelaku IS NULL AND nama_saksi IS NULL
    )
  );

-- 2d. Pisahkan tebakan AI dari keputusan manusia.
-- 001 hanya punya satu kolom `prioritas`, jadi override Guru BK menimpa
-- jejak AI dan tidak ada cara menampilkan "AI gagal, tolong baca manual".
ALTER TABLE laporan_bullying
  ADD COLUMN IF NOT EXISTS ai_urgensi     priority_level,
  ADD COLUMN IF NOT EXISTS ai_jenis       bullying_type,
  ADD COLUMN IF NOT EXISTS ai_confidence  NUMERIC(3,2)
    CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1)),
  ADD COLUMN IF NOT EXISTS ai_gagal       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_krisis    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS urgensi_final  priority_level,
  ADD COLUMN IF NOT EXISTS jenis_final    bullying_type;

-- Backfill dari kolom lama supaya baris dummy tetap tampil di dashboard.
UPDATE laporan_bullying
SET urgensi_final = COALESCE(urgensi_final, prioritas),
    jenis_final   = COALESCE(jenis_final, jenis_bullying);

ALTER TABLE laporan_bullying
  ALTER COLUMN urgensi_final SET DEFAULT 'SEDANG',
  ALTER COLUMN urgensi_final SET NOT NULL;

-- Dashboard mengurutkan pakai urgensi_final, bukan ai_urgensi.
CREATE INDEX IF NOT EXISTS idx_laporan_antrean
  ON laporan_bullying(sekolah_id, status, urgensi_final, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_laporan_krisis
  ON laporan_bullying(sekolah_id, flag_krisis) WHERE flag_krisis;

-- ============================================================
-- 3. PESAN_TIKET — thread anonim menempel ke laporan
-- ============================================================
-- pesan_konseling (001) menempel ke jadwal_konseling dan mewajibkan
-- sender_id NOT NULL, jadi tidak bisa dipakai siswa anonim tanpa login.
CREATE TABLE IF NOT EXISTS pesan_tiket (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID NOT NULL REFERENCES laporan_bullying(id) ON DELETE CASCADE,
  dari_staf UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL = dari siswa anonim
  isi TEXT NOT NULL CHECK (length(trim(isi)) > 0),
  dibuat_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pesan_tiket_laporan
  ON pesan_tiket(laporan_id, dibuat_at);

-- ============================================================
-- 4. AUDIT_AKSES — setiap akses BK ke laporan tercatat
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_akses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staf_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  laporan_id UUID REFERENCES laporan_bullying(id) ON DELETE SET NULL,
  aksi TEXT NOT NULL CHECK (aksi IN ('lihat', 'balas', 'override', 'ubah_status')),
  dibuat_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_laporan ON audit_akses(laporan_id, dibuat_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_staf ON audit_akses(staf_id, dibuat_at DESC);

-- ============================================================
-- 5. HELPER — SECURITY DEFINER, hindari rekursi RLS
-- ============================================================
-- Policy yang men-subquery `profiles` akan mengevaluasi ulang policy
-- `profiles` dan bisa rekursi. Fungsi SECURITY DEFINER memotong itu.
CREATE OR REPLACE FUNCTION auth_profil()
RETURNS TABLE (school_id UUID, role user_role, aktif BOOLEAN)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT p.school_id, p.role, p.aktif FROM profiles p WHERE p.id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION auth_sekolah_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT p.school_id FROM profiles p WHERE p.id = auth.uid() AND p.aktif;
$$;

CREATE OR REPLACE FUNCTION auth_is_staf()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.aktif
      AND p.role IN ('GURU_BK', 'KEPALA_SEKOLAH')
  );
$$;

-- ============================================================
-- 6. BUANG SEMUA POLICY LAMA, LALU AKTIFKAN RLS DI SEMUA TABEL
-- ============================================================
--
-- ====================== KENAPA HARUS DI-DROP ======================
-- Policy RLS Postgres bersifat PERMISSIVE secara default, dan policy
-- permissive DIGABUNG DENGAN "OR". Artinya menambahkan policy yang lebih
-- ketat TIDAK memperketat apa pun selama policy longgar yang lama masih
-- ada — akses diberikan kalau SALAH SATU policy mengizinkan.
--
-- Database hidup punya policy `laporan: siapa saja bisa buat` dengan
-- WITH CHECK (true) untuk role `public` (termasuk `anon`). Kalau policy itu
-- dibiarkan, policy ketat di bawah sama sekali tidak menutupnya: siapa pun
-- yang punya anon key tetap bisa menulis baris ke laporan_bullying, termasuk
-- mengisi pelapor_id dengan UUID siswa mana pun — mengarang laporan atas
-- nama korban dan memicu pembalasan yang sistem ini ada untuk mencegah.
--
-- Jadi: bersihkan dulu, baru bangun ulang. Loop dinamis dipakai supaya
-- policy yang ditambahkan lewat dashboard di kemudian hari juga ikut
-- terhapus — tanpa perlu ada yang ingat memperbarui daftar di sini.
-- ==================================================================
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Aktifkan RLS di SEMUA tabel public, termasuk yang tidak dipakai demo.
-- Tabel tanpa RLS tetap bocor lewat anon key walau fiturnya belum dibangun.
--
-- Loop dinamis, bukan daftar ALTER manual: daftar manual di versi
-- sebelumnya menyebut `forum_likes`, yang ternyata TIDAK PERNAH ADA di
-- database ini walau tertulis di 001 — migrasinya akan langsung gagal di
-- baris itu. Loop ini bekerja apa adanya terhadap kenyataan skema.
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- Cabut GRANT bawaan dari anon. RLS + tanpa policy sudah menolak,
-- ini lapisan kedua supaya tidak ada policy baru yang tidak sengaja
-- membuka akses anon.
REVOKE ALL ON laporan_bullying   FROM anon;
REVOKE ALL ON pesan_tiket        FROM anon;
REVOKE ALL ON pesan_konseling    FROM anon;
REVOKE ALL ON audit_akses        FROM anon;
REVOKE ALL ON logbook_penanganan FROM anon;
REVOKE ALL ON chatbot_messages   FROM anon;
REVOKE ALL ON chatbot_sessions   FROM anon;
REVOKE ALL ON buddy_messages     FROM anon;
REVOKE ALL ON profiles           FROM anon;

-- ============================================================
-- 7. POLICY
-- ============================================================
-- Catatan: TIDAK ADA policy untuk role `anon` di tabel mana pun.
-- RLS aktif + nol policy = tolak semua. Itu disengaja (guardrail spec §5.2).
-- service_role melewati RLS, jadi jalur siswa anonim tetap jalan lewat server.

-- profiles: hanya diri sendiri; staf boleh lihat rekan satu sekolah.
CREATE POLICY profiles_self ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_staf_sekolah ON profiles FOR SELECT TO authenticated
  USING (auth_is_staf() AND school_id = auth_sekolah_id());

-- Siswa boleh ubah profilnya TAPI tidak boleh menaikkan role/sekolah sendiri.
CREATE POLICY profiles_update_self ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM auth_profil() p)
    AND school_id = (SELECT p.school_id FROM auth_profil() p)
  );

-- sekolah: staf boleh baca sekolahnya sendiri.
CREATE POLICY sekolah_staf ON sekolah FOR SELECT TO authenticated
  USING (id = auth_sekolah_id());

-- laporan_bullying: HANYA staf, HANYA sekolahnya sendiri.
-- Siswa (termasuk yang login) tidak diberi akses baca sama sekali —
-- pelacakan tiket lewat lacak_tiket(), yang tidak mengembalikan isi cerita.
CREATE POLICY laporan_staf_select ON laporan_bullying FOR SELECT TO authenticated
  USING (auth_is_staf() AND sekolah_id = auth_sekolah_id());

CREATE POLICY laporan_staf_update ON laporan_bullying FOR UPDATE TO authenticated
  USING (auth_is_staf() AND sekolah_id = auth_sekolah_id())
  WITH CHECK (auth_is_staf() AND sekolah_id = auth_sekolah_id());

-- pesan_tiket: staf sekolah terkait boleh baca & balas.
CREATE POLICY pesan_tiket_staf_select ON pesan_tiket FOR SELECT TO authenticated
  USING (
    auth_is_staf() AND EXISTS (
      SELECT 1 FROM laporan_bullying l
      WHERE l.id = pesan_tiket.laporan_id AND l.sekolah_id = auth_sekolah_id()
    )
  );

CREATE POLICY pesan_tiket_staf_insert ON pesan_tiket FOR INSERT TO authenticated
  WITH CHECK (
    auth_is_staf()
    AND dari_staf = auth.uid()
    AND EXISTS (
      SELECT 1 FROM laporan_bullying l
      WHERE l.id = pesan_tiket.laporan_id AND l.sekolah_id = auth_sekolah_id()
    )
  );

-- audit_akses: staf hanya boleh MENULIS, tidak boleh menghapus/mengubah.
-- Audit log yang bisa dihapus subjeknya bukan audit log.
CREATE POLICY audit_insert ON audit_akses FOR INSERT TO authenticated
  WITH CHECK (auth_is_staf() AND staf_id = auth.uid());

-- Hanya kepala sekolah yang boleh membaca audit, terbatas sekolahnya.
CREATE POLICY audit_kepsek_select ON audit_akses FOR SELECT TO authenticated
  USING (
    (SELECT p.role FROM auth_profil() p) = 'KEPALA_SEKOLAH'
    AND EXISTS (
      SELECT 1 FROM laporan_bullying l
      WHERE l.id = audit_akses.laporan_id AND l.sekolah_id = auth_sekolah_id()
    )
  );

-- logbook: staf sekolah terkait.
CREATE POLICY logbook_staf ON logbook_penanganan FOR ALL TO authenticated
  USING (
    auth_is_staf() AND EXISTS (
      SELECT 1 FROM laporan_bullying l
      WHERE l.id = logbook_penanganan.laporan_id AND l.sekolah_id = auth_sekolah_id()
    )
  )
  WITH CHECK (auth_is_staf() AND guru_bk_id = auth.uid());

-- notifikasi: hanya milik sendiri.
CREATE POLICY notifikasi_self ON notifikasi FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY notifikasi_self_update ON notifikasi FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- chatbot: hanya milik sendiri.
CREATE POLICY chatbot_sesi_self ON chatbot_sessions FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY chatbot_pesan_self ON chatbot_messages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM chatbot_sessions s
                 WHERE s.id = chatbot_messages.session_id AND s.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM chatbot_sessions s
                      WHERE s.id = chatbot_messages.session_id AND s.user_id = auth.uid()));

-- konseling: peserta saja.
CREATE POLICY konseling_peserta ON jadwal_konseling FOR SELECT TO authenticated
  USING (siswa_id = auth.uid() OR guru_bk_id = auth.uid());
CREATE POLICY pesan_konseling_peserta ON pesan_konseling FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM jadwal_konseling j
                 WHERE j.id = pesan_konseling.jadwal_id
                   AND (j.siswa_id = auth.uid() OR j.guru_bk_id = auth.uid())))
  WITH CHECK (sender_id = auth.uid());

-- buddy: peserta saja.
CREATE POLICY buddy_req_self ON buddy_requests FOR ALL TO authenticated
  USING (siswa_id = auth.uid()) WITH CHECK (siswa_id = auth.uid());
CREATE POLICY buddy_match_peserta ON buddy_matches FOR SELECT TO authenticated
  USING (siswa_id = auth.uid() OR buddy_id = auth.uid() OR guru_bk_id = auth.uid());
CREATE POLICY buddy_pesan_peserta ON buddy_messages FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM buddy_matches m
                 WHERE m.id = buddy_messages.match_id
                   AND (m.siswa_id = auth.uid() OR m.buddy_id = auth.uid())))
  WITH CHECK (sender_id = auth.uid());

-- forum: baca untuk yang login, tulis sebagai diri sendiri.
CREATE POLICY forum_post_baca ON forum_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY forum_post_tulis ON forum_posts FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());
CREATE POLICY forum_komentar_baca ON forum_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY forum_komentar_tulis ON forum_comments FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

-- forum_likes ada di 001 tapi tidak pernah terbuat di database ini.
-- Dibuat bersyarat supaya migrasi tidak gagal, dan kalau tabelnya menyusul
-- nanti ia tetap terkunci sejak awal, bukan terbuka sampai ada yang ingat.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='forum_likes') THEN
    EXECUTE 'CREATE POLICY forum_like_self ON forum_likes FOR ALL TO authenticated
             USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())';
  END IF;
END $$;

-- edukasi: modul aktif boleh dibaca yang login; progress milik sendiri.
CREATE POLICY edukasi_baca ON modul_edukasi FOR SELECT TO authenticated USING (aktif);
CREATE POLICY progress_self ON progress_edukasi FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- area sekolah: staf saja (dipakai heatmap).
CREATE POLICY area_staf ON area_sekolah FOR SELECT TO authenticated
  USING (auth_is_staf());
CREATE POLICY laporan_area_staf ON laporan_area FOR SELECT TO authenticated
  USING (
    auth_is_staf() AND EXISTS (
      SELECT 1 FROM laporan_bullying l
      WHERE l.id = laporan_area.laporan_id AND l.sekolah_id = auth_sekolah_id()
    )
  );

-- ============================================================
-- 8. LACAK_TIKET — status + thread, TIDAK PERNAH isi laporan
-- ============================================================
-- Blast radius: kode tiket yang jatuh ke tangan orang lain hanya
-- membuka status dan balasan BK, bukan cerita korban (spec §8.6).
CREATE OR REPLACE FUNCTION lacak_tiket(p_kode_hash TEXT)
RETURNS TABLE (
  status         ticket_status,
  urgensi_final  priority_level,
  jenis_final    bullying_type,
  flag_krisis    BOOLEAN,
  dibuat_at      TIMESTAMPTZ,
  diperbarui_at  TIMESTAMPTZ,
  pesan          JSONB
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp
AS $$
  SELECT
    l.status,
    l.urgensi_final,
    l.jenis_final,
    l.flag_krisis,
    l.created_at,
    l.updated_at,
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
                'dari', CASE WHEN pt.dari_staf IS NULL THEN 'Kamu' ELSE 'Guru BK' END,
                'isi', pt.isi,
                'dibuat_at', pt.dibuat_at
              ) ORDER BY pt.dibuat_at)
       FROM pesan_tiket pt WHERE pt.laporan_id = l.id),
      '[]'::jsonb
    )
  FROM laporan_bullying l
  WHERE l.kode_tiket_hash = p_kode_hash;
$$;

-- Fungsi ini SECURITY DEFINER, jadi EXECUTE-nya harus dibatasi ke server.
REVOKE ALL ON FUNCTION lacak_tiket(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION lacak_tiket(TEXT) TO service_role;

-- ============================================================
-- 9. FIX: privilege escalation di handle_new_user
-- ============================================================
-- Versi 001 menyalin role dari raw_user_meta_data, yang dikontrol
-- pendaftar. Karena anon key publik, siapa pun bisa memanggil
-- signUp({ options: { data: { role: 'GURU_BK' } } }) dan langsung jadi
-- Guru BK — lolos ke seluruh laporan sekolahnya.
-- Semua pendaftaran mandiri sekarang dipaksa SISWA. Akun staf hanya
-- boleh dibuat lewat service_role (skrip seed / admin).
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
DECLARE
  v_school UUID;
BEGIN
  -- school_id juga datang dari pendaftar, jadi tidak dipercaya. Teks yang
  -- bukan UUID akan melempar saat di-cast, dan UUID yang tidak ada di tabel
  -- `sekolah` akan melanggar FK — keduanya menggagalkan pendaftaran dengan
  -- error yang membingungkan. Jatuhkan ke sekolah demo, jangan meledak.
  BEGIN
    v_school := NULLIF(NEW.raw_user_meta_data->>'school_id', '')::UUID;
  EXCEPTION WHEN others THEN
    v_school := NULL;
  END;

  IF v_school IS NULL OR NOT EXISTS (SELECT 1 FROM sekolah s WHERE s.id = v_school) THEN
    v_school := '00000000-0000-0000-0000-000000000001';
  END IF;

  INSERT INTO profiles (id, full_name, email, role, school_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    'SISWA',  -- SENGAJA hardcoded. Jangan pernah baca role dari metadata.
    v_school
  );
  RETURN NEW;
END;
$$;

-- ============================================================
-- 10. tambah_poin: batasi EXECUTE
-- ============================================================
-- SECURITY DEFINER + EXECUTE untuk PUBLIC = siswa mana pun bisa
-- menaikkan poin siapa pun.
REVOKE ALL ON FUNCTION tambah_poin(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION tambah_poin(UUID, INTEGER) TO service_role;
