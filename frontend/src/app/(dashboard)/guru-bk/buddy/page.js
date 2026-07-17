"use client";

import { UserPlus, Search, Filter } from 'lucide-react'

export default function BuddyPage() {
  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Ruang Dukungan Sebaya</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau pasangan rekan, lacak keterlibatan, dan kelola permintaan dukungan aktif.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
          <div className="absolute top-6 right-6">
            <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
              +2% bulan ini
            </span>
          </div>
          <div className="w-12 h-12 bg-[#E6EEFF] rounded-lg flex items-center justify-center text-[#3525CD] mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-1">50</h3>
          <p className="text-sm text-gray-500 font-medium">Buddy Aktif</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
          <div className="absolute top-6 right-6">
            <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">
              Total saat ini
            </span>
          </div>
          <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-gray-600 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 9.5 9 15l-3-3"></path><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10Z"></path></svg>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-1">12</h3>
          <p className="text-sm text-gray-500 font-medium">Total Pendampingan Berhasil</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative">
          <div className="absolute top-6 right-6">
            <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E6EEFF] text-[#3525CD]">
              Tinggi Keterlibatan
            </span>
          </div>
          <div className="w-12 h-12 bg-[#F1F5F9] rounded-lg flex items-center justify-center text-[#3525CD] mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h3 className="text-4xl font-bold text-gray-900 mb-1">87%</h3>
          <p className="text-sm text-gray-500 font-medium mb-3">Tingkat Keterlibatan Mingguan</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-[#3525CD] h-1.5 rounded-full" style={{ width: '87%' }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Permintaan Tertunda */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Permintaan Tertunda (2)</h3>
            <button className="text-sm font-medium text-[#3525CD] hover:text-[#2a1d9b]">Lihat Semua</button>
          </div>
          <div className="space-y-4">
            <div className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                  AJ
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Azka</h4>
                  <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] line-clamp-2">Membutuhkan teman belajar dan dukungan untuk mengatasi kecemasan.</p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#3525CD] hover:bg-gray-50 transition">
                <UserPlus size={16} />
              </button>
            </div>
            
            <div className="p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors bg-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                  K
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Kafka</h4>
                  <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] line-clamp-2">Mencari dukungan dari sesama penderita.</p>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[#3525CD] hover:bg-gray-50 transition">
                <UserPlus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Perhatian */}
        <div className="bg-white rounded-2xl p-6 border border-red-100 shadow-[0_0_15px_rgba(254,226,226,0.5)]">
          <div className="flex items-center gap-2 mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            <h3 className="font-bold text-gray-900 text-lg">Perhatian</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
              <div className="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <div>
                  <h4 className="font-semibold text-red-900 text-sm">Peringatan Keterlibatan Rendah</h4>
                  <p className="text-xs text-red-700 mt-1">Pasangan #402 (Sam & Chris) belum berkomunikasi selama 14 hari.</p>
                  <a href="#" className="inline-block mt-2 text-xs font-bold text-red-900 underline">Ulasan</a>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-[#E6EEFF] border border-blue-100 rounded-xl">
              <div className="flex items-start gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3525CD] mt-0.5 flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <div>
                  <h4 className="font-semibold text-[#1e1577] text-sm">Catatan Umpan Balik</h4>
                  <p className="text-xs text-[#3525CD] mt-1">Buddy &apos;Emma&apos; melaporkan sedikit konflik dalam sesi terakhir.</p>
                  <a href="#" className="inline-block mt-2 text-xs font-bold text-[#1e1577] underline">Lihat Detail</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Teman Aktif */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Daftar Teman Aktif</h3>
            <p className="text-xs text-gray-500 mt-1">Relawan mahasiswa terlatih yang saat ini tersedia atau telah dipasangkan.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={14} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Filter..."
                className="w-48 pl-9 pr-3 py-1.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#3525CD]/30"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50">
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-gray-100 text-xs font-medium text-gray-500">
                <th className="px-6 py-4 font-medium">Nama Siswa</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Pendampingan Aktif</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              <tr className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs">
                      D
                    </div>
                    <span className="font-medium text-gray-900">David</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 font-medium text-[11px] rounded-full">Terlatih (1)</span>
                </td>
                <td className="px-6 py-4 text-gray-700 font-medium">2 / 3</td>
                <td className="px-6 py-4 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-orange-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <span className="font-medium text-gray-900">4.8</span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-[#3525CD] font-medium hover:underline">Kelola</button>
                </td>
              </tr>
              
              <tr className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-semibold text-xs">
                      S
                    </div>
                    <span className="font-medium text-gray-900">Sarah</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 font-medium text-[11px] rounded-full">Pelatihan (80%)</span>
                </td>
                <td className="px-6 py-4 text-gray-700 font-medium">N/A</td>
                <td className="px-6 py-4 flex items-center gap-1.5">
                  <span className="text-gray-500 italic">Baru</span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-[#3525CD] font-medium hover:underline">Kelola</button>
                </td>
              </tr>
              
              <tr className="hover:bg-gray-50/50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center font-semibold text-xs">
                      N
                    </div>
                    <span className="font-medium text-gray-900">Nuha</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-2.5 py-1 bg-green-100 text-green-700 font-medium text-[11px] rounded-full">Terlatih (1)</span>
                </td>
                <td className="px-6 py-4 text-gray-700 font-medium">1 / 2</td>
                <td className="px-6 py-4 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-orange-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <span className="font-medium text-gray-900">4.5</span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-[#3525CD] font-medium hover:underline">Kelola</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 text-center">
          <button className="text-xs font-medium text-gray-500 hover:text-gray-800 transition">Lihat Daftar Lengkap</button>
        </div>
      </div>
    </div>
  )
}
