'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Loader2,
  LogOut,
  MoreVertical,
  FileWarning,
  Trash2,
  ShieldCheck,
  Sparkles,
  Paperclip,
  Check,
  FileText,
  ClipboardList,
  UserRound,
} from 'lucide-react'
import useChatbotStore from '@/stores/chatbotStore'
import PanelDarurat from '@/components/PanelDarurat'
import KodeTiket from '@/components/KodeTiket'
import { api, ApiError, SEKOLAH_ID, ambilSesi } from '@/lib/api'

/**
 * Indikator "sedang menyusun jawaban".
 *
 * Tiga titik memantul + teks menenangkan. Ditampilkan selama ~3-4 detik saat
 * model berpikir (reasoning disembunyikan). Tidak mempercepat apa pun —
 * tugasnya cuma membuat tunggu terasa disengaja dan tenang, bukan rusak.
 */
function IndikatorMengetik() {
  return (
    <div className="flex items-center gap-2" aria-label="Sedang menyusun jawaban">
      <span className="flex gap-1" aria-hidden="true">
        <span className="h-2 w-2 animate-bounce rounded-full bg-sahabat [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-sahabat [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-sahabat" />
      </span>
      <span className="text-xs text-gray-500">Sedang menyusun jawaban…</span>
    </div>
  )
}

// Langkah "Progress Laporan" di sidebar (desain citra). Yang menyala mengikuti
// kemajuan sesi: mulai cerita -> bisa jadikan draft.
function langkahProgres(bisaDraft) {
  return [
    { judul: 'Ruang Aman (AI Intake)', sub: 'Cerita dengan Asisten AI', ikon: Check, aktif: true },
    { judul: 'Penyusunan Draft', sub: 'AI merangkum cerita', ikon: FileText, aktif: bisaDraft },
    { judul: 'Tinjau & Lengkapi', sub: 'Cek draft sebelum kirim', ikon: ClipboardList, aktif: false },
    { judul: 'Guru BK (Pendampingan)', sub: 'Bantuan profesional', ikon: UserRound, aktif: false },
  ]
}

/**
 * RuangAman (spec §4.1B) — layout mengikuti desain citra "Ruang Aman Asisten".
 *
 * Perilaku yang tidak boleh dikompromikan: begitu `mode === 'krisis'`, input
 * chat HILANG dan panel darurat mengambil alih. Bukan disabled — hilang.
 * Membiarkan anak terus mengetik ke bot setelah menulis indikasi bunuh diri
 * persis kegagalan yang bikin scope "asisten lapor" ini dipilih sejak awal.
 */
export default function RuangAmanPage() {
  const router = useRouter()
  const {
    messages,
    loading,
    mode,
    hotline,
    bisaJadikanLaporan,
    initSession,
    sendMessage,
    transkrip,
    reset,
  } = useChatbotStore()

  const [input, setInput] = useState('')
  const [kirimLoading, setKirimLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasil, setHasil] = useState(null)
  const [menuBuka, setMenuBuka] = useState(false)
  const [anonId, setAnonId] = useState('----')
  const bawah = useRef(null)

  useEffect(() => {
    initSession()
  }, [initSession])

  // Identitas Sesi "ANON-XXXX" diturunkan dari id sesi (yang cuma dipakai rate
  // limit, bukan identitas). Angkanya stabil selama tab terbuka; tidak pernah
  // dikirim ke server bersama laporan. Dihitung di klien agar tak ada mismatch
  // hidrasi.
  useEffect(() => {
    const s = ambilSesi()
    let n = 0
    for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 10000
    setAnonId(String(n).padStart(4, '0'))
  }, [])

  useEffect(() => {
    bawah.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, mode])

  const krisis = mode === 'krisis'

  async function kirim(e) {
    e.preventDefault()
    const teks = input.trim()
    if (!teks || loading || krisis) return
    setInput('')
    await sendMessage(teks)
  }

  function akhiriSesi() {
    reset()
    router.push('/')
  }

  function hapusRiwayat() {
    reset()
    initSession()
    setMenuBuka(false)
  }

  async function jadikanLaporan(prioritas = false) {
    if (kirimLoading) return
    setKirimLoading(true)
    setError('')

    const percakapan = transkrip()
    const cerita = percakapan
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n')
      .trim()

    // Laporan prioritas dari panel darurat TIDAK PERNAH ditolak karena pendek.
    // Panel menjanjikan bantuan; menolaknya karena kurang panjang — ke anak
    // yang baru menulis hal tersulit dalam hidupnya — bukan sekadar bug, itu
    // penolakan pada momen paling menentukan.
    const daruratMenang = prioritas || mode === 'krisis'

    if (!daruratMenang && cerita.length < 15) {
      setError(
        'Ceritanya masih terlalu singkat untuk jadi laporan. Ceritakan sedikit lagi, atau pakai form Lapor Sekarang.'
      )
      setKirimLoading(false)
      return
    }

    // Jalur biasa: mampir ke Tinjau Draft dulu (desain citra, langkah 2 dari 3).
    // Jalur krisis SENGAJA tidak lewat sini — laporannya langsung berangkat.
    if (!daruratMenang) {
      router.push('/ruang-aman/tinjau')
      setKirimLoading(false)
      return
    }

    const deskripsi = `[Laporan prioritas dari RuangAman — terdeteksi indikasi krisis]\n\n${cerita || '(siswa tidak menulis apa pun selain pesan yang memicu deteksi krisis)'}`

    try {
      setHasil(
        await api.kirimLaporan({
          sekolah_id: SEKOLAH_ID,
          deskripsi: deskripsi.slice(0, 2000),
          transkrip_chat: percakapan,
        })
      )
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Laporanmu gagal terkirim. Coba lagi, atau hubungi Guru BK langsung.'
      )
    } finally {
      setKirimLoading(false)
    }
  }

  if (hasil?.kode_tiket) {
    return (
      <main className="min-h-screen bg-sahabat-latar px-4 py-10">
        <KodeTiket kode={hasil.kode_tiket} krisis={hasil.krisis} onSelesai={() => router.push('/')} />
      </main>
    )
  }

  const progres = langkahProgres(bisaJadikanLaporan)

  return (
    <main className="min-h-screen bg-sahabat-latar px-4 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-sahabat">
          <ArrowLeft size={18} aria-hidden="true" /> Kembali
        </Link>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* ===================== SIDEBAR KIRI ===================== */}
          <aside className="w-full shrink-0 space-y-6 lg:w-80">
            {/* Progress Laporan */}
            <div className="rounded-2xl border border-sahabat-garis bg-white p-5 shadow-sm">
              <h2 className="font-bold text-gray-900">Progress Laporan</h2>
              <ol className="mt-4 space-y-4">
                {progres.map((l, i) => {
                  const Ikon = l.ikon
                  return (
                    <li key={l.judul} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            l.aktif ? 'bg-sahabat text-white' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Ikon size={15} aria-hidden="true" />
                        </span>
                        {i < progres.length - 1 && (
                          <span className={`mt-1 w-0.5 flex-1 ${l.aktif ? 'bg-sahabat/40' : 'bg-gray-200'}`} aria-hidden="true" />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className={`text-sm font-semibold ${l.aktif ? 'text-sahabat-tua' : 'text-gray-500'}`}>
                          {l.judul}
                        </p>
                        <p className="text-xs text-gray-500">{l.sub}</p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>

            {/* Identitas Sesi */}
            <div className="rounded-2xl border border-sahabat-garis bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">Identitas Sesi</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-wide text-gray-900">ANON-{anonId}</p>

              <hr className="my-4 border-sahabat-garis" />

              <p className="text-sm text-gray-500">Status Konselor</p>
              <div className="mt-2 flex items-center gap-2 rounded-xl bg-sahabat-muda px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-sahabat" aria-hidden="true" />
                <span className="font-semibold text-sahabat-tua">
                  {krisis ? 'Mode Darurat' : 'Mengumpulkan Info'}
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-500">
                Asisten AI sedang membantumu menyusun draf laporan. Ceritakan
                kejadiannya, AI akan merangkumnya untuk Guru BK.
              </p>

              <button
                type="button"
                onClick={akhiriSesi}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-darurat-muda px-4 py-3 font-semibold text-darurat transition hover:bg-darurat-muda/70"
              >
                <LogOut size={18} aria-hidden="true" /> Akhiri Sesi
              </button>
            </div>
          </aside>

          {/* ===================== CHAT KANAN ===================== */}
          <div className="flex min-h-[70vh] flex-1 flex-col overflow-hidden rounded-2xl border border-sahabat-garis bg-white shadow-sm">
            {/* Header */}
            <header className="relative flex items-center gap-3 border-b border-sahabat-garis p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sahabat text-white">
                <Sparkles size={20} aria-hidden="true" />
              </span>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-gray-900">Ruang Aman Asisten</h1>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-sahabat">
                  <ShieldCheck size={14} aria-hidden="true" /> AI Pendamping
                </span>
              </div>

              <button
                type="button"
                onClick={() => setMenuBuka((v) => !v)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-sahabat-latar"
                aria-label="Menu"
                aria-expanded={menuBuka}
              >
                <MoreVertical size={20} aria-hidden="true" />
              </button>

              {menuBuka && (
                <div className="absolute right-4 top-16 z-10 w-56 overflow-hidden rounded-xl border border-sahabat-garis bg-white py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={() => { setMenuBuka(false); jadikanLaporan(false) }}
                    disabled={!bisaJadikanLaporan || kirimLoading}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-sahabat-latar disabled:opacity-40"
                  >
                    <FileWarning size={16} aria-hidden="true" /> Tinjau Draft Laporan
                  </button>
                  <button
                    type="button"
                    onClick={hapusRiwayat}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-sahabat-latar"
                  >
                    <Trash2 size={16} aria-hidden="true" /> Hapus Riwayat Chat
                  </button>
                  <button
                    type="button"
                    onClick={akhiriSesi}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-darurat transition hover:bg-darurat-muda"
                  >
                    <LogOut size={16} aria-hidden="true" /> Akhiri Sesi
                  </button>
                </div>
              )}
            </header>

            {/* Pesan */}
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <p className="flex items-center justify-center gap-1.5 text-center text-xs font-medium text-sahabat-hijau">
                <ShieldCheck size={13} aria-hidden="true" /> Identitasmu tidak akan pernah diketahui siapapun
              </p>

              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      m.role === 'user' ? 'bg-sahabat text-white' : 'bg-sahabat-muda text-gray-900'
                    }`}
                  >
                    {m.role === 'assistant' && m.content === '' ? (
                      <IndikatorMengetik />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {loading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-sahabat-muda px-4 py-3">
                    <IndikatorMengetik />
                  </div>
                </div>
              )}

              <div ref={bawah} />
            </div>

            {/* Input / Panel Darurat */}
            <div className="border-t border-sahabat-garis p-5">
              {krisis ? (
                <PanelDarurat hotline={hotline} onBuatLaporan={() => jadikanLaporan(true)} />
              ) : (
                <>
                  {bisaJadikanLaporan && (
                    <button
                      type="button"
                      onClick={() => jadikanLaporan(false)}
                      disabled={kirimLoading}
                      className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-sahabat bg-sahabat-muda px-4 py-3 font-semibold text-sahabat-tua transition hover:bg-sahabat-muda/70 disabled:opacity-40"
                    >
                      {kirimLoading ? (
                        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                      ) : (
                        <FileWarning size={18} aria-hidden="true" />
                      )}
                      Tinjau Draft Laporan
                    </button>
                  )}

                  <form onSubmit={kirim} className="flex items-center gap-2 rounded-2xl border border-sahabat-garis bg-white px-3 py-1.5 focus-within:border-sahabat focus-within:ring-2 focus-within:ring-sahabat/30">
                    {/* Lampiran = "segera hadir" sesuai keputusan: unggah bukti
                        belum diaktifkan. Ikon tetap ada agar cocok desain, tapi
                        tidak bisa diklik supaya tidak menjanjikan yang belum ada. */}
                    <span className="text-gray-300" title="Unggah bukti — segera hadir" aria-hidden="true">
                      <Paperclip size={18} />
                    </span>
                    <label htmlFor="pesan" className="sr-only">Tulis ceritamu</label>
                    <input
                      id="pesan"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={loading}
                      placeholder="Tulis ceritamu untuk disiapkan sebagai draft..."
                      className="w-full bg-transparent py-2 text-gray-900 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="rounded-xl bg-sahabat p-2.5 text-white transition hover:bg-sahabat-tua disabled:opacity-40"
                      aria-label="Kirim"
                    >
                      <Send size={18} aria-hidden="true" />
                    </button>
                  </form>
                </>
              )}

              {error && (
                <p role="alert" className="mt-3 text-sm text-darurat">{error}</p>
              )}

              {!krisis && (
                <p className="mt-3 text-center text-xs text-gray-500">
                  Kalau mau langsung lapor tanpa ngobrol,{' '}
                  <Link href="/lapor" className="font-medium text-sahabat underline">pakai form ini</Link>.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
