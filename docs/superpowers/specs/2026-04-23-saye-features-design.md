# Saye Collective — Features Design Spec
**Date:** 2026-04-23
**Scope:** All three pillars — Onboarding + Build Profile, Triple-Filter Discover, Public Profile + Archive — plus auth flow update and cleanup.

---

## 1. Overview

The foundation (auth, middleware, DB schema, UI components, Supabase helpers) is complete. This spec covers everything that remains to make Saye a fully functional, publishable prototype: a modern browse-first auth flow, a 5-screen artsy onboarding wizard, a server-rendered triple-filter discovery engine, and a public profile with a masonry archive grid.

---

## 2. Auth Flow Update

### Problem with current implementation
The middleware currently redirects all unauthenticated users to `/login` — a hard login wall. Research (Nielsen Norman Group, Behance/Dribbble patterns) confirms this is the worst-performing UX pattern for community discovery platforms. Users are asked for commitment before seeing any value.

### Updated pattern: Browse First, Auth on Intent

| Route | Unauthenticated | Authenticated (no profile) | Authenticated (has profile) |
|---|---|---|---|
| `/discover` | ✅ Public | ✅ Public | ✅ Public |
| `/profile/[id]` | ✅ Public | ✅ Public | ✅ Public |
| `/login` | ✅ Public | → `/discover` | → `/discover` |
| `/build-profile` | → `/login?next=/build-profile` | ✅ Allowed | ✅ Allowed (edit mode) |
| `/auth/*` | ✅ Always allowed | ✅ Always allowed | ✅ Always allowed |

### Middleware logic (updated)
```
1. Always allow: /login, /auth/*, static assets
2. If authenticated + on /login → redirect /discover
3. If unauthenticated + route requires auth (/build-profile) → redirect /login?next=[path]
4. Otherwise → pass through (public routes accessible without session)
```

### Nav update
- Unauthenticated: "SAYE" logo + Discover link + **"Join Saye"** ghost Button (top-right)
- Authenticated: "SAYE" logo + Discover link + Profile link (top-right)
- "Join Saye" links to `/login`

---

## 3. Pillar 1 — Onboarding + Build Profile

### Wizard architecture
`BuildProfileWizard` is a `'use client'` component managing 5 screens via local `step` state. A single `useForm` instance (React Hook Form) lives at the wizard level — all fields registered once, steps render field subsets. `defaultValues` prop accepts an existing `Profile` for edit mode (Server Component fetches and passes it).

Draft auto-save: on every step transition, wizard state is written to `localStorage` under key `saye_profile_draft`. On mount, wizard rehydrates from draft if present. Draft is cleared on successful `upsertProfile()` submit.

### Screen 0 — Welcome
Full-screen entry. "SAYE" in `text-6xl font-heading tracking-widest`, tagline: *"A discovery engine for artists, curators, and institutions."* in `text-text-muted`. Single CTA: `Button` "Build Your Identity →". Framer Motion `fade-up` entry (`opacity: 0→1, y: 24→0`). No progress indicator on this screen.

### Screen 1 — Role (Step 1/3)
Contextual copy: *"Your role shapes how others find you."*
Three full-width stacked `RoleCard` components:
- **Artist** — tagline: "I make."
- **Curator** — tagline: "I curate."
- **Institution** — tagline: "I build spaces."

Each card: role name `text-4xl font-heading`, tagline `text-text-muted text-sm`, `border border-white/10` default, `border-accent shadow-[0_0_24px_rgba(157,0,255,0.2)]` on hover (`whileHover scale(1.01)`), `border-accent bg-accent/10` when selected. Clicking calls `setValue('role', role)` + advances to step 2. Ghost step label "ROLE" in `text-8xl font-heading text-white/5` layered behind. Progress: 1/3 line filled.

### Screen 2 — Identity (Step 2/3)
Contextual copy: *"Tell the community who you are."*
Fields (React Hook Form, validated by `profileSchema` on Next):
- Display Name (`Input`, required, 2–50 chars)
- Bio (`textarea` styled like `Input`, optional, max 300 chars)
- Geography — chip selector from `GEOGRAPHY_PRESETS` constant + "Other" free-text fallback
- Discipline — chip selector from role-aware `DISCIPLINE_PRESETS[role]` + "Other" free-text fallback

Role-aware discipline presets:
- Artist: Photography, Painting, Sculpture, Drawing, Printmaking, Digital Art, Performance, Installation, Textile, Ceramics
- Curator: Exhibition Design, Research, Commissioning, Collection Management, Public Programming, Writing, Education
- Institution: Gallery, Museum, Foundation, Residency, Art Fair, Publisher, Archive, Cultural Centre

"Next →" `Button` validates fields for this step before advancing. Progress: 2/3.

### Screen 3 — Interests (Step 3/3)
Contextual copy: *"What moves you?"*
Preset interest chip grid (two columns): Architecture, Street Art, Photography, Painting, Film, Music, Fashion, Literature, Performance, Technology, Craft, Design, Sculpture, Publishing. Tap to toggle — default style `bg-white/5 border-white/10`, selected `bg-accent text-white border-accent`. Custom add: small `Input` + "+" button appends to selection. Min 1 required (Zod). "Complete Profile" `Button` — on click calls `upsertProfile(formData)` Server Action. Progress: 3/3.

### Screen 4 — Celebration
Full-screen. *"Welcome to Saye, [name]."* in `text-5xl font-heading`. Framer Motion: name appears with `AnimatePresence` letter-by-letter stagger or word fade. Subtitle: *"Your identity is live."* in `text-text-muted`. Auto-redirects to `/discover` after 2500ms via `useEffect` + `router.push`. No button — the moment is the experience.

### Server Action: `upsertProfile()`
```ts
'use server'
// Returns { success: true } | { error: string }
// Uses Supabase server client
// INSERT INTO profiles ... ON CONFLICT (id) DO UPDATE SET ...
// Requires authenticated session — throws if no user
```

---

## 4. Pillar 2 — Triple-Filter Discover

### Page architecture
`app/(main)/discover/page.tsx` is a Server Component. Reads `searchParams` for active filters. Runs two queries in parallel:
```ts
const [profiles, filterOptions] = await Promise.all([
  getProfiles(filters),
  getFilterOptions(),
])
```
Passes `filterOptions` to `FilterBar` (client) and `profiles` to profile grid.

### Query: `getProfiles(filters)`
```ts
// lib/discover/queries.ts
let query = supabase.from('profiles').select('id, display_name, role, geography, discipline, interests')
if (filters.geography.length)  query = query.in('geography', filters.geography)
if (filters.discipline.length) query = query.in('discipline', filters.discipline)
if (filters.interests.length)  query = query.overlaps('interests', filters.interests)
```
AND logic across categories (all active filters must match). OR logic within a category (`.in()` and `.overlaps()` both match any of the selected values).

### Query: `getFilterOptions()`
```ts
// Returns { geographies: string[], disciplines: string[], interests: string[] }
// interests: SELECT DISTINCT unnest(interests) FROM profiles ORDER BY 1
// geography/discipline: SELECT DISTINCT geography/discipline FROM profiles WHERE value IS NOT NULL
```

### FilterBar (client component)
Receives `filterOptions` and current `searchParams` as props — no internal state, derives active chips from props. Three chip rows labelled in small caps: "GEOGRAPHY", "DISCIPLINE", "INTEREST". On chip click: `startTransition(() => router.replace(newUrl))` — `useTransition` provides `isPending` bool used to show opacity-50 on the chip row during re-fetch. Chips: default `bg-white/5 border-white/10 text-text-muted`, active `bg-accent text-white border-accent`.

### Profile grid
CSS grid `grid-cols-2 lg:grid-cols-3 gap-4`. Each `ProfileCard`: role `Badge` floated top-right, display name `text-2xl font-heading`, discipline `text-text-muted text-sm`, geography as small tag bottom-left. `motion.div` with `initial={{ opacity: 0, y: 16 }}` and staggered delay (`index * 0.05s`). Card `whileHover` scale `1.02` + purple glow.

### Empty state
`EmptyState` component: large faded *"Nothing found."* `text-6xl font-heading text-white/10`, small *"Try removing a filter."* below, ghost Button "Clear filters" calls `router.replace('/discover')`.

### Loading
`app/(main)/discover/loading.tsx`: grid of 6 skeleton cards with `animate-pulse bg-surface rounded-xl`.

---

## 5. Pillar 3 — Public Profile + Archive

### Page architecture
`app/(main)/profile/[id]/page.tsx` is a Server Component. Runs three queries in parallel:
```ts
const [profile, archiveItems, { data: { user } }] = await Promise.all([
  getProfile(id),
  getArchiveItems(id),
  supabase.auth.getUser(),
])
if (!profile) notFound()
const isOwner = user?.id === id
```
Passes `isOwner` to `ArchiveGrid`.

### Profile header
Display name `text-5xl font-heading font-bold`. Role `Badge` (role variant) inline beside name. Bio `text-text-muted mt-4 max-w-2xl`. Row of geography tag + discipline tag + interest `Badge` chips (interest variant). Owner sees ghost "Edit Profile" button top-right → links to `/build-profile`.

### TypeScript types (`lib/types.ts`)
```ts
export type Profile = {
  id: string
  role: 'Artist' | 'Curator' | 'Institution'
  display_name: string
  bio: string | null
  geography: string | null
  discipline: string | null
  interests: string[]
  avatar_url: string | null
  created_at: string
}

export type ArchiveItem = {
  id: string
  profile_id: string
  type: 'image' | 'text' | 'link'
  content: string
  created_at: string
}
```

### Archive grid
`ArchiveGrid` receives `items: ArchiveItem[]` and `isOwner: boolean`. CSS masonry: `columns-1 sm:columns-2 lg:columns-3 gap-4`. Each item wrapped in `break-inside-avoid mb-4`.

`ArchiveItem` renders by type:
- **text** — `Card` with body text `text-text-primary`, `created_at` timestamp `text-text-muted text-xs` bottom
- **image** — `<img src={content} alt="" className="w-full rounded-xl object-cover" />` (external URLs, no Next.js domain config needed for prototype)
- **link** — `Card` with `ExternalLink` icon (Lucide), URL as `<a>` styled anchor, domain extracted and shown as `Badge`

Owner sees delete control per card: collapsed = `Trash2` icon top-right, clicking shows inline "Delete? " + "Yes" (red) / "No" buttons. "Yes" fires `deleteArchiveItem(id)` Server Action then `router.refresh()`.

### AddBlockPanel (owner only)
Sits above the grid. Collapsed: `+ Add to Archive` ghost `Button`. `AnimatePresence` slides panel down on open: type selector (three chips: "Text" / "Image URL" / "Link" — same chip style as `InterestPicker`), conditional input (`textarea` for text, `Input` for image/link), "Add" `Button`. On submit: calls `addArchiveItem({ profile_id, type, content })` Server Action, collapses panel, calls `router.refresh()`. Displays `error` string if Server Action returns one.

### Server Actions (`features/archive/actions.ts`)
```ts
'use server'
// addArchiveItem(data): { success: true } | { error: string }
// deleteArchiveItem(id): { success: true } | { error: string }
// Both verify auth.uid() === profile_id before writing
```

---

## 6. Cleanup

### `app/page.tsx`
Replace boilerplate with `redirect('/discover')`. Middleware handles unauthenticated → `/login` for protected routes; authenticated users at `/` land on `/discover`.

### `app/globals.css`
Commit the pending design token changes (already correct, just unstaged).

---

## 7. Constants (`lib/constants.ts`)

```ts
export const GEOGRAPHY_PRESETS = ['Istanbul', 'London', 'New York', 'Berlin', 'Paris', 'Tokyo', 'Amsterdam', 'Los Angeles', 'São Paulo', 'Lagos']

export const DISCIPLINE_PRESETS = {
  Artist: ['Photography', 'Painting', 'Sculpture', 'Drawing', 'Printmaking', 'Digital Art', 'Performance', 'Installation', 'Textile', 'Ceramics'],
  Curator: ['Exhibition Design', 'Research', 'Commissioning', 'Collection Management', 'Public Programming', 'Writing', 'Education'],
  Institution: ['Gallery', 'Museum', 'Foundation', 'Residency', 'Art Fair', 'Publisher', 'Archive', 'Cultural Centre'],
}

export const INTEREST_PRESETS = ['Architecture', 'Street Art', 'Photography', 'Painting', 'Film', 'Music', 'Fashion', 'Literature', 'Performance', 'Technology', 'Craft', 'Design', 'Sculpture', 'Publishing']
```

---

## 8. File Map

```
lib/
  types.ts
  constants.ts

features/
  profiles/
    BuildProfileWizard.tsx     'use client' — wizard controller, 5 screens
    WelcomeScreen.tsx          screen 0
    RoleCard.tsx               artsy role card
    InterestPicker.tsx         chip toggle grid + custom add
    CelebrationScreen.tsx      screen 4, auto-redirect
    actions.ts                 'use server' — upsertProfile()
  discover/
    FilterBar.tsx              'use client' — chip rows + router.replace
    ProfileCard.tsx            gallery-label style card
    EmptyState.tsx             no-results component
    queries.ts                 getProfiles(), getFilterOptions()
  archive/
    ArchiveGrid.tsx            masonry grid, receives isOwner
    ArchiveItem.tsx            type renderer (text/image/link)
    AddBlockPanel.tsx          'use client' — slide-down add form
    actions.ts                 'use server' — addArchiveItem(), deleteArchiveItem()

app/
  page.tsx                     redirect('/discover')
  globals.css                  commit pending changes
  (main)/
    layout.tsx                 update nav: Join Saye vs Profile link
    discover/
      page.tsx                 Server Component — calls queries.ts
      loading.tsx              skeleton grid
    profile/[id]/
      page.tsx                 Server Component — profile + archive + isOwner
  (onboarding)/
    build-profile/
      page.tsx                 fetches existing profile, renders BuildProfileWizard

middleware.ts                  updated — browse-first, auth-on-intent
```

---

## 9. AI Workflow Log Checkpoints

The following milestones each get an entry appended to `AI_WORKFLOW_LOG.md` (tool + key prompt) upon completion:
- Auth flow update (middleware)
- Build Profile wizard (all 5 screens)
- Discover filter engine (queries + FilterBar)
- Archive grid + CRUD
- Cleanup + final verification

---

## 10. Out of Scope

- Avatar image upload (profile uses initials fallback)
- Real-time updates (archive refreshes via `router.refresh()`)
- Pagination on discover feed
- Email notifications
- Social features (follows, likes)
