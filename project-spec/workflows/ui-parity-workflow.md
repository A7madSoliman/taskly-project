# Taskly UI Parity Workflow

This document outlines the standard, permanent workflow for all UI Parity tasks in the Taskly project. Future features across the entire application must rely on these rules.

## 1. Project-Wide UI Parity Workflow Steps

UI parity proceeds one bounded Feature at a time. A single Feature may include multiple explicitly assigned authoritative Figma frames/states, such as Desktop + Mobile. All frames assigned to that Feature must be inspected and validated independently. The Feature as a whole runs through one Spec Kit lifecycle. Do not silently add unrelated frames/screens to the Feature.

For every future UI Feature, the standard workflow is:

1. Read `AGENTS.md`.
2. Read `.specify/memory/constitution.md`.
3. Read the relevant `project-spec/tasks/` file.
4. Identify all assigned Figma Desktop/Mobile/state frames for the Feature.
5. Review `project-spec/design/`.
6. Inspect the current code.
7. Inspect existing components/assets/tokens first.
8. Review Postman/API authority only when API behavior is involved.
9. Produce an exact current-code vs Figma delta.
10. Separate visual changes from functional changes.
11. Preserve existing correct behavior.
12. Run the approved Spec Kit lifecycle for the entire Feature.
13. Implement only the bounded Feature.
14. Validate each relevant viewport/state against its exact Figma design.
15. Run TypeScript, lint, build, and targeted formatting validation (`pnpm exec prettier --check <exact-files>`). Do not globally reformat unrelated files.
16. Perform convergence.
17. The human operator completes Git closure.
18. Only then begin the next Feature.

## 2. Figma Inspection Rules

For every UI Feature:

- Do not implement from memory, screenshots, assumptions, or previous Features when an exact Figma node exists.
- Inspect the exact frame/node and capture:
  - dimensions
  - layout direction
  - alignment
  - spacing
  - typography
  - colors
  - borders
  - shadows
  - radii
  - assets/icons
  - component variants
  - responsive differences
  - state differences

If an exact value cannot be proven:
- Do not guess.
- Report it as unresolved or derive it only from an approved shared Design System token/component if clearly authoritative.

## 3. Design System Rule

The Taskly Design System is a shared reference authority.

Reuse its approved:
- colors
- typography
- spacing
- components
- icons
- states
- tokens

when the exact screen/frame uses them.

However:
- Screen-specific Figma details override generic Design System defaults when the approved frame clearly specifies a different value.
- Do not globally restyle existing screens merely because a Design System token exists.
- Apply design corrections Feature-by-Feature.

## 4. Responsive Rule

Desktop and Mobile must be reviewed independently.

If both frames exist:
- Desktop must match Desktop Figma.
- Mobile must match Mobile Figma.

- Do not infer one from the other.
- Tablet/intermediate behavior should follow existing architecture unless the Task/Figma explicitly defines it.

## 5. Functional Safety Rule

A UI parity Feature is visual by default.

Existing correct functionality must remain unchanged unless canonical requirements explicitly authorize behavioral changes.

If a visual change appears to require modifying:
- auth logic
- API behavior
- backend/database
- routing
- data model
- shared state
- dependencies

**STOP** and report why before expanding scope.

## 6. Current Work Queue

The current operational sequence is:

1. Signup UI Parity (Desktop & Mobile)
2. Login UI Parity (Desktop & Mobile)
3. Forgot Password UI Parity (Desktop & Mobile)
4. Reset Password UI Parity (Desktop & Mobile)

After Auth, continue according to the authoritative Task sequence and approved project roadmap.

## 7. Deferred Work

Current deferred UI work includes:
- Mobile Drawer parity
- Bottom Navigation parity
- unrelated Application Shell refinements

These must not enter Auth Features unless explicitly reopened by the authoritative Task.
Completed Header and Desktop Sidebar implementations remain approved baselines unless a later authoritative Feature explicitly reopens them.
