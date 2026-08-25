# Login (Desktop)

## Local Identity
* Canonical key: `auth-login-desktop`
* Figma node ID: `1:351`
* Product area: Authentication
* Device: Desktop
* Preservation priority: CRITICAL
* UI state: Default

## Reference
* `reference.png`
* Native Figma PNG export preserved locally
* Physical dimensions: 1332 × 1076
* File size: 178850 bytes
* SHA-256: `859a3db1f3a1f7af95bf9635b7aeb700bf142d6063e8f17c565e01a462423fad`

## Dimensions
### Logical Figma Frame
1280 × 1024
### Native PNG Export
1332 × 1076

Native PNG export bounds are larger than the logical Figma frame bounds; the export was preserved unmodified.

## Layout Structure
`Outer Page Container (1280x1024, flex col center) -> Top Navigation Header (h=80) -> Login Card Container (w=576, p=48, rounded=8, shadow) -> Heading Section + Email & Password Inputs + Remember Me / Forgot Password Controls + Gradient Log In CTA + Sign Up Redirect Link`

## Typography
* **element**: Heading 1, **font**: Inter:Semi_Bold, **size**: 30px, **weight**: 600, **lineHeight**: 36px, **tracking**: -0.75px, **color**: #041b3c
* **element**: Subheading, **font**: Inter:Regular, **size**: 14px, **weight**: 400, **lineHeight**: 20px, **color**: #4f5f7b
* **element**: Field Labels, **font**: Inter:Bold, **size**: 11px, **weight**: 700, **lineHeight**: 16.5px, **tracking**: 0.55px, **uppercase**: true, **color**: #4f5f7b
* **element**: Action Links, **font**: Inter:Semi_Bold, **size**: 12px, **weight**: 600, **color**: #003d9b
* **element**: Button CTA, **font**: Inter:Semi_Bold, **size**: 16px, **weight**: 600, **lineHeight**: 24px, **color**: #ffffff

## Colors
### Verified Figma Variables
*No verified variables preserved.*

### Observed Raw Values
* **role**: Page Background, **value**: #f9f9ff
* **role**: Card Background, **value**: #ffffff
* **role**: Input Background, **value**: #d7e2ff
* **role**: Heading Text, **value**: #041b3c
* **role**: Muted Text, **value**: #4f5f7b
* **role**: Action Link, **value**: #003d9b
* **role**: Button Gradient, **value**: linear-gradient(135deg, rgb(0, 61, 155) 0%, rgb(0, 82, 204) 100%)

## Spacing
* 48px (card padding / top padding)
* 24px (field gap)
* 16px (input padding)
* 8px (header gap)

## Borders / Radius / Effects
### radius
* 8px (Login card)
* 4px (Input fields, submit button)
### shadows
* 0px 24px 48px 0px rgba(4,27,60,0.06) (Main card shadow)
### borders
* 1px solid rgba(0,61,155,0.1)

## Content
* TASKLY
* Welcome Back
* Please enter your details to access your workspace
* Email
* Password
* Remember Me
* Forgot Password?
* Log In
* Don't have an account? Sign Up

## Repeated Visual Patterns
*Note: These are repeated structures observed in the design context. They are NOT confirmed native Figma components.*
* Header - Top Navigation
* Email Field
* Password Field
* Button - Submit Action

## Assets
*Note: Permanent asset extraction belongs to the later asset-preservation phase.*
* TASKLY Brand Logomark (SVG)
* Eye Icon (SVG)
* Checkbox Icon (SVG)

## States
* `Default`

## Responsive Relationship
* Counterpart: 1:289 (Login Mobile)

## Extraction Method
* Design context: Figma Dev Mode MCP `get_design_context`
* Visual reference: Native Figma PNG export @1x

## Implementation Status
Not mapped to application implementation in this preservation phase.

## Extraction Limitations
* Figma MCP returns design tree JSX and reference styles; dynamic browser interaction states are documented factually from visual frame properties.
