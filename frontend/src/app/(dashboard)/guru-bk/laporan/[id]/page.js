'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  AlertTriangle,
  BrainCircuit,
  Loader2,
  Send,
  ShieldCheck,
} from 'lucide-react'

/**
 * Detail laporan untuk Guru BK (spec §4.2).
 *
 * Membuka halaman ini MENULIS `audit_akses`. Itu ditegakkan di server
 * (GET /api/laporan/[id]) dan permintaan ditolak kalau auditnya gagal —
 * bukan sekadar dicoba lalu dilewat. Laporan anak tidak boleh dibaca tanpa
 * jejak siapa yang membacanya.
 */

const URGENSI = ['RENDAH', 'SEDANG', 'TINGGI', 'KRITIS']
const JENIS = ['VERBAL', 'FISIK', 'SIBER', 'SOSIAL', 'SEKSUAL']
const STATUS = ['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITUTUP']

const AMBANG_CONFIDENCE = 0.6

function formatTanggal(iso) {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export default function DetailLaporanPage({ params }) {
  const { id } = use(params)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [simpan, setSimpan] = useState(false)
  const [pesanSimpan, setPesanSimpan] = useState('')

  const [balasan, setBalasan] = useState('')
  const [kirim, setKirim] = useState(false)

  async function muat() {
    const res = await fetch(`/api/laporan/${id}`)
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error || 'Gagal memuat laporan')
    return json
  }

  useEffect(() => {
    let batal = false
    ;(async () => {
      try {
        const json = await muat()
        if (!batal) setData(json)
      } catch (e) {
        if (!batal) setError(e.message)
      } finally {
        if (!batal) setLoading(false)
      }
    })()
    return () => {
      batal = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function patch(body, label) {
    setSimpan(true)
    setPesanSimpan('')
    try {
      const res = await fetch(`/api/laporan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal menyimpan')
      setData((d) => ({ ...d, ...body }))
      setPesanSimpan(`${label} tersimpan.`)
    } catch (e) {
      setPesanSimpan(`Gagal: ${e.message}`)
    } finally {
      setSimpan(false)
    }
  }

  async function kirimBalasan(e) {
    e.preventDefault()
    if (!balasan.trim() || kirim) return
    setKirim(true)
    try {
      const res = await fetch(`/api/laporan/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isi: balasan.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal mengirim')
      setBalasan('')
      setData(await muat())
    } catch (e) {
      setPesanSimpan(`Gagal: ${e.message}`)
    } finally {
      setKirim(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-sahabat" aria-label="Memuat" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div role="alert" className="rounded-2xl border-2 border-darurat bg-darurat-muda p-5">
          <p className="font-semibold text-darurat">Tidak bisa membuka laporan</p>
          <p className="mt-1 text-sm text-gray-800">{error}</p>
        </div>
      </div>
    )
  }

  const perluBaca =
    data.ai_gagal || (data.ai_confidence !== null && data.ai_confidence < AMBANG_CONFIDENCE)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link
        href="/guru-bk/inbox"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-sahabat"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Kembali ke antrean
      </Link>

      {data.flag_krisis && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-3 rounded-2xl border-2 border-darurat bg-darurat-muda p-4"
        >
          <AlertTriangle className="mt-0.5 shrink-0 text-darurat" size={20} aria-hidden="true" />
          <div>
            <p className="font-bold text-darurat">Laporan terindikasi krisis</p>
            <p className="mt-1 text-sm text-gray-800">
              Terdeteksi indikasi bunuh diri, menyakiti diri, atau kekerasan seksual.
              Tandai ini sebagai prioritas penanganan langsung.
            </p>
          </div>
        </div>
      )}

      {perluBaca && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <BrainCircuit className="mt-0.5 shrink-0 text-amber-600" size={20} aria-hidden="true" />
          <div>
            <p className="font-semibold text-amber-900">
              {data.ai_gagal ? 'AI gagal mengklasifikasi' : 'AI tidak yakin dengan klasifikasinya'}
            </p>
            <p className="mt-1 text-sm text-amber-900">
              Jangan bersandar pada label di halaman ini. Baca sendiri ceritanya dan
              tentukan urgensinya secara manual.
            </p>
          </div>
        </div>
      )}

      <article className="rounded-2xl border border-sahabat-garis bg-white p-6">
        <h1 className="text-lg font-bold text-gray-900">Isi Laporan</h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>Dikirim {formatTanggal(data.created_at)}</span>
          {data.lokasi && <span>Lokasi: {data.lokasi}</span>}
          {data.tanggal_kejadian && <span>Kejadian: {data.tanggal_kejadian}</span>}
        </div>

        <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-900">
          {data.deskripsi}
        </p>

        <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-sahabat-latar p-3 text-xs text-gray-600">
          <ShieldCheck size={14} aria-hidden="true" />
          Pelapor anonim — sistem tidak menyimpan identitasnya. Aksesmu ke laporan ini
          sudah tercatat di log audit.
        </p>
      </article>

      {/* Jejak AI ditampilkan terpisah dari keputusan manusia, dan sengaja
          read-only. Kalau override menimpa kolom ai_*, tidak akan pernah ada
          cara membuktikan seberapa sering AI-nya keliru. */}
      <section className="mt-4 rounded-2xl border border-sahabat-garis bg-white p-6">
        <h2 className="text-sm font-bold text-gray-900">Hasil AI (tidak bisa diubah)</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs text-gray-500">Urgensi</dt>
            <dd className="font-medium text-gray-900">{data.ai_urgensi || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Jenis</dt>
            <dd className="font-medium text-gray-900">{data.ai_jenis || '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Keyakinan</dt>
            <dd className="font-medium text-gray-900">
              {data.ai_confidence !== null && data.ai_confidence !== undefined
                ? `${Math.round(data.ai_confidence * 100)}%`
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500">Status AI</dt>
            <dd className="font-medium text-gray-900">{data.ai_gagal ? 'Gagal' : 'Berhasil'}</dd>
          </div>
        </dl>
        {data.ai_klasifikasi?.alasan && (
          <p className="mt-3 rounded-xl bg-sahabat-latar p-3 text-sm text-gray-700">
            <span className="font-medium">Alasan AI:</span> {data.ai_klasifikasi.alasan}
          </p>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-sahabat-garis bg-white p-6">
        <h2 className="text-sm font-bold text-gray-900">Keputusanmu</h2>
        <p className="mt-1 text-xs text-gray-500">
          Penilaianmu yang dipakai untuk mengurutkan antrean, bukan penilaian AI.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="urgensi" className="block text-xs font-semibold text-gray-700">
              Urgensi
            </label>
            <select
              id="urgensi"
              value={data.urgensi_final || ''}
              disabled={simpan}
              onChange={(e) => patch({ urgensi_final: e.target.value }, 'Urgensi')}
              className="mt-1.5 w-full rounded-xl border border-sahabat-garis p-2.5 text-sm outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
            >
              {URGENSI.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="jenis" className="block text-xs font-semibold text-gray-700">
              Jenis
            </label>
            <select
              id="jenis"
              value={data.jenis_final || ''}
              disabled={simpan}
              onChange={(e) => patch({ jenis_final: e.target.value }, 'Jenis')}
              className="mt-1.5 w-full rounded-xl border border-sahabat-garis p-2.5 text-sm outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
            >
              <option value="">Belum ditentukan</option>
              {JENIS.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-xs font-semibold text-gray-700">
              Status
            </label>
            <select
              id="status"
              value={data.status || ''}
              disabled={simpan}
              onChange={(e) => patch({ status: e.target.value }, 'Status')}
              className="mt-1.5 w-full rounded-xl border border-sahabat-garis p-2.5 text-sm outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
            >
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {pesanSimpan && (
          <p
            aria-live="polite"
            className={`mt-3 text-sm ${
              pesanSimpan.startsWith('Gagal') ? 'text-darurat' : 'text-emerald-700'
            }`}
          >
            {pesanSimpan}
          </p>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-sahabat-garis bg-white p-6">
        <h2 className="text-sm font-bold text-gray-900">Balasan ke siswa</h2>
        <p className="mt-1 text-xs text-gray-500">
          Siswa membacanya lewat kode tiketnya, tetap anonim. Dia tidak tahu namamu.
        </p>

        {data.pesan?.length ? (
          <ul className="mt-4 space-y-3">
            {data.pesan.map((p) => (
              <li key={p.id} className={`flex ${p.dari_staf ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    p.dari_staf ? 'bg-sahabat text-white' : 'bg-sahabat-muda text-gray-900'
                  }`}
                >
                  <p className="text-xs font-semibold opacity-80">
                    {p.dari_staf ? 'Guru BK' : 'Siswa'}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{p.isi}</p>
                  <p className="mt-1 text-[11px] opacity-70">{formatTanggal(p.dibuat_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl bg-sahabat-latar p-3 text-sm text-gray-600">
            Belum ada percakapan.
          </p>
        )}

        <form onSubmit={kirimBalasan} className="mt-4">
          <label htmlFor="balas" className="sr-only">
            Tulis balasan
          </label>
          <textarea
            id="balas"
            value={balasan}
            onChange={(e) => setBalasan(e.target.value.slice(0, 2000))}
            rows={3}
            placeholder="Tulis balasan untuk siswa..."
            className="w-full resize-y rounded-xl border border-sahabat-garis p-3 text-sm outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
          />
          <button
            type="submit"
            disabled={!balasan.trim() || kirim}
            className="mt-2 flex items-center gap-2 rounded-xl bg-sahabat px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sahabat-tua disabled:opacity-40"
          >
            {kirim ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Send size={16} aria-hidden="true" />
            )}
            Kirim balasan
          </button>
        </form>
      </section>
    </div>
  )
}
