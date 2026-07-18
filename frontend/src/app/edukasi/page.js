"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { Search } from "lucide-react";

/**
 * Halaman Edukasi & Tips — mengikuti desain citra.
 *
 * Filter topik, kotak cari, "Baca Artikel", dan "Muat Lebih Banyak" DIPASANG
 * KEMBALI sesuai desain — tapi semuanya benar-benar bekerja, bukan hiasan:
 *   - pill topik menyaring kartu (client-side, nyata)
 *   - kotak cari menyaring judul & isi
 *   - "Baca Artikel" membentangkan isi artikel di tempat (bukan link mati)
 *   - "Muat Lebih Banyak" menampilkan artikel berikutnya; hilang saat habis
 *
 * Tidak ada tombol yang menyala lalu diam. Kalau nanti modul edukasi punya
 * halaman artikel sungguhan, "Baca Artikel" tinggal diarahkan ke sana.
 */
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

  // Label persis pill di desain.
  const topics = useMemo(
    () => [
      "Semua Topik",
      "Bullying",
      "Kesehatan Mental",
      "Dukungan Sosial",
      "Keamanan Digital",
      "Pengembangan Diri",
    ],
    [],
  );

  const articles = useMemo(
    () => [
      {
        category: "Keamanan Digital",
        title: "Mengenal Cyberbullying & Cara Menghadapinya",
        description:
          "Pahami bentuk, dampak, dan cara menghadapi cyberbullying agar tetap aman dan percaya diri di ruang digital.",
        body: "Cyberbullying bisa berupa ejekan di grup chat, penyebaran foto tanpa izin, atau akun palsu yang mempermalukanmu. Langkah pertama: jangan membalas. Simpan buktinya (screenshot), blokir pelakunya, dan ceritakan ke orang yang kamu percaya. Kamu juga bisa melapor lewat RuangAman tanpa menyebut namamu — Guru BK akan menindaklanjuti tanpa membuatmu terekspos.",
        imagePath: "/mengenalcyberbullying.png",
      },
      {
        category: "Kesehatan Mental",
        title: "Pentingnya Kesehatan Mental bagi Remaja",
        description:
          "Kenali pentingnya menjaga kesehatan mental sejak dini untuk mendukung tumbuh kembang dan kesejahteraan remaja.",
        body: "Kesehatan mental sama pentingnya dengan kesehatan fisik. Perasaan cemas, sedih berkepanjangan, atau kehilangan minat bukan tanda kelemahan — itu sinyal tubuh yang perlu didengar. Tidur cukup, bergerak, dan berbicara dengan seseorang membantu. Kalau perasaan itu terasa berat, menghubungi Guru BK atau konselor adalah langkah berani, bukan memalukan.",
        imagePath: "/pentingnyakesehatanmental.png",
      },
      {
        category: "Dukungan Sosial",
        title: "Cara Mendukung Teman yang Sedang Kesulitan",
        description:
          "Menjadi pendengar yang baik dan memberikan dukungan emosional dapat membantu teman melewati masa sulit tanpa merasa sendirian.",
        body: "Kamu tidak perlu punya semua jawaban untuk membantu teman. Sering kali yang paling menolong hanyalah mendengar tanpa menghakimi dan berkata \"aku ada untukmu\". Hindari buru-buru memberi nasihat atau berkata \"ah, gitu doang\". Kalau temanmu menunjukkan tanda bahaya (menyakiti diri, ingin menyerah), ajak dia bicara ke orang dewasa yang dipercaya secepatnya.",
        imagePath: "/caramendukungteman.png",
      },
      {
        category: "Bullying",
        title: "Kenali Jenis-Jenis Perundungan di Sekolah",
        description:
          "Perundungan tidak selalu berupa kekerasan fisik. Kenali bentuk verbal, sosial, dan siber agar bisa mengenalinya sejak awal.",
        body: "Perundungan punya banyak wajah: fisik (memukul, mendorong), verbal (mengejek, mengancam), sosial (mengucilkan, menyebar gosip), dan siber (menyerang lewat media digital). Semuanya sama seriusnya. Mengenali bentuknya adalah langkah pertama untuk berhenti menganggapnya \"bercandaan biasa\" dan mulai melaporkannya.",
        imagePath: "/mengenalcyberbullying.png",
      },
      {
        category: "Pengembangan Diri",
        title: "Membangun Rasa Percaya Diri Setelah Dirundung",
        description:
          "Pulih dari perundungan butuh waktu. Beberapa langkah kecil bisa membantumu membangun kembali rasa percaya diri.",
        body: "Perundungan bisa meninggalkan bekas pada cara kita memandang diri sendiri. Mulailah dari hal kecil: kenali satu hal yang kamu kuasai, kelilingi dirimu dengan orang yang mendukung, dan izinkan dirimu merasa marah atau sedih — itu wajar. Pemulihan bukan garis lurus; hari buruk bukan berarti gagal.",
        imagePath: "/pentingnyakesehatanmental.png",
      },
      {
        category: "Kesehatan Mental",
        title: "Mengelola Kecemasan Sebelum Ujian",
        description:
          "Cemas menjelang ujian itu normal. Kenali cara sederhana untuk menenangkan pikiran dan tetap fokus.",
        body: "Detak jantung cepat dan pikiran kalut sebelum ujian adalah reaksi tubuh yang wajar. Teknik pernapasan 4-7-8 (tarik 4 detik, tahan 7, embuskan 8) bisa menenangkan. Belajar bertahap jauh lebih efektif daripada sistem kebut semalam. Dan ingat: satu nilai tidak menentukan nilaimu sebagai manusia.",
        imagePath: "/caramendukungteman.png",
      },
    ],
    [],
  );

  const footerLinks = useMemo(
    () => [
      { label: "Kebijakan Privasi", href: "/privasi" },
      { label: "Syarat & Ketentuan", href: "/privasi" },
      { label: "Kontak Darurat", href: "/kontak-darurat" },
      { label: "Pusat Bantuan", href: "/kontak-darurat" },
    ],
    [],
  );

  const [topikAktif, setTopikAktif] = useState("Semua Topik");
  const [cari, setCari] = useState("");
  const [jmlTampil, setJmlTampil] = useState(3);
  const [dibuka, setDibuka] = useState(null);

  // Penyaringan nyata: topik + kata kunci.
  const terfilter = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return articles.filter((a) => {
      const cocokTopik = topikAktif === "Semua Topik" || a.category === topikAktif;
      const cocokCari =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);
      return cocokTopik && cocokCari;
    });
  }, [articles, topikAktif, cari]);

  const tampil = terfilter.slice(0, jmlTampil);
  const masihAda = jmlTampil < terfilter.length;

  function gantiTopik(t) {
    setTopikAktif(t);
    setJmlTampil(3);
    setDibuka(null);
  }

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
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cari artikel yang ingin dibaca"
              value={cari}
              onChange={(e) => { setCari(e.target.value); setJmlTampil(3); }}
            />
          </div>

          <div className={styles.filterWrap}>
            {topics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => gantiTopik(t)}
                className={`${styles.filterBtn} ${topikAktif === t ? styles.filterBtnActive : ""}`}
                aria-pressed={topikAktif === t}
              >
                {t}
              </button>
            ))}
          </div>

          {tampil.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--sahabat-teks-redup)", padding: "40px 0" }}>
              Tidak ada artikel yang cocok. Coba kata kunci atau topik lain.
            </p>
          ) : (
            <div className={styles.articleGrid}>
              {tampil.map((article, i) => {
                const terbuka = dibuka === article.title;
                return (
                  <article key={i} className={styles.articleCard}>
                    <div className={styles.articleImageWrap}>
                      <Image src={article.imagePath} alt={article.title} fill style={{ objectFit: "cover" }} />
                    </div>
                    <div className={styles.articleContent}>
                      <span className={styles.articleCategory}>{article.category.toUpperCase()}</span>
                      <h3 className={styles.articleTitle}>{article.title}</h3>
                      <p className={styles.articleDesc}>
                        {terbuka ? article.body : article.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => setDibuka(terbuka ? null : article.title)}
                        className={styles.articleLink}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        aria-expanded={terbuka}
                      >
                        {terbuka ? "Tutup ←" : "Baca Artikel →"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {masihAda && (
            <div className={styles.loadMoreWrap}>
              <button type="button" className={styles.loadMoreBtn} onClick={() => setJmlTampil((n) => n + 3)}>
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerCopyright}>© 2026 SAHABAT - Sahabat Anti-Bullying dan Bantuan Terpadu</p>
          <nav aria-label="Tautan footer" className={styles.footerNav}>
            {footerLinks.map((link, index) => (
              <span key={`${link.label}-${index}`} className={styles.footerLinkWrap}>
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
