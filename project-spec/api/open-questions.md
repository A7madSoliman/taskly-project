# API Contract Open Questions & Ambiguities

This document records factual ambiguities and discrepancies between task requirements and the reference Postman collection (`project-spec/source/api/Tasks_Management.postman_collection.json`).

> [!NOTE]
> No implementation decisions are made here. These items must be resolved during the planning phase of their respective tasks.

---

## 1. TM-31 — Statistics Endpoint Availability

- **Issue**: `TM-31` specifies a "My Statistics" page displaying task metrics and project overviews.
- **Contract Observation**: No dedicated statistics endpoint (e.g. `/rest/v1/statistics` or RPC `get_statistics`) is defined in the supplied Postman collection.
- **Resolution Required**: Determine during TM-31 planning whether statistics are derived from existing `/rest/v1/project_tasks` and `/rest/v1/rpc/get_projects` endpoints or if a dedicated backend function will be supplied.

---

## 2. TM-11, TM-17, TM-25 — Pagination Parameters & Response Headers

- **Issue**: Tasks `TM-11`, `TM-17`, and `TM-25` require paginated listings for projects, epics, and tasks.
- **Contract Observation**: Postman requests show standard list queries without explicitly documented pagination query parameters (`limit`, `offset`) or response headers (`Content-Range`).
- **Resolution Required**: Standardize pagination query and header handling during the respective task planning phases.
