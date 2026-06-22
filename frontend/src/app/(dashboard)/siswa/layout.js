import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function SiswaLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role, full_name').eq('id', user.id).single()

  if (profile?.role !== 'SISWA') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TODO: Sidebar Siswa */}
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  )
}
