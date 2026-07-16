import { NextResponse } from 'next/server'
import { streamChatbotMessage, FALLBACK_GANGGUAN } from '@/lib/ai/chatbot'
import { deteksiKrisisRiwayat } from '@/lib/keamanan/crisis'
import { cekRateLimit, LIMIT } from '@/lib/keamanan/ratelimit'
import { HOTLINE } from '@/lib/keamanan/hotline'

/**
 * POST /api/ai/chatbot
 *
 * URUTAN DI BAWAH DISENGAJA DAN TIDAK BOLEH DIUBAH:
 *
 *   1. rate limit
 *   2. deteksi krisis  <-- deterministik, tanpa network
 *   3. LLM
 *
 * Deteksi krisis harus mendahului LLM supaya anak yang menulis indikasi
 * bunuh diri tidak perlu menunggu — dan tetap tertangani JUSTRU ketika
 * gateway AI sedang mati. Kalau kamu tergoda memindahkan deteksi krisis ke
 * belakang LLM (misalnya "biar AI yang menilai konteksnya"), jangan:
 * saat itulah lapisan ini paling dibutuhkan dan paling mungkin ikut mati.
 *
 * BENTUK RESPONS:
 *   - krisis / gangguan / rate limit -> JSON biasa dengan field `mode`.
 *     (Krisis TIDAK di-stream: panel darurat harus muncul utuh & instan.)
 *   - normal -> STREAM baris-per-baris (NDJSON). Baris pertama {mode:'normal'},
 *     lalu {t:'...'} per potongan jawaban, ditutup {selesai:true}. Kalau di
 *     tengah stream AI ternyata gagal tanpa satu token pun, baris {mode:
 *     'gangguan'} dikirim supaya frontend menampilkan pesan jujur.
 *
 * Streaming hanya mengubah CARA balasan normal dikirim — urutan
 * rate limit -> krisis -> LLM tetap persis sama, dan krisis tetap tidak
 * pernah menyentuh LLM.
 */
export async function POST(request) {
  const sesi = request.headers.get('x-sesi') || ''

  // --- 1. Rate limit -------------------------------------------------------
  const batas = await cekRateLimit(sesi, 'chat', LIMIT.CHAT)
  if (!batas.ok) {
    return NextResponse.json(
      {
        mode: 'gangguan',
        balasan: 'Terlalu banyak pesan dalam waktu singkat. Coba lagi beberapa menit lagi.',
      },
      { status: 429, headers: { 'Retry-After': String(batas.retryAfterDetik) } }
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const { messages } = body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'Format pesan tidak valid' }, { status: 400 })
  }

  // --- 2. Deteksi krisis — SEBELUM LLM ------------------------------------
  // Seluruh riwayat diperiksa, bukan cuma pesan terakhir: anak bisa menyebut
  // indikasi krisis di awal lalu melanjutkan cerita biasa.
  const krisis = deteksiKrisisRiwayat(messages)
  if (krisis.krisis) {
    // LLM SENGAJA TIDAK DIPANGGIL di turn ini (uji spec §8.3 memeriksa ini).
    return NextResponse.json({
      mode: 'krisis',
      kategori: krisis.kategori,
      balasan:
        'Aku berhenti sebentar, karena yang kamu tulis terdengar berat dan ' +
        'kamu berhak dapat bantuan dari manusia — bukan dari bot.\n\n' +
        'Kalau kamu sedang dalam bahaya sekarang, tolong temui Guru BK, orang ' +
        'tua, atau orang dewasa yang kamu percaya secepatnya. Kamu tidak harus ' +
        'menghadapi ini sendirian, dan bercerita tadi bukan hal yang memalukan.',
      hotline: HOTLINE,
    })
  }

  // --- 3. LLM (streaming) --------------------------------------------------
  // Riwayat chat TIDAK disimpan ke DB (lihat catatan anonimitas di bawah).
  //
  // Sampai titik ini kita SUDAH tahu ini bukan krisis dan tidak kena rate
  // limit. Baru sekarang stream dibuka.
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const kirim = (obj) => controller.enqueue(encoder.encode(JSON.stringify(obj) + '\n'))

      // Baris pertama: beri tahu frontend ini balasan normal, sebelum token
      // apa pun. Frontend bisa langsung menyiapkan gelembung kosong.
      kirim({ mode: 'normal' })

      let adaToken = false
      const hasil = await streamChatbotMessage(messages, (potongan) => {
        adaToken = true
        kirim({ t: potongan })
      })

      // Kalau AI gagal tanpa menghasilkan satu token pun, ganti jadi pesan
      // gangguan yang jujur — jangan tinggalkan gelembung kosong.
      if (!hasil.ok && !adaToken) {
        kirim({ mode: 'gangguan', balasan: FALLBACK_GANGGUAN })
      }

      kirim({ selesai: true })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no', // cegah proxy menahan stream sampai selesai
    },
  })
}

// Riwayat chat TIDAK disimpan ke DB. Versi sebelumnya menyimpannya ke
// chatbot_messages saat user login — untuk sesi yang seharusnya anonim, itu
// menciptakan tautan permanen antara identitas siswa dan ceritanya. Transkrip
// hanya ikut tersimpan kalau siswa SENDIRI memilih "Jadikan Laporan".
