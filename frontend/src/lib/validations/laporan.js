import { z } from 'zod'

/**
 * Skema laporan siswa (spec §4.1C).
 *
 * Sengaja TIDAK ada korban_nama / pelaku_nama / saksi_nama.
 * Alasannya dua, dan keduanya penting:
 *
 *   1. Kolomnya tidak pernah ada di tabel `laporan_bullying`. Route lama
 *      men-spread `...validated` langsung ke insert, jadi field-field itu
 *      membuat submit gagal dengan "column does not exist".
 *   2. Lebih mendasar: ini kanal anonim. Mengumpulkan nama orang lain
 *      lewat form anonim mengubahnya jadi kanal tuduhan tanpa tanggung
 *      jawab, dan menaruh nama anak di bawah umur ke baris DB yang tidak
 *      pernah mereka setujui. Nama, kalau memang perlu, digali Guru BK
 *      lewat thread tiket — di jalur yang sudah ter-audit.
 *
 * `jenis_bullying` juga tidak diminta ke siswa: AI yang mengklasifikasi,
 * lalu Guru BK yang mengoreksi lewat jenis_final. Anak yang sedang takut
 * tidak seharusnya disuruh mengkategorikan kekerasan yang dia alami.
 */
/**
 * Bentuk UUID, bukan UUID RFC-4122 yang ketat.
 *
 * z.string().uuid() di Zod v4 memvalidasi nibble versi (harus 1-8). ID sekolah
 * demo kita — 00000000-0000-0000-0000-000000000001 — versinya 0, jadi DITOLAK,
 * padahal Postgres menerimanya dengan senang hati. Akibatnya setiap laporan
 * siswa gagal dengan "sekolah_id tidak valid" tanpa alasan yang terlihat.
 *
 * Regex ini cukup untuk menolak input ngawur; penjaga sebenarnya adalah
 * foreign key `laporan_sekolah_fk` di database — sekolah_id yang tidak ada
 * di tabel `sekolah` akan ditolak Postgres, apa pun bentuknya.
 */
const UUID_LONGGAR = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Batas minimum HANYA berlaku untuk laporan biasa.
 *
 * ======================= JANGAN JADIKAN INI KONSTANTA =======================
 * Laporan krisis WAJIB lolos berapa pun panjangnya. Minimum 15 karakter
 * ditulis untuk mencegah laporan sampah ("hai", "tes") — tapi diterapkan ke
 * semua orang, ia menolak justru yang paling mendesak:
 *
 *   "pengen mati" = 11 karakter -> "Ceritakan minimal 15 karakter"
 *   "aku bundir"  = 10 karakter -> "Ceritakan minimal 15 karakter"
 *
 * Orang yang paling terpukul menulis paling sedikit. Aturan panjang menghukum
 * persis orang yang paling tidak boleh dihukum, dan menyamarkannya sebagai
 * error formulir yang terlihat seperti kesalahan si anak.
 *
 * Pemanggil WAJIB menjalankan deteksi krisis lebih dulu, lalu memakai
 * minDeskripsi: 1 kalau krisis. Lihat POST /api/laporan.
 * ============================================================================
 */
export function buatLaporanSchema({ minDeskripsi = 15 } = {}) {
  return z.object({
    sekolah_id: z.string().regex(UUID_LONGGAR, 'sekolah_id tidak valid'),
    deskripsi: z
      .string()
      .trim()
      .min(minDeskripsi, `Ceritakan minimal ${minDeskripsi} karakter`)
      .max(2000, 'Maksimal 2000 karakter'),
    lokasi: z.string().trim().max(100).optional(),
    tanggal_kejadian: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
      .optional(),
    transkrip_chat: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string().max(4000),
        })
      )
      .max(40)
      .optional(),
  })
}

export const laporanSchema = z.object({
  sekolah_id: z.string().regex(UUID_LONGGAR, 'sekolah_id tidak valid'),
  deskripsi: z
    .string()
    .trim()
    .min(15, 'Ceritakan minimal 15 karakter')
    .max(2000, 'Maksimal 2000 karakter'),
  lokasi: z.string().trim().max(100).optional(),
  tanggal_kejadian: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
    .optional(),
  // Transkrip hanya ikut kalau siswa SENDIRI menekan "Jadikan Laporan".
  transkrip_chat: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(4000),
      })
    )
    .max(40)
    .optional(),
})

export const updateStatusLaporanSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITUTUP']),
  catatan: z.string().max(2000).optional(),
})

/** Override manual oleh Guru BK — hanya field final, tidak menyentuh jejak AI. */
export const overrideLaporanSchema = z.object({
  urgensi_final: z.enum(['RENDAH', 'SEDANG', 'TINGGI', 'KRITIS']).optional(),
  jenis_final: z.enum(['VERBAL', 'FISIK', 'SIBER', 'SOSIAL', 'SEKSUAL']).optional(),
})
