# Display Tasks Inside Epic Details Popup

Status: To Do
Task ID: TM-21

[https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Taskly--Tasks-Management-?node-id=19187-75&t=qoyqa9lr20ZRL4Od-0](https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Taskly--Tasks-Management-?node-id=19187-75&t=qoyqa9lr20ZRL4Od-0)

### 🎯 Objective

Enhance the **Epic Details Popup** by displaying a list of tasks related to the selected epic, based on the provided Figma design and API.

---

### 🎨 Design Reference

- Figma: ‣

---

### 🔗 API Integration

### Endpoint

```powershell
GET <Base_URL>/rest/v1/project_tasks?epic_id=eq.{EPIC_ID}
```

### Example Request

```
curl--location'<Base_URL>/rest/v1/project_tasks?epic_id=eq.{EPIC_ID}' \
--header'apikey: <API_KEY>' \
--header'Authorization: Bearer <ACCESS_TOKEN>' \
--header'Content-Type: application/json'
```

### Notes

- Replace `{EPIC_ID}` dynamically based on selected epic
- Use authenticated user token (already available in app context)

---

### 📦 Data to Display

For each task, render:

- **Task Title**
- **Assignee**
- **Due Date**

---

### 🛠️ Requirements

### 1. Data Fetching

- Fetch tasks when:
    - Epic popup opens **OR**
    - Selected epic changes
- Handle:
    - Loading state
    - Empty state (no tasks)
    - Error state

---

### 2. UI Implementation

- Follow Figma design strictly
- Display tasks in a **list/table format**
- Each task row should include:
    - Title (left aligned)
    - Assignee (avatar + name if available)
    - Due date (formatted)

---

### 3. Date Formatting

- Format due date as:
    - `DD MMM YYYY` (e.g., `27 Mar 2026`)

---

### 4. Assignee Handling

- If API returns:
    - `assignee_name` → display it
    - `assignee_avatar` → show avatar
- If null:
    - Show placeholder (e.g., “Unassigned”)

---

### 5. Empty State

- Show message:
    
    > “No tasks found for this epic”
    > 

---

### 6. Loading State

- Skeleton loader OR spinner inside popup

---

### 7. Error Handling

- Show fallback message:
    
    > “Failed to load tasks”
    >