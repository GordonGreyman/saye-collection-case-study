'use client'

import { createClient } from '@/lib/supabase/client'

const AVATAR_BUCKET = 'avatars'
const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export type UploadAvatarResult = { success: true; url: string } | { error: string }

export async function uploadAvatarImage(file: File, userId: string): Promise<UploadAvatarResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Only JPG, PNG, WEBP, and GIF files are supported.' }
  }
  if (file.size > MAX_BYTES) {
    return { error: 'Avatar must be smaller than 2 MB.' }
  }

  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const path = `${userId}/avatar.${ext}`
  const supabase = createClient()

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })

  if (error) return { error: error.message }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  if (!data.publicUrl) return { error: 'Unable to generate avatar URL.' }

  // Cache-bust so the browser picks up the new image immediately
  return { success: true, url: `${data.publicUrl}?t=${Date.now()}` }
}
