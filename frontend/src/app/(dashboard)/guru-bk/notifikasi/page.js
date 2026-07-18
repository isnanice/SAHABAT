'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, MessageSquare, RefreshCw, CheckCheck, ArrowRight, CornerUpLeft, PlusCircle, CalendarDays, UserRound } from 'lucide-react'

/**
 * Notifikasi (desain citra "Tombol Notifikasi").
 *
 * Backend notifikasi realtime belum ada; isi di sini CONTOH untuk menyamai
 * desain. Tab menyaring betulan, dan "Tandai semua dibaca" bekerja di layar.
 */

const DATA = [
  { id: 1, tipe: 'darurat', judul: 'Laporan Mendesak Telah Diajukan', isi: 'Sebuah laporan anonim baru yang ditandai sebagai prioritas tinggi memerlukan peninjauan segera.', waktu: 'Sekarang', tag: 'URGENT', aksi: { label: 'Lihat Berkas Kasus', href: '/guru-bk/inbox', ikon: ArrowRight } },
  { id: 2, tipe: 'pesan', judul: 'Pesan Baru dari Azka', isi: '"Halo Bu Ayudia, saya ingin bertanya apakah kita bisa menjadwalkan ulang sesi kita untuk minggu depan?"', waktu: '10 menit lalu', aksi: { label: 'Reply', href: '/guru-bk/konseling', ikon: CornerUpLeft } },
  { id: 3, tipe: 'sistem', judul: 'Pemeliharaan Platform Terjadwal', isi: 'Sahabat akan menjalani pemeliharaan rutin pada hari Sabtu ini dari pukul 2 pagi hingga 4 pagi. Beberapa fitur mungkin untuk sementara tidak tersedia.', waktu: '15 menit lalu', tag: 'Sistem' },
]

const IKON = { darurat: { I: AlertTriangle, bg: 'bg-darurat-muda', c: 'text-darurat' }, pesan: { I: UserRound, bg: 'bg-sahabat-muda', c: 'text-sahabat' }, sistem: { I: RefreshCw, bg: 'bg-sahabat-muda', c: 'text-sahabat' } }

export default function NotifikasiPage() {
  const [tab, setTab] = useState('semua')
  const [dibaca, setDibaca] = useState(false)

  const daruratCount = DATA.filter((d) => d.tipe === 'darurat').length
  const terfilter = useMemo(() => tab === 'semua' ? DATA : DATA.filter((d) => d.tipe === tab), [tab])

  const TABS = [['semua', 'Semua Notifikasi', 0], ['darurat', 'Darurat', daruratCount], ['pesan', 'Pesan', 0], ['sistem', 'Sistem', 0]]

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifikasi</h1>
          <p className="mt-1 text-gray-500">Tetaplah update dengan laporan, peringatan, dan pesan sistem terbaru.</p>
        </div>
        <button type="button" onClick={() => setDibaca(true)} className="flex items-center gap-2 text-sm font-semibold text-sahabat hover:underline">
          <CheckCheck size={16} /> Tandai semua sebagai sudah dibaca
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* KIRI */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-6 border-b border-sahabat-garis">
            {TABS.map(([k, label, n]) => (
              <button key={k} type="button" onClick={() => setTab(k)}
                className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold transition ${tab === k ? 'border-sahabat text-sahabat' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                {label}
                {n > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-darurat text-[11px] font-bold text-white">{n}</span>}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-4">
            {terfilter.map((d) => {
              const ic = IKON[d.tipe]
              return (
                <div key={d.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${d.tipe === 'darurat' && !dibaca ? 'border-l-4 border-l-darurat border-sahabat-garis' : 'border-sahabat-garis'}`}>
                  <div className="flex gap-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${ic.bg} ${ic.c}`}><ic.I size={20} aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-gray-900">{d.judul}</h3>
                        <span className={`shrink-0 text-xs ${d.waktu === 'Sekarang' ? 'font-semibold text-darurat' : 'text-gray-400'}`}>{d.waktu}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{d.isi}</p>
                      <div className="mt-3 flex items-center gap-3">
                        {d.tag && <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${d.tag === 'URGENT' ? 'bg-darurat-muda text-darurat' : 'bg-sahabat-muda text-sahabat-tua'}`}>{d.tag}</span>}
                        {d.aksi && (
                          <Link href={d.aksi.href} className="flex items-center gap-1 text-sm font-semibold text-sahabat hover:underline">
                            {d.aksi.label} <d.aksi.ikon size={14} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {terfilter.length === 0 && <p className="py-10 text-center text-sm text-gray-400">Tidak ada notifikasi di kategori ini.</p>}
          </div>
        </div>

        {/* KANAN */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-sahabat-garis bg-sahabat-muda/40 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Ringkasan Peringatan</h2>
            <ul className="mt-4 space-y-3">
              <RingkasanRow warna="bg-darurat" label="Darurat yang Belum Dibaca" nilai={dibaca ? 0 : 2} />
              <RingkasanRow warna="bg-sahabat" label="Pesan yang Belum Dibaca" nilai={dibaca ? 0 : 1} />
              <RingkasanRow warna="bg-gray-400" label="Total Laporan Minggu Ini" nilai={14} />
            </ul>
          </section>

          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Tindakan Cepat</h2>
            <button type="button" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-sahabat py-3 font-semibold text-white transition hover:bg-sahabat-tua"><PlusCircle size={16} /> Catat Interaksi Offline</button>
            <Link href="/guru-bk/konseling" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-sahabat py-3 font-semibold text-sahabat transition hover:bg-sahabat-muda"><CalendarDays size={16} /> Jadwal Sesi</Link>
          </section>
        </div>
      </div>
    </div>
  )
}

function RingkasanRow({ warna, label, nilai }) {
  return (
    <li className="flex items-center justify-between rounded-xl bg-white px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-gray-700"><span className={`h-2 w-2 rounded-full ${warna}`} aria-hidden="true" /> {label}</span>
      <span className="font-bold text-gray-900">{nilai}</span>
    </li>
  )
}
