# Implementation Tasks: TM-06 — Desktop Sidebar UI Parity

## Phase 1: Setup & Foundational
**Purpose**: Verify the environment and codebase readiness.
- [x] T001 Verify `Sidebar.tsx` exists and matches the expected pre-feature state before starting modifications.

---

## Phase 2: User Story 1 - Desktop Expanded Navigation (Priority: P1)

**Goal**: Achieve strict visual parity with Figma `1:986` for the expanded desktop sidebar.
**Independent Test**: The expanded sidebar matches `1:986` geometry, padding, typography, and colors exactly.

### Implementation for User Story 1

- [x] T002 [US1] Update root `aside` width to strictly enforce `256px` and apply `p-[16px]` outer padding in `src/components/layout/Sidebar.tsx`.
- [x] T003 [US1] Update brand header spacing to use `pb-[32px]` and remove the existing bottom border in `src/components/layout/Sidebar.tsx`.
- [x] T004 [US1] Update navigation item container padding to `px-[12px] py-[10px]` and corner radius to `rounded-[4px]` in `src/components/layout/Sidebar.tsx`.
- [x] T005 [US1] Update active state styling to use medium font weight, `#003d9b` text, and accurate drop-shadow in `src/components/layout/Sidebar.tsx`.
- [x] T006 [US1] Update inactive state typography to use medium font weight and `#041b3c` text in `src/components/layout/Sidebar.tsx`.
- [x] T007 [US1] Update footer styling to use `border-t-[rgba(195,198,214,0.2)]`, `pt-[25px]` padding, and change the logout button text to `#ba1a1a` in `src/components/layout/Sidebar.tsx`.

**Checkpoint**: Expanded state perfectly matches `1:986`.

---

## Phase 3: User Story 2 - Desktop Collapsed Navigation (Priority: P1)

**Goal**: Achieve strict visual parity with Figma `1:733` for the collapsed desktop sidebar.
**Independent Test**: The collapsed sidebar shrinks to exactly `80px` wide, with perfectly centered `48x48px` navigation icons.

### Implementation for User Story 2

- [x] T008 [US2] Update the `aside` collapsed width logic from 72px to `80px` in `src/components/layout/Sidebar.tsx`.
- [x] T009 [US2] Update the collapsed navigation link geometry to exactly `48x48px` (`size-[48px]`) while preserving centered icons in `src/components/layout/Sidebar.tsx`.
- [x] T010 [US2] Invert the collapse toggle icon rotation logic so it is rotated 180 degrees only when collapsed, matching Figma `1:733` in `src/components/layout/Sidebar.tsx`.

**Checkpoint**: Collapsed state perfectly matches `1:733`.

---

## Phase 4: Validation & Polish

**Purpose**: Execute all automated and manual validation gates to ensure no regressions occurred and visual parity is achieved.

- [x] T011 [P] Run `pnpm exec prettier --check src/components/layout/Sidebar.tsx`
- [x] T012 [P] Run `pnpm exec tsc --noEmit`
- [x] T013 [P] Run `pnpm lint`
- [x] T014 [P] Run `pnpm build`
- [x] T015 [P] Perform manual expanded comparison with Figma 1:986.
- [x] T016 [P] Perform manual collapsed comparison with Figma 1:733.
- [x] T017 [P] Verify collapse/expand transition behavior regression.
- [x] T018 [P] Verify active-route regression checking.
- [x] T019 [P] Verify Navbar TopAppBar regression protection.

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1**: Must be executed sequentially to avoid merge conflicts within `Sidebar.tsx`.
- **User Story 2**: Depends on User Story 1 completion to ensure expanded layout isn't broken by collapsed logic.
- **Validation (Phase 4)**: Must run only after all implementation tasks are completed.

### Parallel Opportunities

- Due to all changes occurring within a single file (`Sidebar.tsx`), implementation tasks T002-T010 **cannot** be parallelized safely.
- Validation tasks T011-T014 marked `[P]` can be run simultaneously in separate terminal sessions.
- Manual verification tasks T015-T019 marked `[P]` can be executed simultaneously during the UI review phase.

## Implementation Strategy

1. **Step-by-step Class Adjustments**: Make small, incremental updates to the Tailwind classes. Save and hot-reload frequently to verify behavior immediately.
2. **Preserve Logic**: Do not modify the `usePathname()`, `next/link`, `onToggleCollapse`, or `isCollapsed` React logic.
3. **No Spillage**: Ensure zero modifications are made to `AppShell.tsx`, `Navbar.tsx`, or `MobileDrawer.tsx`.
