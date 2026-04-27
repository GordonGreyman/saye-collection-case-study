import { z } from 'zod'

function normalizeOptionalHttpUrl(value?: string) {
  const trimmed = value?.trim() ?? ''
  if (!trimmed) {
    return undefined
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

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
  website_url: z
    .string()
    .trim()
    .max(200, 'Max 200 characters')
    .optional()
    .or(z.literal(''))
    .transform(value => normalizeOptionalHttpUrl(value))
    .refine(value => {
      if (!value) return true
      try {
        const url = new URL(value)
        return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname)
      } catch {
        return false
      }
    }, 'Enter a valid website URL.'),
  geography: z.string().trim().min(1, 'Required'),
  discipline: z.string().trim().min(1, 'Required'),
  interests: z
    .array(z.string().trim().min(1, 'Interest cannot be empty'))
    .min(1, 'Add at least one interest')
    .max(10, 'Max 10 interests'),
})

export type ProfileFormData = z.infer<typeof profileSchema>
