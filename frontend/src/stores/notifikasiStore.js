import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

const useNotifikasiStore = create((set, get) => ({
  notifikasi: [],
  unreadCount: 0,

  setNotifikasi: (notifikasi) => {
    const unread = notifikasi.filter((n) => !n.dibaca).length
    set({ notifikasi, unreadCount: unread })
  },

  markAsRead: async (id) => {
    const supabase = createClient()
    await supabase.from('notifikasi').update({ dibaca: true }).eq('id', id)
    const updated = get().notifikasi.map((n) =>
      n.id === id ? { ...n, dibaca: true } : n
    )
    get().setNotifikasi(updated)
  },

  markAllAsRead: async (userId) => {
    const supabase = createClient()
    await supabase
      .from('notifikasi')
      .update({ dibaca: true })
      .eq('user_id', userId)
      .eq('dibaca', false)
    get().setNotifikasi(get().notifikasi.map((n) => ({ ...n, dibaca: true })))
  },

  fetchNotifikasi: async (userId) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('notifikasi')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) get().setNotifikasi(data)
  },

  subscribeRealtime: (userId) => {
    const supabase = createClient()
    return supabase
      .channel(`notifikasi:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifikasi',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          set((state) => ({
            notifikasi: [payload.new, ...state.notifikasi],
            unreadCount: state.unreadCount + 1,
          }))
        }
      )
      .subscribe()
  },
}))

export default useNotifikasiStore
