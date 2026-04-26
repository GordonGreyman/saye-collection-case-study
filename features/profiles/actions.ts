'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { PROFILE_BANNER_COLORS } from '@/lib/constants'
import { isLikelyHttpUrl, normalizeHttpUrl } from '@/features/archive/entry'
import { profileSchema, type ProfileFormData } from '@/lib/validators/profile'

export type ActionResult = { success: true } | { error: string }

type ProfileBannerInput = {
  banner_color?: string | null
  banner_image_url?: string | null
  banner_position_x?: number | null
  banner_position_y?: number | null
}

function normalizeBannerPosition(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : null
}

function normalizeBannerColor(value?: string | null) {
  if (!value) return null
  return PROFILE_BANNER_COLORS.some(color => color.value === value) ? value : null
}

function normalizeBannerImageUrl(value?: string | null) {
  if (!value) return null
  const normalized = normalizeHttpUrl(value)
  return isLikelyHttpUrl(normalized) ? normalized : null
}

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

export async function saveProfileBanner(input: ProfileBannerInput): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const imageUrl = normalizeBannerImageUrl(input.banner_image_url)
  const color = imageUrl ? null : normalizeBannerColor(input.banner_color)
  const positionX = imageUrl ? normalizeBannerPosition(input.banner_position_x) ?? 50 : null
  const positionY = imageUrl ? normalizeBannerPosition(input.banner_position_y) ?? 50 : null

  if (input.banner_image_url && !imageUrl) {
    return { error: 'Invalid banner image URL.' }
  }

  if (input.banner_color && !color && !imageUrl) {
    return { error: 'Choose one of the available banner colors.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      banner_color: color,
      banner_image_url: imageUrl,
      banner_position_x: positionX,
      banner_position_y: positionY,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/profile/${user.id}`)
  return { success: true }
}
