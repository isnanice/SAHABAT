'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Upload, BookMarked, Pencil, Share2, TrendingUp, Send, FileText, Loader2 } from 'lucide-react'

/**
 * Edukasi — manajemen modul (desain citra "Halaman Edukasi").
 *
 * Perpustakaan Konten sekarang membaca modul_edukasi SUNGGUHAN lewat
 * GET /api/edukasi/kelola (termasuk draft, bukan cuma yang aktif — beda
 * dari GET /api/edukasi yang dipakai siswa).
 *
 * Metrik "Kinerja Konten" (tayangan, rata-rata penyelesaian per hari) masih
 * ilustratif — belum ada pipeline analitik yang mencatatnya. "Modul Aktif"
 * di kartu itu SUDAH nyata (dihitung dari data yang sama).
 */

const KINERJA = [40, 55, 70, 92, 60, 68, 85]
const TIPE_IKON = { ARTIKEL: FileText, VIDEO: FileText, QUIZ: FileText, INFOGRAFIS: FileText }

export default function EdukasiGuruBK() {
  const [daftar, setDaftar] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modul, setModul] = useState('')
  const [kelompok, setKelompok] = useState('Kelas 10 - Semua')

  useEffect(() => {
    let batal = false
    ;(async () => {
      try {
        const res = await fetch('/api/edukasi/kelola')
        const data = await res.json()
        if (batal) return
        if (!res.ok) throw new Error(data?.error || 'Gagal memuat daftar modul')
        setDaftar(Array.isArray(data) ? data : [])
        if (data?.[0]?.judul) setModul(data[0].judul)
      } catch (e) {
        if (!batal) setError(e.message)
      } finally {
        if (!batal) setLoading(false)
      }
    })()
    return () => { batal = true }
  }, [])

  const jumlahAktif = daftar.filter((m) => m.aktif).length

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-gray-900">Edukasi</h1>
          <p className="mt-1 text-gray-500">
            Kelola modul perpustakaan, lacak tingkat penyelesaian, dan tetapkan
            sumber daya kepada kelompok siswa untuk mendukung kesejahteraan mental.
          </p>
        </div>
        <Link href="/guru-bk/edukasi/unggah" className="flex items-center gap-2 rounded-xl bg-sahabat px-5 py-3 font-semibold text-white transition hover:bg-sahabat-tua">
          <Upload size={18} aria-hidden="true" /> Unggah Konten Baru
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Kinerja Konten */}
        <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900">Kinerja Konten</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <MiniStat label="Jumlah Tayangan" nilai="1,450" delta="+15% Bulan ini" />
            <MiniStat label="Rata-rata" nilai="78%" delta="+3% Bulan ini" />
            <MiniStat label="Modul Aktif" nilai={jumlahAktif} sub={`${daftar.length} total termasuk draft`} />
          </div>
          <div className="mt-5 flex h-52 items-end justify-between gap-3 rounded-xl border border-sahabat-garis p-4">
            {KINERJA.map((h, i) => (
              <div key={i} className={`w-full rounded-t-md ${i === 3 ? 'bg-sahabat' : 'bg-sahabat-muda'}`} style={{ height: `${h}%` }} />
            ))}
          </div>
        </section>

        {/* Tetapkan Konten */}
        <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Tetapkan Konten</h2>
          <p className="mt-1 text-sm text-gray-500">Targetkan modul spesifik untuk kelompok siswa atau kelas.</p>

          <label className="mt-4 block text-sm font-medium text-gray-700">Select Module</label>
          <select value={modul} onChange={(e) => setModul(e.target.value)} disabled={!daftar.length} className="mt-1.5 w-full rounded-xl border border-sahabat-garis bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-sahabat disabled:opacity-50">
            {daftar.length === 0 && <option>Belum ada modul</option>}
            {daftar.map((m) => <option key={m.id} value={m.judul}>{m.judul}</option>)}
          </select>

          <label className="mt-4 block text-sm font-medium text-gray-700">Kelompok Sasaran</label>
          <select value={kelompok} onChange={(e) => setKelompok(e.target.value)} className="mt-1.5 w-full rounded-xl border border-sahabat-garis bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-sahabat">
            <option>Kelas 10 - Semua</option>
            <option>Kelas 11 - Semua</option>
            <option>Kelas 12 - Semua</option>
          </select>

          <label className="mt-4 block text-sm font-medium text-gray-700">Tanggal Jatuh Tempo (Opsional)</label>
          <input type="date" className="mt-1.5 w-full rounded-xl border border-sahabat-garis bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-sahabat" />

          <button type="button" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-sahabat-muda py-3 font-semibold text-sahabat-tua transition hover:bg-sahabat-muda/70">
            Kirim Tugas <Send size={16} aria-hidden="true" />
          </button>
        </section>
      </div>

      {/* Perpustakaan Konten */}
      <section className="mt-6 rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <BookMarked size={20} className="text-sahabat" aria-hidden="true" /> Perpustakaan Konten
        </h2>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-sahabat" aria-label="Memuat" /></div>
        ) : error ? (
          <p className="py-6 text-center text-sm text-darurat" role="alert">{error}</p>
        ) : daftar.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
            Belum ada modul. <Link href="/guru-bk/edukasi/unggah" className="font-semibold text-sahabat hover:underline">Unggah yang pertama →</Link>
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {daftar.map((m) => {
              const Ikon = TIPE_IKON[m.tipe] || FileText
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-sahabat-garis p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sahabat-muda text-sahabat">
                    <Ikon size={22} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase ${m.aktif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {m.aktif ? 'Aktif' : 'Draft'}
                      </span>
                      <span className="rounded bg-sahabat-muda px-2 py-0.5 text-[11px] font-bold uppercase text-sahabat-tua">{m.tipe}</span>
                      <h3 className="font-bold text-gray-900">{m.judul}</h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{m.deskripsi || 'Belum ada ringkasan.'}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Poin Reward</p>
                    <p className="font-semibold text-gray-900">+{m.poin_reward ?? 0}</p>
                  </div>
                  <div className="flex gap-2 text-gray-400">
                    <button type="button" className="rounded-lg p-2 hover:bg-sahabat-latar" aria-label="Edit"><Pencil size={16} /></button>
                    <button type="button" className="rounded-lg p-2 hover:bg-sahabat-latar" aria-label="Bagikan"><Share2 size={16} /></button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function MiniStat({ label, nilai, delta, sub }) {
  return (
    <div className="rounded-xl border border-sahabat-garis p-4">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-gray-900">{nilai}</p>
      {delta && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600"><TrendingUp size={12} /> {delta}</p>}
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}
