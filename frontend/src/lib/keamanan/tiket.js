import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'

/**
 * Kode tiket: satu-satunya kredensial siswa anonim.
 *
 * Siswa tidak login. Kode ini adalah SATU-SATUNYA hal yang membuktikan
 * "laporan ini punyaku". Konsekuensinya:
 *
 *   - Harus dibangkitkan dengan CSPRNG. Math.random() memakai xorshift128+
 *     yang state internalnya bisa direkonstruksi dari beberapa keluaran —
 *     artinya penyerang yang membuat beberapa laporan sendiri bisa
 *     memprediksi kode tiket korban lain.
 *   - Yang disimpan di DB hanya HMAC-nya. Bocornya dump database tidak
 *     boleh langsung berarti semua tiket bisa dilacak orang luar.
 */

const ALFABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // tanpa I/O/0/1 — mudah salah baca
const PANJANG_SEGMEN = 4
const JUMLAH_SEGMEN = 2

/**
 * Bangkitkan kode tiket baru. Format: SAH-XXXX-XXXX
 *
 * randomInt() memakai CSPRNG OS dan menolak modulo bias secara internal.
 * Keyspace: 32^8 ~= 1.1e12, dipasangkan dengan rate limit di endpoint lacak.
 */
export function generateKodeTiket() {
  const segmen = () =>
    Array.from({ length: PANJANG_SEGMEN }, () => ALFABET[randomInt(ALFABET.length)]).join('')
  return `SAH-${Array.from({ length: JUMLAH_SEGMEN }, segmen).join('-')}`
}

function ambilPepper() {
  const pepper = process.env.TICKET_PEPPER
  if (!pepper || pepper.length < 32) {
    // Fail loud. Pepper kosong = hash bisa dihitung ulang siapa pun yang
    // tahu kodenya, jadi seluruh gunanya hilang. Lebih baik submit gagal
    // dan siswa diarahkan ke BK langsung daripada diam-diam tidak aman.
    throw new Error(
      'TICKET_PEPPER belum diset (atau < 32 karakter). ' +
        'Bangkitkan dengan: openssl rand -hex 32'
    )
  }
  return pepper
}

/**
 * Hash kode tiket untuk disimpan / dicari.
 *
 * HMAC-SHA256 dengan pepper sebagai kunci. Deterministik, jadi pelacakan
 * tetap bisa lewat index unik — tapi tanpa pepper, dump DB tidak bisa
 * dibalik ke kode aslinya.
 *
 * Kode dinormalisasi dulu supaya siswa yang mengetik huruf kecil atau
 * lupa tanda hubung tetap ketemu tiketnya.
 */
export function hashKodeTiket(kode) {
  const normal = String(kode).trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  return createHmac('sha256', ambilPepper()).update(normal).digest('hex')
}

/**
 * Bandingkan dua hash tanpa membocorkan info lewat waktu eksekusi.
 * Dipakai kalau perbandingan dilakukan di aplikasi, bukan lewat index DB.
 */
export function hashSama(a, b) {
  const bufA = Buffer.from(String(a), 'hex')
  const bufB = Buffer.from(String(b), 'hex')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/** Bentuk kode valid? Dipakai untuk menolak input ngawur sebelum kena DB. */
export function bentukKodeValid(kode) {
  const normal = String(kode || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  return new RegExp(`^SAH[${ALFABET}]{${PANJANG_SEGMEN * JUMLAH_SEGMEN}}$`).test(normal)
}
