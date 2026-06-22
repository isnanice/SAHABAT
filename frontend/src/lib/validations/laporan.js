import { z } from 'zod'

export const laporanSchema = z.object({
  jenis_bullying: z.enum(['VERBAL', 'FISIK', 'SIBER', 'SOSIAL', 'SEKSUAL'], {
    required_error: 'Pilih jenis bullying',
  }),
  deskripsi: z
    .string()
    .min(20, 'Ceritakan minimal 20 karakter')
    .max(2000, 'Maksimal 2000 karakter'),
  lokasi: z.string().optional(),
  tanggal_kejadian: z.string().optional(),
  anonim: z.boolean().default(true),
  korban_nama: z.string().optional(),
  pelaku_nama: z.string().optional(),
  saksi_nama: z.string().optional(),
})

export const updateStatusLaporanSchema = z.object({
  status: z.enum(['MENUNGGU', 'DIPROSES', 'SELESAI', 'DITUTUP']),
  catatan: z.string().optional(),
})
