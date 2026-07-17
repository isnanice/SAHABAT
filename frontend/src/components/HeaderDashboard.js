'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/**
 * Header dashboard dengan tombol Keluar.
 *
 * ==================== KENAPA INI PENTING ====================
 * Sebelum ini TIDAK ADA cara keluar di seluruh aplikasi. Akibatnya:
 *
 *   1. Guru BK tidak bisa masuk kalau browser masih punya sesi siswa —
 *      middleware melempar siapa pun yang sudah login dari /login ke
 *      dashboard perannya, jadi form login tidak pernah bisa dibuka.
 *   2. Lebih serius: ini komputer sekolah yang dipakai bergantian. Siswa
 *      login untuk modul edukasi lalu pergi, dan pemakai berikutnya mewarisi
 *      sesinya. Tidak ada tombol untuk memutusnya.
 *
 * Untuk Guru BK/kepsek taruhannya lebih besar lagi: sesi yang tertinggal di
 * komputer bersama berarti siapa pun yang duduk berikutnya bisa membaca
 * laporan anak — dan setiap pembacaan itu tercatat atas nama Guru BK-nya.
 * ============================================================
 */
export default function HeaderDashboard({ nama, peran, beranda }) {
  const router = useRouter()
  const [keluar, setKeluar] = useState(false)

  async function logout() {
    if (keluar) return
    setKeluar(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    // refresh() penting: tanpa itu middleware masih melihat cookie lama
    // dan bisa melempar balik ke dashboard.
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-sahabat-garis bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href={beranda} className="font-bold text-sahabat-tua">
          SAHABAT
        </Link>

        <div className="flex items-center gap-3">
          <div className="text-right">
            {nama && <p className="text-sm font-medium text-gray-900">{nama}</p>}
            <p className="text-xs text-gray-500">{peran}</p>
          </div>

          <button
            type="button"
            onClick={logout}
            disabled={keluar}
            className="flex items-center gap-1.5 rounded-xl border border-sahabat-garis px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-sahabat-latar disabled:opacity-40"
          >
            {keluar ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <LogOut size={16} aria-hidden="true" />
            )}
            Keluar
          </button>
        </div>
      </div>
    </header>
  )
}
