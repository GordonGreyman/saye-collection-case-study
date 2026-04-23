'use client'

import { createClient } from '@/lib/supabase/client'

const ARCHIVE_BUCKET = 'archive-media'
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export type UploadArchiveResult = { success: true; url: string } | { error: string }

export function validateImageFile(file: File): UploadArchiveResult | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { error: 'Only JPG, PNG, WEBP, and GIF files are supported.' }
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: 'Image must be smaller than 10MB.' }
  }

  return null
}

export function buildArchiveImagePath(userId: string, fileName: string) {
  const extension = fileName.includes('.') ? fileName.split('.').pop() : 'jpg'
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now()
  return `${userId}/${Date.now()}-${random}.${extension}`
}

export async function uploadArchiveImage(file: File, userId: string): Promise<UploadArchiveResult> {
  const validation = validateImageFile(file)
  if (validation) {
    return validation
  }

  const path = buildArchiveImagePath(userId, file.name)
  const supabase = createClient()

  const { error: uploadError } = await supabase.storage.from(ARCHIVE_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  })

  if (uploadError) {
    return { error: uploadError.message }
  }

  const { data } = supabase.storage.from(ARCHIVE_BUCKET).getPublicUrl(path)
  if (!data.publicUrl) {
    return { error: 'Unable to generate image URL.' }
  }

  return { success: true, url: data.publicUrl }
}

export const uploadConfig = {
  bucket: ARCHIVE_BUCKET,
  maxBytes: MAX_UPLOAD_BYTES,
  allowedMimeTypes: ALLOWED_MIME_TYPES,
}
