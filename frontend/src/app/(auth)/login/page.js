"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

/**
 * Login staf sekolah.
 *
 * Versi sebelumnya form statis — tanpa state, tanpa onSubmit, tanpa panggilan
 * Supabase. Tombolnya ada tapi tidak melakukan apa pun, jadi dashboard Guru BK
 * tidak pernah bisa dijangkau siapa pun.
 *
 * Halaman ini HANYA untuk staf. Siswa tidak login sama sekali — mereka
 * melapor lewat /lapor dan memantau lewat /cek-laporan dengan kode tiket.
 */
function FormLogin() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [lihatSandi, setLihatSandi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function masuk(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: errAuth } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: sandi,
    });

    if (errAuth) {
      // Pesan sengaja tidak membedakan "email tidak ada" dari "sandi salah".
      // Membedakannya memberi tahu penyerang email mana yang terdaftar sebagai
      // staf — daftar target untuk phishing akun yang memegang cerita anak.
      setError("Email atau kata sandi salah.");
      setLoading(false);
      return;
    }

    const { data: profil } = await supabase
      .from("profiles")
      .select("role, aktif")
      .eq("id", data.user.id)
      .single();

    if (!profil?.aktif) {
      await supabase.auth.signOut();
      setError("Akunmu tidak aktif. Hubungi admin sekolah.");
      setLoading(false);
      return;
    }

    const tujuan = {
      SISWA: "/siswa/edukasi",
      GURU_BK: "/guru-bk/inbox",
      KEPALA_SEKOLAH: "/kepala-sekolah/analitik",
    }[profil.role];

    if (!tujuan) {
      await supabase.auth.signOut();
      setError("Peran akun ini tidak dikenali. Hubungi admin sekolah.");
      setLoading(false);
      return;
    }

    router.push(params.get("redirect") || tujuan);
    router.refresh();
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Image src="/logo.png" alt="SAHABAT Logo" width={32} height={32} style={{ height: "auto" }} />
        <span style={{ color: "#1e40af", fontWeight: "bold", fontSize: "18px" }}>SAHABAT</span>
      </div>

      <h2 className={styles.cardTitle}>Masuk ke Akun</h2>
      {/* Jujur soal apa gunanya login. Anak yang mengira harus login dulu
          untuk melapor bisa mengurungkan niatnya di sini — dan jalur lapor
          justru sengaja tidak butuh akun. */}
      <p className={styles.cardSubtitle}>
        Untuk modul edukasi dan Guru BK. Mau melapor?{" "}
        <Link href="/lapor">Kamu tidak perlu masuk</Link> — laporan tetap anonim.
      </p>

      <div className={styles.tabs}>
        <div className={`${styles.tab} ${styles.active}`}>Masuk</div>
        <Link href="/register" className={styles.tab}>Daftar</Link>
      </div>

      <form onSubmit={masuk}>
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

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="sandi">Kata Sandi</label>
          <div className={styles.passwordWrap}>
            <input
              id="sandi"
              type={lihatSandi ? "text" : "password"}
              required
              autoComplete="current-password"
              value={sandi}
              onChange={(e) => setSandi(e.target.value)}
              className={styles.input}
              placeholder="Minimal 8 karakter"
            />
            <button
              type="button"
              onClick={() => setLihatSandi((v) => !v)}
              className={styles.eyeIcon}
              style={{ background: "none", border: "none", cursor: "pointer" }}
              aria-label={lihatSandi ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            >
              {lihatSandi ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" style={{ color: "#dc2626", fontSize: 14, marginBottom: 16 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" id="ingat" className={styles.checkbox} />
            <label htmlFor="ingat" className={styles.checkboxLabel} style={{ margin: 0 }}>Ingat saya</label>
          </div>
          <Link href="/forgot-password" className={styles.forgotLink} style={{ margin: 0 }}>
            Lupa Sandi?
          </Link>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? (
            <>
              Memproses <Loader2 size={20} className="animate-spin" />
            </>
          ) : (
            <>
              Masuk <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>

      <p className={styles.footerText}>
        Belum punya akun? <Link href="/register">Daftar di sini</Link>
      </p>
    </div>
  );
}

/**
 * useSearchParams() memaksa client-side rendering, dan Next.js menolak
 * mem-prerender halaman yang memakainya tanpa batas Suspense. Tanpa wrapper
 * ini `npm run build` gagal di tahap prerender /login — build lokal lolos,
 * deploy yang jebol.
 */
export default function Login() {
  return (
    <Suspense
      fallback={
        <div className={styles.card}>
          <p className={styles.cardSubtitle}>Memuat…</p>
        </div>
      }
    >
      <FormLogin />
    </Suspense>
  );
}
