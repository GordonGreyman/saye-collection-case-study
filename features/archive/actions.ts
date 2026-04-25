'use server'

import { createClient } from '@/lib/supabase/server'
import type { ArchiveItemType } from '@/lib/types'

type ActionResult = { success: true } | { error: string }

interface AddArchiveInput {
  type: ArchiveItemType
  content: string
}

interface UpdateArchiveInput {
  type: ArchiveItemType
  content: string
}

export async function addArchiveItem(input: AddArchiveInput): Promise<ActionResult> {
  const content = input.content.trim()
  if (!content) {
    return { error: 'Content is required.' }
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
    type: input.type,
    content,
  })

  if (error) {
    return { error: error.message }
  }

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

  return { success: true }
}

export async function updateArchiveItem(id: string, input: UpdateArchiveInput): Promise<ActionResult> {
  if (!id) {
    return { error: 'Archive item id is required.' }
  }

  const content = input.content.trim()
  if (!content) {
    return { error: 'Content is required.' }
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

  const { error } = await supabase
    .from('archive_items')
    .update({
      type: input.type,
      content,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
