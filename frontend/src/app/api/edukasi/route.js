import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
    // Pemberian poin lewat service_role, BUKAN sesi pengguna.
    //
    // Migrasi 003 mencabut EXECUTE tambah_poin dari `authenticated`, karena
    // fungsi itu SECURITY DEFINER: siapa pun yang bisa memanggilnya bisa
    // menaikkan poin akun mana pun sebanyak apa pun. Mengembalikan grant itu
    // demi route ini akan membuka kembali lubangnya.
    //
    // Jumlah poinnya ditentukan server dari modul (poin_reward), dan hanya
    // diberikan ke user.id si pemanggil — keduanya tidak bisa disetir klien.
    const admin = createAdminClient()
    const { error: errPoin } = await admin.rpc('tambah_poin', {
      p_user_id: user.id,
      p_poin: modul.poin_reward,
    })
    // Sebelumnya error rpc tidak pernah diperiksa, jadi kegagalannya senyap:
    // route tetap membalas success walau poinnya tidak pernah masuk.
    if (errPoin) {
      console.error('tambah_poin gagal:', errPoin.message)
      return NextResponse.json(
        { success: true, poin_diberikan: false, catatan: 'Progres tersimpan, poin gagal ditambahkan.' },
        { status: 200 }
      )
    }
  }

  return NextResponse.json({ success: true })
}
