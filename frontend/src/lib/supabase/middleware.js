import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request })

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

    const roleRedirect = {
      SISWA: '/siswa',
      GURU_BK: '/guru-bk',
      KEPALA_SEKOLAH: '/kepala-sekolah',
    }

    const url = request.nextUrl.clone()
    url.pathname = roleRedirect[profile?.role] || '/siswa'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
