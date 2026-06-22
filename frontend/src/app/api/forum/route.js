import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { forumPostSchema } from '@/lib/validations/forum'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forum_posts')
    .select(`
      *,
      author:profiles!author_id(full_name, avatar_url),
      _count:forum_comments(count)
    `)
    .eq('termoderasi', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const validated = forumPostSchema.parse(body)

  const { data, error } = await supabase.from('forum_posts').insert({
    ...validated,
    author_id: validated.anonim ? null : user.id,
    termoderasi: false, // Perlu review moderator dulu
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, post: data })
}
