"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

/**
 * Pendaftaran akun SISWA — halaman /daftar.
 *
 * Peran dikunci "Siswa" dan TIDAK dikirim ke server. Migrasi 002 memaksa
 * semua pendaftaran mandiri jadi SISWA di trigger handle_new_user().
 * Akun staf hanya lewat scripts/seed.mjs.
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
    // SISWA), tapi mengirimnya tetap salah.
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

    router.push("/");
    router.refresh();
  }

  if (sukses) {
    return (
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Image src="/logo1.svg" alt="SAHABAT Logo" width={140} height={40} style={{ height: "auto" }} />
        </div>
        <h2 className={styles.cardTitle}>Cek emailmu</h2>
        <p className={styles.cardSubtitle}>
          Kami mengirim tautan konfirmasi ke <strong>{email}</strong>. Klik tautan
          itu untuk mengaktifkan akunmu, lalu masuk.
        </p>
        <Link href="/masuk" style={{ textDecoration: "none" }}>
          <button type="button" className={styles.submitBtn}>
            Ke halaman Masuk <ArrowRight size={20} />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Image src="/logo1.svg" alt="SAHABAT Logo" width={140} height={40} style={{ height: "auto" }} />
      </div>

      <h2 className={styles.cardTitle}>Buat Akun Baru</h2>
      <p className={styles.cardSubtitle}>
        Bergabunglah dengan SAHABAT, ruang aman untuk berbagi cerita dan mendapatkan dukungan saat dibutuhkan.
      </p>

      <div className={styles.tabs}>
        <Link href="/masuk" className={styles.tab}>Masuk</Link>
        <div className={`${styles.tab} ${styles.active}`}>Daftar</div>
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
          <input
            id="peran"
            type="text"
            className={styles.input}
            value="Siswa"
            readOnly
            style={{ backgroundColor: "#f1f5f9", color: "#64748b" }}
          />
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
              className={`${styles.input} ${styles.inputPassword}`}
              placeholder="Minimal 8 karakter"
            />
            <button
              type="button"
              onClick={() => setLihatSandi(!lihatSandi)}
              className={styles.eyeBtn}
              aria-label="Tampilkan kata sandi"
            >
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
              className={`${styles.input} ${styles.inputPassword}`}
              placeholder="Ulangi kata sandi"
            />
            <button
              type="button"
              onClick={() => setLihatKonfirmasi(!lihatKonfirmasi)}
              className={styles.eyeBtn}
              aria-label="Tampilkan konfirmasi kata sandi"
            >
              {lihatKonfirmasi ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.checkboxWrap}>
          <input type="checkbox" id="syarat" required className={styles.checkbox} />
          <label htmlFor="syarat" className={styles.checkboxLabel}>
            Saya setuju dengan <Link href="/privasi">Syarat &amp; Ketentuan</Link> serta <Link href="/privasi">Kebijakan Privasi</Link>
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

        <div className={styles.divider}>Atau lanjutkan dengan</div>
        
        <button type="button" className={styles.googleBtn}>
          <Image src="/google.svg" alt="Google" width={20} height={20} />
          Sign in with google
        </button>
      </form>

      <p className={styles.footerText}>
        Sudah punya akun? <Link href="/masuk">Masuk</Link>
      </p>
    </div>
  );
}
