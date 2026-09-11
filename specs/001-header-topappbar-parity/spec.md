# Feature Specification: Header - TopAppBar UI Parity

**Feature Branch**: `001-header-topappbar-parity`

**Created**: 2026-09-11

**Status**: Clarified

**Input**: User description: "Header - TopAppBar UI Parity"

## Clarifications

### Session 2026-09-11

- Q: Should the mobile TopAppBar display the separate Taskly logo mark before TASKLY as currently in code, or omit it per Figma frame 15:257? → A: Omit the separate logo mark in the mobile TopAppBar governed by Figma node 15:257, displaying only the menu button and TASKLY text. Preserve existing menu interaction behavior.
- Q: Should the desktop/larger-viewport header retain user name and job-title text labels, or be simplified to match the 390px mobile Figma frame? → A: Preserve existing larger-viewport and desktop behavior displaying user name and job title text labels beside the avatar; do not extrapolate the 390px mobile Figma design into a desktop redesign.
- Q: Should the mobile hamburger button and TASKLY brand text be shown in the header on desktop viewports alongside the persistent sidebar? → A: Preserve existing desktop behavior where the mobile hamburger button and TASKLY header brand treatment are not displayed on desktop viewports alongside the persistent sidebar. Any desktop header parity changes are deferred to a future desktop Figma target.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Visual Parity for Mobile TopAppBar (Priority: P1)

As a Taskly mobile user, I want the top header bar to visually match the authoritative Figma mobile design so that the application presents a consistent, polished editorial appearance.

**Why this priority**: The primary objective of post-release UI parity is eliminating visual discrepancies against the approved Figma mobile design while preserving all existing capabilities.

**Independent Test**: Can be validated on any mobile viewport (e.g., 390px width) by comparing the rendered header against Figma frame 15:257 for background color, border treatment, padding, typography, icon sizing, and avatar geometry.

**Acceptance Scenarios**:

1. **Given** an authenticated user on a mobile viewport, **When** the top header renders, **Then** it presents a background color of `#F9F9FF`, an overall height of 80px, horizontal padding of 24px left and right, vertical padding of 12px top and bottom, and a 1px solid bottom border in `rgba(0, 0, 0, 0.1)`.
2. **Given** the left section of the mobile header, **When** rendered, **Then** it displays a menu button containing an 18px wide by 12px high hamburger icon (within a 26px by 20px interactive area having 4px internal padding and a 2px corner radius) spaced 16px horizontally from the brand text `TASKLY`.
3. **Given** the brand text `TASKLY` on mobile, **When** rendered, **Then** it displays without an adjacent logo mark, using Inter Bold typography at 20px font size, 28px line height, -0.5px letter spacing, and `#041B3C` text color.
4. **Given** the right section of the header, **When** rendered, **Then** it displays a user avatar with dimensions of 40px by 40px, a corner radius of 12px (squircle curvature rather than circular), a background color of `#0052CC`, a drop shadow of `0px 1px 1px rgba(0, 0, 0, 0.05)`, and centered 16px bold white text containing the user's initials.

---

### User Story 2 - Preservation of Navigation & Account Controls (Priority: P1)

As a Taskly user, I want existing navigation toggles, account menus, and session controls to continue functioning so that visual refinements introduce zero behavioral regression.

**Why this priority**: Visual styling updates must never disrupt existing navigation capabilities, accessibility standards, or authentication mechanisms.

**Independent Test**: Can be validated by activating the hamburger menu button to verify navigation drawer opening, and activating the avatar to toggle the account menu and execute logout.

**Acceptance Scenarios**:

1. **Given** a user viewing the header on a mobile viewport, **When** activating the menu button, **Then** the navigation drawer opens as in the existing implementation.
2. **Given** a user viewing the header, **When** activating the avatar, **Then** the account menu toggles open and displays the logout option.
3. **Given** an open account menu, **When** clicking outside the menu or selecting logout, **Then** the menu dismisses and logout execution proceeds without error.
4. **Given** keyboard or assistive technology navigation, **When** focusing and operating header controls, **Then** all interactive elements provide accessible names, accurate expanded/popup states, and visible focus indicators.

---

### User Story 3 - Responsive Coexistence with Desktop Shell (Priority: P2)

As a Taskly desktop user, I want the header to integrate cleanly with the existing desktop application shell and persistent sidebar without visual collisions or premature layout shifts.

**Why this priority**: Ensures that mobile-specific parity requirements do not inadvertently degrade or distort desktop user experience.

**Independent Test**: Can be validated by resizing across responsive breakpoints and confirming desktop layout stability and label retention.

**Acceptance Scenarios**:

1. **Given** a desktop viewport where the persistent sidebar is present, **When** the header renders, **Then** it preserves existing desktop layout behavior, keeping user name and job-title text labels beside the avatar and omitting the mobile hamburger/brand treatment.
2. **Given** responsive transitions between mobile and desktop viewports, **When** resizing occurs, **Then** layout transitions occur smoothly without clipping or horizontal overflow.

---

### Edge Cases

- **User Name Metadata Missing or Incomplete**: When user profile metadata lacks a full name or consists of a single word, initials formatting must fallback cleanly to a 1-2 character identifier centered within the 40px squircle.
- **Unusually Long Display Name on Desktop**: On desktop viewports where text labels appear, lengthy user names or titles must truncate gracefully without displacing or overlapping the avatar.
- **Mobile Touch Target Dimensions**: Interactive areas for the hamburger menu button and avatar must maintain sufficient hit targets for touch usability while preserving visual dimensions.
- **High-Density Displays**: Icon vectors, borders, and corner radii must render sharply without raster blurring or anti-aliasing artifacts on high-DPI screens.

## Requirements _(mandatory)_

### Visual Acceptance Criteria (Figma Frame 15:257 & Style Guide 76:1757)

- **Mobile Header Container**:
  - Background color: `#F9F9FF` (Design system background token).
  - Bottom border: 1px solid `rgba(0, 0, 0, 0.1)`.
  - Overall height: 80px on mobile viewports.
  - Horizontal padding: 24px left and right.
  - Vertical padding: 12px top and bottom.
  - Layout: Full-width horizontal alignment with elements vertically centered and content distributed to outer edges.

- **Menu Button & Hamburger Icon**:
  - Visual container dimensions: 26px width by 20px height.
  - Internal padding: 4px on all sides.
  - Corner radius: 2px.
  - Icon asset: Hamburger vector icon with dimensions 18px width by 12px height.
  - Icon color: `#041B3C` (Design system neutral token).
  - Horizontal spacing: Positioned 24px from the left edge of the container and 16px from the brand text.

- **Brand Typography**:
  - Text content: `TASKLY`.
  - Presence: Text-only on mobile; no preceding logo mark is rendered.
  - Font family: Inter, font weight Bold (700).
  - Font size: 20px.
  - Line height: 28px.
  - Letter spacing: -0.5px.
  - Text color: `#041B3C`.

- **User Avatar**:
  - Dimensions: 40px width by 40px height.
  - Corner radius: 12px (squircle geometry; not circular).
  - Background color: `#0052CC` (Design system primary container token).
  - Drop shadow: `0px 1px 1px rgba(0, 0, 0, 0.05)`.
  - Initials text: Uppercase user initials (e.g., `MT`), Inter Bold (700), font size 16px, line height 24px, color `#FFFFFF`.
  - Placement: Positioned 24px from the right edge, vertically centered within the container.

### Functional Requirements

- **FR-001**: The system MUST render the mobile TopAppBar container with a `#F9F9FF` background, a 1px solid bottom border in `rgba(0,0,0,0.1)`, 24px horizontal padding, 12px vertical padding, and an 80px height, matching Figma frame 15:257.
- **FR-002**: The system MUST render a menu button with an 18px by 12px hamburger icon that triggers opening of the mobile navigation drawer.
- **FR-003**: The system MUST render the brand title `TASKLY` in the mobile header using 20px Inter Bold typography with -0.5px letter spacing and `#041B3C` color, without a preceding logo mark.
- **FR-004**: The system MUST render the user avatar with dimensions of 40px by 40px, a 12px corner radius, a `#0052CC` background, a subtle drop shadow, and centered 16px bold white text displaying user initials.
- **FR-005**: The system MUST preserve the user profile dropdown toggle and logout trigger when interacting with the avatar.
- **FR-006**: The system MUST preserve existing accessibility semantics, including landmark header role, accessible control names, expanded/popup states, and keyboard navigation.
- **FR-007**: The system MUST preserve application shell integration, authentication verification, and routing flows.
- **FR-008**: The system MUST preserve existing desktop behavior displaying user name and job-title text labels adjacent to the avatar on larger viewports.
- **FR-009**: The system MUST preserve existing desktop behavior wherein the mobile hamburger button and header brand treatment are omitted when the persistent desktop sidebar is active.

### Key Entities

- **TopAppBar**: The top navigation component responsible for primary application branding on mobile, drawer navigation access, and user profile management.
- **User Identity Context**: User profile metadata containing display name, job title, and derived initials.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: On mobile viewports (e.g., 390px width), the TopAppBar achieves 100% visual fidelity with Figma frame 15:257 across container dimensions (80px height, 24px padding), colors (`#F9F9FF`, `#0052CC`, `#041B3C`), typography (20px/-0.5px brand, 16px avatar), and corner radii (12px squircle).
- **SC-002**: Activating the hamburger menu button reliably triggers the navigation drawer across all supported mobile viewports without functional regression.
- **SC-003**: Interacting with the avatar reliably toggles the account dropdown menu, and selecting logout cleanly signs the user out and redirects to the login screen without error.
- **SC-004**: Zero visual or functional regressions occur in desktop sidebar navigation, bottom navigation bar (out of scope), or main page canvas content.
- **SC-005**: All interactive controls in the header preserve standard accessibility compliance, including accessible names, proper state indicators, visible focus highlights, and color contrast meeting standard accessibility guidelines.

## Assumptions

- Figma frame 15:257 (`Header - TopAppBar`, width 390px, height 80px) is authoritative exclusively for the mobile TopAppBar.
- Mobile-specific dimensions and geometry (such as the 80px height and 24px padding) are not required on desktop layouts unless established by an approved desktop Figma target; existing desktop layout behavior is preserved for this feature.
- The BottomNavBar (`12:228`), desktop Sidebar (`15:266`), and content views are strictly out of scope and remain untouched.
- Existing authentication, routing, and data flow mechanisms remain authoritative and unchanged.
