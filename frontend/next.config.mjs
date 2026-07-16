const dev = process.env.NODE_ENV === 'development'

/**
 * Content-Security-Policy.
 *
 * `unsafe-eval` HANYA di development — Turbopack/HMR membutuhkannya. Produksi
 * tidak, dan jangan ditambahkan ke sana.
 *
 * `unsafe-inline` untuk script masih diperlukan karena Next menyisipkan data
 * hidrasi sebagai inline script. Menghilangkannya butuh nonce per-request lewat
 * middleware — layak dikerjakan kalau SAHABAT benar-benar dipakai sekolah,
 * berlebihan untuk demo lomba. Dicatat di sini supaya tidak terlupa.
 *
 * connect-src harus mengizinkan Supabase: browser bicara langsung ke Auth
 * (login staf) lewat HTTPS dan Realtime lewat WSS.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  // Halaman ini TIDAK BOLEH bisa di-frame. Tanpa ini, situs mana pun bisa
  // menaruh /lapor di dalam iframe tak terlihat dan mengelabui siswa —
  // clickjacking pada formulir laporan perundungan.
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Membocorkan "Next.js" ke tiap respons hanya membantu penyerang memilih
  // eksploit. Tidak ada gunanya bagi pengguna.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          // Lapisan lama untuk browser yang belum paham frame-ancestors.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Jangan bocorkan URL SAHABAT ke situs lain. Anak yang membuka ini
          // di komputer sekolah bersama tidak perlu jejaknya ikut terkirim
          // ke pihak ketiga lewat header Referer.
          { key: 'Referrer-Policy', value: 'no-referrer' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Hanya berlaku di HTTPS; diabaikan browser saat localhost.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Halaman siswa TIDAK BOLEH tersimpan di cache bersama atau di disk.
        // Ini komputer sekolah yang dipakai bergantian — tombol Back pemakai
        // berikutnya tidak boleh memunculkan kode tiket atau cerita anak
        // sebelumnya.
        source: '/(lapor|cek-laporan|ruang-aman)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
        ],
      },
    ]
  },
}

export default nextConfig
