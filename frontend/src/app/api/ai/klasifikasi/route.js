import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { klasifikasiLaporan } from '@/lib/ai/klasifikasi'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { deskripsi, metadata } = await request.json()
    const hasil = await klasifikasiLaporan(deskripsi, metadata)

    return NextResponse.json(hasil)
  } catch (error) {
    console.error('Klasifikasi API error:', error)
    return NextResponse.json({ error: 'Gagal mengklasifikasi laporan' }, { status: 500 })
  }
}
