"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

/**
 * Login siswa — halaman /masuk.
 *
 * Siswa yang sudah mendaftar bisa langsung masuk di sini dengan email dan
 * kata sandi yang sudah didaftarkan. Setelah masuk, diarahkan ke landing page.
 *
 * Staf sekolah (Guru BK / Kepala Sekolah) masuk lewat /login, bukan di sini.
 */
function FormMasuk() {
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

    if (profil.role !== "SISWA") {
      await supabase.auth.signOut();
      setError("Halaman ini khusus siswa. Staf sekolah silakan masuk melalui /login");
      setLoading(false);
      return;
    }

    router.push(params.get("redirect") || "/");
    router.refresh();
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Image src="/logo1.svg" alt="SAHABAT Logo" width={140} height={40} style={{ height: "auto" }} />
      </div>

      <h2 className={styles.cardTitle}>Masuk ke Akun</h2>
      <p className={styles.cardSubtitle}>
        Masuk untuk mengakses layanan konseling bersama Guru BK secara aman dan rahasia.
      </p>

      {params.get("ganti") === "1" && (
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: "#92400e",
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}
        >
          Masih ada akun yang sedang masuk di perangkat ini.{" "}
          <Link href="/keluar" style={{ color: "#4f46e5", fontWeight: 600 }}>
            Keluar dulu
          </Link>{" "}
          sebelum masuk dengan akun lain.
        </p>
      )}

      <div className={styles.tabs}>
        <div className={`${styles.tab} ${styles.active}`}>Masuk</div>
        <Link href="/daftar" className={styles.tab}>Daftar</Link>
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
              className={`${styles.input} ${styles.inputPassword}`}
              placeholder="Minimal 8 karakter"
            />
            <button
              type="button"
              onClick={() => setLihatSandi((v) => !v)}
              className={styles.eyeBtn}
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
        Belum punya akun? <Link href="/daftar">Daftar di sini</Link>
      </p>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.card}>
          <p className={styles.cardSubtitle}>Memuat…</p>
        </div>
      }
    >
      <FormMasuk />
    </Suspense>
  );
}
