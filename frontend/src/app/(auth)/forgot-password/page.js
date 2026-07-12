"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import styles from "../auth.module.css";

export default function ForgotPassword() {
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSent(true);
  };

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Image src="/logo.png" alt="SAHABAT Logo" width={32} height={32} />
        <span style={{color: '#1e40af', fontWeight: 'bold', fontSize: '18px'}}>SAHABAT</span>
      </div>

      <h2 className={styles.cardTitle}>Lupa Kata Sandi</h2>
      <p className={styles.cardSubtitle}>
        Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan (link) untuk mengatur ulang kata sandi Anda secara aman.
      </p>

      <div className={styles.tabs}>
        <Link href="/login" className={styles.tab}>Masuk</Link>
        <Link href="/register" className={styles.tab}>Daftar</Link>
      </div>

      {isSent && (
        <div className={styles.successBox}>
          <CheckCircle2 size={20} style={{flexShrink: 0, marginTop: '2px'}} />
          <span>Kami telah mengirimkan tautan pengaturan ulang kata sandi Anda melalui email.</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Alamat Email</label>
          <input type="email" className={styles.input} placeholder="contoh@gmail.com" required />
        </div>

        <button type="submit" className={styles.submitBtn} style={{marginBottom: '16px'}}>
          Kirim Tautan Atur Ulang <Send size={18} />
        </button>

        <Link href="/login" style={{textDecoration: 'none'}}>
          <button type="button" className={styles.submitBtnOutline}>
            <ArrowLeft size={18} /> Kembali ke Masuk
          </button>
        </Link>
      </form>
    </div>
  );
}
