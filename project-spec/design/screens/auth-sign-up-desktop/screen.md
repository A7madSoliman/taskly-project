# Sign Up (Desktop)

## Local Identity
* Canonical key: `auth-sign-up-desktop`
* Figma node ID: `1:1219`
* Product area: Authentication
* Device: Desktop
* Preservation priority: CRITICAL
* UI state: Default

## Reference
* `reference.png`
* Native Figma PNG export preserved locally
* Physical dimensions: 1332 × 1112
* File size: 212037 bytes
* SHA-256: `34e176f40aa44ac59e454d879f4acc4c1cf65413c7bd1829840edcdf067e4923`

## Dimensions
### Logical Figma Frame
1280 × 1060
### Native PNG Export
1332 × 1112

Native PNG export bounds are larger than the logical Figma frame bounds; the export was preserved unmodified.

## Layout Structure
`Outer Page Container (1280x1060, flex col center) -> Visual Accents overlay (bottom right) -> Top Navigation Header (h=80) -> Main Form Card Container (w=576, p=48, rounded=8, shadow) -> Heading Section + Form Inputs Grid + Validation Checklist + Gradient Submit CTA + Login Redirect Link`

## Typography
* **element**: Heading 1, **font**: Inter:Semi_Bold, **size**: 30px, **weight**: 600, **lineHeight**: 36px, **tracking**: -0.75px, **color**: #041b3c
* **element**: Subheading, **font**: Inter:Regular, **size**: 14px, **weight**: 400, **lineHeight**: 20px, **color**: #4f5f7b
* **element**: Field Labels, **font**: Inter:Bold, **size**: 11px, **weight**: 700, **lineHeight**: 16.5px, **tracking**: 0.55px, **uppercase**: true, **color**: #4f5f7b
* **element**: Input Text, **font**: Inter:Regular, **size**: 16px, **weight**: 400, **color**: #737685
* **element**: Validation Items, **font**: Inter:Regular, **size**: 11px, **weight**: 400, **lineHeight**: 16.5px, **color**: #434654
* **element**: Submit Button, **font**: Inter:Semi_Bold, **size**: 16px, **weight**: 600, **lineHeight**: 24px, **color**: #ffffff

## Colors
### Verified Figma Variables
*No verified variables preserved.*

### Observed Raw Values
* **role**: Page Background, **value**: #f9f9ff
* **role**: Card Background, **value**: #ffffff
* **role**: Input Background, **value**: #d7e2ff
* **role**: Validation Card Background, **value**: #e8edff
* **role**: Primary Text (Heading), **value**: #041b3c
* **role**: Muted Text (Labels/Subheadings), **value**: #4f5f7b
* **role**: Placeholder Text, **value**: #737685
* **role**: Link Blue, **value**: #003d9b
* **role**: Submit Button Gradient, **value**: linear-gradient(135deg, rgb(0, 61, 155) 0%, rgb(0, 82, 204) 100%)

## Spacing
* 48px (page padding / form card padding)
* 40px (header margin)
* 24px (form field gaps)
* 16px (grid gap)
* 14px/16px (input padding)

## Borders / Radius / Effects
### radius
* 8px (Form card)
* 4px (Input fields, submit button)
* 12px (Background accent)
### shadows
* 0px 24px 48px 0px rgba(4,27,60,0.06) (Form container elevation)
### borders
* 1px solid rgba(0,61,155,0.1) (Accent container)

## Content
* TASKLY
* Create your workspace
* Join the editorial approach to task management.
* Name
* Email
* Job Title (Optional)
* Password
* Confirm Password
* At least 8 characters
* One uppercase, lowercase, and digit
* One special character
* Create Account
* Already have an account? Log in

## Repeated Visual Patterns
*Note: These are repeated structures observed in the design context. They are NOT confirmed native Figma components.*
* Header - Top Navigation
* Email Field
* Password Field
* Validation Hints (Visualized State)
* Button - Submit Action

## Assets
*Note: Permanent asset extraction belongs to the later asset-preservation phase.*
* TASKLY Brand Logomark (SVG)
* Password Visibility Toggle Icon (SVG)
* Validation Checklist Icons (SVG)

## States
* `Default`

## Responsive Relationship
* Counterpart: 1:923 (Sign Up Mobile)

## Extraction Method
* Design context: Figma Dev Mode MCP `get_design_context`
* Visual reference: Native Figma PNG export @1x

## Implementation Status
Not mapped to application implementation in this preservation phase.

## Extraction Limitations
* Figma MCP returns design tree JSX and reference styles; dynamic browser interaction states are documented factually from visual frame properties.
