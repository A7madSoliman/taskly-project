# Design Components Reference

## Button Variants

- **Primary Action**: Solid blue background (`actionBlue.primary` or `actionBlue.primaryContainer`) with white text.
- **Secondary**: Outlined or lighter background for secondary actions.
- **Ghost Action**: Text only, no background, used for lowest priority actions.

## Form Controls

- **Full Name**: Standard input field. Normal state has a light gray/blue background (`actionBlue.surfaceHighest` or similar).
- **Email Address**: Demonstrates error state. The background or border turns red (`semantic.error`) when invalid.

## The Layering Principle

- Soft edges defined by tonal shifts.
- Visual representation of nested surfaces using different shades of background colors (e.g., `background`, `surfaceLow`, `surfaceHighest`).
- **Signature Gradient CTA**: Demonstrates depth with a 135-degree primary-to-container flow (gradient from `primary` to `primaryContainer`).

## Iconography

- Uses Material Symbols Outlined.
