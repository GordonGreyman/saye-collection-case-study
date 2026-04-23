import { applyProfileFilters } from '../../features/discover/queries'

describe('applyProfileFilters', () => {
  test('applies only enabled filters', () => {
    const inMock = jest.fn()
    const overlapsMock = jest.fn()

    const query = {
      in: inMock.mockReturnThis(),
      overlaps: overlapsMock.mockReturnThis(),
    }

    applyProfileFilters(query, {
      geography: ['Berlin'],
      discipline: [],
      interests: ['Architecture'],
      q: '',
      sort: 'newest',
      page: 1,
    })

    expect(inMock).toHaveBeenCalledWith('geography', ['Berlin'])
    expect(overlapsMock).toHaveBeenCalledWith('interests', ['Architecture'])
    expect(inMock).toHaveBeenCalledTimes(1)
  })
})
