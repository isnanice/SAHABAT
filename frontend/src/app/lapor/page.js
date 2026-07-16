'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, Loader2 } from 'lucide-react'
import { api, ApiError, SEKOLAH_ID } from '@/lib/api'
import { deteksiKrisis } from '@/lib/keamanan/crisis'
import KodeTiket from '@/components/KodeTiket'
import PanelDarurat from '@/components/PanelDarurat'

const MIN_KARAKTER = 15
const MAX_KARAKTER = 2000

const LOKASI = [
  'Kelas',
  'Kantin',
  'Koridor',
  'Tangga',
  'Toilet',
  'Lapangan',
  'Parkiran',
  'Perpustakaan',
  'Online / media sosial',
  'Perjalanan ke/dari sekolah',
  'Tempat lain',
]

export default function LaporPage() {
  const [deskripsi, setDeskripsi] = useState('')
  const [lokasi, setLokasi] = useState('')
  const [tanggal, setTanggal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasil, setHasil] = useState(null)

  // Deteksi krisis jalan di browser juga — file-nya murni regex, tanpa
  // network, jadi hasilnya sama persis dengan yang server hitung.
  const krisis = deteksiKrisis(deskripsi).krisis

  // Laporan krisis boleh dikirim berapa pun panjangnya.
  //
  // Tanpa `krisis ||` di sini, tombol Kirim tetap disabled untuk anak yang
  // mengetik "pengen mati" (11 karakter) — dia tidak bisa menekannya sama
  // sekali, dan yang dia lihat cuma penghitung karakter yang menyalahkannya.
  // Aturan panjang ada untuk menyaring laporan sampah, bukan untuk menghalangi
  // anak yang paling butuh ditolong.
  const cukup = krisis || deskripsi.trim().length >= MIN_KARAKTER

  async function kirim(e) {
    e.preventDefault()
    if (!cukup || loading) return

    setLoading(true)
    setError('')

    try {
      const data = await api.kirimLaporan({
        sekolah_id: SEKOLAH_ID,
        deskripsi: deskripsi.trim(),
        ...(lokasi ? { lokasi } : {}),
        ...(tanggal ? { tanggal_kejadian: tanggal } : {}),
      })
      setHasil(data)
    } catch (err) {
      // Gagal itu ditampilkan jujur. JANGAN pernah pura-pura sukses dan
      // memberi kode tiket palsu — anak akan menunggu balasan yang tidak
      // akan pernah datang, untuk laporan yang tidak pernah ada (spec §5.4).
      setError(
        err instanceof ApiError
          ? err.message
          : 'Laporanmu gagal terkirim. Coba lagi, atau hubungi Guru BK langsung.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (hasil?.kode_tiket) {
    return (
      <main className="min-h-screen bg-sahabat-latar px-4 py-10">
        <KodeTiket
          kode={hasil.kode_tiket}
          krisis={hasil.krisis}
          onSelesai={() => {
            // Kode dibuang dari memori begitu siswa bilang sudah menyimpannya.
            setHasil(null)
            setDeskripsi('')
            setLokasi('')
            setTanggal('')
          }}
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-sahabat-latar px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-sahabat"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Kembali
        </Link>

        <div className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Lapor Sekarang</h1>

          {/* Klaim anonimitas ditulis SPESIFIK, bukan "100% anonim".
              Yang benar: sistem tidak menyimpan siapa kamu. Yang TIDAK bisa
              kami jamin: bahwa ceritamu sendiri tidak menunjukkan siapa kamu.
              Anak berhak tahu bedanya sebelum menulis, bukan sesudah. */}
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Kamu tidak perlu login dan tidak perlu menulis namamu. Sistem ini
            tidak menyimpan siapa kamu.
          </p>

          <form onSubmit={kirim} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="deskripsi"
                className="block text-sm font-semibold text-gray-900"
              >
                Apa yang terjadi?
              </label>
              <p className="mt-1 text-xs text-gray-500">
                Ceritakan dengan katamu sendiri. Tidak apa-apa kalau berantakan.
              </p>
              <textarea
                id="deskripsi"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value.slice(0, MAX_KARAKTER))}
                rows={7}
                required
                aria-describedby="bantuan-deskripsi"
                placeholder="Contoh: Setiap istirahat aku diejek soal..."
                className="mt-2 w-full resize-y rounded-xl border border-sahabat-garis bg-white p-3 text-gray-900 outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
              />
              <div
                id="bantuan-deskripsi"
                className="mt-1.5 flex justify-between text-xs"
              >
                {/* Saat krisis terdeteksi, penghitung karakter TIDAK ditampilkan.
                    Menyodorkan "11/15" ke anak yang baru menulis "pengen mati"
                    adalah sistem yang menawar dengan orang yang sedang putus asa. */}
                <span className={cukup ? 'text-gray-500' : 'text-amber-700'}>
                  {krisis
                    ? 'Kamu bisa langsung kirim — tidak perlu panjang.'
                    : cukup
                      ? 'Sudah cukup untuk dikirim'
                      : `Minimal ${MIN_KARAKTER} karakter (${deskripsi.trim().length}/${MIN_KARAKTER})`}
                </span>
                <span className="text-gray-400">
                  {deskripsi.length}/{MAX_KARAKTER}
                </span>
              </div>
            </div>

            {/* Peringatan ini adalah bagian jujur dari janji anonimitas.
                Sistem bisa menghilangkan nama; sistem tidak bisa mencegah
                cerita yang cuma cocok untuk satu orang di sekolah itu. */}
            <div className="rounded-xl bg-sahabat-muda p-3">
              <p className="text-xs leading-relaxed text-gray-700">
                <strong>Sedikit catatan:</strong> Guru BK akan membaca ceritamu,
                tapi tidak bisa melihat namamu dari sistem ini. Kalau kamu ingin
                tetap sulit dikenali, hindari detail yang cuma cocok untuk kamu
                seorang.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="lokasi"
                  className="block text-sm font-semibold text-gray-900"
                >
                  Di mana? <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <select
                  id="lokasi"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-sahabat-garis bg-white p-3 text-gray-900 outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
                >
                  <option value="">Tidak ingin menyebut</option>
                  {LOKASI.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="tanggal"
                  className="block text-sm font-semibold text-gray-900"
                >
                  Kapan? <span className="font-normal text-gray-400">(opsional)</span>
                </label>
                <input
                  id="tanggal"
                  type="date"
                  value={tanggal}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-sahabat-garis bg-white p-3 text-gray-900 outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border-2 border-darurat bg-darurat-muda p-4"
              >
                <p className="font-semibold text-darurat">
                  Laporanmu belum terkirim
                </p>
                <p className="mt-1 text-sm text-gray-800">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!cukup || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sahabat px-4 py-3.5 font-semibold text-white transition hover:bg-sahabat-tua disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send size={18} aria-hidden="true" />
                  Kirim Laporan
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              Setelah dikirim, kamu akan dapat kode untuk memantau laporanmu.
              Guru BK biasanya membalas dalam 1×24 jam sekolah.
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
