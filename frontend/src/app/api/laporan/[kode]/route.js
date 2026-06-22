import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request, { params }) {
  const { kode } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('laporan_bullying')
    .select(`
      kode_tiket, status, prioritas, jenis_bullying,
      created_at, updated_at,
      penanganan:profiles!penanganan_guru_id(full_name)
    `)
    .eq('kode_tiket', kode.toUpperCase())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json(data)
}
