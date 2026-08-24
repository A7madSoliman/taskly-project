# API Endpoint Mapping Matrix

Derived from `project-spec/source/api/Tasks_Management.postman_collection.json`.

## 1. Authentication

- **Sign Up**: `POST /auth/v1/signup` → `AuthService.signUp`
- **Login**: `POST /auth/v1/token?grant_type=password` → `AuthService.login`
- **Get User**: `GET /auth/v1/user` → `AuthService.getUser`
- **Update Password**: `PUT /auth/v1/user` → `AuthService.updatePassword`
- **Refresh Token**: `POST /auth/v1/token?grant_type=refresh_token` → `AuthService.refreshToken`
- **Forgot Password**: `POST /auth/v1/recover` → `AuthService.forgotPassword`
- **Logout**: `POST /auth/v1/logout` → `AuthService.logout`

## 2. Projects

- **Get All Projects**: `GET /rest/v1/rpc/get_projects` → `ProjectsService.getAll`
- **Create Project**: `POST /rest/v1/projects` → `ProjectsService.create`
- **Update Project**: `PATCH /rest/v1/projects?id=eq.{projectId}` → `ProjectsService.update`
- **Get Project Members**: `GET /rest/v1/get_project_members?project_id=eq.{projectId}` → `ProjectsService.getMembers`
- **Invite Member**: `POST /rest/v1/rpc/invite_member` → `ProjectsService.invite`
- **Accept Invitation**: `POST /rest/v1/rpc/accept_invitation` → `ProjectsService.acceptInvitation`

## 3. Epics

- **Get Project Epics**: `GET /rest/v1/project_epics?project_id=eq.{projectId}` → `EpicsService.getByProject`
- **Create Epic**: `POST /rest/v1/epics` → `EpicsService.create`
- **Get Epic Details**: `GET /rest/v1/project_epics?project_id=eq.{projectId}&id=eq.{epicId}` → `EpicsService.getDetails`
- **Update Epic**: `PATCH /rest/v1/epics?id=eq.{epicId}` → `EpicsService.update`
- **Delete Epic**: `DELETE /rest/v1/epics?id=eq.{epicId}` → `EpicsService.delete`

## 4. Tasks

- **Get Tasks by Project**: `GET /rest/v1/project_tasks?project_id=eq.{projectId}` → `TasksService.getByProject`
- **Get Tasks by Epic**: `GET /rest/v1/project_tasks?epic_id=eq.{epicId}` → `TasksService.getByEpic`
- **Create Task**: `POST /rest/v1/tasks` → `TasksService.create`
- **Update Task Status**: `PATCH /rest/v1/tasks?id=eq.{taskId}` → `TasksService.updateStatus`
- **Delete Task**: `DELETE /rest/v1/tasks?id=eq.{taskId}` → `TasksService.delete`
