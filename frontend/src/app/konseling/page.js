'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  MessageSquare,
  Video,
  Users,
  UserRound,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react'

/**
 * Konseling (desain citra) — pilih Guru BK, metode, dan jadwal sesi.
 *
 * Backend penjadwalan sungguhan (menautkan slot ke kalender Guru BK, notifikasi)
 * belum ada. Halaman ini interaktif betulan — pilih konselor, metode, tanggal,
 * slot — dan "Jadwalkan Sesi" menampilkan konfirmasi jujur bahwa permintaan
 * diteruskan ke Guru BK, bukan mengaku sesi sudah pasti terbooking.
 *
 * Identitas tetap terjaga: halaman ini tidak meminta nama; catatan pra-sesi
 * opsional dan hanya untuk Guru BK.
 */

const NAV = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang', href: '/tentang' },
  { label: 'Fitur', href: '/fitur', active: true },
  { label: 'Edukasi', href: '/edukasi' },
]

const KONSELOR = [
  { nama: 'Ibu Santi Dwi', peran: 'Guru BK' },
  { nama: 'Bapak Budi Utomo', peran: 'Guru BK' },
]

const METODE = [
  { id: 'chat', label: 'Chat', ikon: MessageSquare },
  { id: 'video', label: 'Video Call', ikon: Video },
  { id: 'tatap', label: 'Tatap Muka', ikon: Users },
]

const HARI = ['S', 'S', 'R', 'K', 'J', 'S', 'M']
const TANGGAL = [13, 14, 15, 16, 17, 18, 19]
const SLOT = ['09:00-10:00', '11:00-12:00', '13:00-14:00', '15:00-16:00']

const FOOTER = [
  { label: 'Kebijakan Privasi', href: '/privasi' },
  { label: 'Syarat & Ketentuan', href: '/privasi' },
  { label: 'Kontak Darurat', href: '/kontak-darurat' },
  { label: 'Pusat Bantuan', href: '/kontak-darurat' },
]

export default function KonselingPage() {
  const [konselor, setKonselor] = useState(0)
  const [metode, setMetode] = useState('video')
  const [tanggal, setTanggal] = useState(15)
  const [slot, setSlot] = useState('09:00-10:00')
  const [catatan, setCatatan] = useState('')
  const [terjadwal, setTerjadwal] = useState(false)

  return (
    <div className="min-h-screen bg-sahabat-latar">
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
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white">
          <UserRound size={20} aria-hidden="true" />
        </span>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-4xl font-extrabold text-gray-900">Konseling</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          Pilih konselor yang paling sesuai dengan kebutuhanmu. Privasimu adalah
          prioritas utama kami.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* KIRI (2 kolom) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Pilih Guru BK */}
            <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Pilih Guru BK</h2>
                <span className="text-sm font-semibold text-sahabat">{KONSELOR.length} Tersedia Sekarang</span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {KONSELOR.map((k, i) => (
                  <button
                    key={k.nama}
                    type="button"
                    onClick={() => setKonselor(i)}
                    className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                      konselor === i ? 'border-sahabat bg-sahabat-muda' : 'border-sahabat-garis bg-sahabat-latar hover:bg-white'
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-700 text-white">
                      <UserRound size={24} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-bold text-gray-900">{k.nama}</span>
                      <span className="block text-sm text-gray-500">{k.peran}</span>
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-sahabat-hijau">
                        <span className="h-1.5 w-1.5 rounded-full bg-sahabat-hijau" aria-hidden="true" /> Tersedia
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Detail Sesi */}
            <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900">Detail Sesi</h2>
              <p className="mt-4 text-sm font-semibold text-gray-700">Metode Konseling</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                {METODE.map((m) => {
                  const Ikon = m.ikon
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMetode(m.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border py-5 font-semibold transition ${
                        metode === m.id ? 'border-sahabat bg-sahabat-muda text-sahabat-tua' : 'border-sahabat-garis text-gray-700 hover:bg-sahabat-latar'
                      }`}
                    >
                      <Ikon size={24} className="text-sahabat" aria-hidden="true" />
                      {m.label}
                    </button>
                  )
                })}
              </div>

              <p className="mt-6 text-sm font-semibold text-gray-700">Catatan Pra-Sesi (Opsional)</p>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value.slice(0, 1000))}
                rows={5}
                placeholder="Ceritakan sedikit apa yang sedang kamu rasakan atau ingin kamu bahas..."
                className="mt-3 w-full resize-y rounded-xl border border-sahabat-garis bg-white p-4 text-gray-900 outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
              />
            </section>
          </div>

          {/* KANAN — jadwal */}
          <aside className="h-fit rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Pilih Waktu Konseling</h2>

            <div className="mt-4 flex items-center justify-between">
              <p className="font-bold text-gray-900">Juli 2026</p>
              <span className="flex gap-1 text-gray-400">
                <ChevronLeft size={18} aria-hidden="true" />
                <ChevronRight size={18} aria-hidden="true" />
              </span>
            </div>
            <div className="mt-3 grid grid-cols-7 gap-1 text-center">
              {HARI.map((h, i) => (
                <span key={i} className="py-1 text-xs font-medium text-gray-400">{h}</span>
              ))}
              {TANGGAL.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTanggal(t)}
                  className={`rounded-full py-1.5 text-sm transition ${
                    tanggal === t ? 'bg-sahabat font-bold text-white' : 'text-gray-700 hover:bg-sahabat-latar'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <p className="mt-5 font-bold text-gray-900">Slot Tersedia</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {SLOT.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                    slot === s ? 'border-sahabat bg-sahabat-muda text-sahabat-tua' : 'border-sahabat-garis text-gray-700 hover:bg-sahabat-latar'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <hr className="my-5 border-sahabat-garis" />

            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Konselor:</dt>
                <dd className="font-semibold text-gray-900">{KONSELOR[konselor].nama}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Waktu:</dt>
                <dd className="font-semibold text-gray-900">{tanggal} Juli 2026, {slot.split('-')[0]} WIB</dd>
              </div>
            </dl>

            {terjadwal ? (
              <div className="mt-5 flex items-start gap-2 rounded-xl bg-sahabat-muda p-4 text-sm text-sahabat-tua">
                <Check size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                <p>
                  Permintaan sesi diteruskan ke <strong>{KONSELOR[konselor].nama}</strong>.
                  Guru BK akan mengonfirmasi jadwalnya. Kamu tetap anonim.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setTerjadwal(true)}
                className="mt-5 w-full rounded-xl bg-sahabat py-3 font-semibold text-white transition hover:bg-sahabat-tua"
              >
                Jadwalkan Sesi
              </button>
            )}
          </aside>
        </div>
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
