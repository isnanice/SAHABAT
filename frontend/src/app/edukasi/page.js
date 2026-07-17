"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { Search, X, ArrowLeft, BookOpen } from "lucide-react";
import HeaderPublic from "@/components/HeaderPublic";

const articles = [
  {
    id: 1,
    category: "KEAMANAN DIGITAL",
    title: "Mengenal Cyberbullying & Cara Menghadapinya",
    description:
      "Pahami bentuk, dampak, dan cara menghadapi cyberbullying agar tetap aman dan percaya diri di ruang digital.",
    imagePath: "/mengenalcyberbullying.png",
    isi: `
      <h2>Apa Itu Cyberbullying?</h2>
      <p>Cyberbullying adalah tindakan perundungan yang dilakukan melalui perangkat digital seperti ponsel, komputer, dan tablet melalui media sosial, pesan teks, platform game, dan aplikasi lainnya.</p>
      <h2>Bentuk-Bentuk Cyberbullying</h2>
      <p>Cyberbullying dapat terjadi dalam banyak bentuk, antara lain:</p>
      <ul>
        <li><strong>Flaming</strong> — Mengirim pesan marah atau kasar kepada seseorang secara online.</li>
        <li><strong>Harassment</strong> — Mengirim pesan yang menyinggung, kasar, atau mengancam secara berulang kali.</li>
        <li><strong>Denigration</strong> — Menyebarkan informasi palsu atau tidak benar tentang seseorang secara online.</li>
        <li><strong>Impersonation</strong> — Berpura-pura menjadi orang lain secara online.</li>
        <li><strong>Outing</strong> — Membagikan rahasia atau foto memalukan seseorang secara online tanpa izin.</li>
      </ul>
      <h2>Dampak Cyberbullying</h2>
      <p>Cyberbullying dapat berdampak serius pada kesehatan mental korban, termasuk:</p>
      <ul>
        <li>Kecemasan dan depresi</li>
        <li>Penurunan kepercayaan diri</li>
        <li>Masalah tidur</li>
        <li>Penurunan prestasi akademik</li>
      </ul>
      <h2>Cara Menghadapi Cyberbullying</h2>
      <p>Jika kamu mengalami cyberbullying, ada beberapa langkah yang bisa kamu lakukan:</p>
      <ol>
        <li><strong>Jangan membalas</strong> — Membalas pesan bully dapat memperburuk situasi.</li>
        <li><strong>Simpan buktinya</strong> — Ambil screenshot percakapan sebagai bukti.</li>
        <li><strong>Blokir pelaku</strong> — Gunakan fitur blokir di platform yang digunakan.</li>
        <li><strong>Ceritakan kepada orang dewasa</strong> — Orang tua, guru, atau konselor sekolah dapat membantumu.</li>
        <li><strong>Laporkan</strong> — Gunakan fitur laporan di platform, atau laporkan melalui sistem SAHABAT.</li>
      </ol>
    `,
  },
  {
    id: 2,
    category: "KESEHATAN MENTAL",
    title: "Pentingnya Kesehatan Mental bagi Remaja",
    description:
      "Kenali pentingnya menjaga kesehatan mental sejak dini untuk mendukung tumbuh kembang dan kesejahteraan remaja.",
    imagePath: "/pentingnyakesehatanmental.png",
    isi: `
      <h2>Mengapa Kesehatan Mental Itu Penting?</h2>
      <p>Kesehatan mental mencakup kesejahteraan emosional, psikologis, dan sosial kita. Kesehatan mental memengaruhi cara kita berpikir, merasa, dan bertindak. Ini juga membantu menentukan cara kita menangani stres, berhubungan dengan orang lain, dan membuat pilihan.</p>
      <h2>Tanda-Tanda Kesehatan Mental yang Baik</h2>
      <ul>
        <li>Merasa positif tentang diri sendiri</li>
        <li>Mampu berhubungan baik dengan orang lain</li>
        <li>Mampu mengelola perasaan dan emosi</li>
        <li>Mampu mengatasi perubahan dan ketidakpastian</li>
      </ul>
      <h2>Cara Menjaga Kesehatan Mental</h2>
      <ol>
        <li><strong>Tidur yang cukup</strong> — Remaja membutuhkan 8-10 jam tidur per malam.</li>
        <li><strong>Olahraga teratur</strong> — Aktivitas fisik dapat meningkatkan suasana hati.</li>
        <li><strong>Makan sehat</strong> — Nutrisi yang baik mendukung kesehatan otak.</li>
        <li><strong>Batasi waktu layar</strong> — Terlalu banyak waktu di depan layar dapat memengaruhi suasana hati.</li>
        <li><strong>Bicaralah dengan seseorang</strong> — Jangan memendam perasaan sendiri.</li>
      </ol>
      <h2>Kapan Harus Mencari Bantuan?</h2>
      <p>Jika kamu merasa sedih, cemas, atau tertekan secara berkelanjutan selama lebih dari dua minggu, pertimbangkan untuk berbicara dengan konselor sekolah atau tenaga profesional kesehatan mental.</p>
    `,
  },
  {
    id: 3,
    category: "DUKUNGAN SOSIAL",
    title: "Cara Mendukung Teman yang Sedang Kesulitan",
    description:
      "Menjadi pendengar yang baik dan memberikan dukungan emosional dapat membantu teman melewati masa sulit tanpa merasa sendirian.",
    imagePath: "/caramendukungteman.png",
    isi: `
      <h2>Mengapa Dukungan Sosial Itu Penting?</h2>
      <p>Memiliki teman yang suportif dapat membuat perbedaan besar dalam kehidupan seseorang. Dukungan sosial dapat membantu orang mengatasi stres, merasa lebih baik tentang diri mereka sendiri, dan merasa tidak sendirian.</p>
      <h2>Cara Menjadi Pendengar yang Baik</h2>
      <ul>
        <li><strong>Berikan perhatian penuh</strong> — Singkirkan ponselmu dan fokus pada temanmu.</li>
        <li><strong>Jangan menghakimi</strong> — Dengarkan tanpa memberikan penilaian atau kritik.</li>
        <li><strong>Validasi perasaannya</strong> — Akui bahwa perasaan mereka itu nyata dan valid.</li>
        <li><strong>Tanyakan apa yang mereka butuhkan</strong> — Apakah mereka ingin nasihat, atau hanya ingin didengar?</li>
      </ul>
      <h2>Hal yang Harus Dihindari</h2>
      <ol>
        <li>Jangan meminimalkan perasaan mereka ("Ah, itu cuma hal kecil")</li>
        <li>Jangan langsung menawarkan solusi tanpa ditanya</li>
        <li>Jangan membandingkan masalah mereka dengan masalah orang lain</li>
        <li>Jangan menyebarkan cerita mereka ke orang lain tanpa izin</li>
      </ol>
      <h2>Apa yang Bisa Kamu Katakan?</h2>
      <p>Beberapa kalimat yang bisa membantumu memulai percakapan:</p>
      <ul>
        <li><em>"Aku di sini untukmu, apapun yang kamu butuhkan."</em></li>
        <li><em>"Kamu tidak harus melalui ini sendirian."</em></li>
        <li><em>"Aku mungkin tidak mengerti sepenuhnya, tapi aku ingin mencoba mengerti."</em></li>
      </ul>
    `,
  },
];

export default function EdukasiPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const navItems = useMemo(
    () => [
      { label: "Beranda", href: "/", active: false },
      { label: "Tentang", href: "/tentang", active: false },
      { label: "Fitur", href: "/fitur", active: false },
      { label: "Edukasi", href: "/edukasi", active: true },
    ],
    [],
  );

  const footerLinks = useMemo(
    () => [
      { label: "Kontak Darurat", href: "/kontak-darurat" },
      { label: "Privasi & Data", href: "/privasi" },
    ],
    [],
  );

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase()),
  );

  // ── Modal Artikel ─────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className={styles.pageWrapper}>
        <HeaderPublic navItems={navItems} styles={styles} />
        <main className={styles.mainContent} id="main-content">
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 64px" }}>
            <button
              onClick={() => setSelected(null)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                color: "#3525CD", background: "none", border: "none",
                cursor: "pointer", fontWeight: 600, fontSize: 14,
                marginBottom: 24, padding: "8px 0",
              }}
            >
              <ArrowLeft size={18} /> Kembali ke Daftar Artikel
            </button>

            {/* Hero image */}
            <div style={{ position: "relative", height: 260, borderRadius: 20, overflow: "hidden", marginBottom: 28 }}>
              <Image src={selected.imagePath} alt={selected.title} fill style={{ objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5))" }} />
              <div style={{ position: "absolute", bottom: 20, left: 24, right: 24 }}>
                <span style={{ background: "#3525CD", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, letterSpacing: 1 }}>
                  {selected.category}
                </span>
              </div>
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111", marginBottom: 24, lineHeight: 1.35 }}>
              {selected.title}
            </h1>

            <div
              dangerouslySetInnerHTML={{ __html: selected.isi }}
              style={{ lineHeight: 1.9, color: "#374151", fontSize: 15 }}
              className="article-body"
            />

            <div style={{ marginTop: 40, padding: "20px 24px", background: "#F0F4FF", borderRadius: 16, display: "flex", alignItems: "center", gap: 12 }}>
              <BookOpen size={20} style={{ color: "#3525CD", flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: "#3525CD", fontWeight: 500 }}>
                Punya cerita atau masalah yang ingin kamu laporkan?{" "}
                <Link href="/lapor" style={{ fontWeight: 700, textDecoration: "underline" }}>
                  Lapor sekarang — 100% anonim
                </Link>
              </p>
            </div>
          </div>
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

        <style jsx global>{`
          .article-body h2 { font-size: 1.2rem; font-weight: 700; color: #111; margin: 1.5rem 0 0.6rem; }
          .article-body h3 { font-size: 1rem; font-weight: 600; color: #374151; margin: 1.2rem 0 0.4rem; }
          .article-body ul, .article-body ol { padding-left: 1.4rem; margin: 0.5rem 0 1rem; }
          .article-body li { margin-bottom: 0.4rem; }
          .article-body p { margin-bottom: 1rem; }
          .article-body strong { font-weight: 700; color: #1f2937; }
          .article-body em { font-style: italic; color: #4b5563; }
        `}</style>
      </div>
    );
  }

  // ── Daftar Artikel ─────────────────────────────────────────────────────────
  return (
    <div className={styles.pageWrapper}>
      <HeaderPublic navItems={navItems} styles={styles} />

      <main className={styles.mainContent} id="main-content">
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
              <BookOpen size={36} style={{ margin: "0 auto 12px" }} />
              <p style={{ fontWeight: 500 }}>Tidak ada artikel yang cocok dengan pencarian &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className={styles.articleGrid}>
              {filtered.map((article) => (
                <article key={article.id} className={styles.articleCard} style={{ cursor: "pointer" }} onClick={() => setSelected(article)}>
                  <div className={styles.articleImageWrap}>
                    <Image src={article.imagePath} alt={article.title} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div className={styles.articleContent}>
                    <span className={styles.articleCategory}>{article.category}</span>
                    <h3 className={styles.articleTitle}>{article.title}</h3>
                    <p className={styles.articleDesc}>{article.description}</p>
                    <span className={styles.articleLink} style={{ color: "#3525CD", fontWeight: 600, cursor: "pointer" }}>
                      Baca Selengkapnya →
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
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
