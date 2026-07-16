"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import styles from "../auth.module.css";

/**
 * Halaman "Daftar".
 * 
 * Form pendaftaran siswa diubah menjadi statis (UI saja) karena sistem 
 * sengaja dibuat tanpa akun untuk siswa untuk menjaga kerahasiaan mereka.
 */
export default function Register() {
  const [lihatSandi, setLihatSandi] = useState(false);
  const [lihatKonfirmasi, setLihatKonfirmasi] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    alert("Halaman pendaftaran ini hanya tampilan visual (UI). Siswa tidak perlu membuat akun untuk melapor.");
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Image src="/logo.png" alt="SAHABAT Logo" width={32} height={32} style={{ height: "auto" }} />
        <span style={{ color: "#1e40af", fontWeight: "bold", fontSize: "18px" }}>SAHABAT</span>
      </div>

      <h2 className={styles.cardTitle}>Buat Akun Baru</h2>
      <p className={styles.cardSubtitle}>
        Bergabunglah dengan SAHABAT, ruang aman untuk berbagi cerita dan mendapatkan dukungan saat dibutuhkan.
      </p>

      <div className={styles.tabs}>
        <Link href="/login" className={styles.tab}>Masuk</Link>
        <div className={`${styles.tab} ${styles.active}`}>Daftar</div>
      </div>

      <form onSubmit={onSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="nama">Nama Lengkap</label>
          <input id="nama" type="text" required className={styles.input} placeholder="Masukkan nama lengkapmu" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input id="email" type="email" required className={styles.input} placeholder="contoh@gmail.com" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="peran">Peran</label>
          <select id="peran" required className={styles.input} style={{ appearance: "auto" }}>
            <option value="Siswa">Siswa</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="sandi">Kata Sandi</label>
          <div className={styles.passwordWrap}>
            <input id="sandi" type={lihatSandi ? "text" : "password"} required className={styles.input} placeholder="Minimal 8 karakter" />
            <button type="button" onClick={() => setLihatSandi(!lihatSandi)} className={styles.eyeIcon} style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Tampilkan kata sandi">
              {lihatSandi ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="konfirmasi">Konfirmasi Kata Sandi</label>
          <div className={styles.passwordWrap}>
            <input id="konfirmasi" type={lihatKonfirmasi ? "text" : "password"} required className={styles.input} placeholder="Ulangi kata sandi" />
            <button type="button" onClick={() => setLihatKonfirmasi(!lihatKonfirmasi)} className={styles.eyeIcon} style={{ background: "none", border: "none", cursor: "pointer" }} aria-label="Tampilkan konfirmasi kata sandi">
              {lihatKonfirmasi ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className={styles.checkboxWrap}>
          <input type="checkbox" id="syarat" required className={styles.checkbox} />
          <label htmlFor="syarat" className={styles.checkboxLabel}>
            Saya setuju dengan <Link href="#">Syarat & Ketentuan</Link> serta <Link href="#">Kebijakan Privasi</Link>
          </label>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Daftar Sekarang <ArrowRight size={20} />
        </button>
      </form>

      <div className={styles.divider}>Atau lanjutkan dengan</div>

      <button type="button" className={styles.googleBtn} onClick={() => alert("Login Google belum dikonfigurasi.")}>
        <Image src="/google.svg" alt="Google" width={20} height={20} />
        Sign in with google
      </button>

      <p className={styles.footerText}>
        Sudah punya akun? <Link href="/login">Masuk</Link>
      </p>
    </div>
  );
}
