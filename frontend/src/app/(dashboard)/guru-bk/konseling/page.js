'use client'

import { useEffect, useState } from 'react'
import { Video, MessageSquare, PenLine, ChevronLeft, ChevronRight, Plus, UserRound } from 'lucide-react'

/**
 * Konseling (view Guru BK) — desain citra "Halaman Konseling".
 *
 * Backend sesi live (video, timer, penerimaan permintaan) belum ada, jadi isi
 * di sini adalah CONTOH untuk mencocokkan desain. Timer sesi aktif berjalan
 * betulan (murni layar) supaya terasa hidup; tombol lain visual. Saat modul
 * konseling nyata dibangun, data tinggal dialiri ke sini.
 */

const JADWAL = [
  { jam: '09:00', judul: 'Sesi Selesai', sub: 'David — Menindaklanjuti', status: 'selesai' },
  { jam: '10:30', judul: 'Sesi Aktif', sub: 'Azka — Manajemen Stres', status: 'aktif' },
  { jam: '13:00', judul: 'Konsultasi Awal', sub: 'Emma — Permintaan Baru', status: 'depan' },
]

const PERMINTAAN = [
  { nama: 'Aisha', tag: 'URGENT', urgent: true, pesan: '"Aku perlu bicara dengan seseorang sekarang juga..."', aksi: 'Terima' },
  { nama: 'Mia', tag: 'RUTIN', urgent: false, pesan: 'Meminta jadwal untuk minggu depan.', aksi: 'Ulasan' },
]

const CATATAN = [
  { judul: 'Sesi bersama David', isi: 'Membahas kemajuan dalam teknik manajemen kecemasan. Merekomendasikan terkait…', meta: '01 Juli • Perlu tindak lanjut' },
  { judul: 'Konsultasi Awal: Josh', isi: 'Mengumpulkan informasi dasar. Siswa merasa kewalahan dengan tugas akademik…', meta: '21 Juli • Tanggal ditetapkan' },
]

function useTimer() {
  const [d, setD] = useState(942) // 00:15:42
  useEffect(() => { const t = setInterval(() => setD((v) => v + 1), 1000); return () => clearInterval(t) }, [])
  const h = String(Math.floor(d / 3600)).padStart(2, '0')
  const m = String(Math.floor((d % 3600) / 60)).padStart(2, '0')
  const s = String(d % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

export default function KonselingGuruBK() {
  const timer = useTimer()

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-3xl font-bold text-gray-900">Konseling</h1>
      <p className="mt-1 text-gray-500">Kelola janji temu Anda dan berikan dukungan.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* KIRI */}
        <div className="space-y-6 lg:col-span-2">
          {/* Sesi Aktif */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Video size={20} className="text-sahabat" /> Sesi Aktif</h2>
              <span className="flex items-center gap-1.5 rounded-full bg-darurat-muda px-3 py-1 text-sm font-semibold text-darurat">
                <span className="h-1.5 w-1.5 rounded-full bg-darurat" aria-hidden="true" /> ({timer})
              </span>
            </div>
            <div className="mt-4 flex h-72 items-center justify-center rounded-xl bg-[#1e2a3b] text-gray-500">
              <UserRound size={56} aria-hidden="true" />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <button type="button" className="flex items-center justify-center gap-2 rounded-xl bg-sahabat-muda py-3 font-semibold text-sahabat-tua transition hover:bg-sahabat-muda/70"><MessageSquare size={16} /> Buka Pesan</button>
              <button type="button" className="flex items-center justify-center gap-2 rounded-xl bg-sahabat py-3 font-semibold text-white transition hover:bg-sahabat-tua"><PenLine size={16} /> Catatan Sesi</button>
            </div>
          </section>

          {/* Jadwal Hari Ini */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Jadwal Hari Ini</h2>
              <span className="flex items-center gap-3 text-sm font-medium text-gray-600">
                <ChevronLeft size={16} aria-hidden="true" /> Juli 12, 2026 <ChevronRight size={16} aria-hidden="true" />
              </span>
            </div>
            <ol className="mt-5 space-y-3">
              {JADWAL.map((j) => (
                <li key={j.jam} className="flex gap-4">
                  <span className={`mt-1 w-14 shrink-0 text-sm font-semibold ${j.status === 'aktif' ? 'text-sahabat' : 'text-gray-400'}`}>{j.jam}</span>
                  <div className={`flex-1 rounded-xl border p-4 ${j.status === 'aktif' ? 'border-sahabat bg-sahabat-muda/40' : 'border-sahabat-garis bg-sahabat-latar'}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{j.judul}</p>
                      {j.status === 'aktif' && <Video size={16} className="text-sahabat" aria-hidden="true" />}
                    </div>
                    <p className="text-sm text-gray-500">{j.sub}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* KANAN */}
        <div className="space-y-6">
          {/* Permintaan Baru */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Permintaan Baru</h2>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sahabat-muda text-xs font-bold text-sahabat">{PERMINTAAN.length + 1}</span>
            </div>
            <div className="mt-4 space-y-4">
              {PERMINTAAN.map((p) => (
                <div key={p.nama} className={`rounded-xl border p-4 ${p.urgent ? 'border-sahabat-garis border-l-4 border-l-darurat' : 'border-sahabat-garis'}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900">{p.nama}</p>
                    <span className={`text-[11px] font-bold ${p.urgent ? 'text-darurat' : 'text-gray-400'}`}>{p.tag}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{p.pesan}</p>
                  <button type="button" className={`mt-3 w-full rounded-lg py-2 text-sm font-semibold transition ${p.urgent ? 'bg-darurat text-white hover:bg-red-700' : 'bg-sahabat-muda text-sahabat-tua hover:bg-sahabat-muda/70'}`}>{p.aksi}</button>
                </div>
              ))}
            </div>
          </section>

          {/* Catatan Terbaru */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Catatan Terbaru</h2>
              <button type="button" className="text-sahabat" aria-label="Tambah catatan"><Plus size={18} /></button>
            </div>
            <ul className="mt-4 space-y-4">
              {CATATAN.map((c, i) => (
                <li key={c.judul} className={i > 0 ? 'border-t border-sahabat-garis pt-4' : ''}>
                  <p className="font-semibold text-gray-900">{c.judul}</p>
                  <p className="mt-1 text-sm text-gray-500">{c.isi}</p>
                  <p className="mt-1 text-xs text-gray-400">{c.meta}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-center">
              <button type="button" className="text-sm font-semibold text-sahabat hover:underline">Lihat Semua Riwayat</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
