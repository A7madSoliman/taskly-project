<!--
Sync Impact Report
- Version change: 1.3.0 -> 2.0.0
- Bump Rationale: Establishes Codex as the sole orchestrator and redefines the planning,
  implementation-review, convergence, and Git-closure governance model.
- Modified Sections:
  - Core Principle IV: Expanded to the complete Codex-owned Spec Kit lifecycle.
  - Core Principle V: Replaced the former orchestration model with Codex orchestration and bounded delegates.
  - Quality Gates & Git Discipline: Added one-Feature branch/PR and meaningful checkpoint policy.
- Added Sections: None.
- Removed Sections: None.
- Follow-up TODOs: None.
-->

# Taskly Project Constitution

## Core Principles

### I. Project Governance & Contract Integrity
`AGENTS.md` is the primary working contract and MUST be read prior to starting any implementation task. Existing Taskly functionality is approved and MUST NOT be altered during UI parity work unless a separate functional issue is explicitly approved. The existing project architecture, component library, and service layer MUST be thoroughly inspected before creating new components, services, utilities, or patterns. Agents MUST NOT invent requirements, API endpoints, design values, or behaviors.

### II. Sources of Truth & Conflict Resolution
Authority is strictly delineated between functional behavior and visual appearance:
- Functional Authority: Approved existing Taskly behavior, task specifications in `project-spec/tasks/`, the canonical API contract in `project-spec/source/api/Tasks_Management.postman_collection.json`, and existing automated tests remain authoritative.
- Visual Authority: The explicitly designated Figma frame inspected directly via the Figma MCP server is the authoritative visual source of truth.
- Conflict Escalation: If a Figma design appears to imply or require a functional behavior change, agents MUST stop and report the conflict rather than inventing or assuming behavior. Relevant design references in `design/` MUST be reviewed prior to UI implementation.

### III. Feature-by-Feature UI Parity Workflow
UI parity implementation MUST proceed one bounded Feature at a time. A single Feature may include multiple explicitly assigned authoritative Figma frames/states (such as Desktop + Mobile). All frames assigned to that Feature must be inspected and validated independently. The Feature as a whole runs through one Spec Kit lifecycle. Do not silently add unrelated frames/screens to the Feature. Parity verification MUST compare layout, dimensions, spacing, typography, colors, borders, radii, shadows, icons, assets, interactive states, and responsive behavior against each assigned exact Figma frame.

### IV. Spec-Driven Development Lifecycle
Every new UI parity Feature MUST flow through the formal Spec Kit artifact and verification lifecycle before implementation:
1. Complete a read-only Feature Preflight.
2. The human operator creates the dedicated Feature branch.
3. Run `speckit-specify`, then `speckit-clarify` when required.
4. Collect independent planning inputs from the read-only `plan` lane using
   `gemini-3.1-pro-high` and the read-only `review-plan` lane using
   `opencode/muse-spark-1.3-contributor-free`.
5. Codex synthesizes the inputs and authors the canonical plan through `speckit-plan`.
6. Both planning delegates independently review the canonical plan. Codex corrects it and requests
   re-review until Codex accepts it.
7. Run `speckit-checklist`, evaluate the checklist, run `speckit-tasks`, and run
   `speckit-analyze`; resolve every material finding before implementation.
8. Run bounded `speckit-implement` work through the writable `implement` lane using
   `gemini-3.8-flash-high`.
9. Codex reviews each raw implementation diff. Required fixes return through the bounded implement
   lane until Codex accepts the diff.
10. Run `speckit-converge`. If convergence adds tasks, return to the implementation and raw-diff
    review loop until no required work remains.
11. Complete independent Desktop and Mobile visual validation, final technical and Git-diff
    validation, then human-only Git closure.

### V. Orchestration & Fleet Delegation Workflow
Codex operates as the sole orchestrator and exclusively owns canonical Spec Kit artifacts, Preflight
conclusions, scope boundaries, plan synthesis and acceptance, checklist and tasks canonical state,
raw implementation diff review, validation and convergence decisions, and Git closure decisions.
The trusted project-local `.delegate/config.json` is the Taskly fleet authority:
- `plan`: Read-only independent planning input from `gemini-3.1-pro-high`.
- `review-plan`: Read-only independent planning and canonical-plan review input from
  `opencode/muse-spark-1.3-contributor-free`.
- `implement`: Bounded writable implementation and fix work through `gemini-3.8-flash-high`.
Delegates provide bounded findings or diffs only. They MUST NOT own or edit canonical Spec Kit
artifacts, independently alter requirements or governance, commit, push, merge, or perform Git
closure. Codex MUST synthesize planning inputs, correct and re-submit the plan until it approves the
result, review every raw implementation diff, and return fixes through the implement lane. Codex MUST
independently rerun required validation gates before acceptance. The human operator exclusively
executes all Git commands in Warp Terminal.

### VI. Permanent UI Parity Principles
1. **Figma Wins**: Approved Figma frames/nodes are the authoritative source of truth for visual implementation. When current code visually differs from Figma, Figma wins. Never invent or approximate visual values (width, spacing, typography, colors, borders, radii, shadows, layouts, states) when they can be obtained from Figma or approved design artifacts.
2. **Viewport Separation**: Desktop and Mobile are separate visual authorities. Do not assume Mobile is a scaled Desktop version. Each viewport/state must be validated against its own exact Figma frame.
3. **Functional Preservation**: UI parity must preserve existing correct functionality (routing, auth behavior, API behavior, state management, callbacks, persistence, accessibility, business logic) unless the official Task explicitly requires changes.
4. **Authority Separation**: Visual decisions (Figma), Functional requirements (`project-spec/tasks/`), API behavior (Postman collection), and Architecture (source + `AGENTS.md`) represent distinct authorities. If authorities conflict, agents MUST stop and document the conflict. Canonical repository files and direct Figma/source inspection override agent summaries.
5. **Strict Bounding**: Feature-by-Feature workflow is mandatory. A Feature must complete review, implementation, validation, convergence, and Git closure before the next starts. Do not bundle unrelated visual cleanup, refactoring, API changes, or architecture changes into a bounded UI parity feature. No global redesign is allowed unless explicitly authorized.

## Technical Stack & Architectural Constraints
The codebase relies on a fixed, modern stack that MUST be maintained:
- Package Manager: `pnpm` is strictly mandatory for all package and script executions.
- Dependency Pinning: Preserve repository versions for Next.js (App Router), React, TypeScript, Tailwind CSS, Supabase, ESLint, Prettier, and Playwright unless an approved task mandates an upgrade.
- Type Safety: TypeScript strictness MUST be maintained with no disabled checks or unvetted `any` types.
- Next.js Documentation: Per `AGENTS.md`, read the relevant guides under `node_modules/next/dist/docs/` before altering Next.js configurations or APIs.
- Secret Hygiene: Never expose, print, modify, or commit secrets or environment variables from `.env.local`.
- Architectural Reuse: Reuse existing shared components, types, hooks, and API utilities before introducing new abstractions.

## Quality Gates & Git Discipline
All implementation work MUST pass comprehensive quality gates prior to being committed:
- Pre-Commit Visual Quality Rule:
  For UI parity work, the orchestrator MUST visually verify the implemented screen against the approved Figma frame-including relevant desktop and mobile states-before the stage is accepted for commit.
- Validation Gates:
  - `pnpm exec prettier --check <exact-files>`: Targeted Prettier validation for files modified by the Feature is mandatory. `pnpm format:check` may still be run/evaluated as a repository-level signal, but a bounded Feature must not globally reformat unrelated files. Pre-existing unrelated formatting failures must be documented separately. The Feature is responsible only for not introducing new formatting failures in its authorized modification surface.
  - `pnpm lint`
  - `pnpm exec next typegen` (when required)
  - `pnpm exec tsc --noEmit`
  - `pnpm build`
  - `git diff --check`
- Git Workflow & Closure:
  - One Feature equals one dedicated branch and one PR.
  - The human operator creates the Feature branch before the first writable Spec Kit stage.
  - Review `git status` and diffs before staging.
  - Stage exact file paths only; `git add .` is strictly prohibited.
  - Meaningful human-executed Commit and Push checkpoints MAY occur after specification,
    clarification when files changed, an approved canonical plan, checklist, approved tasks,
    accepted implementation or fixes, convergence changes, and final closure documentation when
    files changed.
  - Empty commits MUST NOT be created for read-only planning, reviews, analysis, or validation.
  - Delegates MUST NOT execute Git closure. The human operator alone executes Commit, Push, PR,
    Merge, and branch cleanup after Codex approves the stage.
  - Verification After Commit: Confirm branch state, expected commit, and working tree cleanliness.
  - Verification After Push: Confirm working tree cleanliness and synchronization with the remote branch after push.

## Governance
This Constitution establishes non-negotiable project laws and supersedes ad-hoc preferences or unwritten assumptions. Any amendment to this document requires explicit justification, human review, and semantic version incrementing (MAJOR for principle removals/redefinitions, MINOR for new or expanded rules, PATCH for clarifications). All PRs, task plans, and delegated outputs MUST be validated against this Constitution.

**Version**: 2.0.0 | **Ratified**: 2026-09-12 | **Last Amended**: 2026-09-19
