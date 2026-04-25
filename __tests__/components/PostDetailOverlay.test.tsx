import { render, screen, fireEvent } from '@testing-library/react'
import { PostDetailOverlay } from '@/features/archive/PostDetailOverlay'
import type { ArchiveItem } from '@/lib/types'

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const textItem: ArchiveItem = {
  id: '1',
  profile_id: 'p1',
  type: 'text',
  content: 'Hello from the archive.',
  created_at: '2026-01-15T00:00:00Z',
}

const imageItem: ArchiveItem = {
  id: '2',
  profile_id: 'p1',
  type: 'image',
  content: 'https://example.com/photo.jpg',
  created_at: '2026-01-16T00:00:00Z',
}

const linkItem: ArchiveItem = {
  id: '3',
  profile_id: 'p1',
  type: 'link',
  content: 'https://example.com',
  created_at: '2026-01-17T00:00:00Z',
}

const items = [textItem, imageItem, linkItem]

describe('PostDetailOverlay', () => {
  test('renders text content in full', () => {
    render(<PostDetailOverlay item={textItem} items={items} onClose={jest.fn()} />)
    expect(screen.getByText('Hello from the archive.')).toBeInTheDocument()
  })

  test('renders image element for image type', () => {
    render(<PostDetailOverlay item={imageItem} items={items} onClose={jest.fn()} />)
    const img = screen.getByAltText('Archive item')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  test('renders Open Link button for link type', () => {
    render(<PostDetailOverlay item={linkItem} items={items} onClose={jest.fn()} />)
    expect(screen.getByText('OPEN LINK')).toBeInTheDocument()
  })

  test('calls onClose when Escape key is pressed', () => {
    const onClose = jest.fn()
    render(<PostDetailOverlay item={textItem} items={items} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('navigates to next item on ArrowRight', () => {
    render(<PostDetailOverlay item={textItem} items={items} onClose={jest.fn()} />)
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    const img = screen.getByAltText('Archive item')
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
  })

  test('navigates to previous item on ArrowLeft and wraps around', () => {
    render(<PostDetailOverlay item={textItem} items={items} onClose={jest.fn()} />)
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    expect(screen.getByText('OPEN LINK')).toBeInTheDocument()
  })

  test('shows prev/next arrows when multiple items', () => {
    render(<PostDetailOverlay item={textItem} items={items} onClose={jest.fn()} />)
    expect(screen.getByLabelText('Previous item')).toBeInTheDocument()
    expect(screen.getByLabelText('Next item')).toBeInTheDocument()
  })

  test('hides prev/next arrows when single item', () => {
    render(<PostDetailOverlay item={textItem} items={[textItem]} onClose={jest.fn()} />)
    expect(screen.queryByLabelText('Previous item')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Next item')).not.toBeInTheDocument()
  })
})
