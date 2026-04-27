export type DiscoverSearchParams = { [key: string]: string | string[] | undefined }

export type DiscoverFilters = {
  geography: string[]
  discipline: string[]
  interests: string[]
  q: string
  sort: DiscoverSort
  page: number
}

export type DiscoverSort = 'newest' | 'name_asc' | 'name_desc'

export const DISCOVER_PAGE_SIZE = 12

function parseFilterValue(value: string | string[] | undefined): string[] {
  const list = Array.isArray(value) ? value : value ? [value] : []
  const normalized = list
    .flatMap(item => item.split(','))
    .map(item => item.trim())
    .filter(Boolean)

  return Array.from(new Set(normalized))
}

function parseSort(value: string | string[] | undefined): DiscoverSort {
  const first = Array.isArray(value) ? value[0] : value
  if (first === 'name_asc' || first === 'name_desc') {
    return first
  }
  return 'newest'
}

function parsePage(value: string | string[] | undefined): number {
  const first = Array.isArray(value) ? value[0] : value
  const parsed = Number.parseInt(first ?? '', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export function parseDiscoverFilters(params: DiscoverSearchParams): DiscoverFilters {
  return {
    geography: parseFilterValue(params.geography),
    discipline: parseFilterValue(params.discipline),
    interests: parseFilterValue(params.interests),
    q: (Array.isArray(params.q) ? params.q[0] : params.q ?? '').trim(),
    sort: parseSort(params.sort),
    page: parsePage(params.page),
  }
}

export function buildDiscoverUrl(filters: DiscoverFilters) {
  const params = new URLSearchParams()

  if (filters.q) {
    params.set('q', filters.q)
  }
  if (filters.sort !== 'newest') {
    params.set('sort', filters.sort)
  }
  if (filters.page > 1) {
    params.set('page', String(filters.page))
  }

  filters.geography.forEach(item => params.append('geography', item))
  filters.discipline.forEach(item => params.append('discipline', item))
  filters.interests.forEach(item => params.append('interests', item))

  const query = params.toString()
  return query ? `/discover?${query}` : '/discover'
}
