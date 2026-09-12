# Data Model: TM-06 — Desktop Sidebar UI Parity

## Overview
This feature consists entirely of UI visual parity updates to existing React Client Components.

## Entities
- **None**: No new database tables, APIs, persistent data structures, or external interfaces are introduced.

## State Management
- `isCollapsed` (boolean): Existing React state in `AppShell.tsx`, passed down to `Sidebar.tsx`. Will remain unchanged in structure and function.
- Routing state (`pathname`): Derived from Next.js `usePathname()`. Will remain unchanged.
