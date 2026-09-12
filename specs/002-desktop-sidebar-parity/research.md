# Research: TM-06 — Desktop Sidebar UI Parity

## Expanded State (Figma 1:986) vs Current Code
- **Width**: `256px` (Matches).
- **Padding**: Figma has `p-[16px]` on the root aside. Current code relies on inner child padding.
- **Brand Header**: Figma relies on a `32px` bottom padding separator. Current code uses `h-16` with a bottom border.
- **Nav Links**: Figma has `px-[12px] py-[10px]` with `rounded-[4px]`. Current code has `px-3 py-3` with `rounded-[8px]`. Active text in Figma is `#003d9b` (medium), current is `#0052cc` (semibold). Inactive text is `#041b3c` (medium), current is `#4f5f7b` (normal).
- **Footer Actions**: Figma has a top border `rgba(195,198,214,0.2)` with `pt-[25px]`. Current has `rgba(195,198,214,0.3)` and `p-3`. Logout text is `#ba1a1a` in Figma, `#d92d20` in current code.

## Collapsed State (Figma 1:733) vs Current Code
- **Width**: Figma dictates `80px`. Current code uses `72px`.
- **Brand Header**: Logo container is `48x48px` centered, with a `33px` margin below.
- **Nav Links**: Figma specifies perfectly square `size-[48px]` link targets, with a `16px` margin/spacing between them.
- **Toggle Icon Rotation**: Figma shows the collapse toggle rotated 180 degrees when collapsed. Current code rotates it 180 degrees when expanded.

## Decision: Implementation Strategy
- **Decision**: Update `Sidebar.tsx` Tailwind CSS classes to exact Figma geometry.
- **Rationale**: Keeps implementation localized. No new components, hooks, or app-level structure changes are required. The change from `72px` to `80px` integrates safely into the existing AppShell flex layout.
- **Alternatives considered**: Extracting NavLink components to a separate file (rejected as over-engineering for simple class updates).
