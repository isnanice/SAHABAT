"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { Search } from "lucide-react";

export default function EdukasiPage() {
  const navItems = useMemo(
    () => [
      { label: "Beranda", href: "/", active: false },
      { label: "Tentang", href: "/tentang", active: false },
      { label: "Fitur", href: "/fitur", active: false },
      { label: "Edukasi", href: "/edukasi", active: true },
    ],
    [],
  );

  const articles = useMemo(
    () => [
      {
        category: "KEAMANAN DIGITAL",
        title: "Mengenal Cyberbullying & Cara Menghadapinya",
        description: "Pahami bentuk, dampak, dan cara menghadapi cyberbullying agar tetap aman dan percaya diri di ruang digital.",
        imagePath: "/mengenalcyberbullying.png",
      },
      {
        category: "KESEHATAN MENTAL",
        title: "Pentingnya Kesehatan Mental bagi Remaja",
        description: "Kenali pentingnya menjaga kesehatan mental sejak dini untuk mendukung tumbuh kembang dan kesejahteraan remaja.",
        imagePath: "/pentingnyakesehatanmental.png",
      },
      {
        category: "DUKUNGAN SOSIAL",
        title: "Cara Mendukung Teman yang Sedang Kesulitan",
        description: "Menjadi pendengar yang baik dan memberikan dukungan emosional dapat membantu teman melewati masa sulit tanpa merasa sendirian.",
        imagePath: "/caramendukungteman.png",
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
          <Link href="/login" className={styles.signInBtn}>Daftar</Link>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.heroSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.heroIconWrap}>
              <Image src="/edukasitips.svg" alt="Edukasi & Tips" width={40} height={40} />
            </div>
            <h1 className={styles.sectionTitle}>Edukasi & Tips</h1>
            <p className={styles.sectionDesc}>
              Temukan berbagai artikel, modul, dan tips untuk menjaga kesehatan mental dan menciptakan lingkungan yang aman bagi semua.
            </p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <div className={styles.searchWrap}>
            <Search className={styles.searchIcon} size={20} />
            <input type="text" className={styles.searchInput} placeholder="Cari artikel yang ingin dibaca" />
          </div>

          {/* Filter topik dihapus: belum ada logika penyaringnya, dan hanya ada
              3 artikel. Tombol yang menyala saat diklik tapi tidak mengubah
              apa pun lebih membingungkan daripada tidak ada tombol.
              Kembalikan bersama filter yang sungguhan saat modul edukasi dibangun. */}

          <div className={styles.articleGrid}>
            {articles.map((article, i) => (
              <article key={i} className={styles.articleCard}>
                <div className={styles.articleImageWrap}>
                  <Image src={article.imagePath} alt={article.title} layout="fill" objectFit="cover" />
                </div>
                <div className={styles.articleContent}>
                  <span className={styles.articleCategory}>{article.category}</span>
                  <h3 className={styles.articleTitle}>{article.title}</h3>
                  <p className={styles.articleDesc}>{article.description}</p>
                  {/* Halaman artikelnya belum dibangun (modul edukasi di-skip
                      untuk demo sesuai rencana). Sebelumnya href="#baca" —
                      terlihat seperti link, tidak melakukan apa pun. */}
                  <span className={styles.articleLink} style={{ color: '#9ca3af', cursor: 'default' }}>
                    Segera hadir
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* Tombol "Muat Lebih Banyak" dihapus: tidak ada artikel lain untuk
              dimuat, dan tombol yang diklik lalu diam membuat pengguna mengira
              situsnya rusak. */}
        </section>
      </main>

      <footer className={styles.footer}>
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
