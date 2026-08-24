# List Tasks List View

Status: To Do
Task ID: TM-23

[https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Tasks-Management?node-id=64-3897&t=L7Jf026Stu5qCTd2-0](https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Tasks-Management?node-id=64-3897&t=L7Jf026Stu5qCTd2-0)

## 📌 Description

Implement the **Project Tasks page** with a **List View**.

---

## 🧭 Navigation

- On Tasks Page When the user choose from the dropdown **“List View”**

![Screenshot 2026-04-30 at 7.36.31 AM.png](List%20Tasks%20List%20View/Screenshot_2026-04-30_at_7.36.31_AM.png)

- ➜ Navigate to:

```
/project/[projectId]/tasks?view=list
```

---

## 🖥️ UI Requirements

### 1️⃣ Page Header

- **Search Input**
    - Visible at the top of the page
    - No functionality required (UI only)
- **View Switcher (Select Input)**
    - Options:
        - List View
        - Board View
    - Default selected value: **Board View**
    - Only List View behavior is required in this task

---

### 2️⃣ List View Layout

- Display tasks on table
- Table columns
    - Task: display task_id
    - Title
    - Due Date
    - Status
    - Assignee
    - Settings (add three dots for now without any functionality)

---

### 3️⃣ Add New Task from List

- When user clicks the add task button:
    - Navigate to:

```
/project/[projectId]/tasks/new
```

---

## 🔗 API Integration

### Fetch tasks

fetch tasks using:

**Route**

```
/rest/v1/project_tasks
```

**Query Params**

- `project_id=eq.<project_id>`

**Headers**

- `apikey`
- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

Each column should independently fetch and display its related tasks.

---

## 🎨 Design Reference

Figma link:

‣

### For pagination only display the UI (don’t handle the functionality)