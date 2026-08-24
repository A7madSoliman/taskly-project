# Taskly Project Task Specifications

This directory contains the canonical normalized operational task specifications derived from the raw Notion exports in `project-spec/source/notion/`.

* **Task Index**: See `index.json` for machine-readable task metadata, status, and source mapping.
* **Normalization Pipeline**: Run `pnpm normalize:tasks` (`node scripts/normalize-tasks.mjs`) to regenerate or update task specifications deterministically.
* **Sequence**: 30 unique tasks (`TM-01` through `TM-31`, with `TM-07` omitted in the original project design).
