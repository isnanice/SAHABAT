"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../auth.module.css";

/**
 * Tujuan tautan reset dari email (redirectTo di forgot-password).
 *
 * Tanpa halaman ini, tautan di email mendarat di 404 dan alur reset tetap
 * putus — email terkirim, tapi tidak ada tempat mengganti sandinya.
 *
 * Supabase menukar token di URL jadi sesi sementara begitu halaman dimuat.
 * Sesi itu HANYA boleh dipakai mengganti sandi; karena itu setelah berhasil
 * kita signOut dan memaksa login ulang dengan sandi baru.
 */
export default function AturUlangSandi() {
  const router = useRouter();
  const [sandi, setSandi] = useState("");
  const [ulangi, setUlangi] = useState("");
  const [lihat, setLihat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [siap, setSiap] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    // Token di fragment URL ditukar jadi sesi oleh supabase-js saat halaman
    // dimuat. Kalau tidak ada sesi, tautannya kedaluwarsa atau sudah dipakai.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSiap(true);
      else
        setError(
          "Tautan ini tidak berlaku atau sudah kedaluwarsa. Minta tautan baru lewat halaman Lupa Kata Sandi."
        );
    });
  }, []);

  async function simpan(e) {
    e.preventDefault();
    if (loading) return;

    if (sandi.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    if (sandi !== ulangi) {
      setError("Kata sandi dan ulangannya tidak sama.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: errUbah } = await supabase.auth.updateUser({ password: sandi });

    if (errUbah) {
      // Kalau "Leaked password protection" aktif di dashboard Supabase,
      // sandi yang pernah bocor akan ditolak di sini — dan itu memang bagus.
      setError(
        /pwned|leaked|compromis/i.test(errUbah.message)
          ? "Kata sandi ini pernah bocor di kebocoran data lain. Pilih yang berbeda."
          : errUbah.message
      );
      setLoading(false);
      return;
    }

    // Sesi dari tautan email tidak dipakai untuk lanjut masuk — paksa login
    // ulang supaya sandi barunya benar-benar terbukti dipegang.
    await supabase.auth.signOut();
    router.push("/login?sandi=diperbarui");
  }

  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Image src="/logo.png" alt="SAHABAT Logo" width={32} height={32} style={{ height: "auto" }} />
        <span style={{ color: "var(--sahabat-ungu-tua)", fontWeight: "bold", fontSize: "18px" }}>SAHABAT</span>
      </div>

      <h2 className={styles.cardTitle}>Atur Ulang Kata Sandi</h2>
      <p className={styles.cardSubtitle}>
        Buat kata sandi baru untuk akun stafmu.
      </p>

      {error && (
        <p role="alert" style={{ color: "var(--sahabat-darurat)", fontSize: 14, marginBottom: 16 }}>
          {error}
        </p>
      )}

      {siap ? (
        <form onSubmit={simpan}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="sandi">Kata Sandi Baru</label>
            <div className={styles.passwordWrap}>
              <input
                id="sandi"
                type={lihat ? "text" : "password"}
                required
                autoComplete="new-password"
                value={sandi}
                onChange={(e) => setSandi(e.target.value)}
                className={styles.input}
                placeholder="Minimal 8 karakter"
              />
              <button
                type="button"
                onClick={() => setLihat((v) => !v)}
                className={styles.eyeIcon}
                style={{ background: "none", border: "none", cursor: "pointer" }}
                aria-label={lihat ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {lihat ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="ulangi">Ulangi Kata Sandi Baru</label>
            <input
              id="ulangi"
              type={lihat ? "text" : "password"}
              required
              autoComplete="new-password"
              value={ulangi}
              onChange={(e) => setUlangi(e.target.value)}
              className={styles.input}
              placeholder="Ketik ulang"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>Menyimpan <Loader2 size={20} className="animate-spin" /></>
            ) : (
              <>Simpan Kata Sandi <ArrowRight size={20} /></>
            )}
          </button>
        </form>
      ) : (
        <Link href="/forgot-password" style={{ textDecoration: "none" }}>
          <button type="button" className={styles.submitBtnOutline}>
            Minta tautan baru
          </button>
        </Link>
      )}
    </div>
  );
}
