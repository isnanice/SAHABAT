'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Check,
  ChevronDown,
  Image as ImageIcon,
  Info,
  Loader2,
  Pencil,
  Plus,
  Send,
  Shield,
} from 'lucide-react'
import useChatbotStore from '@/stores/chatbotStore'
import { api, ApiError, SEKOLAH_ID } from '@/lib/api'
import KodeTiket from '@/components/KodeTiket'

/**
 * Tinjau Draft Laporan — langkah antara chat dan kirim (desain citra,
 * frame "redesign tinjau draft laporan" 1:2113).
 *
 * Alur: Cerita ✓ -> Tinjau Draft -> Kirim
 *
 * Kenapa langkah ini penting: sebelumnya "Jadikan Laporan" langsung mengirim
 * transkrip mentah. Sekarang AI merangkum, siswa MEMBACA dan boleh mengoreksi
 * sebelum apa pun terkirim. Anak tetap memegang kendali atas ceritanya sendiri
 * — dan itu justru inti produk ini.
 *
 * ===================== TOGGLE ANONIM DIKUNCI ON =====================
 * Desain menampilkan toggle "Kirim Sebagai Anonim" yang bisa dimatikan.
 * Keputusan tim: DIKUNCI ON.
 *
 * Alasannya struktural, bukan preferensi: /api/laporan sengaja TIDAK PERNAH
 * membaca sesi login, dan constraint DB `laporan_anonim_tanpa_identitas`
 * menolak baris anonim yang punya pelapor_id. Supaya toggle bisa dimatikan,
 * jalur laporan harus mulai mengenal identitas pengirim — dan begitu itu ada,
 * bocornya DB berarti ketahuan siapa melaporkan siapa.
 *
 * Kalau tim nanti memutuskan toggle-nya boleh dimatikan, itu bukan sekadar
 * mengganti `disabled` di sini: perlu keputusan sadar soal jalur identitas,
 * constraint DB, dan klaim anonimitas di proposal.
 * ====================================================================
 */

const WARNA = {
  latar: '#f8f9ff',
  ungu: '#3525cd',
  kartu: '#eff4ff',
  garis: '#d3e4fe',
  garisRedup: '#c7c4d8',
  teks: '#0b1c30',
  teksRedup: '#6b6b80',
  teksSedang: '#464555',
  hijau: '#006e2f',
  merah: '#ba1a1a',
  biruMuda: '#eaf1ff',
}

const KATEGORI = [
  { nilai: 'SIBER', label: 'Cyber Bullying' },
  { nilai: 'FISIK', label: 'Physical Bullying' },
  { nilai: 'VERBAL', label: 'Verbal Bullying' },
  { nilai: 'SOSIAL', label: 'Social Bullying' },
  { nilai: 'SEKSUAL', label: 'Kekerasan Seksual' },
]

const URGENSI_LABEL = { RENDAH: 'Rendah', SEDANG: 'Sedang', TINGGI: 'Tinggi', KRITIS: 'Kritis' }

function Langkah({ nomor, label, status }) {
  const selesai = status === 'selesai'
  const aktif = status === 'aktif'
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
        style={{
          background: selesai ? WARNA.hijau : aktif ? WARNA.ungu : '#fff',
          color: selesai || aktif ? '#fff' : WARNA.teksRedup,
          border: selesai || aktif ? 'none' : `1px solid ${WARNA.garisRedup}`,
        }}
      >
        {selesai ? <Check size={18} aria-hidden="true" /> : nomor}
      </div>
      <span
        className="text-xs font-medium"
        style={{ color: selesai ? WARNA.hijau : aktif ? WARNA.ungu : WARNA.teksRedup }}
      >
        {label}
      </span>
    </div>
  )
}

export default function TinjauDraftPage() {
  const router = useRouter()
  const { transkrip } = useChatbotStore()

  const [memuat, setMemuat] = useState(true)
  const [ringkasan, setRingkasan] = useState('')
  const [editRingkasan, setEditRingkasan] = useState(false)
  const [kategori, setKategori] = useState('')
  const [lokasi, setLokasi] = useState('')
  const [waktu, setWaktu] = useState('')
  const [urgensi, setUrgensi] = useState('SEDANG')
  const [aiGagal, setAiGagal] = useState(false)
  const [kirim, setKirim] = useState(false)
  const [error, setError] = useState('')
  const [hasil, setHasil] = useState(null)

  useEffect(() => {
    const percakapan = transkrip()
    const adaCerita = percakapan.some((m) => m.role === 'user' && m.content?.trim())

    if (!adaCerita) {
      router.replace('/ruang-aman')
      return
    }

    let batal = false
    ;(async () => {
      try {
        const d = await api.ringkasDraft(percakapan)
        if (batal) return
        setRingkasan(d.ringkasan || '')
        setKategori(d.jenis || '')
        setLokasi(d.lokasi || '')
        setUrgensi(d.urgensi || 'SEDANG')
        setAiGagal(!!d.ai_gagal)
      } catch (e) {
        if (batal) return
        // AI gagal total: pakai cerita mentah. Jangan halangi siswa melapor.
        const mentah = percakapan
          .filter((m) => m.role === 'user')
          .map((m) => m.content)
          .join('\n')
        setRingkasan(mentah)
        setAiGagal(true)
      } finally {
        if (!batal) setMemuat(false)
      }
    })()
    return () => {
      batal = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function kirimLaporan() {
    if (kirim || !ringkasan.trim()) return
    setKirim(true)
    setError('')
    try {
      setHasil(
        await api.kirimLaporan({
          sekolah_id: SEKOLAH_ID,
          deskripsi: ringkasan.trim().slice(0, 2000),
          ...(lokasi.trim() ? { lokasi: lokasi.trim().slice(0, 100) } : {}),
          ...(waktu ? { tanggal_kejadian: waktu } : {}),
          transkrip_chat: transkrip(),
        })
      )
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Laporanmu gagal terkirim. Coba lagi, atau hubungi Guru BK langsung.'
      )
    } finally {
      setKirim(false)
    }
  }

  if (hasil?.kode_tiket) {
    return (
      <main className="min-h-screen px-4 py-10" style={{ background: WARNA.latar }}>
        <KodeTiket kode={hasil.kode_tiket} krisis={hasil.krisis} onSelesai={() => router.push('/')} />
      </main>
    )
  }

  if (memuat) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        style={{ background: WARNA.latar }}
      >
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin" size={28} style={{ color: WARNA.ungu }} />
          <p className="mt-3 text-sm" style={{ color: WARNA.teksRedup }}>
            AI sedang merangkum ceritamu…
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8" style={{ background: WARNA.latar }}>
      <div className="mx-auto w-full max-w-5xl">
        {/* Stepper: Cerita ✓ -> Tinjau Draft -> Kirim */}
        <div
          className="rounded-2xl p-5"
          style={{ background: WARNA.kartu, border: `1px solid ${WARNA.garis}` }}
        >
          <div className="mx-auto flex max-w-md items-start justify-between">
            <Langkah nomor={1} label="Cerita" status="selesai" />
            <div className="mt-4 h-px flex-1" style={{ background: WARNA.garis }} />
            <Langkah nomor={2} label="Tinjau Draft" status="aktif" />
            <div className="mt-4 h-px flex-1" style={{ background: WARNA.garis }} />
            <Langkah nomor={3} label="Kirim" status="belum" />
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
          {/* ── Kartu utama ── */}
          <section className="rounded-2xl bg-white p-6" style={{ border: `1px solid ${WARNA.garis}` }}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: WARNA.ungu }}
              >
                <Pencil size={18} color="#fff" aria-hidden="true" />
              </div>
              <h1 className="text-lg font-bold" style={{ color: WARNA.teks }}>
                Tinjau Laporan Draft AI
              </h1>
            </div>

            {/* Ringkasan AI — bisa diedit siswa */}
            <div
              className="mt-5 rounded-xl p-4"
              style={{ background: WARNA.kartu, border: `1px solid ${WARNA.garis}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold" style={{ color: WARNA.teks }}>
                  Ringkasan AI
                </p>
                <button
                  type="button"
                  onClick={() => setEditRingkasan((v) => !v)}
                  aria-label={editRingkasan ? 'Selesai mengedit' : 'Edit ringkasan'}
                  style={{ color: WARNA.ungu }}
                >
                  {editRingkasan ? <Check size={16} /> : <Pencil size={16} />}
                </button>
              </div>

              {aiGagal && (
                <p className="mt-1 text-xs" style={{ color: WARNA.merah }}>
                  AI tidak bisa merangkum — ini ceritamu apa adanya. Kamu boleh merapikannya
                  sendiri, atau kirim begini saja.
                </p>
              )}

              {editRingkasan ? (
                <textarea
                  value={ringkasan}
                  onChange={(e) => setRingkasan(e.target.value.slice(0, 2000))}
                  rows={5}
                  className="mt-2 w-full resize-y rounded-lg bg-white p-3 text-sm outline-none"
                  style={{ border: `1px solid ${WARNA.garisRedup}`, color: WARNA.teksSedang }}
                  autoFocus
                />
              ) : (
                <p
                  className="mt-2 whitespace-pre-wrap text-sm leading-relaxed"
                  style={{ color: WARNA.teksSedang }}
                >
                  {ringkasan}
                </p>
              )}
            </div>

            {/* Tipe terdeteksi + urgensi */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div
                className="rounded-xl p-3"
                style={{ background: WARNA.kartu, border: `1px solid ${WARNA.garis}` }}
              >
                <p className="text-xs" style={{ color: WARNA.teksRedup }}>
                  Tipe Terdeteksi
                </p>
                <p className="mt-0.5 text-sm font-semibold" style={{ color: WARNA.ungu }}>
                  {KATEGORI.find((k) => k.nilai === kategori)?.label || 'Belum ditentukan'}
                </p>
              </div>
              <div
                className="rounded-xl p-3"
                style={{ background: WARNA.kartu, border: `1px solid ${WARNA.garis}` }}
              >
                <p className="text-xs" style={{ color: WARNA.teksRedup }}>
                  Tipe Urgensi
                </p>
                <p className="mt-0.5 text-sm font-semibold" style={{ color: WARNA.merah }}>
                  {URGENSI_LABEL[urgensi] || urgensi}
                </p>
              </div>
            </div>

            {/* Review Bukti — belum dibangun, ditandai jujur */}
            <div className="mt-5">
              <p className="text-sm font-semibold" style={{ color: WARNA.teks }}>
                Review Bukti
              </p>
              <div className="mt-2 flex items-center gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ background: WARNA.kartu, border: `1px solid ${WARNA.garis}` }}
                >
                  <ImageIcon size={20} style={{ color: WARNA.garisRedup }} aria-hidden="true" />
                </div>
                {/* Upload bukti belum dibangun: foto menyimpan metadata EXIF
                    (lokasi GPS, jam, model HP) dan bisa memuat wajah anak lain
                    yang tidak pernah setuju. Butuh strip EXIF + storage + RLS
                    tersendiri. Ditandai jujur, bukan tombol mati. */}
                <div
                  className="flex h-14 flex-col items-center justify-center rounded-xl px-4"
                  style={{ border: `1px dashed ${WARNA.garisRedup}`, color: WARNA.teksRedup }}
                >
                  <Plus size={14} aria-hidden="true" />
                  <span className="text-[11px]">Tambah</span>
                </div>
                <p className="text-xs" style={{ color: WARNA.teksRedup }}>
                  Segera hadir — untuk sekarang ceritakan saja lewat teks.
                </p>
              </div>
            </div>

            {/* Lengkapi Detail */}
            <div className="mt-5">
              <p className="text-sm font-semibold" style={{ color: WARNA.teks }}>
                Lengkapi Detail
              </p>

              <div className="mt-3">
                <label
                  htmlFor="kategori"
                  className="text-xs"
                  style={{ color: WARNA.teksRedup }}
                >
                  Kategori Perundungan
                </label>
                <div className="relative mt-1">
                  <select
                    id="kategori"
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full appearance-none rounded-lg bg-white px-3 py-2.5 text-sm outline-none"
                    style={{ border: `1px solid ${WARNA.garisRedup}`, color: WARNA.teksSedang }}
                  >
                    <option value="">Belum ditentukan</option>
                    {KATEGORI.map((k) => (
                      <option key={k.nilai} value={k.nilai}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-3"
                    style={{ color: WARNA.teksRedup }}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label htmlFor="lokasi" className="text-xs" style={{ color: WARNA.teksRedup }}>
                  Lokasi Kejadian
                </label>
                <input
                  id="lokasi"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value.slice(0, 100))}
                  placeholder="Grup WhatsApp Kelas"
                  className="mt-1 w-full rounded-lg bg-white px-3 py-2.5 text-sm outline-none"
                  style={{ border: `1px solid ${WARNA.garisRedup}`, color: WARNA.teksSedang }}
                />
              </div>

              <div className="mt-3">
                <label htmlFor="waktu" className="text-xs" style={{ color: WARNA.teksRedup }}>
                  Waktu Kejadian (Kira-kira)
                </label>
                <input
                  id="waktu"
                  type="date"
                  value={waktu}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setWaktu(e.target.value)}
                  className="mt-1 w-full rounded-lg bg-white px-3 py-2.5 text-sm outline-none"
                  style={{ border: `1px solid ${WARNA.garisRedup}`, color: WARNA.teksSedang }}
                />
              </div>
            </div>

            {/* Kirim Sebagai Anonim — DIKUNCI ON. Lihat catatan di atas berkas. */}
            <div
              className="mt-5 rounded-xl p-4"
              style={{ background: WARNA.biruMuda, border: `1px solid ${WARNA.garis}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold" style={{ color: WARNA.teks }}>
                    Kirim Sebagai Anonim
                  </p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: WARNA.teksRedup }}>
                    Laporan ini <strong>selalu</strong> anonim — sistem tidak menyimpan siapa yang
                    mengirimnya, bahkan kalau kamu sedang punya akun. Guru BK membaca ceritamu, bukan
                    namamu.
                  </p>
                </div>
                {/* Sengaja aktif-permanen dan tidak bisa dimatikan. */}
                <div
                  role="img"
                  aria-label="Anonim aktif, tidak bisa dimatikan"
                  className="mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5"
                  style={{ background: WARNA.ungu }}
                >
                  <span className="ml-auto block h-5 w-5 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl p-3 text-sm"
                style={{ background: '#fef2f2', border: `1px solid ${WARNA.merah}`, color: WARNA.merah }}
              >
                {error}
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ruang-aman"
                className="flex-1 rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold transition"
                style={{ border: `1px solid ${WARNA.garisRedup}`, color: WARNA.ungu }}
              >
                Kembali ke Chat
              </Link>
              <button
                type="button"
                onClick={kirimLaporan}
                disabled={kirim || !ringkasan.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-40"
                style={{ background: WARNA.ungu }}
              >
                {kirim ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={16} aria-hidden="true" />
                )}
                Kirim Laporan ke Guru BK
              </button>
            </div>
          </section>

          {/* ── Sidebar: Mengapa Tinjau Draft? ── */}
          <aside
            className="h-fit rounded-2xl p-5"
            style={{ background: WARNA.kartu, border: `1px solid ${WARNA.garis}` }}
          >
            <div className="flex items-center gap-2">
              <Info size={16} style={{ color: WARNA.ungu }} aria-hidden="true" />
              <p className="text-sm font-semibold" style={{ color: WARNA.teks }}>
                Mengapa Tinjau Draft?
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: WARNA.teksSedang }}>
              AI mencoba merangkum ceritamu agar lebih mudah dipahami Guru BK.
            </p>
            <ul className="mt-3 space-y-2">
              {[
                'Pastikan detailnya akurat sebelum dikirim.',
                'Tambahkan info yang mungkin terlewat.',
                'Kamu yang menentukan versi akhirnya, bukan AI.',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check size={14} className="mt-0.5 shrink-0" style={{ color: WARNA.hijau }} aria-hidden="true" />
                  <span className="text-xs leading-relaxed" style={{ color: WARNA.teksSedang }}>
                    {t}
                  </span>
                </li>
              ))}
            </ul>
            <div
              className="mt-4 flex items-center gap-2 rounded-lg p-2.5"
              style={{ background: WARNA.biruMuda }}
            >
              <Shield size={13} style={{ color: WARNA.ungu }} aria-hidden="true" />
              {/* Desain menulis "Ruang aman. Data Anda dilindungi." — diganti
                  jadi klaim yang bisa dibuktikan, sejalan dengan halaman lain. */}
              <span className="text-[11px]" style={{ color: WARNA.teksRedup }}>
                Laporanmu tersimpan terenkripsi, hanya untuk Guru BK sekolahmu.
              </span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
