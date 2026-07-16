import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "SAHABAT — Lapor perundungan dengan aman dan anonim",
  description:
    "Ruang aman untuk melaporkan perundungan di sekolah tanpa perlu menulis namamu. Laporanmu dibaca Guru BK sekolahmu.",
  // Halaman ini tidak boleh muncul di hasil pencarian. Anak yang membukanya
  // di komputer bersama tidak perlu jejaknya ikut terindeks, dan riwayat
  // pencarian "cara lapor bullying" di perangkat bersama bisa membahayakan.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    // lang="id" — seluruh UI berbahasa Indonesia. lang="en" membuat screen
    // reader melafalkan teks Indonesia dengan fonem Inggris, praktis tidak
    // bisa dipahami.
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
