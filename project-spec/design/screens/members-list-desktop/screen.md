# Project Members List (Desktop)

## Local Identity
* Canonical key: `members-list-desktop`
* Figma node ID: `15:912`
* Product area: Members & Invitations
* Device: Desktop
* Preservation priority: CRITICAL
* UI state: Populated Table

## Reference
* `reference.png`
* Native Figma PNG export preserved locally
* Physical dimensions: 1280 × 1024
* File size: 73420 bytes
* SHA-256: `82829bc7553da1c5bec53ca23b21f3433f31c71f8bc4034789e29746394f99f4`

## Dimensions
### Logical Figma Frame
1280 × 1024
### Native PNG Export
1280 × 1024

## Layout Structure
`Layout Shell -> Breadcrumbs (PROJECTS > PROJECT NAME > MEMBERS) -> Header (Title + '+ Invite Member' CTA) -> Members Table Container (Table Headers: MEMBER, ROLE, ACTIONS) -> Member Rows (Avatar, Name, Email, Role Badge [OWNER, ADMIN, MEMBER, VIEWER], More Actions Dots)`

## Typography
* **element**: Page Heading, **font**: Inter:Bold, **size**: 30px, **weight**: 700, **color**: #041b3c
* **element**: Table Header, **font**: Inter:Bold, **size**: 11px, **weight**: 700, **uppercase**: true, **color**: #737685
* **element**: Member Name, **font**: Inter:Semi_Bold, **size**: 14px, **weight**: 600, **color**: #041b3c
* **element**: Member Email, **font**: Inter:Regular, **size**: 12px, **weight**: 400, **color**: #737685
* **element**: Role Badge, **font**: Inter:Bold, **size**: 10px, **weight**: 700, **uppercase**: true, **color**: #ffffff

## Colors
### Verified Figma Variables
*No verified variables preserved.*

### Observed Raw Values
* **role**: Canvas Background, **value**: #f9f9ff
* **role**: Table Container Background, **value**: #ffffff
* **role**: Owner Badge Blue, **value**: #0052cc
* **role**: Admin Badge Soft Blue, **value**: #d7e2ff
* **role**: Member Badge Lavender, **value**: #e8edff
* **role**: Viewer Badge Gray, **value**: #f1f3ff
* **role**: Avatar Blue MT, **value**: #d7e2ff
* **role**: Avatar Green SJ, **value**: #69f0ae

## Spacing
* 32px (canvas padding)
* 24px (table padding)
* 16px (row vertical padding)
* 12px (avatar to text gap)

## Borders / Radius / Effects
### radius
* 8px (Table container)
* 12px (Role badge rounded pill)
* 8px (Avatar square rounded)
### shadows
* 0px 1px 3px 0px rgba(4,27,60,0.05)
### borders
* 1px solid rgba(195,198,214,0.3) (Row dividers)

## Content
* PROJECTS > PROJECT NAME > MEMBERS
* Project Members
* + Invite Member
* MEMBER
* ROLE
* ACTIONS
* Mahmoud Taha
* mahmoud.taha.dev@gmail.com
* OWNER
* Sarah Jenkins
* s.jenkins@workspace.com
* ADMIN
* David Lee
* d.lee@workspace.com
* MEMBER
* Alisa Mayer
* a.mayer@workspace.com
* VIEWER

## Repeated Visual Patterns
*Note: These are repeated structures observed in the design context. They are NOT confirmed native Figma components.*
* Header - Top Navigation
* Button - Submit Action

## Assets
*Note: Permanent asset extraction belongs to the later asset-preservation phase.*
* User Invite Plus Icon (SVG)
* Vertical Actions Dots Icon (SVG)

## States
* `Populated Table`

## Responsive Relationship
* Counterpart: 40:1119 (Project Members List Mobile)

## Extraction Method
* Design context: Figma Dev Mode MCP `get_design_context`
* Visual reference: Native Figma PNG export @1x

## Implementation Status
Not mapped to application implementation in this preservation phase.

## Extraction Limitations
* Figma MCP returns design tree JSX and reference styles; dynamic browser interaction states are documented factually from visual frame properties.
