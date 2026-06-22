import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function GuruBKLayout({ children }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'GURU_BK') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TODO: Sidebar Guru BK */}
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  )
}
