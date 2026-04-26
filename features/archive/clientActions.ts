'use client'

import { createClient } from '@/lib/supabase/client'
import {
  isLikelyHttpUrl,
  normalizeHttpUrl,
  sanitizeCanvasBlocks,
  summarizeCanvasBlocks,
} from '@/features/archive/entry'
import type { ArchiveCanvasBlock, ArchiveEntryInput } from '@/lib/types'

type ActionResult = { success: true } | { error: string }

const EDGE_FUNCTION_NAME = 'archive-entry'

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

  return {
    payload: {
      type: summary.primaryType,
      content: JSON.stringify(json),
    },
  }
}

async function invokeArchiveEdge(body: Record<string, unknown>): Promise<ActionResult> {
  const supabase = createClient()
  const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, { body })
  if (error) {
    return { error: error.message }
  }
  if (data?.error) {
    return { error: String(data.error) }
  }
  return { success: true }
}

async function fallbackCreate(payload: { type: string; content: string }): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('archive_items').insert({
    profile_id: user.id,
    ...payload,
  })
  if (error) return { error: error.message }
  return { success: true }
}

async function fallbackUpdate(id: string, payload: { type: string; content: string }): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: item, error: itemError } = await supabase
    .from('archive_items')
    .select('id, profile_id')
    .eq('id', id)
    .maybeSingle()
  if (itemError) return { error: itemError.message }
  if (!item || item.profile_id !== user.id) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('archive_items')
    .update(payload)
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) return { error: error.message }
  if (!data) return { error: 'No archive entry was updated.' }
  return { success: true }
}

async function fallbackDelete(id: string): Promise<ActionResult> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: item, error: itemError } = await supabase
    .from('archive_items')
    .select('id, profile_id')
    .eq('id', id)
    .maybeSingle()
  if (itemError) return { error: itemError.message }
  if (!item || item.profile_id !== user.id) return { error: 'Unauthorized' }

  const { error } = await supabase.from('archive_items').delete().eq('id', id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function addArchiveItemClient(input: ArchiveEntryInput): Promise<ActionResult> {
  const write = toArchiveWritePayload(input)
  if ('error' in write) return { error: write.error! }

  const edgeResult = await invokeArchiveEdge({ action: 'create', payload: write.payload })
  if ('success' in edgeResult) return edgeResult
  return fallbackCreate(write.payload)
}

export async function updateArchiveItemClient(id: string, input: ArchiveEntryInput): Promise<ActionResult> {
  if (!id) return { error: 'Archive item id is required.' }

  const write = toArchiveWritePayload(input)
  if ('error' in write) return { error: write.error! }

  const edgeResult = await invokeArchiveEdge({ action: 'update', id, payload: write.payload })
  if ('success' in edgeResult) return edgeResult
  return fallbackUpdate(id, write.payload)
}

export async function saveThumbPositionClient(
  id: string,
  rawContent: string,
  position: { x: number; y: number },
): Promise<ActionResult> {
  if (!id) return { error: 'Archive item id is required.' }

  let json: Record<string, unknown> = {}
  if (rawContent.startsWith('{')) {
    try { json = JSON.parse(rawContent) as Record<string, unknown> } catch {}
  }
  if (!json._v) return { error: 'Cannot reposition on a legacy item.' }

  json.thumbnailPosition = position

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('archive_items')
    .update({ content: JSON.stringify(json) })
    .eq('id', id)
    .eq('profile_id', user.id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteArchiveItemClient(id: string): Promise<ActionResult> {
  if (!id) return { error: 'Archive item id is required.' }

  const edgeResult = await invokeArchiveEdge({ action: 'delete', id })
  if ('success' in edgeResult) return edgeResult
  return fallbackDelete(id)
}
