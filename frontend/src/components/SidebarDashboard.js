'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutGrid,
  BarChart3,
  Users,
  BookOpen,
  Brain,
  Settings,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  Loader2,
  UserRound,
  TrendingUp,
  AlertTriangle,
  Map as MapIcon,
  Gauge,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/**
 * Shell dashboard bersidebar (desain citra "Halaman Dashboard").
 *
 * Dipakai SELURUH area terautentikasi (Guru BK & Kepala Sekolah) supaya
 * tampilannya konsisten dengan desain. Nav bisa di-override lewat prop `nav`;
 * defaultnya nav Guru BK. Tombol Keluar tetap ada dan tetap sepenting
 * sebelumnya: ini komputer sekolah bersama — sesi yang tertinggal = siapa pun
 * bisa membaca laporan anak.
 */

const NAV_BK = [
  { label: 'Dashboard', href: '/guru-bk/dashboard', ikon: LayoutGrid },
  { label: 'Report', href: '/guru-bk/inbox', ikon: BarChart3 },
  { label: 'Ruang Dukungan Sebaya', href: '/guru-bk/buddy', ikon: Users },
  { label: 'Edukasi', href: '/guru-bk/edukasi', ikon: BookOpen },
  { label: 'Konseling', href: '/guru-bk/konseling', ikon: Brain },
  { label: 'Pengaturan', href: '/guru-bk/pengaturan', ikon: Settings },
]

// Nav Kepala Sekolah — fokus pengawasan. Ikon dari lucide sama gayanya.
export const NAV_KEPSEK = [
  { label: 'Analitik', href: '/kepala-sekolah/analitik', ikon: TrendingUp },
  { label: 'Semua Laporan', href: '/kepala-sekolah/laporan', ikon: BarChart3 },
  { label: 'Eskalasi', href: '/kepala-sekolah/eskalasi', ikon: AlertTriangle },
  { label: 'Titik Rawan', href: '/kepala-sekolah/heatmap', ikon: MapIcon },
  { label: 'Kinerja BK', href: '/kepala-sekolah/kinerja-bk', ikon: Gauge },
]

export default function SidebarDashboard({ nama, children, nav = NAV_BK, home = '/guru-bk/dashboard', bantuan = '/guru-bk/faq', notifikasi = '/guru-bk/notifikasi' }) {
  const pathname = usePathname()
  const router = useRouter()
  const [keluar, setKeluar] = useState(false)

  async function logout() {
    if (keluar) return
    setKeluar(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-sahabat-latar">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-sahabat-garis bg-white px-4 py-6 lg:flex">
        <Link href={home} className="mb-8 flex items-center gap-2 px-2">
          <Image src="/logo.png" alt="Logo SAHABAT" width={140} height={44} priority style={{ height: 'auto' }} />
        </Link>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Navigasi dashboard">
          {nav.map((n) => {
            const Ikon = n.ikon
            const aktif = pathname === n.href || (n.href !== home && pathname.startsWith(n.href))
            return (
              <Link
                key={n.label}
                href={n.href}
                aria-current={aktif ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  aktif ? 'bg-sahabat-muda text-sahabat' : 'text-gray-600 hover:bg-sahabat-latar'
                }`}
              >
                <Ikon size={20} aria-hidden="true" />
                {n.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* ===================== KONTEN ===================== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center gap-3 border-b border-sahabat-garis bg-white px-5 py-3">
          <div className="relative hidden max-w-xl flex-1 sm:block">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Cari siswa atau laporan..."
              className="w-full rounded-full border border-sahabat-garis bg-sahabat-latar py-2.5 pl-11 pr-4 text-sm text-gray-900 outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Link href={notifikasi} className="relative rounded-lg p-2 text-gray-500 transition hover:bg-sahabat-latar" aria-label="Notifikasi">
              <Bell size={20} aria-hidden="true" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-darurat" aria-hidden="true" />
            </Link>
            <Link href={bantuan} className="rounded-lg p-2 text-gray-500 transition hover:bg-sahabat-latar" aria-label="Bantuan">
              <HelpCircle size={20} aria-hidden="true" />
            </Link>
            <span className="mx-1 flex h-9 w-9 items-center justify-center rounded-full bg-gray-700 text-white" title={nama || 'Guru BK'}>
              <UserRound size={18} aria-hidden="true" />
            </span>
            <button
              type="button"
              onClick={logout}
              disabled={keluar}
              className="rounded-lg p-2 text-darurat transition hover:bg-darurat-muda disabled:opacity-40"
              aria-label="Keluar"
            >
              {keluar ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <LogOut size={20} aria-hidden="true" />}
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
