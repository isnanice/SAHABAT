import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  role: z.enum(['SISWA', 'GURU_BK', 'KEPALA_SEKOLAH']),
  kelas: z.string().optional(),
  nis: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
})
