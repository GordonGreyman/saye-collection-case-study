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

export async function areProfilesConnected(viewerProfileId: string | null | undefined, profileId: string) {
  if (!viewerProfileId || !profileId || viewerProfileId === profileId) {
    return false
  }

  const [profileAId, profileBId] = [viewerProfileId, profileId].sort()
  const supabase = await createClient()
  const { data } = await supabase
    .from('profile_connections')
    .select('id')
    .eq('profile_a_id', profileAId)
    .eq('profile_b_id', profileBId)
    .maybeSingle()

  return Boolean(data)
}

export async function getConnectedProfiles(profileId: string): Promise<DiscoverProfile[]> {
  if (!profileId) return []

  const supabase = await createClient()
  const { data: connections } = await supabase
    .from('profile_connections')
    .select('profile_a_id, profile_b_id')
    .or(`profile_a_id.eq.${profileId},profile_b_id.eq.${profileId}`)
    .order('created_at', { ascending: false })

  const connectedIds = (connections ?? [])
    .map(row => (row.profile_a_id === profileId ? row.profile_b_id : row.profile_a_id))
    .filter((value): value is string => typeof value === 'string' && value.length > 0)

  if (connectedIds.length === 0) {
    return []
  }

  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, role, geography, discipline, interests')
    .in('id', connectedIds)

  return (data ?? []) as DiscoverProfile[]
}
