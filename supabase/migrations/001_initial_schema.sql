-- ============================================================
-- SAHABAT Platform — Initial Database Schema
-- Supabase Migration 001
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE user_role AS ENUM ('SISWA', 'GURU_BK', 'KEPALA_SEKOLAH');
CREATE TYPE priority_level AS ENUM ('RENDAH', 'SEDANG', 'TINGGI', 'KRITIS');
CREATE TYPE bullying_type AS ENUM ('VERBAL', 'FISIK', 'SIBER', 'SOSIAL', 'SEKSUAL');
CREATE TYPE ticket_status AS ENUM ('MENUNGGU', 'DIPROSES', 'SELESAI', 'DITUTUP');
CREATE TYPE konseling_status AS ENUM ('MENUNGGU', 'DIKONFIRMASI', 'BERLANGSUNG', 'SELESAI', 'DIBATALKAN');
CREATE TYPE buddy_status AS ENUM ('AKTIF', 'SELESAI', 'DITANGGUHKAN');
CREATE TYPE edukasi_type AS ENUM ('VIDEO', 'ARTIKEL', 'QUIZ', 'INFOGRAFIS');
CREATE TYPE notif_type AS ENUM ('LAPORAN_BARU', 'STATUS_UPDATE', 'KONSELING', 'BUDDY', 'FORUM', 'SISTEM', 'ESKALASI');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'SISWA',
  school_id UUID,
  kelas TEXT,
  nis TEXT,
  nip TEXT,
  avatar_url TEXT,
  poin INTEGER NOT NULL DEFAULT 0,
  aktif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LAPORAN BULLYING
-- ============================================================
CREATE TABLE laporan_bullying (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode_tiket TEXT UNIQUE NOT NULL,
  pelapor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  korban_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  jenis_bullying bullying_type NOT NULL,
  deskripsi TEXT NOT NULL,
  lokasi TEXT,
  tanggal_kejadian DATE,
  prioritas priority_level NOT NULL DEFAULT 'SEDANG',
  status ticket_status NOT NULL DEFAULT 'MENUNGGU',
  anonim BOOLEAN NOT NULL DEFAULT true,
  penanganan_guru_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ai_klasifikasi JSONB,
  bukti_urls TEXT[],
  catatan_internal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- LOGBOOK PENANGANAN (Guru BK)
-- ============================================================
CREATE TABLE logbook_penanganan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID NOT NULL REFERENCES laporan_bullying(id) ON DELETE CASCADE,
  guru_bk_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tanggal_tindakan TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tindakan TEXT NOT NULL,
  hasil TEXT,
  tindak_lanjut TEXT,
  lampiran_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHATBOT SESSIONS & MESSAGES
-- ============================================================
CREATE TABLE chatbot_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE chatbot_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chatbot_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- JADWAL KONSELING
-- ============================================================
CREATE TABLE jadwal_konseling (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  siswa_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guru_bk_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tanggal DATE NOT NULL,
  waktu_mulai TIME NOT NULL,
  waktu_selesai TIME,
  jenis TEXT NOT NULL DEFAULT 'ONLINE' CHECK (jenis IN ('ONLINE', 'TATAP_MUKA')),
  status konseling_status NOT NULL DEFAULT 'MENUNGGU',
  catatan TEXT,
  meet_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PESAN KONSELING TERENKRIPSI
-- ============================================================
CREATE TABLE pesan_konseling (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jadwal_id UUID NOT NULL REFERENCES jadwal_konseling(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_encrypted TEXT NOT NULL,
  dibaca BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BUDDY SUPPORT
-- ============================================================
CREATE TABLE buddy_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  siswa_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'MATCHED', 'DITOLAK')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE buddy_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  siswa_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  buddy_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guru_bk_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status buddy_status NOT NULL DEFAULT 'AKTIF',
  catatan_guru TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE buddy_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES buddy_matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  dibaca BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FORUM KOMUNITAS
-- ============================================================
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  judul TEXT NOT NULL,
  konten TEXT NOT NULL,
  tags TEXT[],
  anonim BOOLEAN NOT NULL DEFAULT false,
  termoderasi BOOLEAN NOT NULL DEFAULT false,
  moderator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE forum_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  konten TEXT NOT NULL,
  anonim BOOLEAN NOT NULL DEFAULT false,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE forum_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES forum_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- ============================================================
-- MODUL EDUKASI
-- ============================================================
CREATE TABLE modul_edukasi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul TEXT NOT NULL,
  deskripsi TEXT,
  konten_url TEXT,
  thumbnail_url TEXT,
  poin_reward INTEGER NOT NULL DEFAULT 10,
  tipe edukasi_type NOT NULL DEFAULT 'ARTIKEL',
  durasi_menit INTEGER,
  urutan INTEGER NOT NULL DEFAULT 0,
  aktif BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE progress_edukasi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  modul_id UUID NOT NULL REFERENCES modul_edukasi(id) ON DELETE CASCADE,
  persen INTEGER NOT NULL DEFAULT 0 CHECK (persen >= 0 AND persen <= 100),
  selesai BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, modul_id)
);

-- ============================================================
-- NOTIFIKASI
-- ============================================================
CREATE TABLE notifikasi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  judul TEXT NOT NULL,
  pesan TEXT NOT NULL,
  tipe notif_type NOT NULL DEFAULT 'SISTEM',
  ref_id UUID,
  dibaca BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- HEATMAP DATA (area sekolah)
-- ============================================================
CREATE TABLE area_sekolah (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  koordinat_x FLOAT,
  koordinat_y FLOAT,
  keterangan TEXT,
  aktif BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE laporan_area (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID NOT NULL REFERENCES laporan_bullying(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES area_sekolah(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_laporan_status ON laporan_bullying(status);
CREATE INDEX idx_laporan_prioritas ON laporan_bullying(prioritas);
CREATE INDEX idx_laporan_created ON laporan_bullying(created_at DESC);
CREATE INDEX idx_laporan_pelapor ON laporan_bullying(pelapor_id);
CREATE INDEX idx_notifikasi_user ON notifikasi(user_id, dibaca);
CREATE INDEX idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX idx_chatbot_session ON chatbot_messages(session_id, created_at);
CREATE INDEX idx_pesan_konseling_jadwal ON pesan_konseling(jadwal_id, created_at);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Trigger: update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_laporan_updated BEFORE UPDATE ON laporan_bullying FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_konseling_updated BEFORE UPDATE ON jadwal_konseling FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function: tambah poin reward siswa
CREATE OR REPLACE FUNCTION tambah_poin(p_user_id UUID, p_poin INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET poin = poin + p_poin WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: auto-create profile saat user register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'SISWA')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

