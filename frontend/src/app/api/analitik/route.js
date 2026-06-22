import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (!['KEPALA_SEKOLAH', 'GURU_BK'].includes(profile?.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const periode = searchParams.get('periode') || '30d'
  const days = periode === '7d' ? 7 : periode === '90d' ? 90 : 30
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: totalLaporan }, { data: byJenis }, { data: byStatus }, { data: byPrioritas }] =
    await Promise.all([
      supabase.from('laporan_bullying').select('id', { count: 'exact' }).gte('created_at', since),
      supabase.from('laporan_bullying').select('jenis_bullying').gte('created_at', since),
      supabase.from('laporan_bullying').select('status').gte('created_at', since),
      supabase.from('laporan_bullying').select('prioritas').gte('created_at', since),
    ])

  // Agregasi manual
  const countBy = (arr, key) =>
    arr?.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] || 0) + 1
      return acc
    }, {}) || {}

  return NextResponse.json({
    total: totalLaporan?.length || 0,
    byJenis: countBy(byJenis, 'jenis_bullying'),
    byStatus: countBy(byStatus, 'status'),
    byPrioritas: countBy(byPrioritas, 'prioritas'),
    periode,
  })
}
