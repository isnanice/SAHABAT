'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Check, Loader2, ShieldCheck, Sparkles } from 'lucide-react'

/**
 * Dashboard Edukasi siswa — satu-satunya fitur komunitas yang datanya nyata
 * (6 modul di `modul_edukasi`). Forum, buddy, dan konseling belum dibangun.
 *
 * =================== KENAPA HALAMAN INI BUTUH LOGIN ===================
 * Progres & poin tidak mungkin dilacak tanpa tahu siapa siswanya. Itu wajar,
 * dan tidak apa-apa — karena membaca modul edukasi bukan rahasia.
 *
 * Yang TIDAK BOLEH: menautkan akun ini ke laporan. Siswa yang login lalu
 * menekan "Lapor" tetap melapor secara ANONIM — sistem sengaja melupakan
 * siapa dia di jalur itu. Lihat catatan batas keras di
 * src/app/api/edukasi/[id]/route.js.
 *
 * Karena itu halaman ini secara eksplisit MENGINGATKAN siswa bahwa punya akun
 * tidak membuat laporannya bisa dilacak. Anak yang login lalu ragu melapor
 * ("nanti ketahuan dari akunku") justru berhenti melapor — dan itu kegagalan
 * yang paling mahal.
 * ======================================================================
 */

const TIPE_LABEL = {
  VIDEO: 'Video',
  ARTIKEL: 'Artikel',
  QUIZ: 'Kuis',
  INFOGRAFIS: 'Infografis',
}

export default function EdukasiSiswaPage() {
  const [modul, setModul] = useState([])
  const [poin, setPoin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [prosesId, setProsesId] = useState(null)

  async function muat() {
    const res = await fetch('/api/edukasi')
    const json = await res.json()
    if (!res.ok) throw new Error(json?.error || 'Gagal memuat modul')
    return json
  }

  useEffect(() => {
    let batal = false
    ;(async () => {
      try {
        const data = await muat()
        if (!batal) setModul(Array.isArray(data) ? data : [])
      } catch (e) {
        if (!batal) setError(e.message)
      } finally {
        if (!batal) setLoading(false)
      }
    })()
    return () => {
      batal = true
    }
  }, [])

  async function tandaiSelesai(id) {
    if (prosesId) return
    setProsesId(id)
    try {
      const res = await fetch(`/api/edukasi/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persen: 100 }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Gagal menyimpan progres')
      if (json.poin_diberikan > 0) setPoin((p) => (p ?? 0) + json.poin_diberikan)
      setModul(await muat())
    } catch (e) {
      setError(e.message)
    } finally {
      setProsesId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-sahabat" aria-label="Memuat" />
      </div>
    )
  }

  const selesai = modul.filter((m) => m.selesai).length

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modul Edukasi</h1>
          <p className="mt-1 text-sm text-gray-600">
            {selesai} dari {modul.length} modul selesai
            {poin !== null && ` · +${poin} poin sesi ini`}
          </p>
        </div>
      </header>

      {/* Pengingat yang menentukan. Anak yang login lalu berpikir "kalau aku
          lapor, ketahuan dari akunku" akan berhenti melapor — dan itu
          kegagalan paling mahal dari sistem ini. */}
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-sahabat-garis bg-sahabat-latar p-4">
        <ShieldCheck className="mt-0.5 shrink-0 text-sahabat" size={20} aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Punya akun tidak membuat laporanmu bisa dilacak
          </p>
          <p className="mt-1 text-sm leading-relaxed text-gray-700">
            Akun ini cuma untuk modul edukasi dan poin. Kalau kamu melapor, laporanmu
            tetap <strong>anonim</strong> — sistem sengaja tidak menyimpan siapa yang
            mengirimnya, walaupun kamu sedang login.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/lapor"
              className="rounded-xl bg-sahabat px-4 py-2 text-sm font-semibold text-white transition hover:bg-sahabat-tua"
            >
              Lapor Sekarang (anonim)
            </Link>
            <Link
              href="/cek-laporan"
              className="rounded-xl border border-sahabat-garis bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-sahabat-latar"
            >
              Cek Laporan
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-darurat bg-darurat-muda p-3 text-sm text-darurat">
          {error}
        </p>
      )}

      {modul.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-sahabat-garis bg-white p-10 text-center">
          <BookOpen className="mx-auto text-gray-300" size={40} aria-hidden="true" />
          <p className="mt-3 font-medium text-gray-700">Belum ada modul edukasi</p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {modul.map((m) => (
            <li
              key={m.id}
              className="flex flex-col rounded-2xl border border-sahabat-garis bg-white p-5"
            >
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-sahabat-muda px-2.5 py-1 text-xs font-medium text-sahabat-tua">
                  {TIPE_LABEL[m.tipe] || m.tipe}
                </span>
                {m.durasi_menit && (
                  <span className="text-xs text-gray-500">{m.durasi_menit} menit</span>
                )}
                {m.selesai && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    <Check size={12} aria-hidden="true" /> Selesai
                  </span>
                )}
              </div>

              <h2 className="mt-3 font-bold text-gray-900">{m.judul}</h2>
              {m.deskripsi && (
                <p className="mt-1 flex-1 text-sm leading-relaxed text-gray-600">{m.deskripsi}</p>
              )}

              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                  <Sparkles size={12} aria-hidden="true" /> +{m.poin_reward} poin
                </span>

                {m.selesai ? (
                  <span className="text-xs text-gray-400">Sudah diselesaikan</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => tandaiSelesai(m.id)}
                    disabled={prosesId === m.id}
                    className="flex items-center gap-1.5 rounded-xl bg-sahabat px-3 py-2 text-sm font-semibold text-white transition hover:bg-sahabat-tua disabled:opacity-40"
                  >
                    {prosesId === m.id ? (
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Check size={14} aria-hidden="true" />
                    )}
                    Tandai Selesai
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
