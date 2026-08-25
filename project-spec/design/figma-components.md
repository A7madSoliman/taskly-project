# Taskly Figma Component Catalog

## Purpose

This file preserves reusable component information from the original Taskly Figma design.

This is NOT yet a mapping to React/codebase components.

## Confirmed Component Sets
NONE

## Confirmed Components
NONE

## Variant Relationships
No verified relationships could be extracted via the MCP.

## Nested Component Relationships
No verified relationships could be extracted via the MCP.

## Representative Usage
Refer to Repeated Visual Patterns below.

## Repeated Visual Patterns

The following patterns look reusable but were NOT confirmed by MCP metadata as Figma components.

### Application Shell
- **Header - Top Navigation**: NOT CONFIRMED AS FIGMA COMPONENT (Observed across all desktop screens)
- **BottomNavBar**: NOT CONFIRMED AS FIGMA COMPONENT (Observed in Mobile contexts)

### Forms
- **Email Field**: NOT CONFIRMED AS FIGMA COMPONENT (Sign Up, Login, Forgot Password)
- **Password Field**: NOT CONFIRMED AS FIGMA COMPONENT (Sign Up, Login)
- **Validation Hints**: NOT CONFIRMED AS FIGMA COMPONENT (Sign Up, Reset Password)

### Buttons / Actions
- **Button - Submit Action**: NOT CONFIRMED AS FIGMA COMPONENT (Auth flows)
- **Floating Action Button**: NOT CONFIRMED AS FIGMA COMPONENT (Mobile lists)

### Cards & Data
- **Project Card**: NOT CONFIRMED AS FIGMA COMPONENT (Projects List)
- **Epic Card**: NOT CONFIRMED AS FIGMA COMPONENT (Epics List)

### Modals
- **Modal Backdrop (Glassmorphism)**: NOT CONFIRMED AS FIGMA COMPONENT (Epic Details Modal, Invite Member Popup Modal)

## Unknown / Ambiguous Items
NONE

## Extraction Limitations & Verification Summary
- **Metadata Inspection (`get_metadata`)**: Outputs a flattened XML structure with layer types `<frame>`, `<text>`, and `<vector>` that does not expose native Component / Component Set identifiers or variant properties.
- **Deep Design Inspection (`get_design_context`)**: Tested across representative small nodes in multiple domains (Authentication, Application Shell, Forms, Actions, Projects, Epics, Tasks, Modals, Empty States). Responses provide reference React/Tailwind JSX and visual tokens, but do not provide explicit metadata linking them to native Figma Component Sets or variant schemas.
- **Classification Verdict**: Because the Figma MCP does not provide sufficient native component metadata, all recurring design structures are rigorously classified as **Repeated Visual Patterns** to avoid inventing unverified component hierarchies.

## Future Code Mapping
Figma-to-code component mapping has NOT been performed.
