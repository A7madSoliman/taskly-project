# Feature Specification: TM-06 — Desktop Sidebar UI Parity

**Feature Branch**: `002-desktop-sidebar-parity`

**Created**: 2026-09-12

**Status**: Draft

**Input**: User description: "TM-06 — Desktop Sidebar UI Parity only"

## Feature Scope

This feature aims to achieve strict Figma UI parity for the Application Shell's Desktop Sidebar navigation control.

- **Desktop Expanded Sidebar**: Visual parity with Figma node `1:986` (Layout (Desktop)).
- **Desktop Collapsed Sidebar**: Visual parity with Figma node `1:733` (Layout (Desktop) - Collapsed Sidebar).

### Explicitly Out of Scope
- MobileDrawer.tsx visual parity.
- Mobile Drawer Figma node `1:553`.
- BottomNavBar / ProjectMobileBottomNav parity.
- Navbar.tsx modifications (completed Header work must be protected).
- Authentication logic or session behavior changes.
- New API endpoints or backend/database work.
- Page-specific Projects/Auth/Epics/Tasks UI parity.
- New dependencies.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Desktop Expanded Navigation (Priority: P1)

As an authenticated desktop user, I need a persistent expanded sidebar that allows me to navigate between projects, epics, tasks, and members clearly, matching the visual design.

**Why this priority**: Primary navigation mode for desktop users.

**Independent Test**: Can be verified by logging in on a screen >= 1024px and visually comparing the Sidebar to Figma `1:986`.

**Acceptance Scenarios**:
1. **Given** the user is on a desktop viewport, **When** they view the application shell, **Then** the Sidebar renders with exact Figma geometry (width, colors, typography, active states).
2. **Given** the Sidebar is expanded, **When** the user clicks the collapse arrow, **Then** the Sidebar transitions to the collapsed state.

---

### User Story 2 - Desktop Collapsed Navigation (Priority: P1)

As an authenticated desktop user who needs more horizontal screen space, I need a collapsed version of the sidebar that displays only icons while maintaining visual parity.

**Why this priority**: Essential responsive/interactive mode for desktop power users.

**Independent Test**: Can be verified by clicking the collapse arrow on desktop and comparing to Figma `1:733`.

**Acceptance Scenarios**:
1. **Given** the Sidebar is collapsed, **When** the user views the application shell, **Then** the Sidebar width shrinks and only icons are visible, exactly matching Figma geometry.

## Requirements *(mandatory)*

### Visual Requirements (Figma Parity)

- **VR-001**: Desktop Expanded Sidebar MUST match layout, dimensions, spacing, typography, colors, borders, radii, shadows, and icons from node `1:986`.
- **VR-002**: Desktop Collapsed Sidebar MUST match layout, dimensions, spacing, colors, and icons from node `1:733`.
- **VR-003**: Active state highlighting (background, text color, icon color) MUST match Figma specifications.
- **VR-004**: User initials and job title footer MUST match Figma typography and layout constraints.

### Functional Behavior to Preserve (Protected)

- **PR-001**: Sidebar expanded/collapsed React state (`isCollapsed`) and toggle logic.
- **PR-002**: Desktop navigation linking (`next/link`).
- **PR-003**: Route-based active navigation state matching.
- **PR-004**: Existing user information/initials injection.
- **PR-005**: Logout callback behavior.
- **PR-006**: Existing accessibility semantics relevant to Sidebar.

### Responsive Requirements

- **RR-001**: Sidebar must continue to appear only at the existing desktop breakpoint (>= 1024px).
- **RR-002**: Navbar/Header protected regression boundary MUST NOT be violated.
- **RR-003**: Mobile Drawer implementation MUST remain unchanged by this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero visual regressions in `Navbar.tsx` (TopAppBar).
- **SC-002**: Zero functional or visual changes to `MobileDrawer.tsx`.
- **SC-003**: Sidebar width, padding, and font sizes measure exactly as specified in Figma nodes `1:986` and `1:733`.
- **SC-004**: Automated validation gates (`pnpm lint`, `pnpm build`) pass without new warnings or errors.

## Assumptions

- The 1024px (`lg`) breakpoint accurately maps to the existing Desktop architectural breakpoint and does not need to be changed.
