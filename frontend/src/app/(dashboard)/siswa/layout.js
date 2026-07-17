import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HeaderDashboard from '@/components/HeaderDashboard'

export default async function SiswaLayout({ children }) {
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

  if (profile?.role !== 'SISWA' || !profile?.aktif) redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tombol Keluar paling penting justru di sini: ini komputer sekolah
          yang dipakai bergantian, dan siswa yang lupa keluar mewariskan
          sesinya ke pemakai berikutnya. */}
      <HeaderDashboard nama={profile.full_name} peran="Siswa" beranda="/siswa/edukasi" />
      <main>{children}</main>
    </div>
  )
}
