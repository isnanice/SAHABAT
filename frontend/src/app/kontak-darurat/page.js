import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Phone, UserCheck } from 'lucide-react'
import { HOTLINE } from '@/lib/keamanan/hotline'

export const metadata = {
  title: 'Kontak Darurat — SAHABAT',
  description: 'Bantuan segera kalau kamu atau temanmu sedang dalam bahaya.',
  robots: { index: false, follow: false },
}

/**
 * Halaman Kontak Darurat.
 *
 * Sebelumnya link ini di footer mengarah ke href="#" — tidak melakukan apa
 * pun. Itu link paling berbahaya di seluruh situs: satu-satunya yang mungkin
 * diklik anak yang sedang panik, dan satu-satunya yang diam saja.
 *
 * Urutan di halaman ini disengaja, dari yang PALING PASTI ke yang paling
 * rapuh:
 *   1. Orang dewasa di gedung yang sama — tidak butuh sinyal, pulsa, atau
 *      jam layanan.
 *   2. Nomor telepon — bisa sibuk, mati, atau di luar jam.
 *   3. Lapor lewat sistem — paling lambat, jelas bukan untuk keadaan darurat.
 *
 * Halaman ini sengaja TIDAK butuh login, TIDAK butuh JavaScript, dan tidak
 * memanggil API apa pun. Ia harus tetap hidup ketika bagian lain rusak.
 */
export default function KontakDaruratPage() {
  return (
    <main className="min-h-screen bg-sahabat-latar px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-sahabat"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Kembali
        </Link>

        <div className="rounded-2xl border-2 border-darurat bg-darurat-muda p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 shrink-0 text-darurat" size={28} aria-hidden="true" />
            <div>
              <h1 className="text-2xl font-bold text-darurat">
                Kalau kamu sedang dalam bahaya sekarang
              </h1>
              <p className="mt-2 leading-relaxed text-gray-800">
                Jangan pakai halaman ini untuk menunggu. Cari orang dewasa
                dulu — halaman ini cuma pengingat, bukan pertolongan.
              </p>
            </div>
          </div>
        </div>

        {/* Jalur paling andal ditaruh paling atas, bukan nomor telepon. */}
        <section className="mt-4 rounded-2xl border border-sahabat-garis bg-white p-6">
          <div className="flex items-start gap-3">
            <UserCheck className="mt-0.5 shrink-0 text-sahabat" size={22} aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                1. Temui orang dewasa yang kamu percaya
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                Guru BK, wali kelas, orang tua, kakak, atau siapa pun yang kamu
                percaya. Ini cara paling cepat dan paling pasti — tidak
                bergantung sinyal, pulsa, atau jam layanan.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                Kalau susah memulai, kamu boleh menunjukkan layar ini ke mereka.
                Kamu tidak perlu menjelaskan semuanya sekaligus.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-sahabat-garis bg-white p-6">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 shrink-0 text-sahabat" size={22} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-gray-900">
                2. Hubungi layanan bantuan
              </h2>

              <ul className="mt-3 space-y-3">
                {HOTLINE.map((h) => (
                  <li key={h.nomor} className="rounded-xl border border-sahabat-garis p-4">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <a
                        href={`tel:${String(h.nomor).replace(/[^\d+]/g, '')}`}
                        className="text-xl font-bold text-sahabat underline underline-offset-4"
                      >
                        {h.nomor}
                      </a>
                      <span className="text-sm font-medium text-gray-800">{h.nama}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{h.keterangan}</p>

                    {/* Spec §9: nomor tanpa verifikasi WAJIB diberi penanda.
                        Nomor mati ke anak yang sedang krisis lebih buruk
                        daripada tidak ada nomor — dia sudah mengumpulkan
                        keberanian sekali, dan panggilan gagal mengajarkan dia
                        bahwa minta tolong itu percuma. */}
                    {!h.terverifikasi_pada ? (
                      <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs font-medium text-amber-800">
                        ⚠ Nomor ini belum diverifikasi ulang oleh tim SAHABAT.
                        Kalau tidak tersambung, jangan menyerah — langsung ke
                        langkah 1 di atas.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-gray-500">
                        Terakhir diverifikasi: {h.terverifikasi_pada}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-2xl border border-sahabat-garis bg-white p-6">
          <h2 className="text-lg font-bold text-gray-900">
            3. Laporkan lewat SAHABAT
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            Kalau kamu tidak dalam bahaya langsung tapi ingin ini ditangani,
            kirim laporan. Guru BK biasanya membalas dalam{' '}
            <strong>1×24 jam sekolah</strong> — jadi ini bukan jalur untuk
            keadaan mendesak.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/lapor"
              className="flex-1 rounded-xl bg-sahabat px-4 py-3 text-center font-semibold text-white transition hover:bg-sahabat-tua"
            >
              Lapor Sekarang
            </Link>
            <Link
              href="/ruang-aman"
              className="flex-1 rounded-xl border border-sahabat-garis px-4 py-3 text-center font-semibold text-gray-700 transition hover:bg-sahabat-latar"
            >
              Bingung mulai dari mana?
            </Link>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-gray-500">
          Kamu tidak perlu login untuk halaman ini, dan membukanya tidak
          tercatat sebagai laporan.
        </p>
      </div>
    </main>
  )
}
