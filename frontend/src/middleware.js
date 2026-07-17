import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request) {
  return await updateSession(request)
}

/**
 * Middleware HANYA jalan di route yang benar-benar butuh sesi login.
 *
 * Versi sebelumnya mencocokkan semua path, jadi `supabase.auth.getUser()`
 * dipanggil di setiap request — termasuk jalur siswa anonim (`/lapor`,
 * `/cek-laporan`, `/ruang-aman`, `/api/laporan`, `/api/tiket/*`). Tiga
 * akibatnya:
 *
 *   1. Jalur anonim jadi bergantung pada Supabase Auth. Auth bermasalah =
 *      anak tidak bisa melapor, padahal pelaporan tidak butuh auth sama sekali.
 *   2. Cookie auth diputar di request dari siswa yang justru sengaja tidak
 *      punya sesi. Untuk sistem yang seluruh gunanya tanpa identitas, itu
 *      permukaan yang tidak perlu ada.
 *   3. Tanpa env, middleware melempar dan SEMUA halaman jadi 404 — termasuk
 *      halaman publik yang tidak menyentuh Supabase.
 *
 * Daftar di bawah sengaja allowlist (sebut yang dilindungi), bukan blocklist
 * (kecualikan yang publik): halaman publik baru tidak akan diam-diam ikut
 * tertarik ke dalam auth karena ada yang lupa mengecualikannya.
 */
export const config = {
  matcher: [
    '/siswa/:path*',
    '/guru-bk/:path*',
    '/kepala-sekolah/:path*',
    '/login',
    '/register',
    '/masuk',
    '/daftar'
  ],
}
