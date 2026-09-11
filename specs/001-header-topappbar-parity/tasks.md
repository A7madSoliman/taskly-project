# Implementation Tasks: Header - TopAppBar UI Parity

## Phase 1: Pre-implementation verification

- [x] T001 Confirm current branch is `001-header-topappbar-parity`
- [x] T002 Read `AGENTS.md` and verify understanding of the current `src/components/layout/Navbar.tsx` structure and relevant design tokens in `src/app/globals.css`
- [x] T003 Verify existing menu and avatar interaction behavior in the local browser before editing `src/components/layout/Navbar.tsx`
- [x] T004 Inspect relevant Next.js local docs only if the implementation would change Next.js behavior/config/API (not expected for this UI-only feature)

## Phase 2: Figma implementation preparation

- [x] T005 Review Target Header (node 15:257) and Style Guide (node 76:1757) using the approved Figma design-to-code workflow
- [x] T006 Verify BottomNavBar is explicitly excluded from scope and extract Figma-generated code for reference only (do not copy blindly)

## Phase 3: Navbar mobile visual update [US1]

- [x] T007 [US1] Update `src/components/layout/Navbar.tsx` mobile Header container to use: 80px total height, 24px horizontal padding, 12px vertical padding, `#F9F9FF` background, and `1px solid rgba(0,0,0,0.1)` bottom border
- [x] T008 [US1] Update `src/components/layout/Navbar.tsx` mobile brand layout: implement hamburger + TASKLY text (Inter Bold, 20px, 28px line-height, -0.5px letter-spacing, `#041B3C`) and remove separate mobile logo image
- [x] T009 [US1] Update `src/components/layout/Navbar.tsx` mobile avatar: 40x40px, 12px radius squircle, `#0052CC` background, `0 1px 1px rgba(0,0,0,0.05)` shadow, and Inter Bold 16px initials in white text

## Phase 4: Responsive isolation [US1]

- [x] T010 [US1] Enforce responsive isolation in `src/components/layout/Navbar.tsx`: explicitly isolate new 80px height and 24px horizontal padding to mobile breakpoints (e.g. via `lg:` classes) to prevent bleeding into desktop behavior
- [x] T011 [US1] Verify existing desktop `src/components/layout/Navbar.tsx` height, user name/job-title labels, and layout remain strictly unchanged on larger viewports

## Phase 5: Interaction preservation

- [x] T012 Verify no behavior regression in `src/components/layout/Navbar.tsx` for the hamburger menu and MobileDrawer opening interaction
- [x] T013 Verify no behavior regression in `src/components/layout/Navbar.tsx` for the avatar dropdown, click-outside dismissal handling, and logout flow
- [x] T014 Verify existing user initials generation and aria states (aria-expanded, aria-haspopup) remain intact in `src/components/layout/Navbar.tsx`

## Phase 6: Accessibility

- [x] T015 Verify semantic `<header>` landmark remains native in `src/components/layout/Navbar.tsx`
- [x] T016 Verify menu button retains accessible name and avatar control semantics remain intact in `src/components/layout/Navbar.tsx`
- [x] T017 Verify visible keyboard focus and effective touch targets are maintained, with no unnecessary ARIA introduced in `src/components/layout/Navbar.tsx`

## Phase 7: Automated testing decision

- [x] T018 [P] Analyze existing Playwright tests to determine if the `src/components/layout/Navbar.tsx` visual changes actually justify test adjustment (do not automatically create a new test unless regression surface requires it)

## Phase 8: Visual QA

- [x] T019 [P] Perform Mobile Visual QA at 390px viewport: verify 80px height, 24px padding, background, border, typography, avatar styling, and logo image removal
- [x] T020 [P] Perform Desktop Visual QA at >=1024px viewport: verify no mobile geometry leakage, existing labels remain unchanged, and avatar behavior remains unchanged

## Phase 9: Functional QA

- [x] T021 [P] Perform Functional QA: verify hamburger opens navigation, avatar dropdown opens/closes, click outside closes correctly, logout functions, and no console errors

## Phase 10: Technical validation

- [x] T022 Run `pnpm format:check` to validate code formatting
- [x] T023 Run `pnpm lint` to validate code quality
- [x] T024 Run `pnpm exec next typegen` (if required)
- [x] T025 Run `pnpm exec tsc --noEmit` to validate TypeScript compilation
- [x] T026 Run `pnpm build` to validate production build success
- [x] T027 Run `git diff --check` to verify no accidental whitespace errors

## Phase 11: Scope/diff review

- [x] T028 Verify application diff is limited to `src/components/layout/Navbar.tsx` (no Sidebar, MobileDrawer, BottomNav, API, or dependency changes) and await explicit approval before convergence
