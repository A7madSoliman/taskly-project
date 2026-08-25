# Style Guide

## Local Identity
* Canonical key: `design-style-guide`
* Figma node ID: `76:1757`
* Product area: Design Reference
* Device: Desktop
* Preservation priority: HIGH
* UI state: Default

## Reference
* `reference.png`
* Native Figma PNG export preserved locally
* Physical dimensions: 1280 × 3205
* File size: 153402 bytes
* SHA-256: `872ab8dd7a54fb4c312f09385e8a0f4cc1fc8c5955d837186b0de57391014347`

## Dimensions
### Logical Figma Frame
1280 × 3205
### Native PNG Export
1280 × 3205

## Layout Structure
`Vertical Design System Canvas (1280x3205) -> Section 1: Brand Assets (TASKLY Logotype) -> Section 2: Color Palette (Action Blue & Tonal Range, Slate Neutrals, Semantic Success/Error/Warning) -> Section 3: Typography (Display-LG, Headline-LG, Title-MD, Body-MD, Label-SM) -> Section 4: Components Showcase (Button Variants, Form Controls, Layering Principle, Signature Gradient CTA) -> Section 5: Iconography (Material Symbols Outlined Grid)`

## Typography
* **element**: Section Title, **font**: Inter:Bold, **size**: 20px, **weight**: 700, **color**: #041b3c
* **element**: Display-LG Specimen, **font**: Inter:Bold, **size**: 48px, **weight**: 700, **color**: #041b3c
* **element**: Headline-LG Specimen, **font**: Inter:Bold, **size**: 32px, **weight**: 700, **color**: #041b3c
* **element**: Title-MD Specimen, **font**: Inter:Semi_Bold, **size**: 20px, **weight**: 600, **color**: #041b3c
* **element**: Body-MD Specimen, **font**: Inter:Regular, **size**: 14px, **weight**: 400, **lineHeight**: 20px, **color**: #4f5f7b
* **element**: Label-SM Specimen, **font**: Inter:Bold, **size**: 11px, **weight**: 700, **uppercase**: true, **color**: #4f5f7b

## Colors
### Verified Figma Variables
* Color/Grey/800 (#222529)
* Color/Grey/500 (#8c97a7)
* var(--foreground) (#020617)
* var(--accent-foreground) (#0f172a)
* Space/4 (16)

### Observed Raw Values
* **role**: Primary Blue, **value**: #003d9b
* **role**: Primary Container, **value**: #0052cc
* **role**: Surface Highest, **value**: #d7e2ff
* **role**: Surface Low, **value**: #f1f3ff
* **role**: Background, **value**: #f9f9ff
* **role**: Slate Dark, **value**: #041b3c
* **role**: Slate Medium, **value**: #4f5f7b
* **role**: Slate Light, **value**: #c3c6d6
* **role**: Semantic Success, **value**: #69f0ae
* **role**: Semantic Error, **value**: #d92d20
* **role**: Semantic Warning, **value**: #f59e0b
* **role**: Signature Gradient, **value**: linear-gradient(135deg, rgb(0, 61, 155) 0%, rgb(0, 82, 204) 100%)

## Spacing
* 64px (section vertical gap)
* 32px (subsection gap)
* 16px (card padding)
* 8px (token pill gap)

## Borders / Radius / Effects
### radius
* 12px (Brand card & container)
* 8px (Specimen cards)
* 4px (Input & button controls)
* 2px (Tag chips)
### shadows
* 0px 1px 3px 0px rgba(4,27,60,0.05)
* 0px 10px 15px -3px rgba(0,0,0,0.1) (Elevated depth signature CTA)
### borders
* 1px solid rgba(195,198,214,0.3)

## Content
* 1. Brand Assets
* TASKLY
* 2. Color Palette
* Primary
* Primary Container
* Surface Highest
* Surface Low
* Background
* 3. Typography
* Curated Space
* Institutional Trust & Precision
* Task Management Redefined
* 4. Components Showcase
* Primary Action
* Secondary
* Ghost Action
* Signature Gradient CTA
* 5. Iconography

## Repeated Visual Patterns
*Note: These are repeated structures observed in the design context. They are NOT confirmed native Figma components.*
* Header - Top Navigation
* Button - Submit Action
* Validation Hints (Visualized State)

## Assets
*Note: Permanent asset extraction belongs to the later asset-preservation phase.*
* TASKLY Brand Logomark (SVG)
* Dashboard Icon (SVG)
* Monitoring Icon (SVG)
* Inventory Icon (SVG)
* Groups Icon (SVG)
* Description Icon (SVG)
* Mail Icon (SVG)
* Event Icon (SVG)
* Settings Icon (SVG)
* Shield Icon (SVG)
* Hub Icon (SVG)
* Rocket Icon (SVG)
* Architecture Icon (SVG)

## States
* `Default`

## Responsive Relationship
* Counterpart: None (Auxiliary Reference Canvas)

## Extraction Method
* Design context: Figma Dev Mode MCP `get_design_context`
* Visual reference: Native Figma PNG export @1x

## Implementation Status
Not mapped to application implementation in this preservation phase.

## Extraction Limitations
* Figma MCP returns design tree JSX and reference styles; dynamic browser interaction states are documented factually from visual frame properties.
