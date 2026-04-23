/**
 * @jest-environment node
 */
import { proxy } from '@/proxy'
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}))

const mockCreate = createServerClient as jest.Mock

function req(path: string) {
  return new NextRequest(new URL(`http://localhost${path}`))
}

describe('proxy', () => {
  beforeEach(() => jest.clearAllMocks())

  test('allows public discover access when unauthenticated', async () => {
    mockCreate.mockReturnValue({
      auth: { getUser: async () => ({ data: { user: null } }) },
    })
    const res = await proxy(req('/discover'))
    expect(res.status).toBe(200)
  })

  test('allows public profile access when unauthenticated', async () => {
    mockCreate.mockReturnValue({
      auth: { getUser: async () => ({ data: { user: null } }) },
    })
    const res = await proxy(req('/profile/u1'))
    expect(res.status).toBe(200)
  })

  test('redirects unauthenticated user on build-profile to login with next', async () => {
    mockCreate.mockReturnValue({
      auth: { getUser: async () => ({ data: { user: null } }) },
    })
    const res = await proxy(req('/build-profile?from=cta'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login?next=%2Fbuild-profile%3Ffrom%3Dcta')
  })

  test('redirects authenticated user from login to discover', async () => {
    mockCreate.mockReturnValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
    })
    const res = await proxy(req('/login'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/discover')
  })

  test('allows authenticated user to access build-profile', async () => {
    mockCreate.mockReturnValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
    })
    const res = await proxy(req('/build-profile'))
    expect(res.status).toBe(200)
  })
})
