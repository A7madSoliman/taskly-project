# Data Model: Feature 003 — Signup UI Parity

## No data-model change

This Feature changes Signup presentation only. It introduces no database tables, columns, relationships, migrations, API payload changes, Supabase changes, or AuthService contract changes.

## Existing client state to preserve

The existing Signup form continues to represent five fields:

- Name
- Email
- Job Title
- Password
- Confirm Password

Existing validation state, API/error state, loading state, and independent password visibility state remain unchanged. Production initial values remain empty. Figma-populated values are test/visual examples only.

## Validation rules

Preserve the current Name, Email, Password complexity, and Confirm Password matching rules exactly. The Desktop and Mobile checklist/presentation changes do not alter validation execution.
