# Implement Search Functionality for Project Tasks

Status: To Do
Task ID: TM-29

### 🎯 Objective

Enable users to **search project tasks by title** within a selected project, with support for:

- Pagination (list view)
- Infinite scroll (board view & mobile view)

---

### 🔗 API Integration

### Endpoint

```
GET /rest/v1/project_tasks?project_id=eq.{PROJECT_ID}&title=ilike.%25{SEARCH_TERM}%25
```

### Query Parameters

- `project_id`: Selected project ID (required)
- `title`: Search filter using case-insensitive matching

---

### 🔍 Search Behavior

- Use:
    
    ```
    title=ilike.%25{SEARCH_TERM}%25
    ```
    
- `%` acts as wildcard:
    - `%term%` → match anywhere in title
- Search is **case-insensitive**

---

### 📡 Required Request Headers

The following headers **must be included in every request**:

- `apikey`: API key
- `Authorization`: Bearer token of the authenticated user
- `Content-Type`: `application/json`
- `Prefer`: `count=exact` ✅ (required for total count)

---

## 🛠️ Requirements

---

### 1. UI Behavior

- Add search input in:
    - Tasks List View
    - Tasks Board View
- Placeholder:
    
    > “Search tasks...”
    > 

---

### 2. Search Trigger

- Trigger search on typing (debounced)
- Recommended debounce:
    - **300–500ms**

---

### 3. State Management

Maintain:

- Search term
- Current page (list view)
- Offset (infinite scroll)
- Total count
- Selected `project_id`

---

### 4. Pagination + Search Integration

### 📋 List View (Desktop)

- Use **pagination**
- On search:
    - Reset:
        - page = 1
        - offset = 0
- Apply search term with every page request

---

### 🧱 Board View

- Use **infinite scroll**
- On search:
    - Reset:
        - offset = 0
        - loaded tasks
- Fetch filtered tasks and append on scroll

---

### 📱 Mobile View

- Use **infinite scroll**
- Same behavior as board view

---

### 5. Reading Total Count

From response header:

```
Content-Range: 0-9/35
```

- `35` → total filtered tasks

---

### 6. Loading State

### List View

- Full loader when searching or changing page

### Infinite Scroll

- Bottom loader while fetching more results

---

### 7. Empty State

### No search results:

> “No tasks found matching your search”
> 

### No tasks at all:

> “No tasks found for this project”
> 

---

### 8. Error Handling

- Show message:
    
    > “Failed to search tasks”
    > 
- For infinite scroll:
    - Show retry option at bottom