import { buildArchiveImagePath, validateImageFile } from '../../features/archive/upload'

describe('archive upload helpers', () => {
  test('rejects unsupported mime types', () => {
    const file = new File(['foo'], 'doc.txt', { type: 'text/plain' })
    expect(validateImageFile(file)).toEqual({
      error: 'Only JPG, PNG, WEBP, and GIF files are supported.',
    })
  })

  test('rejects files larger than 10MB', () => {
    const large = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'photo.jpg', {
      type: 'image/jpeg',
    })
    expect(validateImageFile(large)).toEqual({ error: 'Image must be smaller than 10MB.' })
  })

  test('builds a path inside the user folder', () => {
    const path = buildArchiveImagePath('user-1', 'image.png')
    expect(path.startsWith('user-1/')).toBe(true)
    expect(path.endsWith('.png')).toBe(true)
  })
})
