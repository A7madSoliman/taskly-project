# Implement Search Functionality for Project Epics

Status: To Do
Task ID: TM-26

### 🎯 Objective

Enable users to **search project epics by title** within a selected project, with real-time filtering and proper handling of pagination.

---

### 🔗 API Integration

### Endpoint

```
GET /rest/v1/project_epics?project_id=eq.{PROJECT_ID}&title=ilike.%25{SEARCH_TERM}%25
```

### Query Parameters

- `project_id`: Selected project ID (required)
- `title`: Search filter using `ilike` (case-insensitive match)

---

### 🔍 Search Behavior

- Use:
    
    ```
    title=ilike.%25{SEARCH_TERM}%25
    ```
    
- `%` represents wildcard:
    - `%term%` → match anywhere in the title
- Search should be **case-insensitive**

---

### 📡 Required Request Headers

The following headers **must be included in every request**:

- `apikey`: API key
- `Authorization`: Bearer token of the authenticated user
- `Content-Type`: `application/json`
- `Prefer`: `count=exact` ✅ (for total count with pagination)

---

### 🛠️ Requirements

---

### 1. UI Behavior

- Add search input above epics list
- Placeholder:
    
    > “Search epics...”
    > 

---

### 2. Search Trigger

- Trigger search:
    - On user typing (debounced) ✅
- Recommended debounce:
    - **300–500ms**

---

### 3. State Management

Maintain:

- Search term
- Current page / offset
- Total count
- Selected `project_id`

---

### 4. API Behavior

### When search term exists:

- Include:
    
    ```
    title=ilike.%25{SEARCH_TERM}%25
    ```
    

### When search is empty:

- Fetch all epics (no title filter)

---

### 5. Pagination + Search Integration

- Search results must be **paginated**
- On search change:
    - Reset:
        - page = 1
        - offset = 0

---

### 6. Reading Total Count

From response header:

```
Content-Range: 0-9/25
```

- `25` → total filtered results

---

### 7. Loading State

- Show loader while searching

---

### 8. Empty State

### No results for search:

> “No epics found matching your search”
> 

### No epics at all:

> “No epics found for this project”
> 

---

### 9. Error Handling

- Show message:
    
    > “Failed to search epics”
    > 

---

###