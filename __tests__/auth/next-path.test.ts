import { sanitizeNextPath } from '@/lib/auth/next-path'

describe('sanitizeNextPath', () => {
  test('uses discover by default', () => {
    expect(sanitizeNextPath(undefined)).toBe('/discover')
    expect(sanitizeNextPath(null)).toBe('/discover')
  })

  test('allows safe internal paths', () => {
    expect(sanitizeNextPath('/build-profile')).toBe('/build-profile')
    expect(sanitizeNextPath('/build-profile?next=1')).toBe('/build-profile?next=1')
  })

  test('blocks absolute and protocol-relative paths', () => {
    expect(sanitizeNextPath('https://example.com')).toBe('/discover')
    expect(sanitizeNextPath('//example.com')).toBe('/discover')
  })
})
