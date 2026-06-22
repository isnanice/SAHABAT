import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('notifikasi')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json(data || [])
}

export async function PATCH(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, all } = await request.json()

  if (all) {
    await supabase.from('notifikasi').update({ dibaca: true })
      .eq('user_id', user.id).eq('dibaca', false)
  } else if (id) {
    await supabase.from('notifikasi').update({ dibaca: true }).eq('id', id)
  }

  return NextResponse.json({ success: true })
}
