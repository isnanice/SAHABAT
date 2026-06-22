"use client";

import { useMemo } from "react";
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
  const navItems = useMemo(
    () => [
      { label: "Beranda", href: "#main-content", active: true },
      { label: "Tentang", href: "#tentang", active: false },
      { label: "Fitur", href: "#fitur", active: false },
      { label: "Edukasi", href: "#edukasi", active: false },
    ],
    [],
  );

  const reasonCards = useMemo(
    () => [
      {
        title: "Takut Identitas Terungkap",
        text: "Sistem anonimitas kami memastikan identitas kamu aman. Kamu pegang kendali penuh atas informasi apa saja yang ingin dibagikan.",
        IconComponent: Lock,
        iconColor: "#16a34a", // text-green-600
        iconBg: "#dcfce7", // bg-green-100
      },
      {
        title: "Takut Pembalasan",
        text: "Laporan kamu langsung masuk ke konselor sekolah secara rahasia, memungkinkan tindakan pencegahan yang bijaksana tanpa membahayakanmu.",
        IconComponent: ShieldOff,
        iconColor: "#dc2626", // text-red-600
        iconBg: "#fee2e2", // bg-red-100
      },
      {
        title: "Merasa Sendiri & Lemah",
        text: "Kamu tidak sendiri, banyak yang peduli dan siap membantu. Kami menghubungkan kamu dengan dukungan profesional dan teman sebaya.",
        IconComponent: Brain,
        iconColor: "#d97706", // text-amber-600
        iconBg: "#fef3c7", // bg-amber-100
      },
    ],
    [],
  );

  const featureTextCards = useMemo(
    () => [
      {
        title: "Curhat Anonim",
        description: "Laporkan kejadian atau sekadar berbagi perasaan tanpa mengungkapkan identitasmu. Sistem kami mengenkripsi data kamu untuk perlindungan privasi total.",
        IconComponent: Lock,
        iconColor: "#3525cd",
        iconBg: "#e0e7ff",
      },
      {
        title: "Lacak Laporan",
        description: "Pantau status laporan Anda secara real-time. Ketahui kapan konselor mulai menangani kasus kamu.",
        IconComponent: FileText,
        iconColor: "#d97706",
        iconBg: "#fef3c7",
      },
      {
        title: "Ruang Dukungan Sebaya",
        description: "Forum moderasi tertutup di mana siswa dapat saling memberikan dukungan emosional secara aman.",
        IconComponent: Users,
        iconColor: "#16a34a",
        iconBg: "#dcfce7",
      },
      {
        title: "Konseling BK",
        description: "Jadwal sesi dengan Guru BK, pilih tatap muka atau online. Identitas terlindungi sepenuhnya.",
        IconComponent: HeartHandshake,
        iconColor: "#dc2626",
        iconBg: "#fee2e2",
      },
    ],
    [],
  );

  const consultationSteps = useMemo(
    () => [
      {
        number: "1",
        title: "Cerita Anonim",
        text: "Tulis apa yang kamu alami di RuangAman. Tidak perlu nama, 100% aman dan tidak ada yang tahu identitasmu.",
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
            Login
          </Link>
          <Link href="/login" className={styles.signInBtn}>
            Sign In
          </Link>
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
            <div className={styles.heroActions}>
              <Link href="/siswa/lapor" className={styles.ctaBtnPrimary}>
                Mulai Curhat Sekarang
              </Link>
              <Link href="/siswa/lacak" className={styles.ctaBtnSecondary}>
                Lacak Laporan
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
                      <h4>Laporan #SBT-001</h4>
                      <p>Guru BK merespons 10 menit lalu</p>
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
              const IconComponent = card.IconComponent;
              return (
                <article key={i} className={styles.reasonCard}>
                  <div className={styles.reasonIconWrap} style={{backgroundColor: card.iconBg, color: card.iconColor}}>
                    <IconComponent size={36} />
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
              const IconComponent = card.IconComponent;
              return (
                <article key={i} className={styles.featureCard}>
                  <div className={styles.featureIconBox} style={{backgroundColor: card.iconBg, color: card.iconColor}}>
                    <IconComponent size={32} />
                  </div>
                  <h3 className={styles.featureTitle}>{card.title}</h3>
                  <p className={styles.featureDesc}>{card.description}</p>
                  <Link href="#pelajari-lebih-lanjut" className={styles.featureLink}>
                    Pelajari Lebih Lanjut
                    <ArrowUpRight size={20} />
                  </Link>
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
              <Link href="/siswa/lapor" className={styles.bannerBtn}>
                Mulai Curhat Sekarang
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
              <span key={link} className={styles.footerLinkWrap}>
                <Link href="#" className={styles.footerLink}>{link}</Link>
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
