# API Contract Open Questions & Ambiguities

This document records factual ambiguities and discrepancies between task requirements and the reference Postman collection (`project-spec/source/api/Tasks_Management.postman_collection.json`).

> [!NOTE]
> No implementation decisions are made here. These items must be resolved during the planning phase of their respective tasks.

---

## 1. TM-31 — Statistics RPC Endpoints Availability

- **Issue**: `TM-31` specifies two RPC endpoints: `POST /rest/v1/rpc/get_tasks_calendar_stats` and `POST /rest/v1/rpc/get_tasks_count_per_project`.
- **Contract Observation**: Neither RPC endpoint is present in the supplied Postman collection (`Tasks_Management.postman_collection.json`).
- **Resolution Required**: Determine during TM-31 planning whether these backend RPC functions are deployed or if client-side aggregation over existing endpoints is required.

---

## 2. TM-11, TM-17, TM-25 — Pagination Parameters & Response Headers

- **Issue**: Tasks `TM-11`, `TM-17`, and `TM-25` require paginated listings for projects, epics, and tasks.
- **Contract Observation**: Postman requests show standard list queries without explicitly documented pagination query parameters (`limit`, `offset`) or response headers (`Content-Range`).
- **Resolution Required**: Standardize pagination query and header handling during the respective task planning phases.

## TM-03 User Metadata Discrepancy

- **Figma/TM-03 Source**: Specifies \job_title\ as the metadata field.
- **Postman API Contract**: Specifies \department\ as the metadata field in the Signup payload.
- **Resolution for TM-03**: Proceeding with \job_title\ as explicitly requested by product requirements, but this creates an inconsistency with the documented API contract.
