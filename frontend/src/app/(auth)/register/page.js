"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, UserCog } from "lucide-react";
import styles from "../auth.module.css";

/**
 * Halaman "Daftar".
 *
 * Dulu form pendaftaran lengkap — tapi sepenuhnya statis: tanpa state, tanpa
 * submit handler, tanpa panggilan Supabase. Tombolnya ada, tidak mendaftarkan
 * siapa pun.
 *
 * Yang lebih mendasar: form itu tidak punya pengguna.
 *
 *   - Siswa TIDAK butuh akun. Seluruh jalur pelaporan anonim tanpa login —
 *     itu inti produknya. Menyuruh anak membuat akun untuk melapor justru
 *     menghancurkan hal yang membuatnya aman: identitas yang tidak ada.
 *   - Staf sekolah TIDAK boleh mendaftar sendiri. Migrasi 002 memaksa semua
 *     pendaftaran mandiri jadi SISWA, karena versi lama menyalin `role` dari
 *     metadata pendaftar — siapa pun bisa signUp({ role: 'GURU_BK' }) dengan
 *     anon key yang publik dan langsung membaca seluruh laporan sekolah.
 *
 * Jadi form itu, kalau disambungkan, cuma akan membuat akun SISWA yang tidak
 * punya dashboard dan tidak ada gunanya. Halaman ini menjelaskannya apa adanya.
 */
export default function Register() {
  return (
    <div className={styles.card}>
      <div className={styles.logoWrap}>
        <Image src="/logo.png" alt="SAHABAT Logo" width={32} height={32} style={{ height: "auto" }} />
        <span style={{ color: "#1e40af", fontWeight: "bold", fontSize: "18px" }}>SAHABAT</span>
      </div>

      <h2 className={styles.cardTitle}>Kamu tidak perlu daftar</h2>
      <p className={styles.cardSubtitle}>
        SAHABAT sengaja dibuat tanpa akun untuk siswa. Justru karena tidak ada
        akun, tidak ada yang bisa mengaitkan laporan ke dirimu.
      </p>

      <div className={styles.tabs}>
        <Link href="/login" className={styles.tab}>Masuk</Link>
        <div className={`${styles.tab} ${styles.active}`}>Daftar</div>
      </div>

      <div
        style={{
          border: "1px solid #e5e7f5",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <ShieldCheck size={22} style={{ color: "#4f46e5", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 700, color: "#111827", marginBottom: 6 }}>Kalau kamu siswa</p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#4b5563", marginBottom: 14 }}>
              Langsung lapor saja. Tanpa email, tanpa kata sandi, tanpa nama.
              Kamu akan dapat kode tiket untuk memantau laporanmu.
            </p>
            <Link href="/lapor" className={styles.submitBtn} style={{ textDecoration: "none" }}>
              Lapor Sekarang <ArrowRight size={20} />
            </Link>
            <p style={{ fontSize: 13, color: "#6b7280", marginTop: 12, textAlign: "center" }}>
              Bingung mulai dari mana?{" "}
              <Link href="/ruang-aman" style={{ color: "#4f46e5", fontWeight: 500 }}>
                Coba Ruang Aman
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          border: "1px solid #e5e7f5",
          borderRadius: 16,
          padding: 20,
          background: "#f5f7ff",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <UserCog size={22} style={{ color: "#6b7280", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 700, color: "#111827", marginBottom: 6 }}>
              Kalau kamu Guru BK atau pihak sekolah
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#4b5563" }}>
              Akun staf tidak bisa dibuat sendiri lewat halaman ini — itu
              disengaja. Kalau siapa pun bisa mendaftar sebagai Guru BK, siapa
              pun bisa membaca laporan anak. Hubungi admin sekolah untuk dibuatkan
              akun, lalu{" "}
              <Link href="/login" style={{ color: "#4f46e5", fontWeight: 500 }}>
                masuk di sini
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <p className={styles.footerText} style={{ marginTop: 24 }}>
        Butuh bantuan segera?{" "}
        <Link href="/kontak-darurat" style={{ color: "#dc2626", fontWeight: 600 }}>
          Kontak Darurat
        </Link>
      </p>
    </div>
  );
}
