"use client";

import Image from 'next/image'
import { Calendar, MoreVertical } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tinjauan Harian</h1>
          <p className="text-sm text-gray-500 mt-1">Pantau indikator kesejahteraan siswa dan laporan masuk.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
          <Calendar size={16} />
          Juli 2026
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#E6EEFF] rounded-lg flex items-center justify-center text-[#3525CD]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              +12%
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Total Laporan Bulan Ini</p>
          <h3 className="text-4xl font-bold text-gray-900 mt-1">148</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#FEF2F2] rounded-lg flex items-center justify-center text-red-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <span className="text-xs font-medium text-red-600">Butuh Tindakan</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Prioritas Tinggi (Kritis)</p>
          <h3 className="text-4xl font-bold text-gray-900 mt-1">12</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#FFF7ED] rounded-lg flex items-center justify-center text-orange-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium">Prioritas Menengah</p>
          <h3 className="text-4xl font-bold text-gray-900 mt-1">34</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-[#E0F9E8] rounded-lg flex items-center justify-center text-green-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              +5%
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Kasus Selesai</p>
          <h3 className="text-4xl font-bold text-gray-900 mt-1">102</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Tren Kategori Laporan */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Tren Kategori Laporan</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="h-[220px] flex items-end justify-between px-4 pb-2">
            {/* Mock Chart Bars */}
            <div className="w-16 bg-[#E6EEFF] h-[30%] rounded-t flex flex-col justify-end group hover:bg-[#3525CD] transition-colors"></div>
            <div className="w-16 bg-[#A5B4FC] h-[50%] rounded-t flex flex-col justify-end group hover:bg-[#3525CD] transition-colors"></div>
            <div className="w-16 bg-[#3525CD] h-[80%] rounded-t flex flex-col justify-end group transition-colors"></div>
            <div className="w-16 bg-[#818CF8] h-[45%] rounded-t flex flex-col justify-end group hover:bg-[#3525CD] transition-colors"></div>
            <div className="w-16 bg-[#E0E7FF] h-[25%] rounded-t flex flex-col justify-end group hover:bg-[#3525CD] transition-colors"></div>
            <div className="w-16 bg-[#4F46E5] h-[75%] rounded-t flex flex-col justify-end group hover:bg-[#3525CD] transition-colors"></div>
            <div className="w-16 bg-[#C7D2FE] h-[40%] rounded-t flex flex-col justify-end group hover:bg-[#3525CD] transition-colors"></div>
          </div>
          <div className="flex justify-between px-6 text-xs text-gray-500 mt-2 border-t border-gray-100 pt-3">
            <span>Mei</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Ags</span>
            <span>Sep</span>
            <span>Okt</span>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#E0E7FF]"></div><span className="text-xs text-gray-600">Fisik</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#818CF8]"></div><span className="text-xs text-gray-600">Verbal</span></div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#3525CD]"></div><span className="text-xs text-gray-600">Siber</span></div>
          </div>
        </div>

        {/* Tingkat Resolusi */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-900 mb-6">Tingkat Resolusi</h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100" strokeWidth="4"></circle>
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-[#3525CD]" strokeWidth="4" strokeDasharray="82, 100" strokeLinecap="round"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">82%</span>
                <span className="text-[10px] text-gray-500 mt-1 uppercase font-medium tracking-wide">Diselesaikan</span>
              </div>
            </div>
          </div>
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">Rata-rata waktu penyelesaian:</p>
            <p className="text-lg font-bold text-[#3525CD] mt-1">3.2 Hari</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kasus Membutuhkan Perhatian */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">Kasus Membutuhkan Perhatian</h3>
              <p className="text-xs text-gray-500 mt-1">Daftar diurutkan berdasarkan tingkat urgensi.</p>
            </div>
            <button className="text-sm font-medium text-[#3525CD] hover:text-[#2a1d9b]">Lihat Semua</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8FAFC] text-xs font-medium text-gray-500">
                  <th className="px-6 py-3 font-medium">ID Siswa</th>
                  <th className="px-6 py-3 font-medium">Tipe Insiden</th>
                  <th className="px-6 py-3 font-medium">Urgensi</th>
                  <th className="px-6 py-3 font-medium">Status Terakhir</th>
                  <th className="px-6 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                <tr>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-[#E6EEFF] text-[#3525CD] font-mono text-xs rounded">S-***892</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">Perundungan Siber</td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-700"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Tinggi</span></td>
                  <td className="px-6 py-4 text-gray-600">Menunggu Asesmen</td>
                  <td className="px-6 py-4 text-right"></td>
                </tr>
                <tr>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-[#E6EEFF] text-[#3525CD] font-mono text-xs rounded">S-***415</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">Kekerasan Verbal</td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-orange-50 text-orange-700"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>Sedang</span></td>
                  <td className="px-6 py-4 text-gray-600">Sesi Konseling #1</td>
                  <td className="px-6 py-4 text-right"></td>
                </tr>
                <tr>
                  <td className="px-6 py-4">
                    <span className="inline-block px-2.5 py-1 bg-[#E6EEFF] text-[#3525CD] font-mono text-xs rounded">S-***103</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">Kecemasan Akademik</td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Rendah</span></td>
                  <td className="px-6 py-4 text-gray-600">Dijadwalkan (Bsk)</td>
                  <td className="px-6 py-4 text-right"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Titik Rawan Sekolah */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <h3 className="font-bold text-gray-900">Titik Rawan Sekolah</h3>
          </div>
          <p className="text-xs text-gray-500 mb-6">Area dengan frekuensi laporan tertinggi bulan ini.</p>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-800">Kantin Belakang</span>
                <span className="text-red-600 font-semibold text-xs">Tinggi (42)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-red-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-800">Lorong Lab Biologi</span>
                <span className="text-orange-600 font-semibold text-xs">Sedang (18)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-800">Lapangan Basket</span>
                <span className="text-gray-500 font-semibold text-xs">Rendah (5)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
