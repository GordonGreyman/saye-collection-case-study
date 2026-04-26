import { saveProfileBanner, upsertProfile } from '../../features/profiles/actions'
import { createClient } from '../../lib/supabase/server'

jest.mock('../../lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
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

describe('saveProfileBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('returns unauthorized when no authenticated user', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: null } }),
      },
    })

    const result = await saveProfileBanner({ banner_color: '#9b7ff8' })
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  test('saves an allowed color banner', async () => {
    const update = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: { id: 'u1' } } }),
      },
      from: () => ({ update }),
    })

    const result = await saveProfileBanner({ banner_color: '#9b7ff8' })

    expect(result).toEqual({ success: true })
    expect(update).toHaveBeenCalledWith({
      banner_color: '#9b7ff8',
      banner_image_url: null,
      banner_position_x: null,
      banner_position_y: null,
    })
  })

  test('saves an image banner with clamped position', async () => {
    const update = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    })

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: { id: 'u1' } } }),
      },
      from: () => ({ update }),
    })

    const result = await saveProfileBanner({
      banner_image_url: 'example.com/banner.jpg',
      banner_position_x: 120,
      banner_position_y: -10,
    })

    expect(result).toEqual({ success: true })
    expect(update).toHaveBeenCalledWith({
      banner_color: null,
      banner_image_url: 'https://example.com/banner.jpg',
      banner_position_x: 100,
      banner_position_y: 0,
    })
  })
})
