'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ChevronDown, Headphones, Phone, Mail } from 'lucide-react'

/**
 * Staff Hub / FAQ Guru BK (desain citra "FAQ").
 *
 * Isi FAQ nyata dan berguna untuk Guru BK. Accordion berfungsi betulan.
 * Kontak IT Helpdesk contoh — ganti dengan kontak sekolah sungguhan saat siap.
 */

const FAQ = [
  {
    q: 'Bagaimana cara saya meneruskan laporan anonim ke tingkat yang lebih tinggi?',
    a: 'Buka detail laporan, lalu naikkan "Urgensi" pada kartu Update Status menjadi Tinggi atau Kritis. Laporan dengan urgensi lebih tinggi otomatis naik ke atas antrean dan (jika sekolah mengaktifkannya) memicu notifikasi ke Kepala Sekolah. Identitas pelapor tetap tidak pernah ikut — sistem memang tidak menyimpannya.',
  },
  {
    q: 'Bisakah saya mengalihkan kasus ke konselor lain?',
    a: 'Ya. Pada detail laporan, gunakan tombol "Tugaskan" untuk menautkan kasus ke dirimu, atau minta admin sekolah memindahkannya ke konselor lain. Setiap perpindahan tercatat di log audit.',
  },
  {
    q: "Apa SLA untuk menanggapi peringatan risiko 'Sedang'?",
    a: 'Rekomendasi internal: laporan urgensi Sedang ditinjau dalam 1×24 jam sekolah, Tinggi dalam beberapa jam, dan Kritis segera. Angka pasti mengikuti kebijakan sekolahmu — sesuaikan bila berbeda.',
  },
]

export default function FaqGuruBK() {
  const [buka, setBuka] = useState(0)

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-3xl font-bold text-gray-900">Staff Hub</h1>
      <p className="mt-1 max-w-3xl text-gray-500">
        Akses panduan penting, FAQ platform, dan dukungan teknis untuk membantu
        Anda dalam mengelola kasus siswa secara efektif.
      </p>

      {/* Protokol darurat */}
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="flex items-center gap-2 text-xl font-bold text-darurat"><AlertTriangle size={22} /> Protokol Berkecepatan Tinggi</p>
        <p className="mt-2 max-w-3xl text-sm text-red-700">
          Tindakan segera diperlukan untuk laporan yang melibatkan tindakan
          melukai diri sendiri, tekanan berat, atau bahaya langsung. Tinjau
          prosedur operasi standar.
        </p>
        <Link href="/kontak-darurat" className="mt-4 inline-block rounded-xl bg-darurat px-5 py-2.5 font-semibold text-white transition hover:bg-red-700">Lihat SOP Darurat</Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* FAQ accordion */}
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900">Pertanyaan yang Sering Diajukan</h2>
          <div className="mt-4 space-y-3">
            {FAQ.map((f, i) => {
              const aktif = buka === i
              return (
                <div key={i} className="overflow-hidden rounded-2xl border border-sahabat-garis bg-white shadow-sm">
                  <button type="button" onClick={() => setBuka(aktif ? -1 : i)} aria-expanded={aktif}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
                    <span className="font-semibold text-gray-900">{f.q}</span>
                    <ChevronDown size={20} className={`shrink-0 text-gray-400 transition ${aktif ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {aktif && <p className="border-t border-sahabat-garis px-6 py-5 text-sm leading-relaxed text-gray-600">{f.a}</p>}
                </div>
              )
            })}
          </div>
        </section>

        {/* IT Helpdesk */}
        <aside className="h-fit rounded-2xl bg-sahabat p-6 text-white shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-bold"><Headphones size={20} /> IT Helpdesk</h2>
          <p className="mt-3 text-sm text-white/80">Mengalami masalah platform atau membutuhkan pemulihan akun? Tim teknis kami siap membantu.</p>
          <p className="mt-5 flex items-center gap-2 text-sm"><Phone size={15} /> +62 891 2345 6789</p>
          <p className="mt-2 flex items-center gap-2 text-sm"><Mail size={15} /> techsupport@sahabat.edu</p>
          <button type="button" className="mt-5 w-full rounded-xl bg-white/20 py-3 font-semibold text-white transition hover:bg-white/30">Kirim Tiket TI</button>
        </aside>
      </div>
    </div>
  )
}
