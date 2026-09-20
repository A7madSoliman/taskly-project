# Taskly UI Parity Workflow

This document outlines the standard, permanent workflow for all UI Parity tasks in the Taskly project. Future features across the entire application must rely on these rules.

## 1. Project-Wide UI Parity Workflow Steps

UI parity proceeds one bounded Feature at a time. A single Feature may include multiple explicitly assigned authoritative Figma frames/states, such as Desktop + Mobile. All frames assigned to that Feature must be inspected and validated independently. The Feature as a whole runs through one Spec Kit lifecycle. Do not silently add unrelated frames/screens to the Feature.

Before the lifecycle begins, read `AGENTS.md`, `.specify/memory/constitution.md`, the relevant task
specification and design references, applicable API authority, existing code, and reusable shared
components, assets, and tokens. Produce an exact current-code-versus-Figma delta, separate visual
from functional changes, and preserve existing correct behavior.

For every future UI Feature, the lifecycle is exactly:

1. Read-only Feature Preflight.
2. Human creates the dedicated Feature branch.
3. `speckit-specify`.
4. `speckit-clarify` when required.
5. `speckit-plan` directly in the project workspace using the agent chosen by the human operator.
6. Plan review against specification, exact Figma authorities, repository source, governance,
   functional behavior, and validation requirements before approval.
7. `speckit-checklist`.
8. Checklist evaluation.
9. `speckit-tasks`.
10. `speckit-analyze`.
11. Resolve all material analysis findings.
12. `speckit-implement` directly in the project workspace using the agent chosen by the human operator.
13. Independent review and fix loop until accepted.
14. `speckit-converge`.
15. If convergence adds work, return to the implementation and review loop.
16. Final independent Desktop and Mobile visual validation.
17. Final technical and Git-diff validation.
18. Human Git closure.

The human operator is the sole orchestrator (HUMAN = ORCHESTRATOR). The human chooses the best agent
for each Spec Kit stage. Agents work directly in the project workspace. There is no agent-to-agent
delegation, no Delegate fleet, no project-local `.delegate` authority, and no repository-defined agent
routing. Agents MUST NOT alter governance or scope, commit, push, merge, or perform Git closure.

## 2. Git Checkpoint Policy

One Feature equals one dedicated branch and one PR. The human operator creates the branch before the
first writable Spec Kit stage and exclusively executes all Git commands in Warp Terminal.

Meaningful Commit and Push checkpoints may occur after:

- specification
- clarification when files changed
- approved canonical plan
- checklist
- approved tasks
- accepted implementation or fixes
- convergence changes
- final closure documentation when files changed

Do not create empty commits for read-only planning, reviews, analysis, or validation. Stage exact
paths only; `git add .` is prohibited. Agents never perform Git closure.

## 3. Figma Inspection Rules

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

## 4. Design System Rule

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

## 5. Responsive Rule

Desktop and Mobile must be reviewed independently.

If both frames exist:

- Desktop must match Desktop Figma.
- Mobile must match Mobile Figma.

- Do not infer one from the other.
- Tablet/intermediate behavior should follow existing architecture unless the Task/Figma explicitly defines it.

## 6. Functional Safety Rule

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

## 7. Visual Example Data Rule

- Any sample text/data shown inside Figma inputs, fields, selectors, tables, cards, or similar UI elements is visual example data only unless the authoritative Feature requirements explicitly define it as real/default data.
- Do not treat Figma sample content as initial state, default user data, hardcoded production data, validation requirements, API payload requirements, or acceptance criteria.
- Form inputs start empty unless Feature requirements explicitly define a default value.
- Figma controls visual presentation.
- Feature requirements control behavior and real data requirements.
- If sample content conflicts with requirements, requirements control behavior/data and Figma controls presentation.

## 8. Current Work Queue

The current operational sequence is:

1. Signup UI Parity (Desktop & Mobile)
2. Login UI Parity (Desktop & Mobile)
3. Forgot Password UI Parity (Desktop & Mobile)
4. Reset Password UI Parity (Desktop & Mobile)

After Auth, continue according to the authoritative Task sequence and approved project roadmap.

## 9. Deferred Work

Current deferred UI work includes:

- Mobile Drawer parity
- Bottom Navigation parity
- unrelated Application Shell refinements

These must not enter Auth Features unless explicitly reopened by the authoritative Task.
Completed Header and Desktop Sidebar implementations remain approved baselines unless a later authoritative Feature explicitly reopens them.
