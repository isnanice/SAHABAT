'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Hook untuk subscribe Supabase Realtime
 * @param {string} channelName - Nama channel
 * @param {Object} filter - Filter postgres_changes
 * @param {Function} callback - Callback saat ada perubahan
 */
export function useRealtime(channelName, filter, callback) {
  const channelRef = useRef(null)

  useEffect(() => {
    const supabase = createClient()

    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', filter, callback)
      .subscribe()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [channelName])
}
