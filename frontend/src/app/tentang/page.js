"use client";

import { useMemo } from "react";
import { 
  Eye, 
  Shield, 
  HeartHandshake, 
  User, 
  Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function TentangPage() {
  const navItems = useMemo(
    () => [
      { label: "Beranda", href: "/", active: false },
      { label: "Tentang", href: "/tentang", active: true },
      { label: "Fitur", href: "/fitur", active: false },
      { label: "Edukasi", href: "/edukasi", active: false },
    ],
    [],
  );

  // Empat tautan mengikuti desain citra (lihat catatan di app/page.js).
  const footerLinks = useMemo(
    () => [
      { label: "Kebijakan Privasi", href: "/privasi" },
      { label: "Syarat & Ketentuan", href: "/privasi" },
      { label: "Kontak Darurat", href: "/kontak-darurat" },
      { label: "Pusat Bantuan", href: "/kontak-darurat" },
    ],
    [],
  );

  const misiCards = useMemo(
    () => [
      {
        title: "Perlindungan Anonim",
        text: "Menyediakan saluran pelaporan yang aman dan terenkripsi untuk mencegah retaliasi.",
        iconPath: "/perlindungananonim.svg",
        iconBg: "var(--sahabat-garis)", 
      },
      {
        title: "Dukungan Sebaya",
        text: "Membangun komunitas siswa yang peduli dan siap mendengarkan cerita teman sebayanya.",
        iconPath: "/dukungansebaya.svg",
        iconBg: "var(--sahabat-garis)", 
      },
      {
        title: "Intervensi Profesional",
        text: "Menghubungkan kasus-kasus yang membutuhkan perhatian khusus langsung ke Guru BK dengan data yang akurat dan terstruktur.",
        iconPath: "/intervensiprofesional.svg",
        iconBg: "var(--sahabat-garis)", 
      },
    ],
    [],
  );

  const mengapaCards = useMemo(
    () => [
      {
        number: "1",
        title: "Saluran Aman & Terpercaya",
        text: "Banyak kasus perundungan tidak terlaporkan karena siswa merasa takut atau tidak memiliki saluran yang tepat.",
      },
      {
        number: "2",
        title: "Pemetaan Dinamika Sosial",
        text: "Guru BK seringkali kesulitan memetakan dinamika sosial siswa secara real-time tanpa alat bantu digital.",
      },
      {
        number: "3",
        title: "Intervensi Dini & Cepat",
        text: "Kebutuhan akan intervensi dini sebelum masalah eskalasi menjadi krisis kesehatan mental.",
      },
    ],
    [],
  );

  const timCards = useMemo(
    () => [
      {
        title: "Konselor (Guru BK)",
        text: "Tenaga pendidik profesional yang siap menganalisa laporan, memberikan konseling lanjutan, dan merancang program pencegahan komprehensif.",
        iconPath: "/konselor.svg",
        iconBg: "#E7F0FF",
        badgeText: "Profesional Terlatih",
        badgeIconPath: "/profesionalterlatih.svg",
        badgeColor: "var(--sahabat-ungu)",
        badgeBg: "#E9F1FF",
      },
      {
        title: "Peer Supporter",
        text: "Siswa terpilih yang dilatih untuk menjadi pendengar yang baik, memberikan empati, dan mendampingi teman sebaya dalam keseharian di sekolah.",
        iconPath: "/peersupporter.svg",
        iconBg: "#E7F0FF",
        badgeText: "Teman Cerita",
        badgeIconPath: "/temancerita.svg",
        badgeColor: "#16a34a",
        badgeBg: "#E0F9E8",
      },
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
            <Image 
              src="/logo.png" 
              alt="Logo SAHABAT" 
              width={140} 
              height={50} 
              className={styles.logoImg}
              priority
            />
          </div>
        </Link>
        
        <nav aria-label="Navigasi utama" className={styles.navContainer}>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`${styles.navLink} ${item.active ? styles.navLinkActive : styles.navLinkInactive}`}
            >
              {item.label}
              {item.active && <div className={styles.navIndicator} aria-hidden="true" />}
            </Link>
          ))}
        </nav>
        
        <div className={styles.authButtons}>
          <Link href="/login" className={styles.loginBtn}>
            Masuk
          </Link>
          <Link href="/register" className={styles.signInBtn}>
            Daftar
          </Link>
        </div>
      </header>

      <main id="main-content" className={styles.mainContent}>
        
        {/* HERO SECTION */}
        <section aria-labelledby="hero-heading" className={styles.heroSection}>
          <div className={styles.heroContentContainer}>
            <div className={styles.heroLeft}>
              <h1 id="hero-heading" className={styles.heroTitle}>
                Mewujudkan Sekolah<br />Bebas dari Perundungan
              </h1>
              <p className={styles.heroDesc}>
                SAHABAT hadir sebagai ruang aman bagi siswa untuk melaporkan perundungan 
                secara anonim, memperoleh pendampingan, dan mendapatkan bantuan yang 
                mereka butuhkan tanpa rasa takut.
              </p>
            </div>
            
            <div className={styles.heroRight}>
              <div className={styles.heroImageWrap}>
                <Image 
                  src="/stop-bullying.png" 
                  alt="Stop Bullying" 
                  width={500} 
                  height={500}
                  className={styles.heroImage}
                />
              </div>
            </div>
          </div>
        </section>

        {/* VISI & MISI SECTION */}
        <section aria-labelledby="visi-misi-heading" className={styles.visiMisiSection}>
          <div className={styles.sectionHeader}>
            <h2 id="visi-misi-heading" className={styles.sectionTitle}>
              Visi & Misi Kami
            </h2>
          </div>
          
          <div className={styles.visiContainer}>
            <div className={styles.dividerTitle}>
              <span>Visi</span>
            </div>
            <article className={styles.visiCard}>
              <div className={styles.visiIconWrap} style={{backgroundColor: "var(--sahabat-garis)"}}>
                <Image src="/visi.svg" alt="Visi" width={36} height={36} />
              </div>
              <p className={styles.visiDesc}>
                Menjadi platform perlindungan siswa terdepan di Indonesia yang memastikan 
                setiap anak memiliki ruang digital yang aman, anonim, dan terpercaya untuk 
                menyuarakan keresahan, melaporkan perundungan, serta memperoleh dukungan 
                yang dibutuhkan tanpa rasa takut.
              </p>
            </article>
          </div>

          <div className={styles.misiContainer}>
            <div className={styles.dividerTitle}>
              <span>Misi</span>
            </div>
            <div className={styles.misiGrid}>
              {misiCards.map((card, i) => {
                return (
                  <article key={i} className={styles.misiCard}>
                    <div className={styles.misiIconWrap} style={{backgroundColor: card.iconBg}}>
                      <Image src={card.iconPath} alt={card.title} width={28} height={28} />
                    </div>
                    <h3 className={styles.misiTitle}>{card.title}</h3>
                    <p className={styles.misiDesc}>{card.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* MENGAPA KAMI ADA SECTION */}
        <section aria-labelledby="mengapa-heading" className={styles.mengapaSection}>
          <div className={styles.sectionHeader}>
            <h2 id="mengapa-heading" className={styles.sectionTitle}>
              Mengapa Kami Ada
            </h2>
          </div>
          
          <div className={styles.mengapaGrid}>
            {mengapaCards.map((card, i) => (
              <article key={i} className={styles.mengapaCard}>
                <div className={styles.mengapaNumber}>
                  {card.number}
                </div>
                <h3 className={styles.mengapaTitle}>{card.title}</h3>
                <p className={styles.mengapaDesc}>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* TIM DUKUNGAN KAMI SECTION */}
        <section aria-labelledby="tim-heading" className={styles.timSection}>
          <div className={styles.sectionHeader}>
            <h2 id="tim-heading" className={styles.sectionTitle}>
              Tim Dukungan Kami
            </h2>
          </div>
          
          <div className={styles.timGrid}>
            {timCards.map((card, i) => {
              return (
                <article key={i} className={styles.timCard}>
                  <div className={styles.timIconWrap} style={{backgroundColor: card.iconBg}}>
                    <Image src={card.iconPath} alt={card.title} width={36} height={36} />
                  </div>
                  <h3 className={styles.timTitle}>{card.title}</h3>
                  <p className={styles.timDesc}>{card.text}</p>
                  <div 
                    className={styles.timBadge} 
                    style={{backgroundColor: card.badgeBg, color: card.badgeColor}}
                  >
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px'}}>
                      <Image src={card.badgeIconPath} alt={card.badgeText} width={14} height={14} />
                    </div>
                    {card.badgeText}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className={styles.footer} role="contentinfo">
        <div className={styles.footerInner}>
          <p className={styles.footerCopyright}>
            © 2026 SAHABAT - Sahabat Anti-Bullying dan Bantuan Terpadu
          </p>
          <nav aria-label="Tautan footer" className={styles.footerNav}>
            {footerLinks.map((link, index) => (
              <span key={`${link.label}-${index}`} className={styles.footerLinkWrap}>
                <Link href={link.href} className={styles.footerLink}>{link.label}</Link>
                {index < footerLinks.length - 1 && (
                  <span className={styles.footerDot}>•</span>
                )}
              </span>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
