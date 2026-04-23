import { profileSchema } from '@/lib/validators/profile'

const valid = {
  role: 'Artist' as const,
  display_name: 'Kaan Edre',
  bio: 'Photographer based in Istanbul',
  geography: 'Istanbul',
  discipline: 'Photography',
  interests: ['Architecture', 'Street'],
}

describe('profileSchema', () => {
  test('accepts a valid profile', () => {
    expect(profileSchema.safeParse(valid).success).toBe(true)
  })

  test('rejects missing role', () => {
    const result = profileSchema.safeParse({ ...valid, role: undefined })
    expect(result.success).toBe(false)
  })

  test('rejects invalid role', () => {
    const result = profileSchema.safeParse({ ...valid, role: 'Fan' })
    expect(result.success).toBe(false)
  })

  test('rejects display_name shorter than 2 chars', () => {
    const result = profileSchema.safeParse({ ...valid, display_name: 'K' })
    expect(result.success).toBe(false)
  })

  test('rejects display_name longer than 50 chars', () => {
    const result = profileSchema.safeParse({ ...valid, display_name: 'K'.repeat(51) })
    expect(result.success).toBe(false)
  })

  test('rejects empty interests array', () => {
    const result = profileSchema.safeParse({ ...valid, interests: [] })
    expect(result.success).toBe(false)
  })

  test('rejects more than 10 interests', () => {
    const result = profileSchema.safeParse({
      ...valid,
      interests: Array(11).fill('tag'),
    })
    expect(result.success).toBe(false)
  })

  test('bio is optional', () => {
    const { bio, ...withoutBio } = valid
    expect(profileSchema.safeParse(withoutBio).success).toBe(true)
  })
})
