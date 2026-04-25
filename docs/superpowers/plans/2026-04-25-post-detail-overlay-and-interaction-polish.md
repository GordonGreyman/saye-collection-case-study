# Post Detail Overlay & Interaction Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen post detail overlay to archive cards, polish hover affordances across the platform, fix image URL upload rendering, and unlock the connections tab with real suggested profiles.

**Architecture:** All changes are purely behavioral/additive — no visual, color, or layout changes to existing components. The overlay uses client-side React state (no URL routing). `AnimatePresence` lives in each parent that renders the overlay; `PostDetailOverlay` uses `motion.div` for enter/exit. The `getSuggestedProfiles` query follows the exact same Supabase pattern as `getProfiles` in `features/discover/queries.ts`.

**Tech Stack:** Next.js App Router, React, TypeScript, Framer Motion (already installed), Lucide React (already installed), Supabase JS v2, Jest + React Testing Library

> **Note (AGENTS.md):** Before writing any code, read `node_modules/next/dist/docs/` for any APIs you are unsure about. The installed Next.js version may differ from training data.

---

## File Map

| Status | Path | Purpose |
|--------|------|---------|
| **Create** | `features/archive/PostDetailOverlay.tsx` | Full-screen overlay component |
| **Create** | `app/(main)/archive/loading.tsx` | Skeleton loading state for archive page |
| **Create** | `__tests__/components/PostDetailOverlay.test.tsx` | Tests for overlay |
| **Modify** | `app/globals.css` | Add `@keyframes shimmer` |
| **Modify** | `features/archive/ArchiveItem.tsx` | Add `onExpand` prop + stopPropagation on delete |
| **Modify** | `features/archive/ArchiveGrid.tsx` | Hold overlay state, render PostDetailOverlay |
| **Modify** | `features/handoff/ui.jsx` | `ArchiveCard2`: `onExpand` prop + expand hint; `DiscoverCard2`: view profile hint |
| **Modify** | `features/handoff/screens.jsx` | Overlay state in `ArchiveScreen2` + `ProfileScreen2`; image URL fix; ⌘K; filter pulse; grid key; connections tab |
| **Modify** | `features/profiles/queries.ts` | Add `getSuggestedProfiles` |
| **Modify** | `app/(main)/profile/[id]/page.tsx` | Fetch + pass `suggestedProfiles` |

---

## Task 1: Add shimmer keyframe + archive loading skeleton

**Files:**
- Modify: `app/globals.css`
- Create: `app/(main)/archive/loading.tsx`

- [ ] **Step 1: Add shimmer keyframe to globals.css**

Open `app/globals.css`. After the existing `@keyframes fadeUp` block (ends around line 69), add:

```css
@keyframes shimmer {
  0%   { opacity: 0.4; }
  50%  { opacity: 0.7; }
  100% { opacity: 0.4; }
}
```

- [ ] **Step 2: Create archive loading skeleton**

Create `app/(main)/archive/loading.tsx`:

```tsx
export default function ArchiveLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#080808', padding: '88px 48px 80px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{
          width: 80, height: 10, background: '#141414', borderRadius: 2,
          marginBottom: 14, animation: 'shimmer 1.4s ease-in-out infinite',
        }} />
        <div style={{
          width: 340, height: 52, background: '#141414', borderRadius: 2,
          animation: 'shimmer 1.4s ease-in-out infinite', animationDelay: '0.1s',
        }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: '#141414', borderRadius: 4, height: 200,
              animation: 'shimmer 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.08}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css app/(main)/archive/loading.tsx
git commit -m "feat: add shimmer keyframe and archive loading skeleton"
```

---

## Task 2: Create PostDetailOverlay component + tests

**Files:**
- Create: `features/archive/PostDetailOverlay.tsx`
- Create: `__tests__/components/PostDetailOverlay.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/PostDetailOverlay.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/components/PostDetailOverlay.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/features/archive/PostDetailOverlay'`

- [ ] **Step 3: Create PostDetailOverlay**

Create `features/archive/PostDetailOverlay.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import type { ArchiveItem } from '@/lib/types'

interface PostDetailOverlayProps {
  item: ArchiveItem
  items: ArchiveItem[]
  onClose: () => void
}

const T = {
  surf: '#141414',
  line: 'rgba(255,255,255,0.07)',
  text: '#f2f2f2',
  muted: '#555',
  artist: '#9b7ff8',
  artistDim: 'rgba(155,127,248,0.12)',
}

export function PostDetailOverlay({ item: initialItem, items, onClose }: PostDetailOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState(
    () => Math.max(0, items.findIndex(i => i.id === initialItem.id))
  )

  const item = items[currentIndex] ?? initialItem

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft')
        setCurrentIndex(i => (i - 1 + items.length) % items.length)
      if (e.key === 'ArrowRight')
        setCurrentIndex(i => (i + 1) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, items.length])

  const createdAt = (() => {
    const d = new Date(item.created_at)
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString()
  })()

  const domain = item.type === 'link' ? (() => {
    try { return new URL(item.content).hostname } catch { return item.content }
  })() : ''

  const linkHref = item.type === 'link'
    ? (/^https?:\/\//i.test(item.content) ? item.content : `https://${item.content}`)
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
        style={{
          background: T.surf,
          border: `1px solid ${T.line}`,
          borderRadius: 6,
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14, zIndex: 10,
            background: 'rgba(8,8,8,0.7)', border: `1px solid ${T.line}`,
            borderRadius: '50%', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: T.muted,
          }}
        >
          <X size={14} />
        </button>

        {/* IMAGE */}
        {item.type === 'image' && (
          <div>
            {/^https?:\/\//i.test(item.content) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.content}
                alt="Archive item"
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }}
              />
            )}
            {createdAt && (
              <div style={{ padding: '16px 24px', borderTop: `1px solid ${T.line}` }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: T.muted }}>{createdAt}</p>
              </div>
            )}
          </div>
        )}

        {/* TEXT */}
        {item.type === 'text' && (
          <div style={{ padding: '40px 36px' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 8,
              letterSpacing: '0.12em', color: T.artist, marginBottom: 20,
            }}>TEXT</div>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: 16, color: '#ddd',
              lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: '0 0 24px',
            }}>{item.content}</p>
            {createdAt && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: T.muted }}>{createdAt}</p>
            )}
          </div>
        )}

        {/* LINK */}
        {item.type === 'link' && (
          <div style={{ padding: '40px 36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.artist }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                letterSpacing: '0.1em', color: T.artist,
              }}>LINK</span>
              {domain && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  color: T.muted, marginLeft: 'auto',
                }}>{domain}</span>
              )}
            </div>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: 14, color: '#aaa',
              wordBreak: 'break-all', marginBottom: 24, lineHeight: 1.5,
            }}>{item.content}</p>
            {linkHref && (
              <a
                href={linkHref}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  letterSpacing: '0.1em', color: T.artist, textDecoration: 'none',
                  padding: '8px 16px',
                  border: `1px solid rgba(155,127,248,0.25)`,
                  borderRadius: 2,
                }}
              >
                <ExternalLink size={11} />
                OPEN LINK
              </a>
            )}
            {createdAt && (
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: T.muted, marginTop: 24,
              }}>{createdAt}</p>
            )}
          </div>
        )}
      </motion.div>

      {/* Prev / Next */}
      {items.length > 1 && (
        <>
          <button
            aria-label="Previous item"
            onClick={e => {
              e.stopPropagation()
              setCurrentIndex(i => (i - 1 + items.length) % items.length)
            }}
            style={{
              position: 'fixed', left: 20, top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(20,20,20,0.85)',
              border: `1px solid ${T.line}`,
              borderRadius: '50%', width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#aaa',
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next item"
            onClick={e => {
              e.stopPropagation()
              setCurrentIndex(i => (i + 1) % items.length)
            }}
            style={{
              position: 'fixed', right: 20, top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(20,20,20,0.85)',
              border: `1px solid ${T.line}`,
              borderRadius: '50%', width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#aaa',
            }}
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}
    </motion.div>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/components/PostDetailOverlay.test.tsx --no-coverage
```

Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add features/archive/PostDetailOverlay.tsx __tests__/components/PostDetailOverlay.test.tsx
git commit -m "feat: add PostDetailOverlay component with keyboard navigation"
```

---

## Task 3: Wire ArchiveItem.tsx to support onExpand

**Files:**
- Modify: `features/archive/ArchiveItem.tsx`

- [ ] **Step 1: Add onExpand prop and wire up click/stopPropagation**

Replace the full contents of `features/archive/ArchiveItem.tsx` with:

```tsx
/* eslint-disable @next/next/no-img-element */
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/ToastProvider'
import { deleteArchiveItem } from '@/features/archive/actions'
import type { ArchiveItem as ArchiveItemType } from '@/lib/types'

interface ArchiveItemProps {
  item: ArchiveItemType
  isOwner: boolean
  onExpand?: () => void
}

export function ArchiveItem({ item, isOwner, onExpand }: ArchiveItemProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const createdAt = useMemo(() => {
    const date = new Date(item.created_at)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString()
  }, [item.created_at])

  const domain = useMemo(() => {
    if (item.type !== 'link') return ''
    try { return new URL(item.content).hostname } catch { return item.content }
  }, [item.content, item.type])

  const onDelete = async () => {
    setDeleting(true)
    setError('')
    const result = await deleteArchiveItem(item.id)
    setDeleting(false)
    if ('error' in result) {
      setError(result.error)
      showToast(result.error, 'error')
      return
    }
    setConfirming(false)
    showToast('Archive item deleted.', 'success')
    router.refresh()
  }

  return (
    <div
      className="relative"
      onClick={onExpand}
      style={{ cursor: onExpand ? 'pointer' : undefined }}
    >
      {isOwner && !confirming && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setConfirming(true) }}
          className="absolute right-2 top-2 z-10 bg-black/40 p-1.5 rounded-full text-text-muted hover:text-white"
          aria-label="Delete archive item"
        >
          <Trash2 size={14} />
        </button>
      )}

      {isOwner && confirming && (
        <div
          className="absolute right-2 top-2 z-10 flex items-center gap-2 bg-black/60 rounded-full px-2 py-1 text-xs"
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="text-red-400 hover:text-red-300"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => { setConfirming(false); setError('') }}
            className="text-text-muted hover:text-white"
          >
            Cancel
          </button>
        </div>
      )}

      {item.type === 'image' && (
        <img
          src={item.content}
          alt="Archive item"
          className="w-full rounded-xl object-cover max-h-96 border border-white/10"
        />
      )}

      {item.type === 'text' && (
        <Card>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.12em', color: '#9b7ff8', marginBottom: 8 }}>TEXT</div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 14, color: '#ddd', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{item.content}</p>
          {createdAt && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2a2a2a', marginTop: 12 }}>{createdAt}</p>
          )}
        </Card>
      )}

      {item.type === 'link' && (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '12px 18px', background: 'rgba(155,127,248,0.04)',
            borderBottom: '1px solid rgba(155,127,248,0.09)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9b7ff8', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: '#9b7ff8' }}>LINK</span>
            {domain && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#333', marginLeft: 'auto' }}>{domain} →</span>
            )}
          </div>
          <div style={{ padding: '14px 18px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#9b7ff8', wordBreak: 'break-all' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, lineHeight: 1.4 }}>{item.content}</span>
            </span>
            {createdAt && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#2a2a2a', marginTop: 10 }}>{createdAt}</p>
            )}
          </div>
        </Card>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}
```

> **Note:** The `<a href>` on the link card is replaced with a `<span>` — link opening is now handled exclusively inside `PostDetailOverlay`.

- [ ] **Step 2: Commit**

```bash
git add features/archive/ArchiveItem.tsx
git commit -m "feat: add onExpand prop to ArchiveItem, move link open to overlay"
```

---

## Task 4: Wire ArchiveGrid.tsx with overlay state

**Files:**
- Modify: `features/archive/ArchiveGrid.tsx`

- [ ] **Step 1: Add overlay state and AnimatePresence wrapper**

Replace the full contents of `features/archive/ArchiveGrid.tsx` with:

```tsx
'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AddBlockPanel } from '@/features/archive/AddBlockPanel'
import { ArchiveItem } from '@/features/archive/ArchiveItem'
import { PostDetailOverlay } from '@/features/archive/PostDetailOverlay'
import type { ArchiveItem as ArchiveItemType } from '@/lib/types'

interface ArchiveGridProps {
  items: ArchiveItemType[]
  isOwner: boolean
  profileId: string
}

export function ArchiveGrid({ items, isOwner, profileId }: ArchiveGridProps) {
  const [selectedItem, setSelectedItem] = useState<ArchiveItemType | null>(null)

  if (items.length === 0) {
    return (
      <section className="mt-8">
        {isOwner ? (
          <div className="text-center py-10">
            <h2 className="text-3xl font-heading text-text-primary">Your archive is empty.</h2>
            <p className="text-text-muted mt-2 mb-5">Add your first piece.</p>
            <div className="max-w-xl mx-auto">
              <AddBlockPanel profileId={profileId} isOwner defaultOpen />
            </div>
          </div>
        ) : (
          <p className="text-text-muted text-center py-14">Nothing here yet.</p>
        )}
      </section>
    )
  }

  return (
    <section className="mt-8">
      <AddBlockPanel profileId={profileId} isOwner={isOwner} />
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="break-inside-avoid mb-4">
            <ArchiveItem
              item={item}
              isOwner={isOwner}
              onExpand={() => setSelectedItem(item)}
            />
          </div>
        ))}
      </div>
      <AnimatePresence>
        {selectedItem && (
          <PostDetailOverlay
            key={selectedItem.id}
            item={selectedItem}
            items={items}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add features/archive/ArchiveGrid.tsx
git commit -m "feat: wire ArchiveGrid with PostDetailOverlay state"
```

---

## Task 5: Update ArchiveCard2 in ui.jsx — onExpand prop + expand hint

**Files:**
- Modify: `features/handoff/ui.jsx` (ArchiveCard2 function only)

- [ ] **Step 1: Update ArchiveCard2**

Find the `ArchiveCard2` function in `features/handoff/ui.jsx` (starts at line 315). Replace the entire function with:

```jsx
export function ArchiveCard2({ type, title, content, author, authorRole, date, link, hint, span, tall, itemId, isOwner, onDelete, onExpand }) {
  const [h, setH] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const r = ROLE_CONFIG[authorRole] || ROLE_CONFIG.Artist;

  return (
    <div
      onClick={() => onExpand?.()}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        background: T.surf, border: `1px solid ${h ? T.lineB : T.line}`,
        borderRadius: 4, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.18s', transform: h ? 'translateY(-2px)' : 'none',
        boxShadow: h ? '0 10px 36px rgba(0,0,0,0.45)' : 'none',
        display: 'flex', flexDirection: 'column', height: '100%', position: 'relative',
      }}>

      {/* Expand hint */}
      <div style={{
        position: 'absolute', bottom: 10, right: 12, zIndex: 2,
        fontFamily: "'DM Mono',monospace", fontSize: 10, color: T.faint,
        letterSpacing: '0.06em', pointerEvents: 'none',
        opacity: h ? 1 : 0, transition: 'opacity 0.15s',
      }}>expand ↗</div>

      {isOwner && itemId && (
        <div
          onClick={e => e.stopPropagation()}
          style={{ position: 'absolute', top: 10, right: 10, zIndex: 3, display: 'flex', gap: 8, alignItems: 'center' }}>
          {confirming && (
            <button
              onClick={() => { onDelete?.(itemId); setConfirming(false); }}
              style={{ background: '#2a0808', border: '1px solid rgba(248,113,113,0.35)', color: '#f87171', borderRadius: 3, padding: '5px 9px', cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: 10 }}>
              Delete
            </button>
          )}
          <button
            onClick={() => setConfirming(v => !v)}
            style={{ background: 'rgba(8,8,8,0.8)', border: `1px solid ${T.lineB}`, color: T.muted, borderRadius: 3, padding: '5px 9px', cursor: 'pointer', fontFamily: "'DM Mono',monospace", fontSize: 10 }}>
            {confirming ? 'Cancel' : 'Remove'}
          </button>
        </div>
      )}

      {/* IMAGE CARD */}
      {type === 'image' && (
        <div style={{ flex: 1, minHeight: tall ? 320 : 220, background: `linear-gradient(160deg, #18082e 0%, #0a0a14 100%)`, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          {content && /^https?:\/\//i.test(content) && (
            <img src={content} alt={title || 'Archive item'} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />
          )}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id={`stripe-${title.slice(0,4)}`} width="20" height="20" patternTransform="rotate(45)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="20" stroke="white" strokeWidth="1"/></pattern></defs>
            <rect width="100%" height="100%" fill={`url(#stripe-${title.slice(0,4)})`}/>
          </svg>
          {hint && <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: "'DM Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>{hint}</div>}
          <div style={{ padding: '0 20px 20px', background: 'linear-gradient(to top, rgba(8,8,8,0.92) 0%, transparent 100%)', paddingTop: 48 }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: span ? 22 : 17, color: T.text, lineHeight: 1.25, marginBottom: 8 }}>{title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: T.muted }}>{author}</span>
              {authorRole && <RoleBadge role={authorRole} size={11} />}
            </div>
          </div>
        </div>
      )}

      {/* TEXT CARD */}
      {type === 'text' && (
        <div style={{ flex: 1, padding: '24px 24px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 800, fontSize: 72, lineHeight: 0.7, color: T.artist, opacity: 0.18, marginBottom: 20, userSelect: 'none' }}>"</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.text, lineHeight: 1.45, marginBottom: 12, flex: 1 }}>{title}</div>
          {content && <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: T.muted, lineHeight: 1.65, marginBottom: 16 }}>{content}</div>}
          <RuleLine margin="0 0 14px" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: T.muted }}>{author}</span>
              {authorRole && <RoleBadge role={authorRole} size={11} />}
            </div>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: T.faint }}>{date}</span>
          </div>
        </div>
      )}

      {/* LINK CARD */}
      {type === 'link' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${T.line}`, background: T.bg2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.artist, flexShrink: 0 }} />
              <Label size={12} color={T.artist}>{link || 'External Link'}</Label>
            </div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.text, lineHeight: 1.35 }}>{title}</div>
          </div>
          <div style={{ padding: '14px 24px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {content && <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 14 }}>{content}</div>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: T.muted }}>{author}</span>
                {authorRole && <RoleBadge role={authorRole} size={11} />}
              </div>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: T.faint }}>{date}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add features/handoff/ui.jsx
git commit -m "feat: add onExpand prop and expand hint to ArchiveCard2"
```

---

## Task 6: Update DiscoverCard2 in ui.jsx — view profile hint

**Files:**
- Modify: `features/handoff/ui.jsx` (DiscoverCard2 function only)

- [ ] **Step 1: Update DiscoverCard2 body to add hover label**

Find the `DiscoverCard2` function body section (lines around 302–309 — the `<div style={{ padding: '16px 18px 18px' }}>` block). Replace it with:

```jsx
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 16, color: T.text, marginBottom: 4 }}>{name}</div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, color: T.muted, marginBottom: 14 }}>{discipline} · {location}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {tags.slice(0,3).map(t => <span key={t} style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: T.faint, padding: '2px 7px', border: `1px solid ${T.line}`, borderRadius: 2 }}>#{t}</span>)}
        </div>
        <div style={{
          marginTop: 12,
          fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: T.muted,
          opacity: h ? 1 : 0, transition: 'opacity 0.15s',
        }}>
          View profile →
        </div>
      </div>
```

- [ ] **Step 2: Commit**

```bash
git add features/handoff/ui.jsx
git commit -m "feat: add view profile hover hint to DiscoverCard2"
```

---

## Task 7: Wire overlay state in ArchiveScreen2 and ProfileScreen2, add ⌘K

**Files:**
- Modify: `features/handoff/screens.jsx`

This task has three sub-changes in `screens.jsx`. Make them in order.

### 7a — ArchiveScreen2 overlay

- [ ] **Step 1: Add imports at top of screens.jsx**

After the existing imports at the top of `features/handoff/screens.jsx`, add:

```jsx
import { AnimatePresence, motion } from 'framer-motion'
import { PostDetailOverlay } from '@/features/archive/PostDetailOverlay'
```

- [ ] **Step 2: Add overlay state to ArchiveScreen2**

Inside `ArchiveScreen2`, after the existing `const [typeFilter, setTypeFilter]` line, add:

```jsx
const [selectedItem, setSelectedItem] = React.useState(null);
```

- [ ] **Step 3: Wire onExpand on ArchiveCard2 inside ArchiveScreen2**

Find the `<ArchiveCard2 {...p} itemId={p.id} />` line inside `ArchiveScreen2`'s filtered grid. Replace it with:

```jsx
<ArchiveCard2
  {...p}
  itemId={p.id}
  onExpand={() => {
    const raw = items.find(i => i.id === p.id)
    if (raw) setSelectedItem(raw)
  }}
/>
```

- [ ] **Step 4: Render overlay at bottom of ArchiveScreen2's return**

Inside `ArchiveScreen2`, just before the closing `</div>` of the outermost return div, add:

```jsx
      <AnimatePresence>
        {selectedItem && (
          <PostDetailOverlay
            key={selectedItem.id}
            item={selectedItem}
            items={items.filter(i => typeFilter === 'all' || i.type === typeFilter)}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
```

### 7b — ProfileScreen2 overlay

- [ ] **Step 5: Add overlay state to ProfileScreen2**

Inside `ProfileScreen2`, after the `const [archiveError, setArchiveError]` line, add:

```jsx
const [selectedArchiveItem, setSelectedArchiveItem] = React.useState(null);
```

- [ ] **Step 6: Wire onExpand on ArchiveCard2 inside ProfileScreen2's work tab**

Find the `<ArchiveCard2 {...w} itemId={w.id} isOwner={isOwner} onDelete={removeArchiveItem} />` line inside `ProfileScreen2`. Replace with:

```jsx
<ArchiveCard2
  {...w}
  itemId={w.id}
  isOwner={isOwner}
  onDelete={removeArchiveItem}
  onExpand={() => {
    const raw = archiveItems.find(i => i.id === w.id)
    if (raw) setSelectedArchiveItem(raw)
  }}
/>
```

- [ ] **Step 7: Render overlay at bottom of ProfileScreen2's work tab content**

Find the closing `</>` of the `{tab==='work' && (<> ... </>)}` block. Just before that closing `</>`, add:

```jsx
          <AnimatePresence>
            {selectedArchiveItem && (
              <PostDetailOverlay
                key={selectedArchiveItem.id}
                item={selectedArchiveItem}
                items={archiveItems}
                onClose={() => setSelectedArchiveItem(null)}
              />
            )}
          </AnimatePresence>
```

### 7c — ⌘K search focus

- [ ] **Step 8: Add search input ref and keyboard listener to DiscoverScreen2**

Inside `DiscoverScreen2`, after the existing `const [filterSearch, setFilterSearch]` line, add:

```jsx
const searchInputRef = React.useRef(null);
```

Then add a new `useEffect` after the existing two `useEffect` blocks:

```jsx
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
```

- [ ] **Step 9: Attach ref to the search input in DiscoverScreen2**

Find the search `<input>` in `DiscoverScreen2` (the one with `placeholder="Search by name, discipline, keyword…"`). Add `ref={searchInputRef}` to it:

```jsx
        <input
          ref={searchInputRef}
          placeholder="Search by name, discipline, keyword…"
          value={search} onChange={e => setSearch(e.target.value)}
          onFocus={() => setSearchFoc(true)} onBlur={() => setSearchFoc(false)}
          style={{ ... }} />
```

- [ ] **Step 10: Commit**

```bash
git add features/handoff/screens.jsx
git commit -m "feat: wire overlay in ArchiveScreen2 and ProfileScreen2, add cmd+K search focus"
```

---

## Task 8: Fix image URL upload in screens.jsx

**Files:**
- Modify: `features/handoff/screens.jsx` (submitArchiveItem function in ProfileScreen2)

- [ ] **Step 1: Add URL normalization before saving image type**

In `ProfileScreen2`, find the `submitArchiveItem` async function. Find this existing block:

```jsx
    if (addType === 'image' && !selectedFile && !hasUsefulContent(content)) {
      setArchiveError('Add an image URL or choose an image file before saving.')
      setSavingArchive(false)
      return
    }
```

Immediately after that block (before the `if (addType === 'link' && !isLikelyHttpUrl(content))` check), add:

```jsx
    if (addType === 'image' && !selectedFile && hasUsefulContent(content)) {
      const normalized = /^https?:\/\//i.test(content) ? content : `https://${content}`
      if (!isLikelyHttpUrl(normalized)) {
        setArchiveError('Add a valid image URL (e.g. https://example.com/image.jpg)')
        setSavingArchive(false)
        return
      }
      content = normalized
    }
```

- [ ] **Step 2: Commit**

```bash
git add features/handoff/screens.jsx
git commit -m "fix: normalize and validate image URL before saving to archive"
```

---

## Task 9: Add Discover filter chip pulse + grid re-animation key

**Files:**
- Modify: `features/handoff/screens.jsx` (DiscoverScreen2 — FilterCol and results grid)

- [ ] **Step 1: Add whileTap pulse to FilterCol chips**

In `DiscoverScreen2`, inside the `FilterCol` component (the inner function), find:

```jsx
          {visible.map(c => <Chip2 key={c} label={c} active={active.includes(c)} onClick={() => tog(active, filterKey, c)} />)}
```

Replace with (framer-motion is already imported from Task 7):

```jsx
          {visible.map(c => (
            <motion.div key={c} whileTap={{ scale: 1.06 }} style={{ display: 'inline-flex' }}>
              <Chip2 label={c} active={active.includes(c)} onClick={() => tog(active, filterKey, c)} />
            </motion.div>
          ))}
```

- [ ] **Step 2: Add key to results grid for re-animation on filter change**

In `DiscoverScreen2`, find the results grid `<div>`:

```jsx
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
```

Add a `key` prop:

```jsx
        <div
          key={JSON.stringify([geo, disc, int_, roleFilter])}
          style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
```

- [ ] **Step 3: Commit**

```bash
git add features/handoff/screens.jsx
git commit -m "feat: add filter chip tap pulse and grid re-animation on filter change"
```

---

## Task 10: Add getSuggestedProfiles query

**Files:**
- Modify: `features/profiles/queries.ts`

- [ ] **Step 1: Add getSuggestedProfiles**

Open `features/profiles/queries.ts`. After the existing `getProfileById` function, add:

```ts
import type { DiscoverProfile } from '@/features/discover/queries'

export async function getSuggestedProfiles(
  profileId: string,
  interests: string[],
  limit = 6,
): Promise<DiscoverProfile[]> {
  const supabase = await createClient()

  const base = supabase
    .from('profiles')
    .select('id, display_name, role, geography, discipline, interests')
    .neq('id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit)

  const query = interests.length > 0
    ? base.overlaps('interests', interests)
    : base

  const { data } = await query
  return (data ?? []) as DiscoverProfile[]
}
```

The full `features/profiles/queries.ts` should now look like:

```ts
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'
import type { DiscoverProfile } from '@/features/discover/queries'

export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  return (data as Profile | null) ?? null
}

export async function getSuggestedProfiles(
  profileId: string,
  interests: string[],
  limit = 6,
): Promise<DiscoverProfile[]> {
  const supabase = await createClient()

  const base = supabase
    .from('profiles')
    .select('id, display_name, role, geography, discipline, interests')
    .neq('id', profileId)
    .order('created_at', { ascending: false })
    .limit(limit)

  const query = interests.length > 0
    ? base.overlaps('interests', interests)
    : base

  const { data } = await query
  return (data ?? []) as DiscoverProfile[]
}
```

- [ ] **Step 2: Commit**

```bash
git add features/profiles/queries.ts
git commit -m "feat: add getSuggestedProfiles query"
```

---

## Task 11: Unlock connections tab in ProfileScreen2 + pass from page

**Files:**
- Modify: `features/handoff/screens.jsx` (ProfileScreen2 connections tab)
- Modify: `app/(main)/profile/[id]/page.tsx`

- [ ] **Step 1: Accept suggestedProfiles prop in ProfileScreen2**

In `screens.jsx`, find the `ProfileScreen2` function signature:

```jsx
export function ProfileScreen2({ navigate, profile = null, archiveItems = [], isOwner = false, viewerIsAuthenticated = false }) {
```

Replace with:

```jsx
export function ProfileScreen2({ navigate, profile = null, archiveItems = [], isOwner = false, viewerIsAuthenticated = false, suggestedProfiles = [] }) {
```

- [ ] **Step 2: Replace the connections tab content**

Inside `ProfileScreen2`, find the `{tab==='connections' && (` block:

```jsx
        {tab==='connections' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:14 }}>
            {connectionSuggestions.map((p, i) => (
              <div key={p.name} style={{ animation: 'fadeUp 0.35s ease both', animationDelay: `${i * 65}ms` }}>
                <DiscoverCard2 {...p} onClick={() => {}} />
              </div>
            ))}
          </div>
        )}
```

Replace with:

```jsx
        {tab==='connections' && (() => {
          const toShow = suggestedProfiles.length ? suggestedProfiles : connectionSuggestions
          if (toShow.length === 0) {
            return (
              <div style={{ padding:'72px 0', textAlign:'center', borderTop:`1px solid ${T.line}` }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:32, color:T.faint, marginBottom:20 }}>∅</div>
                <Label size={13} color={T.muted}>No connections yet</Label>
                <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, color:T.muted, marginTop:10, lineHeight:1.6 }}>
                  Discover profiles to find people with similar interests.
                </p>
                <button onClick={() => navigate('discover')}
                  style={{ marginTop:20, background:'none', border:`1px solid ${T.line}`, borderRadius:3, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:T.muted, padding:'8px 20px', transition:'all 0.15s' }}>
                  Discover profiles →
                </button>
              </div>
            )
          }
          return (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:14 }}>
              {toShow.map((p, i) => (
                <div key={p.id || p.name} style={{ animation: 'fadeUp 0.35s ease both', animationDelay: `${i * 65}ms` }}>
                  <DiscoverCard2
                    name={p.display_name || p.name}
                    role={p.role}
                    discipline={p.discipline || 'Unspecified'}
                    location={p.geography || 'Global'}
                    tags={p.interests?.length ? p.interests.slice(0,3) : p.tags || []}
                    onClick={() => p.id ? router.push(`/profile/${p.id}`) : {}}
                  />
                </div>
              ))}
            </div>
          )
        })()}
```

- [ ] **Step 3: Fetch suggestedProfiles in the profile page**

Open `app/(main)/profile/[id]/page.tsx`. Add the import:

```tsx
import { getSuggestedProfiles } from '@/features/profiles/queries'
```

Replace the `Promise.all` block:

```tsx
  const [profile, archiveItems, userResult, navState] = await Promise.all([
    getProfile(id),
    getArchiveItems(id),
    supabase.auth.getUser(),
    getHandoffNavState(),
  ])
```

with:

```tsx
  const [profile, archiveItems, userResult, navState] = await Promise.all([
    getProfile(id),
    getArchiveItems(id),
    supabase.auth.getUser(),
    getHandoffNavState(),
  ])
```

Then, after the `const isOwner = ...` and `const viewerIsAuthenticated = ...` lines (before the return), add:

```tsx
  const suggestedProfiles = profile
    ? await getSuggestedProfiles(profile.id, profile.interests ?? [])
    : []
```

Update the `screenProps` in the final `return` to include it:

```tsx
      screenProps={{
        profile,
        archiveItems,
        isOwner,
        viewerIsAuthenticated,
        suggestedProfiles,
      }}
```

Also update the demo profile `screenProps` (the `if (id === 'demo')` branch) to include `suggestedProfiles: []`:

```tsx
          screenProps={{
            profile: null,
            archiveItems: [],
            isOwner: false,
            viewerIsAuthenticated: Boolean(userResult.data.user),
            suggestedProfiles: [],
          }}
```

- [ ] **Step 4: Commit**

```bash
git add features/handoff/screens.jsx app/(main)/profile/[id]/page.tsx
git commit -m "feat: unlock connections tab with real suggested profiles"
```

---

## Task 12: Run all tests + final check

- [ ] **Step 1: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: All tests pass (existing Button + ui-smoke tests, plus new PostDetailOverlay tests).

- [ ] **Step 2: Check TypeScript**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Start dev server and verify manually**

```bash
npm run dev
```

Check:
1. Navigate to `/archive` — skeleton appears while loading
2. Click any archive card — overlay opens with correct content
3. Press ESC — overlay closes
4. Press ArrowRight / ArrowLeft — cycles through items
5. Click prev/next arrow buttons — same as above
6. Click backdrop — closes overlay
7. Navigate to `/discover` — press ⌘K / Ctrl+K — search input focuses
8. Select a filter chip — feel the tap pulse
9. Change filters — grid fades up again (stagger re-fires)
10. Hover any discover card — "View profile →" fades in
11. Hover any archive card — "expand ↗" fades in
12. On a profile page: add an image via URL — image should render in archive
13. Navigate to a profile's Connections tab — shows suggested profiles (or empty state)
