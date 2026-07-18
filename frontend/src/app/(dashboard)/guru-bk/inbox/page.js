'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Inbox, AlertOctagon, ClipboardList, CheckCircle2, Filter, Download, ArrowRight, Loader2, BrainCircuit } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/**
 * Daftar Laporan Guru BK (desain citra "Halaman Report Semua Laporan").
 *
 * Dua aturan inti dari versi sebelumnya DIPERTAHANKAN:
 * 1. Urut pakai `urgensi_final` (+ krisis dulu) — keputusan manusia menang
 *    atas tebakan AI.
 * 2. TIDAK ada pratinjau isi cerita di daftar. Setiap pembacaan harus lewat
 *    halaman detail yang mencatat audit_akses; cuplikan di sini = laporan bisa
 *    dibaca tanpa jejak.
 *
 * ID siswa tersamar (laporan memang anonim, pelapor_id null) — token dari id
 * laporan supaya cocok desain tanpa membocorkan identitas.
 */

const URGENSI = {
  KRITIS: { label: 'Kritis', dot: 'bg-darurat', teks: 'text-darurat', urut: 4 },
  TINGGI: { label: 'Tinggi', dot: 'bg-red-500', teks: 'text-red-600', urut: 3 },
  SEDANG: { label: 'Sedang', dot: 'bg-amber-500', teks: 'text-amber-700', urut: 2 },
  RENDAH: { label: 'Rendah', dot: 'bg-gray-400', teks: 'text-gray-500', urut: 1 },
}

const STATUS = {
  MENUNGGU: { label: 'Baru', kelas: 'bg-sahabat-muda text-sahabat-tua' },
  DIPROSES: { label: 'Analisis', kelas: 'bg-blue-50 text-blue-600' },
  SELESAI: { label: 'Selesai', kelas: 'bg-emerald-50 text-emerald-600' },
  DITUTUP: { label: 'Ditutup', kelas: 'bg-gray-100 text-gray-500' },
}

const JENIS_LABEL = { SIBER: 'Cyberbullying', FISIK: 'Bullying Fisik', VERBAL: 'Ejekan Verbal', SOSIAL: 'Perundungan Sosial', SEKSUAL: 'Kekerasan Seksual' }
const PER_HAL = 8

function token(id) {
  const s = String(id || '').replace(/-/g, '')
  return `***-${s.slice(-3)}`
}
function repId(id) {
  const s = String(id || '').replace(/-/g, '').toUpperCase()
  return `#REP-${s.slice(-4)}`
}
function waktuLalu(iso) {
  if (!iso) return ''
  const menit = Math.round((Date.now() - new Date(iso)) / 60000)
  if (menit < 60) return `${menit} menit yang lalu`
  const jam = Math.round(menit / 60)
  if (jam < 24) return `${jam} jam yang lalu`
  return ''
}
function tgl(iso) {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export default function InboxPage() {
  const { user } = useAuth()
  const [laporan, setLaporan] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [tab, setTab] = useState('semua')
  const [fUrgensi, setFUrgensi] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fKategori, setFKategori] = useState('')
  const [hal, setHal] = useState(1)

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
    return () => { batal = true }
  }, [])

  const stat = useMemo(() => {
    const aktif = laporan.filter((l) => l.status !== 'SELESAI' && l.status !== 'DITUTUP').length
    const tinggi = laporan.filter((l) => l.urgensi_final === 'KRITIS' || l.urgensi_final === 'TINGGI' || l.flag_krisis).length
    const analisis = laporan.filter((l) => l.status === 'DIPROSES').length
    const selesai = laporan.filter((l) => l.status === 'SELESAI').length
    return { aktif, tinggi, analisis, selesai }
  }, [laporan])

  const terfilter = useMemo(() => {
    let list = [...laporan]
    if (tab === 'tugas') list = list.filter((l) => l.penanganan_guru_id === user?.id)
    if (fUrgensi) list = list.filter((l) => l.urgensi_final === fUrgensi)
    if (fStatus) list = list.filter((l) => l.status === fStatus)
    if (fKategori) list = list.filter((l) => l.jenis_final === fKategori)
    list.sort((a, b) => {
      if (a.flag_krisis !== b.flag_krisis) return a.flag_krisis ? -1 : 1
      const ua = URGENSI[a.urgensi_final]?.urut ?? 0
      const ub = URGENSI[b.urgensi_final]?.urut ?? 0
      if (ua !== ub) return ub - ua
      return new Date(a.created_at) - new Date(b.created_at)
    })
    return list
  }, [laporan, tab, fUrgensi, fStatus, fKategori, user])

  const totalHal = Math.max(1, Math.ceil(terfilter.length / PER_HAL))
  const halKini = Math.min(hal, totalHal)
  const tampil = terfilter.slice((halKini - 1) * PER_HAL, halKini * PER_HAL)

  function exportCSV() {
    const baris = [['ID', 'Kategori', 'Urgensi', 'Siswa', 'Tanggal', 'Status']]
    for (const l of terfilter) {
      baris.push([repId(l.id), JENIS_LABEL[l.jenis_final] || '-', l.urgensi_final || '-', token(l.id), l.created_at || '-', STATUS[l.status]?.label || l.status])
    }
    const csv = baris.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'laporan-sahabat.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-sahabat" aria-label="Memuat" /></div>
  if (error) return (
    <div className="px-6 py-8 lg:px-10">
      <div role="alert" className="rounded-2xl border-2 border-darurat bg-darurat-muda p-5">
        <p className="font-semibold text-darurat">Gagal memuat daftar laporan</p>
        <p className="mt-1 text-sm text-gray-800">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Laporan</h1>
          <p className="mt-1 text-gray-500">Kelola dan pantau semua laporan masuk untuk tindak lanjut.</p>
        </div>
        <div className="flex rounded-xl border border-sahabat-garis bg-white p-1">
          {[['semua', 'Semua Laporan'], ['tugas', 'Tugas Saya']].map(([k, label]) => (
            <button key={k} type="button" onClick={() => { setTab(k); setHal(1) }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === k ? 'bg-sahabat-muda text-sahabat' : 'text-gray-500 hover:text-gray-800'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <Stat ikon={Inbox} bg="bg-sahabat-muda" warna="text-sahabat" label="Total Laporan Aktif" nilai={stat.aktif} />
        <Stat ikon={AlertOctagon} bg="bg-darurat-muda" warna="text-darurat" label="Urgensi Tinggi" nilai={stat.tinggi} />
        <Stat ikon={ClipboardList} bg="bg-amber-100" warna="text-amber-700" label="Dalam Analisis" nilai={stat.analisis} />
        <Stat ikon={CheckCircle2} bg="bg-emerald-100" warna="text-emerald-600" label="Diselesaikan" nilai={stat.selesai} />
      </div>

      {/* Filter bar */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-sahabat-garis bg-white p-4">
        <span className="flex items-center gap-2 text-sm text-gray-400"><Filter size={16} aria-hidden="true" /></span>
        <Select value={fUrgensi} onChange={(e) => { setFUrgensi(e.target.value); setHal(1) }} opsi={[['', 'Semua Urgensi'], ['KRITIS', 'Kritis'], ['TINGGI', 'Tinggi'], ['SEDANG', 'Sedang'], ['RENDAH', 'Rendah']]} />
        <Select value={fStatus} onChange={(e) => { setFStatus(e.target.value); setHal(1) }} opsi={[['', 'Semua Status'], ['MENUNGGU', 'Baru'], ['DIPROSES', 'Analisis'], ['SELESAI', 'Selesai'], ['DITUTUP', 'Ditutup']]} />
        <Select value={fKategori} onChange={(e) => { setFKategori(e.target.value); setHal(1) }} opsi={[['', 'Semua Kategori'], ['SIBER', 'Cyberbullying'], ['FISIK', 'Bullying Fisik'], ['VERBAL', 'Ejekan Verbal'], ['SOSIAL', 'Perundungan Sosial'], ['SEKSUAL', 'Kekerasan Seksual']]} />
        <button type="button" onClick={exportCSV} className="ml-auto flex items-center gap-2 rounded-xl border border-sahabat-garis px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-sahabat-latar">
          <Download size={16} aria-hidden="true" /> Export CSV
        </button>
      </div>

      {/* Tabel */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-sahabat-garis bg-white shadow-sm">
        {tampil.length === 0 ? (
          <div className="p-12 text-center">
            <Inbox className="mx-auto text-gray-300" size={40} aria-hidden="true" />
            <p className="mt-3 font-medium text-gray-700">Tidak ada laporan yang cocok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-sahabat-garis text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-4 font-medium">ID Laporan</th>
                  <th className="px-6 py-4 font-medium">Kategori &amp; Urgensi</th>
                  <th className="px-6 py-4 font-medium">Siswa Terkait</th>
                  <th className="px-6 py-4 font-medium">Tanggal</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sahabat-garis">
                {tampil.map((l) => {
                  const u = URGENSI[l.urgensi_final] || URGENSI.RENDAH
                  const st = STATUS[l.status] || { label: l.status, kelas: 'bg-gray-100 text-gray-600' }
                  const lalu = waktuLalu(l.created_at)
                  return (
                    <tr key={l.id} className={`transition hover:bg-sahabat-latar ${l.flag_krisis ? 'border-l-4 border-l-darurat' : ''}`}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{repId(l.id)}</p>
                        <p className="text-xs text-gray-400">Anonim</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium ${u.teks}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.dot}`} aria-hidden="true" /> {u.label}
                        </span>
                        <p className="mt-1 font-medium text-gray-800">{JENIS_LABEL[l.jenis_final] || '—'}</p>
                        {(l.ai_gagal && l.ai_klasifikasi?.menunggu !== true) && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700"><BrainCircuit size={11} /> baca manual</span>
                        )}
                      </td>
                      <td className="px-6 py-4"><span className="rounded bg-sahabat-latar px-2 py-1 font-mono text-xs text-gray-600">{token(l.id)}</span></td>
                      <td className="px-6 py-4">
                        <p className="text-gray-800">{tgl(l.created_at)}</p>
                        {lalu && <p className={`text-xs ${l.flag_krisis ? 'text-darurat' : 'text-gray-400'}`}>{lalu}</p>}
                      </td>
                      <td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.kelas}`}>{st.label}</span></td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/guru-bk/laporan/${l.id}`} className="inline-flex items-center gap-1 rounded-lg border border-sahabat-garis px-3 py-1.5 text-sm font-semibold text-sahabat transition hover:bg-sahabat-muda">
                          Lihat <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sahabat-garis px-6 py-4">
          <p className="text-sm text-gray-500">
            Menampilkan {tampil.length ? (halKini - 1) * PER_HAL + 1 : 0}-{(halKini - 1) * PER_HAL + tampil.length} dari {terfilter.length}
          </p>
          <div className="flex items-center gap-1">
            <button type="button" disabled={halKini <= 1} onClick={() => setHal(halKini - 1)} className="rounded-lg border border-sahabat-garis px-3 py-1.5 text-sm disabled:opacity-40">‹</button>
            {Array.from({ length: totalHal }, (_, i) => i + 1).slice(0, 5).map((n) => (
              <button key={n} type="button" onClick={() => setHal(n)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${n === halKini ? 'bg-sahabat text-white' : 'border border-sahabat-garis text-gray-700'}`}>{n}</button>
            ))}
            <button type="button" disabled={halKini >= totalHal} onClick={() => setHal(halKini + 1)} className="rounded-lg border border-sahabat-garis px-3 py-1.5 text-sm disabled:opacity-40">›</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ ikon: Ikon, bg, warna, label, nilai }) {
  return (
    <div className="rounded-2xl border border-sahabat-garis bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${warna}`}><Ikon size={22} aria-hidden="true" /></span>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className="mt-3 text-4xl font-extrabold text-gray-900">{nilai}</p>
    </div>
  )
}

function Select({ value, onChange, opsi }) {
  return (
    <select value={value} onChange={onChange} className="rounded-xl border border-sahabat-garis bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-sahabat">
      {opsi.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}
