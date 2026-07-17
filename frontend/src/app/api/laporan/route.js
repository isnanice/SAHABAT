import { NextResponse, after } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { klasifikasiLaporan } from '@/lib/ai/klasifikasi'
import { generateKodeTiket, hashKodeTiket } from '@/lib/keamanan/tiket'
import { deteksiKrisis, deteksiKrisisRiwayat } from '@/lib/keamanan/crisis'
import { cekRateLimit, LIMIT } from '@/lib/keamanan/ratelimit'
import { buatLaporanSchema } from '@/lib/validations/laporan'

/**
 * GET /api/laporan — antrean Guru BK.
 *
 * Query lewat client ber-sesi user (BUKAN admin), supaya RLS yang
 * menegakkan isolasi antar sekolah, bukan kode ini. Kalau isolasi hanya
 * ditegakkan di sini, satu route yang lupa memfilter membocorkan seluruh
 * laporan sekolah lain.
 */
export async function GET(request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, aktif')
    .eq('id', user.id)
    .single()

  if (!profile?.aktif || !['GURU_BK', 'KEPALA_SEKOLAH'].includes(profile.role)) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  // Urut pakai urgensi_final (keputusan manusia menang), BUKAN ai_urgensi.
  const { data, error } = await supabase
    .from('laporan_bullying')
    .select(
      `id, status, urgensi_final, jenis_final, ai_urgensi, ai_jenis,
       ai_confidence, ai_gagal, ai_klasifikasi, flag_krisis, lokasi,
       tanggal_kejadian, created_at, updated_at`
    )
    .order('flag_krisis', { ascending: false })
    .order('urgensi_final', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

/**
 * POST /api/laporan — siswa mengirim laporan (anonim, tanpa login).
 *
 * ============ JANGAN PERNAH MEMBACA SESI LOGIN DI SINI ============
 * Sejak siswa bisa punya akun (untuk modul edukasi & poin), handler ini jadi
 * titik paling rawan di seluruh sistem. Siswa yang sedang login TETAP
 * mengirim cookie auth ke route ini — dan sangat menggoda untuk "sekalian"
 * mengisi pelapor_id karena datanya toh ada.
 *
 * JANGAN. Satu baris itu membatalkan seluruh produk: laporan jadi tertaut
 * identitas, bocornya DB berarti ketahuan siapa melaporkan siapa, dan anak
 * yang takut pembalasan berhenti melapor.
 *
 * Karena itu handler ini SENGAJA hanya memakai createAdminClient()
 * (service_role) dan tidak pernah memanggil createClient()/auth.getUser().
 * Constraint DB `laporan_anonim_tanpa_identitas` adalah jaring pengaman
 * kedua — bukan alasan untuk lengah di sini.
 * ==================================================================
 *
 * FAIL-SAFE ADALAH SIFAT UTAMA ROUTE INI.
 *
 * Versi lama memanggil klasifikasiLaporan() di luar try/catch per-langkah:
 * begitu gateway AI mati, fungsi itu throw, ditangkap catch terluar, dan
 * route membalas 500 — laporan anak HILANG tanpa jejak, dan yang dia lihat
 * cuma error. Sekarang klasifikasi tidak pernah bisa menjatuhkan insert:
 * AI gagal -> laporan tetap masuk, ditandai ai_gagal untuk dibaca manual.
 *
 * Yang MASIH boleh gagal keras: insert DB. Kalau laporan benar-benar tidak
 * tersimpan, siswa harus diberi tahu jujur — jangan pernah menampilkan kode
 * tiket untuk laporan yang tidak ada (spec §5.4).
 */
export async function POST(request) {
  const sesi = request.headers.get('x-sesi') || ''

  const batas = await cekRateLimit(sesi, 'submit-laporan', LIMIT.SUBMIT_LAPORAN)
  if (!batas.ok) {
    return NextResponse.json(
      { error: 'Terlalu banyak laporan dikirim. Coba lagi beberapa menit lagi.' },
      { status: 429, headers: { 'Retry-After': String(batas.retryAfterDetik) } }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  // --- Krisis: deterministik, SEBELUM validasi ----------------------------
  //
  // Urutannya di sini penting dan pernah salah. Versi sebelumnya memvalidasi
  // dulu, jadi aturan "minimal 15 karakter" menolak laporan SEBELUM deteksi
  // krisis sempat berjalan:
  //
  //   "pengen mati" (11) -> 400 "Ceritakan minimal 15 karakter"
  //   "aku bundir"  (10) -> 400 "Ceritakan minimal 15 karakter"
  //
  // Anak yang paling putus asa menulis paling pendek, lalu dijawab error
  // formulir yang terlihat seperti kesalahan dia. Krisis sekarang diperiksa
  // pada input MENTAH, dan laporan krisis lolos berapa pun panjangnya.
  const deskripsiMentah = String(body?.deskripsi ?? '')
  const krisisIsi = deteksiKrisis(deskripsiMentah)
  const krisisChat = deteksiKrisisRiwayat(
    Array.isArray(body?.transkrip_chat) ? body.transkrip_chat : []
  )
  const flagKrisis = krisisIsi.krisis || krisisChat.krisis

  const parsed = buatLaporanSchema({
    minDeskripsi: flagKrisis ? 1 : 15,
  }).safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Data tidak valid' },
      { status: 400 }
    )
  }
  const v = parsed.data

  // --- Klasifikasi AI TIDAK diblokir di sini -------------------------------
  //
  // Laporan disimpan DULU, AI menyusul di belakang (lihat after() di bawah).
  // Dua alasan, dan keduanya penting:
  //
  //   1. Kecepatan. Klasifikasi makan ~4,3 detik (model reasoning). Menunggu
  //      itu berarti anak yang baru menceritakan hal tersulit dalam hidupnya
  //      menatap spinner, tidak tahu ceritanya sudah terkirim atau belum.
  //      Sekarang kode tiketnya muncul dalam ratusan milidetik.
  //   2. Fail-safe jadi lebih kuat, bukan sekadar tetap. Sebelumnya laporan
  //      baru disimpan SETELAH AI selesai — artinya ada jendela beberapa detik
  //      di mana proses mati = laporan hilang. Sekarang laporannya sudah
  //      durable sebelum AI disentuh sama sekali.
  //
  // Baris disimpan dengan ai_gagal = true. Itu JUJUR: pada saat insert, AI
  // memang belum mengklasifikasi apa pun. Kalau after() gagal atau prosesnya
  // dimatikan, statusnya tetap benar dan Guru BK membacanya manual.
  const urgensiAwal = flagKrisis ? 'KRITIS' : 'SEDANG'

  const kode = generateKodeTiket()

  let kodeHash
  try {
    kodeHash = hashKodeTiket(kode)
  } catch (e) {
    // TICKET_PEPPER belum diset. Jangan simpan kode mentah sebagai jalan
    // pintas — lebih baik menolak jujur daripada diam-diam tidak aman.
    console.error('POST /api/laporan — pepper:', e.message)
    return NextResponse.json(
      {
        error:
          'Sistem pelaporan sedang bermasalah dan laporanmu BELUM tersimpan. ' +
          'Tolong hubungi Guru BK secara langsung.',
      },
      { status: 503 }
    )
  }

  const admin = createAdminClient()

  const { data, error } = await admin
    .from('laporan_bullying')
    .insert({
      kode_tiket_hash: kodeHash,
      sekolah_id: v.sekolah_id,

      // Jalur anonim: TIDAK ADA tautan identitas.
      //
      // Skema NYATA tidak punya `korban_id` (itu cuma ada di file 001, tidak
      // pernah di database). Yang ada: tiga kolom teks bebas nama_korban /
      // nama_pelaku / nama_saksi. Semuanya dikosongkan eksplisit — constraint
      // `laporan_anonim_tanpa_identitas` juga menolak baris anonim yang
      // memuat salah satunya, jadi ini ditegakkan dua lapis.
      pelapor_id: null,
      nama_korban: null,
      nama_pelaku: null,
      nama_saksi: null,
      anonim: true,
      deskripsi: v.deskripsi,
      lokasi: v.lokasi ?? null,
      tanggal_kejadian: v.tanggal_kejadian ?? null,

      // AI belum jalan pada titik ini — ditandai apa adanya.
      ai_urgensi: null,
      ai_jenis: null,
      ai_confidence: null,
      ai_gagal: true,
      ai_klasifikasi: { menunggu: true },

      // Keputusan yang dipakai dashboard — bisa di-override Guru BK.
      urgensi_final: urgensiAwal,
      jenis_final: null, // diisi AI di belakang, atau Guru BK manual
      flag_krisis: flagKrisis,

      // Kolom lama dari 001 masih NOT NULL — jaga tetap konsisten.
      prioritas: urgensiAwal,
      jenis_bullying: 'VERBAL',
      status: 'MENUNGGU',
    })
    .select('id')
    .single()

  if (error) {
    // Gagal jujur. JANGAN kembalikan kode tiket untuk laporan yang tidak ada.
    console.error('POST /api/laporan — insert gagal:', error.message)
    return NextResponse.json(
      {
        error:
          'Laporanmu GAGAL tersimpan. Tolong hubungi Guru BK secara langsung, ' +
          'atau coba lagi beberapa saat lagi.',
      },
      { status: 500 }
    )
  }

  // Transkrip chat disimpan sebagai pesan pertama di thread, hanya kalau
  // siswa memilih "Jadikan Laporan".
  if (v.transkrip_chat?.length) {
    const ringkas = v.transkrip_chat
      .filter((m) => m.role === 'user')
      .map((m) => m.content)
      .join('\n')
    if (ringkas.trim()) {
      const { error: errPesan } = await admin.from('pesan_tiket').insert({
        laporan_id: data.id,
        dari_staf: null,
        isi: `[Dari percakapan RuangAman]\n${ringkas}`.slice(0, 8000),
      })
      // Transkrip gagal bukan alasan membatalkan laporan — laporannya sudah
      // aman tersimpan, dan itu yang paling penting.
      if (errPesan) console.error('transkrip gagal disimpan:', errPesan.message)
    }
  }

  // Notifikasi HANYA ke staf sekolah yang sama.
  // Versi lama mengirim ke SEMUA guru_bk lintas sekolah, dan menaruh kode
  // tiket di isi notifikasi — artinya BK sekolah lain bisa membaca kodenya
  // lalu melacak tiket anak yang bukan muridnya. Kode tiket tidak pernah
  // boleh keluar dari layar siswa yang membuatnya.
  if (flagKrisis || ['KRITIS', 'TINGGI'].includes(urgensiAwal)) {
    const { data: staf } = await admin
      .from('profiles')
      .select('id')
      .eq('school_id', v.sekolah_id)
      .eq('role', 'GURU_BK')
      .eq('aktif', true)

    if (staf?.length) {
      await admin.from('notifikasi').insert(
        staf.map((s) => ({
          user_id: s.id,
          judul: flagKrisis
            ? '🚨 Laporan prioritas kritis'
            : `⚠️ Laporan ${urgensiAwal}`,
          pesan: 'Ada laporan baru yang perlu segera dibuka di dashboard.',
          tipe: 'LAPORAN_BARU',
          ref_id: data.id, // referensi internal, bukan kode tiket siswa
        }))
      )
    }
  }

  // --- Klasifikasi AI, SETELAH respons terkirim ---------------------------
  //
  // after() menjalankan ini di belakang layar begitu siswa sudah menerima kode
  // tiketnya. Laporannya sudah durable, jadi apa pun yang terjadi di sini
  // tidak bisa menghilangkannya — paling buruk baris itu tetap ai_gagal dan
  // Guru BK membacanya manual, yang memang perilaku yang kita mau.
  //
  // Krisis TIDAK ikut dihitung ulang di sini: `flag_krisis` dan urgensi KRITIS
  // sudah ditetapkan lapisan deterministik saat insert, dan blok ini sengaja
  // tidak boleh menurunkannya. Lapisan yang tidak bisa mati tidak boleh
  // ditimpa lapisan yang bisa.
  after(async () => {
    const ai = await klasifikasiLaporan(v.deskripsi, { lokasi: v.lokasi })
    if (ai.gagal) {
      // Sudah ai_gagal = true sejak insert. Cukup catat alasannya.
      await admin
        .from('laporan_bullying')
        .update({ ai_klasifikasi: ai })
        .eq('id', data.id)
      return
    }

    const { error: errAi } = await admin
      .from('laporan_bullying')
      .update({
        ai_urgensi: ai.urgensi,
        ai_jenis: ai.jenis,
        ai_confidence: ai.confidence,
        ai_gagal: false,
        ai_klasifikasi: ai,
        jenis_final: ai.jenis,
        jenis_bullying: ai.jenis ?? 'VERBAL',
        // Krisis mengunci KRITIS. Untuk sisanya, pakai penilaian AI.
        ...(flagKrisis ? {} : { urgensi_final: ai.urgensi, prioritas: ai.urgensi }),
      })
      .eq('id', data.id)

    if (errAi) console.error('klasifikasi async gagal disimpan:', errAi.message)
  })

  // Kode mentah dikembalikan SEKALI, di sini. Tidak disimpan di mana pun.
  return NextResponse.json({
    success: true,
    kode_tiket: kode,
    krisis: flagKrisis,
  })
}
