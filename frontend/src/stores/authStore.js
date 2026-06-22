import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  fetchProfile: async (userId) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    set({ profile: data })
    return data
  },

  signOut: async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },

  initialize: async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
      set({ user: session.user })
      await get().fetchProfile(session.user.id)
    }

    set({ loading: false })

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ user: session.user })
        await get().fetchProfile(session.user.id)
      } else {
        set({ user: null, profile: null })
      }
    })
  },
}))

export default useAuthStore
