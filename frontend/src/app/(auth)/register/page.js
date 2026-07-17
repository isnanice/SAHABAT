"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

/**
 * Pendaftaran akun SISWA.
 *
 * Desain dari redesign Isna; di sini disambungkan ke Supabase supaya
 * benar-benar mendaftarkan (sebelumnya onSubmit cuma memanggil alert()).
 *
 * ==================== AKUN INI TIDAK UNTUK MELAPOR ====================
 * Siswa TIDAK perlu akun untuk melapor, dan akun ini TIDAK dipakai saat
 * melapor. Jalur laporan sengaja tidak mengenal sesi login:
 *
 *   akun ini          -> modul edukasi, poin, (nanti) forum & buddy
 *   jalur laporan     -> anonim mutlak, pelapor_id selalu NULL
 *
 * Halaman ini WAJIB mengatakannya terang-terangan. Anak yang mengira "kalau
 * aku punya akun, laporanku bisa dilacak" akan berhenti melapor — dan itu
 * kegagalan yang paling mahal dari produk ini. Jangan hapus blok penjelasan
 * di bawah demi merapikan tampilan.
 *
 * Peran dikunci "Siswa" dan TIDAK dikirim ke server. Migrasi 002 memaksa
 * semua pendaftaran mandiri jadi SISWA di trigger handle_new_user(), karena
 * versi lama menyalin role dari metadata pendaftar — siapa pun bisa
 * signUp({ data: { role: 'GURU_BK' } }) dengan anon key yang publik lalu
 * membaca seluruh laporan sekolah. Akun staf hanya lewat scripts/seed.mjs.
 * =====================================================================
 */
export default function Register() {
  const router = useRouter();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [lihatSandi, setLihatSandi] = useState(false);
  const [lihatKonfirmasi, setLihatKonfirmasi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (sandi.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (sandi !== konfirmasi) {
      setError("Kata sandi dan konfirmasinya tidak sama.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    // `role` SENGAJA tidak dikirim. Server mengabaikannya (trigger memaksa
    // SISWA), tapi mengirimnya tetap salah — itu memberi kesan klien boleh
    // menentukan peran.
    const { data, error: errDaftar } = await supabase.auth.signUp({
      email: email.trim(),
      password: sandi,
      options: { data: { full_name: nama.trim() } },
    });

    if (errDaftar) {
      setError(
        /already|registered|exists/i.test(errDaftar.message)
          ? "Email ini sudah terdaftar. Coba masuk saja."
          : /pwned|leaked|compromis/i.test(errDaftar.message)
            ? "Kata sandi ini pernah bocor di kebocoran data lain. Pilih yang berbeda."
            : errDaftar.message
      );
      setLoading(false);
      return;
    }

    // Kalau konfirmasi email diaktifkan di Supabase, sesi belum ada sampai
    // emailnya diklik. Tampilkan pesan jujur, jangan pura-pura sudah masuk.
    if (!data.session) {
      setSukses(true);
      setLoading(false);
      return;
    }

    router.push("/siswa/edukasi");
    router.refresh();
  }

  if (sukses) {
    return (
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Image src="/logo.png" alt="SAHABAT Logo" width={32} height={32} style={{ height: "auto" }} />
          <span style={{ color: "#1e40af", fontWeight: "bold", fontSize: "18px" }}>SAHABAT</span>
        </div>
        <h2 className={styles.cardTitle}>Cek emailmu</h2>
        <p className={styles.cardSubtitle}>
          Kami mengirim tautan konfirmasi ke <strong>{email}</strong>. Klik tautan
          itu untuk mengaktifkan akunmu, lalu masuk.
        </p>
        <Link href="/login" style={{ textDecoration: "none" }}>
          <button type="button" className={styles.submitBtn}>
            Ke halaman Masuk <ArrowRight size={20} />
          </button>
        </Link>
        <p className={styles.footerText} style={{ marginTop: 24 }}>
          Mau melapor sekarang? <Link href="/lapor">Kamu tidak perlu akun</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Image src="/logo.png" alt="SAHABAT Logo" width={32} height={32} style={{ height: "auto" }} />
        <span style={{ color: "#1e40af", fontWeight: "bold", fontSize: "18px" }}>SAHABAT</span>
      </div>

      <h2 className={styles.cardTitle}>Buat Akun Baru</h2>
      <p className={styles.cardSubtitle}>
        Akun untuk modul edukasi dan poin. Untuk melapor, kamu tidak perlu akun.
      </p>

      <div className={styles.tabs}>
        <Link href="/login" className={styles.tab}>Masuk</Link>
        <div className={`${styles.tab} ${styles.active}`}>Daftar</div>
      </div>

      {/* JANGAN HAPUS. Lihat catatan di atas berkas ini. */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          border: "1px solid #e5e7f5",
          background: "#f5f7ff",
          borderRadius: 12,
          padding: 12,
          marginBottom: 20,
        }}
      >
        <ShieldCheck size={18} style={{ color: "#4f46e5", flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "#4b5563", margin: 0 }}>
          <strong>Mau melapor? Tidak perlu daftar.</strong>{" "}
          <Link href="/lapor" style={{ color: "#4f46e5", fontWeight: 500 }}>Lapor langsung di sini</Link> —
          tanpa nama, tanpa akun. Punya akun juga <strong>tidak</strong> membuat
          laporanmu bisa dilacak; sistem sengaja tidak menyimpan siapa yang
          mengirim laporan.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="nama">Nama Lengkap</label>
          <input
            id="nama"
            type="text"
            required
            autoComplete="name"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className={styles.input}
            placeholder="Masukkan nama lengkapmu"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="contoh@gmail.com"
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="peran">Peran</label>
          {/* Dikunci, dan nilainya tidak pernah dikirim ke server. Akun staf
              dibuat lewat scripts/seed.mjs (service_role), bukan dari sini. */}
          <select id="peran" className={styles.input} style={{ appearance: "auto" }} value="Siswa" disabled>
            <option value="Siswa">Siswa</option>
          </select>
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
            Guru BK tidak mendaftar sendiri — hubungi admin sekolah.
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="sandi">Kata Sandi</label>
          <div className={styles.passwordWrap}>
            <input
              id="sandi"
              type={lihatSandi ? "text" : "password"}
              required
              autoComplete="new-password"
              value={sandi}
              onChange={(e) => setSandi(e.target.value)}
              className={styles.input}
              placeholder="Minimal 8 karakter"
            />
            <button type="button" onClick={() => setLihatSandi(!lihatSandi)} className={styles.eyeIcon} style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Tampilkan kata sandi">
              {lihatSandi ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="konfirmasi">Konfirmasi Kata Sandi</label>
          <div className={styles.passwordWrap}>
            <input
              id="konfirmasi"
              type={lihatKonfirmasi ? "text" : "password"}
              required
              autoComplete="new-password"
              value={konfirmasi}
              onChange={(e) => setKonfirmasi(e.target.value)}
              className={styles.input}
              placeholder="Ulangi kata sandi"
            />
            <button type="button" onClick={() => setLihatKonfirmasi(!lihatKonfirmasi)} className={styles.eyeIcon} style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Tampilkan konfirmasi kata sandi">
              {lihatKonfirmasi ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.checkboxWrap}>
          <input type="checkbox" id="syarat" required className={styles.checkbox} />
          <label htmlFor="syarat" className={styles.checkboxLabel}>
            Saya sudah membaca <Link href="/privasi">Privasi &amp; Data</Link>
          </label>
        </div>

        {error && (
          <p role="alert" style={{ color: "#dc2626", fontSize: 14, marginBottom: 16 }}>
            {error}
          </p>
        )}

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? (
            <>Mendaftarkan <Loader2 size={20} className="animate-spin" /></>
          ) : (
            <>Daftar Sekarang <ArrowRight size={20} /></>
          )}
        </button>
      </form>

      <p className={styles.footerText}>
        Sudah punya akun? <Link href="/login">Masuk</Link>
      </p>
    </div>
  );
}
