# Implement Pagination for Project Epics

Status: To Do
Task ID: TM-17

![Screenshot 2026-08-02 at 9.38.06 AM.png](Implement%20Pagination%20for%20Project%20Epics/Screenshot_2026-08-02_at_9.38.06_AM.png)

### 🎯 Objective

Enable **pagination** for the Project Epics list within a selected project, ensuring smooth navigation and accurate total count handling.

---

### 🔗 API Integration

### Endpoint

```
GET /rest/v1/project_epics?project_id=eq.{PROJECT_ID}&limit={LIMIT}&offset={OFFSET}
```

### Query Parameters

- `project_id`: Selected project ID (required)
- `limit`: Number of epics per page
- `offset`: Number of records to skip

---

### 📡 Required Request Headers

The following headers **must be included in every request**:

- `apikey`: API key
- `Authorization`: Bearer token of the authenticated user
- `Content-Type`: `application/json`
- `Prefer`: `count=exact` ✅ (required to retrieve total count)

---

### 📊 Pagination Logic

### 🔢 Limit & Offset

- `limit` → page size (e.g., 10 epics per page)
- `offset` → calculated as:
    
    ```
    (currentPage - 1) * limit
    ```
    

---

### 📥 Reading Pagination Metadata from Response

Pagination metadata is returned in **response headers**, not in the response body.

---

### 1. Total Count

- Extract from header:
    
    ```
    Content-Range: 0-9/50
    ```
    
- The number after `/` represents the **total number of epics**
    - Example: `50` → total records

---

### 2. Current Range (Pointer)

From the same header:

```
Content-Range: 0-9/50
```

- `0-9` → current range of returned items:
    - Start index = 0
    - End index = 9

---

### 🛠️ Requirements

---

### 1. UI Behavior

- Display epics in existing list/grid (or inside project details view)
- Add pagination controls:
    - Previous button
    - Next button
    - Page numbers (recommended)

---

### 2. State Management

Maintain:

- Current page
- Page size (`limit`)
- Total count (from response header)
- Selected `project_id`

---

### 3. Page Navigation

- On page change:
    - Update `offset`
    - Trigger new API request
- Reset pagination when:
    - `project_id` changes → go back to page 1
- Disable:
    - “Previous” on first page
    - “Next” on last page

---

### 4. Total Pages Calculation

- Calculate total pages:
    
    ```
    totalPages = ceil(total_count / limit)
    ```
    

---

### 5. Loading State

- Show loader while fetching epics

---

### 6. Empty State

- If no epics:
    
    > “No epics found for this project”
    > 

---

### 7. Error Handling

- Show message:
    
    > “Failed to load epics”
    > 
    
    #### 📱 Mobile View
    
    - Use **infinite scroll**
    - Load next page when user reaches bottom of screen