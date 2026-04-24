import { createClient } from '@/lib/supabase/server'
import type { ArchiveItem, ArchiveItemType, Profile } from '@/lib/types'

export type ArchiveItemWithProfile = ArchiveItem & {
  profiles: { display_name: string; role: string } | null
}

export async function getAllArchiveItems(type?: string): Promise<ArchiveItemWithProfile[]> {
  const supabase = await createClient()
  let query = supabase
    .from('archive_items')
    .select('id, profile_id, type, content, created_at, profiles(display_name, role)')
    .order('created_at', { ascending: false })
    .limit(60)

  if (type && type !== 'all') {
    query = query.eq('type', type as ArchiveItemType)
  }

  const { data } = await query
  return (data as ArchiveItemWithProfile[] | null) ?? []
}

export async function getProfile(id: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  return (data as Profile | null) ?? null
}

export async function getArchiveItems(profileId: string): Promise<ArchiveItem[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('archive_items')
    .select('id, profile_id, type, content, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  return (data as ArchiveItem[] | null) ?? []
}
