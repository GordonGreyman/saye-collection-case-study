/**
 * @jest-environment node
 */
import { middleware } from '@/middleware'
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}))

const mockCreate = createServerClient as jest.Mock

function req(path: string) {
  return new NextRequest(new URL(`http://localhost${path}`))
}

describe('middleware', () => {
  beforeEach(() => jest.clearAllMocks())

  test('redirects unauthenticated user to /login', async () => {
    mockCreate.mockReturnValue({
      auth: { getUser: async () => ({ data: { user: null } }) },
    })
    const res = await middleware(req('/discover'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })

  test('redirects user with no profile to /build-profile', async () => {
    mockCreate.mockReturnValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
      from: () => ({
        select: () => ({
          eq: () => ({ single: async () => ({ data: null }) }),
        }),
      }),
    })
    const res = await middleware(req('/discover'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/build-profile')
  })

  test('allows user with complete profile to pass through', async () => {
    mockCreate.mockReturnValue({
      auth: { getUser: async () => ({ data: { user: { id: 'u1' } } }) },
      from: () => ({
        select: () => ({
          eq: () => ({ single: async () => ({ data: { id: 'u1' } }) }),
        }),
      }),
    })
    const res = await middleware(req('/discover'))
    expect(res.status).toBe(200)
  })

  test('does not redirect an unauthenticated user already on /login', async () => {
    mockCreate.mockReturnValue({
      auth: { getUser: async () => ({ data: { user: null } }) },
    })
    const res = await middleware(req('/login'))
    expect(res.status).toBe(200)
  })
})
