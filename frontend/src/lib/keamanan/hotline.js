/**
 * Kontak darurat yang ditampilkan saat deteksi krisis menyala.
 *
 * ======================= WAJIB DIBACA TIM =======================
 * Nomor di bawah BELUM DIVERIFIKASI oleh siapa pun di tim ini.
 * Nomor yang mati/salah sambung ke anak yang sedang krisis lebih buruk
 * daripada tidak menampilkan nomor sama sekali — anak itu sudah
 * mengumpulkan keberanian sekali, dan sambungan yang gagal mengajarkan
 * dia bahwa meminta tolong tidak berguna.
 *
 * SEBELUM DEMO / SEBELUM DIPAKAI SISWA:
 *   1. Telepon setiap nomor di jam kerja. Pastikan tersambung ke manusia.
 *   2. Isi `terverifikasi_pada` dengan tanggal kamu menelepon.
 *   3. Nomor dengan `terverifikasi_pada: null` sengaja dirender dengan
 *      penanda "belum diverifikasi" oleh UI (lihat PanelDarurat).
 *
 * Jalur yang TIDAK bergantung nomor telepon — menemui Guru BK atau orang
 * dewasa yang dipercaya — sengaja ditaruh paling atas di UI, karena itu
 * satu-satunya jalur yang pasti hidup.
 * ================================================================
 */

export const HOTLINE = [
  {
    nama: 'SEJIWA — Konseling Sehat Jiwa',
    nomor: '119 ext. 8',
    keterangan: 'Layanan konseling kesehatan jiwa Kementerian Kesehatan.',
    terverifikasi_pada: null, // TODO tim: telepon dulu, lalu isi 'YYYY-MM-DD'
  },
  {
    nama: 'SAPA 129 — Kementerian PPPA',
    nomor: '129',
    keterangan: 'Pengaduan kekerasan terhadap perempuan dan anak.',
    terverifikasi_pada: null, // TODO tim: telepon dulu, lalu isi 'YYYY-MM-DD'
  },
]

/** Nomor yang belum diverifikasi tetap ditampilkan, tapi diberi penanda. */
export function adaYangBelumDiverifikasi() {
  return HOTLINE.some((h) => !h.terverifikasi_pada)
}
