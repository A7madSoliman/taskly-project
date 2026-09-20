# Research: Feature 003 — Signup UI Parity

## Decision: Signup-local composition

Existing Input, Button, and AuthHeader APIs can be used with local composition and styling. Shared API/default changes are not part of the baseline plan.

Rationale: this satisfies the authoritative Desktop and Mobile requirements with the smallest blast radius and protects other consumers.

Alternatives considered: extending shared APIs or changing shared defaults. Rejected unless implementation proves local composition insufficient.

## Decision: `md` breakpoint

Use `768px` as the Desktop transition. Keep the password layout stacked below `md` and two-column at/above `md`.

Rationale: the current `sm` behavior would expose Desktop composition too early at tablet widths and conflicts with the independent Mobile authority.

## Decision: exact assets

Reuse byte-identical repository assets where available; otherwise promote exact Figma exports to stable local paths after hash verification.

Rationale: MCP URLs expire and authored SVG substitutes violate exact asset parity.

## Decision: natural card expansion

Derive the default Desktop card geometry from content and spacing, but allow expansion for errors and accessibility content.

Rationale: fixed clipping would break preserved functional behavior.

## Decision: fractional values

Represent authoritative fractional values with exact CSS/Tailwind arbitrary values where stable; do not silently round.

Rationale: rounding can create visible parity drift.

## Decision: Mobile Name help text

The authoritative Mobile node visibly includes `3-50 characters, letters only.` below Name. Keep it visible. The populated Name value in Figma remains example-only.

## Decision: testing

Do not add a testing framework. Use existing infrastructure for bounded Signup tests where it fits; otherwise use manual/runtime checks for visual and responsive states.

Rationale: no broad Signup-specific test infrastructure is authorized or required for this UI-only Feature.

## Decision: Confirm Password control

Retain the independent Confirm Password visibility control and match the Password control geometry as closely as possible.

Rationale: functional preservation authorizes this as the sole visual divergence.
