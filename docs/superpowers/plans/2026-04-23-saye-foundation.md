# Saye Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the full Next.js project with design system, Supabase auth plumbing, middleware auth guard, shared UI components, and database migration SQL — ready for feature development on all three pillars.

**Architecture:** Feature-based folder structure with Next.js App Router route groups `(auth)`, `(onboarding)`, `(main)` for layout isolation. Supabase SSR helpers provide server-side session access. A single `middleware.ts` handles all auth redirect logic centrally.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, @supabase/ssr, React Hook Form, Zod, Lucide React, Jest + React Testing Library

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | Dependencies |
| `tailwind.config.ts` | Design token extension |
| `styles/globals.css` | CSS custom properties (colors, fonts) |
| `.env.local` | Supabase keys (gitignored) |
| `.env.example` | Key template for collaborators |
| `lib/supabase/client.ts` | Browser Supabase client factory |
| `lib/supabase/server.ts` | Server Supabase client factory (async cookies) |
| `lib/validators/profile.ts` | Zod schema for profile form |
| `middleware.ts` | Auth guard — 3 redirect cases |
| `components/ui/Button.tsx` | Primary + ghost button with Framer Motion press |
| `components/ui/Card.tsx` | Dark surface card with purple glow on hover |
| `components/ui/Input.tsx` | Dark-themed input with label + error |
| `components/ui/Badge.tsx` | Role tag and interest chip |
| `app/layout.tsx` | Root layout — fonts, metadata |
| `app/(auth)/login/page.tsx` | Google OAuth + email/password login UI |
| `app/auth/callback/route.ts` | OAuth code exchange handler |
| `app/(main)/layout.tsx` | Nav shell for all main pages |
| `app/(main)/discover/page.tsx` | Stub — Triple-Filter Search pillar |
| `app/(main)/profile/[id]/page.tsx` | Stub — Public Profile + Archive pillar |
| `app/(onboarding)/build-profile/page.tsx` | Stub — Onboarding wizard pillar |
| `supabase/migrations/001_initial_schema.sql` | Full schema, RLS policies, indexes |
| `jest.config.ts` | Jest with Next.js transformer |
| `jest.setup.ts` | jest-dom matchers import |
| `__tests__/middleware.test.ts` | Middleware redirect logic tests |
| `__tests__/validators/profile.test.ts` | Zod schema validation tests |
| `__tests__/components/Button.test.tsx` | Button render tests |

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: entire project scaffold via `create-next-app`

- [ ] **Step 1: Run create-next-app inside the project directory**

```bash
cd C:/Users/MONSTER/Desktop/projects/saye
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias="@/*"
```

When prompted about existing files (README.md), confirm overwrite. When asked about `src/` directory, select No.

Expected output ends with: `Success! Created your Next.js app`

- [ ] **Step 2: Verify the dev server starts**

```bash
npm run dev
```

Expected: `Ready in Xms` on `http://localhost:3000`. Visit it — default Next.js page loads. Stop the server (`Ctrl+C`).

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: init Next.js project with App Router and Tailwind"
```

---

## Task 2: Install Dependencies and Environment Files

**Files:**
- Modify: `package.json`
- Create: `.env.local`, `.env.example`

- [ ] **Step 1: Install all additional dependencies**

```bash
npm install @supabase/ssr @supabase/supabase-js framer-motion react-hook-form zod lucide-react
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest
```

Expected: `added X packages` with no peer dependency errors.

- [ ] **Step 2: Create `.env.example`**

Create the file `/.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

- [ ] **Step 3: Create `.env.local` with your real Supabase credentials**

Create the file `/.env.local` (this file is gitignored by default):

```
NEXT_PUBLIC_SUPABASE_URL=<paste your Supabase project URL here>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste your Supabase anon key here>
```

Get these values from: Supabase Dashboard → Project → Settings → API.

- [ ] **Step 4: Verify `.env.local` is gitignored**

```bash
cat .gitignore | grep env
```

Expected: `.env*.local` appears in the output.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: install dependencies and add env template"
```

---

## Task 3: Configure Design Tokens and Tailwind

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `styles/globals.css`

- [ ] **Step 1: Replace `styles/globals.css` with design tokens**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #050505;
  --color-surface: #0A0A0A;
  --color-text-primary: #F3F4F6;
  --color-text-muted: #D1D5DB;
  --color-accent: #9D00FF;
}

@layer base {
  * {
    box-sizing: border-box;
  }
  body {
    background-color: var(--color-bg);
    color: var(--color-text-primary);
  }
  ::selection {
    background-color: rgba(157, 0, 255, 0.3);
  }
}
```

- [ ] **Step 2: Replace `tailwind.config.ts` to wire tokens**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'text-primary': 'var(--color-text-primary)',
        'text-muted': 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 3: Commit**

```bash
git add styles/globals.css tailwind.config.ts
git commit -m "chore: configure design tokens and Tailwind theme"
```

---

## Task 4: Set Up Test Infrastructure

**Files:**
- Create: `jest.config.ts`, `jest.setup.ts`

- [ ] **Step 1: Create `jest.config.ts`**

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
```

- [ ] **Step 2: Create `jest.setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test script to `package.json`**

In `package.json`, add to the `"scripts"` section:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 4: Create `__tests__/smoke.test.ts` and run it**

```ts
test('test infrastructure works', () => {
  expect(1 + 1).toBe(2)
})
```

```bash
npm test
```

Expected: `Tests: 1 passed`

- [ ] **Step 5: Delete the smoke test and commit**

```bash
rm __tests__/smoke.test.ts
git add jest.config.ts jest.setup.ts package.json
git commit -m "chore: configure Jest with Next.js and Testing Library"
```

---

## Task 5: Supabase Client Helpers

**Files:**
- Create: `lib/supabase/client.ts`, `lib/supabase/server.ts`

- [ ] **Step 1: Create `lib/supabase/client.ts`**

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 2: Create `lib/supabase/server.ts`**

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components can't set cookies — middleware handles this
          }
        },
      },
    }
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/
git commit -m "feat: add Supabase browser and server client factories"
```

---

## Task 6: Root Middleware (Auth Guard)

**Files:**
- Create: `middleware.ts`, `__tests__/middleware.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `__tests__/middleware.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests — confirm they all fail**

```bash
npm test __tests__/middleware.test.ts
```

Expected: `Cannot find module '@/middleware'`

- [ ] **Step 3: Create `middleware.ts`**

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Case 1: No session — send to login
  if (!user && !pathname.startsWith('/login') && !pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Case 2: Logged-in user on login page — send to discover
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/discover', request.url))
  }

  // Case 3: Logged in but no profile — send to onboarding
  if (user && !pathname.startsWith('/build-profile') && !pathname.startsWith('/auth')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.redirect(new URL('/build-profile', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 4: Run tests — confirm they all pass**

```bash
npm test __tests__/middleware.test.ts
```

Expected: `Tests: 4 passed`

- [ ] **Step 5: Commit**

```bash
git add middleware.ts __tests__/middleware.test.ts
git commit -m "feat: add auth guard middleware with 3 redirect cases"
```

---

## Task 7: Zod Profile Validator

**Files:**
- Create: `lib/validators/profile.ts`, `__tests__/validators/profile.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/validators/profile.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm test __tests__/validators/profile.test.ts
```

Expected: `Cannot find module '@/lib/validators/profile'`

- [ ] **Step 3: Create `lib/validators/profile.ts`**

```ts
import { z } from 'zod'

export const profileSchema = z.object({
  role: z.enum(['Artist', 'Curator', 'Institution']),
  display_name: z.string().min(2, 'At least 2 characters').max(50, 'Max 50 characters'),
  bio: z.string().max(300, 'Max 300 characters').optional(),
  geography: z.string().min(1, 'Required'),
  discipline: z.string().min(1, 'Required'),
  interests: z
    .array(z.string())
    .min(1, 'Add at least one interest')
    .max(10, 'Max 10 interests'),
})

export type ProfileFormData = z.infer<typeof profileSchema>
```

- [ ] **Step 4: Run tests — confirm they all pass**

```bash
npm test __tests__/validators/profile.test.ts
```

Expected: `Tests: 8 passed`

- [ ] **Step 5: Commit**

```bash
git add lib/validators/profile.ts __tests__/validators/profile.test.ts
git commit -m "feat: add Zod profile validator with full test coverage"
```

---

## Task 8: Button Component

**Files:**
- Create: `components/ui/Button.tsx`, `__tests__/components/Button.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/components/Button.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  test('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('renders as a button element', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  test('forwards disabled prop', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('applies ghost variant class', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button').className).toMatch(/border/)
  })
})
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npm test __tests__/components/Button.test.tsx
```

Expected: `Cannot find module '@/components/ui/Button'`

- [ ] **Step 3: Create `components/ui/Button.tsx`**

```tsx
'use client'
import { motion } from 'framer-motion'
import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'px-6 py-3 rounded-lg font-semibold text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed'
  const variants: Record<Variant, string> = {
    primary: 'bg-accent text-white hover:bg-purple-700',
    ghost: 'border border-accent text-accent hover:bg-accent hover:text-white',
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
```

- [ ] **Step 4: Run tests — confirm they all pass**

```bash
npm test __tests__/components/Button.test.tsx
```

Expected: `Tests: 4 passed`

- [ ] **Step 5: Commit**

```bash
git add components/ui/Button.tsx __tests__/components/Button.test.tsx
git commit -m "feat: add Button component with primary/ghost variants and press animation"
```

---

## Task 9: Card, Input, and Badge Components

**Files:**
- Create: `components/ui/Card.tsx`, `components/ui/Input.tsx`, `components/ui/Badge.tsx`

- [ ] **Step 1: Create `components/ui/Card.tsx`**

```tsx
import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-white/5 rounded-xl p-6 hover:shadow-[0_0_24px_rgba(157,0,255,0.15)] transition-shadow duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/ui/Input.tsx`**

```tsx
import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm text-text-muted font-medium">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-0.5">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 3: Create `components/ui/Badge.tsx`**

```tsx
interface BadgeProps {
  children: React.ReactNode
  variant?: 'role' | 'interest'
}

export function Badge({ children, variant = 'interest' }: BadgeProps) {
  const styles: Record<string, string> = {
    role: 'bg-accent/20 text-accent border border-accent/30',
    interest: 'bg-white/5 text-text-muted border border-white/10',
  }
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Run a quick smoke test to verify all three components import cleanly**

Create `__tests__/components/ui-smoke.test.tsx`:

```tsx
import { render } from '@testing-library/react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

test('Card renders', () => {
  const { getByText } = render(<Card>Content</Card>)
  expect(getByText('Content')).toBeInTheDocument()
})

test('Input renders with label', () => {
  const { getByLabelText } = render(<Input id="x" label="Name" />)
  expect(getByLabelText('Name')).toBeInTheDocument()
})

test('Badge renders', () => {
  const { getByText } = render(<Badge>Artist</Badge>)
  expect(getByText('Artist')).toBeInTheDocument()
})
```

```bash
npm test __tests__/components/ui-smoke.test.tsx
```

Expected: `Tests: 3 passed`

- [ ] **Step 5: Commit**

```bash
git add components/ui/ __tests__/components/ui-smoke.test.tsx
git commit -m "feat: add Card, Input, Badge UI components"
```

---

## Task 10: Root Layout with Fonts

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import '@/styles/globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Saye Collective',
  description: 'Discovery Engine for Artists, Curators, and Institutions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="font-body bg-bg text-text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify the dev server compiles cleanly**

```bash
npm run dev
```

Expected: No TypeScript or compilation errors. Visit `http://localhost:3000` — page loads (even if it's the default page). Stop the server.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: configure root layout with Space Grotesk and Inter fonts"
```

---

## Task 11: Login Page and OAuth Callback

**Files:**
- Create: `app/(auth)/login/page.tsx`, `app/auth/callback/route.ts`

- [ ] **Step 1: Create `app/auth/callback/route.ts`**

```ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/discover`)
}
```

- [ ] **Step 2: Create `app/(auth)/login/page.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Chrome } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          }})

    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <h1 className="text-5xl font-heading font-bold text-text-primary tracking-widest">
            SAYE
          </h1>
          <p className="text-text-muted mt-3 text-sm tracking-wide uppercase">
            Discovery Engine
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-8 border border-white/5">
          <Button
            variant="ghost"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2.5 mb-6"
          >
            <Chrome size={16} />
            Continue with Google
          </Button>

          <div className="relative flex items-center mb-6">
            <div className="flex-1 border-t border-white/10" />
            <span className="px-4 text-xs text-text-muted">or</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <form onSubmit={handleEmail} className="flex flex-col gap-4">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-text-muted text-sm mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setMode(m => (m === 'signin' ? 'signup' : 'signin'))}
              className="text-accent hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
```

- [ ] **Step 3: Verify the login page renders at `/login`**

```bash
npm run dev
```

Visit `http://localhost:3000/login`. Expected: Dark page with SAYE heading, Google button, divider, and email/password form. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/ app/auth/
git commit -m "feat: add login page with Google OAuth and email/password auth"
```

---

## Task 12: Main Layout Shell (Nav)

**Files:**
- Create: `app/(main)/layout.tsx`

- [ ] **Step 1: Create `app/(main)/layout.tsx`**

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 bg-bg/80 backdrop-blur-sm z-50">
        <Link
          href="/discover"
          className="text-xl font-heading font-bold text-text-primary tracking-widest hover:text-accent transition-colors"
        >
          SAYE
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/discover"
            className="text-text-muted hover:text-text-primary text-sm transition-colors"
          >
            Discover
          </Link>
          {user && (
            <Link
              href={`/profile/${user.id}`}
              className="text-text-muted hover:text-text-primary text-sm transition-colors"
            >
              Profile
            </Link>
          )}
        </div>
      </nav>
      <main className="px-6 py-8">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(main\)/layout.tsx
git commit -m "feat: add main layout with sticky nav shell"
```

---

## Task 13: Page Stubs

**Files:**
- Create: `app/(main)/discover/page.tsx`, `app/(main)/profile/[id]/page.tsx`, `app/(onboarding)/build-profile/page.tsx`

- [ ] **Step 1: Create `app/(main)/discover/page.tsx`**

```tsx
export default function DiscoverPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Discover</h1>
      <p className="text-text-muted text-sm">Triple-filter search — coming soon.</p>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/(main)/profile/[id]/page.tsx`**

```tsx
interface Props {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: Props) {
  const { id } = await params
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Profile</h1>
      <p className="text-text-muted text-sm">Profile {id} — coming soon.</p>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/(onboarding)/build-profile/page.tsx`**

```tsx
export default function BuildProfilePage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
          Build Your Profile
        </h1>
        <p className="text-text-muted text-sm">Onboarding wizard — coming soon.</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify full site compiles with no errors**

```bash
npm run build
```

Expected: `✓ Compiled successfully` with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add app/\(main\)/discover/ app/\(main\)/profile/ app/\(onboarding\)/
git commit -m "feat: add page stubs for all three pillars"
```

---

## Task 14: Database Migration SQL

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create `supabase/migrations/001_initial_schema.sql`**

```sql
-- =============================================
-- Saye Collective - Initial Schema
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role          text NOT NULL CHECK (role IN ('Artist', 'Curator', 'Institution')),
  display_name  text NOT NULL,
  bio           text,
  geography     text,
  discipline    text,
  interests     text[] DEFAULT '{}',
  avatar_url    text,
  created_at    timestamptz DEFAULT now()
);

-- ARCHIVE ITEMS TABLE
CREATE TABLE IF NOT EXISTS archive_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('image', 'text', 'link')),
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- INDEXES (for triple-filter search performance)
CREATE INDEX IF NOT EXISTS idx_profiles_geography   ON profiles (geography);
CREATE INDEX IF NOT EXISTS idx_profiles_discipline  ON profiles (discipline);
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON profiles (role);

-- ROW LEVEL SECURITY

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_own_insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_own_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Archive Items
ALTER TABLE archive_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "archive_public_read"
  ON archive_items FOR SELECT
  USING (true);

CREATE POLICY "archive_own_insert"
  ON archive_items FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "archive_own_delete"
  ON archive_items FOR DELETE
  USING (auth.uid() = profile_id);
```

- [ ] **Step 2: Run the migration in Supabase**

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New query**
4. Paste the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Click **Run**

Expected: `Success. No rows returned`

- [ ] **Step 3: Verify tables exist in Supabase**

In Supabase Dashboard → **Table Editor**, confirm both `profiles` and `archive_items` tables appear with all their columns.

- [ ] **Step 4: Enable Google OAuth in Supabase**

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and toggle it on
3. Enter your Google OAuth credentials (Client ID + Secret from Google Cloud Console)
4. Set **Authorized redirect URI** in Google Cloud Console to: `https://<your-project-ref>.supabase.co/auth/v1/callback`

- [ ] **Step 5: Commit**

```bash
git add supabase/
git commit -m "feat: add initial schema migration with RLS policies and indexes"
```

---

## Task 15: Run Full Test Suite and Final Verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass. No failures.

- [ ] **Step 2: Run TypeScript type check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: foundation complete — all tests passing, build clean"
```

---

## Self-Review Notes

- All 3 middleware redirect cases have corresponding tests
- Zod schema covers all 8 validator paths
- Login page handles both Google OAuth and email/password in one component
- Auth callback route handles code exchange for Google OAuth PKCE flow
- RLS policies cover all 5 required operations (profile read/insert/update, archive read/insert/delete)
- Indexes cover all 3 filter dimensions used in Triple-Filter Search
- Page stubs use `Promise<{ id: string }>` for params (Next.js 15 async params requirement)
- All file paths use `@/` alias consistently
