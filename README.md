# Taskly

Taskly is a responsive Project and Task Management application for organizing Projects, Epics, and Tasks across List and Kanban Board workflows, with Project Member context and a configurable personal Statistics dashboard.

**Live Demo:** [https://taskly-project-eight.vercel.app](https://taskly-project-eight.vercel.app)

---

## Portfolio Video

> A public product walkthrough will be added here once the final recording is published.

---

## Overview

Taskly provides team members and project leads with an intuitive interface to streamline project execution. Designed with Next.js App Router, TypeScript, and Supabase, Taskly delivers fast client-side responsiveness backed by robust asynchronous state synchronization and optimistic UI updates across complex task workflows.

---

## Key Features

### Authentication
* **Login & Auth Boundaries**: Secure authentication flow with session persistence and protected client route boundaries.
* **Remember Me**: Remember credentials option for session management.
* **Logout**: Clean session termination and state reset.

### Project Management
* **Projects List**: Overview of all accessible projects with responsive card grids.
* **Project CRUD**: Complete Create, Edit, and Delete lifecycle for projects.
* **Pagination**: Numbered pagination for browsing projects efficiently.

### Epic Management
* **Epic Overview & Details**: Comprehensive modal and page views for managing Epics.
* **Epic CRUD**: Create, Edit, and Delete functionality for Epics.
* **Epic Task Linking**: View and manage tasks linked to specific epics.
* **Epic Search**: Filter Epics by title query.

### Task Management & Workflows
* **Flexible Views**: Toggle between structured List view and interactive Kanban Board view.
* **Task Details Modal**: Dedicated modal interface for inspecting and editing task fields.
* **Multi-Origin Task Editing**: Edit tasks seamlessly from both Project Tasks and Project Epics contexts with persistent read-back.
* **Kanban Drag & Drop**: Drag tasks across status columns with immediate optimistic reconciliation and backend state persistence.
* **Error Recovery & Rollback**: Automatic UI rollback when backend mutations encounter network or validation failures.
* **Task Search & Pagination**: Debounced title search and 10-task-per-page numbered pagination.

### Project Members
* **Project Members Presentation**: Presentation of assigned project members for context and task assignment transparency.

### My Statistics
* **Personal Dashboard**: High-level productivity analytics covering assigned task progress.
* **Date Range Controls**: Configurable date range filters (up to a 7-day inclusive window).
* **Filter Mapping**: Filter statistics by Project and Status.
* **KPI & Visual Breakdown**: Key metric cards, weekly schedule distribution, status breakdown, and project-by-project performance metrics.

### Responsive UX
* Optimized interfaces tailored for desktop screens and mobile viewports with dedicated navigation structures.

---

## Task Workflow

Taskly supports eight canonical task statuses reflecting real-world development pipelines:

1. **TO_DO** (To Do)
2. **IN_PROGRESS** (In Progress)
3. **BLOCKED** (Blocked)
4. **IN_REVIEW** (In Review)
5. **READY_FOR_QA** (Ready For QA)
6. **REOPENED** (Reopened)
7. **READY_FOR_PRODUCTION** (Ready For Production)
8. **DONE** (Done)

*Note: These canonical statuses allow flexible status transitions across views rather than strictly enforcing a single linear progression.*

---

## Tech Stack

* **Frontend Framework**: Next.js 16 (App Router) & React 19
* **Language**: TypeScript
* **Styling**: Tailwind CSS
* **Backend & Database**: Supabase (PostgreSQL & Auth Client)
* **Drag and Drop**: `@dnd-kit/core`
* **Icons**: Lucide React
* **Testing & QA**: Playwright E2E Suite
* **Code Quality**: ESLint, Prettier
* **Package Manager**: pnpm
* **Deployment**: Vercel

---

## Architecture

Taskly follows a modular architecture separating presentation, coordination, and API persistence:

```text
src/
├── app/                  # Next.js App Router routes & pages
│   ├── (auth)/           # Authentication routes
│   └── project/          # Project, Epic, Task, and Member surfaces
├── components/           # Reusable UI components
│   ├── epics/            # Epic cards, modals, and forms
│   ├── layout/           # AppShell, headers, and mobile navigation
│   ├── statistics/       # KPI cards, charts, and filter controls
│   ├── tasks/            # Task rows, cards, columns, and modal
│   └── ui/               # Base UI primitives & feedback components
├── services/
│   └── api/              # Domain API services wrapping Supabase client calls
└── lib/
    ├── constants/        # Task status & domain constants
    └── supabase/         # Supabase client instantiation
```

---

## Key Routes

* `/` — Root application entry
* `/login` — Login page
* `/project` — Projects overview page
* `/project/add` — Create new project
* `/project/[projectId]/edit` — Edit project settings
* `/project/[projectId]/epics` — Project Epics workspace
* `/project/[projectId]/epics/new` — Create new Epic
* `/project/[projectId]/tasks` — Project Tasks workspace (Board & List)
* `/project/[projectId]/tasks/new` — Create new Task
* `/project/[projectId]/members` — Project Members presentation
* `/my-statistics` — Personal Statistics Dashboard

---

## Testing & QA

Taskly is backed by an automated End-to-End Playwright test suite comprising 47 tests across 18 test files.

* **Automated QA Coverage**:
  * Fixture lifecycle safety & isolation
  * Authentication & route boundaries
  * CRUD flows for Projects, Epics, Tasks, and Members
  * Multi-origin Task editing persistence from Epics page
  * Search debouncing and pagination (10 tasks/page)
  * Kanban Drag & Drop status updates & error rollbacks
  * Responsive layout presentations

> **E2E Note**: Taskly contains a 47-test Playwright suite across 18 files. The latest complete release run recorded two known timing-sensitive headless blur scenarios in Epic/Task update tests. Both affected Product workflows were independently triaged, no Product regression was confirmed, and targeted 3/3 isolated executions passed cleanly.

* **Static Quality Gates**:
  * Prettier code style check: PASS
  * ESLint validation: PASS (0 errors, 0 warnings)
  * TypeScript type check (`tsc --noEmit`): PASS
  * Next.js production build (`pnpm build`): PASS

---

## Getting Started

### Prerequisites

* Node.js (v18 or higher recommended)
* `pnpm` package manager

### Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/A7madSoliman/taskly-project.git
   cd taskly-project
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory based on `.env.example`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

4. **Start the Development Server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

* `pnpm dev` — Start the Next.js development server.
* `pnpm build` — Build the optimized production application.
* `pnpm start` — Start the production server locally.
* `pnpm lint` — Run ESLint check.
* `pnpm format:check` — Check code formatting using Prettier.
* `pnpm format` — Auto-format code using Prettier.
* `pnpm test:e2e` — Execute the Playwright End-to-End test suite.

---

## Deployment

Taskly is deployed and hosted on Vercel:

**Production URL:** [https://taskly-project-eight.vercel.app](https://taskly-project-eight.vercel.app)

---

## Release Scope Notes

* **Invitation Lifecycle (TM-28)**: Invitation integration surfaces exist in the codebase; delivery and acceptance are outside v1.0.0 release certification.
* **Authentication Scope**: Sign Up, Forgot Password, and Reset Password flows are implemented, while Login and Session protection form the primary certified v1.0.0 scope.
* **Project Search**: Search is supported across Epics and Tasks within a project; global project search is not part of the v1.0.0 feature scope.

---

## Future Improvements

* Independent release certification for the full Invitation lifecycle.
* Refinement of headless Playwright blur event synchronization for test execution environments.
* Ongoing accessibility and keyboard navigation enhancements across workspace modals.
