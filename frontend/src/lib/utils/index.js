import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes dengan clsx
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * generateKodeTiket() dipindah ke `@/lib/keamanan/tiket`.
 *
 * Versi lama di sini memakai Math.random(), yang tidak aman untuk kredensial:
 * kode tiket adalah satu-satunya cara siswa anonim memantau laporannya, dan
 * keluaran Math.random() bisa diprediksi dari beberapa sampel. Jangan
 * membangkitkan kode tiket dari file ini.
 */

/**
 * Format tanggal ke bahasa Indonesia
 */
export function formatTanggal(date, options = {}) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  }).format(new Date(date))
}

/**
 * Truncate teks panjang
 */
export function truncate(str, maxLength = 100) {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * Delay / sleep utility
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Label prioritas dengan warna
 */
export const PRIORITAS_CONFIG = {
  RENDAH: { label: 'Rendah', color: 'text-green-600', bg: 'bg-green-100' },
  SEDANG: { label: 'Sedang', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  TINGGI: { label: 'Tinggi', color: 'text-orange-600', bg: 'bg-orange-100' },
  KRITIS: { label: 'Kritis', color: 'text-red-600', bg: 'bg-red-100' },
}

/**
 * Label status tiket
 */
export const STATUS_CONFIG = {
  MENUNGGU: { label: 'Menunggu', color: 'text-gray-600', bg: 'bg-gray-100' },
  DIPROSES: { label: 'Diproses', color: 'text-blue-600', bg: 'bg-blue-100' },
  SELESAI: { label: 'Selesai', color: 'text-green-600', bg: 'bg-green-100' },
  DITUTUP: { label: 'Ditutup', color: 'text-gray-500', bg: 'bg-gray-50' },
}
