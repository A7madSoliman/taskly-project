import { SUPABASE_URL, getHeaders } from "./config";

export const TasksService = {
  getByProject: async (token: string, projectId: string) => {
    return fetch(
      `${SUPABASE_URL}/rest/v1/project_tasks?project_id=eq.${projectId}`,
      {
        method: "GET",
        headers: { ...getHeaders(token), Prefer: "count=exact" },
      }
    );
  },
  getByEpic: async (token: string, epicId: string) => {
    return fetch(`${SUPABASE_URL}/rest/v1/project_tasks?epic_id=eq.${epicId}`, {
      method: "GET",
      headers: getHeaders(token),
    });
  },
  create: async (token: string, data: unknown) => {
    return fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
      method: "POST",
      headers: { ...getHeaders(token), Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
  },
  updateStatus: async (token: string, taskId: string, status: string) => {
    return fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${taskId}`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify({ status }),
    });
  },
  delete: async (token: string, taskId: string) => {
    return fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${taskId}`, {
      method: "DELETE",
      headers: getHeaders(token),
    });
  },
};
