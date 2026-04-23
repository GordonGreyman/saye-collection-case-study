# Saye Features Implementation Plan

> For agentic workers: use this as the execution checklist. Mark each checkbox as work is completed.

**Source spec:** `docs/superpowers/specs/2026-04-23-saye-features-design.md`  
**Date:** 2026-04-23  
**Goal:** Implement the full post-foundation scope for Saye: browse-first auth flow, onboarding/profile wizard, triple-filter discover, and public profile archive.

---

## 1) Outcomes

- Users can browse discovery and profile pages without logging in.
- Authentication only gates intent-driven actions (build/edit profile, archive mutations).
- Logged-in users can create or edit profiles via a 5-screen wizard with draft recovery.
- Discover page supports server-rendered triple-filtering with clear empty states.
- Public profile pages show profile metadata and archive masonry with owner-only CRUD.
- App shell and root route are cleaned up for production prototype readiness.

---

## 2) Compatibility Notes (Next.js 16)

These must be followed during implementation:

- `params` and `searchParams` are promise-based in App Router page/layout APIs.
- Route segment error boundaries should use `unstable_retry` (not `reset`).
- `middleware.ts` is deprecated in favor of `proxy.ts`; migrate during this plan.
- Keep expected errors as return values in Server Actions (`{ success } | { error }`).

---

## 3) Delivery Phases

| Phase | Scope | Primary Output |
|---|---|---|
| Phase 0 | Baseline and branch prep | Known-good starting point |
| Phase 1 | Auth and routing updates | Browse-first access model |
| Phase 2 | Shared contracts and UI primitives | Types/constants/textarea ready |
| Phase 3 | Onboarding + build profile | Wizard, action, edit mode |
| Phase 4 | Discover engine | Query layer + filter UX + states |
| Phase 5 | Public profile + archive | Profile header + archive CRUD |
| Phase 6 | Cleanup and hardening | Redirect cleanup + tests + docs |
| Phase 7 | UX and product completeness audit | Post-MVP quality and trust upgrades |

---

## 4) File Map (Planned Changes)

### New files

- `lib/types.ts`
- `lib/constants.ts`
- `components/ui/Textarea.tsx`
- `features/profiles/BuildProfileWizard.tsx`
- `features/profiles/WelcomeScreen.tsx`
- `features/profiles/RoleCard.tsx`
- `features/profiles/InterestPicker.tsx`
- `features/profiles/CelebrationScreen.tsx`
- `features/profiles/actions.ts`
- `features/profiles/queries.ts`
- `features/discover/FilterBar.tsx`
- `features/discover/ProfileCard.tsx`
- `features/discover/EmptyState.tsx`
- `features/discover/queries.ts`
- `features/discover/filters.ts`
- `features/archive/ArchiveGrid.tsx`
- `features/archive/ArchiveItem.tsx`
- `features/archive/AddBlockPanel.tsx`
- `features/archive/actions.ts`
- `features/archive/queries.ts`
- `app/(main)/discover/loading.tsx`
- `app/(main)/discover/error.tsx`
- `app/(main)/profile/[id]/loading.tsx`
- `app/(main)/profile/[id]/error.tsx`
- `__tests__/profiles/actions.test.ts`
- `__tests__/discover/queries.test.ts`
- `__tests__/archive/actions.test.ts`
- `__tests__/discover/filters.test.ts`

### Modified files

- `proxy.ts` (new canonical request gateway; replaces `middleware.ts`)
- `app/(auth)/login/page.tsx`
- `app/auth/callback/route.ts`
- `app/(main)/layout.tsx`
- `app/(onboarding)/build-profile/page.tsx`
- `app/(main)/discover/page.tsx`
- `app/(main)/profile/[id]/page.tsx`
- `app/page.tsx`
- `app/globals.css`
- `lib/validators/profile.ts`
- `AI_WORKFLOW_LOG.md`

### Removed files

- `middleware.ts` (replace with `proxy.ts` once logic is migrated and tests pass)

---

## 5) Detailed Task Plan

## Phase 0 - Baseline and Safety

**Task 0.1 - Baseline verification**

Files: none

- [ ] Run baseline checks before feature work:
  - `npm test`
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build`
- [ ] Save current status and branch from latest mainline.
- [ ] Confirm Supabase env vars exist in `.env.local`.

**Done when:** baseline passes and branch is ready.

---

## Phase 1 - Auth and Routing

**Task 1.1 - Migrate middleware to proxy and implement browse-first access**

Files:
- Create `proxy.ts`
- Remove `middleware.ts` after parity
- Update tests in `__tests__/middleware.test.ts` (rename to `__tests__/proxy.test.ts`)

- [ ] Port current request gateway logic into `proxy.ts` (`export function proxy(request)`).
- [ ] Implement route policy from the feature spec:
  - Always allow `/login`, `/auth/*`, static/internal assets.
  - Redirect authenticated users away from `/login` to `/discover`.
  - Redirect unauthenticated users from `/build-profile` to `/login?next=/build-profile`.
  - Allow public access to `/discover` and `/profile/[id]`.
- [ ] Keep matcher strict to avoid unnecessary proxy execution.
- [ ] Remove old profile-completion forced redirect from gateway.
- [ ] Update tests to assert new route table behavior.

**Done when:** proxy behavior matches spec and tests cover all auth permutations.

---

**Task 1.2 - Login return URL support**

Files:
- `app/(auth)/login/page.tsx`
- `app/auth/callback/route.ts`

- [ ] Read `searchParams` as promise-based in login page.
- [ ] Parse and sanitize `next`:
  - Accept only values that begin with `/`.
  - Fallback to `/discover`.
- [ ] For Google OAuth, include sanitized `next` in callback `redirectTo`.
- [ ] For email/password sign-in and sign-up, navigate to sanitized `next` after success.
- [ ] In callback route, preserve and forward `next` from callback URL after code exchange.

**Done when:** both OAuth and email flows reliably land on intended safe destination.

---

**Task 1.3 - Main nav intent-aware CTA**

Files:
- `app/(main)/layout.tsx`
- `features/profiles/queries.ts` (if helper query added)

- [ ] Fetch both auth user and corresponding profile in the server layout.
- [ ] Render nav variants:
  - Unauthenticated: `Join Saye -> /login`.
  - Authenticated without profile: `Complete Profile -> /build-profile`.
  - Authenticated with profile: `Profile -> /profile/[user.id]`.
- [ ] Preserve existing Discover link and sticky nav behavior.

**Done when:** nav state reflects real account/profile status on each request.

---

## Phase 2 - Shared Contracts and UI Primitives

**Task 2.1 - Add canonical types and constants**

Files:
- `lib/types.ts`
- `lib/constants.ts`

- [ ] Define `Profile` and `ArchiveItem` TypeScript types from spec.
- [ ] Add `GEOGRAPHY_PRESETS`, role-based `DISCIPLINE_PRESETS`, and `INTEREST_PRESETS`.
- [ ] Ensure constants are exported from a single source of truth for onboarding and discover.
- [ ] Normalize string casing and values so chips map directly to persisted values.

**Done when:** profile/discover/archive features share one typed contract and one preset source.

---

**Task 2.2 - Add shared Textarea component**

Files:
- `components/ui/Textarea.tsx`
- `__tests__/components/ui-smoke.test.tsx` (or dedicated textarea test)

- [ ] Build dark-theme `Textarea` API-compatible with `Input` conventions:
  - `label?: string`
  - `error?: string`
  - native `TextareaHTMLAttributes`
- [ ] Match visual tokens: surface background, subtle border, accent focus ring.
- [ ] Include accessibility hooks (`id`, label association, `aria-invalid` for errors).
- [ ] Add/update component test coverage.

**Done when:** onboarding bio field can use `Textarea` with existing form patterns.

---

## Phase 3 - Onboarding and Build Profile

**Task 3.1 - Extend profile schema for wizard needs**

Files:
- `lib/validators/profile.ts`
- `__tests__/validators/profile.test.ts`

- [ ] Keep current required domain fields (`role`, `display_name`, `geography`, `discipline`, interests min 1).
- [ ] Add validation guards for:
  - bio max length
  - interest count limits
  - trimmed non-empty custom text entries
- [ ] Add tests for custom geography/discipline/interest entry paths.

**Done when:** schema supports both preset and custom values with clear validation.

---

**Task 3.2 - Implement profile upsert server action**

Files:
- `features/profiles/actions.ts`
- `__tests__/profiles/actions.test.ts`

- [ ] Create `upsertProfile()` in a `'use server'` module.
- [ ] Derive user via server auth (`supabase.auth.getUser()`), never trust client id.
- [ ] Perform `INSERT ... ON CONFLICT (id) DO UPDATE`.
- [ ] Return typed expected results:
  - `{ success: true }`
  - `{ error: string }`
- [ ] Unit test success/failure/auth-missing branches.

**Done when:** profile writes are secure and idempotent.

---

**Task 3.3 - Build wizard component tree**

Files:
- `features/profiles/BuildProfileWizard.tsx`
- `features/profiles/WelcomeScreen.tsx`
- `features/profiles/RoleCard.tsx`
- `features/profiles/InterestPicker.tsx`
- `features/profiles/CelebrationScreen.tsx`

- [ ] Implement single `useForm` at wizard root using `profileSchema`.
- [ ] Implement 5 screens:
  - Screen 0: Welcome (new users only)
  - Screen 1: Role
  - Screen 2: Identity
  - Screen 3: Interests
  - Screen 4: Celebration
- [ ] Implement step-specific validation before advancing.
- [ ] Use design-specified animation and chip/card active states.
- [ ] Keep screen components presentation-first and push orchestration to wizard root.

**Done when:** wizard can complete full data capture flow and call action successfully.

---

**Task 3.4 - Draft persistence and edit mode behavior**

Files:
- `features/profiles/BuildProfileWizard.tsx`

- [ ] Implement `localStorage` draft key `saye_profile_draft`.
- [ ] Save draft on step transitions.
- [ ] On mount:
  - Rehydrate from draft only for create mode (no `defaultValues`).
  - Ignore draft in edit mode.
- [ ] Clear draft after successful submit.
- [ ] Skip welcome screen in edit mode.
- [ ] Celebration screen auto-redirect to `/discover` after 2500ms.

**Done when:** interrupted onboarding recovers cleanly and edit mode is deterministic.

---

**Task 3.5 - Build-profile route integration**

Files:
- `app/(onboarding)/build-profile/page.tsx`
- `features/profiles/queries.ts`

- [ ] Fetch signed-in user and existing profile server-side.
- [ ] Render wizard with `defaultValues` when profile exists.
- [ ] Handle unauthenticated state by redirect (should be pre-gated by proxy, still guard).
- [ ] Provide loading and error fallback behavior within the route where needed.

**Done when:** `/build-profile` supports both first-time onboarding and profile editing.

---

## Phase 4 - Discover Engine

**Task 4.1 - Discover query layer**

Files:
- `features/discover/queries.ts`
- `features/discover/filters.ts`
- `__tests__/discover/queries.test.ts`
- `__tests__/discover/filters.test.ts`

- [ ] Implement parsed filter model with arrays per category:
  - `geography[]`
  - `discipline[]`
  - `interests[]`
- [ ] Parse `searchParams` robustly for both `string` and `string[]`.
- [ ] Implement `getProfiles(filters)` with AND-across-categories semantics.
- [ ] Implement `getFilterOptions()` with distinct options:
  - geographies and disciplines from profiles table
  - interests via `unnest(interests)`
- [ ] Cap discover result size to 50.
- [ ] Add tests for parser and query-builder branch behavior.

**Done when:** discover data layer is deterministic and filter-safe.

---

**Task 4.2 - Discover UI components**

Files:
- `features/discover/FilterBar.tsx`
- `features/discover/ProfileCard.tsx`
- `features/discover/EmptyState.tsx`

- [ ] Build stateless `FilterBar` controlled by props from server page.
- [ ] Use `router.replace()` + `startTransition()` on chip updates.
- [ ] Render pending visual state (`opacity-50`) during transitions.
- [ ] Build `ProfileCard` with:
  - initials avatar
  - role badge
  - display name, discipline, geography tag
  - hover motion and capped stagger timing
- [ ] Implement both empty states:
  - no profiles exist
  - filters produced no results

**Done when:** filter UX feels responsive and empty states are context-aware.

---

**Task 4.3 - Discover page integration + boundaries**

Files:
- `app/(main)/discover/page.tsx`
- `app/(main)/discover/loading.tsx`
- `app/(main)/discover/error.tsx`

- [ ] Update page to promise-based `searchParams`.
- [ ] Run `getProfiles` and `getFilterOptions` in parallel via `Promise.all`.
- [ ] Render brand header, filter bar, then profile grid.
- [ ] Add loading skeleton route segment.
- [ ] Add error boundary route segment as client component using `unstable_retry`.

**Done when:** discover is fully server-rendered with resilient loading/error behavior.

---

## Phase 5 - Public Profile and Archive

**Task 5.1 - Archive data layer and secure actions**

Files:
- `features/archive/queries.ts`
- `features/archive/actions.ts`
- `__tests__/archive/actions.test.ts`

- [ ] Implement `getProfile(id)` and `getArchiveItems(id)` query helpers.
- [ ] Implement `addArchiveItem({ type, content })`:
  - derive `profile_id` from server auth
  - validate type/content
  - return expected success/error shape
- [ ] Implement `deleteArchiveItem(id)`:
  - verify item owner before delete
  - return expected success/error shape
- [ ] Add tests for auth guard and ownership enforcement branches.

**Done when:** archive mutations are impossible for non-owners.

---

**Task 5.2 - Archive UI components**

Files:
- `features/archive/ArchiveGrid.tsx`
- `features/archive/ArchiveItem.tsx`
- `features/archive/AddBlockPanel.tsx`

- [ ] Implement masonry layout and `break-inside-avoid` wrappers.
- [ ] Pass `isOwner` explicitly to each rendered item.
- [ ] Implement per-type rendering:
  - text card + timestamp
  - image with constrained height and basic alt
  - link card with domain badge
- [ ] Implement owner-only delete confirmation UI.
- [ ] Implement owner-only add panel with type switching and inline error display.
- [ ] Trigger `router.refresh()` after successful add/delete.

**Done when:** archive CRUD behaves correctly for owner vs visitor.

---

**Task 5.3 - Public profile page integration + boundaries**

Files:
- `app/(main)/profile/[id]/page.tsx`
- `app/(main)/profile/[id]/loading.tsx`
- `app/(main)/profile/[id]/error.tsx`

- [ ] Use promise-based `params`.
- [ ] Fetch profile, archive, and current user in parallel.
- [ ] Call `notFound()` when profile is missing.
- [ ] Compute `isOwner` and thread it to header and archive components.
- [ ] Render profile header metadata and `Edit Profile` CTA for owner only.
- [ ] Add loading skeleton and client error boundary (`unstable_retry`).

**Done when:** `/profile/[id]` is publicly viewable and owner-aware.

---

## Phase 6 - Cleanup, Verification, and Documentation

**Task 6.1 - Cleanup app root and styling**

Files:
- `app/page.tsx`
- `app/globals.css`

- [ ] Replace starter page with `redirect('/discover')`.
- [ ] Commit pending design token styles in `globals.css`.
- [ ] Remove dead imports or stale boilerplate remnants.

**Done when:** app opens directly into discover and baseline styles are stable.

---

**Task 6.2 - Expand and run test suite**

Files:
- `__tests__/proxy.test.ts`
- new test files listed above

- [ ] Add/refresh tests for:
  - browse-first proxy routing
  - login next sanitization helper
  - profile action auth guarantees
  - discover filter parsing logic
  - archive action ownership checks
- [ ] Run:
  - `npm test`
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build`

**Done when:** all automated checks pass with no TypeScript or build regressions.

---

**Task 6.3 - Manual QA matrix**

Files: none

- [ ] Validate route behavior by state:
  - Logged out: `/discover` and `/profile/[id]` accessible.
  - Logged out: `/build-profile` redirects to `/login?next=/build-profile`.
  - Logged in/no profile: nav shows `Complete Profile`.
  - Logged in/with profile: nav shows profile link.
- [ ] Validate onboarding:
  - draft survives refresh for create mode
  - edit mode ignores stale draft
  - celebration redirects at expected timing
- [ ] Validate discover:
  - chip filters update URL and results
  - clear filters works
  - both empty states render in correct scenarios
- [ ] Validate archive:
  - owner can add/delete
  - visitor cannot see mutation controls

**Done when:** all spec-critical user journeys pass in browser.

---

**Task 6.4 - AI workflow log updates**

Files:
- `AI_WORKFLOW_LOG.md`

- [ ] Append milestone entries for:
  - auth flow update
  - build profile wizard
  - discover filter engine
  - archive CRUD
  - cleanup and verification
- [ ] Include tool and key prompt summary per milestone.

**Done when:** audit trail satisfies submission requirement.

---

## Phase 7 - UX and Product Completeness Audit Backlog

These tasks are derived from a focused UX gap audit against the feature spec and implementation, plus external standards (NN/g heuristics, WCAG 2.2, Core Web Vitals, OWASP, and platform docs).

Reference set used for this audit:
- NN/g 10 Usability Heuristics (visibility, user control, error recovery)
- W3C WCAG 2.2 Overview + Quick Reference
- web.dev Core Web Vitals thresholds (LCP/INP/CLS)
- OWASP Top 10 2021 (A01 and related control guidance)
- Supabase docs for `signOut()`, account deletion constraints, and Storage uploads

**Task 7.1 - Account lifecycle controls (logout + delete account)**

Files:
- `app/(main)/layout.tsx`
- `app/(main)/settings/account/page.tsx` (new)
- `features/auth/actions.ts` (new)
- `app/api/account/delete/route.ts` or `supabase/functions/delete-account` (new)
- `__tests__/auth/account-lifecycle.test.ts` (new)

- [ ] Add a visible account menu for authenticated users with `Log out`.
- [ ] Implement client logout with Supabase `signOut()` and route back to `/discover`.
- [ ] Add account settings page with a destructive `Delete account` flow (typed confirmation + reauth gate).
- [ ] Implement secure account deletion on server-only boundary (never expose `service_role` key).
- [ ] Define deletion semantics:
  - hard delete vs soft delete
  - profile/archive/storage cleanup
  - post-delete redirect + signed-out state
- [ ] Add tests for unauthorized deletion attempts, reauth failures, and successful account removal.

**Done when:** users can safely end session and fully close account from the UI without admin intervention.

---

**Task 7.2 - Local image upload for archive (not only URL)**

Files:
- `features/archive/AddBlockPanel.tsx`
- `features/archive/actions.ts`
- `features/archive/upload.ts` (new helper)
- `supabase/migrations/*` (storage/RLS policy updates if needed)
- `__tests__/archive/upload.test.ts` (new)

- [ ] Add `Upload Image` mode using `<input type="file" accept="image/*">` and optional drag/drop.
- [ ] Upload selected files to Supabase Storage bucket (public read or signed URL strategy).
- [ ] Validate file constraints before upload:
  - MIME type allowlist
  - max file size
  - upload error handling and retry messaging
- [ ] Show local preview, upload progress, and final persisted archive item.
- [ ] Keep existing URL mode as fallback.
- [ ] Add ownership and RLS checks for storage objects and archive rows.

**Done when:** users can add archive images from local device with validation, progress feedback, and secure persistence.

---

**Task 7.3 - Onboarding wizard control (back, save/exit, recovery)**

Files:
- `features/profiles/BuildProfileWizard.tsx`
- `features/profiles/WelcomeScreen.tsx`
- `__tests__/profiles/wizard-navigation.test.tsx` (new)

- [ ] Add `Back` controls on Step 2 and Step 3.
- [ ] Keep user-entered data intact when moving backward.
- [ ] Add `Save and exit` action to return to `/discover` without losing draft.
- [ ] Add explicit draft restore affordance when draft exists (continue vs discard).
- [ ] Ensure edit mode behavior remains deterministic (server defaults override stale drafts).

**Done when:** users can navigate both directions and safely leave/re-enter onboarding without frustration.

---

**Task 7.4 - "Feels alive" UX pass (motion, feedback, state communication)**

Files:
- `app/(main)/discover/page.tsx`
- `app/(main)/profile/[id]/page.tsx`
- `features/*` UI components as needed
- `components/ui/Toast.tsx` (new, if adopted)

- [ ] Introduce purposeful motion system:
  - page-entry transitions
  - staggered list reveals
  - meaningful hover/press responses
- [ ] Add user-feedback surfaces:
  - success toasts for archive/profile mutations
  - inline async status messages (`saving`, `uploaded`, `failed`)
- [ ] Add subtle social vitality cues on discover:
  - "new this week" indicator
  - optional lightweight activity hints (non-realtime is acceptable)
- [ ] Ensure every async action has visible status and completion signal.

**Done when:** the product communicates state changes clearly and interaction feels responsive rather than static.

---

**Task 7.5 - Robust website baseline audit (core platform quality)**

Files:
- `docs/superpowers/audits/2026-04-23-robustness-audit.md` (new)
- feature files/tests per findings

- [ ] Accessibility (WCAG 2.2 target: at least AA):
  - keyboard navigation and no keyboard traps
  - visible focus indicators
  - semantic status/error announcements
  - non-text alternatives for meaningful imagery
- [ ] Security hardening (OWASP Top 10 aware):
  - strict server-side authorization checks for all mutations
  - least privilege and deny-by-default route/data access
  - logging and monitoring of authz/authn failures
- [ ] Performance and stability:
  - Core Web Vitals budgets: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at p75
  - image optimization strategy and payload budgets
  - skeletons/placeholders for all high-latency routes
- [ ] Reliability and observability:
  - centralized error tracking
  - audit logs for destructive actions
  - uptime/health instrumentation
- [ ] Trust and policy essentials:
  - Privacy Policy
  - Terms of Use
  - Community Guidelines
  - Report abuse/contact path
- [ ] Product completeness essentials for discovery platforms:
  - search within discover
  - sort options (recent, discipline, geography)
  - pagination/infinite scroll
  - shareable profile links and social preview metadata

**Done when:** the platform meets baseline expectations for accessibility, security, performance, reliability, trust, and discoverability.

---

## 6) Acceptance Checklist (Release Gate)

- [ ] Browse-first auth behavior matches route matrix.
- [ ] Login round-trip respects safe `next` destination.
- [ ] Build profile supports create and edit mode with local draft logic.
- [ ] Discover supports multi-category filtering and robust empty states.
- [ ] Public profile renders owner-aware archive CRUD and visitor-safe readonly mode.
- [ ] Loading and error boundaries exist for discover and profile route segments.
- [ ] Root route redirects to `/discover`.
- [ ] Test, lint, typecheck, and build all pass.
- [ ] `AI_WORKFLOW_LOG.md` updated with all required checkpoints.

---

## 7) Acceptance Checklist (UX/Robustness Expansion)

- [ ] Authenticated users can log out from any main route.
- [ ] Users can self-delete account with explicit confirmation and secure server enforcement.
- [ ] Archive supports local image upload with validation and progress.
- [ ] Onboarding supports back navigation and save/exit recovery.
- [ ] Async actions expose clear status and success/failure feedback.
- [ ] Accessibility review passes critical WCAG 2.2 AA checks for keyboard, focus, errors, and status messages.
- [ ] Security review confirms owner-only mutation guarantees and deny-by-default patterns.
- [ ] Performance budget targets are defined and measured with p75 CWV thresholds.
- [ ] Trust/legal pages and reporting path are publicly available.

---

## 8) Risks and Mitigations

- **Risk:** route guard regression while migrating to `proxy.ts`.  
  **Mitigation:** keep parity tests, migrate in one isolated task, remove `middleware.ts` only after passing tests.

- **Risk:** stale query params or unsafe redirect in login flow.  
  **Mitigation:** centralize `next` sanitizer helper and unit test unsafe values.

- **Risk:** localStorage draft conflicts with edit mode.  
  **Mitigation:** explicit precedence rules and tests for both modes.

- **Risk:** archive delete authorization bypass.  
  **Mitigation:** server-side ownership check before mutation plus action tests.

- **Risk:** Next.js API drift (`reset` vs `unstable_retry`, async request props).  
  **Mitigation:** code to current local `node_modules/next/dist/docs` conventions only.

---

## 9) Out of Scope (kept from feature spec)

- Avatar upload.
- Realtime archive updates.
- Discover pagination beyond 50 results.
- Email notifications.
- Social graph features (likes/follows).
