# Post Detail Overlay & Interaction Polish — Design Spec
**Date:** 2026-04-25  
**Scope:** Behavioral/interaction only — no visual, color, typography, or layout changes to existing UI.

---

## 1. Overview

A full interaction quality pass for SAYE Collective covering:
1. Post detail overlay (archive cards become expandable)
2. Hover affordances & cursor polish
3. Discover & profile UX improvements
4. Image URL upload bug fix
5. Archive skeleton loading state
6. Keyboard navigation

---

## 2. Post Detail Overlay

### Goal
Clicking any archive card (image, text, or link) opens a full-content overlay on top of the current page. No URL change, no routing.

### State
- `selectedItem: ArchiveItemType | null` held by the nearest parent that renders the list:
  - `ArchiveGrid` (standalone archive page)
  - `ArchiveScreen2` in `screens.jsx` (archive screen)
  - `ProfileScreen2` in `screens.jsx` (profile work tab)
- The full filtered items array is also passed to the overlay for prev/next navigation.

### Component: `features/archive/PostDetailOverlay.tsx`
**Props:**
```ts
interface PostDetailOverlayProps {
  item: ArchiveItemType
  items: ArchiveItemType[]
  onClose: () => void
}
```

**Behavior:**
- Renders via a fixed full-screen backdrop (`rgba(8,8,8,0.88)`, `backdropFilter: blur(12px)`)
- Content card centered, `max-width: 720px`, using existing `T.surf` / `T.line` tokens
- Framer Motion: `AnimatePresence` wrapping, `initial={{ opacity: 0, scale: 0.96 }}` → `animate={{ opacity: 1, scale: 1 }}`, `exit={{ opacity: 0, scale: 0.96 }}`
- Backdrop click → `onClose()`
- Close button (X, top-right of card) → `onClose()`
- Body scroll locked (`document.body.style.overflow = 'hidden'`) while mounted; restored on unmount
- Prev/Next arrows (Lucide `ChevronLeft` / `ChevronRight`) visible only when `items.length > 1`; wrap around

**Content by type:**
- `image` — full image (`object-contain`, max height 70vh), title + author + date below
- `text` — full text (no truncation), author + date below
- `link` — domain label, full URL, prominent "Open Link →" button (replaces the card-level tab-open behavior)

### Card onClick changes
- `ArchiveCard2` in `ui.jsx`: remove the `window.open` on link type; all three types call an `onExpand` prop instead
- `ArchiveItem` in `ArchiveItem.tsx`: add `onClick` prop wired to `onExpand`
- Both components: `cursor: pointer` already set; no change needed there

---

## 3. Hover Affordances & Cursor Polish

### ArchiveCard2 — expand hint
- On hover, a faint "Expand" label (DM Mono, 10px, `T.faint` color) fades in at bottom-right of every card
- Implemented as an absolutely-positioned `<span>` with `opacity: 0 → 1` transition tied to the existing `h` hover state
- No layout change — positioned over existing padding area

### DiscoverCard2 — view profile hint
- On hover, a "View profile →" label (Space Grotesk, 12px, `T.muted` color) fades in in the card body below the tags row
- Tied to existing `h` hover state; `opacity: 0 → 1` transition

### ⌘K search focus
- In `DiscoverScreen2`, attach a `ref` to the search `<input>`
- `useEffect` registers a `window` keydown listener: `(e.metaKey || e.ctrlKey) && e.key === 'k'` → `e.preventDefault(); inputRef.current.focus()`
- Listener removed on unmount
- The `⌘K` hint already rendered in the search bar UI makes this a completion of an existing promise

---

## 4. Discover & Profile UX

### Filter chip pulse (DiscoverScreen2)
- Wrap `Chip2` chip selection in a Framer Motion `motion.div` with `whileTap={{ scale: 1.06 }}` spring — one-line addition per chip in the FilterCol render
- No visual style change; purely a tactile press response

### Results grid re-animation on filter change
- Add a `key` prop to the results grid `<div>` in `DiscoverScreen2`, computed as the JSON fingerprint of active filters: `key={JSON.stringify([geo, disc, int_, roleFilter])}`
- When filters change and the component re-mounts, the existing `fadeUp` stagger animations fire again
- No new animation code needed

### Profile connections tab (`features/profiles/ProfileContent.tsx`)
- Replace the hardcoded "CONNECTIONS COMING SOON" block with a real data fetch
- New query: `getSuggestedProfiles(profileId: string, interests: string[], limit = 6): Promise<DiscoverProfile[]>`
  - Fetches profiles from `profiles` table where `interests && interests_array @> ANY(...)` (at least one shared interest), excluding `profileId`, ordered by `created_at DESC`, limit 6
  - Lives in `features/profiles/queries.ts` (alongside existing profile queries)
- Renders using existing `ProfileCard` component (already used in Discover)
- Fallback: if no matches, render "No connections yet — Discover profiles →" nudge (same copy style as existing empty states)
- `ProfileContent` becomes async to support the server-side fetch, receiving `suggestedProfiles` as a prop from the page

---

## 5. Image URL Upload Bug Fix

### Root cause
`ArchiveCard2` guards image rendering with `/^https?:\/\//i.test(content)`. If a user enters a URL without a protocol (e.g. `example.com/image.jpg`), the guard fails silently and no image renders. Additionally, there is no `isLikelyHttpUrl` validation on the image URL input (unlike the link type which validates before saving).

### Fix (in `ProfileScreen2` / `AddBlockPanel` composer)
1. When `addType === 'image'` and no file is selected, apply `isLikelyHttpUrl(content)` check before saving — same pattern already used for link type
2. If the URL is missing protocol, auto-prepend `https://` before the check: `const normalized = /^https?:\/\//i.test(content) ? content : 'https://' + content`
3. Save `normalized` instead of raw `content`
4. If still invalid after normalization, show inline error: `"Add a valid image URL (e.g. https://example.com/image.jpg)"`

---

## 6. Archive Skeleton Loading (`app/(main)/archive/loading.tsx`)

- New file mirroring the archive grid layout: 3-column grid of 6 placeholder cards
- Card placeholders use `T.surf` background (`#141414`) with a `shimmer` CSS animation
- Add `@keyframes shimmer` to `app/globals.css`:
  ```css
  @keyframes shimmer {
    0%   { opacity: 0.4; }
    50%  { opacity: 0.7; }
    100% { opacity: 0.4; }
  }
  ```
- Brings Archive to parity with Discover and Profile which already have `loading.tsx`

---

## 7. Keyboard Navigation (PostDetailOverlay)

- Single `useEffect` inside `PostDetailOverlay` registers `window` keydown on mount, removes on unmount
- Bindings:
  - `Escape` → `onClose()`
  - `ArrowLeft` → go to previous item (wraps: if at index 0, go to `items.length - 1`)
  - `ArrowRight` → go to next item (wraps: if at last, go to index 0)
- Navigation updates a local `currentIndex` state derived from `items.findIndex(i => i.id === item.id)` on open

---

## 8. File Map

### New files
| Path | Purpose |
|------|---------|
| `features/archive/PostDetailOverlay.tsx` | Overlay component |
| `app/(main)/archive/loading.tsx` | Skeleton loading state |
| (queries addition in `features/profiles/queries.ts`) | `getSuggestedProfiles` |

### Modified files
| Path | Change |
|------|--------|
| `features/handoff/ui.jsx` | `ArchiveCard2`: `onExpand` prop, expand hint; `DiscoverCard2`: view profile hint |
| `features/handoff/screens.jsx` | `ArchiveScreen2`, `ProfileScreen2`: overlay state; image URL fix; filter pulse; grid key |
| `features/archive/ArchiveGrid.tsx` | Overlay state + open handler |
| `features/archive/ArchiveItem.tsx` | `onClick`/`onExpand` handler |
| `features/profiles/ProfileContent.tsx` | Connections tab unlocked |
| `app/(main)/profile/[id]/page.tsx` | Pass `suggestedProfiles` prop |
| `app/globals.css` | `@keyframes shimmer` |

---

## 9. Out of Scope
- URL routing / deep-linking for overlay (explicitly excluded)
- Any color, typography, spacing, or layout changes to existing components
- Connections feature beyond suggested profiles (messaging, follow, etc.)
- Mobile-specific gesture handling (swipe to close/navigate)
