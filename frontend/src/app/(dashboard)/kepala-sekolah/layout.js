import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HeaderDashboard from '@/components/HeaderDashboard'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderDashboard
        nama={profile.full_name}
        peran="Kepala Sekolah"
        beranda="/kepala-sekolah/analitik"
      />
      <main>{children}</main>
    </div>
  )
}
