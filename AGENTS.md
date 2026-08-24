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
