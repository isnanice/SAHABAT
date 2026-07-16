import { createHash } from 'node:crypto'

/**
 * Rate limit berbasis HASH SESI — bukan IP.
 *
 * Spec §9 melarang menyimpan IP siswa. IP di sekolah biasanya dibagi satu
 * NAT untuk seluruh gedung, jadi selain melanggar privasi, membatasi per-IP
 * juga akan memblokir seluruh sekolah begitu satu anak melapor.
 *
 * Header `x-sesi` datang dari sessionStorage di browser. Ini BUKAN
 * autentikasi — siswa bisa menggantinya kapan saja. Fungsinya cuma
 * memperlambat penebakan kode tiket dan penyalahgunaan kuota AI. Pertahanan
 * sebenarnya terhadap tebakan tiket adalah keyspace 32^8 dari kode itu
 * sendiri (lihat keamanan/tiket.js).
 *
 * ====================== BATASAN YANG HARUS DIKETAHUI ======================
 * Penyimpanannya in-memory, jadi hitungannya PER-INSTANCE. Di Vercel yang
 * serverless, tiap instance punya Map sendiri dan instance bisa didaur ulang
 * kapan saja — artinya batas ini bisa ditembus dengan cara memancing
 * instance baru. Cukup untuk demo lomba; TIDAK cukup untuk produksi.
 *
 * Untuk produksi: pindahkan ke tabel Postgres (atau Upstash Redis) supaya
 * hitungannya dibagi lintas instance. Bentuk fungsinya sengaja dibuat async
 * supaya penggantian itu tidak mengubah pemanggilnya.
 * =========================================================================
 */

const BUCKET = new Map()
const MAX_ENTRI = 10_000 // batas kasar supaya proses lama tidak bocor memori

/** Sesi mentah tidak pernah disimpan — cuma hash-nya. */
function kunci(sesi, aksi) {
  return createHash('sha256').update(`${aksi}:${String(sesi)}`).digest('hex')
}

function bersihkan(sekarang) {
  if (BUCKET.size < MAX_ENTRI) return
  for (const [k, v] of BUCKET) {
    if (v.reset <= sekarang) BUCKET.delete(k)
  }
}

/**
 * @param {string} sesi   - nilai header x-sesi
 * @param {string} aksi   - nama endpoint, mis. 'lacak-tiket'
 * @param {{max:number, windowMs:number}} opsi
 * @returns {Promise<{ok:boolean, sisa:number, retryAfterDetik:number}>}
 */
export async function cekRateLimit(sesi, aksi, { max, windowMs }) {
  const sekarang = Date.now()

  // Sesi kosong = klien tidak mengirim header. Diperlakukan sebagai satu
  // ember bersama supaya tidak jadi celah lolos rate limit.
  const k = kunci(sesi || 'tanpa-sesi', aksi)

  bersihkan(sekarang)

  const entri = BUCKET.get(k)
  if (!entri || entri.reset <= sekarang) {
    BUCKET.set(k, { hitung: 1, reset: sekarang + windowMs })
    return { ok: true, sisa: max - 1, retryAfterDetik: 0 }
  }

  entri.hitung += 1
  if (entri.hitung > max) {
    return {
      ok: false,
      sisa: 0,
      retryAfterDetik: Math.ceil((entri.reset - sekarang) / 1000),
    }
  }

  return { ok: true, sisa: max - entri.hitung, retryAfterDetik: 0 }
}

/** Preset per endpoint. Lacak tiket paling ketat: itu permukaan brute-force. */
export const LIMIT = {
  LACAK_TIKET: { max: 10, windowMs: 15 * 60 * 1000 }, // spec §8.5: 429 setelah 10x
  SUBMIT_LAPORAN: { max: 5, windowMs: 10 * 60 * 1000 },
  CHAT: { max: 30, windowMs: 10 * 60 * 1000 },
  BALAS_TIKET: { max: 10, windowMs: 10 * 60 * 1000 },
}
