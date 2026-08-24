# Implement Pagination for Project Tasks

Status: To Do
Task ID: TM-25

### 🎯 Objective

Enable **pagination** for Project Tasks with:

- **Pagination controls** in list view
- **Infinite scroll** in board view and mobile view

Ensure smooth navigation and accurate total count handling across all task views.

---

### 🔗 API Integration

### Endpoint

```
GET /rest/v1/project_tasks?project_id=eq.{PROJECT_ID}&limit={LIMIT}&offset={OFFSET}
```

### Query Parameters

- `project_id`: Selected project ID (required)
- `limit`: Number of tasks per request
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

- `limit` → page size
- `offset` → calculated as:
    
    ```
    (currentPage - 1) * limit
    ```
    

---

### 📥 Reading Pagination Metadata from Response

Pagination metadata is returned in **response headers**.

### 1. Total Count

```
Content-Range: 0-9/120
```

- The value after `/` → **total number of tasks**

---

### 2. Current Range (Pointer)

```
Content-Range: 0-9/120
```

- `0-9` → current range:
    - Start index = 0
    - End index = 9

---

## 🛠️ Requirements

---

### 📋 List View (Desktop)

- Use **classic pagination**
- Controls:
    - Previous
    - Next
    - Page numbers

---

### 🧱 Board View (Desktop)

- Use **infinite scroll on desktop and mobile**
- Load more tasks when:
    - User scrolls near bottom of column

---

### 📱 Tasks Mobile View

- Use **infinite scroll**
- Load next page when user reaches bottom of screen