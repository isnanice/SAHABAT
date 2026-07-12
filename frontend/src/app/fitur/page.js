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
      {
        title: "Ruang Aman",
        description: "Privasi Anda adalah prioritas utama kami. Fitur Curhat Anonim memastikan identitas kamu terlindungi saat melaporkan atau berbagi masalah.",
        iconPath: "/ruangaman.svg",
        iconBg: "#E9F1FF",
      },
      {
        title: "Lapor Insiden",
        description: "Buat laporan resmi terkait masalah yang kamu alami untuk ditindaklanjuti secara profesional oleh Guru BK.",
        iconPath: "/laporinsiden.svg",
        iconBg: "#FEF3DB",
      },
      {
        title: "Ruang Dukungan Sebaya",
        description: "Forum moderasi tertutup di mana siswa dapat saling memberikan dukungan emosional secara aman.",
        iconPath: "/dukungansebaya.svg",
        iconBg: "#E0F9E8",
      },
      {
        title: "Konseling BK",
        description: "Jadwal sesi dengan Guru BK, pilih tatap muka atau online. Identitas terlindungi sepenuhnya.",
        iconPath: "/konselingbk.svg",
        iconBg: "#FFDAD6",
      },
    ],
    [],
  );

  const footerLinks = useMemo(
    () => ["Kebijakan Privasi", "Syarat & Ketentuan", "Kontak Darurat", "Pusat Bantuan"],
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
          <Link href="/login" className={styles.loginBtn}>Login</Link>
          <Link href="/login" className={styles.signInBtn}>Sign In</Link>
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
              <Link href="/siswa/lapor" className={styles.primaryBtn}>
                Mulai Curhat Sekarang
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
                <Link href="#pelajari-lebih-lanjut" className={styles.featureLink}>
                  Pelajari Lebih Lanjut <ArrowUpRight size={20} />
                </Link>
              </article>
            ))}
          </div>

          <div className={styles.ctaBanner}>
             <h2 className={styles.ctaTitle}>Sudah Siap Memulai Belum?</h2>
             <p className={styles.ctaDesc}>Gunakan fitur kami sekarang dan ambil langkah pertama menuju ruang yang lebih aman untuk bercerita.</p>
             <Link href="/siswa/lapor" className={styles.ctaBtn}>Mulai Curhat</Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer} role="contentinfo">
        <div className={styles.footerInner}>
          <p className={styles.footerCopyright}>© 2024 SAHABAT - Sahabat Anti-Bullying dan Bantuan Terpadu</p>
          <nav aria-label="Tautan footer" className={styles.footerNav}>
            {footerLinks.map((link, index) => (
              <span key={link} className={styles.footerLinkWrap}>
                <Link href="#" className={styles.footerLink}>{link}</Link>
                {index < footerLinks.length - 1 && <span className={styles.footerDot}>•</span>}
              </span>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
