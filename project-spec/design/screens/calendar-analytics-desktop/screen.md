# Tasks Calendar & Project Analytics (Desktop)

## Local Identity
* Canonical key: `calendar-analytics-desktop`
* Figma node ID: `6831:873`
* Product area: Calendar & Analytics
* Device: Desktop
* Preservation priority: CRITICAL
* UI state: Default

## Reference
* `reference.png`
* Native Figma PNG export preserved locally
* Physical dimensions: 1280 × 1268
* File size: 111704 bytes
* SHA-256: `fedb78a9c5dd95f9b19d8e46e363f10a76588ac7be997fd7b0142abe6a3cce77`

## Dimensions
### Logical Figma Frame
1280 × 1268
### Native PNG Export
1280 × 1268

## Layout Structure
`Layout Shell -> Header Section (Weekly Planner) -> Filters Bar (Week Navigator, Project Selector, Status Selector) -> 3 Metric Summary Cards (Total Tasks: 24, Completed Tasks: 15, Overdue Tasks: 3) -> 7-Day Weekly Calendar Grid (Sun-Sat with task status counts) -> Bottom Analytics Row (Tasks by Status Doughnut Chart + All Projects Overview Table)`

## Typography
* **element**: Page Heading, **font**: Inter:Bold, **size**: 30px, **weight**: 700, **color**: #041b3c
* **element**: Metric Number, **font**: Inter:Bold, **size**: 32px, **weight**: 700, **color**: #041b3c
* **element**: Metric Label, **font**: Inter:Bold, **size**: 11px, **weight**: 700, **uppercase**: true, **color**: #737685
* **element**: Day Column Header, **font**: Inter:Bold, **size**: 16px, **weight**: 700, **color**: #041b3c
* **element**: Chart Total Label, **font**: Inter:Bold, **size**: 24px, **weight**: 700, **color**: #041b3c

## Colors
### Verified Figma Variables
*No verified variables preserved.*

### Observed Raw Values
* **role**: Canvas Background, **value**: #f9f9ff
* **role**: Metric Card Background, **value**: #ffffff
* **role**: Calendar Today Border, **value**: #0052cc
* **role**: Doughnut In Progress, **value**: #0052cc
* **role**: Doughnut Done, **value**: #0a5c36
* **role**: Doughnut Blocked, **value**: #b42318
* **role**: Overdue Text Red, **value**: #d92d20

## Spacing
* 32px (canvas padding)
* 24px (grid & card gap)
* 16px (card inner padding)
* 8px (calendar day gap)

## Borders / Radius / Effects
### radius
* 8px (Metric & chart cards)
* 6px (Calendar day column)
* 12px (Summary icon rounded)
### shadows
* 0px 1px 3px 0px rgba(4,27,60,0.05)
### borders
* 2px solid #0052cc (Today calendar column highlight)
* 1px solid rgba(195,198,214,0.3)

## Content
* Weekly Planner
* Manage your deadlines and track team velocity.
* May 11 - May 17, 2025
* All Projects
* All Statuses
* TOTAL TASKS 24
* COMPLETED TASKS 15
* OVERDUE TASKS 3
* WED 14 May TODAY
* Tasks by Status
* All Projects

## Repeated Visual Patterns
*Note: These are repeated structures observed in the design context. They are NOT confirmed native Figma components.*
* Bento Grid Layout
* Header - Top Navigation

## Assets
*Note: Permanent asset extraction belongs to the later asset-preservation phase.*
* Clipboard Task Icon (SVG)
* Checkmark Icon (SVG)
* Warning Icon (SVG)
* Calendar Icon (SVG)
* Chevron Dropdown Icon (SVG)

## States
* `Default`

## Responsive Relationship
* Counterpart: 6831:2510 (Tasks Calendar & Analytics Mobile)

## Extraction Method
* Design context: Figma Dev Mode MCP `get_design_context`
* Visual reference: Native Figma PNG export @1x

## Implementation Status
Not mapped to application implementation in this preservation phase.

## Extraction Limitations
* Figma MCP returns design tree JSX and reference styles; dynamic browser interaction states are documented factually from visual frame properties.
