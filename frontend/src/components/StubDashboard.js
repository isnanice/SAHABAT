import { Construction } from 'lucide-react'

/**
 * Placeholder konsisten untuk halaman dashboard yang belum punya modul
 * datanya. Tampil rapi di dalam shell sidebar alih-alih <h1> mentah, jadi
 * navigasi tetap terasa utuh sementara modulnya menyusul.
 */
export default function StubDashboard({ judul, deskripsi }) {
  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-3xl font-bold text-gray-900">{judul}</h1>
      {deskripsi && <p className="mt-1 text-gray-500">{deskripsi}</p>}
      <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-sahabat-garis bg-white py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sahabat-muda text-sahabat">
          <Construction size={28} aria-hidden="true" />
        </span>
        <p className="mt-4 font-semibold text-gray-800">Modul ini segera hadir</p>
        <p className="mt-1 max-w-md text-sm text-gray-500">
          Tampilannya mengikuti sistem desain yang sama. Datanya akan tersambung
          saat modul {judul.toLowerCase()} diaktifkan.
        </p>
      </div>
    </div>
  )
}
