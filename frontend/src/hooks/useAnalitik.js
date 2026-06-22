'use client'

import { useState, useEffect } from 'react'

export function useAnalitik({ periode = '30d' } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalitik = async () => {
      setLoading(true)
      const res = await fetch(`/api/analitik?periode=${periode}`)
      const result = await res.json()
      setData(result)
      setLoading(false)
    }
    fetchAnalitik()
  }, [periode])

  return { data, loading }
}
