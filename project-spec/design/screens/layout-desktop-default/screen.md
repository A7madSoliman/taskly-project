# Layout (Desktop)

## Local Identity
* Canonical key: `layout-desktop-default`
* Figma node ID: `1:986`
* Product area: Application Shell
* Device: Desktop
* Preservation priority: CRITICAL
* UI state: Sidebar Expanded

## Reference
* `reference.png`
* Native Figma PNG export preserved locally
* Physical dimensions: 1280 × 1024
* File size: 25378 bytes
* SHA-256: `8b921205f6c6ba59de17bd29d81709442038b40cacd20361852a8e45f83ccb75`

## Dimensions
### Logical Figma Frame
1280 × 1024
### Native PNG Export
1280 × 1024

## Layout Structure
`Desktop Shell (1280x1024) -> Left Sidebar (w=256, bg=#f1f3ff, full height) [Logo Header + Navigation Menu Items + Footer User/Collapse Action] -> Top Header Bar (h=64, border-b) -> Main Content Area Canvas`

## Typography
* **element**: Brand Logo, **font**: Inter:Bold, **size**: 20px, **weight**: 700, **tracking**: -0.5px, **color**: #041b3c
* **element**: Nav Item Active, **font**: Inter:Semi_Bold, **size**: 14px, **weight**: 600, **color**: #0052cc
* **element**: Nav Item Inactive, **font**: Inter:Regular, **size**: 14px, **weight**: 400, **color**: #4f5f7b
* **element**: User Profile Name, **font**: Inter:Bold, **size**: 14px, **weight**: 700, **color**: #041b3c
* **element**: User Profile Role, **font**: Inter:Semi_Bold, **size**: 11px, **weight**: 600, **color**: #4f5f7b

## Colors
### Verified Figma Variables
*No verified variables preserved.*

### Observed Raw Values
* **role**: Sidebar Background, **value**: #f1f3ff
* **role**: Main Canvas Background, **value**: #f9f9ff
* **role**: Active Nav Item Background, **value**: #ffffff
* **role**: Active Nav Text, **value**: #0052cc
* **role**: Inactive Nav Text, **value**: #4f5f7b
* **role**: User Avatar Background, **value**: #0052cc
* **role**: Logout Action, **value**: #d92d20

## Spacing
* 256px (sidebar width)
* 64px (header height)
* 16px (item padding)
* 12px (item gap)
* 24px (canvas padding)

## Borders / Radius / Effects
### radius
* 8px (Nav active pill)
* 12px (Avatar rounded)
* 4px (Utility icons)
### shadows
* 0px 1px 2px 0px rgba(0,0,0,0.05) (Header border / sidebar active card)
### borders
* 1px solid rgba(195,198,214,0.3) (Header separator)

## Content
* TASKLY
* Projects
* Project Epics
* Project Tasks
* Project Members
* Project Details
* Mahmoud Taha
* PROJECT MANAGER
* MT
* Collapse
* Logout

## Repeated Visual Patterns
*Note: These are repeated structures observed in the design context. They are NOT confirmed native Figma components.*
* Header - Top Navigation
* BottomNavBar

## Assets
*Note: Permanent asset extraction belongs to the later asset-preservation phase.*
* Projects Folder Icon (SVG)
* Epics Icon (SVG)
* Tasks Icon (SVG)
* Members Icon (SVG)
* Details Icon (SVG)
* Collapse Icon (SVG)
* Logout Icon (SVG)

## States
* `Sidebar Expanded`

## Responsive Relationship
* Counterpart: 1:401 (Layout Mobile Closed)

## Extraction Method
* Design context: Figma Dev Mode MCP `get_design_context`
* Visual reference: Native Figma PNG export @1x

## Implementation Status
Not mapped to application implementation in this preservation phase.

## Extraction Limitations
* Figma MCP returns design tree JSX and reference styles; dynamic browser interaction states are documented factually from visual frame properties.
