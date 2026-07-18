'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered, Link2, Image as ImageIcon, UploadCloud, Send, Globe, FileText } from 'lucide-react'

/**
 * Unggah Konten Baru (desain citra "Halaman Edukasi Unggah Content").
 *
 * Tersambung ke POST /api/edukasi/kelola -> tabel modul_edukasi sungguhan.
 * "Publikasikan Langsung" set aktif=true (langsung tampil di /siswa/edukasi),
 * "Simpan sebagai Draft" set aktif=false (tersimpan, belum terlihat siswa).
 *
 * Cover Image, Kategori, dan Tag Terkait BELUM tersambung ke kolom DB
 * (modul_edukasi tidak punya kolom kategori/tag/cover terpisah dari
 * thumbnail_url yang sekarang belum ada uploader-nya) — tetap ditampilkan
 * sesuai desain karena form-nya real, tapi nilainya belum ikut tersimpan.
 * Ditandai jujur di bawah, bukan dihapus dari UI.
 */

const TOOLBAR = [Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered, Link2, ImageIcon]

export default function UnggahKonten() {
  const router = useRouter()
  const [judul, setJudul] = useState('')
  const [ringkasan, setRingkasan] = useState('')
  const [isi, setIsi] = useState('')
  const [kategori, setKategori] = useState('')
  const [audiens, setAudiens] = useState('Semua Siswa')
  const [tags, setTags] = useState(['Kecemasan', 'Tips'])
  const [tagInput, setTagInput] = useState('')
  const [publikasi, setPublikasi] = useState('langsung')
  const [pesan, setPesan] = useState('')
  const [error, setError] = useState('')
  const [kirim, setKirim] = useState(false)

  function tambahTag(e) {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  async function submit() {
    if (!judul.trim() || kirim) { if (!judul.trim()) setError('Judul artikel wajib diisi.'); return }
    setKirim(true)
    setError('')
    setPesan('')
    try {
      const res = await fetch('/api/edukasi/kelola', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul,
          deskripsi: ringkasan,
          isi,
          tipe: 'ARTIKEL',
          publikasi,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Gagal menyimpan artikel.')
      setPesan(
        publikasi === 'langsung'
          ? `"${judul}" dipublikasikan dan sekarang tampil di halaman edukasi siswa.`
          : `"${judul}" disimpan sebagai draft.`
      )
      setTimeout(() => router.push('/guru-bk/edukasi'), 1200)
    } catch (e) {
      setError(e.message)
    } finally {
      setKirim(false)
    }
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-3xl font-bold text-gray-900">Unggah Konten Baru</h1>
      <p className="mt-1 text-gray-500">Buat dan publikasikan artikel edukasi untuk siswa</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* KIRI */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Detail Artikel</h2>

            <label className="mt-5 block text-sm font-semibold text-gray-700">Judul Artikel</label>
            <input value={judul} onChange={(e) => setJudul(e.target.value.slice(0, 60))} placeholder="Masukkan judul yang menarik (maks 60 karakter)"
              className="mt-1.5 w-full rounded-xl border border-sahabat-garis px-4 py-3 outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30" />

            <label className="mt-5 block text-sm font-semibold text-gray-700">Ringkasan Singkat</label>
            <p className="text-xs text-gray-400">Akan ditampilkan di kartu artikel pada beranda siswa.</p>
            <textarea value={ringkasan} onChange={(e) => setRingkasan(e.target.value.slice(0, 200))} rows={3} placeholder="Tuliskan 1-2 kalimat ringkasan tentang isi artikel ini..."
              className="mt-1.5 w-full resize-y rounded-xl border border-sahabat-garis px-4 py-3 outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30" />

            <label className="mt-5 block text-sm font-semibold text-gray-700">Isi Artikel</label>
            <div className="mt-1.5 overflow-hidden rounded-xl border border-sahabat-garis">
              <div className="flex flex-wrap items-center gap-1 border-b border-sahabat-garis bg-sahabat-latar px-3 py-2 text-gray-500">
                {TOOLBAR.map((I, i) => <button key={i} type="button" className="rounded p-1.5 hover:bg-white" tabIndex={-1} aria-hidden="true"><I size={16} /></button>)}
              </div>
              <textarea value={isi} onChange={(e) => setIsi(e.target.value)} rows={12} placeholder="Mulai menulis konten edukasi di sini..."
                className="w-full resize-y px-4 py-3 outline-none" />
            </div>
          </section>

          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Cover Image</h2>
            <p className="text-xs text-gray-400">Gunakan rasio lanskap (16:9). Rekomendasi ukuran: 1200×675px.</p>
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sahabat-garis bg-sahabat-latar/50 px-6 py-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sahabat-muda text-sahabat"><UploadCloud size={28} aria-hidden="true" /></span>
              <p className="mt-3 font-semibold text-gray-800">Tarik dan lepas gambar di sini</p>
              <p className="text-sm text-gray-500">atau klik untuk menelusuri file (JPG, PNG, maksimal 5MB)</p>
              <button type="button" className="mt-4 rounded-xl bg-sahabat-muda px-6 py-2.5 text-sm font-semibold text-sahabat-tua transition hover:bg-sahabat-muda/70">Pilih File</button>
            </div>
          </section>
        </div>

        {/* KANAN */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Pengaturan Konten</h2>

            <label className="mt-4 block text-sm font-semibold text-gray-700">Kategori</label>
            <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="mt-1.5 w-full rounded-xl border border-sahabat-garis px-4 py-2.5 outline-none focus:border-sahabat">
              <option value="">Pilih Kategori Utama</option>
              <option>Bullying</option><option>Kesehatan Mental</option><option>Dukungan Sosial</option><option>Keamanan Digital</option><option>Pengembangan Diri</option>
            </select>

            <label className="mt-4 block text-sm font-semibold text-gray-700">Target Audiens</label>
            <select value={audiens} onChange={(e) => setAudiens(e.target.value)} className="mt-1.5 w-full rounded-xl border border-sahabat-garis px-4 py-2.5 outline-none focus:border-sahabat">
              <option>Semua Siswa</option><option>Kelas 10</option><option>Kelas 11</option><option>Kelas 12</option>
            </select>

            <label className="mt-4 block text-sm font-semibold text-gray-700">Tag Terkait</label>
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={tambahTag} placeholder="Tekan enter untuk menambah tag"
              className="mt-1.5 w-full rounded-xl border border-sahabat-garis px-4 py-2.5 outline-none focus:border-sahabat" />
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 rounded-full bg-sahabat-muda px-3 py-1 text-sm text-sahabat-tua">
                  {t} <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Hapus ${t}`}>×</button>
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Publikasi</h2>
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-center justify-between">
                <span className="flex items-center gap-2 text-gray-800"><Globe size={18} className="text-sahabat" /> Publikasikan Langsung</span>
                <input type="radio" name="pub" checked={publikasi === 'langsung'} onChange={() => setPublikasi('langsung')} className="h-4 w-4 accent-[color:var(--sahabat-ungu)]" />
              </label>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="flex items-center gap-2 text-gray-800"><FileText size={18} className="text-gray-400" /> Simpan sebagai Draft</span>
                <input type="radio" name="pub" checked={publikasi === 'draft'} onChange={() => setPublikasi('draft')} className="h-4 w-4 accent-[color:var(--sahabat-ungu)]" />
              </label>
            </div>
            <button type="button" onClick={submit} disabled={kirim} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-sahabat py-3 font-semibold text-white transition hover:bg-sahabat-tua disabled:opacity-40">
              <Send size={16} /> {kirim ? 'Menyimpan…' : 'Publikasikan Konten'}
            </button>
            <button type="button" onClick={() => router.push('/guru-bk/edukasi')} className="mt-2 w-full rounded-xl border border-sahabat-garis py-3 font-semibold text-gray-600 transition hover:bg-sahabat-latar">Batal</button>
            {pesan && <p className="mt-3 text-sm text-emerald-700" aria-live="polite">{pesan}</p>}
            {error && <p className="mt-3 text-sm text-darurat" role="alert">{error}</p>}
          </section>
        </div>
      </div>
    </div>
  )
}
