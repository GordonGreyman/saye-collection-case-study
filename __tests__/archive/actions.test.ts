import { addArchiveItem, deleteArchiveItem } from '../../features/archive/actions'
import { createClient } from '../../lib/supabase/server'

jest.mock('../../lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

const mockCreateClient = createClient as jest.Mock

describe('archive actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('addArchiveItem returns unauthorized without user', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: null } }),
      },
    })

    const result = await addArchiveItem({ type: 'text', content: 'Hello' })
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  test('addArchiveItem saves with authenticated user id', async () => {
    const insert = jest.fn().mockResolvedValue({ error: null })

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: { id: 'u1' } } }),
      },
      from: () => ({
        insert,
      }),
    })

    const result = await addArchiveItem({ type: 'text', content: '  Hello  ' })
    expect(result).toEqual({ success: true })
    expect(insert).toHaveBeenCalledWith({
      profile_id: 'u1',
      type: 'text',
      content: 'Hello',
    })
  })

  test('deleteArchiveItem blocks non-owner deletion', async () => {
    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: { id: 'u1' } } }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { id: 'a1', profile_id: 'other-user' },
              error: null,
            }),
          }),
        }),
      }),
    })

    const result = await deleteArchiveItem('a1')
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  test('deleteArchiveItem removes owned item', async () => {
    const deleteEq = jest.fn().mockResolvedValue({ error: null })
    const from = jest.fn((table: string) => {
      if (table === 'archive_items') {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { id: 'a1', profile_id: 'u1' },
                error: null,
              }),
            }),
          }),
          delete: () => ({
            eq: deleteEq,
          }),
        }
      }

      return {}
    })

    mockCreateClient.mockResolvedValue({
      auth: {
        getUser: async () => ({ data: { user: { id: 'u1' } } }),
      },
      from,
    })

    const result = await deleteArchiveItem('a1')
    expect(result).toEqual({ success: true })
    expect(deleteEq).toHaveBeenCalledWith('id', 'a1')
  })
})
