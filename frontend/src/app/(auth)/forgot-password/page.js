"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Send, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

/**
 * Lupa kata sandi — untuk akun STAF.
 *
 * Versi sebelumnya BERBOHONG: handleSubmit cuma menyetel isSent = true lalu
 * menampilkan "Kami telah mengirimkan tautan... melalui email". Tidak ada
 * email yang pernah dikirim. Guru BK yang terkunci dari akun berisi laporan
 * kekerasan anak akan menunggu email yang tidak pernah ada.
 *
 * Sekarang benar-benar memanggil Supabase.
 *
 * Catatan siswa: halaman ini tidak berlaku untuk mereka — siswa tidak punya
 * akun, dan kode tiket yang hilang memang TIDAK BISA dipulihkan. Memulihkannya
 * butuh mengetahui siapa mereka, dan itu justru yang dilindungi.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [terkirim, setTerkirim] = useState(false);
  const [error, setError] = useState("");

  async function kirim(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: errKirim } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/atur-ulang-sandi`,
    });

    if (errKirim) {
      // Rate limit Supabase (default 2/jam) paling mungkin muncul di sini.
      setError(
        /rate|limit|seconds/i.test(errKirim.message)
          ? "Terlalu banyak permintaan. Tunggu beberapa saat lalu coba lagi."
          : "Gagal mengirim email. Coba lagi, atau hubungi admin sekolah."
      );
      setLoading(false);
      return;
    }

    // Sengaja tidak membedakan "email terdaftar" dan "tidak terdaftar":
    // membedakannya memberi tahu penyerang email mana yang merupakan akun staf.
    setTerkirim(true);
    setLoading(false);
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Image src="/shbt.svg" alt="SAHABAT Logo" width={140} height={40} style={{ height: "auto" }} />
      </div>

      <h2 className={styles.cardTitle}>Lupa Kata Sandi</h2>
      <p className={styles.cardSubtitle}>
        Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan (link) untuk mengatur ulang kata sandi Anda secara aman.
      </p>

      <div className={styles.tabs}>
        <Link href="/masuk" className={`${styles.tab} ${styles.active}`}>Masuk</Link>
        <Link href="/daftar" className={styles.tab}>Daftar</Link>
      </div>

      {terkirim ? (
        <>
          <div className={styles.successBox}>
            <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>
              Kami telah mengirimkan tautan pengaturan ulang kata sandi Anda melalui email.
            </span>
          </div>
          <Link href="/masuk" style={{ textDecoration: "none" }}>
            <button type="button" className={styles.submitBtnOutline}>
              <ArrowLeft size={18} /> Kembali ke Masuk
            </button>
          </Link>
        </>
      ) : (
        <form onSubmit={kirim}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">Alamat Email</label>
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

          {error && (
            <p role="alert" style={{ color: "#dc2626", fontSize: 14, marginBottom: 16 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            style={{ marginBottom: "16px" }}
            disabled={loading}
          >
            {loading ? (
              <>Mengirim <Loader2 size={18} className="animate-spin" /></>
            ) : (
              <>Kirim Tautan Atur Ulang <Send size={18} /></>
            )}
          </button>

          <Link href="/masuk" style={{ textDecoration: "none" }}>
            <button type="button" className={styles.submitBtnOutline}>
              <ArrowLeft size={18} /> Kembali ke Masuk
            </button>
          </Link>
        </form>
      )}
    </div>
  );
}
