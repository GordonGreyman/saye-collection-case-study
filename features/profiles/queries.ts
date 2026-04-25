import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'
import type { DiscoverProfile } from '@/features/discover/queries'

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  return (data as Profile | null) ?? null
}

export async function getSuggestedProfiles(
  profileId: string,
  interests: string[],
  limit = 6,
): Promise<DiscoverProfile[]> {
  const supabase = await createClient()

  const base = supabase
    .from('profiles')
    .select('id, display_name, role, geography, discipline, interests')
    .neq('id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit)

  const query = interests.length > 0
    ? base.overlaps('interests', interests)
    : base

  const { data } = await query
  return (data ?? []) as DiscoverProfile[]
}
