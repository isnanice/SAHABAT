import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarDashboard from '@/components/SidebarDashboard'

export default async function GuruBKLayout({ children }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, aktif')
    .eq('id', user.id)
    .single()

  // `aktif` ikut dicek, bukan cuma role: akun staf yang dinonaktifkan sekolah
  // tidak boleh tetap bisa membaca laporan sampai sesinya kedaluwarsa.
  if (profile?.role !== 'GURU_BK' || !profile?.aktif) redirect('/')

  // Shell bersidebar (desain citra). Semua halaman Guru BK dirender di dalamnya.
  return <SidebarDashboard nama={profile.full_name}>{children}</SidebarDashboard>
}
