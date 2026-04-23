import { createClient } from '@/lib/supabase/server'
import type { ArchiveItem, Profile } from '@/lib/types'

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
