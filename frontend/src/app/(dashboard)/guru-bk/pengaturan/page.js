'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ImageIcon, KeyRound, ShieldCheck, ChevronRight, AlertTriangle, Mail, Smartphone, Bell } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

/**
 * Pengaturan Guru BK (desain citra "Halaman Pengaturan").
 *
 * Profil terisi dari sesi (useAuth). Toggle/notifikasi disimpan di state layar
 * — persistensi ke backend menyusul; halaman ini fokus menyamai desain dan
 * menyediakan jalur nyata ke "Ganti Password" (alur reset yang sudah ada).
 *
 * "Peringatan Kasus Mendesak" sengaja tidak bisa dimatikan — sama seperti di
 * desain. Kanal darurat tidak boleh bisa dibungkam dari layar pengaturan.
 */
export default function PengaturanGuruBK() {
  const { profile } = useAuth()
  const [liveChat, setLiveChat] = useState(true)
  const [notif, setNotif] = useState({ standarEmail: true, standarPush: true, pesanEmail: false, pesanPush: true })

  return (
    <div className="px-6 py-8 lg:px-10">
      <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
      <p className="mt-1 max-w-3xl text-gray-500">
        Kelola profil konselor Anda, preferensi keamanan, dan ketersediaan.
        Pengaturan ini membantu menjaga lingkungan yang aman dan responsif untuk
        dukungan siswa.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* KIRI */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profil Konselor */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Profil Konselor</h2>
              <button type="button" className="text-sm font-semibold text-sahabat hover:underline">Edit</button>
            </div>
            <div className="mt-5 flex flex-col gap-5 sm:flex-row">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-sahabat-muda text-sahabat">
                <ImageIcon size={28} aria-hidden="true" />
              </span>
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Nama Lengkap" value={profile?.full_name || 'Guru BK'} />
                  <Field label="Profesi" value="Guru BK" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Spesialis</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">Anxiety &amp; Stress</span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-sm text-amber-700">Intervensi Krisis</span>
                    <button type="button" className="rounded-full border border-dashed border-sahabat-garis px-3 py-1 text-sm text-gray-500">+ Add</button>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Bio</p>
                  <textarea
                    rows={3}
                    defaultValue="Berkomitmen untuk menyediakan ruang yang aman dan rahasia bagi siswa untuk mendiskusikan tekanan akademis, tantangan pribadi, dan masalah kesehatan mental."
                    className="mt-2 w-full resize-y rounded-xl border border-sahabat-garis bg-white p-3 text-sm text-gray-900 outline-none focus:border-sahabat focus:ring-2 focus:ring-sahabat/30"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Konfigurasi Platform */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Konfigurasi Platform</h2>
            <p className="mt-1 text-sm text-gray-500">Atur jam kerja dan status ketersediaan untuk dukungan siswa.</p>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-sahabat-garis p-4">
              <div>
                <p className="font-semibold text-gray-900">Live Chat Availability</p>
                <p className="text-sm text-gray-500">Izinkan siswa memulai chat aman selama jam kerja.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={liveChat}
                onClick={() => setLiveChat((v) => !v)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${liveChat ? 'bg-sahabat' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${liveChat ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <p className="mt-5 text-sm font-medium text-gray-700">Working Hours</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input type="time" defaultValue="08:00" className="rounded-xl border border-sahabat-garis bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-sahabat" />
              <span className="text-gray-400">to</span>
              <input type="time" defaultValue="16:00" className="rounded-xl border border-sahabat-garis bg-white px-4 py-2.5 text-gray-900 outline-none focus:border-sahabat" />
              <button type="button" className="rounded-xl bg-sahabat-latar px-4 py-2.5 text-sm font-medium text-gray-500">Unavailable</button>
            </div>
          </section>
        </div>

        {/* KANAN */}
        <div className="space-y-6">
          {/* Keamanan Akun */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Keamanan Akun</h2>
            <p className="mt-1 text-sm text-gray-500">Kelola kata sandi dan metode autentikasi Anda.</p>

            <Link href="/forgot-password" className="mt-4 flex items-center gap-3 rounded-xl border border-sahabat-garis p-4 transition hover:bg-sahabat-latar">
              <KeyRound size={20} className="text-gray-500" aria-hidden="true" />
              <span className="flex-1">
                <span className="block font-semibold text-gray-900">Ganti Password</span>
                <span className="block text-sm text-gray-500">Perbarui kata sandi akunmu secara berkala.</span>
              </span>
              <ChevronRight size={18} className="text-gray-400" aria-hidden="true" />
            </Link>

            <div className="mt-3 flex items-center gap-3 rounded-xl border border-sahabat-garis p-4">
              <ShieldCheck size={20} className="text-sahabat" aria-hidden="true" />
              <span className="flex-1">
                <span className="block font-semibold text-gray-900">Autentikasi Dua Faktor</span>
                <span className="block text-sm text-emerald-600">Tingkatkan keamanan akun stafmu.</span>
              </span>
              <span className="text-sm font-semibold text-sahabat">Kelola</span>
            </div>
          </section>

          {/* Notifikasi */}
          <section className="rounded-2xl border border-sahabat-garis bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Notifikasi</h2>
            <p className="mt-1 text-sm text-gray-500">Kendalikan cara Anda menerima peringatan untuk laporan dan pesan baru.</p>

            <div className="mt-4 rounded-xl border-l-4 border-darurat bg-darurat-muda p-4">
              <p className="flex items-center gap-2 font-semibold text-darurat">
                <AlertTriangle size={16} aria-hidden="true" /> Peringatan Kasus Mendesak
              </p>
              <p className="mt-1 text-sm text-gray-600">Pemberitahuan segera untuk laporan berisiko tinggi. Tidak dapat dinonaktifkan.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm text-gray-700"><Mail size={14} /> Email</span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm text-gray-700"><Smartphone size={14} /> WhatsApp</span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm text-gray-700"><Bell size={14} /> Push</span>
              </div>
            </div>

            <NotifRow label="Laporan Baru Standar" a={notif.standarEmail} b={notif.standarPush}
              onA={() => setNotif((n) => ({ ...n, standarEmail: !n.standarEmail }))}
              onB={() => setNotif((n) => ({ ...n, standarPush: !n.standarPush }))} />
            <NotifRow label="Pesan Langsung" a={notif.pesanEmail} b={notif.pesanPush}
              onA={() => setNotif((n) => ({ ...n, pesanEmail: !n.pesanEmail }))}
              onB={() => setNotif((n) => ({ ...n, pesanPush: !n.pesanPush }))} />
          </section>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="button" className="rounded-xl bg-sahabat px-8 py-3 font-semibold text-white transition hover:bg-sahabat-tua">
          Simpan Perubahan
        </button>
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="mt-1.5 rounded-xl border border-sahabat-garis bg-sahabat-latar px-4 py-2.5 text-gray-900">{value}</div>
    </div>
  )
}

function NotifRow({ label, a, b, onA, onB }) {
  return (
    <div className="mt-4 flex items-center justify-between border-t border-sahabat-garis pt-4">
      <span className="font-medium text-gray-800">{label}</span>
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-1.5 text-gray-600">
          <input type="checkbox" checked={a} onChange={onA} className="h-4 w-4 accent-[color:var(--sahabat-ungu)]" /> Email
        </label>
        <label className="flex items-center gap-1.5 text-gray-600">
          <input type="checkbox" checked={b} onChange={onB} className="h-4 w-4 accent-[color:var(--sahabat-ungu)]" /> Push
        </label>
      </div>
    </div>
  )
}
