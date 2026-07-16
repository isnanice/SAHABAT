import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashKodeTiket, bentukKodeValid } from '@/lib/keamanan/tiket'
import { cekRateLimit, LIMIT } from '@/lib/keamanan/ratelimit'
import { deteksiKrisis } from '@/lib/keamanan/crisis'
import { HOTLINE } from '@/lib/keamanan/hotline'

/**
 * POST /api/tiket/balas — siswa membalas di thread tiketnya (spec §4.4).
 *
 * Mengikuti pola yang sama dengan /api/tiket/lacak: rate limit -> validasi
 * -> hash -> cari. Tidak pernah mengembalikan isi laporan; sukses/gagal saja.
 */
export async function POST(request) {
  const sesi = request.headers.get('x-sesi') || ''

  const batas = await cekRateLimit(sesi, 'balas-tiket', LIMIT.BALAS_TIKET)
  if (!batas.ok) {
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan, coba beberapa menit lagi.' },
      { status: 429, headers: { 'Retry-After': String(batas.retryAfterDetik) } }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const { kode_tiket, isi } = body || {}

  if (!kode_tiket || !bentukKodeValid(kode_tiket)) {
    return NextResponse.json({ error: 'Kode tiket tidak ditemukan.' }, { status: 404 })
  }

  const pesan = String(isi || '').trim()
  if (pesan.length < 1 || pesan.length > 2000) {
    return NextResponse.json(
      { error: 'Pesan tidak boleh kosong dan maksimal 2000 karakter.' },
      { status: 400 }
    )
  }

  let hash
  try {
    hash = hashKodeTiket(kode_tiket)
  } catch (e) {
    console.error('POST /api/tiket/balas — pepper:', e.message)
    return NextResponse.json(
      { error: 'Sistem sedang bermasalah. Coba lagi nanti atau hubungi Guru BK.' },
      { status: 503 }
    )
  }

  const admin = createAdminClient()

  // Ambil id + sekolah saja. Sengaja TIDAK menyentuh `deskripsi` — route ini
  // tidak punya urusan dengan isi cerita, jadi tidak perlu memuatnya.
  const { data: laporan, error: errCari } = await admin
    .from('laporan_bullying')
    .select('id, sekolah_id, status')
    .eq('kode_tiket_hash', hash)
    .maybeSingle()

  if (errCari) {
    console.error('POST /api/tiket/balas — cari:', errCari.message)
    return NextResponse.json({ error: 'Gagal mengirim balasan.' }, { status: 500 })
  }
  if (!laporan) {
    return NextResponse.json({ error: 'Kode tiket tidak ditemukan.' }, { status: 404 })
  }

  // Krisis bisa muncul di balasan, bukan cuma di laporan awal. Lapisan yang
  // sama berlaku di sini: deterministik, naikkan prioritas, tampilkan bantuan.
  const krisis = deteksiKrisis(pesan)

  const { error: errInsert } = await admin.from('pesan_tiket').insert({
    laporan_id: laporan.id,
    dari_staf: null, // dari siswa anonim
    isi: pesan,
  })

  if (errInsert) {
    console.error('POST /api/tiket/balas — insert:', errInsert.message)
    return NextResponse.json(
      { error: 'Balasanmu GAGAL terkirim. Coba lagi, atau hubungi Guru BK langsung.' },
      { status: 500 }
    )
  }

  if (krisis.krisis) {
    await admin
      .from('laporan_bullying')
      .update({ flag_krisis: true, urgensi_final: 'KRITIS', prioritas: 'KRITIS' })
      .eq('id', laporan.id)

    const { data: staf } = await admin
      .from('profiles')
      .select('id')
      .eq('school_id', laporan.sekolah_id)
      .eq('role', 'GURU_BK')
      .eq('aktif', true)

    if (staf?.length) {
      await admin.from('notifikasi').insert(
        staf.map((s) => ({
          user_id: s.id,
          judul: '🚨 Balasan siswa terindikasi krisis',
          pesan: 'Ada balasan baru yang perlu segera dibuka di dashboard.',
          tipe: 'ESKALASI',
          ref_id: laporan.id,
        }))
      )
    }
  }

  return NextResponse.json({
    success: true,
    krisis: krisis.krisis,
    hotline: krisis.krisis ? HOTLINE : undefined,
  })
}
