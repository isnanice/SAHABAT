"use client";

import { useState, useRef, useCallback } from 'react'
import { Upload, ChevronDown, Edit2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link as LinkIcon, Heading, X, Image as ImageIcon } from 'lucide-react'

const KATEGORI_WARNA = {
  'Cyberbullying': 'bg-orange-100 text-orange-800',
  'Kesehatan Mental': 'bg-[#E6EEFF] text-[#3525CD]',
  'Dukungan Sosial': 'bg-blue-100 text-blue-800',
  'Manajemen Emosi': 'bg-purple-100 text-purple-800',
}

const ARTIKEL_AWAL = [
  { id: 1, judul: 'Mengenal Cyberbullying', kategori: 'Cyberbullying', sasaran: 'Semua Siswa', isi: '<p>Pahami bentuk, dampak, dan cara menghadapi cyberbullying agar tetap aman dan percaya diri di ruang digital.</p>', thumbnail: null, tayangan: 3204, selesai: 85 },
  { id: 2, judul: 'Pentingnya Kesehatan Mental Remaja', kategori: 'Kesehatan Mental', sasaran: 'Kelas 10', isi: '<p>Kenali pentingnya menjaga kesehatan mental sejak dini untuk mendukung tumbuh kembang remaja.</p>', thumbnail: null, tayangan: 1842, selesai: 62 },
  { id: 3, judul: 'Cara Mendukung Teman yang Kesulitan', kategori: 'Dukungan Sosial', sasaran: 'Semua Siswa', isi: '<p>Menjadi pendengar yang baik dan memberikan dukungan emosional dapat membantu teman melewati masa sulit.</p>', thumbnail: null, tayangan: 890, selesai: 45 },
]

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`p-1.5 rounded transition text-sm ${active ? 'bg-[#3525CD] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
      title={title}
    >
      {children}
    </button>
  )
}

export default function EdukasiPage() {
  const [artikel, setArtikel] = useState(ARTIKEL_AWAL)
  const [editId, setEditId] = useState(null) // null = baru, number = edit
  const [judul, setJudul] = useState('')
  const [kategori, setKategori] = useState('Cyberbullying')
  const [sasaran, setSasaran] = useState('Semua Siswa')
  const [deadline, setDeadline] = useState('')
  const [thumbnail, setThumbnail] = useState(null) // base64
  const [thumbnailName, setThumbnailName] = useState('')
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)

  const exec = useCallback((cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
  }, [])

  const handleThumbnail = (file) => {
    if (!file) return
    setThumbnailName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setThumbnail(e.target.result)
    reader.readAsDataURL(file)
  }

  const resetForm = () => {
    setEditId(null)
    setJudul('')
    setKategori('Cyberbullying')
    setSasaran('Semua Siswa')
    setDeadline('')
    setThumbnail(null)
    setThumbnailName('')
    if (editorRef.current) editorRef.current.innerHTML = ''
  }

  const startEdit = (item) => {
    setEditId(item.id)
    setJudul(item.judul)
    setKategori(item.kategori)
    setSasaran(item.sasaran)
    setThumbnail(item.thumbnail)
    setThumbnailName('')
    if (editorRef.current) editorRef.current.innerHTML = item.isi || ''
    // scroll to form
    document.getElementById('form-edukasi')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const isiHtml = editorRef.current?.innerHTML || ''
    if (!judul.trim() || !isiHtml.trim() || isiHtml === '<br>') {
      alert('Judul dan Isi Artikel wajib diisi.')
      return
    }

    if (editId !== null) {
      setArtikel(prev => prev.map(a => a.id === editId
        ? { ...a, judul, kategori, sasaran, isi: isiHtml, thumbnail }
        : a
      ))
    } else {
      const newItem = { id: Date.now(), judul, kategori, sasaran, isi: isiHtml, thumbnail, tayangan: 0, selesai: 0 }
      setArtikel(prev => [newItem, ...prev])
    }
    resetForm()
  }

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edukasi</h1>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">Kelola modul perpustakaan, lacak tingkat penyelesaian, dan terbitkan artikel edukasi untuk siswa.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Jumlah Tayangan', val: '1,450', badge: '+15%', color: 'text-[#3525CD]' },
          { label: 'Rata-Rata Selesai', val: '78%', badge: '+3%', color: 'text-gray-900' },
          { label: 'Modul Aktif', val: String(artikel.length), badge: '1 Kategori', color: 'text-gray-900' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
              <h4 className={`text-2xl font-bold ${s.color}`}>{s.val}</h4>
            </div>
            <span className="text-xs text-green-600 font-medium">{s.badge}</span>
          </div>
        ))}
      </div>

      {/* Form Unggah/Edit */}
      <div id="form-edukasi" className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {editId !== null ? '✏️ Edit Artikel' : 'Unggah Artikel Edukasi Baru'}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {editId !== null ? 'Ubah konten artikel yang sudah ada.' : 'Artikel yang diterbitkan akan langsung muncul di halaman Edukasi siswa.'}
            </p>
          </div>
          {editId !== null && (
            <button onClick={resetForm} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">
              <X size={14} /> Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Judul Artikel *</label>
              <input value={judul} onChange={e => setJudul(e.target.value)} type="text" required placeholder="Masukkan judul materi..." className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3525CD]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kategori Modul</label>
              <div className="relative">
                <select value={kategori} onChange={e => setKategori(e.target.value)} className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3525CD]">
                  {Object.keys(KATEGORI_WARNA).map(k => <option key={k}>{k}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kelompok Sasaran</label>
              <div className="relative">
                <select value={sasaran} onChange={e => setSasaran(e.target.value)} className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3525CD]">
                  {['Semua Siswa','Kelas 10','Kelas 11','Kelas 12'].map(k => <option key={k}>{k}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Jatuh Tempo (Opsional)</label>
              <div className="relative">
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3525CD] cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full" />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Thumbnail Foto</label>
            <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={e => handleThumbnail(e.target.files[0])} />
            {thumbnail ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnail} alt="Thumbnail preview" className="h-32 w-48 object-cover rounded-lg border border-gray-200" />
                <button type="button" onClick={() => { setThumbnail(null); setThumbnailName(''); fileInputRef.current.value = '' }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center px-6 py-8 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#3525CD] bg-gray-50 hover:bg-blue-50/50 transition group cursor-pointer">
                <ImageIcon size={28} className="text-gray-400 group-hover:text-[#3525CD] mb-2 transition" />
                <p className="text-sm font-medium text-[#3525CD]">Klik untuk unggah gambar</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF hingga 2MB</p>
              </button>
            )}
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Isi Artikel *</label>
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#3525CD] focus-within:border-transparent transition-all">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
                  <ToolbarBtn onClick={() => exec('formatBlock', 'h2')} title="Judul (H2)"><span className="font-bold text-xs">H2</span></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('formatBlock', 'h3')} title="Sub-judul (H3)"><span className="font-bold text-xs">H3</span></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('formatBlock', 'p')} title="Paragraf"><span className="text-xs">P</span></ToolbarBtn>
                </div>
                <div className="flex items-center gap-0.5 px-2 border-r border-gray-200">
                  <ToolbarBtn onClick={() => exec('bold')} title="Bold"><Bold size={15} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('italic')} title="Italic"><Italic size={15} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('underline')} title="Underline"><Underline size={15} /></ToolbarBtn>
                </div>
                <div className="flex items-center gap-0.5 px-2 border-r border-gray-200">
                  <ToolbarBtn onClick={() => exec('justifyLeft')} title="Rata Kiri"><AlignLeft size={15} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('justifyCenter')} title="Rata Tengah"><AlignCenter size={15} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('justifyRight')} title="Rata Kanan"><AlignRight size={15} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('justifyFull')} title="Rata Kiri-Kanan"><AlignJustify size={15} /></ToolbarBtn>
                </div>
                <div className="flex items-center gap-0.5 px-2 border-r border-gray-200">
                  <ToolbarBtn onClick={() => exec('insertUnorderedList')} title="Bullet List"><List size={15} /></ToolbarBtn>
                  <ToolbarBtn onClick={() => exec('insertOrderedList')} title="Numbered List"><ListOrdered size={15} /></ToolbarBtn>
                </div>
                <div className="flex items-center gap-0.5 pl-2">
                  <ToolbarBtn onClick={() => { const url = prompt('Masukkan URL:'); if (url) exec('createLink', url); }} title="Insert Link"><LinkIcon size={15} /></ToolbarBtn>
                </div>
              </div>
              {/* Editable Area */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-[280px] p-5 text-sm text-gray-700 leading-relaxed outline-none prose prose-sm max-w-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mt-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#3525CD] [&_a]:underline"
                data-placeholder="Tuliskan isi artikel secara lengkap di sini..."
                style={{ minHeight: '280px' }}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-[#3525CD] hover:bg-[#2a1d9b] text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2 shadow-md mt-2">
            <Upload size={16} />
            {editId !== null ? 'Simpan Perubahan Artikel' : 'Unggah & Terbitkan Artikel'}
          </button>
        </form>
      </div>

      {/* Library */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="text-[#3525CD]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Perpustakaan Konten ({artikel.length} artikel)</h3>
        </div>

        {artikel.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-gray-400">
            <Upload size={32} className="mb-3" />
            <p className="font-medium">Belum ada artikel. Unggah artikel pertamamu di atas!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {artikel.map((item) => (
              <div key={item.id} className="p-5 border border-gray-100 rounded-xl flex items-center gap-5 hover:border-gray-300 transition shadow-sm">
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden bg-[#E6EEFF] flex items-center justify-center text-[#3525CD]">
                  {item.thumbnail
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={item.thumbnail} alt={item.judul} className="w-full h-full object-cover" />
                    : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase ${KATEGORI_WARNA[item.kategori] || 'bg-gray-100 text-gray-600'}`}>{item.kategori}</span>
                    <span className="text-[11px] text-gray-400">{item.sasaran}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 truncate">{item.judul}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 w-36">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${item.selesai}%` }} />
                      </div>
                      <span className="text-xs font-bold text-gray-600">{item.selesai}%</span>
                    </div>
                    <span className="text-xs text-gray-400">{item.tayangan.toLocaleString()} tayangan</span>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => startEdit(item)}
                  className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#3525CD] hover:bg-[#E6EEFF] rounded-full transition flex-shrink-0"
                  title="Edit Artikel"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
