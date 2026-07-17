"use client";

import { useMemo, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowUpRight, 
  Users, 
  User, 
  Brain, 
  FileText, 
  HeartHandshake, 
  Lock, 
  ShieldOff, 
  GraduationCap,
  MessageCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function RedesignLanding() {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setShowDropdown(false);
  }

  const navItems = useMemo(
    () => [
      { label: "Beranda", href: "/", active: true },
      { label: "Tentang", href: "/tentang", active: false },
      { label: "Fitur", href: "/fitur", active: false },
      { label: "Edukasi", href: "/edukasi", active: false },
    ],
    [],
  );

  const reasonCards = useMemo(
    () => [
      {
        title: "Takut Identitas Terungkap",
        // "memastikan identitas kamu aman" adalah janji yang tidak bisa
        // ditepati sistem: kami bisa tidak menyimpan namamu, tapi tidak bisa
        // mencegah ceritamu sendiri menunjukkan siapa kamu. Klaim yang tepat
        // itu spesifik, dan justru lebih menenangkan karena bisa dibuktikan.
        text: "Kamu tidak perlu login dan tidak perlu menulis namamu — sistem ini memang tidak menyimpan siapa kamu. Kamu yang memutuskan apa saja yang ingin diceritakan.",
        iconPath: "/takutidentitasterungkap.svg",
        iconBg: "#E0F9E8", 
      },
      {
        title: "Takut Pembalasan",
        text: "Laporan kamu langsung masuk ke konselor sekolah secara rahasia, memungkinkan tindakan pencegahan yang bijaksana tanpa membahayakanmu.",
        iconPath: "/takutpembalasan.svg",
        iconBg: "#FFDAD6", 
      },
      {
        title: "Merasa Sendiri & Lemah",
        text: "Kamu tidak sendiri, banyak yang peduli dan siap membantu. Kami menghubungkan kamu dengan dukungan profesional dan teman sebaya.",
        iconPath: "/merasasendiri&lemah.svg",
        iconBg: "#FEF3DB", 
      },
    ],
    [],
  );

  const featureTextCards = useMemo(
    () => [
      // `href` menentukan tujuan; `segera: true` menandai fitur yang BELUM
      // dibangun. Sebelumnya keempat kartu memakai href="#pelajari-lebih-lanjut"
      // yang tidak menuju ke mana pun — termasuk kartu Ruang Aman, sehingga
      // chatbot-nya tidak terjangkau dari seluruh situs.
      //
      // Kartu tanpa `href` SENGAJA tidak dirender sebagai link. Mengarahkan
      // "Pelajari Lebih Lanjut" ke halaman kosong lebih buruk daripada jujur
      // bilang belum ada — juri yang mengklik dan mendarat di stub akan
      // meragukan seluruh demo, bukan cuma fitur itu.
      {
        title: "Ruang Aman",
        description: "Bingung mulai cerita dari mana? Asisten AI membantumu menyusun kejadiannya jadi laporan yang jelas untuk Guru BK. Kamu tetap anonim, dan sesinya punya ujung — bukan ngobrol tanpa akhir.",
        iconPath: "/ruangaman.svg",
        iconBg: "#E9F1FF",
        imagePath: "/ruangaman.png",
        isLarge: true,
        href: "/ruang-aman",
        cta: "Mulai di Ruang Aman",
      },
      {
        title: "Lacak Laporan",
        description: "Pantau laporanmu pakai kode tiket. Lihat statusnya dan balasan Guru BK, tanpa perlu login dan tanpa menyebut namamu.",
        iconPath: "/ruangdukungansebaya.svg",
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
        imagePath: "/konselingbk.png",
        isLarge: true,
        segera: true,
      },
    ],
    [],
  );

  const consultationSteps = useMemo(
    () => [
      {
        number: "1",
        title: "Cerita Anonim",
        // "100% aman" dan "tidak ada yang tahu identitasmu" adalah klaim
        // absolut. Anak yang percaya "100%" lalu ketahuan justru mengalami
        // kerugian yang sistem ini ada untuk mencegah.
        text: "Tulis apa yang kamu alami di RuangAman. Tidak perlu nama — Guru BK akan membaca ceritamu, tapi tidak bisa melihat namamu dari sistem ini.",
      },
      {
        number: "2",
        title: "Dapat Pendampingan",
        text: "AI menganalisis ceritamu dan menghubungkanmu dengan Buddy Support atau Guru BK yang paling tepat.",
      },
      {
        number: "3",
        title: "Pulih dan Kuat",
        text: "Pantau penanganan kasusmu, akses modul edukasi, dan rasakan dukungan nyata dari komunitas SAHABAT.",
      },
    ],
    [],
  );

  // Sebelumnya keempatnya href="#" — tidak melakukan apa pun.
  // "Kontak Darurat" adalah link paling berbahaya di situs ini kalau mati:
  // satu-satunya yang mungkin diklik anak yang sedang panik.
  //
  // "Syarat & Ketentuan" dan "Pusat Bantuan" DIHAPUS, bukan diberi halaman
  // kosong. Keduanya butuh isi sungguhan yang belum ada; link ke halaman
  // kosong cuma memindahkan kekecewaan satu klik lebih jauh.
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
          {user ? (
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)} 
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <Image src="/h3.svg" alt="User Profile" width={40} height={40} />
              </button>
              {showDropdown && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "8px", background: "white", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", padding: "8px", zIndex: 10, border: "1px solid #e5e7eb" }}>
                  <button onClick={handleSignOut} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontWeight: 600, padding: "8px 16px", width: "100%", textAlign: "left", whiteSpace: "nowrap" }}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/masuk" className={styles.loginBtn}>
                Masuk
              </Link>
              <Link href="/daftar" className={styles.signInBtn}>
                Daftar
              </Link>
            </>
          )}
        </div>
      </header>

      <main id="main-content" className={styles.mainContent}>
        
        {/* HERO SECTION */}
        <section aria-labelledby="hero-heading" className={styles.heroSection}>
          <div className={styles.heroLeft}>
            <h1 id="hero-heading" className={styles.heroTitle}>
              Berani Bercerita, Bersama Kita Atasi
            </h1>
            <p className={styles.heroDesc}>
              Kami menyediakan ruang aman, anonim, dan suportif bagi setiap siswa
              untuk berbagi, melaporkan, dan mendapatkan bantuan yang mereka
              butuhkan.
            </p>
            {/* Dua tombol besar sesuai spec §4.1A.
                Sebelumnya keduanya menunjuk /siswa/* — route yang masuk matcher
                middleware, jadi anak yang menekan "lapor" justru dilempar ke
                halaman LOGIN. Untuk kanal yang seluruh gunanya melapor tanpa
                identitas, itu kegagalan yang membatalkan produknya. */}
            <div className={styles.heroActions}>
              <Link href="/lapor" className={styles.ctaBtnPrimary}>
                Lapor Sekarang
              </Link>
              <Link href="/cek-laporan" className={styles.ctaBtnSecondary}>
                Cek Laporan Saya
              </Link>
            </div>
          </div>
          
          <div className={styles.heroRight}>
            <div className={styles.chatIllContainer}>
              <div className={styles.illBadge1}>1 Pesan Baru</div>
              
              <div className={styles.chatBubbleContainer}>
                <div className={styles.chat1}>
                  <div className={styles.chatBubbleWhite}>
                    <p>Halo! Cerita apa<br />yang kamu rasakan?</p>
                    <div className={styles.chatIconWrap} style={{color: '#2563eb', backgroundColor: '#d4e5ff'}}>
                      <MessageCircle size={14} />
                    </div>
                  </div>
                  <span className={styles.chatTime}>10.00 AM</span>
                </div>
                
                <div className={styles.chat2}>
                  <div className={styles.chatBubbleBlue}>
                    <p>Aku di-bully teman<br />via WA group...</p>
                    <div className={styles.chatIconWrap} style={{color: '#2563eb', backgroundColor: '#d4e5ff'}}>
                      <User size={14} />
                    </div>
                  </div>
                  <span className={styles.chatTimeRight}>10.00 AM</span>
                </div>
                
                <div className={styles.chat3}>
                  <div className={styles.chatBubbleWhite}>
                    <p>Kamu sudah berani sekali mau cerita. Kamu aman di sini, aku dengarkan.</p>
                    <div className={styles.chatIconWrap} style={{color: '#2563eb', backgroundColor: '#d4e5ff'}}>
                      <MessageCircle size={14} />
                    </div>
                  </div>
                  <span className={styles.chatTime}>10.10 AM</span>
                </div>
                
                <div className={styles.chat4}>
                  <div className={styles.chatBubbleStatus}>
                    <div className={styles.statusIconWrap}>
                      <GraduationCap size={16} />
                    </div>
                    <div className={styles.statusContent}>
                      {/* Kode contoh sengaja memakai format asli: acak, bukan
                          berurutan. "#SBT-001" mengajarkan pembaca bahwa tiket
                          bisa dihitung — dan kalau ada yang meniru pola itu ke
                          implementasi, siapa pun bisa menebak SBT-002 lalu
                          membaca laporan anak lain.

                          "merespons 10 menit lalu" juga dihapus: rasio 1 Guru
                          BK : 150 siswa (Permendikbud 111/2014) membuat janji
                          itu mustahil, dan spec §1b mewajibkan menampilkan
                          ekspektasi 1×24 jam sekolah. */}
                      <h4>Laporan SAH-K4PM-9TXQ</h4>
                      <p>Guru BK biasanya membalas dalam 1×24 jam sekolah</p>
                      <div className={styles.chatDots}>
                        <div className={styles.chatDot} style={{backgroundColor: '#21c55e'}} />
                        <div className={styles.chatDot} style={{backgroundColor: '#21c55e'}} />
                        <div className={styles.chatDot} style={{backgroundColor: '#4f46e4'}} />
                        <div className={styles.chatDot} style={{backgroundColor: '#bebece'}} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TENTANG SECTION */}
        <section id="tentang" aria-labelledby="reasons-heading" className={styles.tentangSection}>
          <div className={styles.sectionHeader}>
            <h2 id="reasons-heading" className={styles.sectionTitle}>
              Mengapa Sulit Untuk Melapor?
            </h2>
            <p className={styles.sectionDesc}>
              Banyak siswa memilih diam karena berbagai alasan. Kami memahami
              ketakutanmu dan merancang SAHABAT untuk mengatasinya.
            </p>
          </div>
          
          <div className={styles.reasonGrid}>
            {reasonCards.map((card, i) => {
              return (
                <article key={i} className={styles.reasonCard}>
                  <div className={styles.reasonIconWrap} style={{backgroundColor: card.iconBg}}>
                    <Image src={card.iconPath} alt={card.title} width={36} height={36} />
                  </div>
                  <h3 className={styles.reasonTitle}>{card.title}</h3>
                  <p className={styles.reasonDesc}>{card.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* FITUR SECTION */}
        <section id="fitur" aria-labelledby="features-heading" className={styles.fiturSection}>
          <div className={styles.sectionHeader}>
            <h2 id="features-heading" className={styles.sectionTitle}>
              Fitur-Fitur Sahabat
            </h2>
            <p className={styles.sectionDesc}>
              Dirancang khusus untuk memberikan kenyamanan dan keamanan maksimal
              saat membutuhkan bantuan.
            </p>
          </div>
          
          <div className={styles.featureGrid}>
            {featureTextCards.map((card, i) => {
              return (
                <article key={i} className={`${styles.featureCard} ${card.isLarge ? styles.featureCardLarge : ''}`}>
                  <div className={styles.featureCardContent}>
                    <div className={styles.featureIconBox} style={{backgroundColor: card.iconBg}}>
                      <Image src={card.iconPath} alt={card.title} width={32} height={32} />
                    </div>
                    <h3 className={styles.featureTitle}>{card.title}</h3>
                    <p className={styles.featureDesc}>{card.description}</p>

                    {/* Kartu yang belum dibangun tidak dirender sebagai link.
                        Label "Segera hadir" jujur; link ke halaman kosong tidak. */}
                    {card.href ? (
                      <Link href={card.href} className={styles.featureLink}>
                        {card.cta || "Pelajari Lebih Lanjut"}
                        <ArrowUpRight size={20} />
                      </Link>
                    ) : (
                      <span
                        className={styles.featureLink}
                        style={{ color: "#9ca3af", cursor: "default" }}
                      >
                        Segera hadir
                      </span>
                    )}
                  </div>
                  {card.imagePath && (
                    <div className={styles.featureCardImageWrap}>
                      <Image src={card.imagePath} alt={card.title} width={761} height={275} className={styles.featureCardImage} />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* EDUKASI SECTION */}
        <section id="edukasi" aria-labelledby="consultation-heading" className={styles.edukasiSection}>
          <div className={styles.sectionHeader}>
            <h2 id="consultation-heading" className={styles.sectionTitle}>
              Alur Konsultasi
            </h2>
          </div>
          
          <div className={styles.stepGrid}>
            {consultationSteps.map((step, i) => (
              <div key={i} className={styles.stepItem}>
                <article className={styles.stepCard}>
                  <div className={styles.stepBubble}>
                    {step.number}
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.text}</p>
                </article>
                {i < consultationSteps.length - 1 && (
                  <div className={styles.stepArrow}>
                    <ArrowUpRight size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className={styles.bannerCard}>
            <div className={styles.bannerContent}>
              <h2 className={styles.bannerTitle}>
                Kamu layak mendapat bantuan dan dukungan
              </h2>
              <p className={styles.bannerDesc}>
                Langkah pertama seringkali yang paling sulit, tetapi kami di sini
                untuk menemani Anda di setiap langkah berikutnya.
              </p>
            </div>
            <div className={styles.bannerAction}>
              <Link href="/lapor" className={styles.bannerBtn}>
                Lapor Sekarang
              </Link>
            </div>
            <div className={styles.bannerIll} />
          </div>
        </section>
      </main>

      <footer className={styles.footer} role="contentinfo">
        <div className={styles.footerInner}>
          <p className={styles.footerCopyright}>
            © 2024 SAHABAT - Sahabat Anti-Bullying dan Bantuan Terpadu
          </p>
          <nav aria-label="Tautan footer" className={styles.footerNav}>
            {footerLinks.map((link, index) => (
              <span key={link.href} className={styles.footerLinkWrap}>
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
