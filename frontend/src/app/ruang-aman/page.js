'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2, FileText, LogOut } from 'lucide-react'
import useChatbotStore from '@/stores/chatbotStore'
import PanelDarurat from '@/components/PanelDarurat'
import KodeTiket from '@/components/KodeTiket'
import { api, ApiError, SEKOLAH_ID } from '@/lib/api'

/**
 * Indikator "sedang menyusun jawaban".
 *
 * Tiga titik memantul + teks menenangkan. Ditampilkan selama ~3-4 detik saat
 * model berpikir (reasoning disembunyikan). Tidak mempercepat apa pun —
 * tugasnya cuma membuat tunggu terasa disengaja dan tenang, bukan rusak.
 * Teksnya jujur: jawabannya memang sedang disusun.
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

/**
 * RuangAman (spec §4.1B).
 *
 * Perilaku yang tidak boleh dikompromikan: begitu `mode === 'krisis'`, input
 * chat HILANG dan panel darurat mengambil alih. Bukan disabled, bukan
 * diberi peringatan lalu tetap bisa dipakai — hilang. Membiarkan anak terus
 * mengetik ke bot setelah dia menulis indikasi bunuh diri persis kegagalan
 * yang bikin scope "asisten lapor" ini dipilih sejak awal.
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
  } = useChatbotStore()

  const [input, setInput] = useState('')
  const [kirimLoading, setKirimLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasil, setHasil] = useState(null)
  const bawah = useRef(null)

  useEffect(() => {
    initSession()
  }, [initSession])

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
    //
    // Bug yang diperbaiki di sini: parameter `prioritas` dulu dideklarasikan
    // tapi tidak pernah dipakai, jadi anak yang mengetik "pengen mati" (11
    // karakter) melihat panel darurat, menekan "Buat Laporan Prioritas", lalu
    // dijawab "Ceritanya masih terlalu singkat untuk jadi laporan."
    //
    // Panel itu menjanjikan bantuan, lalu menolaknya karena kurang panjang —
    // ke anak yang baru saja menulis hal tersulit dalam hidupnya. Itu bukan
    // sekadar bug; itu penolakan pada momen yang paling menentukan.
    const daruratMenang = prioritas || mode === 'krisis'

    if (!daruratMenang && cerita.length < 15) {
      setError(
        'Ceritanya masih terlalu singkat untuk jadi laporan. Ceritakan sedikit lagi, atau pakai form Lapor Sekarang.'
      )
      setKirimLoading(false)
      return
    }

    // Server menerima laporan krisis berapa pun panjangnya (deteksi krisis
    // berjalan sebelum validasi). Penanda ini murni supaya Guru BK tahu
    // laporan sesingkat ini datang dari panel darurat, bukan dari iseng.
    const deskripsi = daruratMenang
      ? `[Laporan prioritas dari RuangAman — terdeteksi indikasi krisis]\n\n${cerita || '(siswa tidak menulis apa pun selain pesan yang memicu deteksi krisis)'}`
      : cerita

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
        <KodeTiket
          kode={hasil.kode_tiket}
          krisis={hasil.krisis}
          onSelesai={() => router.push('/')}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-sahabat-latar px-4 py-6">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-sahabat"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Kembali
        </Link>

        <div className="overflow-hidden rounded-2xl border border-sahabat-garis bg-white shadow-sm">
          <header className="border-b border-sahabat-garis p-5">
            <h1 className="text-lg font-bold text-gray-900">Ruang Aman</h1>
            <p className="text-sm text-gray-600">
              Asisten pelaporan — bantu menyusun ceritamu untuk Guru BK
            </p>
          </header>

          <div className="max-h-[55vh] space-y-3 overflow-y-auto p-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    m.role === 'user'
                      ? 'bg-sahabat text-white'
                      : 'bg-sahabat-muda text-gray-900'
                  }`}
                >
                  {/* Gelembung asisten yang masih kosong = jawaban sedang
                      disusun (reasoning jalan di gateway, ~3-4 detik, sengaja
                      disembunyikan). Tampilkan indikator hangat, bukan gelembung
                      kosong: anak yang cemas butuh tanda bahwa dia didengar,
                      bukan layar diam yang terasa rusak. */}
                  {m.role === 'assistant' && m.content === '' ? (
                    <IndikatorMengetik />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {m.content}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Spinner mandiri HANYA untuk jeda sebelum gelembung asisten ada
                (jalur non-stream: krisis/gangguan). Saat streaming, gelembungnya
                sudah muncul dan menampilkan IndikatorMengetik sendiri, jadi ini
                tidak dobel. */}
            {loading &&
              messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-sahabat-muda px-4 py-3">
                    <IndikatorMengetik />
                  </div>
                </div>
              )}

            <div ref={bawah} />
          </div>

          <div className="border-t border-sahabat-garis p-5">
            {krisis ? (
              // Input SENGAJA tidak dirender sama sekali dalam mode krisis.
              <PanelDarurat
                hotline={hotline}
                onBuatLaporan={() => jadikanLaporan(true)}
              />
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
                      <FileText size={18} aria-hidden="true" />
                    )}
                    Jadikan Laporan
                  </button>
                )}

                <form onSubmit={kirim} className="flex gap-2">
                  <label htmlFor="pesan" className="sr-only">
                    Tulis ceritamu
                  </label>
                  <input
                    id="pesan"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={loading}
                    placeholder="Tulis ceritamu..."
                    className="w-full rounded-xl border border-sahabat-garis bg-white p-3 text-gray-900 outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="rounded-xl bg-sahabat px-4 font-semibold text-white transition hover:bg-sahabat-tua disabled:opacity-40"
                    aria-label="Kirim"
                  >
                    <Send size={18} aria-hidden="true" />
                  </button>
                </form>
              </>
            )}

            {error && (
              <p role="alert" className="mt-3 text-sm text-darurat">
                {error}
              </p>
            )}

            {!krisis && (
              <p className="mt-3 text-center text-xs text-gray-500">
                Kalau mau langsung lapor tanpa ngobrol,{' '}
                <Link href="/lapor" className="font-medium text-sahabat underline">
                  pakai form ini
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
