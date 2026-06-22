'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuthStore from '@/stores/authStore'

export function useAuth({ redirectIfUnauthenticated = null, allowedRoles = null } = {}) {
  const { user, profile, loading, initialize } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    if (loading) return

    if (redirectIfUnauthenticated && !user) {
      router.push(redirectIfUnauthenticated)
      return
    }

    if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
      // Redirect ke dashboard sesuai role
      const dashboardMap = {
        SISWA: '/siswa',
        GURU_BK: '/guru-bk',
        KEPALA_SEKOLAH: '/kepala-sekolah',
      }
      router.push(dashboardMap[profile.role] || '/')
    }
  }, [user, profile, loading])

  return { user, profile, loading }
}
