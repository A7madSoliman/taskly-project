# Taskly System Architecture & Decisions

## 1. Source-of-Truth Hierarchy

| Domain                     | Authoritative Source                                               | Secondary / Derived Reference            | Operational Rule                                                                                             |
| :------------------------- | :----------------------------------------------------------------- | :--------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Original Requirements**  | `project-spec/source/notion/`                                      | —                                        | Immutable raw provenance from Notion. Read-only.                                                             |
| **Operational Tasks**      | `project-spec/tasks/TM-XX.md`                                      | `project-spec/source/notion/`            | Normalized specifications used by coding agents. If a discrepancy with Notion is found, **STOP and report**. |
| **UI / UX Design**         | **Figma** (via Desktop MCP)                                        | `design/tokens/`, `design/components.md` | Figma canvas is the primary visual truth. Tokens provide local styling variables.                            |
| **API Contract**           | `project-spec/source/api/Tasks_Management.postman_collection.json` | `project-spec/api/api-map.md`            | Reference contract for endpoints, methods, headers, and payloads.                                            |
| **Engineering Rules**      | `AGENTS.md` & architecture docs                                    | —                                        | Canonical working contract for all agents.                                                                   |
| **Runtime Implementation** | `src/`                                                             | —                                        | Executable application code compiled by Next.js.                                                             |

---

## 2. API & Data Access Architecture

### Core Pattern

Application features and UI components must consume backend capabilities strictly through domain API services:

```text
UI Component / Screen
  ↓
Domain API Service (src/services/api/*.service.ts)
  ↓
Supabase Client SDK (src/lib/supabase/client.ts)
  ↓
Supabase Backend (Auth, REST, RPC, Realtime)
```

### Key Principles

1. **No Direct Supabase Calls in UI**: UI components and pages must not import `supabase` or make direct database/auth calls.
2. **Encapsulation**: Domain services in `src/services/api/` encapsulate data fetching, parameter mapping, error handling, and response typing.
3. **Official SDK Transport**: The preferred transport implementation is the official `@supabase/supabase-js` client SDK wrapped behind domain service functions.
4. **Postman Collection as Reference**: The Postman collection (`project-spec/source/api/Tasks_Management.postman_collection.json`) defines the canonical backend endpoints, schemas, RPC functions, and payloads. It is never imported at runtime.
