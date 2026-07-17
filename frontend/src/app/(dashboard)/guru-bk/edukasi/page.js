"use client";

import { Upload, ChevronDown, Edit2, Share2, Search } from 'lucide-react'

export default function EdukasiPage() {
  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex items-start justify-between mb-8">
        <div className="max-w-xl">
          <h1 className="text-2xl font-bold text-gray-900">Edukasi</h1>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">Kelola modul perpustakaan, lacak tingkat penyelesaian, dan tetapkan sumber daya kepada kelompok siswa untuk mendukung kesejahteraan mental.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#3525CD] text-white rounded-xl text-sm font-medium hover:bg-[#2a1d9b] transition shadow-sm">
          <Upload size={16} />
          Unggah Konten Baru
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Kinerja Konten */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
          <h3 className="font-bold text-gray-900 mb-6 text-lg">Kinerja Konten</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Jumlah Tayangan</p>
              <h4 className="text-3xl font-bold text-[#3525CD]">1,450</h4>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                +15% Bulan ini
              </p>
            </div>
            
            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Rata-Rata</p>
              <h4 className="text-3xl font-bold text-gray-900">78%</h4>
              <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                +3% Bulan ini
              </p>
            </div>
            
            <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Modul Aktif</p>
              <h4 className="text-3xl font-bold text-gray-900">10</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">Meliputi 5 kategori</p>
            </div>
          </div>
          
          <div className="h-40 flex items-end justify-between px-2 pb-2 gap-4">
            {/* Mock Chart Bars */}
            <div className="flex-1 bg-[#E6EEFF] h-[30%] rounded-t-sm flex flex-col justify-end group hover:bg-[#A5B4FC] transition-colors"></div>
            <div className="flex-1 bg-[#E6EEFF] h-[45%] rounded-t-sm flex flex-col justify-end group hover:bg-[#A5B4FC] transition-colors"></div>
            <div className="flex-1 bg-[#E6EEFF] h-[65%] rounded-t-sm flex flex-col justify-end group hover:bg-[#A5B4FC] transition-colors"></div>
            <div className="flex-1 bg-[#3525CD] h-[90%] rounded-t-sm flex flex-col justify-end group shadow-[0_0_15px_rgba(53,37,205,0.3)]"></div>
            <div className="flex-1 bg-[#E6EEFF] h-[55%] rounded-t-sm flex flex-col justify-end group hover:bg-[#A5B4FC] transition-colors"></div>
            <div className="flex-1 bg-[#E6EEFF] h-[75%] rounded-t-sm flex flex-col justify-end group hover:bg-[#A5B4FC] transition-colors"></div>
            <div className="flex-1 bg-[#E6EEFF] h-[70%] rounded-t-sm flex flex-col justify-end group hover:bg-[#A5B4FC] transition-colors"></div>
            <div className="flex-1 bg-[#E6EEFF] h-[95%] rounded-t-sm flex flex-col justify-end group hover:bg-[#A5B4FC] transition-colors"></div>
          </div>
        </div>

        {/* Tetapkan Konten */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-900 text-lg mb-2">Tetapkan Konten</h3>
          <p className="text-sm text-gray-500 mb-6">Targetkan modul spesifik untuk kelompok siswa atau kelas.</p>
          
          <div className="space-y-5 flex-1">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Select Module</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3525CD] focus:border-transparent">
                  <option>Memahami Cyberbullying</option>
                  <option>Pentingnya Kesehatan Mental</option>
                  <option>Cara Mendukung Teman</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Kelompok Sasaran</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3525CD] focus:border-transparent">
                  <option>Kelas 10 - Semua</option>
                  <option>Kelas 11 - Semua</option>
                  <option>Kelas 12 - Semua</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Tanggal Jatuh Tempo (Opsional)</label>
              <input type="text" placeholder="mm/dd/yyyy" className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3525CD] focus:border-transparent" />
            </div>
          </div>
          
          <button className="w-full mt-6 bg-[#E6EEFF] hover:bg-[#d6e2ff] text-[#3525CD] font-bold py-3 rounded-xl transition flex justify-center items-center gap-2">
            Kirim Tugas
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        </div>
      </div>

      {/* Perpustakaan Konten */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="text-[#3525CD]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Perpustakaan Konten</h3>
        </div>
        
        <div className="space-y-4">
          <div className="p-5 border border-gray-100 rounded-xl flex items-center justify-between hover:border-gray-300 transition shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-[#E6EEFF] rounded-lg flex items-center justify-center text-[#3525CD] flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="inline-block px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold tracking-wider rounded uppercase">Cyber Bullying</span>
                  <h4 className="font-bold text-gray-900 text-base">Mengenal Cyberbullying</h4>
                </div>
                <p className="text-sm text-gray-500">Pahami bentuk, dampak, dan cara menghadapi cyberbullying agar tetap aman dan percaya diri di ruang digital.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-10">
              <div>
                <div className="flex justify-between items-center mb-1 w-32">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tingkat Penyelesaian</span>
                  <span className="text-xs font-bold text-gray-900">85%</span>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pelihat</p>
                <p className="text-sm font-bold text-gray-900">3,204</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"><Edit2 size={16} /></button>
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#3525CD] hover:bg-[#E6EEFF] rounded-full transition"><Share2 size={16} /></button>
              </div>
            </div>
          </div>

          <div className="p-5 border border-gray-100 rounded-xl flex items-center justify-between hover:border-gray-300 transition shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-[#E6EEFF] rounded-lg flex items-center justify-center text-[#3525CD] flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="inline-block px-2 py-0.5 bg-[#E6EEFF] text-[#3525CD] text-[10px] font-bold tracking-wider rounded uppercase">Kesehatan Mental</span>
                  <h4 className="font-bold text-gray-900 text-base">Pentingnya Kesehatan Mental Remaja</h4>
                </div>
                <p className="text-sm text-gray-500">Kenali pentingnya menjaga kesehatan mental sejak dini untuk mendukung tumbuh kembang dan kesejahteraan remaja.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-10">
              <div>
                <div className="flex justify-between items-center mb-1 w-32">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tingkat Penyelesaian</span>
                  <span className="text-xs font-bold text-gray-900">62%</span>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-[#3525CD] h-1.5 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pelihat</p>
                <p className="text-sm font-bold text-gray-900">1,842</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"><Edit2 size={16} /></button>
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#3525CD] hover:bg-[#E6EEFF] rounded-full transition"><Share2 size={16} /></button>
              </div>
            </div>
          </div>

          <div className="p-5 border border-gray-100 rounded-xl flex items-center justify-between hover:border-gray-300 transition shadow-sm">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-[#E6EEFF] rounded-lg flex items-center justify-center text-[#3525CD] flex-shrink-0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold tracking-wider rounded uppercase">Dukungan Sosial</span>
                  <h4 className="font-bold text-gray-900 text-base">Cara Mendukung Teman yang Kesulitan</h4>
                </div>
                <p className="text-sm text-gray-500">Menjadi pendengar yang baik dan memberikan dukungan emosional dapat membantu teman melewati masa sulit tanpa merasa sendirian.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-10">
              <div>
                <div className="flex justify-between items-center mb-1 w-32">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tingkat Penyelesaian</span>
                  <span className="text-xs font-bold text-gray-900">45%</span>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-1.5">
                  <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Pelihat</p>
                <p className="text-sm font-bold text-gray-900">890</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition"><Edit2 size={16} /></button>
                <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#3525CD] hover:bg-[#E6EEFF] rounded-full transition"><Share2 size={16} /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button className="text-sm font-bold text-[#3525CD] hover:text-[#2a1d9b] flex items-center gap-1 mx-auto">
            Lihat Semua Modul
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
