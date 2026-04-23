# Saye Collective — Foundation Design Spec
**Date:** 2026-04-23  
**Scope:** Project scaffold, design system, Supabase schema + auth

---

## 1. Overview

A Next.js (App Router) discovery platform for artists, curators, and institutions. Three pillars: Smart Profiles, Triple-Filter Search, and The Archive. This spec covers the foundational layer all three pillars build on.

---

## 2. Project Structure

```
saye/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx              # Google + email login page
│   ├── (onboarding)/
│   │   └── build-profile/page.tsx      # Post-login profile wizard
│   ├── (main)/
│   │   ├── layout.tsx                  # Shared nav shell
│   │   ├── discover/page.tsx           # Triple-filter search feed
│   │   └── profile/[id]/page.tsx       # Public profile + Archive
│   └── layout.tsx                      # Root layout (fonts, providers)
├── features/
│   ├── profiles/                       # Smart Profiles pillar
│   ├── discover/                       # Triple-Filter Search pillar
│   └── archive/                        # Archive pillar
├── lib/
│   ├── supabase/                       # Client, server, middleware helpers
│   └── validators/                     # Zod schemas
├── components/ui/                      # Shared design system components
├── styles/
│   └── globals.css                     # Design tokens
└── middleware.ts                       # Auth guard
```

Route groups `(auth)`, `(onboarding)`, `(main)` isolate layouts without affecting URLs. `middleware.ts` handles all auth redirects centrally.

---

## 3. Design System

### Tokens (in `tailwind.config.ts` + `globals.css`)

| Token | Value |
|---|---|
| `background` | `#050505` / `#0A0A0A` |
| `text-primary` | `#F3F4F6` |
| `text-muted` | `#D1D5DB` |
| `accent` | `#9D00FF` |

### Typography
- **Headings:** Space Grotesk (bold, geometric)
- **Body:** Inter (clean)

### Motion
- Page entry: Framer Motion fade-up
- Card hover: scale + purple glow (`box-shadow` with `#9D00FF` at low opacity)
- Button press: Framer Motion `whileTap` scale down

### Shared UI Components (`components/ui/`)
- `Button` — variants: `primary` (purple fill), `ghost` (outlined); Framer Motion press scale
- `Card` — dark surface `#0A0A0A`, subtle border, purple glow on hover
- `Input` / `Select` — dark-themed, purple focus ring
- `Badge` — role tags (Artist / Curator / Institution) and interest chips

---

## 4. Auth Flow

- **Providers:** Email/password + Google OAuth (via Supabase Auth)
- **`middleware.ts` logic:**
  1. No session → redirect to `/login`
  2. Session + no profile row → redirect to `/build-profile`
  3. Session + profile exists → allow through to `(main)`
- Supabase SSR helpers (`@supabase/ssr`) used for server-side session reading in App Router

---

## 5. Database Schema

### `profiles`
```sql
CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role          text NOT NULL CHECK (role IN ('Artist', 'Curator', 'Institution')),
  display_name  text NOT NULL,
  bio           text,
  geography     text,
  discipline    text,
  interests     text[],
  avatar_url    text,
  created_at    timestamptz DEFAULT now()
);
```

### `archive_items`
```sql
CREATE TABLE archive_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('image', 'text', 'link')),
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);
```

### Indexes
```sql
CREATE INDEX ON profiles (geography);
CREATE INDEX ON profiles (discipline);
CREATE INDEX ON profiles (role);
```

---

## 6. Row Level Security (RLS)

```sql
-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Own insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- archive_items
ALTER TABLE archive_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON archive_items FOR SELECT USING (true);
CREATE POLICY "Own insert" ON archive_items FOR INSERT WITH CHECK (
  auth.uid() = profile_id
);
CREATE POLICY "Own delete" ON archive_items FOR DELETE USING (
  auth.uid() = profile_id
);
```

---

## 7. Key Dependencies

```json
{
  "next": "^15",
  "react": "^19",
  "tailwindcss": "^4",
  "@supabase/ssr": "latest",
  "@supabase/supabase-js": "latest",
  "framer-motion": "^11",
  "react-hook-form": "^7",
  "zod": "^3",
  "lucide-react": "latest"
}
```

---

## 8. Out of Scope (This Foundation)

- Feature logic for Pillar 1 (Smart Profiles wizard)
- Feature logic for Pillar 2 (Triple-Filter Search)
- Feature logic for Pillar 3 (Archive grid + CRUD)
- Vercel deployment config
- `AI_WORKFLOW_LOG.md` (maintained incrementally during development)
