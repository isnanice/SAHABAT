'use client'

import { Users, HeartHandshake, MessagesSquare, UserPlus, AlertTriangle, AlertOctagon, Info, Star, Search, Filter } from 'lucide-react'

/**
 * Ruang Dukungan Sebaya (view Guru BK) — desain citra.
 *
 * Backend pemasangan buddy + pelacakan keterlibatan belum ada; isi di sini
 * CONTOH untuk menyamai desain. Tombol Kelola/Terima visual sampai modul
 * buddy nyata dibangun.
 */

const TERTUNDA = [
  { nama: 'Azka', inisial: 'AJ', warna: 'bg-orange-200 text-orange-800', pesan: 'Membutuhkan teman belajar dan dukungan untuk mengatasi kecemasan.' },
  { nama: 'Kafka', inisial: 'K', warna: 'bg-emerald-200 text-emerald-800', pesan: 'Mencari dukungan dari sesama penderita.' },
]

const AKTIF = [
  { nama: 'David', inisial: 'D', warna: 'bg-sahabat text-white', status: 'Terlatih (1)', statusWarna: 'bg-emerald-100 text-emerald-700', damping: '2 / 3', rating: '4.8' },
  { nama: 'Sarah', inisial: 'S', warna: 'bg-purple-300 text-purple-800', status: 'Pelatihan (80%)', statusWarna: 'bg-sahabat-muda text-sahabat-tua', damping: 'N/A', rating: null },
  { nama: 'Nuha', inisial: 'N', warna: 'bg-orange-200 text-orange-800', status: 'Terlatih (1)', statusWarna: 'bg-emerald-100 text-emerald-700', damping: '1 / 2', rating: '4.5' },
]

export default function BuddyGuruBK() {
  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-3xl font-bold text-gray-900">Ruang Dukungan Sebaya</h1>
      <p className="mt-1 text-gray-500">Pantau pasangan rekan, lacak keterlibatan, dan kelola permintaan dukungan aktif.</p>

      {/* Stat cards */}
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sahabat-muda text-sahabat"><Users size={22} /></span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">+2% bulan ini</span>
          </div>
          <p className="mt-4 text-4xl font-extrabold text-gray-900">50</p>
          <p className="mt-1 text-gray-500">Buddy Aktif</p>
        </div>
        <div className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sahabat-muda text-sahabat"><HeartHandshake size={22} /></span>
            <span className="text-xs font-medium text-gray-400">Total saat ini</span>
          </div>
          <p className="mt-4 text-4xl font-extrabold text-gray-900">12</p>
          <p className="mt-1 text-gray-500">Total Pendampingan Berhasil</p>
        </div>
        <div className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sahabat-muda text-sahabat"><MessagesSquare size={22} /></span>
            <span className="text-xs font-semibold text-sahabat">Tinggi Keterlibatan</span>
          </div>
          <p className="mt-4 text-4xl font-extrabold text-gray-900">87%</p>
          <p className="mt-1 text-gray-500">Tingkat Keterlibatan Mingguan</p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sahabat-latar"><div className="h-full rounded-full bg-sahabat" style={{ width: '87%' }} /></div>
        </div>
      </div>

      {/* Permintaan Tertunda + Perhatian */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Permintaan Tertunda ({TERTUNDA.length})</h2>
            <button type="button" className="text-sm font-semibold text-sahabat hover:underline">Lihat Semua</button>
          </div>
          <div className="mt-4 space-y-3">
            {TERTUNDA.map((t) => (
              <div key={t.nama} className="flex items-center gap-3 rounded-xl border border-sahabat-garis p-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold ${t.warna}`}>{t.inisial}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900">{t.nama}</p>
                  <p className="text-sm text-gray-500">{t.pesan}</p>
                </div>
                <button type="button" className="rounded-lg p-2 text-sahabat hover:bg-sahabat-muda" aria-label="Pasangkan buddy"><UserPlus size={18} /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-red-200 bg-red-50/40 p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-bold text-darurat"><AlertTriangle size={20} /> Perhatian</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-darurat-muda p-4">
              <p className="flex items-center gap-2 font-semibold text-darurat"><AlertOctagon size={16} /> Peringatan Keterlibatan Rendah</p>
              <p className="mt-1 text-sm text-gray-700">Pasangan #402 (Sam &amp; Chris) belum berkomunikasi selama 14 hari.</p>
              <button type="button" className="mt-1 text-sm font-semibold text-darurat underline">Ulasan</button>
            </div>
            <div className="rounded-xl bg-sahabat-biru p-4">
              <p className="flex items-center gap-2 font-semibold text-sahabat-tua"><Info size={16} /> Catatan Umpan Balik</p>
              <p className="mt-1 text-sm text-gray-700">Buddy &apos;Emma&apos; melaporkan sedikit konflik dalam sesi terakhir.</p>
              <button type="button" className="mt-1 text-sm font-semibold text-sahabat underline">Lihat Detail</button>
            </div>
          </div>
        </section>
      </div>

      {/* Daftar Teman Aktif */}
      <section className="mt-6 rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Daftar Teman Aktif</h2>
            <p className="text-sm text-gray-500">Relawan siswa terlatih yang saat ini tersedia atau telah dipasangkan.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Filter..." className="rounded-xl border border-sahabat-garis py-2 pl-9 pr-4 text-sm outline-none focus:border-sahabat" />
            </div>
            <button type="button" className="flex items-center gap-2 rounded-xl border border-sahabat-garis px-3 py-2 text-sm text-gray-600"><Filter size={15} /> Filter</button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-sahabat-garis text-xs uppercase tracking-wide text-gray-400">
                <th className="py-3 font-medium">Nama Siswa</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium">Pendampingan Aktif</th>
                <th className="py-3 font-medium">Rating</th>
                <th className="py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sahabat-garis">
              {AKTIF.map((a) => (
                <tr key={a.nama}>
                  <td className="py-4">
                    <span className="flex items-center gap-3">
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${a.warna}`}>{a.inisial}</span>
                      <span className="font-medium text-gray-900">{a.nama}</span>
                    </span>
                  </td>
                  <td className="py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${a.statusWarna}`}>{a.status}</span></td>
                  <td className="py-4 text-gray-700">{a.damping}</td>
                  <td className="py-4">{a.rating ? <span className="inline-flex items-center gap-1 text-gray-800"><Star size={14} className="text-amber-500" /> {a.rating}</span> : <span className="italic text-gray-400">Baru</span>}</td>
                  <td className="py-4 text-right"><button type="button" className="text-sm font-semibold text-sahabat hover:underline">Kelola</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <button type="button" className="text-sm font-semibold text-gray-500 hover:text-sahabat">Lihat Daftar Lengkap</button>
        </div>
      </section>
    </div>
  )
}
