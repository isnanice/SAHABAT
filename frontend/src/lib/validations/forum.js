import { z } from 'zod'

export const forumPostSchema = z.object({
  judul: z.string().min(5, 'Judul minimal 5 karakter').max(150, 'Judul maksimal 150 karakter'),
  konten: z.string().min(20, 'Konten minimal 20 karakter').max(5000),
  tags: z.array(z.string()).max(5, 'Maksimal 5 tag').optional(),
  anonim: z.boolean().default(false),
})

export const forumKomentarSchema = z.object({
  konten: z.string().min(5, 'Komentar minimal 5 karakter').max(1000),
  anonim: z.boolean().default(false),
})
