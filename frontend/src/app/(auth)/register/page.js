"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, ArrowRight } from "lucide-react";
import styles from "../auth.module.css";

export default function Register() {
  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Image src="/logo.png" alt="SAHABAT Logo" width={32} height={32} />
        <span style={{color: '#1e40af', fontWeight: 'bold', fontSize: '18px'}}>SAHABAT</span>
      </div>

      <h2 className={styles.cardTitle}>Buat Akun Baru</h2>
      <p className={styles.cardSubtitle}>
        Bergabunglah dengan SAHABAT, ruang aman untuk berbagi cerita dan mendapatkan dukungan saat dibutuhkan.
      </p>

      <div className={styles.tabs}>
        <Link href="/login" className={styles.tab}>Masuk</Link>
        <div className={`${styles.tab} ${styles.active}`}>Daftar</div>
      </div>

      <form>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nama Lengkap</label>
          <input type="text" className={styles.input} placeholder="Masukkan nama lengkapmu" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input type="email" className={styles.input} placeholder="contoh@gmail.com" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Peran</label>
          <select className={styles.input}>
            <option>Siswa</option>
            <option>Guru BK</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Kata Sandi</label>
          <div className={styles.passwordWrap}>
            <input type="password" className={styles.input} placeholder="Minimal 8 karakter" />
            <Eye size={20} className={styles.eyeIcon} />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Konfirmasi Kata Sandi</label>
          <div className={styles.passwordWrap}>
            <input type="password" className={styles.input} placeholder="Ulangi kata sandi" />
            <Eye size={20} className={styles.eyeIcon} />
          </div>
        </div>

        <div className={styles.checkboxWrap}>
          <input type="checkbox" id="terms" className={styles.checkbox} />
          <label htmlFor="terms" className={styles.checkboxLabel}>
            Saya setuju dengan <a href="#">Syarat & Ketentuan</a> serta <a href="#">Kebijakan Privasi</a>
          </label>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Daftar Sekarang <ArrowRight size={20} />
        </button>

        <div className={styles.divider}>Atau lanjutkan dengan</div>

        <button type="button" className={styles.googleBtn}>
          <Image src="/logo.png" alt="Google" width={20} height={20} />
          Sign in with google
        </button>

        <p className={styles.footerText}>
          Sudah punya akun? <Link href="/login">Masuk</Link>
        </p>
      </form>
    </div>
  );
}
