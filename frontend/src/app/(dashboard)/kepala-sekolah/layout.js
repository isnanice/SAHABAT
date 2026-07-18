import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarDashboard, { NAV_KEPSEK } from '@/components/SidebarDashboard'

export default async function KepalaSekolahLayout({ children }) {
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

  if (profile?.role !== 'KEPALA_SEKOLAH' || !profile?.aktif) redirect('/')

  // Shell bersidebar yang sama dengan Guru BK — konsisten dengan desain,
  // nav difokuskan ke pengawasan Kepala Sekolah.
  return (
    <SidebarDashboard
      nama={profile.full_name}
      nav={NAV_KEPSEK}
      home="/kepala-sekolah/analitik"
      bantuan="/kepala-sekolah/analitik"
      notifikasi="/kepala-sekolah/analitik"
    >
      {children}
    </SidebarDashboard>
  )
}
