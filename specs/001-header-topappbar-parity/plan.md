# Implementation Plan: Header - TopAppBar UI Parity

**Branch**: `001-header-topappbar-parity` | **Date**: 2026-09-11 | **Spec**: `specs/001-header-topappbar-parity/spec.md`

**Input**: Feature specification from `/specs/001-header-topappbar-parity/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

The goal is to achieve visual parity for the mobile TopAppBar according to Figma frame 15:257. The implementation will likely be limited to the existing `src/components/layout/Navbar.tsx` component. The update ensures that existing desktop behavior and all functional interactions (menus, dropdowns, logout) are preserved, while no backend, API, authentication, or data changes are introduced.

## Technical Context

**Language/Version**: TypeScript (React) with Next.js (App Router) – as used in the existing Taskly codebase.

**Primary Dependencies**: next, react, react-dom, tailwindcss, @supabase/supabase-js, lucide-react

**Storage**: Supabase (PostgreSQL) – existing backend, no changes.

**Testing**: Playwright (existing) – no new testing frameworks required.

**Target Platform**: Web application (mobile and desktop browsers).

**Project Type**: Web application (Next.js App Router).

**Performance Goals**: Not specified – no new performance targets introduced.

**Constraints**: Must preserve existing design tokens; use approved spacing values from Tailwind config (e.g., `px-6` for 24px horizontal padding if available) or raw pixel values as per Figma.

**Scale/Scope**: UI parity for Header TopAppBar only – no impact on data scale.

## Constitution Check

_GATE: All constitution gates passed – no violations identified._

_Post‑Phase 0 research completed – no unknowns requiring investigation._

_GATE: Re-checked after Phase 1 design – passed._

Validation Gates:

- `pnpm format:check`
- `pnpm lint`
- `pnpm exec next typegen` (only when required)
- `pnpm exec tsc --noEmit`
- `pnpm build`
- `git diff --check`

## Project Structure

### Documentation (this feature)

```text
specs/001-header-topappbar-parity/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── components/
│   └── layout/
│       ├── Navbar.tsx (Expected to change)
│       ├── AppShell.tsx (Expected to remain unchanged)
│       ├── Sidebar.tsx (Expected to remain unchanged)
│       └── MobileDrawer.tsx (Expected to remain unchanged)
└── app/
    └── globals.css (Expected to remain unchanged)
```

**Structure Decision**: Single-project Next.js application structure modifying only the mobile TopAppBar component (`Navbar.tsx`). No new files required.

## Complexity Tracking

No constitution violations or additional complexity introduced.

## Git Discipline

- Review working-tree diff
- Exact-path staging only
- Never `git add .`
- Review cached diff
- Commit only after implementation + visual QA + technical validation + convergence
- Delegates do not commit
- Push only after approval
- Verify clean and synchronized local/remote state
