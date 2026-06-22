import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('buddy_matches')
    .select(`
      *,
      siswa:profiles!siswa_id(full_name, kelas, avatar_url),
      buddy:profiles!buddy_id(full_name, kelas, avatar_url)
    `)
    .or(`siswa_id.eq.${user.id},buddy_id.eq.${user.id}`)
    .eq('status', 'AKTIF')

  return NextResponse.json(data || [])
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Request buddy support — guru BK yang akan matchingkan
  const { data, error } = await supabase.from('buddy_requests').insert({
    siswa_id: user.id,
    status: 'PENDING',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, request: data })
}
