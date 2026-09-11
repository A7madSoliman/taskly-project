# Quickstart – Header – TopAppBar UI Parity

## Prerequisites

- Node (version supported by project environment), pnpm installed
- Local Supabase instance (already configured)
- Authenticated user (login required)

## Commands

```bash
pnpm install               # install deps
pnpm dev                   # start dev server
pnpm format:check          # code‑format check
pnpm lint                  # lint
pnpm exec next typegen     # (no‑op unless new types added)
pnpm exec tsc --noEmit     # type‑check
pnpm build                 # production build
git diff --check           # ensure no accidental whitespace errors
```

## Validation (mobile 390 px)

1. Open http://localhost:3000 on a mobile-sized viewport (or Chrome DevTools responsive mode @390 px width).
2. Verify **Header container**: 80 px height, 24 px horizontal padding, 12 px vertical padding, background `#F9F9FF`, 1 px bottom border `rgba(0,0,0,0.1)`.
3. Verify **Menu button**: 26 × 20 px container, 18 × 12 px hamburger icon, 4 px internal padding, 2 px radius, accessible name “Open navigation menu”.
4. Verify **TASKLY brand**: text-only, Inter Bold 20 px, line-height 28 px, letter-spacing -0.5 px, color `#041B3C`.
5. Verify **Avatar**: 40 × 40 px squircle, radius 12 px, background `#0052CC`, drop-shadow `0px 1px 1px rgba(0,0,0,0.05)`, centered initials (uppercase, Inter Bold 16 px, color `#FFFFFF`).
6. Interact: click hamburger → navigation drawer opens; click avatar → dropdown opens; select "Logout" → returns to login screen.
7. Accessibility checks: proper `aria-label`s, `aria-expanded`, focus outlines visible, contrast meets AA.

## Desktop Regression

- Resize browser to ≥ 1024 px; ensure header **does not** show hamburger or brand text, retains user name and job-title labels, and avatar behavior remains unchanged.

## Expected Outcomes

- Visual parity with Figma frame 15:257 on mobile; no layout shift on desktop; all interactions functional; no console errors; all validation gates pass.
