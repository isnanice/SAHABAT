/**
 * Klien API frontend (spec §7.3).
 *
 * Semua panggilan ke backend lewat sini, supaya header `x-sesi` tidak pernah
 * lupa dipasang dan penanganan 429 seragam.
 */

const SESI_KEY = 'sahabat_sesi'

/**
 * ID sesi HANYA untuk rate limit — bukan identitas, bukan autentikasi.
 * Server pun cuma menyimpan hash-nya (lihat keamanan/ratelimit.js).
 *
 * sessionStorage, bukan localStorage: ini komputer sekolah yang dipakai
 * bergantian, jadi jejaknya harus hilang saat tab ditutup.
 */
export function ambilSesi() {
  if (typeof window === 'undefined') return ''
  let sesi = sessionStorage.getItem(SESI_KEY)
  if (!sesi) {
    sesi = crypto.randomUUID()
    sessionStorage.setItem(SESI_KEY, sesi)
  }
  return sesi
}

export class ApiError extends Error {
  constructor(pesan, status) {
    super(pesan)
    this.status = status
  }
}

async function post(path, body) {
  let res
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-sesi': ambilSesi() },
      body: JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      'Koneksi bermasalah. Cek jaringanmu lalu coba lagi.',
      0
    )
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* respons tanpa body JSON */
  }

  if (res.status === 429) {
    throw new ApiError(
      data?.error || 'Terlalu banyak percobaan, coba 15 menit lagi.',
      429
    )
  }

  if (!res.ok) {
    // Pesan error dari server sengaja diteruskan apa adanya: server yang tahu
    // apakah laporannya benar-benar tersimpan atau tidak, dan siswa berhak
    // tahu yang sebenarnya (spec §5.4).
    throw new ApiError(data?.error || 'Terjadi kesalahan. Coba lagi.', res.status)
  }

  return data
}

export const api = {
  kirimLaporan: (payload) => post('/api/laporan', payload),
  lacakTiket: (kode_tiket) => post('/api/tiket/lacak', { kode_tiket }),
  balasTiket: (kode_tiket, isi) => post('/api/tiket/balas', { kode_tiket, isi }),
  chat: (messages) => post('/api/ai/chatbot', { messages }),
}

/** ID sekolah demo. Produksi: dari subdomain/pilihan sekolah saat masuk. */
export const SEKOLAH_ID =
  process.env.NEXT_PUBLIC_SEKOLAH_DEMO_ID ||
  '00000000-0000-0000-0000-000000000001'
