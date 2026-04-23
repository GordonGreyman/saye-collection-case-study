import { parseDiscoverFilters } from '../../features/discover/filters'

describe('parseDiscoverFilters', () => {
  test('returns empty arrays when no params are present', () => {
    expect(parseDiscoverFilters({})).toEqual({
      geography: [],
      discipline: [],
      interests: [],
      q: '',
      sort: 'newest',
      page: 1,
    })
  })

  test('handles repeated keys', () => {
    expect(
      parseDiscoverFilters({
        geography: ['Berlin', 'London'],
        discipline: ['Photography'],
        interests: ['Architecture', 'Design'],
        q: 'berlin',
        sort: 'name_asc',
        page: '2',
      })
    ).toEqual({
      geography: ['Berlin', 'London'],
      discipline: ['Photography'],
      interests: ['Architecture', 'Design'],
      q: 'berlin',
      sort: 'name_asc',
      page: 2,
    })
  })

  test('handles comma-separated values and deduplicates', () => {
    expect(
      parseDiscoverFilters({
        geography: 'Berlin,London,Berlin',
        interests: 'Design, Design,Architecture',
      })
    ).toEqual({
      geography: ['Berlin', 'London'],
      discipline: [],
      interests: ['Design', 'Architecture'],
      q: '',
      sort: 'newest',
      page: 1,
    })
  })
})
