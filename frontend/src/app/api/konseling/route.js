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

  // Cari guru BK yang tersedia
  const { data: gurubk } = await supabase
    .from('profiles').select('id').eq('role', 'GURU_BK').limit(1).single()

  const { data, error } = await supabase.from('jadwal_konseling').insert({
    ...validated,
    siswa_id: user.id,
    guru_bk_id: gurubk?.id,
    status: 'MENUNGGU',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, jadwal: data })
}
