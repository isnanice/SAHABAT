import { z } from 'zod'

export const requestKonselingSchema = z.object({
  tanggal: z.string().min(1, 'Pilih tanggal'),
  waktu_mulai: z.string().min(1, 'Pilih waktu'),
  catatan: z.string().max(500).optional(),
  jenis: z.enum(['ONLINE', 'TATAP_MUKA']).default('ONLINE'),
})

export const catatanKonselingSchema = z.object({
  catatan: z.string().min(10, 'Catatan minimal 10 karakter'),
  rekomendasi: z.string().optional(),
  tindak_lanjut: z.string().optional(),
})
