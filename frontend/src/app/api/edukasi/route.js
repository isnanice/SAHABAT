import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [{ data: modul }, { data: progress }] = await Promise.all([
    supabase.from('modul_edukasi').select('*').eq('aktif', true).order('urutan'),
    supabase.from('progress_edukasi').select('*').eq('user_id', user.id),
  ])

  const modulWithProgress = modul?.map((m) => ({
    ...m,
    selesai: progress?.some((p) => p.modul_id === m.id && p.selesai) || false,
    progress_persen: progress?.find((p) => p.modul_id === m.id)?.persen || 0,
  }))

  return NextResponse.json(modulWithProgress || [])
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { modul_id, persen, selesai } = await request.json()

  const { data: modul } = await supabase
    .from('modul_edukasi').select('poin_reward').eq('id', modul_id).single()

  await supabase.from('progress_edukasi').upsert({
    user_id: user.id,
    modul_id,
    persen,
    selesai,
    updated_at: new Date().toISOString(),
  })

  if (selesai && modul?.poin_reward) {
    await supabase.rpc('tambah_poin', {
      p_user_id: user.id,
      p_poin: modul.poin_reward,
    })
  }

  return NextResponse.json({ success: true })
}
