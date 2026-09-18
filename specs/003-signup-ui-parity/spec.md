# Feature Specification: Signup UI Parity — Desktop + Mobile

**Feature Branch**: `003-signup-ui-parity`
**Created**: 2026-09-19
**Status**: Draft
**Input**: User description: "Bring the existing Signup experience into exact Desktop and Mobile visual parity while preserving all approved Signup behavior."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Complete Signup on Desktop (Priority: P1)

As a prospective Taskly user on Desktop, I can complete Signup in an interface matching the approved Desktop design without losing validation, accessibility, or account-creation behavior.

**Why this priority**: Account creation is the primary outcome, and Desktop is one of the Feature's two independent authorities.

**Independent Test**: At `1280 × 1060`, inspect the empty page, complete all required fields, optionally enter Job Title, submit, and verify both visual parity and the approved success outcome.

**Acceptance Scenarios**:

1. **Given** Signup is opened at `1280 × 1060`, **When** the page appears, **Then** its shell, header, container, typography, fields, validation presentation, action, footer, assets, and accent match node `1:1219`, except for the authorized Confirm Password control divergence.
2. **Given** valid values and a successful authenticated response, **When** Signup completes, **Then** the user is redirected to `/project` under existing rules.
3. **Given** invalid input or a server failure, **When** Signup is submitted, **Then** existing accessible validation and error behavior remains available.

---

### User Story 2 - Complete Signup on Mobile (Priority: P1)

As a prospective Taskly user on Mobile, I can use a purpose-built Mobile Signup composition matching the approved Mobile design rather than a scaled Desktop card.

**Why this priority**: Mobile is an independent authority and is equally required for Feature completion.

**Independent Test**: At `390 × 940`, inspect the empty production form, verify Mobile-specific composition and copy, complete all fields, exercise validation and visibility controls, and submit.

**Acceptance Scenarios**:

1. **Given** Signup is opened at `390 × 940`, **When** the page appears, **Then** it has the shell, gutters, intro, field geometry, stacked password layout, action, and footer from node `1:923`, without a Desktop card surface, card shadow, accent, or visible password checklist.
2. **Given** the production Mobile form first appears, **When** no input has occurred, **Then** all five fields are empty despite the example Name and Password shown in Figma.
3. **Given** visual validation needs the populated Figma state, **When** the example values are entered in a test scenario, **Then** the populated appearance can be compared without changing production defaults.
4. **Given** the checklist is hidden on Mobile, **When** an invalid password is submitted, **Then** every existing password rule remains active with accessible feedback.

---

### User Story 3 - Correct Invalid Entries (Priority: P1)

As a prospective user, I receive clear feedback for invalid values and can correct fields without stale field or server errors blocking me.

**Why this priority**: TM-03 explicitly requires validation and error handling, which visual parity must not weaken.

**Independent Test**: Submit each invalid boundary case, verify submission is blocked and the relevant error is accessible, then edit the field and verify existing clearing behavior.

**Acceptance Scenarios**:

1. **Given** a required field is empty or malformed, **When** submitted, **Then** Signup is blocked with a clear field-specific message.
2. **Given** a field error is visible, **When** that field changes, **Then** its error clears under current behavior.
3. **Given** a server error is visible, **When** any field changes, **Then** that error clears under current behavior.

---

### User Story 4 - Control Password Visibility (Priority: P2)

As a prospective user, I can independently reveal or conceal Password and Confirm Password without changing either value.

**Why this priority**: Both controls are approved functionality that must survive parity work.

**Independent Test**: Enter both values, toggle each control independently, and verify only its associated field changes presentation while accessible names remain correct.

**Acceptance Scenarios**:

1. **Given** both fields contain values, **When** Password visibility is toggled, **Then** Confirm Password is unaffected.
2. **Given** both fields contain values, **When** Confirm Password visibility is toggled, **Then** Password is unaffected.
3. **Given** either control is reached by keyboard or assistive technology, **When** state changes, **Then** its accessible name communicates the available action.

---

### User Story 5 - Move to Login (Priority: P3)

As a person with an account, I can identify and use the Login link from either viewport.

**Why this priority**: The footer route is present in both authoritative frames.

**Independent Test**: At both viewports, verify footer placement and typography, activate “Log in,” and confirm `/login` navigation.

**Acceptance Scenarios**:

1. **Given** Signup is displayed, **When** “Log in” is activated, **Then** the user is taken to `/login`.

### Edge Cases

- Names outside 3–50 characters or containing numbers, symbols, emojis, leading/trailing spaces, or consecutive spaces are rejected; supported accented and Arabic letters remain accepted.
- Empty or malformed Email is rejected.
- Password outside 8–64 characters, containing whitespace, or missing uppercase, lowercase, digit, or special-character content is rejected.
- Nonmatching Confirm Password is rejected; empty Job Title does not block Signup.
- Toggling one password field never toggles the other or changes either value.
- Server errors remain accessible until existing clearing behavior is triggered.
- A user-without-session response follows the existing failure path and does not redirect.
- Mobile validation remains active with the checklist hidden.
- Validation and server messages remain readable and operable without clipping critical controls.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Production MUST begin with Name, Email, Job Title, Password, and Confirm Password empty.
- **FR-002**: All five fields MUST remain; Name, Email, Password, and Confirm Password are required and Job Title is optional.
- **FR-003**: Name MUST remain 3–50 characters, allow supported English, accented, and Arabic letters separated by single spaces, and reject numbers, special characters, emojis, symbols, and consecutive spaces.
- **FR-004**: Email MUST remain required and reject invalid formats.
- **FR-005**: Password MUST remain required, contain 8–64 characters, no whitespace, and at least one uppercase letter, lowercase letter, digit, and supported special character.
- **FR-006**: Confirm Password MUST remain required and match Password.
- **FR-007**: Password and Confirm Password MUST retain independent visibility controls; toggling one MUST NOT affect the other.
- **FR-008**: Existing field-error and server-error clearing behavior MUST be preserved.
- **FR-009**: Invalid input MUST block Signup and present clear accessible feedback.
- **FR-010**: Existing loading indication, disabled submission, and duplicate-submission protection MUST remain.
- **FR-011**: Existing `AuthService.signUp` and Supabase signup behavior MUST remain unchanged, including endpoint, request semantics, authentication behavior, backend, and database behavior.
- **FR-012**: Existing trimmed Name and optional trimmed Job Title mapping MUST remain, including `name` and `job_title` metadata.
- **FR-013**: Existing API, server, and unexpected-error handling MUST remain perceivable and unchanged in behavior.
- **FR-014**: Success containing both user and session MUST redirect to `/project` under existing rules.
- **FR-015**: A user-without-session response MUST retain the existing explicit error path and MUST NOT redirect successfully.
- **FR-016**: Existing label association, invalid-state semantics, descriptive/error relationships, alert semantics, keyboard operation, and visibility-control accessible names MUST remain.
- **FR-017**: “Log in” MUST continue to navigate to `/login`.
- **FR-018**: Mobile Figma values `Mahmoud Taha` and `#Ys12345678` MUST be example visual-state content only and MUST NOT become production defaults.
- **FR-019**: Visual validation MAY enter those example values without changing production behavior.
- **FR-020**: Confirm Password visibility MUST remain as the sole intentional authorized visual divergence from both Figma frames; no other divergence is authorized.

### Visual Parity Requirements

- **VR-001**: Desktop MUST be independently validated against file `JKBfMPiHdHJVZmBa1Cttpo`, node `1:1219`; Mobile MUST be independently validated against node `1:923` in that file.
- **VR-002**: Values MUST come from those direct nodes or an approved Taskly design value demonstrably used by them; values MUST NOT be invented or inferred between viewports.
- **VR-003**: At `1280 × 1060`, Desktop MUST reproduce the absolute `1280 × 80px` header, `1280 × 982.5px` main, `96px` main top spacing, and `48px` bottom spacing.
- **VR-004**: The Desktop form container MUST be `576px` wide, `48px` padded, `8px` radius, white, clipped, with `0 24px 48px rgba(4,27,60,0.06)` shadow and Figma's `838.5px` authoritative-state height.
- **VR-005**: Desktop header MUST use `40px` inset, `18 × 20px` logo, `8px` gap, and TASKLY Inter Bold `20px/28px`, `-0.5px` tracking.
- **VR-006**: Desktop heading MUST be centered Inter Semi Bold `30px/36px`, weight 600, `-0.75px`, `#041b3c`; subtitle MUST be Inter Regular `14px/20px`, `#4f5f7b`, `8px` after the heading, with copy “Join the editorial approach to task management.”
- **VR-007**: Desktop labels MUST use Inter Bold `11px/16.5px`, weight 700, uppercase, `0.55px`, `#4f5f7b`, and exact label/input vertical geometry.
- **VR-008**: Desktop Job Title MUST visually distinguish bold uppercase “JOB TITLE” from regular `(Optional)` in `#737685` while remaining optional.
- **VR-009**: Desktop inputs MUST be `48px` high with `16px` horizontal and `14px` vertical padding, `4px` radius, `#d7e2ff`, Inter Regular `16px`, and `#737685` placeholders.
- **VR-010**: Desktop Name help text MUST be Inter Regular `11px/16.5px`, `#c3c6d6`, with `6px` post-input spacing.
- **VR-011**: Desktop password fields MUST form two `232px` columns separated by `16px` in the `480px` form width.
- **VR-012**: Desktop Password visibility MUST use the exact Figma glyph at `22 × 15px` within a `22 × 24px` container and `12px` right inset.
- **VR-013**: Desktop Confirm Password MUST match all remaining geometry while retaining the control required by FR-007 and FR-020.
- **VR-014**: Desktop validation MUST be `480 × 98px`, `#e8edff`, `8px` radius, `16px` padding, `7.5px` row gaps, `11.667px` exact icons, Inter Regular `11px/16.5px` `#434654`, and `24px` after the password grid.
- **VR-015**: Desktop submit MUST be `480 × 48px`, `8px` radius, `135°` `#003d9b`→`#0052cc` gradient, `0 1px 1px rgba(0,0,0,0.05)` shadow, Inter Semi Bold `16px/24px`, and `24px` after validation.
- **VR-016**: Desktop footer MUST use `32px` top spacing, approximately `4px` gap, Inter `14px/20px`, `#4f5f7b` prompt, and `#003d9b` semibold link.
- **VR-017**: Desktop MUST show the exact bottom-right accent: `48px` inset, `256px` blurred `rgba(0,82,204,0.2)` square, `50px` blur, centered `128px` bordered square, `12px` radii, and `40%` opacity.
- **VR-018**: At `390 × 940`, Mobile MUST use an `80px` header, `860px` main, `24px` horizontal gutters, and `74px` main bottom padding.
- **VR-019**: Mobile MUST NOT display the Desktop card background, shadow, clipped-card surface, or bottom-right accent.
- **VR-020**: Mobile header MUST use `24px` inset and the exact logo, gap, and wordmark typography from VR-005.
- **VR-021**: Mobile intro MUST be left-aligned, begin `32px` below the main boundary, and provide `40px` before the form.
- **VR-022**: Mobile heading MUST be Inter Semi Bold `28px/40px`, weight 600, `-0.8px`, `#041b3c`.
- **VR-023**: Mobile subtitle MUST be Inter Regular `14px/22.75px`, `#434654`, `6.875px` after the heading, with exact copy “Join the curated environment for institutional trust and task precision.” in `342px`.
- **VR-024**: Mobile labels MUST be Inter Bold `11px/16.5px`, uppercase, `0.55px`, `#434654`; visible Job Title label MUST read “JOB TITLE” while remaining optional.
- **VR-025**: Mobile Name, Email, Job Title, and Confirm Password fields MUST be `342 × 56px`, with `16px` horizontal and `18px` vertical padding, `8px` radius, and `#d7e2ff`.
- **VR-026**: Mobile Password MUST be `342 × 48px`, with `16px` horizontal and `14px` vertical padding, `8px` radius, and `#d7e2ff`.
- **VR-027**: Mobile field typography MUST be Inter Regular `16px`; entered text MUST use `#041b3c` and placeholders `#737685`.
- **VR-028**: Mobile password fields MUST stack in one `342px` column with a `24px` row gap.
- **VR-029**: Mobile Password visibility MUST use the exact `20 × 20px` Figma eye-off glyph and placement; Confirm Password MUST retain FR-020 while minimizing all other divergence.
- **VR-030**: Mobile MUST NOT show the validation checklist, while every validation and error behavior remains active.
- **VR-031**: Mobile submit MUST be `342 × 56px`, `8px` radius, exact gradient/shadow, Inter Semi Bold `16px/24px`, and `24px` after the password grid.
- **VR-032**: Mobile footer MUST begin at the Figma `773.5px` main offset, use `47.5px` top spacing, `4px` gap, Inter `14px/20px`, `#434654` prompt, and `#003d9b` semibold link.
- **VR-033**: Exact Figma logo, visibility, and validation assets MUST be used where required; approximated or hand-authored substitutes are not acceptable.
- **VR-034**: Existing error, focus, loading, and disabled states not depicted in the frames MUST remain usable and accessible without invented redesign.
- **VR-035**: Intermediate responsive behavior MUST retain existing conventions unless explicitly changed above; values MUST NOT be inferred across Desktop and Mobile.

### Shared Component Safety Requirements

- **SR-001**: Later implementation decisions MUST first prefer Signup-local styling or composition.
- **SR-002**: If insufficient, decisions MUST next prefer an existing safe shared-component capability.
- **SR-003**: A shared change MAY only be a narrowly scoped opt-in variant with explicit consumers.
- **SR-004**: Broad shared-default restyling is unauthorized; any unavoidable claim requires explicit justification and all affected consumers before implementation.

### Key Entities

- **Signup Form State**: Five field values and validation feedback; production begins empty.
- **Signup Submission Result**: Existing success/session or error outcome controlling redirect or feedback without service changes.
- **Viewport Authority**: The independently assigned Figma frame and measurable requirements for its viewport.
- **Visual Validation State**: A test-only populated presentation that does not alter production defaults.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At `1280 × 1060`, every measurable Desktop requirement passes direct comparison with node `1:1219`, with only the authorized Confirm Password divergence.
- **SC-002**: At `390 × 940`, every measurable Mobile requirement passes direct comparison with node `1:923`, with only the authorized Confirm Password divergence and test-entered example values where applicable.
- **SC-003**: Production Signup opens with 0 of 5 fields populated at both viewports.
- **SC-004**: 100% of TM-03 Name, Email, Password, Confirm Password, and optional Job Title validation cases retain approved outcomes.
- **SC-005**: 100% of successful user-plus-session tests redirect to `/project`; 100% of user-without-session tests follow the existing failure path.
- **SC-006**: Both password controls toggle independently in 100% of tested Desktop and Mobile cases without changing values.
- **SC-007**: All fields, visibility controls, submit action, feedback, server alert, and Login link are keyboard-operable with correct accessible names or relationships at both viewports.
- **SC-008**: No out-of-scope Auth, navigation, shell, backend, database, API, dependency, or unrelated shared behavior changes are present.
- **SC-009**: A user with valid information completes Signup at either viewport with no additional step versus the approved current flow.

## Assumptions

- TM-03 and current approved Signup behavior remain functional authority; assigned Figma nodes remain visual authority.
- Desktop and Mobile are independent authorities in one Feature and lifecycle.
- Mobile example values are visual-state content only.
- Retained Confirm Password visibility is the sole authorized visual divergence.
- Unshown error, focus, loading, disabled, and interaction states retain existing behavior and are not redesigned.
- Existing authentication, session rules, and metadata contract remain available and unchanged.
- Intermediate viewports retain existing responsive conventions unless later authority is provided.

## Scope Boundaries

### In Scope

- Signup Desktop parity against `1:1219` and Mobile parity against `1:923`
- Viewport-specific composition, typography, spacing, dimensions, colors, fields, labels, help, password presentation, validation presentation, action, footer, exact assets, and responsive differences
- Preservation and protection of current Signup functionality and accessibility
- Signup-specific validation/testing needed to prove parity and behavior

### Out of Scope

- Login, Forgot Password, Reset Password, Mobile Drawer, and Bottom Navigation
- Header or Desktop Sidebar refinement beyond the assigned Signup frames
- Unrelated Application Shell changes or refactoring
- Backend, database, API, Supabase behavior, or dependency changes
- Broad shared-component redesign/default restyling
- Any visual divergence beyond the authorized Confirm Password control
