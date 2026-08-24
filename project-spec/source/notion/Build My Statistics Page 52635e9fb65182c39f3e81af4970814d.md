# Build "My Statistics" Page

Status: To Do
Task ID: TM-31

## 🎯 Objective

Create a **“My Statistics” dashboard page** that displays task insights for the **current logged-in user**, based on a selected date range (max 7 days), with filtering by project and status.

[https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Tasks-Management?node-id=6831-873&t=98fKIlPm5UiglB0n-0](https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Tasks-Management?node-id=6831-873&t=98fKIlPm5UiglB0n-0)

---

# 🚪 Entry Point

### 📍 Sidebar

- Add new sidebar item:
    - Label: **My Statistics**
    - Icon: Analytics icon

### 🔗 Route

```
/my-statistics
```

- Clicking navigates to page
- Active state should be highlighted

---

# 🔍 Filters Section

## 📅 Date Range (REQUIRED)

- Max range: **7 days**
- default value: current week
- Validation:
    - Prevent selecting > 7 days
    - Show error message if exceeded

---

## 📁 Project Filter (OPTIONAL)

- Dropdown:
    - **All Projects** (default)
    - List of projects
- API Behavior:
    - All Projects → `p_project_id = null`
    - Specific project → `p_project_id = UUID`

---

## 📊 Status Filter (OPTIONAL)

- Dropdown:
    - **All Statuses** (default)
    - Backend Values:
        - TO_DO
        - IN_PROGRESS
        - BLOCKED
        - IN_REVIEW
        - READY_FOR_QA
        - REOPENED
        - READY_FOR_PRODUCTION
        - DONE
    - Frontend Values use the same values without `_`
- API Behavior:
    - All → `p_status = null`
    - Specific → `p_status = "STATUS"`

---

# 📡 APIs

---

## 🔹 1. Calendar + KPI API

### Endpoint

```
POST /rest/v1/rpc/get_tasks_calendar_stats
```

---

### Request Body

```
{
  "p_start_date":"2026-05-01",
  "p_end_date":"2026-05-07",
  "p_project_id":"uuid | null",
  "p_status":"status | null"
}
```

---

### Parameters

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| p_start_date | string (date) | ✅ Yes | Start of range |
| p_end_date | string (date) | ✅ Yes | End of range |
| p_project_id | uuid | ❌ Optional | Filter by project |
| p_status | enum | ❌ Optional | Filter by status |

---

### Response

```
{
  "daily": [
    {
      "day":"2026-05-01",
      "statuses": {
        "TO_DO":2,
        "IN_PROGRESS":1
      }
    }
  ],
  "totals": {
    "TO_DO":5,
    "IN_PROGRESS":7,
    "DONE":3
  },
  "total_tasks":15,
  "done_tasks":3,
  "overdue_tasks":4
}
```

---

## 🔹 2. Tasks Per Project API

### Endpoint

```
POST /rest/v1/rpc/get_tasks_count_per_project
```

---

### Request Body

```
{
  "p_start_date":"2026-05-01",
  "p_end_date":"2026-05-07"
}
```

---

### Parameters

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| p_start_date | string (date) | ✅ Yes | Start date |
| p_end_date | string (date) | ✅ Yes | End date |

---

### Response

```
[
  {
    "project_id":"uuid",
    "project_name":"Frontend Revamp",
    "tasks_count":10
  }
]
```

---

# 🧱 UI Sections

---

## 🔢 1. KPI Cards

![Screenshot 2026-05-03 at 7.52.30 PM.png](Build%20My%20Statistics%20Page/Screenshot_2026-05-03_at_7.52.30_PM.png)

Display 3 cards:

| Title | API Field |
| --- | --- |
| Total Tasks | `total_tasks` |
| Completed Tasks | `done_tasks` |
| Overdue Tasks | `overdue_tasks` |

---

## 📅 2. Weekly Calendar View

![Screenshot 2026-05-03 at 7.52.11 PM.png](Build%20My%20Statistics%20Page/Screenshot_2026-05-03_at_7.52.11_PM.png)

- Display selected days (max 7)
- Each day:
    - Date (Mon, 12 May)
    - Status counts

### Example:

```
TO_DO: 2
IN_PROGRESS: 1
DONE: 3
```

### Empty state:

```
No Tasks
```

---

## 📊 3. Doughnut Chart (Tasks by Status)

- Source: `totals`
- Chart type: Doughnut

![Screenshot 2026-05-03 at 7.50.44 PM.png](Build%20My%20Statistics%20Page/Screenshot_2026-05-03_at_7.50.44_PM.png)

---

## 📁 4. All Projects

- Source: API #2
- Display:
    - Project name
    - Tasks count

![Screenshot 2026-05-03 at 8.11.50 PM.png](Build%20My%20Statistics%20Page/Screenshot_2026-05-03_at_8.11.50_PM.png)

---

#