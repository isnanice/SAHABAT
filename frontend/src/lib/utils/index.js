import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { v4 as uuidv4 } from 'uuid'

/**
 * Merge Tailwind CSS classes dengan clsx
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Generate kode tiket unik untuk laporan anonim
 * Format: SAH-XXXX-XXXX (huruf + angka)
 */
export function generateKodeTiket() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const segment = (len) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `SAH-${segment(4)}-${segment(4)}`
}

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
