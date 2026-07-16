"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./page.module.css";

export default function FiturPage() {
  const navItems = useMemo(
    () => [
      { label: "Beranda", href: "/", active: false },
      { label: "Tentang", href: "/tentang", active: false },
      { label: "Fitur", href: "/fitur", active: true },
      { label: "Edukasi", href: "/edukasi", active: false },
    ],
    [],
  );

  const featureTextCards = useMemo(
    () => [
      // Sinkron dengan kartu di app/page.js. `segera: true` = belum dibangun,
      // jadi tidak dirender sebagai link.
      {
        title: "Ruang Aman",
        description: "Bingung mulai cerita dari mana? Asisten AI membantumu menyusun kejadiannya jadi laporan yang jelas untuk Guru BK. Kamu tetap anonim, dan sesinya punya ujung.",
        iconPath: "/ruangaman.svg",
        iconBg: "#E9F1FF",
        href: "/ruang-aman",
        cta: "Mulai di Ruang Aman",
      },
      {
        title: "Lacak Laporan",
        description: "Pantau laporanmu pakai kode tiket. Lihat statusnya dan balasan Guru BK, tanpa login dan tanpa menyebut namamu.",
        iconPath: "/dukungansebaya.svg",
        iconBg: "#E0F9E8",
        href: "/cek-laporan",
        cta: "Cek Laporan Saya",
      },
      {
        title: "Ruang Dukungan Sebaya",
        description: "Forum moderasi tertutup tempat siswa saling mendukung, diawasi Guru BK.",
        iconPath: "/peersupporter.svg",
        iconBg: "#F3E8FF",
        segera: true,
      },
      {
        title: "Konseling BK",
        description: "Jadwal sesi tatap muka atau online dengan Guru BK, lewat tiket anonimmu.",
        iconPath: "/konselingbk.svg",
        iconBg: "#FFDAD6",
        segera: true,
      },
    ],
    [],
  );

  // Lihat catatan di app/page.js soal link footer yang dihapus.
  const footerLinks = useMemo(
    () => [
      { label: "Kontak Darurat", href: "/kontak-darurat" },
      { label: "Privasi & Data", href: "/privasi" },
    ],
    [],
  );

  return (
    <div className={styles.pageWrapper}>
      <header className={styles.header}>
        <a href="#main-content" className={styles.skipLink}>
          Lewati ke konten utama
        </a>
        <Link href="/" aria-label="SAHABAT home" className={styles.logoLink}>
          <div className={styles.logoImageWrap}>
            <Image src="/logo.png" alt="Logo SAHABAT" width={140} height={50} className={styles.logoImg} priority />
          </div>
        </Link>
        <nav aria-label="Navigasi utama" className={styles.navContainer}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={`${styles.navLink} ${item.active ? styles.navLinkActive : styles.navLinkInactive}`}>
              {item.label}
              {item.active && <div className={styles.navIndicator} aria-hidden="true" />}
            </Link>
          ))}
        </nav>
        <div className={styles.authButtons}>
          <Link href="/login" className={styles.loginBtn}>Masuk</Link>
          <Link href="/register" className={styles.signInBtn}>Daftar</Link>
        </div>
      </header>

      <main id="main-content" className={styles.mainContent}>
        <section className={styles.heroSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.heroIconWrap}>
              <Image src="/fiturfitur.svg" alt="Fitur" width={40} height={40} />
            </div>
            <h1 className={styles.sectionTitle}>Fitur-Fitur Sahabat</h1>
            <p className={styles.sectionDesc}>
              Kami merancang SAHABAT dengan fitur yang mengutamakan privasi, keamanan, dan kenyamanan Anda. Pelajari bagaimana kami dapat membantu.
            </p>
          </div>
        </section>

        <section className={styles.featuresSection}>
          {/* Main big feature */}
          <article className={styles.mainFeatureCard}>
            <div className={styles.mainFeatureContent}>
              <div className={styles.featureIconBox} style={{backgroundColor: featureTextCards[0].iconBg}}>
                <Image src={featureTextCards[0].iconPath} alt={featureTextCards[0].title} width={32} height={32} />
              </div>
              <h2 className={styles.mainFeatureTitle}>{featureTextCards[0].title}</h2>
              <p className={styles.mainFeatureDesc}>{featureTextCards[0].description}</p>
              {/* Kartu ini berjudul "Ruang Aman", jadi tombolnya harus ke
                  Ruang Aman. Sebelumnya menunjuk /lapor — judul satu fitur,
                  tujuan fitur lain. */}
              <Link href={featureTextCards[0].href} className={styles.primaryBtn}>
                {featureTextCards[0].cta}
              </Link>
            </div>
            <div className={styles.mainFeatureImageWrap}>
               <div className={styles.placeholderImage}>
                 <Image src="/ruangaman.png" alt="Ruang Aman" width={418} height={289} className={styles.mainFeatureImage} />
               </div>
            </div>
          </article>

          {/* Grid of features */}
          <div className={styles.featureGrid}>
            {featureTextCards.slice(1).map((card, i) => (
              <article key={i} className={styles.featureCard}>
                <div className={styles.featureIconBox} style={{backgroundColor: card.iconBg}}>
                  <Image src={card.iconPath} alt={card.title} width={32} height={32} />
                </div>
                <h3 className={styles.featureTitle}>{card.title}</h3>
                <p className={styles.featureDesc}>{card.description}</p>
                {card.href ? (
                  <Link href={card.href} className={styles.featureLink}>
                    {card.cta || "Pelajari Lebih Lanjut"} <ArrowUpRight size={20} />
                  </Link>
                ) : (
                  <span className={styles.featureLink} style={{ color: "#9ca3af", cursor: "default" }}>
                    Segera hadir
                  </span>
                )}
              </article>
            ))}
          </div>

          <div className={styles.ctaBanner}>
             <h2 className={styles.ctaTitle}>Sudah Siap Memulai Belum?</h2>
             <p className={styles.ctaDesc}>Gunakan fitur kami sekarang dan ambil langkah pertama menuju ruang yang lebih aman untuk bercerita.</p>
             <Link href="/lapor" className={styles.ctaBtn}>Lapor Sekarang</Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer} role="contentinfo">
        <div className={styles.footerInner}>
          <p className={styles.footerCopyright}>© 2024 SAHABAT - Sahabat Anti-Bullying dan Bantuan Terpadu</p>
          <nav aria-label="Tautan footer" className={styles.footerNav}>
            {footerLinks.map((link, index) => (
              <span key={link.href} className={styles.footerLinkWrap}>
                <Link href={link.href} className={styles.footerLink}>{link.label}</Link>
                {index < footerLinks.length - 1 && <span className={styles.footerDot}>•</span>}
              </span>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
