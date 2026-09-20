# Quickstart Validation: Feature 003 — Signup UI Parity

## Prerequisites

- Use branch `003-signup-ui-parity`.
- Install existing dependencies with pnpm if required.
- Use the authoritative Figma file `JKBfMPiHdHJVZmBa1Cttpo`.
- Desktop node: `1:1219` at 1280×1060.
- Mobile node: `1:923` at 390×940.

## Run the application

```bash
pnpm dev
```

Open the Signup route and verify the production form starts empty.

## Desktop checks

At 1280×1060, compare directly with node `1:1219`:

- header and main positioning
- 576px card, padding, radius, shadow, accent, and natural expansion
- typography, labels, help text, inputs, password grid, checklist, button, and footer
- Password visibility asset and retained Confirm Password control

Trigger field and API/error states to confirm the card expands without clipping.

## Mobile checks

At 390×940, compare directly with node `1:923`:

- 24px gutters and left-aligned intro
- Mobile subtitle, typography, labels, Name help text, field heights, padding, and radii
- no Desktop card/shadow/accent
- stacked passwords with 24px gap
- 56px submit action and footer spacing
- checklist visually hidden while validation remains active

Use `Mahmoud Taha` and `#Ys12345678` only for visual validation; confirm production defaults remain empty.

### Mobile error-state checks

Preserve existing error presentation and accessibility semantics; do not add a new error design. Confirm the default 80px header + 860px Main composition remains unchanged when no added feedback is present. In dynamic states, confirm content grows and the page scrolls as needed without clipping:

- a single field error
- multiple field errors
- Password and Confirm Password errors
- API/server error
- unexpected-error alert
- long accessible feedback
- reachability of all content by vertical scrolling
- keyboard navigation and visible focus while scrolling
- submit button and Login footer remain visible/reachable and are not clipped

## Responsive and behavior checks

- Test below, at, and above 768px, including tablet widths.
- Confirm independent Password and Confirm Password visibility controls.
- Confirm validation and error clearing, loading/disabled submission, AuthService/Supabase flow, metadata mapping, no-session handling, and `/project` redirect remain unchanged.
- Verify keyboard focus, labels, accessible names, and error semantics.

## Technical checks

Run the following validation sequence:

```bash
pnpm exec prettier --check <exact-touched-files>
pnpm lint
pnpm exec next typegen
pnpm exec tsc --noEmit
pnpm build
git diff --check
```

Run `pnpm exec next typegen` when the implementation/change requires regenerated Next.js types; otherwise omit it. Run relevant existing tests as part of technical validation. Prettier must target only Feature-touched files. The known repository-wide Prettier baseline must not trigger unrelated formatting; no global reformat is authorized. Do not add a new test framework.
