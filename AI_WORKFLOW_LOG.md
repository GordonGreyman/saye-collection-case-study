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

---

## 10. Features Milestone A - Auth Flow Update (Browse First)

**Tool:** GPT-5 Codex via Codex CLI agent

**Key Prompt:**
> "Start implementing it step by step, review each time a task is done to verify if it is actually done."

**What it produced:** Migrated deprecated `middleware.ts` to `proxy.ts` with browse-first route policy, added `?next=` redirect support for protected `/build-profile`, added safe return URL sanitizer (`lib/auth/next-path.ts`), split login into server page plus client form for promise-based `searchParams` handling, preserved `next` through OAuth callback, and updated `(main)` nav to show `Join Saye` / `Complete Profile` / `Profile` based on auth plus profile state. Verification completed with lint, build, and targeted tests (`__tests__/proxy.test.ts`, `__tests__/auth/next-path.test.ts`).

---

## 11. Features Milestone B - Build Profile Wizard

**Tool:** GPT-5 Codex via Codex CLI agent

**Key Prompt:**
> "Start implementing it step by step, review each time a task is done to verify if it is actually done."

**What it produced:** Implemented the 5-screen onboarding/edit flow in `features/profiles/*` with a single React Hook Form instance, step-gated validation, role/identity/interests capture, local draft persistence (`saye_profile_draft`), edit-mode draft bypass, secure server action `upsertProfile()` that derives user from auth, and build-profile route integration that fetches existing profile defaults.

---

## 12. Features Milestone C - Discover Triple-Filter Engine

**Tool:** GPT-5 Codex via Codex CLI agent

**Key Prompt:**
> "Start implementing it step by step, review each time a task is done to verify if it is actually done."

**What it produced:** Implemented discover parser/query/UI stack: `parseDiscoverFilters`, `getProfiles`, `getFilterOptions`, client `FilterBar` URL-driven chip toggles, profile cards, dual empty states, and route-level loading/error boundaries under `app/(main)/discover/`. Added discover tests for filter parsing and query-filter application behavior.

---

## 13. Features Milestone D - Public Profile + Archive CRUD

**Tool:** GPT-5 Codex via Codex CLI agent

**Key Prompt:**
> "Start implementing it step by step, review each time a task is done to verify if it is actually done."

**What it produced:** Added profile/archive query and mutation layer (`features/archive/queries.ts`, `features/archive/actions.ts`) with owner checks for delete and auth-derived profile ownership for create. Implemented `ArchiveGrid`, `ArchiveItem`, and `AddBlockPanel` with owner-only controls and refresh-on-mutation. Replaced profile route placeholder with full public profile header and owner-aware archive rendering; added profile loading/error boundaries.

---

## 14. Features Milestone E - Cleanup and Verification

**Tool:** GPT-5 Codex via Codex CLI agent

**Key Prompt:**
> "Start implementing it step by step, review each time a task is done to verify if it is actually done."

**What it produced:** Replaced root `app/page.tsx` with redirect to `/discover`, added shared `lib/types.ts`, `lib/constants.ts`, and `components/ui/Textarea.tsx`, and ran repeated verification loops (targeted Jest suites, lint, TypeScript no-emit, and production build) after each milestone to validate completion before proceeding.

---

## 15. UX Gap Audit and Robustness Backlog Expansion

**Tool:** GPT-5 Codex via Codex CLI agent + web research

**Key Prompt:**
> "Look at the document again and try to locate UI and UX gaps and add them as tasks as well... do a complete audit check the net for what constitutes a robust website"

**What it produced:** Re-audited the features spec and expanded `docs/superpowers/plans/2026-04-23-saye-features.md` with a new Phase 7 UX/Product completeness backlog. Added concrete tasks for: (1) logout + account deletion lifecycle, (2) local image upload from device via storage integration, (3) back/save-exit controls in onboarding, (4) motion/feedback polish to improve perceived liveliness, and (5) a full robustness baseline covering accessibility, security, performance, observability, trust/legal, and discovery completeness.

---

## 16. Phase 7 Implementation - Account Lifecycle, Uploads, UX Controls, and Robustness

**Tool:** GPT-5 Codex via Codex CLI agent

**Key Prompt:**
> "did you implement them or just referenced them? If only reference now implement each and every one of them now"

**What it produced:** Implemented all requested Phase 7 gap tasks end-to-end: (1) account lifecycle controls with nav logout, `/settings/account`, and secure `/api/account/delete` flow (confirmation + password reauth + admin deletion + storage cleanup), (2) local image upload from device with validation/preview and Supabase Storage helper + storage RLS migration, (3) onboarding improvements with Back navigation, Save & Exit, and explicit draft resume/discard choice, (4) liveliness upgrades via global toast feedback and discover vitality indicator, (5) robust website baseline features including privacy/terms/community-guidelines/report-abuse pages, security headers, and discover search/sort/pagination, plus profile share metadata/copy-link UX.

**Verification:** `npm test` (11 suites, 44 tests), `npm run lint`, `npx tsc --noEmit`, `npm run build` all passing.

---

## 17. Post Detail Overlay & Interaction Polish — Design + Plan

**Tool:** Claude Opus 4.6 (plan mode) + Claude Sonnet 4.6 via Claude Code

**Key Prompt:**
> "I believe the posts shared by the artists curators etc which we see as rectangles, and that's all, should be interactable and when clicked they might act like how Notion or Dribbble handles the designs, a new page or a window opened on top right? If you believe so too, write the specs and implementation plans. But do not limit yourself to that specific feature only we are trying to make better what we currently have, in other words polishing. Research all art gallery, artist hub pages you deem important to check and then suggest improvements on our website."

**What it produced:** Full brainstorming session researching Dribbble, Are.na, ArtStation, Behance interaction patterns. Agreed on: (1) client-side overlay/lightbox (no URL routing), (2) interaction + discovery UX polish only — no visual changes. Produced `docs/superpowers/specs/2026-04-25-post-detail-overlay-and-interaction-polish-design.md` covering PostDetailOverlay component, hover affordances, ⌘K search focus, image URL upload bug fix, archive skeleton loading, Discover filter pulse, connections tab with real `getSuggestedProfiles` query. Followed by `docs/superpowers/plans/2026-04-25-post-detail-overlay-and-interaction-polish.md` — 12-task TDD implementation plan. Implementation via subagent-driven development in progress.
