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

  // Tombol "Sign in with google" ada di desain. Disambungkan ke OAuth Supabase
  // sungguhan — bukan tombol mati. Kalau provider Google belum diaktifkan di
  // dashboard Supabase, Supabase mengembalikan error dan kita tampilkan apa
  // adanya, bukan pura-pura berhasil.
  //
  // Aman untuk anonimitas: ini akun SISWA (edukasi/poin), bukan jalur laporan.
  // Trigger handle_new_user() tetap memaksa peran SISWA, jadi masuk lewat
  // Google pun tidak bisa jadi GURU_BK.
  async function masukGoogle() {
    if (loading) return;
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: errG } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/siswa/edukasi` },
    });
    if (errG) {
      setError(
        /provider is not enabled/i.test(errG.message)
          ? "Masuk dengan Google belum diaktifkan. Untuk sekarang, daftar dengan email di atas."
          : errG.message
      );
      setLoading(false);
    }
  }

  if (sukses) {
    return (
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Image src="/logo.png" alt="SAHABAT Logo" width={32} height={32} style={{ height: "auto" }} />
          <span style={{ color: "var(--sahabat-ungu-tua)", fontWeight: "bold", fontSize: "18px" }}>SAHABAT</span>
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
        <span style={{ color: "var(--sahabat-ungu-tua)", fontWeight: "bold", fontSize: "18px" }}>SAHABAT</span>
      </div>

      <h2 className={styles.cardTitle}>Buat Akun Baru</h2>
      <p className={styles.cardSubtitle}>
        Bergabunglah dengan SAHABAT, ruang aman untuk berbagi cerita dan
        mendapatkan dukungan saat dibutuhkan.
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
          border: "1px solid var(--sahabat-garis)",
          background: "var(--sahabat-latar)",
          borderRadius: 12,
          padding: 12,
          marginBottom: 20,
        }}
      >
        <ShieldCheck size={18} style={{ color: "var(--sahabat-ungu)", flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--sahabat-teks-sedang)", margin: 0 }}>
          <strong>Mau melapor? Tidak perlu daftar.</strong>{" "}
          <Link href="/lapor" style={{ color: "var(--sahabat-ungu)", fontWeight: 500 }}>Lapor langsung di sini</Link> —
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
          <p style={{ fontSize: 12, color: "var(--sahabat-teks-redup)", marginTop: 6 }}>
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
            Saya setuju dengan <Link href="/privasi">Syarat &amp; Ketentuan</Link>{" "}
            serta <Link href="/privasi">Kebijakan Privasi</Link>
          </label>
        </div>

        {error && (
          <p role="alert" style={{ color: "var(--sahabat-darurat)", fontSize: 14, marginBottom: 16 }}>
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

      <div className={styles.divider}>Atau lanjutkan dengan</div>

      <button type="button" className={styles.googleBtn} onClick={masukGoogle} disabled={loading}>
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Sign in with google
      </button>

      <p className={styles.footerText}>
        Sudah punya akun? <Link href="/login">Masuk</Link>
      </p>
    </div>
  );
}
