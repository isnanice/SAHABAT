import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/edukasi/[id] — siswa menandai progres modul edukasi.
 *
 * Jalur ini BUTUH login — memang begitu. Progres & poin tidak mungkin
 * dilacak tanpa tahu siapa siswanya.
 *
 * ============================ BATAS KERAS ============================
 * Route ini TIDAK PERNAH boleh menyentuh `laporan_bullying`, dan sebaliknya
 * `/api/laporan` TIDAK PERNAH boleh membaca sesi login. Dua jalur itu
 * sengaja tidak saling kenal:
 *
 *   - Jalur komunitas (ini)  -> butuh identitas
 *   - Jalur laporan          -> tidak boleh punya identitas
 *
 * Kalau suatu hari ada yang menautkan keduanya ("kan siswanya sudah login,
 * sekalian isi pelapor_id"), seluruh anonimitas produk ini hilang. Constraint
 * `laporan_anonim_tanpa_identitas` di DB akan menolaknya — tapi jangan
 * mengandalkan itu sebagai satu-satunya penjaga.
 * =====================================================================
 */
export async function POST(request, { params }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const persen = Math.min(100, Math.max(0, Number(body?.persen) || 0))
  const selesai = persen >= 100

  // Modul harus ada dan aktif. Poinnya diambil dari DB, BUKAN dari klien —
  // kalau klien yang menentukan poin, siswa bisa mengirim poin: 999999.
  const { data: modul } = await supabase
    .from('modul_edukasi')
    .select('id, poin_reward')
    .eq('id', id)
    .eq('aktif', true)
    .maybeSingle()

  if (!modul) return NextResponse.json({ error: 'Modul tidak ditemukan' }, { status: 404 })

  // Cek apakah SUDAH pernah selesai — supaya poin tidak bisa diklaim berulang
  // dengan menekan "selesai" berkali-kali.
  const { data: lama } = await supabase
    .from('progress_edukasi')
    .select('selesai')
    .eq('user_id', user.id)
    .eq('modul_id', id)
    .maybeSingle()

  const sudahPernahSelesai = lama?.selesai === true

  const { error } = await supabase.from('progress_edukasi').upsert(
    {
      user_id: user.id,
      modul_id: id,
      persen,
      selesai,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,modul_id' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Poin hanya diberikan sekali, saat pertama kali selesai.
  let poinDiberikan = 0
  if (selesai && !sudahPernahSelesai) {
    const admin = createAdminClient()
    const { error: errPoin } = await admin.rpc('tambah_poin', {
      p_user_id: user.id,
      p_poin: modul.poin_reward,
    })
    if (errPoin) {
      console.error('tambah_poin gagal:', errPoin.message)
    } else {
      poinDiberikan = modul.poin_reward
    }
  }

  return NextResponse.json({ success: true, selesai, poin_diberikan: poinDiberikan })
}
