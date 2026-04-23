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

## 4. Foundation Implementation (Tasks 4–15)

**Tool:** Claude Sonnet 4.6 via Claude Code (executing-plans skill)

**Key Prompt:**
> "Continue the implementation of the plan keeping the same rigor and logging into AI workflow log when necessary."

**What it produced:** Full foundation scaffold across 12 commits:
- Jest v30 test infrastructure with `next/jest` transformer and `@testing-library/jest-dom`
- Supabase browser and server client factories (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- Auth guard middleware with 3 redirect cases (unauthenticated → /login, no profile → /build-profile, authenticated on /login → /discover) — 4 TDD tests passing
- Zod v4 profile schema with role enum, display_name length, interests array bounds — 8 TDD tests passing
- `Button` component using `HTMLMotionProps<'button'>` to resolve Framer Motion v12 type conflicts — 4 tests passing
- `Card`, `Input`, `Badge` UI components — 3 smoke tests passing
- Root layout with Space Grotesk (heading) and Inter (body) via `next/font/google`
- Login page with Google OAuth (`signInWithOAuth`) and email/password auth; `Globe` icon used (lucide-react v1 has no `Chrome` icon)
- OAuth callback route (`/auth/callback`) for PKCE code exchange
- Main layout shell with sticky nav linking Discover + Profile
- Page stubs for `/discover`, `/profile/[id]`, and `/build-profile` with async params (Next.js 15/16 requirement)
- Supabase migration SQL: `profiles` + `archive_items` tables, 3 performance indexes, full RLS policies

**Verification:** 19 tests passing, `tsc --noEmit` clean, `npm run build` compiles all 6 routes successfully.

**Adaptation notes:** Tailwind v4 has no `tailwind.config.ts` — design tokens live in `app/globals.css` under `@theme`. Middleware tests required `@jest-environment node` docblock since jsdom lacks the Web `Request` global.
