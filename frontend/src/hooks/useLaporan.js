'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLaporan({ userId, role } = {}) {
  const [laporan, setLaporan] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLaporan = async () => {
    const supabase = createClient()
    setLoading(true)

    let query = supabase.from('laporan_bullying').select(`
      *,
      pelapor:profiles!pelapor_id(full_name, kelas),
      penanganan:profiles!penanganan_guru_id(full_name)
    `)

    if (role === 'SISWA' && userId) {
      query = query.eq('pelapor_id', userId)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error: err } = await query
    if (err) setError(err.message)
    else setLaporan(data || [])
    setLoading(false)
  }

  useEffect(() => {
    if (userId || role === 'GURU_BK' || role === 'KEPALA_SEKOLAH') {
      fetchLaporan()
    }
  }, [userId, role])

  const submitLaporan = async (formData) => {
    const response = await fetch('/api/laporan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const result = await response.json()
    if (result.success) fetchLaporan()
    return result
  }

  return { laporan, loading, error, fetchLaporan, submitLaporan }
}
