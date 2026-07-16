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
        <Image src="/logo.png" alt="SAHABAT Logo" width={32} height={32} style={{ height: "auto" }} />
        <span style={{ color: "#1e40af", fontWeight: "bold", fontSize: "18px" }}>SAHABAT</span>
      </div>

      <h2 className={styles.cardTitle}>Lupa Kata Sandi</h2>
      <p className={styles.cardSubtitle}>
        Untuk akun Guru BK dan pihak sekolah. Kalau kamu siswa,{" "}
        <Link href="/lapor">kamu tidak perlu akun sama sekali</Link>.
      </p>

      <div className={styles.tabs}>
        <Link href="/login" className={styles.tab}>Masuk</Link>
        <Link href="/register" className={styles.tab}>Daftar</Link>
      </div>

      {terkirim ? (
        <>
          <div className={styles.successBox}>
            <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>
              Kalau <strong>{email}</strong> terdaftar sebagai akun staf, tautan
              pengaturan ulang sudah dikirim ke email itu. Cek juga folder spam.
            </span>
          </div>
          <Link href="/login" style={{ textDecoration: "none" }}>
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
              placeholder="nama@sekolah.sch.id"
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

          <Link href="/login" style={{ textDecoration: "none" }}>
            <button type="button" className={styles.submitBtnOutline}>
              <ArrowLeft size={18} /> Kembali ke Masuk
            </button>
          </Link>
        </form>
      )}
    </div>
  );
}
