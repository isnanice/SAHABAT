'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Loader2, Send } from 'lucide-react'
import { api, ApiError } from '@/lib/api'

const STATUS = {
  MENUNGGU: { label: 'Menunggu dibaca Guru BK', kelas: 'bg-gray-100 text-gray-700' },
  DIPROSES: { label: 'Sedang ditangani', kelas: 'bg-blue-100 text-blue-800' },
  SELESAI: { label: 'Selesai ditangani', kelas: 'bg-emerald-100 text-emerald-800' },
  DITUTUP: { label: 'Ditutup', kelas: 'bg-gray-100 text-gray-500' },
}

// Nama jenis untuk ditampilkan (desain memakai istilah ini sebagai judul kartu).
const JENIS_LABEL = {
  SIBER: 'Cyber Bullying',
  FISIK: 'Physical Bullying',
  VERBAL: 'Verbal Bullying',
  SOSIAL: 'Social Bullying',
  SEKSUAL: 'Kekerasan Seksual',
}

// Timeline "STATUS PERKEMBANGAN" (desain citra). Urutan tetap; yang menyala
// ditentukan status laporan sekarang. Diturunkan dari status, bukan disimpan
// terpisah, supaya tidak pernah bertentangan dengan status sebenarnya.
function bangunTimeline(status) {
  const urut = { MENUNGGU: 0, DIPROSES: 1, SELESAI: 3, DITUTUP: 3 }
  const kini = urut[status] ?? 0
  return [
    {
      judul: 'Laporan Dikirim',
      teks: 'Laporan Anda telah berhasil kami terima secara anonim dan aman.',
      aktif: kini >= 0,
    },
    {
      judul: 'Sedang Ditinjau',
      teks: 'Tim kami sedang meninjau detail laporan untuk klasifikasi awal.',
      aktif: kini >= 1,
    },
    {
      judul: 'Konselor Ditugaskan',
      teks: 'Guru BK menangani laporanmu dan akan menindaklanjuti.',
      aktif: kini >= 2,
    },
    {
      judul: 'Tindakan Lanjutan',
      teks: kini >= 3 ? 'Laporan telah ditindaklanjuti dan ditutup.' : 'Belum tersedia',
      aktif: kini >= 3,
    },
  ]
}

function formatTanggal(iso) {
  if (!iso) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export default function CekLaporanPage() {
  const [kode, setKode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tiket, setTiket] = useState(null)

  const [balasan, setBalasan] = useState('')
  const [kirimLoading, setKirimLoading] = useState(false)
  const [balasError, setBalasError] = useState('')

  async function lacak(e) {
    e.preventDefault()
    if (!kode.trim() || loading) return

    setLoading(true)
    setError('')
    setTiket(null)

    try {
      setTiket(await api.lacakTiket(kode.trim()))
    } catch (err) {
      // 429 punya pesannya sendiri dari server (spec §4.1D).
      setError(err instanceof ApiError ? err.message : 'Gagal memuat laporan.')
    } finally {
      setLoading(false)
    }
  }

  async function kirimBalasan(e) {
    e.preventDefault()
    if (!balasan.trim() || kirimLoading) return

    setKirimLoading(true)
    setBalasError('')

    try {
      await api.balasTiket(kode.trim(), balasan.trim())
      setBalasan('')
      // Muat ulang thread supaya siswa melihat pesannya benar-benar masuk,
      // bukan cuma ditambahkan optimistis di layar.
      setTiket(await api.lacakTiket(kode.trim()))
    } catch (err) {
      setBalasError(
        err instanceof ApiError ? err.message : 'Balasan gagal terkirim.'
      )
    } finally {
      setKirimLoading(false)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Lacak Laporan</h1>
          <p className="mt-2 text-sm text-gray-600">
            Pantau perkembangan laporan Anda. Masukkan kode tiket yang kamu
            terima saat mengirim laporan — tanpa login, tetap anonim.
          </p>

          <form onSubmit={lacak} className="mt-5">
            <label htmlFor="kode" className="sr-only">
              Kode tiket
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="kode"
                value={kode}
                onChange={(e) => setKode(e.target.value.toUpperCase())}
                placeholder="SAH-XXXX-XXXX"
                autoComplete="off"
                spellCheck={false}
                className="w-full rounded-xl border border-sahabat-garis bg-white p-3 font-mono tracking-wider text-gray-900 outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
              />
              <button
                type="submit"
                disabled={!kode.trim() || loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-sahabat px-5 py-3 font-semibold text-white transition hover:bg-sahabat-tua disabled:opacity-40 sm:w-auto"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Search size={18} aria-hidden="true" />
                )}
                Cek
              </button>
            </div>
          </form>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4"
            >
              <p className="text-sm text-amber-900">{error}</p>
            </div>
          )}
        </div>

        {tiket && (
          <div className="mt-5 rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm sm:p-8">
            {/* Header kartu: judul jenis + badge urgensi (desain citra). */}
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-sahabat-tua">
                {JENIS_LABEL[tiket.jenis] || 'Laporan'}
              </h2>
              {(tiket.urgensi === 'KRITIS' || tiket.urgensi === 'TINGGI' || tiket.krisis) && (
                <span className="rounded-full bg-darurat-muda px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-darurat">
                  Urgent
                </span>
              )}
              <span
                className={`ml-auto rounded-full px-3 py-1 text-sm font-semibold ${
                  STATUS[tiket.status]?.kelas || 'bg-gray-100 text-gray-700'
                }`}
              >
                {STATUS[tiket.status]?.label || tiket.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Nomor Tiket: <strong className="font-mono text-gray-700">{kode.trim()}</strong>
            </p>

            <hr className="my-5 border-sahabat-garis" />

            {/* STATUS PERKEMBANGAN — timeline vertikal (desain citra). */}
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Status Perkembangan
            </h3>
            <ol className="mt-4 space-y-5">
              {bangunTimeline(tiket.status).map((langkah, i, arr) => (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full ${
                        langkah.aktif ? 'bg-sahabat' : 'bg-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                    {i < arr.length - 1 && (
                      <span
                        className={`w-0.5 flex-1 ${langkah.aktif ? 'bg-sahabat' : 'bg-gray-200'}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="pb-1">
                    <p className={`font-semibold ${langkah.aktif ? 'text-gray-900' : 'text-gray-400'}`}>
                      {langkah.judul}
                    </p>
                    <p className={`mt-1 text-sm ${langkah.aktif ? 'text-gray-600' : 'text-gray-400'}`}>
                      {langkah.teks}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Catatan Keamanan (desain citra). */}
            <div className="mt-6 rounded-xl bg-sahabat-latar p-4">
              <p className="text-sm font-semibold text-gray-900">Catatan Keamanan</p>
              <p className="mt-1 text-sm text-gray-600">
                Privasi Anda adalah prioritas kami. Laporan ini tersimpan
                terenkripsi dan hanya dapat diakses Guru BK yang bertugas. Jika
                Anda merasa dalam bahaya mendesak, hubungi{' '}
                <Link href="/kontak-darurat" className="font-medium text-sahabat">
                  nomor darurat
                </Link>
                .
              </p>
            </div>

            {/* Isi cerita SENGAJA tidak ditampilkan di sini — endpoint lacak
                pun tidak mengembalikannya. Kalau kode ini jatuh ke tangan
                pelaku, yang dia lihat cuma status, bukan cerita korban
                (spec §8.6). */}

            <h2 className="mt-6 text-sm font-semibold text-gray-900">Percakapan</h2>

            {tiket.pesan?.length > 0 && (
              <ul className="mt-3 space-y-3">
                {tiket.pesan.map((p, i) => {
                  const dariSiswa = p.dari === 'Kamu'
                  return (
                    <li
                      key={i}
                      className={`flex ${dariSiswa ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          dariSiswa
                            ? 'bg-sahabat text-white'
                            : 'bg-sahabat-muda text-gray-900'
                        }`}
                      >
                        <p className="text-xs font-semibold opacity-80">{p.dari}</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                          {p.isi}
                        </p>
                        <p className="mt-1 text-[11px] opacity-70">
                          {formatTanggal(p.dibuat_at)}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* Ekspektasi waktu tampil selama Guru BK BELUM membalas — bukan
                cuma saat thread masih kosong.

                Versi sebelumnya menyembunyikannya begitu siswa mengirim satu
                pesan, jadi yang terlihat cuma pesan sendiri menggantung tanpa
                penjelasan. Itu justru momen paling rawan: anak yang sudah
                memberanikan diri menulis lalu melihat kesunyian akan
                menyimpulkan tidak ada yang mendengarkan — bukan bahwa Guru BK
                belum sempat membuka. Spec §1b mewajibkan ekspektasi ini
                tertulis, dan di sinilah ia paling dibutuhkan. */}
            {!tiket.pesan?.some((p) => p.dari !== 'Kamu') && (
              <div className="mt-3 rounded-xl bg-sahabat-latar p-4">
                <p className="text-sm text-gray-700">
                  {tiket.pesan?.length > 0
                    ? 'Pesanmu sudah masuk dan menunggu dibaca Guru BK.'
                    : 'Laporanmu sudah masuk dan menunggu dibaca Guru BK.'}{' '}
                  Guru BK biasanya membalas dalam <strong>1×24 jam sekolah</strong>.
                </p>
                <p className="mt-1.5 text-xs text-gray-600">
                  Ini bukan robot — yang membalas nanti manusia, Guru BK di
                  sekolahmu. Balasannya muncul di halaman ini, tinggal cek lagi
                  pakai kode yang sama.
                </p>
                {tiket.krisis && (
                  <p className="mt-2 text-xs font-medium text-darurat">
                    Laporanmu ditandai mendesak. Tapi tolong jangan menunggu
                    sendirian — temui Guru BK atau orang dewasa yang kamu percaya
                    sekarang.
                  </p>
                )}
              </div>
            )}

            <form onSubmit={kirimBalasan} className="mt-5">
              <label htmlFor="balasan" className="block text-sm font-semibold text-gray-900">
                Mau menambahkan sesuatu?
              </label>
              <textarea
                id="balasan"
                value={balasan}
                onChange={(e) => setBalasan(e.target.value.slice(0, 2000))}
                rows={3}
                placeholder="Tulis pesan untuk Guru BK..."
                className="mt-2 w-full resize-y rounded-xl border border-sahabat-garis bg-white p-3 text-gray-900 outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
              />

              {balasError && (
                <p role="alert" className="mt-2 text-sm text-darurat">
                  {balasError}
                </p>
              )}

              <button
                type="submit"
                disabled={!balasan.trim() || kirimLoading}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-sahabat px-4 py-2.5 font-semibold text-white transition hover:bg-sahabat-tua disabled:opacity-40"
              >
                {kirimLoading ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send size={16} aria-hidden="true" />
                )}
                Kirim
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
