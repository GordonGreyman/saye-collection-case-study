import type { DiscoverFilters } from '@/features/discover/filters'
import type { Profile } from '@/lib/types'

export type MockDiscoverPersona = Pick<
  Profile,
  'id' | 'display_name' | 'role' | 'geography' | 'discipline' | 'interests' | 'bio' | 'created_at'
>

const MOCK_DISCOVER_PERSONAS: MockDiscoverPersona[] = [
  {
    id: 'demo-artist-lyra-santos',
    display_name: 'Lyra Santos',
    role: 'Artist',
    geography: 'São Paulo',
    discipline: 'Photography',
    interests: ['Documentary', 'Research', 'Publishing'],
    bio: 'Photographer and visual storyteller exploring migration, memory, and public space.',
    created_at: '2026-04-23T09:00:00.000Z',
  },
  {
    id: 'demo-artist-noah-braun',
    display_name: 'Noah Braun',
    role: 'Artist',
    geography: 'Berlin',
    discipline: 'Installation',
    interests: ['Sound', 'Performance', 'Collaboration'],
    bio: 'Installation artist working with sound and responsive light environments.',
    created_at: '2026-04-22T12:30:00.000Z',
  },
  {
    id: 'demo-artist-amina-yusuf',
    display_name: 'Amina Yusuf',
    role: 'Artist',
    geography: 'Lagos',
    discipline: 'Digital Art',
    interests: ['Fashion', 'Film', 'Publishing'],
    bio: 'Digital artist blending editorial aesthetics with Afrofuturist narratives.',
    created_at: '2026-04-21T15:00:00.000Z',
  },
  {
    id: 'demo-artist-elio-marin',
    display_name: 'Elio Marin',
    role: 'Artist',
    geography: 'Mexico City',
    discipline: 'Ceramics',
    interests: ['Craft', 'Research', 'Residency'],
    bio: 'Ceramic artist focused on material memory and indigenous firing techniques.',
    created_at: '2026-04-20T08:15:00.000Z',
  },
  {
    id: 'demo-curator-sofia-riedel',
    display_name: 'Sofia Riedel',
    role: 'Curator',
    geography: 'Amsterdam',
    discipline: 'Education',
    interests: ['Research', 'Publishing', 'Collaboration'],
    bio: 'Curator developing cross-city learning programs around lens-based media.',
    created_at: '2026-04-24T10:45:00.000Z',
  },
  {
    id: 'demo-curator-haruto-kim',
    display_name: 'Haruto Kim',
    role: 'Curator',
    geography: 'Seoul',
    discipline: 'Photography',
    interests: ['Exhibition', 'Research', 'Film'],
    bio: 'Curator of experimental photo exhibitions with focus on urban archives.',
    created_at: '2026-04-22T18:10:00.000Z',
  },
  {
    id: 'demo-curator-zara-haddad',
    display_name: 'Zara Haddad',
    role: 'Curator',
    geography: 'Cairo',
    discipline: 'Education',
    interests: ['Ceramics', 'Craft', 'Publication'],
    bio: 'Independent curator connecting contemporary craft with pedagogical formats.',
    created_at: '2026-04-19T09:20:00.000Z',
  },
  {
    id: 'demo-curator-miles-owens',
    display_name: 'Miles Owens',
    role: 'Curator',
    geography: 'New York',
    discipline: 'Film',
    interests: ['Film', 'Digital Art', 'Performance'],
    bio: 'Curator and writer shaping interdisciplinary moving-image programs.',
    created_at: '2026-04-18T11:55:00.000Z',
  },
  {
    id: 'demo-institution-riverfront-lab',
    display_name: 'Riverfront Lab',
    role: 'Institution',
    geography: 'London',
    discipline: 'Research',
    interests: ['Residency', 'Publishing', 'Education'],
    bio: 'Nonprofit lab hosting artist residencies and publishing practice-led research.',
    created_at: '2026-04-24T13:25:00.000Z',
  },
  {
    id: 'demo-institution-atlas-program',
    display_name: 'Atlas Program',
    role: 'Institution',
    geography: 'Paris',
    discipline: 'Fashion',
    interests: ['Fashion', 'Digital Art', 'Collaboration'],
    bio: 'Institution supporting hybrid practices across design, fashion, and digital media.',
    created_at: '2026-04-21T16:40:00.000Z',
  },
  {
    id: 'demo-institution-tidehouse',
    display_name: 'Tidehouse Contemporary',
    role: 'Institution',
    geography: 'Tokyo',
    discipline: 'Installation',
    interests: ['Installation', 'Performance', 'Research'],
    bio: 'Contemporary space for immersive installation and performance commissions.',
    created_at: '2026-04-20T10:00:00.000Z',
  },
  {
    id: 'demo-institution-open-courtyard',
    display_name: 'Open Courtyard',
    role: 'Institution',
    geography: 'Nairobi',
    discipline: 'Education',
    interests: ['Education', 'Craft', 'Community'],
    bio: 'Community-led institution building artist support through education and craft.',
    created_at: '2026-04-18T14:10:00.000Z',
  },
]

function includesQuery(persona: MockDiscoverPersona, q: string) {
  if (!q) {
    return true
  }
  const normalized = q.toLowerCase()
  return (
    persona.display_name.toLowerCase().includes(normalized) ||
    (persona.discipline ?? '').toLowerCase().includes(normalized) ||
    (persona.geography ?? '').toLowerCase().includes(normalized) ||
    persona.role.toLowerCase().includes(normalized) ||
    persona.interests.some(interest => interest.toLowerCase().includes(normalized))
  )
}

export function getFilteredMockPersonas(filters: DiscoverFilters): MockDiscoverPersona[] {
  const filtered = MOCK_DISCOVER_PERSONAS.filter(persona => {
    if (filters.geography.length > 0 && !filters.geography.includes(persona.geography ?? '')) {
      return false
    }
    if (filters.discipline.length > 0 && !filters.discipline.includes(persona.discipline ?? '')) {
      return false
    }
    if (
      filters.interests.length > 0 &&
      !filters.interests.some(interest => persona.interests.includes(interest))
    ) {
      return false
    }

    return includesQuery(persona, filters.q.trim())
  })

  if (filters.sort === 'name_asc') {
    return filtered.sort((a, b) => a.display_name.localeCompare(b.display_name))
  }
  if (filters.sort === 'name_desc') {
    return filtered.sort((a, b) => b.display_name.localeCompare(a.display_name))
  }

  return filtered.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function getAllMockPersonas(): MockDiscoverPersona[] {
  return [...MOCK_DISCOVER_PERSONAS]
}

export function getMockPersonaById(id: string): MockDiscoverPersona | null {
  return MOCK_DISCOVER_PERSONAS.find(persona => persona.id === id) ?? null
}

export function getSuggestedMockPersonas(
  currentId: string,
  interests: string[],
  limit = 6,
): Pick<Profile, 'id' | 'display_name' | 'role' | 'geography' | 'discipline' | 'interests'>[] {
  const candidates = MOCK_DISCOVER_PERSONAS.filter(persona => persona.id !== currentId)

  const ranked = candidates
    .map(persona => ({
      persona,
      overlap: interests.length
        ? interests.filter(interest => persona.interests.includes(interest)).length
        : 0,
    }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, limit)
    .map(({ persona }) => ({
      id: persona.id,
      display_name: persona.display_name,
      role: persona.role,
      geography: persona.geography,
      discipline: persona.discipline,
      interests: persona.interests,
    }))

  return ranked
}
