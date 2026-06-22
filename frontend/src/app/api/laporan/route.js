import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { klasifikasiLaporan } from '@/lib/ai/klasifikasi'
import { generateKodeTiket } from '@/lib/utils'
import { laporanSchema } from '@/lib/validations/laporan'

export async function GET(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  let query = supabase.from('laporan_bullying').select(`
    *,
    pelapor:profiles!pelapor_id(full_name, kelas),
    penanganan:profiles!penanganan_guru_id(full_name)
  `).order('created_at', { ascending: false })

  if (profile?.role === 'SISWA') {
    query = query.eq('pelapor_id', user.id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const validated = laporanSchema.parse(body)

    // Klasifikasi AI
    const klasifikasi = await klasifikasiLaporan(validated.deskripsi, {
      jenis: validated.jenis_bullying,
      lokasi: validated.lokasi,
    })

    const kode = generateKodeTiket()

    const admin = createAdminClient()
    const { data, error } = await admin.from('laporan_bullying').insert({
      ...validated,
      kode_tiket: kode,
      pelapor_id: validated.anonim ? null : user?.id,
      prioritas: klasifikasi.prioritas,
      ai_klasifikasi: klasifikasi,
      status: 'MENUNGGU',
    }).select().single()

    if (error) throw error

    // Kirim notifikasi ke semua guru BK
    if (klasifikasi.prioritas === 'KRITIS' || klasifikasi.prioritas === 'TINGGI') {
      const { data: gurubk } = await admin
        .from('profiles').select('id').eq('role', 'GURU_BK')

      if (gurubk?.length) {
        await admin.from('notifikasi').insert(
          gurubk.map((g) => ({
            user_id: g.id,
            judul: `⚠️ Laporan ${klasifikasi.prioritas}: ${validated.jenis_bullying}`,
            pesan: `Tiket ${kode} perlu penanganan segera`,
            tipe: 'LAPORAN_BARU',
            ref_id: data.id,
          }))
        )
      }
    }

    return NextResponse.json({ success: true, kode_tiket: kode, laporan: data })
  } catch (error) {
    console.error('POST /api/laporan error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
