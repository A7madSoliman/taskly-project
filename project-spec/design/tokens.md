# Taskly Figma Design Tokens

## Purpose
This document provides a local snapshot of the original Figma visual foundations. It is NOT yet the codebase token mapping. It serves to preserve the raw design intent and values discovered during the Phase 2 extraction process.

## Variable Collections
The Figma MCP does not reliably expose the structural boundaries of token collections. All discovered explicit variables are listed below.

## Colors
Explicit Figma color variables discovered:
- **Figma name:** `Color/Grey/800` | **Value:** `#222529`
- **Figma name:** `Color/Grey/500` | **Value:** `#8c97a7`
- **Figma name:** `var(--foreground)` | **Value:** `#020617`
- **Figma name:** `var(--accent-foreground)` | **Value:** `#0f172a`

## Typography
No explicit typography variables (text styles) were exposed by the Figma MCP. 

*Observed Typography Foundations:*
- **Font Families:** Inter (Regular, Medium, Semi_Bold, Bold)
- **Observed Sizes:** 10px, 11px, 12px, 14px, 16px, 18px, 20px, 24px, 30px
- **Observed Tracking:** -0.75px, -0.6px, -0.5px, 0.55px

## Spacing
Explicit Figma spacing variables discovered:
- **Figma name:** `Space/4` | **Value:** `16`

*Observed Raw Spacing Values:*
- 4px, 8px, 12px, 14px, 16px, 24px, 32px, 40px, 48px

## Radius
No explicit radius variables were exposed by the Figma MCP.

*Observed Raw Radius Values:*
- 2px, 4px, 8px, 12px

## Shadows / Effects
No explicit effect variables were exposed by the Figma MCP.

*Observed Raw Design Effects:*
- Soft Elevation: `0px 1px 2px 0px rgba(0,0,0,0.05)`
- Deep Elevation: `0px 24px 48px 0px rgba(4,27,60,0.06)`

## Other Variables
None discovered.

## Observed Raw Values
The following important recurring visual values are present in the designs but could NOT be proven to be linked to Figma Variables.

`Observed raw value — not confirmed as Figma Variable`

**Primary Colors (Observed):**
- `#041b3c` (Dark Navy - Headings)
- `#4f5f7b` (Muted Blue-Grey - Paragraphs)
- `#434654` (Darker Grey - Validation text)
- `#003d9b` (Action Blue - Links)
- `#d7e2ff` (Light Blue - Input backgrounds)
- `#e8edff` (Pale Blue - Validation background)
- `#f9f9ff` (App Background)
- `linear-gradient(135deg, rgb(0, 61, 155) 0%, rgb(0, 82, 204) 100%)` (Primary Button Gradient)

## Alias Relationships
No alias relationships were verified, as the Figma MCP does not expose them.

## Modes
No modes (e.g., Light/Dark) were discovered.

## Extraction Limitations
- The Figma MCP (`get_variable_defs`) only exposes a flattened JSON key-value map.
- Collection names, scopes, modes, and descriptions are completely omitted by the MCP.
- Most visual values (colors, fonts, radii) used throughout the design are applied as raw values and are not exposed as explicit Figma Variables through the MCP.

## Future Code Mapping
Figma-to-code token mapping has NOT been performed in this phase.
