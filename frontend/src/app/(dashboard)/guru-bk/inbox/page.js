"use client";

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AlertTriangle, BrainCircuit, Loader2, Inbox, ChevronDown, Download } from 'lucide-react'

/**
 * Antrean laporan Guru BK (Report - #LPR).
 */

const URGENSI = {
  KRITIS: { label: 'Kritis', kelas: 'bg-red-100 text-red-800', dot: 'bg-red-500', urutan: 4 },
  TINGGI: { label: 'Tinggi', kelas: 'bg-red-100 text-red-800', dot: 'bg-red-500', urutan: 3 },
  SEDANG: { label: 'Sedang', kelas: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500', urutan: 2 },
  RENDAH: { label: 'Rendah', kelas: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500', urutan: 1 },
}

const STATUS = {
  MENUNGGU: { label: 'Menunggu', badge: 'bg-[#E6EEFF] text-[#3525CD]', icon: 'Inbox' },
  DIPROSES: { label: 'Analisis', badge: 'bg-[#E6EEFF] text-[#3525CD]', icon: 'Search' },
  SELESAI: { label: 'Selesai', badge: 'bg-[#E0F9E8] text-[#166534]', icon: 'CheckCircle' },
  DITUTUP: { label: 'Ditutup', badge: 'bg-gray-100 text-gray-700', icon: 'XCircle' },
}

const AMBANG_CONFIDENCE = 0.6

function formatTanggal(iso) {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

export default function InboxPage() {
  const [laporan, setLaporan] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tabAktif, setTabAktif] = useState('Semua Laporan')

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

  const urut = [...laporan].sort((a, b) => {
    if (a.flag_krisis !== b.flag_krisis) return a.flag_krisis ? -1 : 1
    const ua = URGENSI[a.urgensi_final]?.urutan ?? 0
    const ub = URGENSI[b.urgensi_final]?.urutan ?? 0
    if (ua !== ub) return ub - ua
    return new Date(b.created_at) - new Date(a.created_at) // Newer first if same urgency
  })

  // Filter based on active tab
  const dataDitampilkan = tabAktif === 'Semua Laporan' ? urut : urut.filter(l => l.status === 'DIPROSES') // Assuming "Tugas Saya" is currently in process

  const menunggu = (l) => l.ai_gagal && l.ai_klasifikasi?.menunggu === true
  const perluBaca = (l) =>
    (l.ai_gagal && !menunggu(l)) ||
    (l.ai_confidence !== null && l.ai_confidence < AMBANG_CONFIDENCE)

  const stats = {
    total: urut.length,
    tinggi: urut.filter(l => l.flag_krisis || ['KRITIS', 'TINGGI'].includes(l.urgensi_final)).length,
    analisis: urut.filter(l => l.status === 'MENUNGGU' || l.status === 'DIPROSES').length,
    selesai: urut.filter(l => l.status === 'SELESAI').length
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-[#3525CD]" size={40} />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Laporan</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan pantau semua laporan masuk untuk tindak lanjut.</p>
        </div>
        <div className="flex bg-[#F1F5F9] p-1 rounded-xl">
          <button 
            onClick={() => setTabAktif('Semua Laporan')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg ${tabAktif === 'Semua Laporan' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Semua Laporan
          </button>
          <button 
            onClick={() => setTabAktif('Tugas Saya')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg ${tabAktif === 'Tugas Saya' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Tugas Saya
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#E6EEFF] rounded-full flex items-center justify-center flex-shrink-0">
            <Image src="/ikon7.svg" alt="Total" width={24} height={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Laporan Aktif</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FEF2F2] rounded-full flex items-center justify-center flex-shrink-0">
            <Image src="/ikon8.svg" alt="Tinggi" width={24} height={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Urgensi Tinggi</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.tinggi}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FFF7ED] rounded-full flex items-center justify-center flex-shrink-0">
            <Image src="/ikon9.svg" alt="Analisis" width={24} height={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dalam Analisis</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.analisis}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#E0F9E8] rounded-full flex items-center justify-center flex-shrink-0">
            <Image src="/ikon10.svg" alt="Selesai" width={24} height={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Diselesaikan</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.selesai}</p>
          </div>
        </div>
      </div>

      {/* Table Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Semua Urgensi
            <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Semua Status
            <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Semua Kategori
            <ChevronDown size={16} />
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-100 text-xs font-semibold text-gray-500 tracking-wider">
                <th className="px-6 py-4">ID LAPORAN</th>
                <th className="px-6 py-4">KATEGORI & URGENSI</th>
                <th className="px-6 py-4">SISWA TERKAIT</th>
                <th className="px-6 py-4">TANGGAL</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dataDitampilkan.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    <Inbox className="mx-auto text-gray-300 mb-2" size={32} />
                    Belum ada laporan {tabAktif === 'Tugas Saya' && 'untuk tugasmu saat ini'}
                  </td>
                </tr>
              ) : (
                dataDitampilkan.map((l) => {
                  const urg = URGENSI[l.urgensi_final] || URGENSI.RENDAH
                  const st = STATUS[l.status] || STATUS.MENUNGGU
                  const isKritis = l.flag_krisis || ['KRITIS'].includes(l.urgensi_final)
                  
                  return (
                    <tr key={l.id} className={`hover:bg-gray-50/50 transition relative ${isKritis ? 'border-l-4 border-l-red-600' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">#{l.id.substring(0, 8).toUpperCase()}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{l.anonim ? 'Anonim' : 'Teridentifikasi'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${urg.kelas}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${urg.dot}`}></span>
                            {urg.label}
                          </span>
                          <span className="text-sm text-gray-700">{l.jenis_final || 'Belum dianalisis'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded bg-[#E6EEFF] text-[#3525CD] text-xs font-medium font-mono">
                          {l.anonim ? '***-anon' : 'SIS-****'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatTanggal(l.created_at)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1.5 rounded-lg text-xs font-medium ${st.badge}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/guru-bk/laporan/${l.id}`}
                          className="inline-flex px-4 py-2 bg-[#F1F5F9] text-[#3525CD] text-sm font-semibold rounded-lg hover:bg-[#E6EEFF] transition"
                        >
                          Lihat →
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        {dataDitampilkan.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Menampilkan 1-{dataDitampilkan.length} dari {dataDitampilkan.length}</span>
            <div className="flex gap-1">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-[#3525CD] text-white font-medium">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">3</button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">&gt;</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
