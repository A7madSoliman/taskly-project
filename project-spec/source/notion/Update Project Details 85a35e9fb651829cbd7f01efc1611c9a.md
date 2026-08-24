# Update Project Details

Status: To Do
Task ID: TM-13

Allow users to update an existing project’s **name** and **description** using the REST API.

When the user clicks on the project details on the sidebar, they should be navigated to an **Edit Project** page where they can modify the details.

[https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Tasks-Management?node-id=82-2099&t=L7Jf026Stu5qCTd2-0](https://www.figma.com/design/zAwYa5nDWE2YirHYPpNabw/Tasks-Management?node-id=82-2099&t=L7Jf026Stu5qCTd2-0)

### User Flow

1. On the **Project Listing** page (`/project`):
    - Each project card should have an **Edit** (✏️) icon/button.
2. When the user clicks the **Edit** icon:
    - Navigate to the route: `/project/[projectId]/edit`
3. On the edit page:
    - Fetch and display the project’s current name and description.
    - Allow the user to modify them.
    - Validate the user input on each field.
    - Provide **Save** and **Cancel** buttons.
4. On save:
    - Call the API to update the project.
    - Show a success message.
5. On cancel:
    - Redirect back to `/project` without saving changes.

### API: Update Project

**Endpoint:**

```json
PATCH <base_url>/rest/v1/projects?id=eq.<project_id>
```

**Headers:**

```json
{
  "apikey": "<API_KEY>",
  "Authorization": "Bearer <ACCESS_TOKEN>",
  "Content-Type": "application/json"
}
```

**Body Example:**

```json
{
  "name": "Updated Project Name",
  "description": "Updated project description here."
}
```