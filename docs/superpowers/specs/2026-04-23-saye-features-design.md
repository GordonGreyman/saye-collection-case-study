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

### Login page: return URL handling
The login page reads `searchParams.next` (typed as `Promise<{ next?: string }>`). After successful sign-in (both Google OAuth and email/password), the user is redirected to `next` if present and safe (starts with `/`), otherwise to `/discover`. For Google OAuth, `next` is encoded into the `redirectTo` callback URL so it survives the OAuth round-trip.

### Nav update
The `(main)` layout fetches both `user` and `profile` server-side:
- **Unauthenticated:** "SAYE" logo + Discover link + **"Join Saye"** ghost Button → `/login`
- **Authenticated, no profile:** "SAYE" logo + Discover link + **"Complete Profile"** accent Button → `/build-profile`
- **Authenticated, has profile:** "SAYE" logo + Discover link + Profile link → `/profile/[user.id]`

---

## 3. Pillar 1 — Onboarding + Build Profile

### Wizard architecture
`BuildProfileWizard` is a `'use client'` component managing 5 screens via local `step` state. A single `useForm` instance (React Hook Form + `profileSchema` from `lib/validators/profile.ts`) lives at the wizard level — all fields registered once, steps render field subsets. `defaultValues` prop accepts an existing `Profile` for edit mode (Server Component fetches and passes it).

**Draft auto-save:** On every step transition, wizard state is written to `localStorage` under key `saye_profile_draft`. On mount, wizard rehydrates from draft **only if `defaultValues` is not provided** — edit mode always uses the fetched profile and ignores any stale draft. Draft is cleared on successful `upsertProfile()` submit.

**Edit mode:** When `defaultValues` is present, wizard starts at Step 1 (Screen 1), skipping the Welcome screen entirely.

### Screen 0 — Welcome (new users only)
Full-screen entry. "SAYE" in `text-6xl font-heading tracking-widest`, tagline: *"A discovery engine for artists, curators, and institutions."* in `text-text-muted`. Single CTA: `Button` "Build Your Identity →". Framer Motion `fade-up` entry (`opacity: 0→1, y: 24→0`). No progress indicator on this screen.

### Screen 1 — Role (Step 1/3)
Contextual copy: *"Your role shapes how others find you."*
Three full-width stacked `RoleCard` components:
- **Artist** — tagline: "I make."
- **Curator** — tagline: "I curate."
- **Institution** — tagline: "I build spaces."

Each card: role name `text-4xl font-heading`, tagline `text-text-muted text-sm`, `border border-white/10` default, `border-accent shadow-[0_0_24px_rgba(157,0,255,0.2)]` on hover (`whileHover scale(1.01)`), `border-accent bg-accent/10` when selected. Clicking calls `setValue('role', role)` + advances to Step 2. Ghost step label "ROLE" in `text-8xl font-heading text-white/5` layered behind. Progress: 1/3 line filled.

### Screen 2 — Identity (Step 2/3)
Contextual copy: *"Tell the community who you are."*
Fields (React Hook Form, Zod validated on "Next"):
- Display Name (`Input`, required, 2–50 chars)
- Bio (`Textarea` component — see Section 8, optional, max 300 chars)
- Geography — **single-select** chip selector from `GEOGRAPHY_PRESETS` constant (radio behaviour, one value) + "Other" free-text fallback
- Discipline — **single-select** chip selector from role-aware `DISCIPLINE_PRESETS[role]` (radio behaviour) + "Other" free-text fallback

Role-aware discipline presets:
- Artist: Photography, Painting, Sculpture, Drawing, Printmaking, Digital Art, Performance, Installation, Textile, Ceramics
- Curator: Exhibition Design, Research, Commissioning, Collection Management, Public Programming, Writing, Education
- Institution: Gallery, Museum, Foundation, Residency, Art Fair, Publisher, Archive, Cultural Centre

"Next →" `Button` validates this step's fields via `trigger(['display_name', 'geography', 'discipline'])` before advancing. Progress: 2/3.

### Screen 3 — Interests (Step 3/3)
Contextual copy: *"What moves you?"*
Preset interest chip grid (responsive: 2 cols mobile, 3 cols desktop): Architecture, Street Art, Photography, Painting, Film, Music, Fashion, Literature, Performance, Technology, Craft, Design, Sculpture, Publishing. Multi-select toggle — default `bg-white/5 border-white/10`, selected `bg-accent text-white border-accent`. Custom add: `Input` + "+" button appends to selection. Min 1 required (Zod). "Complete Profile" `Button` calls `upsertProfile(formData)` Server Action programmatically (not via `action=`). Progress: 3/3.

### Screen 4 — Celebration
Full-screen. *"Welcome to Saye, [name]."* in `text-5xl font-heading`. Framer Motion word-by-word fade reveal on the name. Subtitle: *"Your identity is live."* in `text-text-muted`. Auto-redirects to `/discover` after 2500ms via `useEffect` + `router.push`. No button — the moment is the experience.

### Server Action: `upsertProfile()`
```ts
'use server'
// Returns { success: true } | { error: string }
// Derives user from supabase.auth.getUser() — never trusts client-supplied id
// INSERT INTO profiles ... ON CONFLICT (id) DO UPDATE SET ...
```

---

## 4. Pillar 2 — Triple-Filter Discover

### Page architecture
`app/(main)/discover/page.tsx` is a Server Component. `searchParams` is awaited (Next.js 15/16 async prop):
```ts
export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  // parse filters from params...
```
Runs two queries in parallel:
```ts
const [profiles, filterOptions] = await Promise.all([
  getProfiles(filters),
  getFilterOptions(),
])
```
Passes parsed filter state (typed object, not raw `searchParams`) and `filterOptions` to `FilterBar`. Passes `profiles` to profile grid.

### Page header (brand moment)
Above the filter bar: "DISCOVER" in `text-5xl font-heading font-bold text-text-primary`, subtitle "Find artists, curators, and institutions." in `text-text-muted text-sm`. Grounds the page for first-time visitors.

### Query: `getProfiles(filters)` — `features/discover/queries.ts`
```ts
let query = supabase
  .from('profiles')
  .select('id, display_name, role, geography, discipline, interests')
  .order('created_at', { ascending: false })
  .limit(50)
if (filters.geography.length)  query = query.in('geography', filters.geography)
if (filters.discipline.length) query = query.in('discipline', filters.discipline)
if (filters.interests.length)  query = query.overlaps('interests', filters.interests)
```
AND logic across categories. OR within category (`.in()` and `.overlaps()` match any selected value).

### Query: `getFilterOptions()` — `features/discover/queries.ts`
```ts
// Returns { geographies: string[], disciplines: string[], interests: string[] }
// interests: SELECT DISTINCT unnest(interests) FROM profiles ORDER BY 1
// geography/discipline: SELECT DISTINCT value FROM profiles WHERE value IS NOT NULL ORDER BY 1
```

### FilterBar (client component)
Receives `filterOptions` and parsed filter state as typed props — no internal state, derives active chips purely from props passed by Server Component. On chip click: `startTransition(() => router.replace(newUrl))`. `useTransition` `isPending` → `opacity-50` on chip rows during re-fetch. Chips: default `bg-white/5 border-white/10 text-text-muted`, active `bg-accent text-white border-accent`.

### Profile grid
Page-level brand header → filter bar → grid. CSS `grid-cols-2 lg:grid-cols-3 gap-4`. Each `ProfileCard`:
- **Initials avatar** — circle `w-12 h-12 rounded-full bg-accent/20 text-accent font-heading font-bold` showing first letter of display name
- Role `Badge` floated top-right
- Display name `text-2xl font-heading mt-3`
- Discipline `text-text-muted text-sm`
- Geography small tag bottom-left

`motion.div` with `initial={{ opacity: 0, y: 16 }}` and capped stagger delay `Math.min(index * 0.05, 0.3)` seconds. `whileHover scale(1.02)` + purple glow.

### Empty states (two distinct cases)
**No profiles in DB at all:** "Be the first to join Saye." `text-4xl font-heading text-white/20`, "Build your profile and get discovered." muted, `Button` "Join Saye →" → `/build-profile`.

**Filters return no results:** "Nothing found." `text-6xl font-heading text-white/10`, "Try removing a filter." muted below, ghost Button "Clear filters" → `router.replace('/discover')`.

### Loading + Error
`app/(main)/discover/loading.tsx`: grid of 6 skeleton cards `animate-pulse bg-surface rounded-xl h-48`.
`app/(main)/discover/error.tsx`: centered "Something went wrong." with a retry button (`reset()` prop from Next.js error boundary).

---

## 5. Pillar 3 — Public Profile + Archive

### Page architecture
`app/(main)/profile/[id]/page.tsx` is a Server Component. `params` is awaited:
```ts
const { id } = await params
const [profile, archiveItems, { data: { user } }] = await Promise.all([
  getProfile(id),           // features/archive/queries.ts
  getArchiveItems(id),      // features/archive/queries.ts
  supabase.auth.getUser(),
])
if (!profile) notFound()
const isOwner = user?.id === id
```
Passes `isOwner` to both `ArchiveGrid` and the profile header.

### Profile header
Display name `text-5xl font-heading font-bold`. Role `Badge` inline beside name. Bio `text-text-muted mt-4 max-w-2xl`. Row of geography tag + discipline tag + interest `Badge` chips (interest variant). Owner sees ghost "Edit Profile" button top-right → `/build-profile`.

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
`ArchiveGrid` receives `items: ArchiveItem[]`, `isOwner: boolean`, and `profileId: string`. Passes `isOwner` explicitly to every `ArchiveItem` instance. CSS masonry: `columns-1 sm:columns-2 lg:columns-3 gap-4`. Each item wrapped in `break-inside-avoid mb-4`.

**Archive empty state:**
- Owner: "Your archive is empty." + "Add your first piece." with `AddBlockPanel` pre-opened (`defaultOpen` prop).
- Non-owner: "Nothing here yet." `text-text-muted` centered.

`ArchiveItem` renders by type, all receive `isOwner`:
- **text** — `Card` with body text `text-text-primary`, `created_at` timestamp `text-text-muted text-xs` bottom
- **image** — `<img src={content} alt="Archive item" className="w-full rounded-xl object-cover max-h-96" />` — `max-h-96` caps very tall images; `alt="Archive item"` satisfies accessibility minimum
- **link** — `Card` with `ExternalLink` icon (Lucide), URL as `<a>` styled anchor, domain extracted and shown as `Badge`

Owner delete control per card: collapsed = `Trash2` icon top-right. Clicking reveals inline "**Delete**" (red, destructive) / "**Cancel**" (muted) — explicit labelling avoids ambiguity. "Delete" fires `deleteArchiveItem(id)` Server Action then `router.refresh()`.

### AddBlockPanel (owner only, `'use client'`)
Receives `profileId` prop — does **not** accept `profile_id` from user input. Server Action derives `profile_id` from `auth.getUser()` server-side; `profileId` prop is only used for optimistic display. Collapsed: `+ Add to Archive` ghost `Button` (or pre-opened if archive is empty and owner). `AnimatePresence` slides panel down: type selector chips ("Text" / "Image URL" / "Link" — same chip style as `InterestPicker`), conditional `Textarea`/`Input` per type, "Add" `Button`. On submit: calls `addArchiveItem({ type, content })` Server Action, collapses panel, calls `router.refresh()`. Displays `error` string if Server Action returns one.

### Server Actions (`features/archive/actions.ts`)
```ts
'use server'
// addArchiveItem({ type, content }): { success: true } | { error: string }
//   → profile_id derived from auth.getUser() server-side, never from client
// deleteArchiveItem(id): { success: true } | { error: string }
//   → verifies auth.uid() === item.profile_id before deleting
```

### Loading + Error
`app/(main)/profile/[id]/loading.tsx`: profile header skeleton + masonry grid skeleton.
`app/(main)/profile/[id]/error.tsx`: "Profile unavailable." with back-to-discover link.

---

## 6. Shared UI: `Textarea` Component (`components/ui/Textarea.tsx`)

New component needed for bio field — same dark theme as `Input`:
```tsx
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}
// Same styling as Input: bg-surface, border-white/10, purple focus ring
// resize-none, min-h-[100px]
```

---

## 7. Cleanup

### `app/page.tsx`
Replace boilerplate with `redirect('/discover')`.

### `app/globals.css`
Commit the pending design token changes (already correct, just unstaged).

---

## 8. Constants (`lib/constants.ts`)

```ts
export const GEOGRAPHY_PRESETS = [
  'Istanbul', 'London', 'New York', 'Berlin', 'Paris',
  'Tokyo', 'Amsterdam', 'Los Angeles', 'São Paulo', 'Lagos',
  'Cairo', 'Mumbai', 'Seoul', 'Mexico City', 'Nairobi',
]

export const DISCIPLINE_PRESETS: Record<'Artist' | 'Curator' | 'Institution', string[]> = {
  Artist: ['Photography', 'Painting', 'Sculpture', 'Drawing', 'Printmaking', 'Digital Art', 'Performance', 'Installation', 'Textile', 'Ceramics'],
  Curator: ['Exhibition Design', 'Research', 'Commissioning', 'Collection Management', 'Public Programming', 'Writing', 'Education'],
  Institution: ['Gallery', 'Museum', 'Foundation', 'Residency', 'Art Fair', 'Publisher', 'Archive', 'Cultural Centre'],
}

export const INTEREST_PRESETS = [
  'Architecture', 'Street Art', 'Photography', 'Painting',
  'Film', 'Music', 'Fashion', 'Literature', 'Performance',
  'Technology', 'Craft', 'Design', 'Sculpture', 'Publishing',
]
```

Geography list expanded to include more globally diverse cities.

---

## 9. File Map

```
lib/
  types.ts
  constants.ts

components/ui/
  Textarea.tsx              new — bio field, same dark theme as Input

features/
  profiles/
    BuildProfileWizard.tsx  'use client' — wizard controller, 5 screens
    WelcomeScreen.tsx       screen 0 (new users only)
    RoleCard.tsx            artsy role card
    InterestPicker.tsx      chip toggle grid + custom add
    CelebrationScreen.tsx   screen 4, auto-redirect
    actions.ts              'use server' — upsertProfile()
  discover/
    FilterBar.tsx           'use client' — chip rows + router.replace
    ProfileCard.tsx         gallery-label card with initials avatar
    EmptyState.tsx          two variants: no-DB + no-results
    queries.ts              getProfiles(), getFilterOptions()
  archive/
    ArchiveGrid.tsx         masonry grid, passes isOwner to ArchiveItem
    ArchiveItem.tsx         type renderer — isOwner controls delete
    AddBlockPanel.tsx       'use client' — slide-down add form
    actions.ts              'use server' — addArchiveItem(), deleteArchiveItem()

app/
  page.tsx                  redirect('/discover')
  globals.css               commit pending changes
  (main)/
    layout.tsx              nav: Join Saye / Complete Profile / Profile — server-fetched
    discover/
      page.tsx              Server Component — await searchParams, queries.ts
      loading.tsx           skeleton grid
      error.tsx             error boundary
    profile/[id]/
      page.tsx              Server Component — await params, profile + archive + isOwner
      loading.tsx           profile + archive skeleton
      error.tsx             error boundary
  (onboarding)/
    build-profile/
      page.tsx              fetches existing profile → defaultValues prop

middleware.ts               browse-first, auth-on-intent, ?next= param support
```

---

## 10. AI Workflow Log Checkpoints

The following milestones each get an entry appended to `AI_WORKFLOW_LOG.md` (tool + key prompt) upon completion:
- Auth flow update (middleware + login page return URL)
- Build Profile wizard (all 5 screens + localStorage draft)
- Discover filter engine (queries + FilterBar + empty states)
- Archive grid + CRUD (ArchiveGrid + AddBlockPanel + Server Actions)
- Cleanup + final verification

---

## 11. Out of Scope

- Avatar image upload (profile uses initials circle)
- Real-time updates (archive refreshes via `router.refresh()`)
- Pagination on discover feed (limit 50)
- Email notifications
- Social features (follows, likes)
