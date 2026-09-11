<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Bump Rationale: Minor version bump expanding the Spec-Driven Development Lifecycle stages, adding pre-commit visual verification rules, and strengthening Git closure verification.
- Modified Sections:
  - Core Principle IV: Expanded Spec-Driven Development Lifecycle to explicitly encompass the 10-stage UI parity flow: Constitution → Specification → Clarify → Plan → Independent Plan Review → Checklist → Tasks → Analyze → Implementation → Convergence. Defined roles for Clarify, Independent Plan Review (read-only `review-plan` lane), Checklist, Analyze, and Implementation/Convergence iteration.
  - Quality Gates & Git Discipline: Added mandatory pre-commit visual quality verification against approved Figma frames (desktop and mobile) and expanded Git closure to require explicit verification post-commit and post-push (branch state, expected commit, tree cleanliness, remote sync).
- Preserved Sections:
  - Core Principle I: Project Governance & Contract Integrity
  - Core Principle II: Sources of Truth & Conflict Resolution
  - Core Principle III: Frame-by-Frame UI Parity Workflow
  - Core Principle V: Orchestration & Fleet Delegation Workflow
  - Technical Stack & Architectural Constraints
  - Governance
- Follow-up TODOs: None; all amended governance rules are fully defined.
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

### III. Frame-by-Frame UI Parity Workflow
UI parity implementation MUST proceed strictly one approved Figma frame at a time. Agents MUST inspect both the target Figma frame and the current application implementation before drafting plans or code. Parity verification MUST compare layout, dimensions, spacing, typography, colors, borders, radii, shadows, icons, assets, interactive states, and responsive behavior. Scope MUST NOT silently expand into unrelated screens or adjacent components. Both desktop and mobile viewports MUST be validated whenever relevant to the target frame.

### IV. Spec-Driven Development Lifecycle
Every new UI parity frame MUST flow through the formal Spec Kit artifact and verification lifecycle before implementation:
1. Constitution: Governs project rules, technical standards, and non-negotiable governance.
2. Specification (`spec.md`): Defines what needs to be built and why.
3. Clarify (`speckit-clarify`): Resolves ambiguity and underspecification in the current specification before planning begins.
4. Plan (`plan.md`): Defines the architectural and technical how.
5. Independent Plan Review: Uses the configured read-only `review-plan` delegation lane after the canonical plan is produced. The reviewer provides findings only; AGY remains the sole owner and editor of canonical Spec Kit artifacts.
6. Checklist (`speckit-checklist`): Verifies requirement quality, completeness, and boundary criteria before implementation.
7. Tasks (`tasks.md`): Defines executable, dependency-ordered work units.
8. Analyze (`speckit-analyze`): Verifies cross-artifact consistency between Constitution, specification, plan, and tasks before implementation starts.
9. Implementation (`speckit-implement`): Executes bounded implementation following approved artifacts.
10. Convergence (`speckit-converge`): Audits the codebase against the spec, plan, and tasks.
Implementation and Convergence MUST iterate until the feature reports complete convergence.

### V. Orchestration & Fleet Delegation Workflow
AGY operates as the sole orchestrator with exclusive ownership of Spec Kit artifact authoring, final code reviews, validation gate execution, and Git commits. Delegation across the configured fleet lanes MUST adhere to defined bounds:
- `plan`: Restricted to read-only technical planning assistance.
- `review-plan`: Restricted to independent read-only review of generated technical plans.
- `implement`: Restricted to bounded code implementation against approved spec, plan, and tasks.
Delegates MUST NOT independently alter requirements or governance, and MUST NOT commit code. The orchestrator MUST review raw diffs and independently rerun all validation gates before accepting delegated work.

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
  For UI parity work, the orchestrator MUST visually verify the implemented screen against the approved Figma frame—including relevant desktop and mobile states—before the stage is accepted for commit.
- Validation Gates:
  - `pnpm format:check`
  - `pnpm lint`
  - `pnpm exec next typegen` (when required)
  - `pnpm exec tsc --noEmit`
  - `pnpm build`
  - `git diff --check`
- Git Workflow & Closure:
  - Review `git status` and diffs before staging.
  - Stage exact file paths only; `git add .` is strictly prohibited.
  - Commit only after the target frame or stage has been reviewed, validated, and approved.
  - Verification After Commit: Confirm branch state, expected commit, and working tree cleanliness.
  - Verification After Push: Confirm working tree cleanliness and synchronization with the remote branch after push.

## Governance
This Constitution establishes non-negotiable project laws and supersedes ad-hoc preferences or unwritten assumptions. Any amendment to this document requires explicit justification, human review, and semantic version incrementing (MAJOR for principle removals/redefinitions, MINOR for new or expanded rules, PATCH for clarifications). All PRs, task plans, and delegated outputs MUST be validated against this Constitution.

**Version**: 1.1.0 | **Ratified**: 2026-09-11 | **Last Amended**: 2026-09-11
