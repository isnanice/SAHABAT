import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function KepalaSekolahLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'KEPALA_SEKOLAH') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TODO: Sidebar Kepala Sekolah */}
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  )
}
