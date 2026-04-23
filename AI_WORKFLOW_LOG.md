# AI Workflow Log — Saye Collective Discovery Engine

> This file documents the AI tools and key prompts used to build the core logic of this project, as required by the Saye Collective submission brief.

---

## 1. Project Architecture & Foundation Design

**Tool:** Claude Opus 4.6 via Claude Code (plan mode)

**Key Prompt:**
> "Set the foundational ground for this project referring to the kickstarter."

**What it produced:** Full foundation design spec covering feature-based folder structure (Next.js App Router route groups), design system tokens (black/neon purple palette), Supabase schema with RLS, auth flow with Google OAuth, and middleware redirect logic. Saved to `docs/superpowers/specs/2026-04-23-saye-foundation-design.md`.

---

## 2. Implementation Planning

**Tool:** Claude Opus 4.6 via Claude Code (plan mode)

**Key Prompt:**
> "Write an implementation plan for the foundation — scaffold, design tokens, auth middleware, Supabase helpers, UI components, page stubs, and DB migration."

**What it produced:** 15-task implementation plan with TDD steps, full code for each task, exact file paths, and expected test output. Saved to `docs/superpowers/plans/2026-04-23-saye-foundation.md`.

---

## 3. Project Scaffold

**Tool:** Claude Sonnet 4.6 via Claude Code (subagent)

**Key Prompt:**
> "Run create-next-app with TypeScript, Tailwind, ESLint, App Router, no src/ dir, @/* alias."

**What it produced:** Full Next.js 16.2.4 scaffold with Tailwind v4, TypeScript strict mode, ESLint flat config, and @/* path alias.

---

## 4. Auth Guard Middleware

**Tool:** Claude Sonnet 4.6 via Claude Code

**Key Prompt:**
> "Write middleware.ts that redirects unauthenticated users to /login, logged-in users with no profile to /build-profile, and logged-in users already on /login to /discover. Use @supabase/ssr createServerClient. Write the Jest tests first."

**What it produced:** `middleware.ts` with 3 redirect cases using Supabase SSR cookie handling; `__tests__/middleware.test.ts` with 4 TDD tests (red → green). Tests required `@jest-environment node` docblock — jsdom lacks the Web `Request` global that `next/server` needs at import time.

---

## 5. Profile Validation Schema

**Tool:** Claude Sonnet 4.6 via Claude Code

**Key Prompt:**
> "Write a Zod schema for the profile form: role must be Artist/Curator/Institution enum, display_name 2–50 chars, bio optional max 300, geography and discipline required, interests array min 1 max 10. Write failing tests first."

**What it produced:** `lib/validators/profile.ts` with `profileSchema` and exported `ProfileFormData` type; `__tests__/validators/profile.test.ts` with 8 TDD tests covering all validation paths.

---

## 6. Design System Components

**Tool:** Claude Sonnet 4.6 via Claude Code

**Key Prompt:**
> "Build Button (primary + ghost variants, Framer Motion press animation), Card (dark surface with purple glow on hover), Input (dark-themed with label and error), Badge (role and interest variants). Use the design tokens from globals.css."

**What it produced:** `components/ui/Button.tsx` using `HTMLMotionProps<'button'>` as the base type (required for Framer Motion v12 — spreading `ButtonHTMLAttributes` causes type conflicts on `onDrag`, `onAnimationStart`); `Card.tsx`, `Input.tsx`, `Badge.tsx`; 7 tests total across Button and UI smoke suite.

---

## 7. Auth Flow UI

**Tool:** Claude Sonnet 4.6 via Claude Code

**Key Prompt:**
> "Build the login page with Google OAuth via signInWithOAuth and email/password via signInWithPassword/signUp. Single component that toggles signin/signup mode. Build the /auth/callback route handler for PKCE code exchange."

**What it produced:** `app/(auth)/login/page.tsx` — client component with Google OAuth (redirects to `/auth/callback`) and email/password form with loading/error state; `app/auth/callback/route.ts` — GET handler that exchanges the OAuth code for a session then redirects to `/discover`. Used `Globe` icon (lucide-react v1.9 does not include `Chrome`).

---

## 8. Database Schema

**Tool:** Claude Sonnet 4.6 via Claude Code

**Key Prompt:**
> "Write the Supabase migration SQL for profiles (id references auth.users, role enum check, display_name, bio, geography, discipline, interests text[], avatar_url) and archive_items (id, profile_id FK, type enum check, content). Add RLS policies for public read, owner insert/update/delete. Add indexes on geography, discipline, role for triple-filter search performance."

**What it produced:** `supabase/migrations/001_initial_schema.sql` — both tables with CHECK constraints, RLS enabled with 6 policies, 3 indexes covering all triple-filter dimensions.

---

## 9. Verification

**Tool:** Claude Sonnet 4.6 via Claude Code

**Key Prompt:**
> "Run the full test suite, tsc --noEmit, and npm run build. Confirm 19 tests pass and all 6 routes compile."

**What it produced:** 19 tests passing (middleware ×4, validator ×8, Button ×4, UI smoke ×3), zero TypeScript errors, clean production build across `/login`, `/auth/callback`, `/discover`, `/profile/[id]`, `/build-profile`.
