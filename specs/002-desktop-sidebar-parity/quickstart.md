# Quickstart Validation Guide: TM-06 — Desktop Sidebar UI Parity

This document outlines the steps to validate the Desktop Sidebar UI Parity implementation.

## Prerequisites
- Node.js environment configured.
- Dependencies installed via `pnpm install`.
- Local development server running (`pnpm dev`).

## Automated Validation Gates
Run these commands from the project root. All must pass without errors:

1. **Prettier Formatting (Targeted)**
   ```bash
   pnpm exec prettier --check src/components/layout/Sidebar.tsx
   ```

2. **TypeScript Compilation**
   ```bash
   pnpm exec tsc --noEmit
   ```

3. **ESLint**
   ```bash
   pnpm lint
   ```

4. **Production Build**
   ```bash
   pnpm build
   ```

## Manual Visual Validation

1. **Desktop Expanded View**
   - Resize browser width to `1200px` (or any value `>= 1024px`).
   - Ensure the Sidebar is expanded.
   - Verify overall width is exactly `256px`.
   - Verify Nav Links have `4px` corner radii and active items have the `#003d9b` text with white background and subtle drop shadow.
   - Verify the TASKLY brand header has no bottom line/border and uses `32px` bottom padding.

2. **Desktop Collapsed View**
   - Click the "Collapse" button in the Sidebar footer.
   - Verify the Sidebar width collapses exactly to `80px`.
   - Verify the nav links shrink to perfectly centered `48x48px` squares.
   - Verify the collapse toggle arrow is pointing to the right (rotated 180 degrees from its expanded state).

3. **Regression Checks**
   - Shrink the browser width below `1024px` and verify the `MobileDrawer` and `Navbar` TopAppBar still function identically to their pre-feature state (hamburger menu intact, 80px TopAppBar preserved).
   - Verify navigation links correctly load their respective pages.
   - Verify the logout button successfully triggers the logout callback.
