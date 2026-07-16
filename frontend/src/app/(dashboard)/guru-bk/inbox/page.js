'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, BrainCircuit, Loader2, Inbox } from 'lucide-react'

/**
 * Antrean laporan Guru BK (spec §4.2).
 *
 * Dua aturan yang membentuk halaman ini:
 *
 * 1. Urutkan pakai `urgensi_final`, BUKAN `ai_urgensi`. Keputusan manusia
 *    menang atas tebakan mesin — kalau Guru BK sudah menaikkan sebuah kasus,
 *    urutannya harus ikut, bukan tetap di bawah karena AI bilang RENDAH.
 *
 * 2. Tampilkan SEMUA laporan, jangan sembunyikan yang non-merah. Menyaring
 *    antrean berdasarkan skor AI berarti laporan yang salah diklasifikasi
 *    hilang selamanya dari pandangan — dan yang paling mungkin salah
 *    diklasifikasi justru cerita yang ditulis paling samar, oleh anak yang
 *    paling takut menulis terang-terangan.
 */

const URGENSI = {
  KRITIS: { label: 'Kritis', kelas: 'bg-red-100 text-red-800 border-red-200', urutan: 4 },
  TINGGI: { label: 'Tinggi', kelas: 'bg-orange-100 text-orange-800 border-orange-200', urutan: 3 },
  SEDANG: { label: 'Sedang', kelas: 'bg-amber-100 text-amber-800 border-amber-200', urutan: 2 },
  RENDAH: { label: 'Rendah', kelas: 'bg-emerald-100 text-emerald-800 border-emerald-200', urutan: 1 },
}

const STATUS = {
  MENUNGGU: 'Menunggu',
  DIPROSES: 'Diproses',
  SELESAI: 'Selesai',
  DITUTUP: 'Ditutup',
}

/** Ambang confidence rendah — di bawah ini, AI-nya sendiri tidak yakin. */
const AMBANG_CONFIDENCE = 0.6

function formatTanggal(iso) {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export default function InboxPage() {
  const [laporan, setLaporan] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let batal = false
    ;(async () => {
      try {
        const res = await fetch('/api/laporan')
        const data = await res.json()
        if (batal) return
        if (!res.ok) throw new Error(data?.error || 'Gagal memuat laporan')
        setLaporan(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!batal) setError(e.message)
      } finally {
        if (!batal) setLoading(false)
      }
    })()
    return () => {
      batal = true
    }
  }, [])

  // Krisis selalu di atas, lalu urgensi_final, lalu yang paling lama menunggu.
  const urut = [...laporan].sort((a, b) => {
    if (a.flag_krisis !== b.flag_krisis) return a.flag_krisis ? -1 : 1
    const ua = URGENSI[a.urgensi_final]?.urutan ?? 0
    const ub = URGENSI[b.urgensi_final]?.urutan ?? 0
    if (ua !== ub) return ub - ua
    return new Date(a.created_at) - new Date(b.created_at)
  })

  // Klasifikasi berjalan di belakang layar setelah laporan tersimpan, jadi ada
  // jendela beberapa detik di mana ai_gagal masih true padahal AI sedang
  // bekerja. Menyebutnya "AI gagal" di jendela itu tidak jujur — dan Guru BK
  // yang melihatnya akan menganggap AI-nya rusak padahal cuma belum selesai.
  const menunggu = (l) => l.ai_gagal && l.ai_klasifikasi?.menunggu === true
  const perluBaca = (l) =>
    (l.ai_gagal && !menunggu(l)) ||
    (l.ai_confidence !== null && l.ai_confidence < AMBANG_CONFIDENCE)

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-sahabat" aria-label="Memuat" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div role="alert" className="rounded-2xl border-2 border-darurat bg-darurat-muda p-5">
          <p className="font-semibold text-darurat">Gagal memuat antrean</p>
          <p className="mt-1 text-sm text-gray-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Antrean Laporan</h1>
        <p className="mt-1 text-sm text-gray-600">
          Diurutkan dari yang paling mendesak. {urut.length} laporan.
        </p>
      </header>

      {urut.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-sahabat-garis bg-white p-10 text-center">
          <Inbox className="mx-auto text-gray-300" size={40} aria-hidden="true" />
          <p className="mt-3 font-medium text-gray-700">Belum ada laporan</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {urut.map((l) => (
            <li key={l.id}>
              <Link
                href={`/guru-bk/laporan/${l.id}`}
                className={`block rounded-2xl border bg-white p-5 transition hover:shadow-md ${
                  l.flag_krisis ? 'border-2 border-darurat' : 'border-sahabat-garis'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {l.flag_krisis && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-darurat px-2.5 py-1 text-xs font-bold text-white">
                      <AlertTriangle size={12} aria-hidden="true" /> KRISIS
                    </span>
                  )}

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      URGENSI[l.urgensi_final]?.kelas || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {URGENSI[l.urgensi_final]?.label || l.urgensi_final}
                  </span>

                  {l.jenis_final && (
                    <span className="rounded-full bg-sahabat-muda px-2.5 py-1 text-xs font-medium text-sahabat-tua">
                      {l.jenis_final}
                    </span>
                  )}

                  {/* Badge ini alasan kolom ai_gagal & ai_confidence ada.
                      Tanpanya, laporan yang AI-nya menyerah tampak sama persis
                      dengan laporan yang AI-nya yakin — dan yang paling butuh
                      mata manusia justru yang paling mudah terlewat. */}
                  {menunggu(l) && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-sahabat-garis bg-sahabat-latar px-2.5 py-1 text-xs font-medium text-gray-500">
                      <BrainCircuit size={12} aria-hidden="true" />
                      AI sedang menilai…
                    </span>
                  )}

                  {perluBaca(l) && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      <BrainCircuit size={12} aria-hidden="true" />
                      {l.ai_gagal ? 'AI gagal — baca manual' : 'AI ragu — baca manual'}
                    </span>
                  )}

                  <span className="ml-auto text-xs text-gray-500">
                    {STATUS[l.status] || l.status}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span>{formatTanggal(l.created_at)}</span>
                  {l.lokasi && <span>Lokasi: {l.lokasi}</span>}
                  {l.ai_confidence !== null && l.ai_confidence !== undefined && (
                    <span>Keyakinan AI: {Math.round(l.ai_confidence * 100)}%</span>
                  )}
                </div>

                {/* Isi cerita SENGAJA tidak dipratinjau di daftar.
                    Setiap pembacaan harus terjadi di halaman detail, yang
                    mencatat audit_akses. Kalau cuplikannya muncul di sini,
                    laporan bisa dibaca sekilas tanpa meninggalkan jejak. */}
                <p className="mt-2 text-sm italic text-gray-400">
                  Buka untuk membaca laporan — aksesmu akan tercatat
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
