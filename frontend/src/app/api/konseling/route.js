import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requestKonselingSchema } from '@/lib/validations/konseling'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  let query = supabase.from('jadwal_konseling').select(`
    *,
    siswa:profiles!siswa_id(full_name, kelas),
    guru_bk:profiles!guru_bk_id(full_name)
  `).order('tanggal', { ascending: true })

  if (profile?.role === 'SISWA') {
    query = query.eq('siswa_id', user.id)
  } else if (profile?.role === 'GURU_BK') {
    query = query.eq('guru_bk_id', user.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const validated = requestKonselingSchema.parse(body)

  // Guru BK harus di sekolah yang sama dengan siswa. Sebelumnya query ini
  // .limit(1) tanpa filter sekolah — bisa memasangkan siswa ke Guru BK
  // sekolah lain. RLS (005_perbaikan_grant_konseling_buddy.sql) sudah
  // menolak itu di lapisan DB, tapi memilih kandidat yang benar dari awal
  // supaya siswa tidak mendapat error validasi yang membingungkan.
  const { data: profilSiswa } = await supabase
    .from('profiles').select('school_id').eq('id', user.id).single()

  const { data: gurubk } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'GURU_BK')
    .eq('school_id', profilSiswa?.school_id)
    .eq('aktif', true)
    .limit(1)
    .single()

  if (!gurubk) {
    return NextResponse.json(
      { error: 'Belum ada Guru BK tersedia di sekolahmu. Coba lagi nanti atau hubungi admin sekolah.' },
      { status: 503 }
    )
  }

  const { data, error } = await supabase.from('jadwal_konseling').insert({
    ...validated,
    siswa_id: user.id,
    guru_bk_id: gurubk.id,
    status: 'MENUNGGU',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, jadwal: data })
}
