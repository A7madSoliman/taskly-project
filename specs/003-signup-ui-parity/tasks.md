---

description: "Executable task breakdown for Feature 003 — Signup UI Parity"
---

# Tasks: Signup UI Parity — Desktop + Mobile

**Input**: Approved design documents in `specs/003-signup-ui-parity/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, and `checklists/implementation-readiness.md`

**Scope boundary**: Implement only `src/app/sign-up/page.tsx` and exact stable Signup assets when byte verification proves they are required. Do not change shared components, AuthService, Supabase, API/data model, global styling, other auth screens, dependencies, or test infrastructure.

## Phase 1: Setup and Evidence Collection

**Purpose**: Establish exact, bounded inputs before any source edit.

- [ ] T001 [P] Inventory `public/assets/svg/brand/logo-taskly.svg` and any required Figma Signup logo, visibility, and validation exports; reuse only byte-identical repository assets and record source, destination, format, dimensions, and SHA/byte evidence before any conditional promotion under `public/assets/svg/`.
- [ ] T002 [P] Audit `src/app/sign-up/page.tsx`, `src/components/ui/Input.tsx`, `src/components/ui/Button.tsx`, `src/components/shared/AuthHeader.tsx`, `src/lib/auth/password-validation.ts`, and `src/services/api/auth.service.ts` to enumerate the existing behavior/API invariants that the Signup-local edit must preserve.

---

## Phase 2: Foundational Signup-Local Structure

**Purpose**: Establish the single responsive Signup-local composition that all user stories use.

- [ ] T003 Update `src/app/sign-up/page.tsx` with the Signup-local responsive shell, using `md` / 768px as the sole Desktop transition while leaving `Input`, `Button`, `AuthHeader`, password utilities, AuthService, and Supabase untouched.
- [ ] T004 Update `src/app/sign-up/page.tsx` to use verified exact local assets only; if no byte-identical asset exists, promote the exact Figma export to the stable `public/assets/svg/` location selected in T001, never a temporary Figma URL or hand-authored substitute.

**Checkpoint**: The authorized implementation surface and asset evidence are ready for Desktop and Mobile composition work.

---

## Phase 3: User Story 1 — Complete Signup on Desktop (Priority: P1) 🎯 MVP

**Goal**: Match the Desktop authority at 1280×1060 while retaining the approved Signup flow.

**Independent Test**: At 1280×1060, compare the empty Signup page directly with node `1:1219`; valid submission retains the existing user-plus-session redirect behavior.

- [ ] T005 [US1] Implement the 1280×1060 Desktop header and main composition in `src/app/sign-up/page.tsx`: 80px header, 40px horizontal inset, exact Taskly mark/wordmark placement, 96px main top spacing, and 48px bottom spacing.
- [ ] T006 [US1] Implement the Desktop Signup card and intro in `src/app/sign-up/page.tsx`: 576px white card, 48px padding, 8px radius, `0 24px 48px rgba(4,27,60,0.06)` shadow, centered 30px/36px heading, exact subtitle, and exact fractional CSS values without rounding.
- [ ] T007 [US1] Implement Desktop field and label geometry in `src/app/sign-up/page.tsx`: 48px inputs, specified padding/radius/colors/typography, Name help text, and the separate uppercase “JOB TITLE” plus regular `(Optional)` treatment while retaining the optional controlled value.
- [ ] T008 [US1] Implement the Desktop password grid in `src/app/sign-up/page.tsx` as two 232px Password/Confirm Password columns with a 16px horizontal gap at `md` and above; retain the verified Password asset geometry and the existing Confirm Password control as the sole authorized divergence.
- [ ] T009 [US1] Implement the Desktop validation panel, CTA, footer, and decorative accent in `src/app/sign-up/page.tsx` with the approved panel, icon, gradient, typography, spacing, and accent values; keep the card content-driven so field/API/accessibility feedback expands it rather than clipping it.

**Checkpoint**: Desktop parity is complete without changing existing Signup behavior or shared APIs.

---

## Phase 4: User Story 2 — Complete Signup on Mobile (Priority: P1)

**Goal**: Match the independent Mobile authority at 390×940 without scaling the Desktop card.

**Independent Test**: At 390×940, the production form begins with five empty fields and matches node `1:923`; test-entered Figma examples do not persist as defaults.

- [ ] T010 [US2] Implement the Mobile header, main, and intro composition in `src/app/sign-up/page.tsx`: 80px header, 24px horizontal inset, 390×940 default state, 860px default Main region, 24px page gutters, left-aligned intro, Mobile heading/subtitle copy, and required spacing.
- [ ] T011 [US2] Implement Mobile field presentation in `src/app/sign-up/page.tsx`: Mobile label treatment, visible Name help text, 342×56px Name/Email/Job Title/Confirm Password geometry, 342×48px Password geometry, Mobile padding/radii/typography, and empty production values.
- [ ] T012 [US2] Implement the below-`md` password layout in `src/app/sign-up/page.tsx` as one 342px stacked Password/Confirm Password column with a 24px vertical gap; retain independent visibility state and make no visual divergence other than the authorized Confirm Password control.
- [ ] T013 [US2] Implement the Mobile-only visual treatment in `src/app/sign-up/page.tsx`: remove Desktop card/shadow/accent and visually hide the validation checklist while preserving its validation execution and accessible feedback; apply the 342×56px CTA and exact Mobile footer spacing.
- [ ] T014 [US2] Update dynamic Mobile layout behavior in `src/app/sign-up/page.tsx` so the 860px Main region remains a default-state reference, not a height cap: content grows naturally, the document scrolls vertically, and no fixed-height plus `overflow-hidden` combination clips feedback, focused controls, submit, or Login footer.

**Checkpoint**: Mobile parity is complete while validation, accessibility, and dynamic feedback remain usable.

---

## Phase 5: User Story 3 — Correct Invalid Entries (Priority: P1)

**Goal**: Preserve every existing validation and error-handling outcome through the parity edit.

**Independent Test**: Invalid Name, Email, Password, and Confirm Password inputs block submission with existing accessible feedback; changing fields preserves existing clearing behavior.

- [ ] T015 [US3] Preserve in `src/app/sign-up/page.tsx` the five controlled field values, empty initial state, Name/Email validators, `validatePassword` use, Confirm Password matching, and optional Job Title behavior without changing `src/lib/auth/password-validation.ts`.
- [ ] T016 [US3] Preserve in `src/app/sign-up/page.tsx` field-error clearing, API/server-error clearing, API/server/unexpected-error presentation, loading indication, disabled submission, and duplicate-submit protection without introducing a new error design.
- [ ] T017 [US3] Preserve in `src/app/sign-up/page.tsx` the existing `AuthService.signUp` call, trimmed Name and optional trimmed Job Title mapping, `name`/`job_title` metadata, user-plus-session-only `/project` redirect, and explicit no-session failure path without changing `src/services/api/auth.service.ts` or `src/lib/supabase/client.ts`.

---

## Phase 6: User Story 4 — Control Password Visibility (Priority: P2)

**Goal**: Retain independent, accessible visibility behavior in both responsive compositions.

**Independent Test**: Each password control changes only its own field presentation and retains the corresponding accessible action name.

- [ ] T018 [US4] Preserve in `src/app/sign-up/page.tsx` independent `showPassword` and `showConfirmPassword` state, unchanged field values on toggle, keyboard-operable controls, and distinct Show/Hide accessible names while applying the approved Desktop and Mobile icon placement.

---

## Phase 7: User Story 5 — Move to Login (Priority: P3)

**Goal**: Preserve the Login route and its viewport-specific footer placement.

**Independent Test**: The visible “Log in” control remains reachable and routes to `/login` at both authoritative viewports and dynamic error states.

- [ ] T019 [US5] Preserve the `/login` link and accessible footer content in `src/app/sign-up/page.tsx`, using the approved Desktop and Mobile footer geometry while keeping it reachable after dynamic feedback expands the page.

---

## Phase 8: Functional and Accessibility Validation

**Purpose**: Validate the preserved behavior after all Signup-local implementation work is complete.

- [ ] T020 Validate `src/app/sign-up/page.tsx` at both authoritative viewports with empty initial values, Figma examples entered only during visual checks, all Name/Email/Password/Confirm Password validation cases, field/API/server/unexpected-error clearing, loading/disabled state, metadata mapping, success redirect, and no-session failure behavior.
- [ ] T021 Validate accessibility in `src/app/sign-up/page.tsx`: labels, `aria-invalid`, `aria-describedby`, alert semantics, independent visibility-toggle names, keyboard operation, visible focus, and Mobile submit/Login-footer reachability while scrolling through long feedback.
- [ ] T022 Run the relevant existing authentication smoke coverage in `tests/e2e/smoke/auth.smoke.spec.ts` and add no new testing framework; add bounded Signup coverage only if it fits the existing Playwright configuration in `playwright.config.ts` without changing unrelated suites.

---

## Phase 9: Visual and Responsive Validation

**Purpose**: Compare implemented output directly with both Figma authorities and required dynamic states.

- [ ] T023 Compare `src/app/sign-up/page.tsx` at 1280×1060 directly with Figma node `1:1219`, including header/brand position, card, typography, labels, fields, 232px two-column password grid with 16px gap, validation panel, CTA, footer, exact assets, fractional values, accent, natural error expansion, and only the authorized Confirm Password divergence.
- [ ] T024 Compare `src/app/sign-up/page.tsx` at 390×940 directly with Figma node `1:923`, including header/brand position, no Desktop card/shadow/accent, intro, subtitle, field geometry, 342px stacked password layout with 24px gap, hidden checklist, CTA, footer, and empty production state.
- [ ] T025 Compare `src/app/sign-up/page.tsx` below, at, and above 768px—including 640–767px tablet widths—to prove Mobile composition remains below `md`, Desktop composition begins at `md`, and neither password layout leaks across the boundary.
- [ ] T026 Exercise `src/app/sign-up/page.tsx` single-field, multiple-field, Password, Confirm Password, API/server, unexpected-alert, and long-accessible-feedback states to prove Desktop expansion, Mobile growth/scrolling, focus visibility, and submit/Login-footer reachability without clipping.

---

## Phase 10: Technical Validation and Final Readiness

**Purpose**: Run the approved bounded quality gates after all implementation and fixes are complete.

- [ ] T027 Run `pnpm exec prettier --check <exact-touched-files>` for only Feature-touched paths such as `src/app/sign-up/page.tsx` and any verified promoted `public/assets/svg/` asset; do not globally reformat unrelated files.
- [ ] T028 Run `pnpm lint` and `pnpm exec tsc --noEmit` from the repository root after the final `src/app/sign-up/page.tsx` change.
- [ ] T029 Run `pnpm exec next typegen` from the repository root only if the final change requires regenerated Next.js types; otherwise document that the gate is not applicable.
- [ ] T030 Run `pnpm build`, the relevant existing tests identified in T022, and `git diff --check` from the repository root; review the final diff to ensure it is confined to `src/app/sign-up/page.tsx`, required exact assets, and approved Feature 003 artifacts.

---

## Dependencies and Execution Order

- T001 and T002 may run in parallel.
- T003 depends on T002. T004 depends on T001 and precedes any use of a promoted asset.
- T005–T009 depend on T003 and T004 where an asset is required; complete Desktop work before Desktop validation.
- T010–T014 depend on T003 and T004 where an asset is required; complete Mobile work before Mobile validation.
- T015–T019 depend on the responsive composition tasks that affect the same file; T018 follows T008 and T012, and T019 follows T009 and T013.
- T020–T022 depend on T005–T019. T023–T026 depend on T005–T019 and T020–T021.
- T027–T030 depend on all implementation and validation fixes being complete.

## Parallel Opportunities

- T001 and T002 are the only safe initial parallel tasks: they inspect distinct asset and source surfaces.
- Desktop and Mobile visual comparison may be split after T020–T021, but any correction to `src/app/sign-up/page.tsx` must be serialized and revalidated.

## Implementation Strategy

1. Complete evidence collection and the responsive Signup-local foundation.
2. Deliver the P1 Desktop and Mobile compositions while preserving the existing form contract.
3. Verify P1 invalid-entry behavior, then P2 independent toggles and P3 Login navigation.
4. Complete functional/accessibility, visual, and technical validation before implementation acceptance.
