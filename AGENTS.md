# Taskly Project — Agent Working Contract

## 1. Purpose

This repository is developed task-by-task using specifications stored in:

`project-spec/tasks/`

Before making any code changes, understand:

- the current task
- the API contract
- the design system
- the existing application architecture
- the existing implementation related to the task

Do not implement features based on assumptions.

Do not silently expand the scope of a task.

---

## 2. Required Context Reading Order

Before starting any implementation task, inspect the following in this order:

1. `AGENTS.md`
2. The current task specification inside `project-spec/tasks/`
3. Relevant design references inside `design/`
4. `project-spec/source/api/Tasks_Management.postman_collection.json` when API behavior is involved
5. Existing source code related to the task
6. Existing shared components, types, utilities, and API services that may already solve part of the task

Do not begin implementation until the relevant context has been reviewed.

If a referenced specification does not exist, do not invent it.

Report the missing information when it affects implementation.

---

## 3. Source-of-Truth Priority

When project information conflicts, use this priority:

1. Current Task Acceptance Criteria
2. API Contract
3. Design Specifications
4. Existing Project Architecture
5. Existing Implementation
6. Agent Preference

Never override explicit task requirements because another implementation seems preferable.

If the task conflicts with the API contract in a way that prevents correct implementation, stop and report the conflict.

---

## 4. Technology

Current core stack:

- Next.js
- App Router
- React
- TypeScript
- Tailwind CSS
- Supabase
- pnpm
- ESLint

Use the versions already installed in the repository.

Do not upgrade, downgrade, or replace major dependencies unless explicitly required by a task.

Do not assume Tailwind configuration behavior.

Inspect the installed Tailwind version and existing configuration before modifying styling infrastructure.

---

## 5. Package Manager

This repository uses:

`pnpm`

Use pnpm for dependency and script operations.

Examples:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm format
pnpm format:check
pnpm build
```

---

## 6. Project-Wide UI Parity Workflow

For UI Parity features, Taskly follows a strict, permanent Figma-driven workflow.
Agents MUST read and follow the full workflow rules defined in:

`project-spec/workflows/ui-parity-workflow.md`

Future prompts will simply state "Use the standard Taskly UI Parity workflow" and agents must inherit all project-wide rules automatically.

---

## 7. Orchestration and Git Ownership

The human operator is the sole orchestrator (HUMAN = ORCHESTRATOR). The human chooses the best agent for each Spec Kit stage.

Agents work directly in the project workspace. There is no agent-to-agent delegation, no Delegate fleet, no project-local `.delegate` authority, and no repository-defined agent routing.

The standard Spec Kit workflow is:

1. `speckit-specify`
2. `speckit-clarify` (when required)
3. `speckit-plan`
4. `speckit-checklist`
5. `speckit-tasks`
6. `speckit-analyze`
7. `speckit-implement`
8. independent review / fix loop
9. `speckit-converge`
10. human Git closure

Agents MUST NOT independently alter requirements, governance, or scope.

One Feature equals one dedicated branch and one PR. The human operator MUST create the Feature branch before the first writable Spec Kit stage. The human operator exclusively executes Commit, Push, PR, Merge, and branch cleanup commands in Warp Terminal. Agents MUST NOT commit, push, merge, or perform Git closure.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
