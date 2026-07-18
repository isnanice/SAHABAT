import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Kelola modul edukasi — HANYA Guru BK/Kepala Sekolah.
 *
 * `modul_edukasi` sengaja TIDAK punya RLS policy INSERT/UPDATE sama sekali
 * (lihat audit saat 005_perbaikan_grant_konseling_buddy.sql ditulis) —
 * siapa pun yang authenticated tidak boleh menulis modul langsung lewat
 * client. Route ini memverifikasi peran lewat sesi (createClient, RLS
 * masih berlaku untuk baca peran sendiri), lalu memakai service_role
 * HANYA untuk operasi tulis setelah peran terverifikasi. Pola yang sama
 * dengan tambah_poin di /api/edukasi/route.js.
 */

const TIPE_SAH = ['VIDEO', 'ARTIKEL', 'QUIZ', 'INFOGRAFIS']

async function pastikanStaf() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const { data: profile } = await supabase
    .from('profiles').select('role, aktif').eq('id', user.id).single()

  if (!profile?.aktif || !['GURU_BK', 'KEPALA_SEKOLAH'].includes(profile.role)) {
    return { error: NextResponse.json({ error: 'Hanya staf yang bisa mengelola konten edukasi.' }, { status: 403 }) }
  }

  return { user }
}

// GET — daftar SEMUA modul (termasuk draft/nonaktif) untuk dashboard staf.
// Beda dari GET /api/edukasi yang cuma mengembalikan modul aktif untuk siswa.
export async function GET() {
  const { error } = await pastikanStaf()
  if (error) return error

  const admin = createAdminClient()
  const { data, error: errDb } = await admin
    .from('modul_edukasi')
    .select('*')
    .order('created_at', { ascending: false })

  if (errDb) return NextResponse.json({ error: errDb.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(request) {
  const { error, user } = await pastikanStaf()
  if (error) return error

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const judul = String(body?.judul ?? '').trim().slice(0, 60)
  const deskripsi = String(body?.deskripsi ?? '').trim().slice(0, 300)
  const isi = body?.isi ? String(body.isi).slice(0, 20000) : null
  const kontenUrl = body?.konten_url ? String(body.konten_url).slice(0, 2000) : null
  const thumbnailUrl = body?.thumbnail_url ? String(body.thumbnail_url).slice(0, 2000) : null
  const tipe = TIPE_SAH.includes(String(body?.tipe).toUpperCase()) ? String(body.tipe).toUpperCase() : 'ARTIKEL'
  const durasiMenit = Number.isFinite(+body?.durasi_menit) ? Math.max(0, Math.round(+body.durasi_menit)) : null
  const poinReward = Number.isFinite(+body?.poin_reward) ? Math.max(0, Math.round(+body.poin_reward)) : 10
  // "Simpan sebagai Draft" -> aktif=false (tidak muncul di daftar siswa,
  // yang menyaring .eq('aktif', true)). "Publikasikan Langsung" -> true.
  const aktif = body?.publikasi !== 'draft'

  if (!judul) {
    return NextResponse.json({ error: 'Judul artikel wajib diisi.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: maxUrutan } = await admin
    .from('modul_edukasi').select('urutan').order('urutan', { ascending: false }).limit(1).single()

  const { data, error: errDb } = await admin
    .from('modul_edukasi')
    .insert({
      judul,
      deskripsi,
      isi,
      konten_url: kontenUrl,
      thumbnail_url: thumbnailUrl,
      tipe,
      durasi_menit: durasiMenit,
      poin_reward: poinReward,
      urutan: (maxUrutan?.urutan || 0) + 1,
      aktif,
    })
    .select()
    .single()

  if (errDb) return NextResponse.json({ error: errDb.message }, { status: 500 })
  return NextResponse.json({ success: true, modul: data })
}
