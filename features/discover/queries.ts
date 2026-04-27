import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'
import { DISCOVER_PAGE_SIZE, type DiscoverFilters } from '@/features/discover/filters'
import { GEOGRAPHY_PRESETS } from '@/lib/constants'
import { getAllMockPersonas, getFilteredMockPersonas } from '@/features/discover/mockPersonas'

// ─── In Focus ─────────────────────────────────────────────────────────────────

export type InFocusEntry = {
  id: string
  display_name: string
  role: string
  geography: string | null
  discipline: string | null
  avatar_url: string | null
  featuredImageUrl: string | null
  featuredWorkTitle: string | null
}

const INFOCUS_GORDON_ID = 'b4e16628-2539-4a44-a3d9-f700b5736709'
const INFOCUS_DEMO_ARTIST_ID = '3ba0792b-f910-4e67-84a6-9500146c89d4'

function extractImageFromContent(content: string): { imageUrl: string; title: string } | null {
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>
    if (parsed._v === 1 && Array.isArray(parsed.blocks)) {
      const blocks = parsed.blocks as Array<{ type: string; content: string }>
      const thumbnail = typeof parsed.thumbnail === 'string' ? parsed.thumbnail : ''
      const imageBlock = blocks.find(b => b.type === 'image')
      const textBlock = blocks.find(b => b.type === 'text')
      const imageUrl = thumbnail || imageBlock?.content || ''
      const title = textBlock?.content?.split('\n')[0] ?? ''
      if (imageUrl) return { imageUrl, title }
    }
  } catch {
    // not canvas JSON
  }
  return null
}

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

async function fetchProfileWithImage(
  supabase: SupabaseClient,
  profileId: string,
): Promise<InFocusEntry | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name, role, geography, discipline, avatar_url')
    .eq('id', profileId)
    .maybeSingle()

  if (!profile) return null

  const { data: archiveItems } = await supabase
    .from('archive_items')
    .select('type, content')
    .eq('profile_id', profileId)
    .eq('type', 'image')
    .order('created_at', { ascending: false })
    .limit(10)

  let featuredImageUrl: string | null = null
  let featuredWorkTitle: string | null = null

  for (const item of archiveItems ?? []) {
    const extracted = extractImageFromContent(item.content)
    if (extracted) {
      featuredImageUrl = extracted.imageUrl
      featuredWorkTitle = extracted.title || null
      break
    }
  }

  return {
    id: profile.id,
    display_name: profile.display_name,
    role: profile.role,
    geography: profile.geography,
    discipline: profile.discipline,
    avatar_url: profile.avatar_url,
    featuredImageUrl,
    featuredWorkTitle,
  }
}

export type InFocusData = {
  artist: InFocusEntry | null
  curator: InFocusEntry | null
  institution: InFocusEntry
}

export async function getInFocusData(): Promise<InFocusData> {
  const supabase = await createClient()

  const [gordonEntry, demoArtistEntry] = await Promise.all([
    fetchProfileWithImage(supabase, INFOCUS_GORDON_ID),
    fetchProfileWithImage(supabase, INFOCUS_DEMO_ARTIST_ID),
  ])

  const institution: InFocusEntry = {
    id: 'demo-institution-riverfront-lab',
    display_name: 'Riverfront Lab',
    role: 'Institution',
    geography: 'London',
    discipline: 'Research',
    avatar_url: null,
    featuredImageUrl: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&auto=format&q=78',
    featuredWorkTitle: 'The building, Bermondsey',
  }

  return { artist: gordonEntry, curator: demoArtistEntry, institution }
}

export type DiscoverProfile = Pick<
  Profile,
  'id' | 'display_name' | 'role' | 'geography' | 'discipline' | 'interests' | 'avatar_url' | 'bio'
>

export type FilterOptions = {
  geographies: string[]
  disciplines: string[]
  interests: string[]
  totalProfiles: number
  newThisWeek: number
}

export type DiscoverProfilesResult = {
  profiles: DiscoverProfile[]
  total: number
}

type ProfileQuery = {
  in: (column: string, values: string[]) => ProfileQuery
  overlaps: (column: string, values: string[]) => ProfileQuery
}

export function applyProfileFilters(query: ProfileQuery, filters: DiscoverFilters) {
  let nextQuery = query

  if (filters.geography.length > 0) {
    nextQuery = nextQuery.in('geography', filters.geography)
  }
  if (filters.discipline.length > 0) {
    nextQuery = nextQuery.in('discipline', filters.discipline)
  }
  if (filters.interests.length > 0) {
    nextQuery = nextQuery.overlaps('interests', filters.interests)
  }

  return nextQuery
}

export async function getProfiles(filters: DiscoverFilters): Promise<DiscoverProfilesResult> {
  const supabase = await createClient()
  const from = (filters.page - 1) * DISCOVER_PAGE_SIZE
  const to = from + DISCOVER_PAGE_SIZE - 1

  let query = supabase
    .from('profiles')
    .select('id, display_name, role, geography, discipline, interests, avatar_url, bio')
    .range(from, to)

  let countQuery = supabase.from('profiles').select('*', { count: 'exact', head: true })

  if (filters.geography.length > 0) {
    query = query.in('geography', filters.geography)
    countQuery = countQuery.in('geography', filters.geography)
  }
  if (filters.discipline.length > 0) {
    query = query.in('discipline', filters.discipline)
    countQuery = countQuery.in('discipline', filters.discipline)
  }
  if (filters.interests.length > 0) {
    query = query.overlaps('interests', filters.interests)
    countQuery = countQuery.overlaps('interests', filters.interests)
  }
  if (filters.q) {
    const safeQuery = filters.q.replace(/,/g, ' ').trim()
    query = query.or(
      `display_name.ilike.%${safeQuery}%,discipline.ilike.%${safeQuery}%,geography.ilike.%${safeQuery}%`
    )
    countQuery = countQuery.or(
      `display_name.ilike.%${safeQuery}%,discipline.ilike.%${safeQuery}%,geography.ilike.%${safeQuery}%`
    )
  }

  if (filters.sort === 'name_asc') {
    query = query.order('display_name', { ascending: true })
  } else if (filters.sort === 'name_desc') {
    query = query.order('display_name', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { count: totalCount } = await countQuery

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  const mockProfiles = getFilteredMockPersonas(filters).map(persona => ({
    id: persona.id,
    display_name: persona.display_name,
    role: persona.role,
    geography: persona.geography,
    discipline: persona.discipline,
    interests: persona.interests,
    avatar_url: null,
    bio: persona.bio,
  }))

  const baseProfiles = (data ?? []) as DiscoverProfile[]
  const profilesWithMocks = filters.page === 1 ? [...baseProfiles, ...mockProfiles] : baseProfiles

  return {
    profiles: profilesWithMocks,
    total: (totalCount ?? 0) + mockProfiles.length,
  }
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const supabase = await createClient()

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count },
    { count: newThisWeek },
    { data: geographiesRaw },
    { data: disciplinesRaw },
    { data: interestsRaw },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo),
    supabase.from('profiles').select('geography').not('geography', 'is', null),
    supabase.from('profiles').select('discipline').not('discipline', 'is', null),
    supabase.from('profiles').select('interests'),
  ])

  const geographies = Array.from(
    new Set([
      ...GEOGRAPHY_PRESETS,
      ...getAllMockPersonas().map(persona => persona.geography).filter((value): value is string => !!value),
      ...(geographiesRaw ?? []).map(row => row.geography).filter((value): value is string => !!value),
    ])
  ).sort((a, b) => a.localeCompare(b))

  const disciplines = Array.from(
    new Set([
      ...getAllMockPersonas().map(persona => persona.discipline).filter((value): value is string => !!value),
      ...(disciplinesRaw ?? []).map(row => row.discipline).filter((value): value is string => !!value),
    ])
  ).sort((a, b) => a.localeCompare(b))

  const interests = Array.from(
    new Set(
      [
        ...getAllMockPersonas().flatMap(persona => persona.interests),
        ...(interestsRaw ?? [])
        .flatMap(row => row.interests ?? [])
          .filter((value): value is string => typeof value === 'string' && value.length > 0),
      ]
    )
  ).sort((a, b) => a.localeCompare(b))

  const mockProfiles = getAllMockPersonas()
  const mockNewThisWeek = mockProfiles.filter(
    persona => new Date(persona.created_at).getTime() >= new Date(oneWeekAgo).getTime()
  ).length

  return {
    geographies,
    disciplines,
    interests,
    totalProfiles: (count ?? 0) + mockProfiles.length,
    newThisWeek: (newThisWeek ?? 0) + mockNewThisWeek,
  }
}
