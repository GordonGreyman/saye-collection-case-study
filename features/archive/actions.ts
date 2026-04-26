'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  isLikelyHttpUrl,
  normalizeHttpUrl,
  sanitizeCanvasBlocks,
  summarizeCanvasBlocks,
} from '@/features/archive/entry'
import type { ArchiveCanvasBlock, ArchiveEntryInput, ArchiveItem } from '@/lib/types'

type ActionResult = { success: true } | { error: string }

export type RelatedArchiveItem = ArchiveItem & {
  profiles: { display_name: string; role: string } | null
}

function toArchiveWritePayload(input: ArchiveEntryInput) {
  const canvasBlocks: ArchiveCanvasBlock[] = sanitizeCanvasBlocks(input.canvas)

  if (canvasBlocks.length === 0) {
    return { error: 'Add at least one piece of content: text, link, or image.' }
  }

  const summary = summarizeCanvasBlocks(canvasBlocks)
  if (!summary.title && !summary.body && !summary.imageUrl && !summary.referenceUrl) {
    return { error: 'Add at least one piece of content: text, link, or image.' }
  }

  const json: Record<string, unknown> = { _v: 1, blocks: canvasBlocks }
  if (input.thumbnail && isLikelyHttpUrl(normalizeHttpUrl(input.thumbnail))) {
    json.thumbnail = normalizeHttpUrl(input.thumbnail)
  }
  const content = JSON.stringify(json)

  return {
    payload: {
      type: summary.primaryType,
      content,
    },
  }
}

function revalidateArchiveViews(profileId: string) {
  revalidatePath('/', 'layout')
  revalidatePath('/archive')
  revalidatePath('/discover')
  revalidatePath('/profile/[id]', 'page')
  revalidatePath(`/profile/${profileId}`)
}

export async function addArchiveItem(input: ArchiveEntryInput): Promise<ActionResult> {
  const write = toArchiveWritePayload(input)
  if ('error' in write) {
    return { error: write.error! }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase.from('archive_items').insert({
    profile_id: user.id,
    ...write.payload,
  })

  if (error) {
    return { error: error.message }
  }

  revalidateArchiveViews(user.id)
  return { success: true }
}

export async function deleteArchiveItem(id: string): Promise<ActionResult> {
  if (!id) {
    return { error: 'Archive item id is required.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: item, error: itemError } = await supabase
    .from('archive_items')
    .select('id, profile_id')
    .eq('id', id)
    .maybeSingle()

  if (itemError) {
    return { error: itemError.message }
  }

  if (!item || item.profile_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase.from('archive_items').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidateArchiveViews(user.id)
  return { success: true }
}

export async function updateArchiveItem(id: string, input: ArchiveEntryInput): Promise<ActionResult> {
  if (!id) {
    return { error: 'Archive item id is required.' }
  }

  const write = toArchiveWritePayload(input)
  if ('error' in write) {
    return { error: write.error! }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: item, error: itemError } = await supabase
    .from('archive_items')
    .select('id, profile_id')
    .eq('id', id)
    .maybeSingle()

  if (itemError) {
    return { error: itemError.message }
  }

  if (!item || item.profile_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('archive_items')
    .update(write.payload)
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) {
    return { error: error.message }
  }
  if (!data) {
    return { error: 'No archive entry was updated.' }
  }

  revalidateArchiveViews(user.id)
  return { success: true }
}

export async function fetchRelatedItems(
  excludeProfileId: string,
  limit = 6,
): Promise<RelatedArchiveItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('archive_items')
    .select('id, profile_id, type, content, created_at, profiles(display_name, role)')
    .neq('profile_id', excludeProfileId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data as RelatedArchiveItem[] | null) ?? []
}

export async function fetchProfileArchiveItems(
  profileId: string,
  excludeItemId: string,
  limit = 6,
): Promise<RelatedArchiveItem[]> {
  if (!profileId) return []

  const supabase = await createClient()
  let query = supabase
    .from('archive_items')
    .select('id, profile_id, type, content, created_at, profiles(display_name, role)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (excludeItemId) {
    query = query.neq('id', excludeItemId)
  }

  const { data } = await query
  return (data as RelatedArchiveItem[] | null) ?? []
}
