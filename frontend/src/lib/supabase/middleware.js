import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request })

  // Tanpa env, createServerClient melempar dan seluruh route yang cocok jadi
  // 404 — bukan pesan error yang bisa dipahami. Fail closed: kalau auth tidak
  // bisa dievaluasi, jangan biarkan route terproteksi terbuka; lempar ke login.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error(
      'middleware: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY belum diset — ' +
        'route terproteksi dialihkan ke /login. Isi frontend/.env.local.'
    )
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Proteksi route — redirect ke login jika belum autentikasi
  const protectedPaths = ['/siswa', '/guru-bk', '/kepala-sekolah']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect ke dashboard jika sudah login dan akses halaman auth
  const authPaths = ['/login', '/register']
  const isAuth = authPaths.some(p => request.nextUrl.pathname.startsWith(p))

  if (isAuth && user) {
    // Ambil role dari profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Tujuan harus halaman yang BENAR-BENAR ADA.
    // Versi sebelumnya mengarah ke '/siswa', '/guru-bk', '/kepala-sekolah' —
    // ketiganya cuma route group tanpa halaman index, jadi setiap login yang
    // berhasil berakhir di 404. Login "berfungsi" tapi tidak ada yang sampai.
    const roleRedirect = {
      GURU_BK: '/guru-bk/inbox',
      KEPALA_SEKOLAH: '/kepala-sekolah/analitik',
    }

    const url = request.nextUrl.clone()
    // Siswa tidak punya dashboard — jalur siswa memang tanpa login.
    // Kalau akun siswa entah bagaimana login, pulangkan ke beranda.
    url.pathname = roleRedirect[profile?.role] || '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
