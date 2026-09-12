# Implementation Plan: TM-06 — Desktop Sidebar UI Parity

## Technical Context

**Target Architecture**: Next.js App Router (React Server Components + Client Components)
**Styling System**: Tailwind CSS
**Target Component**: `src/components/layout/Sidebar.tsx` (Client Component)

### Technical Unknowns / Needs Clarification
- *None*. The required design constraints (80px vs 256px width, padding, colors, typography, flex behaviors) are explicitly defined in Figma nodes `1:986` and `1:733` and validated in the preflight analysis.

### Dependencies & Integrations
- `lucide-react` (icons, already present)
- `next/link` (routing, already present)
- SVGs located in `public/assets/svg/icons/` (already present, used via CSS masks or next/image)

## Constitution Check

- **Preserve Existing Behavior**: Confirmed. Component state (`isCollapsed`), active-route detection, and Next.js navigation remain functionally intact.
- **Scope Containment**: Confirmed. Modifications are strictly limited to `Sidebar.tsx`. `AppShell.tsx`, `Navbar.tsx`, and `MobileDrawer.tsx` are completely protected and unchanged.

## Component Architecture

- **`Sidebar.tsx`**: Will receive updated Tailwind utility classes to match the 256px (expanded) and 80px (collapsed) widths, 16px container padding (when expanded), proper bottom margin for brand header instead of bottom border, updated link dimensions (4px radius, `size-[48px]` for collapsed, etc.), color updates for text (`#041b3c`, `#003d9b`, `#ba1a1a`), and toggle icon rotation inversion.

## Validation Gates

- TypeScript: `pnpm exec tsc --noEmit`
- Linter: `pnpm lint`
- Formatter: `pnpm exec prettier --check src/components/layout/Sidebar.tsx`
- Build: `pnpm build`
- Visual Validation: Desktop viewport (>=1024px) against Figma `1:986` (Expanded) and `1:733` (Collapsed).
- Functional Validation: Collapse/expand toggle, navigation highlighting.
