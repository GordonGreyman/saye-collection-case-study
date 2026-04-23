import { deleteAccountWithCleanup } from '../../features/auth/account-lifecycle'
import type { AdminClient } from '../../features/auth/account-lifecycle'

describe('deleteAccountWithCleanup', () => {
  test('deletes storage objects and then deletes user', async () => {
    const remove = jest.fn().mockResolvedValue({ error: null })
    const list = jest
      .fn()
      .mockResolvedValue({ data: [{ name: 'one.jpg' }, { name: 'two.jpg' }], error: null })
    const deleteUser = jest.fn().mockResolvedValue({ error: null })

    const client = {
      storage: {
        from: () => ({ list, remove }),
      },
      auth: {
        admin: { deleteUser },
      },
    }

    const result = await deleteAccountWithCleanup(client as unknown as AdminClient, 'u1')

    expect(result).toEqual({ success: true })
    expect(list).toHaveBeenCalledWith('u1', { limit: 1000, offset: 0 })
    expect(remove).toHaveBeenCalledWith(['u1/one.jpg', 'u1/two.jpg'])
    expect(deleteUser).toHaveBeenCalledWith('u1')
  })

  test('returns error when listing storage fails', async () => {
    const list = jest.fn().mockResolvedValue({ data: null, error: { message: 'list failed' } })
    const deleteUser = jest.fn().mockResolvedValue({ error: null })

    const client = {
      storage: {
        from: () => ({ list, remove: jest.fn() }),
      },
      auth: {
        admin: { deleteUser },
      },
    }

    const result = await deleteAccountWithCleanup(client as unknown as AdminClient, 'u1')

    expect(result).toEqual({ error: 'list failed' })
    expect(deleteUser).not.toHaveBeenCalled()
  })

  test('returns error when delete user fails', async () => {
    const deleteUser = jest.fn().mockResolvedValue({ error: { message: 'delete failed' } })

    const client = {
      storage: {
        from: () => ({
          list: jest.fn().mockResolvedValue({ data: [], error: null }),
          remove: jest.fn().mockResolvedValue({ error: null }),
        }),
      },
      auth: {
        admin: { deleteUser },
      },
    }

    const result = await deleteAccountWithCleanup(client as unknown as AdminClient, 'u1')
    expect(result).toEqual({ error: 'delete failed' })
  })
})
