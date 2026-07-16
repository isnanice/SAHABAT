import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/analitik — statistik untuk dashboard sekolah (spec §4.3).
 *
 * Dua keputusan penting:
 *
 * 1. Agregasi pakai `urgensi_final` / `jenis_final`, BUKAN `prioritas` /
 *    `jenis_bullying` (tebakan AI). Kalau grafik dibangun dari label AI,
 *    sekolah mengambil keputusan berdasarkan apa yang MESIN kira terjadi,
 *    bukan apa yang Guru BK simpulkan setelah membaca. Versi sebelumnya
 *    memakai kolom AI.
 *
 * 2. Query lewat client bersesi user, jadi RLS yang membatasi ke sekolah
 *    si staf. Route ini tidak memfilter sekolah sendiri — kalau ia yang
 *    memfilter, satu kelalaian di sini membocorkan statistik sekolah lain.
 */
export async function GET(request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, aktif')
    .eq('id', user.id)
    .single()

  if (!profile?.aktif || !['KEPALA_SEKOLAH', 'GURU_BK'].includes(profile.role)) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const periode = searchParams.get('periode') || '30d'
  const hari = periode === '7d' ? 7 : periode === '90d' ? 90 : 30
  const sejak = new Date(Date.now() - hari * 86400_000).toISOString()

  const { data, error } = await supabase
    .from('laporan_bullying')
    .select('urgensi_final, jenis_final, status, lokasi, flag_krisis, ai_gagal, ai_confidence, created_at')
    .gte('created_at', sejak)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const baris = data || []

  const hitung = (key, label = (v) => v ?? 'Tidak diketahui') =>
    Object.entries(
      baris.reduce((acc, r) => {
        const k = label(r[key])
        acc[k] = (acc[k] || 0) + 1
        return acc
      }, {})
    ).map(([nama, jumlah]) => ({ nama, jumlah }))

  // Tren mingguan — dikelompokkan ke hari Senin tiap minggu.
  const perMinggu = {}
  for (const r of baris) {
    const d = new Date(r.created_at)
    const hariKe = (d.getDay() + 6) % 7 // Senin = 0
    d.setDate(d.getDate() - hariKe)
    const kunci = d.toISOString().slice(0, 10)
    perMinggu[kunci] = (perMinggu[kunci] || 0) + 1
  }

  // Jumlah yang butuh dibaca manusia. Ini angka kejujuran sistem: kalau
  // tinggi, artinya klasifikasi otomatis sedang tidak bisa diandalkan —
  // dan sekolah berhak tahu itu, bukan cuma melihat grafik yang rapi.
  const perluBacaManual = baris.filter(
    (r) => r.ai_gagal || (r.ai_confidence !== null && r.ai_confidence < 0.6)
  ).length

  return NextResponse.json({
    periode,
    total: baris.length,
    krisis: baris.filter((r) => r.flag_krisis).length,
    perluBacaManual,
    perUrgensi: hitung('urgensi_final'),
    perJenis: hitung('jenis_final', (v) => v ?? 'Belum ditentukan'),
    perStatus: hitung('status'),
    // "Heatmap" lokasi: GROUP BY lokasi, dirender sebagai bar/grid.
    // Bukan peta sungguhan (spec §4.3) — dan itu memang cukup.
    perLokasi: hitung('lokasi', (v) => v ?? 'Tidak disebut').sort((a, b) => b.jumlah - a.jumlah),
    tren: Object.entries(perMinggu)
      .map(([minggu, jumlah]) => ({ minggu, jumlah }))
      .sort((a, b) => a.minggu.localeCompare(b.minggu)),
  })
}
