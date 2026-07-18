'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, BrainCircuit, Loader2, Send, ShieldCheck, Info, BookOpen, Paperclip,
  Printer, UserPlus, Sparkles, Clock, PenLine, Zap, RefreshCw, CalendarClock, UserSearch,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/**
 * Detail laporan Guru BK (desain citra "Halaman Detail Laporan").
 *
 * Membuka halaman ini MENULIS `audit_akses` (ditegakkan server; permintaan
 * ditolak kalau auditnya gagal). Laporan anak tidak boleh dibaca tanpa jejak.
 *
 * Semua fungsi lama dipertahankan: hasil AI read-only, keputusan manusia
 * (urgensi/jenis/status), catatan internal, dan balasan ke siswa.
 */

const URGENSI = ['RENDAH', 'SEDANG', 'TINGGI', 'KRITIS']
const JENIS = ['VERBAL', 'FISIK', 'SIBER', 'SOSIAL', 'SEKSUAL']
const STATUS = ['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITUTUP']
const JENIS_LABEL = { SIBER: 'Bullying Cyber', FISIK: 'Bullying Fisik', VERBAL: 'Kekerasan Verbal', SOSIAL: 'Perundungan Sosial', SEKSUAL: 'Kekerasan Seksual' }
const STATUS_LABEL = { MENUNGGU: 'Baru', DIPROSES: 'Dalam Analisis', SELESAI: 'Selesai', DITUTUP: 'Ditutup' }
const AMBANG_CONFIDENCE = 0.6

function fTanggal(iso) {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso))
}
function fJam(iso) {
  if (!iso) return ''
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}
function anonId(id) {
  const s = String(id || '').replace(/-/g, '')
  let n = 0
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 10000
  return `ANON-${String(n).padStart(4, '0')}`
}
function repId(id) {
  return `#REP-${String(id || '').replace(/-/g, '').toUpperCase().slice(-4)}`
}

export default function DetailLaporanPage({ params }) {
  const { id } = use(params)
  const { user } = useAuth()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [simpan, setSimpan] = useState(false)
  const [pesanSimpan, setPesanSimpan] = useState('')
  const [statusPilih, setStatusPilih] = useState('')
  const [catatan, setCatatan] = useState('')
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
        if (batal) return
        setData(json)
        setStatusPilih(json.status || 'MENUNGGU')
        setCatatan(json.catatan_internal || '')
      } catch (e) { if (!batal) setError(e.message) }
      finally { if (!batal) setLoading(false) }
    })()
    return () => { batal = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function patch(body, label) {
    setSimpan(true); setPesanSimpan('')
    try {
      const res = await fetch(`/api/laporan/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal menyimpan')
      setData((d) => ({ ...d, ...body }))
      setPesanSimpan(`${label} tersimpan.`)
    } catch (e) { setPesanSimpan(`Gagal: ${e.message}`) }
    finally { setSimpan(false) }
  }

  async function kirimBalasan(e) {
    e.preventDefault()
    if (!balasan.trim() || kirim) return
    setKirim(true)
    try {
      const res = await fetch(`/api/laporan/${id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isi: balasan.trim() }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal mengirim')
      setBalasan(''); setData(await muat())
    } catch (e) { setPesanSimpan(`Gagal: ${e.message}`) }
    finally { setKirim(false) }
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-sahabat" aria-label="Memuat" /></div>
  if (error) return (
    <div className="px-6 py-8 lg:px-10">
      <div role="alert" className="rounded-2xl border-2 border-darurat bg-darurat-muda p-5">
        <p className="font-semibold text-darurat">Tidak bisa membuka laporan</p>
        <p className="mt-1 text-sm text-gray-800">{error}</p>
      </div>
    </div>
  )

  const perluBaca = data.ai_gagal || (data.ai_confidence !== null && data.ai_confidence < AMBANG_CONFIDENCE)
  const kl = data.ai_klasifikasi || {}
  const sentimen = Array.isArray(kl.sentimen) ? kl.sentimen : (kl.sentimen ? [kl.sentimen] : [])
  const kataKunci = Array.isArray(kl.kata_kunci) ? kl.kata_kunci : []
  const rekomendasi = kl.rekomendasi || kl.alasan || null
  const uWarna = { KRITIS: 'text-darurat', TINGGI: 'text-red-600', SEDANG: 'text-amber-700', RENDAH: 'text-gray-500' }[data.urgensi_final] || 'text-gray-500'

  return (
    <div className="px-6 py-8 lg:px-10">
      {/* Header */}
      <p className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/guru-bk/inbox" className="hover:text-sahabat">Report</Link>
        <span>/</span>
        <span className="text-gray-600">Detail Laporan {repId(data.id)}</span>
      </p>
      <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan {repId(data.id)}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-sahabat-muda px-2.5 py-0.5 text-xs font-semibold text-sahabat-tua">Status: {STATUS_LABEL[data.status] || data.status}</span>
            <span className={`rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-semibold ${uWarna}`}>Urgensi: {data.urgensi_final || '—'}</span>
            <span className="text-gray-500">Dilaporkan: {fTanggal(data.created_at)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => window.print()} className="flex items-center gap-2 rounded-xl border border-sahabat-garis bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-sahabat-latar"><Printer size={16} /> Cetak PDF</button>
          <button type="button" disabled={simpan} onClick={() => patch({ penanganan_guru_id: user?.id }, 'Penugasan')} className="flex items-center gap-2 rounded-xl border border-sahabat-garis bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-sahabat-latar disabled:opacity-40"><UserPlus size={16} /> Tugaskan</button>
          <button type="button" disabled={simpan} onClick={() => { patch({ status: 'DIPROSES' }, 'Status'); setStatusPilih('DIPROSES') }} className="flex items-center gap-2 rounded-xl bg-sahabat px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sahabat-tua disabled:opacity-40"><Sparkles size={16} /> Tangani Laporan</button>
        </div>
      </div>

      {data.flag_krisis && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-darurat bg-darurat-muda p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-darurat" size={20} aria-hidden="true" />
          <div>
            <p className="font-bold text-darurat">Laporan terindikasi krisis</p>
            <p className="mt-1 text-sm text-gray-800">Terdeteksi indikasi bunuh diri, menyakiti diri, atau kekerasan seksual. Tandai sebagai prioritas penanganan langsung.</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* ===================== KIRI ===================== */}
        <div className="space-y-6 lg:col-span-2">
          {/* Informasi Dasar */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Info size={20} className="text-sahabat" /> Informasi Dasar</h2>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <Info2 label="Kategori Kejadian" value={JENIS_LABEL[data.jenis_final] || data.jenis_final || '—'} />
              <div>
                <dt className="text-sm text-gray-500">Pelapor (Identitas Sesi)</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-sahabat-hijau">{anonId(data.id)} <ShieldCheck size={15} /></dd>
              </div>
              <Info2 label="Lokasi Kejadian (Terindikasi)" value={data.lokasi || 'Tidak disebutkan'} />
              <Info2 label="Waktu Kejadian (Terindikasi)" value={data.tanggal_kejadian || 'Tidak disebutkan'} />
            </dl>
          </section>

          {/* Kronologi */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900"><BookOpen size={20} className="text-sahabat" /> Kronologi Kejadian (Hasil Intake AI)</h2>
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-gray-800">{data.deskripsi}</p>
            <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-sahabat-latar p-3 text-xs text-gray-500">
              <ShieldCheck size={14} /> Pelapor anonim — sistem tidak menyimpan identitasnya. Aksesmu ke laporan ini sudah tercatat di log audit.
            </p>
          </section>

          {/* Bukti & Saksi */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Paperclip size={20} className="text-sahabat" /> Bukti &amp; Saksi</h2>
            <p className="mt-4 text-sm text-gray-500">Lampiran Bukti ({data.bukti_urls?.length || 0})</p>
            {data.bukti_urls?.length ? (
              <div className="mt-2 flex flex-wrap gap-3">
                {data.bukti_urls.map((u, i) => (
                  <a key={i} href={u} target="_blank" rel="noreferrer" className="flex h-24 w-24 items-center justify-center rounded-xl border border-sahabat-garis bg-sahabat-latar text-gray-400 hover:bg-sahabat-muda"><Paperclip size={20} /></a>
                ))}
              </div>
            ) : (
              <p className="mt-2 rounded-xl bg-sahabat-latar p-3 text-sm text-gray-500">Belum ada lampiran bukti. Unggah bukti belum diaktifkan pada versi ini.</p>
            )}
            <p className="mt-4 text-sm text-gray-500">Saksi Terindikasi</p>
            <p className="mt-2 rounded-xl bg-sahabat-latar p-3 text-sm italic text-gray-600">{data.nama_saksi || 'Belum ada saksi yang disebutkan secara spesifik. Perlu penggalian lebih lanjut.'}</p>
          </section>

          {/* Balasan ke siswa (fungsi dipertahankan) */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900"><Send size={18} className="text-sahabat" /> Balasan ke Siswa</h2>
            <p className="mt-1 text-sm text-gray-500">Siswa membacanya lewat kode tiketnya, tetap anonim. Dia tidak tahu namamu.</p>
            {data.pesan?.length ? (
              <ul className="mt-4 space-y-3">
                {data.pesan.map((p) => (
                  <li key={p.id} className={`flex ${p.dari_staf ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${p.dari_staf ? 'bg-sahabat text-white' : 'bg-sahabat-muda text-gray-900'}`}>
                      <p className="text-xs font-semibold opacity-80">{p.dari_staf ? 'Guru BK' : 'Siswa'}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{p.isi}</p>
                      <p className="mt-1 text-[11px] opacity-70">{fTanggal(p.dibuat_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 rounded-xl bg-sahabat-latar p-3 text-sm text-gray-500">Belum ada percakapan.</p>}
            <form onSubmit={kirimBalasan} className="mt-4">
              <textarea value={balasan} onChange={(e) => setBalasan(e.target.value.slice(0, 2000))} rows={3} placeholder="Tulis balasan untuk siswa..." className="w-full resize-y rounded-xl border border-sahabat-garis p-3 text-sm outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30" />
              <button type="submit" disabled={!balasan.trim() || kirim} className="mt-2 flex items-center gap-2 rounded-xl bg-sahabat px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sahabat-tua disabled:opacity-40">
                {kirim ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Kirim balasan
              </button>
            </form>
          </section>
        </div>

        {/* ===================== KANAN ===================== */}
        <div className="space-y-6">
          {/* Analisis AI */}
          <section className="rounded-2xl border border-sahabat-garis bg-sahabat-muda/40 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><Sparkles size={18} className="text-sahabat" /> Analisis AI</h2>
            {perluBaca && (
              <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800"><BrainCircuit size={13} className="mt-0.5 shrink-0" /> AI {data.ai_gagal ? 'gagal' : 'ragu'} — jangan bersandar pada label, baca sendiri ceritanya.</p>
            )}
            <p className="mt-4 text-sm text-gray-500">Sentimen Terdeteksi</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sentimen.length ? sentimen.map((s) => <span key={s} className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">{s}</span>)
                : <span className="rounded-full bg-white px-3 py-1 text-xs text-gray-500">{data.ai_urgensi ? `Urgensi ${data.ai_urgensi}` : '—'}</span>}
            </div>
            {kataKunci.length > 0 && (
              <>
                <p className="mt-4 text-sm text-gray-500">Kata Kunci Penting</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {kataKunci.map((k) => <span key={k} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-sahabat-tua">{k}</span>)}
                </div>
              </>
            )}
            <p className="mt-4 text-sm text-gray-500">Rekomendasi Tindakan</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-800">{rekomendasi || 'Belum ada rekomendasi dari AI. Tinjau kronologi dan tentukan tindakan secara manual.'}</p>
            <p className="mt-3 text-[11px] text-gray-400">Keyakinan AI: {data.ai_confidence != null ? `${Math.round(data.ai_confidence * 100)}%` : '—'} · read-only</p>
          </section>

          {/* Timeline */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><Clock size={18} className="text-sahabat" /> Timeline Laporan</h2>
            <ol className="mt-4 space-y-4">
              <TimelineItem aktif judul="Laporan Diterima" waktu={fTanggal(data.created_at)} sub="Diteruskan ke Guru BK" last={false} />
              <TimelineItem aktif={!!data.updated_at && data.updated_at !== data.created_at} judul="Terakhir Diperbarui" waktu={data.updated_at ? fTanggal(data.updated_at) : '—'} sub={`Status: ${STATUS_LABEL[data.status] || data.status}`} last />
            </ol>
          </section>

          {/* Catatan Internal */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><PenLine size={18} className="text-sahabat" /> Catatan Internal</h2>
            <textarea value={catatan} onChange={(e) => setCatatan(e.target.value.slice(0, 2000))} rows={4} placeholder="Tambahkan catatan observasi atau rencana tindakan di sini... (Hanya terlihat oleh konselor)" className="mt-3 w-full resize-y rounded-xl border border-sahabat-garis p-3 text-sm outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30" />
            <button type="button" disabled={simpan} onClick={() => patch({ catatan_internal: catatan }, 'Catatan')} className="mt-2 w-full rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-40">Simpan Catatan</button>
          </section>

          {/* Aksi Cepat */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><Zap size={18} className="text-sahabat" /> Aksi Cepat</h2>
            <div className="mt-4 space-y-3">
              <Link href="/guru-bk/konseling" className="flex items-center gap-2 rounded-xl border border-sahabat-garis px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-sahabat-latar"><CalendarClock size={16} /> Jadwalkan Konseling</Link>
              <button type="button" className="flex w-full items-center gap-2 rounded-xl border border-sahabat-garis px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-sahabat-latar"><UserSearch size={16} /> Panggil Siswa</button>
            </div>
          </section>

          {/* Update Status + keputusan */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><RefreshCw size={18} className="text-sahabat" /> Update Status</h2>
            <select value={statusPilih} onChange={(e) => setStatusPilih(e.target.value)} className="mt-3 w-full rounded-xl border border-sahabat-garis p-2.5 text-sm outline-none focus:border-sahabat">
              {STATUS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <button type="button" disabled={simpan} onClick={() => patch({ status: statusPilih }, 'Status')} className="mt-3 w-full rounded-xl bg-sahabat py-2.5 font-semibold text-white transition hover:bg-sahabat-tua disabled:opacity-40">Perbarui Status</button>

            <div className="mt-5 border-t border-sahabat-garis pt-4">
              <p className="text-xs font-semibold text-gray-500">Keputusanmu (menentukan urutan antrean)</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <select value={data.urgensi_final || ''} disabled={simpan} onChange={(e) => patch({ urgensi_final: e.target.value }, 'Urgensi')} className="rounded-xl border border-sahabat-garis p-2 text-sm outline-none focus:border-sahabat">
                  {URGENSI.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <select value={data.jenis_final || ''} disabled={simpan} onChange={(e) => patch({ jenis_final: e.target.value }, 'Jenis')} className="rounded-xl border border-sahabat-garis p-2 text-sm outline-none focus:border-sahabat">
                  <option value="">Jenis…</option>
                  {JENIS.map((j) => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </div>

            {pesanSimpan && <p aria-live="polite" className={`mt-3 text-sm ${pesanSimpan.startsWith('Gagal') ? 'text-darurat' : 'text-emerald-700'}`}>{pesanSimpan}</p>}
          </section>
        </div>
      </div>
    </div>
  )
}

function Info2({ label, value }) {
  return (
    <div>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="mt-0.5 font-semibold text-gray-900">{value}</dd>
    </div>
  )
}

function TimelineItem({ aktif, judul, waktu, sub, last }) {
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${aktif ? 'bg-sahabat' : 'bg-gray-300'}`} aria-hidden="true" />
        {!last && <span className={`w-0.5 flex-1 ${aktif ? 'bg-sahabat/40' : 'bg-gray-200'}`} aria-hidden="true" />}
      </div>
      <div className="pb-1">
        <p className={`font-semibold ${aktif ? 'text-gray-900' : 'text-gray-400'}`}>{judul}</p>
        <p className="text-xs text-gray-500">{waktu}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </li>
  )
}
