import { SUPABASE_URL, getHeaders } from "./config";

export const EpicsService = {
  getByProject: async (
    token: string,
    projectId: string,
    limit = 10,
    offset = 0
  ) => {
    return fetch(
      `${SUPABASE_URL}/rest/v1/project_epics?project_id=eq.${projectId}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: { ...getHeaders(token), Prefer: "count=exact" },
      }
    );
  },
  create: async (token: string, data: unknown) => {
    return fetch(`${SUPABASE_URL}/rest/v1/epics`, {
      method: "POST",
      headers: { ...getHeaders(token), Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
  },
  getDetails: async (token: string, projectId: string, epicId: string) => {
    return fetch(
      `${SUPABASE_URL}/rest/v1/project_epics?project_id=eq.${projectId}&id=eq.${epicId}`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },
  update: async (token: string, epicId: string, data: unknown) => {
    return fetch(`${SUPABASE_URL}/rest/v1/epics?id=eq.${epicId}`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
  },
  delete: async (token: string, epicId: string) => {
    return fetch(`${SUPABASE_URL}/rest/v1/epics?id=eq.${epicId}`, {
      method: "DELETE",
      headers: getHeaders(token),
    });
  },
};
