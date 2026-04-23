'use server'

import { createClient } from '@/lib/supabase/server'
import { profileSchema, type ProfileFormData } from '@/lib/validators/profile'

export type ActionResult = { success: true } | { error: string }

export async function upsertProfile(input: ProfileFormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid profile data.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const payload = parsed.data
  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      role: payload.role,
      display_name: payload.display_name,
      bio: payload.bio ?? null,
      geography: payload.geography,
      discipline: payload.discipline,
      interests: payload.interests,
    },
    { onConflict: 'id' }
  )

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
