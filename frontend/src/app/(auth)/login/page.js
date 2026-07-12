"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye, ArrowRight } from "lucide-react";
import styles from "../auth.module.css";

export default function Login() {
  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Image src="/logo.png" alt="SAHABAT Logo" width={32} height={32} />
        <span style={{color: '#1e40af', fontWeight: 'bold', fontSize: '18px'}}>SAHABAT</span>
      </div>

      <h2 className={styles.cardTitle}>Masuk ke Akun</h2>
      <p className={styles.cardSubtitle}>
        Masuk untuk mengakses layanan konseling bersama Guru BK secara aman dan rahasia.
      </p>

      <div className={styles.tabs}>
        <div className={`${styles.tab} ${styles.active}`}>Masuk</div>
        <Link href="/register" className={styles.tab}>Daftar</Link>
      </div>

      <form>
        <div className={styles.formGroup}>
          <label className={styles.label}>Alamat Email</label>
          <input type="email" className={styles.input} placeholder="contoh@gmail.com" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Kata Sandi</label>
          <div className={styles.passwordWrap}>
            <input type="password" className={styles.input} placeholder="Minimal 8 karakter" />
            <Eye size={20} className={styles.eyeIcon} />
          </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
          <div className={styles.checkboxWrap} style={{marginTop: 0, marginBottom: 0}}>
            <input type="checkbox" id="remember" className={styles.checkbox} />
            <label htmlFor="remember" className={styles.checkboxLabel}>Ingat saya</label>
          </div>
          <Link href="/forgot-password" className={styles.forgotLink} style={{margin: 0}}>Lupa Sandi?</Link>
        </div>

        <button type="submit" className={styles.submitBtn}>
          Masuk <ArrowRight size={20} />
        </button>

        <p className={styles.footerText} style={{marginTop: '40px'}}>
          Belum punya akun? <Link href="/register">Daftar di sini</Link>
        </p>
      </form>
    </div>
  );
}
