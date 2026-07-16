import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashKodeTiket, bentukKodeValid } from '@/lib/keamanan/tiket'
import { cekRateLimit, LIMIT } from '@/lib/keamanan/ratelimit'

/**
 * POST /api/tiket/lacak — siswa memantau laporannya (tetap anonim).
 *
 * Menggantikan GET /api/laporan/[kode], yang punya dua masalah:
 *
 *   1. Kode tiket ada di PATH URL. Kode itu satu-satunya kredensial siswa
 *      anonim, dan URL bocor ke mana-mana: access log server, riwayat
 *      browser di komputer sekolah yang dipakai bergantian, header
 *      Referer ke pihak ketiga. Sekarang kode dikirim di body POST.
 *   2. Tidak ada rate limit sama sekali — kode tiket bisa ditebak
 *      sepuasnya (spec §8.5).
 *
 * Yang dikembalikan HANYA status + thread pesan. TIDAK PERNAH isi laporan
 * (spec §8.6): kode tiket yang jatuh ke tangan pelaku hanya memperlihatkan
 * status, bukan cerita korban.
 */
export async function POST(request) {
  const sesi = request.headers.get('x-sesi') || ''

  // Rate limit SEBELUM sentuh DB — inilah permukaan brute-force utama.
  const batas = await cekRateLimit(sesi, 'lacak-tiket', LIMIT.LACAK_TIKET)
  if (!batas.ok) {
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan, coba 15 menit lagi.' },
      { status: 429, headers: { 'Retry-After': String(batas.retryAfterDetik) } }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const { kode_tiket } = body || {}
  if (!kode_tiket || !bentukKodeValid(kode_tiket)) {
    // Pesan sengaja sama dengan kasus "tidak ketemu" di bawah, supaya
    // penebak tidak bisa membedakan "formatnya salah" dari "formatnya
    // benar tapi tiketnya tidak ada".
    return NextResponse.json({ error: 'Kode tiket tidak ditemukan.' }, { status: 404 })
  }

  let hash
  try {
    hash = hashKodeTiket(kode_tiket)
  } catch (e) {
    console.error('POST /api/tiket/lacak — pepper:', e.message)
    return NextResponse.json(
      { error: 'Sistem sedang bermasalah. Coba lagi nanti atau hubungi Guru BK.' },
      { status: 503 }
    )
  }

  const admin = createAdminClient()
  const { data, error } = await admin.rpc('lacak_tiket', { p_kode_hash: hash })

  if (error) {
    console.error('POST /api/tiket/lacak — rpc:', error.message)
    return NextResponse.json({ error: 'Gagal memuat laporan.' }, { status: 500 })
  }

  const tiket = Array.isArray(data) ? data[0] : data
  if (!tiket) {
    return NextResponse.json({ error: 'Kode tiket tidak ditemukan.' }, { status: 404 })
  }

  // Bentuk respons dibatasi eksplisit. lacak_tiket() sudah tidak
  // mengembalikan `deskripsi`, tapi allowlist di sini adalah lapisan kedua:
  // kalau nanti ada yang menambah kolom ke fungsi itu, isinya tidak
  // otomatis ikut bocor ke siswa.
  return NextResponse.json({
    status: tiket.status,
    urgensi: tiket.urgensi_final,
    jenis: tiket.jenis_final,
    krisis: tiket.flag_krisis,
    dibuat_at: tiket.dibuat_at,
    diperbarui_at: tiket.diperbarui_at,
    pesan: tiket.pesan ?? [],
  })
}
