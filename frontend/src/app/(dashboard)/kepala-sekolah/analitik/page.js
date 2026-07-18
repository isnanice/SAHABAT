'use client'

import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, BrainCircuit, FileText, Loader2 } from 'lucide-react'

/**
 * Dashboard analitik sekolah (spec §4.3).
 *
 * Semua angka di sini berasal dari `urgensi_final` / `jenis_final` —
 * keputusan Guru BK, bukan tebakan AI. Kalau grafik dibangun dari label AI,
 * sekolah membuat kebijakan berdasarkan apa yang mesin kira terjadi.
 */

// Palet urgensi sengaja tidak mengandalkan warna saja: setiap batang punya
// label teks, dan urutannya tetap (Rendah -> Kritis). Sekitar 1 dari 12 anak
// laki-laki buta warna merah-hijau, dan kepala sekolah juga manusia.
const WARNA_URGENSI = {
  RENDAH: '#059669',
  SEDANG: '#d97706',
  TINGGI: '#ea580c',
  KRITIS: '#dc2626',
}
const URUTAN_URGENSI = ['RENDAH', 'SEDANG', 'TINGGI', 'KRITIS']

const PERIODE = [
  { nilai: '7d', label: '7 hari' },
  { nilai: '30d', label: '30 hari' },
  { nilai: '90d', label: '90 hari' },
]

function Kartu({ label, nilai, ikon: Ikon, nada = 'netral', catatan }) {
  const gaya = {
    netral: 'border-sahabat-garis bg-white',
    bahaya: 'border-darurat bg-darurat-muda',
    perhatian: 'border-amber-300 bg-amber-50',
  }[nada]

  return (
    <div className={`rounded-2xl border p-5 ${gaya}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {Ikon && <Ikon size={16} aria-hidden="true" />}
        {label}
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900">{nilai}</p>
      {catatan && <p className="mt-1 text-xs text-gray-600">{catatan}</p>}
    </div>
  )
}

function Panel({ judul, keterangan, children, kosong }) {
  return (
    <section className="rounded-2xl border border-sahabat-garis bg-white p-5">
      <h2 className="text-sm font-bold text-gray-900">{judul}</h2>
      {keterangan && <p className="mt-0.5 text-xs text-gray-500">{keterangan}</p>}
      <div className="mt-4">
        {kosong ? (
          <p className="py-10 text-center text-sm text-gray-400">Belum ada data</p>
        ) : (
          children
        )}
      </div>
    </section>
  )
}

export default function AnalitikPage() {
  const [periode, setPeriode] = useState('30d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let batal = false
    ;(async () => {
      // setLoading dipanggil di dalam async, bukan langsung di badan effect:
      // setState sinkron di badan effect memicu render bertingkat.
      if (!batal) setLoading(true)
      try {
        const res = await fetch(`/api/analitik?periode=${periode}`)
        const json = await res.json()
        if (batal) return
        if (!res.ok) throw new Error(json?.error || 'Gagal memuat analitik')
        setData(json)
        setError('')
      } catch (e) {
        if (!batal) setError(e.message)
      } finally {
        if (!batal) setLoading(false)
      }
    })()
    return () => {
      batal = true
    }
  }, [periode])

  if (loading && !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-sahabat" aria-label="Memuat" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div role="alert" className="rounded-2xl border-2 border-darurat bg-darurat-muda p-5">
          <p className="font-semibold text-darurat">Gagal memuat analitik</p>
          <p className="mt-1 text-sm text-gray-800">{error}</p>
        </div>
      </div>
    )
  }

  const urgensi = URUTAN_URGENSI.map((u) => ({
    nama: u,
    jumlah: data.perUrgensi.find((x) => x.nama === u)?.jumlah ?? 0,
  }))

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitik Sekolah</h1>
          <p className="mt-1 text-sm text-gray-600">
            Berdasarkan penilaian akhir Guru BK, bukan klasifikasi otomatis.
          </p>
        </div>

        <div className="flex gap-1 rounded-xl border border-sahabat-garis bg-white p-1">
          {PERIODE.map((p) => (
            <button
              key={p.nilai}
              type="button"
              onClick={() => setPeriode(p.nilai)}
              aria-pressed={periode === p.nilai}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                periode === p.nilai
                  ? 'bg-sahabat text-white'
                  : 'text-gray-600 hover:bg-sahabat-latar'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Kartu label="Total laporan" nilai={data.total} ikon={FileText} />
        <Kartu
          label="Ditandai krisis"
          nilai={data.krisis}
          ikon={AlertTriangle}
          nada={data.krisis > 0 ? 'bahaya' : 'netral'}
          catatan={data.krisis > 0 ? 'Perlu penanganan langsung' : undefined}
        />
        {/* Angka kejujuran sistem. Kalau tinggi, klasifikasi otomatis sedang
            tidak bisa diandalkan — sekolah berhak tahu itu, bukan cuma
            melihat grafik yang rapi dan menyimpulkan semuanya terkendali. */}
        <Kartu
          label="Perlu dibaca manual"
          nilai={data.perluBacaManual}
          ikon={BrainCircuit}
          nada={data.perluBacaManual > 0 ? 'perhatian' : 'netral'}
          catatan="AI gagal atau tidak yakin"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel
          judul="Urgensi kasus"
          keterangan="Penilaian akhir Guru BK"
          kosong={data.total === 0}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={urgensi} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sahabat-ungu-muda)" vertical={false} />
                <XAxis dataKey="nama" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'var(--sahabat-latar)' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--sahabat-garis)', fontSize: 13 }}
                  formatter={(v) => [`${v} laporan`, '']}
                />
                <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                  {urgensi.map((u) => (
                    <Cell key={u.nama} fill={WARNA_URGENSI[u.nama]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel judul="Jenis perundungan" kosong={data.perJenis.length === 0}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.perJenis}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 4, left: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sahabat-ungu-muda)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="nama"
                  width={110}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--sahabat-latar)' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--sahabat-garis)', fontSize: 13 }}
                  formatter={(v) => [`${v} laporan`, '']}
                />
                <Bar dataKey="jumlah" fill="var(--sahabat-ungu)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* "Heatmap" lokasi = GROUP BY lokasi, dirender sebagai bar.
          Spec §4.3 eksplisit: tidak perlu peta beneran. Peta denah sekolah
          butuh koordinat per sekolah yang tidak akan pernah kita punya untuk
          demo, dan bar ini menjawab pertanyaan yang sama: di mana paling
          sering terjadi. */}
      <div className="mt-4">
        <Panel
          judul="Titik rawan"
          keterangan="Lokasi yang paling sering disebut dalam laporan"
          kosong={data.perLokasi.length === 0}
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.perLokasi}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 4, left: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sahabat-ungu-muda)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="nama"
                  width={150}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--sahabat-latar)' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--sahabat-garis)', fontSize: 13 }}
                  formatter={(v) => [`${v} laporan`, '']}
                />
                <Bar dataKey="jumlah" fill="var(--sahabat-ungu)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-4">
        <Panel judul="Tren per minggu" kosong={data.tren.length === 0}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.tren} margin={{ top: 4, right: 16, bottom: 4, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--sahabat-ungu-muda)" vertical={false} />
                <XAxis dataKey="minggu" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--sahabat-garis)', fontSize: 13 }}
                  formatter={(v) => [`${v} laporan`, '']}
                  labelFormatter={(l) => `Minggu ${l}`}
                />
                <Line
                  type="monotone"
                  dataKey="jumlah"
                  stroke="var(--sahabat-ungu)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Peringatan ini penting justru saat angkanya kelihatan bagus.
          Laporan yang MASUK bukan jumlah perundungan yang TERJADI — anak yang
          paling takut adalah yang paling mungkin tidak melapor. Grafik turun
          bisa berarti keadaan membaik, atau berarti anak-anak berhenti
          percaya. Kepala sekolah harus membaca angka ini dengan sadar itu. */}
      <p className="mt-6 rounded-2xl bg-sahabat-latar p-4 text-xs leading-relaxed text-gray-600">
        <strong>Cara membaca angka ini:</strong> yang tergambar adalah laporan
        yang <em>masuk</em>, bukan perundungan yang <em>terjadi</em>. Angka naik
        bisa berarti siswa makin percaya untuk melapor — bukan otomatis berarti
        keadaan memburuk. Angka turun juga belum tentu membaik. Pakai data ini
        untuk mengarahkan perhatian, bukan untuk menilai kinerja.
      </p>
    </div>
  )
}
