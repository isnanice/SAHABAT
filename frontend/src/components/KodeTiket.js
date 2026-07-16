'use client'

import { useState } from 'react'
import { Copy, Check, TriangleAlert } from 'lucide-react'

/**
 * Layar kode tiket (spec §4.1C).
 *
 * Ini layar paling rawan di seluruh aplikasi. Kodenya ditampilkan SEKALI,
 * server cuma menyimpan HMAC-nya, dan tidak ada jalur pemulihan — bukan
 * karena kami malas membuatnya, tapi karena pemulihan butuh identitas, dan
 * identitas itu justru yang sedang kami lindungi.
 *
 * Konsekuensinya untuk UI:
 *   - Kode besar, monospace, mudah disalin DAN mudah ditulis tangan
 *     (anak mungkin tidak boleh bawa HP di sekolah).
 *   - Peringatannya tegas dan lebih dulu daripada tombol lanjut.
 *   - JANGAN simpan ke localStorage (spec §5.7). Menyimpannya di komputer
 *     sekolah yang dipakai bergantian membocorkan tiket ke pemakai berikutnya
 *     — dan pemakai berikutnya bisa saja pelakunya.
 */
export default function KodeTiket({ kode, krisis, onSelesai }) {
  const [tersalin, setTersalin] = useState(false)
  const [gagalSalin, setGagalSalin] = useState(false)

  async function salin() {
    try {
      await navigator.clipboard.writeText(kode)
      setTersalin(true)
      setGagalSalin(false)
      setTimeout(() => setTersalin(false), 2500)
    } catch {
      // Clipboard API butuh HTTPS/izin dan sering diblokir di browser sekolah.
      // Jangan diam — suruh salin manual.
      setGagalSalin(true)
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-emerald-700">
          ✓ Laporanmu sudah terkirim ke Guru BK
        </p>

        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Ini kode laporanmu
        </h1>

        <div className="mt-5 rounded-xl bg-sahabat-muda p-5 text-center">
          <p
            className="select-all font-mono text-3xl font-bold tracking-[0.15em] text-sahabat-tua sm:text-4xl"
            aria-label={`Kode tiket kamu: ${kode.split('').join(' ')}`}
          >
            {kode}
          </p>
        </div>

        <button
          type="button"
          onClick={salin}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-sahabat px-4 py-3 font-semibold text-white transition hover:bg-sahabat-tua focus:outline-none focus-visible:ring-2 focus-visible:ring-sahabat focus-visible:ring-offset-2"
        >
          {tersalin ? (
            <>
              <Check size={18} aria-hidden="true" /> Tersalin
            </>
          ) : (
            <>
              <Copy size={18} aria-hidden="true" /> Salin Kode
            </>
          )}
        </button>

        {gagalSalin && (
          <p className="mt-2 text-center text-sm text-amber-700">
            Browser tidak mengizinkan salin otomatis. Tulis kodenya manual ya.
          </p>
        )}

        {/* Peringatan sengaja SEBELUM tombol lanjut, bukan sesudah. */}
        <div className="mt-5 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
          <div className="flex items-start gap-2.5">
            <TriangleAlert
              className="mt-0.5 shrink-0 text-amber-600"
              size={20}
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-amber-900">
                Simpan kode ini sekarang juga
              </p>
              <p className="mt-1 text-sm leading-relaxed text-amber-900">
                Ini <strong>satu-satunya</strong> cara memantau laporanmu, dan{' '}
                <strong>tidak bisa dipulihkan kalau hilang</strong> — bahkan
                oleh kami. Kode ini tidak kami simpan dan tidak akan
                ditampilkan lagi.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-amber-900">
                Tulis di tempat yang aman, yang tidak akan dilihat orang yang
                kamu laporkan.
              </p>
            </div>
          </div>
        </div>

        {krisis && (
          <div className="mt-4 rounded-xl border-2 border-darurat bg-darurat-muda p-4">
            <p className="font-semibold text-darurat">
              Laporanmu ditandai mendesak
            </p>
            <p className="mt-1 text-sm leading-relaxed text-gray-800">
              Guru BK akan diberi tahu untuk segera membukanya. Tapi tolong
              jangan menunggu sendirian — temui Guru BK atau orang dewasa yang
              kamu percaya sekarang.
            </p>
          </div>
        )}

        {/* Spec §1b: ekspektasi waktu harus tertulis. Rasio 1 BK : 150 siswa
            (Permendikbud 111/2014) membuat janji "beberapa menit" mustahil,
            dan janji yang meleset ke anak yang sedang takut lebih merusak
            daripada menunggu yang jujur sejak awal. */}
        <p className="mt-5 text-sm text-gray-600">
          Guru BK biasanya membalas dalam <strong>1×24 jam sekolah</strong>.
          Cek perkembangannya kapan saja lewat menu{' '}
          <strong>&ldquo;Cek Laporan&rdquo;</strong> pakai kode di atas.
        </p>

        <button
          type="button"
          onClick={onSelesai}
          className="mt-4 w-full rounded-xl border border-sahabat-garis px-4 py-3 font-semibold text-gray-700 transition hover:bg-sahabat-latar"
        >
          Aku sudah menyimpan kodenya
        </button>
      </div>
    </div>
  )
}
