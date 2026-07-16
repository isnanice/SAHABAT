'use client'

import { Phone, AlertTriangle, FileWarning } from 'lucide-react'

/**
 * Panel darurat — tampil saat deteksi krisis menyala (spec §4.1B).
 *
 * Aturan yang membentuk komponen ini:
 *
 * 1. Jalur yang PASTI hidup ditaruh paling atas: menemui Guru BK atau orang
 *    dewasa yang dipercaya. Nomor telepon bisa mati, sibuk, atau di luar jam
 *    layanan. Orang dewasa di gedung yang sama tidak.
 *
 * 2. Nomor yang belum diverifikasi diberi penanda jujur, tidak disembunyikan.
 *    Anak berhak tahu mana yang sudah dipastikan tim dan mana yang belum.
 *    Nomor mati ke anak krisis lebih buruk daripada tidak ada nomor — dia
 *    sudah mengumpulkan keberanian sekali, dan panggilan gagal mengajarkan
 *    dia bahwa minta tolong itu percuma.
 *
 * 3. Tidak ada tombol "lanjut chat". Sekali krisis, sesi chat berhenti.
 */
export default function PanelDarurat({ hotline = [], onBuatLaporan }) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className="rounded-2xl border-2 border-darurat bg-darurat-muda p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 shrink-0 text-darurat"
          size={24}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-darurat">
            Kamu tidak sendirian, dan ini tidak bisa ditangani sendirian
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-800">
            Aku berhenti di sini karena kamu berhak dapat bantuan dari{' '}
            <strong>manusia</strong>, bukan dari bot. Bercerita tadi bukan hal
            yang memalukan — itu justru langkah yang berani.
          </p>
        </div>
      </div>

      {/* Jalur paling andal, karena tidak bergantung sinyal atau jam layanan. */}
      <div className="mt-5 rounded-xl border border-darurat/30 bg-white p-4">
        <p className="text-sm font-semibold text-gray-900">
          Kalau kamu sedang dalam bahaya sekarang:
        </p>
        <p className="mt-1 text-sm leading-relaxed text-gray-700">
          Temui <strong>Guru BK</strong>, orang tua, atau orang dewasa yang kamu
          percaya <strong>secepatnya</strong>. Kalau ada orang dewasa di
          dekatmu saat ini, tunjukkan layar ini ke mereka.
        </p>
      </div>

      {hotline.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-900">
            Atau hubungi layanan ini:
          </p>
          <ul className="mt-2 space-y-2">
            {hotline.map((h) => (
              <li
                key={h.nomor}
                className="rounded-xl border border-darurat/30 bg-white p-3"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Phone size={16} className="text-darurat" aria-hidden="true" />
                  <a
                    href={`tel:${String(h.nomor).replace(/[^\d+]/g, '')}`}
                    className="font-semibold text-darurat underline underline-offset-2"
                  >
                    {h.nomor}
                  </a>
                  <span className="text-sm text-gray-700">— {h.nama}</span>
                </div>
                <p className="mt-1 text-xs text-gray-600">{h.keterangan}</p>

                {/* Spec §9: nomor tanpa verifikasi harus diberi penanda. */}
                {!h.terverifikasi_pada && (
                  <p className="mt-1.5 text-xs font-medium text-amber-700">
                    ⚠ Nomor ini belum diverifikasi ulang oleh tim SAHABAT.
                    Kalau tidak tersambung, jangan menyerah — langsung temui
                    Guru BK atau orang dewasa yang kamu percaya.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {onBuatLaporan && (
        <button
          type="button"
          onClick={onBuatLaporan}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-darurat px-4 py-3 font-semibold text-white transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-darurat focus-visible:ring-offset-2"
        >
          <FileWarning size={18} aria-hidden="true" />
          Buat Laporan Prioritas
        </button>
      )}

      <p className="mt-3 text-xs leading-relaxed text-gray-600">
        Laporan prioritas langsung ditandai mendesak untuk Guru BK sekolahmu.
        Kamu tetap anonim.
      </p>
    </section>
  )
}
