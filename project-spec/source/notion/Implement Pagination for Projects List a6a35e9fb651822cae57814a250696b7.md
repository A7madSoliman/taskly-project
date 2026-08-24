# Implement Pagination for Projects List

Status: To Do
Task ID: TM-11

### 🎯 Objective

Enable **pagination** for the Projects list using the provided API, ensuring smooth navigation between pages and accurate total count handling.

---

### 🔗 API Integration

### Endpoint

```
GET /rest/v1/rpc/get_projects?limit={LIMIT}&offset={OFFSET}
```

### Query Parameters

- `limit`: Number of projects per page
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

- `limit` → page size (e.g., 10 projects per page)
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
    Content-Range: 0-9/100
    ```
    
- The number after `/` represents the **total number of projects**
    - Example: `100` → total records

---

### 2. Current Range (Pointer)

From the same header:

```
Content-Range: 0-9/100
```

- `0-9` → current range of returned items:
    - Start index = 0
    - End index = 9

---

### 🛠️ Requirements

---

### 1. UI Behavior

- Display projects in existing list/grid
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

---

### 3. Page Navigation

- On page change:
    - Update `offset`
    - Trigger new API request
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

- Show loader while fetching data

---

### 6. Empty State

- If no projects:
    
    > “No projects found”
    > 

---

### 7. Error Handling

- Show message:
    
    > “Failed to load projects”
    > 

---

### 📱 Mobile View

- Use **infinite scroll**
- Load next page when user reaches bottom of screen