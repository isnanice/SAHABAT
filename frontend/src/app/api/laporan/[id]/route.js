import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { overrideLaporanSchema, updateStatusLaporanSchema } from '@/lib/validations/laporan'

/**
 * Detail laporan untuk Guru BK.
 *
 * `id` di sini adalah UUID internal laporan — BUKAN kode tiket siswa. Kode
 * tiket tidak pernah masuk URL, dan route ini butuh sesi login, jadi tidak
 * ada hubungannya dengan jalur anonim.
 *
 * Semua query pakai client bersesi user (bukan admin/service_role), supaya
 * RLS yang menegakkan isolasi antar sekolah. Kalau isolasi cuma ditegakkan
 * oleh `if` di route ini, satu route yang lupa memfilter membocorkan laporan
 * sekolah lain.
 */

async function staf(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized', status: 401 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, aktif, school_id')
    .eq('id', user.id)
    .single()

  if (!profile?.aktif || !['GURU_BK', 'KEPALA_SEKOLAH'].includes(profile.role)) {
    return { error: 'Akses ditolak', status: 403 }
  }
  return { user, profile }
}

/**
 * GET — buka detail.
 *
 * Menulis audit_akses adalah BAGIAN dari operasi ini, bukan efek samping yang
 * boleh dilewat. Spec §5.6: buka detail tanpa insert audit = bug. Kalau audit
 * gagal ditulis, permintaan DITOLAK — laporan anak tidak boleh dibaca tanpa
 * jejak siapa yang membacanya. Itu satu-satunya hal yang membuat "akses
 * terbatas" bisa dibuktikan, bukan sekadar dijanjikan.
 */
export async function GET(request, { params }) {
  const { id } = await params
  const supabase = await createClient()

  const auth = await staf(supabase)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { data, error } = await supabase
    .from('laporan_bullying')
    .select(
      `id, status, deskripsi, lokasi, tanggal_kejadian,
       urgensi_final, jenis_final, ai_urgensi, ai_jenis, ai_confidence,
       ai_gagal, ai_klasifikasi, flag_krisis, created_at, updated_at`
    )
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  // RLS mengembalikan baris kosong untuk laporan sekolah lain — bukan error.
  // Dari sisi BK sekolah lain, laporan ini memang tidak ada.
  if (!data) return NextResponse.json({ error: 'Laporan tidak ditemukan' }, { status: 404 })

  const { error: errAudit } = await supabase.from('audit_akses').insert({
    staf_id: auth.user.id,
    laporan_id: id,
    aksi: 'lihat',
  })

  if (errAudit) {
    console.error('audit_akses gagal — akses ditolak:', errAudit.message)
    return NextResponse.json(
      { error: 'Gagal mencatat audit akses. Detail tidak bisa dibuka.' },
      { status: 500 }
    )
  }

  const { data: pesan } = await supabase
    .from('pesan_tiket')
    .select('id, isi, dari_staf, dibuat_at')
    .eq('laporan_id', id)
    .order('dibuat_at', { ascending: true })

  return NextResponse.json({ ...data, pesan: pesan ?? [] })
}

/**
 * PATCH — override Guru BK.
 *
 * Hanya menyentuh kolom *_final dan status. Kolom ai_* SENGAJA tidak bisa
 * diubah: itu jejak apa yang AI simpulkan, dan harus tetap utuh supaya bisa
 * dibandingkan dengan keputusan manusia. Menimpanya menghapus satu-satunya
 * bukti kalau AI ternyata sering salah.
 */
export async function PATCH(request, { params }) {
  const { id } = await params
  const supabase = await createClient()

  const auth = await staf(supabase)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const patch = {}
  let aksi = 'override'

  if (body.status !== undefined) {
    const p = updateStatusLaporanSchema.safeParse({ status: body.status })
    if (!p.success) {
      return NextResponse.json({ error: p.error.issues[0].message }, { status: 400 })
    }
    patch.status = p.data.status
    aksi = 'ubah_status'
  }

  const ov = overrideLaporanSchema.safeParse({
    ...(body.urgensi_final !== undefined ? { urgensi_final: body.urgensi_final } : {}),
    ...(body.jenis_final !== undefined ? { jenis_final: body.jenis_final } : {}),
  })
  if (!ov.success) {
    return NextResponse.json({ error: ov.error.issues[0].message }, { status: 400 })
  }
  Object.assign(patch, ov.data)

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Tidak ada perubahan' }, { status: 400 })
  }

  // Kolom lama `prioritas` (dari 001) masih NOT NULL — jaga tetap sinkron
  // dengan urgensi_final supaya tidak ada dua sumber kebenaran.
  if (patch.urgensi_final) patch.prioritas = patch.urgensi_final

  const { error } = await supabase.from('laporan_bullying').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('audit_akses').insert({
    staf_id: auth.user.id,
    laporan_id: id,
    aksi,
  })

  return NextResponse.json({ success: true })
}

/** POST — Guru BK membalas di thread tiket siswa. */
export async function POST(request, { params }) {
  const { id } = await params
  const supabase = await createClient()

  const auth = await staf(supabase)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const isi = String(body.isi || '').trim()
  if (!isi || isi.length > 2000) {
    return NextResponse.json(
      { error: 'Pesan tidak boleh kosong dan maksimal 2000 karakter.' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('pesan_tiket').insert({
    laporan_id: id,
    dari_staf: auth.user.id,
    isi,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.from('audit_akses').insert({
    staf_id: auth.user.id,
    laporan_id: id,
    aksi: 'balas',
  })

  return NextResponse.json({ success: true })
}
