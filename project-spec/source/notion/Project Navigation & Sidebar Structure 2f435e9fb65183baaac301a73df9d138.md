# Project Navigation & Sidebar Structure

Status: To Do
Task ID: TM-12

### Login Redirect

- After successful login, redirect the user to `/project`.

### Project Navigation

- When a user selects a project, navigate to `/project/[projectId]/epics`.

### Project Sidebar

Display the following navigation items in the sidebar for the selected project:

| Menu Item | Route |
| --- | --- |
| Tasks | `/project/[projectId]/tasks` |
| Members | `/project/[projectId]/members` |
| Epics | `/project/[projectId]/epics` |
| Project Details | `/project/[projectId]/edit` |

### Requirements

- The selected project ID must be used dynamically in all project routes.
- The sidebar should be visible across all project-related pages.
- The active sidebar item should be highlighted based on the current route.