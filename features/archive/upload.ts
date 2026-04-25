'use client'

import { createClient } from '@/lib/supabase/client'

const DEFAULT_ARCHIVE_BUCKET = 'archive-media'
const ARCHIVE_BUCKET = process.env.NEXT_PUBLIC_ARCHIVE_BUCKET || DEFAULT_ARCHIVE_BUCKET
const ARCHIVE_BUCKET_FALLBACKS = ['archive-media', 'archive', 'archive_images']
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
  const bucketCandidates = Array.from(new Set([ARCHIVE_BUCKET, ...ARCHIVE_BUCKET_FALLBACKS]))

  for (const bucket of bucketCandidates) {
    const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
      upsert: false,
      contentType: file.type,
    })

    if (!uploadError) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      if (!data.publicUrl) {
        return { error: 'Unable to generate image URL.' }
      }
      return { success: true, url: data.publicUrl }
    }

    const message = uploadError.message || ''
    const isMissingBucket = /bucket.*not.*found/i.test(message)
    if (!isMissingBucket) {
      return { error: message }
    }
  }

  return {
    error:
      'Image upload is not configured. Create a Supabase storage bucket named "archive-media" (or set NEXT_PUBLIC_ARCHIVE_BUCKET in .env.local).',
  }
}

export const uploadConfig = {
  bucket: ARCHIVE_BUCKET,
  fallbackBuckets: ARCHIVE_BUCKET_FALLBACKS,
  maxBytes: MAX_UPLOAD_BYTES,
  allowedMimeTypes: ALLOWED_MIME_TYPES,
}
