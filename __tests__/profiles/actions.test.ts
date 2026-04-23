import { upsertProfile } from '../../features/profiles/actions'
import { createClient } from '../../lib/supabase/server'

jest.mock('../../lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockCreateClient = createClient as jest.Mock

const validPayload = {
  role: 'Artist' as const,
  display_name: 'Aylin Saye',
  bio: 'Photographer',
  geography: 'Berlin',
  discipline: 'Photography',
  interests: ['Architecture'],
}

describe('upsertProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns unauthorized when no authenticated user', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: null } }),
      },
    })

    const result = await upsertProfile(validPayload)
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  test('returns db error when upsert fails', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: { id: 'u1' } } }),
      },
      from: () => ({
        upsert: async () => ({ error: { message: 'DB failed' } }),
      }),
    })

    const result = await upsertProfile(validPayload)
    expect(result).toEqual({ error: 'DB failed' })
  })

  test('returns success when upsert succeeds', async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null })

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: { id: 'u1' } } }),
      },
      from: () => ({
        upsert,
      }),
    })

    const result = await upsertProfile(validPayload)

    expect(result).toEqual({ success: true })
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'u1',
        role: 'Artist',
        display_name: 'Aylin Saye',
      }),
      { onConflict: 'id' }
    )
  })
})
