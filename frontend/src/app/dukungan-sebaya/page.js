'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MessageSquare, UserPlus, UserRound } from 'lucide-react'

/**
 * Ruang Dukungan Sebaya (desain citra "Temukan Teman Cerita yang Tepat").
 *
 * Fitur peer-buddy penuh (profil nyata + chat antar siswa) belum dibangun —
 * butuh backend moderasi yang diawasi Guru BK, dan chat siswa-ke-siswa tanpa
 * pengawasan justru bisa jadi kanal perundungan baru. Jadi kartu di sini
 * adalah CONTOH, dan "Mulai Ngobrol" mengarah ke RuangAman (kanal dukungan
 * yang sungguhan) alih-alih memalsukan obrolan dengan orang yang tidak ada.
 *
 * Yang nyata di halaman ini: pencarian & filter minat bekerja betulan.
 */

const NAV = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang', href: '/tentang' },
  { label: 'Fitur', href: '/fitur', active: true },
  { label: 'Edukasi', href: '/edukasi' },
]

const MINAT = ['Semua', 'Musik', 'Olahraga', 'Membaca', 'Seni', 'Pendengar Baik']

const BUDDIES = [
  { nama: 'Buddy Putri', match: 90, desc: 'Sabar, hangat, dan senang mendengarkan. Cocok untuk yang butuh teman bercerita.', tags: ['Seni', 'Pendengar Baik'] },
  { nama: 'Buddy Mia', match: 80, desc: 'Ramah dan suportif. Menyukai obrolan santai sambil berbagi rekomendasi buku.', tags: ['Membaca', 'Musik'] },
  { nama: 'Buddy Bagas', match: 85, desc: 'Aktif dan mudah diajak mengobrol. Suka berbagi cerita seputar olahraga.', tags: ['Olahraga', 'Pendengar Baik'] },
  { nama: 'Buddy Reza', match: 70, desc: 'Senang menemani teman bercerita dan memberikan semangat lewat obrolan.', tags: ['Musik', 'Pendengar Baik'] },
  { nama: 'Buddy Sari', match: 88, desc: 'Tenang dan penuh empati. Suka membaca dan menemani teman yang sedang berat.', tags: ['Membaca', 'Pendengar Baik'] },
  { nama: 'Buddy Doni', match: 75, desc: 'Ceria dan suka bercanda. Cocok untuk yang butuh teman menghibur diri.', tags: ['Musik', 'Seni'] },
]

const FOOTER = [
  { label: 'Kebijakan Privasi', href: '/privasi' },
  { label: 'Syarat & Ketentuan', href: '/privasi' },
  { label: 'Kontak Darurat', href: '/kontak-darurat' },
  { label: 'Pusat Bantuan', href: '/kontak-darurat' },
]

export default function DukunganSebayaPage() {
  const [minat, setMinat] = useState('Semua')
  const [cari, setCari] = useState('')
  const [jml, setJml] = useState(4)

  const terfilter = useMemo(() => {
    const q = cari.trim().toLowerCase()
    return BUDDIES.filter((b) => {
      const cocokMinat = minat === 'Semua' || b.tags.includes(minat)
      const cocokCari = !q || b.nama.toLowerCase().includes(q) || b.tags.join(' ').toLowerCase().includes(q) || b.desc.toLowerCase().includes(q)
      return cocokMinat && cocokCari
    })
  }, [minat, cari])

  const tampil = terfilter.slice(0, jml)

  return (
    <div className="min-h-screen bg-sahabat-latar">
      {/* NAV */}
      <header className="flex items-center justify-between border-b border-sahabat-garis bg-white px-6 py-4 lg:px-12">
        <Link href="/" aria-label="SAHABAT" className="flex items-center">
          <Image src="/logo.png" alt="Logo SAHABAT" width={140} height={50} priority style={{ height: 'auto' }} />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} className={`text-sm ${n.active ? 'font-semibold text-sahabat underline underline-offset-8' : 'text-gray-600 hover:text-sahabat'}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-full border border-sahabat px-5 py-2 text-sm font-semibold text-sahabat">Masuk</Link>
          <Link href="/register" className="rounded-full bg-sahabat px-5 py-2 text-sm font-semibold text-white">Daftar</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-sahabat lg:text-5xl">Temukan Teman Cerita yang Tepat</h1>
            <p className="mt-4 max-w-2xl text-gray-600">
              Terhubung dengan peer-buddy yang memiliki ketertarikan atau
              pengalaman yang sama. Kami di sini untuk saling mendengarkan dan
              menguatkan.
            </p>
          </div>
          <span className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sahabat text-white sm:flex">
            <UserPlus size={26} aria-hidden="true" />
          </span>
        </div>

        {/* Cari + filter */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              value={cari}
              onChange={(e) => { setCari(e.target.value); setJml(4) }}
              placeholder="Cari berdasarkan minat Anda"
              className="w-full rounded-full border border-sahabat-garis bg-white py-3 pl-11 pr-4 text-gray-900 outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
            />
          </div>
          {MINAT.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMinat(m); setJml(4) }}
              className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                minat === m ? 'bg-sahabat text-white' : 'border border-sahabat-garis bg-white text-gray-700 hover:bg-sahabat-latar'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Kartu buddy */}
        {tampil.length === 0 ? (
          <p className="py-16 text-center text-gray-500">Tidak ada buddy yang cocok. Coba minat atau kata kunci lain.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tampil.map((b) => (
              <article key={b.nama} className="flex flex-col items-center rounded-2xl border border-sahabat-garis bg-white p-6 text-center shadow-sm">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-700 text-white">
                  <UserRound size={40} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{b.nama}</h3>
                <span className="mt-2 rounded-full bg-sahabat px-3 py-1 text-xs font-semibold text-white">{b.match}% Match</span>
                <p className="mt-3 text-sm text-gray-600">{b.desc}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {b.tags.map((t) => (
                    <span key={t} className="rounded-md bg-sahabat-muda px-2.5 py-1 text-xs font-medium text-sahabat-tua">{t}</span>
                  ))}
                </div>
                <Link href="/ruang-aman" className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-sahabat px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sahabat-tua">
                  <MessageSquare size={16} aria-hidden="true" /> Mulai Ngobrol
                </Link>
              </article>
            ))}
          </div>
        )}

        {jml < terfilter.length && (
          <div className="mt-10 text-center">
            <button type="button" onClick={() => setJml((n) => n + 4)} className="rounded-full border border-sahabat px-8 py-3 font-semibold text-sahabat transition hover:bg-sahabat-muda">
              Muat Lebih Banyak
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-sahabat-garis bg-white px-6 py-6 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-gray-500 md:flex-row">
          <p>© 2026 SAHABAT - Sahabat Anti-Bullying dan Bantuan Terpadu</p>
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {FOOTER.map((f, i) => (
              <span key={`${f.label}-${i}`} className="flex items-center gap-2">
                <Link href={f.href} className="hover:text-sahabat">{f.label}</Link>
                {i < FOOTER.length - 1 && <span aria-hidden="true">•</span>}
              </span>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
