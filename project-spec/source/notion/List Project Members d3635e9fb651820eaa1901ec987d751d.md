# List Project Members

Status: To Do
Task ID: TM-14

[https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Tasks-Management?node-id=15-912&t=L7Jf026Stu5qCTd2-0](https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Tasks-Management?node-id=15-912&t=L7Jf026Stu5qCTd2-0)

**Route:**

`/project/[projectId]/members`

**Goal:**

Build the Project Members page according to the provided Figma design and fetch members using the Supabase REST API endpoint.

---

# **API Endpoint**

Use this Supabase REST endpoint to fetch project members:

```
GET <BASW_URL>/rest/v1/get_project_members?project_id=eq.<projectId>
```

**Headers:**

```
apikey: <API_KEY>
Authorization: Bearer <user-access-token>
Content-Type: application/json
```

---

# **UI Requirements (from Figma)**

**The page must include:**

### 1. **Header Section**

- Button: **Invite Members** (non-functional for this task unless stated)
- Breadcrumb

### 2. **Members List**

Each member row must show:

- Avatar
- Name
- Email
- Role (Owner, Admin, Member, Viewer)

### 3. **Loading States**

‣

- Skeleton loaders for avatar + name + email + role

### 4. **Error State**

‣

- If API fails: Show message: “Failed to load project members. Please try again.”

---