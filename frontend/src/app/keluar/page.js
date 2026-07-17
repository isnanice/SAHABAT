'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/**
 * Halaman keluar — jalan keluar darurat dari sesi yang tersangkut.
 *
 * Kenapa perlu halaman TERSENDIRI, bukan cuma tombol di dashboard:
 *
 * Middleware melempar siapa pun yang sudah login dari /login ke dashboard
 * perannya. Jadi kalau browser punya sesi siswa, Guru BK TIDAK BISA membuka
 * form login sama sekali — dia terus dipantulkan ke /siswa/edukasi tanpa
 * penjelasan. Halaman ini sengaja TIDAK masuk matcher middleware, jadi selalu
 * bisa dibuka: /keluar
 *
 * Ini juga jaring pengaman untuk komputer sekolah bersama: siapa pun bisa
 * mengetik /keluar untuk memutus sesi yang ditinggalkan orang sebelumnya.
 */
export default function KeluarPage() {
  const router = useRouter()
  const [selesai, setSelesai] = useState(false)

  useEffect(() => {
    ;(async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      setSelesai(true)
      router.refresh()
    })()
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-sahabat-latar px-4">
      <div className="w-full max-w-sm rounded-2xl border border-sahabat-garis bg-white p-8 text-center">
        {selesai ? (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Check className="text-emerald-700" size={24} aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900">Kamu sudah keluar</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Sesi di perangkat ini sudah diputus. Kalau ini komputer bersama,
              sekarang aman untuk dipakai orang lain.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/login"
                className="rounded-xl bg-sahabat px-4 py-3 font-semibold text-white transition hover:bg-sahabat-tua"
              >
                Masuk dengan akun lain
              </Link>
              <Link
                href="/lapor"
                className="rounded-xl border border-sahabat-garis px-4 py-3 font-semibold text-gray-700 transition hover:bg-sahabat-latar"
              >
                Lapor (tidak perlu akun)
              </Link>
              <Link href="/" className="mt-1 text-sm text-gray-500 hover:text-sahabat">
                Kembali ke beranda
              </Link>
            </div>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto animate-spin text-sahabat" size={28} aria-hidden="true" />
            <p className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
              <LogOut size={16} aria-hidden="true" /> Mengeluarkanmu…
            </p>
          </>
        )}
      </div>
    </main>
  )
}
