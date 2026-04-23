import { z } from 'zod'

export const profileSchema = z.object({
  role: z.enum(['Artist', 'Curator', 'Institution']),
  display_name: z.string().min(2, 'At least 2 characters').max(50, 'Max 50 characters'),
  bio: z.string().max(300, 'Max 300 characters').optional(),
  geography: z.string().min(1, 'Required'),
  discipline: z.string().min(1, 'Required'),
  interests: z
    .array(z.string())
    .min(1, 'Add at least one interest')
    .max(10, 'Max 10 interests'),
})

export type ProfileFormData = z.infer<typeof profileSchema>
