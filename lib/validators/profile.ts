import { z } from 'zod'

export const profileSchema = z.object({
  role: z.enum(['Artist', 'Curator', 'Institution']),
  display_name: z.string().trim().min(2, 'At least 2 characters').max(50, 'Max 50 characters'),
  bio: z
    .string()
    .trim()
    .max(300, 'Max 300 characters')
    .optional()
    .or(z.literal(''))
    .transform(value => (value === '' ? undefined : value)),
  geography: z.string().trim().min(1, 'Required'),
  discipline: z.string().trim().min(1, 'Required'),
  interests: z
    .array(z.string().trim().min(1, 'Interest cannot be empty'))
    .min(1, 'Add at least one interest')
    .max(10, 'Max 10 interests'),
})

export type ProfileFormData = z.infer<typeof profileSchema>
