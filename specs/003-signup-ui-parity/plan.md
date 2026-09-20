# Implementation Plan: Feature 003 — Signup UI Parity

## Summary

Bring Signup into parity with the authoritative Desktop Figma node `1:1219` and Mobile Figma node `1:923` while preserving all existing Signup behavior. Desktop and Mobile are independent visual authorities within one bounded Feature.

## Technical Context

- Stack: Next.js App Router, React, TypeScript, Tailwind CSS, Supabase.
- Primary source surface: `src/app/sign-up/page.tsx`.
- Existing `Input`, `Button`, and `AuthHeader` APIs are sufficient; keep them unchanged unless direct implementation evidence proves otherwise.
- Responsive breakpoint: `md` / `768px`.
- No API, database, AuthService, Supabase, dependency, or broad token changes.
- Exact Figma assets are required where represented; temporary Figma URLs are not permanent sources.

## Constitution Check

- One Feature, one branch: satisfied (`003-signup-ui-parity`).
- Codex owns canonical artifacts and scope: satisfied.
- UI parity is Figma-driven: satisfied; Desktop `1:1219` and Mobile `1:923` remain independent authorities.
- Preserve existing behavior: satisfied; no auth or validation changes are authorized.
- Minimize shared blast radius: satisfied; Signup-local composition is the default.
- Validation is required before acceptance: satisfied; visual, functional, accessibility, lint, type, build, and diff checks are planned.

## Canonical Surface and Protection Rules

Expected source changes are limited to:

1. `src/app/sign-up/page.tsx`
2. Exact promoted Signup assets only when no byte-identical repository asset exists.

Protected by default:

- shared `Input`, `Button`, and `AuthHeader`
- password validation utilities
- AuthService and Supabase integration
- global styles/design tokens
- unrelated tests, shell, navigation, and auth screens

Any shared change requires proof that Signup-local composition cannot satisfy the specification, must be opt-in, and must identify every affected consumer.

## Responsive Direction

Below `md`:

- Mobile composition with 24px page gutters
- no Desktop card surface, shadow, or accent
- left-aligned intro and Mobile subtitle
- Mobile typography and field geometry
- stacked password fields with a 24px row gap
- validation checklist visually hidden while validation remains active

At and above `md`:

- Desktop shell and main positioning
- 576px card with exact padding, radius, shadow, and clipping for the default visual state
- Desktop accent
- two-column password layout
- Desktop typography, spacing, validation panel, submit action, and footer

Do not use the current `sm` breakpoint for the Desktop password grid.

## Desktop Design Approach

- Target authority: `1280 × 1060`, node `1:1219`.
- Reproduce the 576px card naturally from exact content, padding, gaps, and footer spacing.
- Do not hard-code a height that clips field errors, API errors, unexpected-error alerts, or accessibility content; allow expansion.
- Preserve exact heading/subtitle typography, 48px inputs, label treatment, Job Title optional styling, two-column password grid, validation panel, 48px submit action, footer spacing, and background accent.
- Preserve exact fractional values such as `16.5px`, `7.5px`, and `11.667px` with stable CSS/Tailwind arbitrary values.
- Use exact Password visibility and validation assets.

## Mobile Design Approach

- Target authority: `390 × 940`, node `1:923`.
- Preserve the default Figma composition at `390 × 940`: an 80px header and 860px default Main region, including the documented default-state spacing and geometry, when no additional feedback is present. The 860px region describes this default visual state only; it is not a fixed maximum content height.
- In dynamic functional states, allow Main/page content to grow naturally beyond 860px and keep vertical document scrolling available. Preserve existing error presentation and accessibility semantics. Do not use fixed-height/`overflow-hidden` combinations that clip field errors, API/server errors, unexpected-error alerts, accessible feedback, the submit button, or Login footer. Do not invent a new error treatment.
- Render no Desktop card, shadow, or accent.
- Use the Mobile intro alignment, subtitle copy, typography, labels, asymmetric field heights, padding, and 8px radii.
- Keep the Name help text visible: `3-50 characters, letters only.`
- Keep production initial values empty; `Mahmoud Taha` and `#Ys12345678` are visual/example values only.
- Stack passwords with a 24px gap, retain the visibility behavior, hide only the visible checklist, and use the 56px submit action and exact footer spacing.

## Authorized Divergence

The independent Confirm Password visibility control must remain. It is the sole authorized visual divergence from the Figma frames. Keep its state, keyboard/focus behavior, and accessible name; match the Password control's icon geometry and padding without changing field dimensions. No other divergence is authorized.

## Asset Plan

Inspect repository assets first. Reuse byte-identical assets. If absent, promote exact Figma exports to stable repository paths and record source, destination, format, dimensions, and SHA/byte verification. Required categories are the Taskly mark/logo, Password visibility state, and Desktop validation-state icons. Never hand-author approximate SVGs or commit temporary MCP URLs.

## Functional Safeguards

Do not change empty initial state, five-field state, onChange/error clearing, Name/Email/Password/Confirm Password rules, password complexity, independent visibility state, loading/disabled behavior, `AuthService.signUp`, Supabase behavior, metadata mapping, server/API/unexpected-error handling, accessibility semantics, `/project` redirect, or existing no-session handling.

## Testing and Validation

Use existing test infrastructure only; do not introduce a framework. Add bounded Signup coverage only if it fits naturally. At minimum validate empty production state, preserved validation, independent visibility controls, non-default Figma example values, mobile checklist visibility, and unchanged successful submission.

Compare directly against both exact nodes at 1280×1060 and 390×940, plus widths around 768px and representative tablet widths. Validate typography, spacing, assets, Mobile field/API/unexpected-error states and reachability, loading/disabled states, focus and keyboard behavior, and responsive separation. Run targeted Prettier only on touched files, `pnpm lint`, TypeScript validation, `pnpm build`, relevant existing tests, and `git diff --check`. Do not globally reformat unrelated files.

## High-Level Sequence

1. Inventory and verify exact assets.
2. Implement Signup-local responsive shell.
3. Implement Desktop composition.
4. Implement Mobile composition and `md` transition.
5. Apply typography, spacing, fields, password controls, validation panel, button, and footer.
6. Verify authorized Confirm Password divergence and all preserved behavior.
7. Add only bounded tests supported by existing infrastructure.
8. Perform direct Figma visual validation and technical validation.

## Risks and Mitigations

- Shared-component regression: avoid shared edits; require proof and opt-in scope.
- Asset drift: hash exact promoted assets.
- Mobile/Desktop leakage: validate below and above `md`, including tablet widths.
- Mobile error clipping: retain the 860px default composition while allowing dynamic content to grow and the page to scroll; verify feedback and the submit/footer remain reachable.
- Desktop error clipping: use natural card expansion rather than a fixed height.
- Functional regression: keep behavior code paths unchanged and run behavioral checks.
- Fractional-value drift: preserve exact CSS values and inspect rendered output.

## Rollback / Scope Safety

Keep all changes confined to the Signup page and required exact assets. If parity requires auth, API, database, shared-default, dependency, or unrelated shell changes, stop and escalate rather than expanding this Feature.
