'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import {
  MessageSquare,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Map as MapIcon,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { useAuth } from '@/hooks/useAuth'
import { useLaporan } from '@/hooks/useLaporan'

/**
 * Dashboard Guru BK — "Tinjauan Harian" (desain citra "Halaman Dashboard").
 *
 * Angka kartu, tabel kasus, tren, dan titik rawan DIHITUNG dari laporan nyata
 * sekolah (useLaporan sudah discope RLS ke sekolah Guru BK). Kalau belum ada
 * data, semuanya menampilkan nol/keadaan kosong yang jujur — bukan angka demo
 * yang menyesatkan Guru BK.
 *
 * ID siswa tetap tersamar (pelapor_id memang null; yang ditampilkan token dari
 * id laporan) supaya tampilan cocok desain tanpa membocorkan identitas.
 */

const NAMA_BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
const JENIS_LABEL = { SIBER: 'Perundungan Siber', FISIK: 'Kekerasan Fisik', VERBAL: 'Kekerasan Verbal', SOSIAL: 'Perundungan Sosial', SEKSUAL: 'Kekerasan Seksual' }
const URUT_URGENSI = { KRITIS: 4, TINGGI: 3, SEDANG: 2, RENDAH: 1 }

function tokenSiswa(id) {
  if (!id) return 'S-****'
  const s = String(id).replace(/-/g, '')
  return `S-***${s.slice(-3)}`
}

function StatCard({ ikon: Ikon, warna, bg, label, nilai, tag, tagWarna }) {
  return (
    <div className="rounded-2xl border border-sahabat-garis bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${warna}`}>
          <Ikon size={22} aria-hidden="true" />
        </span>
        {tag && <span className={`text-sm font-bold ${tagWarna}`}>{tag}</span>}
      </div>
      <p className="mt-4 text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-4xl font-extrabold text-gray-900">{nilai}</p>
    </div>
  )
}

export default function DashboardGuruBK() {
  const { user } = useAuth()
  const { laporan, loading } = useLaporan({ role: 'GURU_BK', userId: user?.id })

  const s = useMemo(() => {
    const list = laporan || []
    const total = list.length
    const kritis = list.filter((l) => l.urgensi_final === 'KRITIS' || l.flag_krisis).length
    const menengah = list.filter((l) => l.urgensi_final === 'SEDANG').length
    const selesai = list.filter((l) => l.status === 'SELESAI').length
    const resolusi = total ? Math.round((selesai / total) * 100) : 0

    // Tren 6 bulan terakhir per kategori (Fisik/Verbal/Siber).
    const now = new Date()
    const bulan = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      bulan.push({ key: `${d.getFullYear()}-${d.getMonth()}`, nama: NAMA_BULAN[d.getMonth()], Fisik: 0, Verbal: 0, Siber: 0 })
    }
    const idx = Object.fromEntries(bulan.map((b, i) => [b.key, i]))
    for (const l of list) {
      if (!l.created_at) continue
      const d = new Date(l.created_at)
      const k = `${d.getFullYear()}-${d.getMonth()}`
      if (!(k in idx)) continue
      const j = l.jenis_final
      if (j === 'FISIK') bulan[idx[k]].Fisik++
      else if (j === 'VERBAL') bulan[idx[k]].Verbal++
      else if (j === 'SIBER') bulan[idx[k]].Siber++
    }

    // Kasus butuh perhatian: belum selesai, diurutkan urgensi.
    const perhatian = [...list]
      .filter((l) => l.status !== 'SELESAI' && l.status !== 'DITUTUP')
      .sort((a, b) => (URUT_URGENSI[b.urgensi_final] || 0) - (URUT_URGENSI[a.urgensi_final] || 0))
      .slice(0, 4)

    // Titik rawan: frekuensi lokasi.
    const lokasiMap = {}
    for (const l of list) {
      const lok = (l.lokasi || '').trim()
      if (lok) lokasiMap[lok] = (lokasiMap[lok] || 0) + 1
    }
    const rawan = Object.entries(lokasiMap).sort((a, b) => b[1] - a[1]).slice(0, 3)
    const rawanMax = rawan[0]?.[1] || 1

    return { total, kritis, menengah, selesai, resolusi, bulan, perhatian, rawan, rawanMax }
  }, [laporan])

  const bulanIni = NAMA_BULAN[new Date().getMonth()] + ' ' + new Date().getFullYear()

  return (
    <div className="px-6 py-8 lg:px-10">
      {/* Judul */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tinjauan Harian</h1>
          <p className="mt-1 text-gray-500">Pantau indikator kesejahteraan siswa dan laporan masuk.</p>
        </div>
        <span className="flex items-center gap-2 rounded-xl border border-sahabat-garis bg-white px-4 py-2 text-sm font-medium text-gray-700">
          <Calendar size={16} aria-hidden="true" /> {bulanIni}
        </span>
      </div>

      {/* Kartu statistik */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard ikon={MessageSquare} bg="bg-sahabat-muda" warna="text-sahabat" label="Total Laporan Bulan Ini" nilai={s.total} />
        <StatCard ikon={AlertOctagon} bg="bg-darurat-muda" warna="text-darurat" label="Prioritas Tinggi (Kritis)" nilai={s.kritis} tag="Butuh Tindakan" tagWarna="text-darurat" />
        <StatCard ikon={AlertTriangle} bg="bg-amber-100" warna="text-amber-700" label="Prioritas Menengah" nilai={s.menengah} />
        <StatCard ikon={CheckCircle2} bg="bg-emerald-100" warna="text-emerald-600" label="Kasus Selesai" nilai={s.selesai} />
      </div>

      {/* Chart + donut */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900">Tren Kategori Laporan</h2>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.bulan} barGap={4}>
                <XAxis dataKey="nama" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b6b80' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="Fisik" fill="#dbe6ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Verbal" fill="#a5aef0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Siber" fill="#3525cd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
          <h2 className="self-start text-xl font-bold text-gray-900">Tingkat Resolusi</h2>
          <div
            className="mt-6 flex h-44 w-44 items-center justify-center rounded-full"
            style={{ background: `conic-gradient(#3525cd ${s.resolusi * 3.6}deg, #eff4ff 0deg)` }}
          >
            <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
              <span className="text-3xl font-extrabold text-gray-900">{s.resolusi}%</span>
              <span className="text-xs text-gray-500">Diselesaikan</span>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-gray-500">
            Kasus selesai: <span className="font-semibold text-sahabat">{s.selesai} dari {s.total}</span>
          </p>
        </div>
      </div>

      {/* Tabel kasus + titik rawan */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Kasus Membutuhkan Perhatian</h2>
              <p className="text-sm text-gray-500">Daftar diurutkan berdasarkan tingkat urgensi.</p>
            </div>
            <Link href="/guru-bk/inbox" className="text-sm font-semibold text-sahabat hover:underline">Lihat Semua</Link>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-gray-400">Memuat…</p>
          ) : s.perhatian.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">Belum ada kasus yang perlu perhatian. 🎉</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-gray-400">
                    <th className="pb-3 font-medium">ID Siswa</th>
                    <th className="pb-3 font-medium">Tipe Insiden</th>
                    <th className="pb-3 font-medium">Urgensi</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sahabat-garis">
                  {s.perhatian.map((l) => (
                    <tr key={l.id}>
                      <td className="py-3">
                        <span className="rounded-md bg-sahabat-muda px-2.5 py-1 font-mono text-xs font-semibold text-sahabat-tua">
                          {tokenSiswa(l.id)}
                        </span>
                      </td>
                      <td className="py-3 text-gray-800">{JENIS_LABEL[l.jenis_final] || 'Laporan'}</td>
                      <td className="py-3">
                        <UrgensiBadge u={l.urgensi_final} />
                      </td>
                      <td className="py-3 text-gray-600">{l.status === 'MENUNGGU' ? 'Menunggu Asesmen' : l.status === 'DIPROSES' ? 'Sedang Ditangani' : l.status}</td>
                      <td className="py-3">
                        <Link href={`/guru-bk/laporan/${l.id}`} className="text-sm font-semibold text-sahabat hover:underline">Tinjau</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <MapIcon size={18} className="text-sahabat" aria-hidden="true" /> Titik Rawan Sekolah
          </h2>
          <p className="mt-1 text-sm text-gray-500">Area dengan frekuensi laporan tertinggi.</p>

          {s.rawan.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Belum ada data lokasi.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {s.rawan.map(([lokasi, jml], i) => {
                const pct = Math.round((jml / s.rawanMax) * 100)
                const warna = i === 0 ? 'bg-darurat' : i === 1 ? 'bg-amber-600' : 'bg-sahabat'
                const label = i === 0 ? 'Tinggi' : i === 1 ? 'Sedang' : 'Rendah'
                return (
                  <li key={lokasi}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800">{lokasi}</span>
                      <span className="text-gray-500">{label} ({jml})</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-sahabat-latar">
                      <div className={`h-full rounded-full ${warna}`} style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function UrgensiBadge({ u }) {
  const map = {
    KRITIS: 'bg-darurat-muda text-darurat',
    TINGGI: 'bg-red-50 text-red-600',
    SEDANG: 'bg-amber-50 text-amber-700',
    RENDAH: 'bg-sahabat-latar text-gray-500',
  }
  const label = { KRITIS: 'Kritis', TINGGI: 'Tinggi', SEDANG: 'Sedang', RENDAH: 'Rendah' }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${map[u] || map.RENDAH}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> {label[u] || u || '-'}
    </span>
  )
}
