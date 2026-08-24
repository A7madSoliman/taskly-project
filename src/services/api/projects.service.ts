import { SUPABASE_URL, getHeaders } from "./config";

export const ProjectsService = {
  getAll: async (token: string) => {
    return fetch(`${SUPABASE_URL}/rest/v1/rpc/get_projects`, {
      method: "GET",
      headers: getHeaders(token),
    });
  },
  create: async (token: string, data: unknown) => {
    return fetch(`${SUPABASE_URL}/rest/v1/projects`, {
      method: "POST",
      headers: { ...getHeaders(token), Prefer: "return=representation" },
      body: JSON.stringify(data),
    });
  },
  update: async (token: string, projectId: string, data: unknown) => {
    return fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${projectId}`, {
      method: "PATCH",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
  },
  getMembers: async (token: string, projectId: string) => {
    return fetch(
      `${SUPABASE_URL}/rest/v1/get_project_members?project_id=eq.${projectId}`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );
  },
  invite: async (token: string, data: unknown) => {
    return fetch(`${SUPABASE_URL}/rest/v1/rpc/invite_member`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
  },
  acceptInvitation: async (token: string, data: unknown) => {
    return fetch(`${SUPABASE_URL}/rest/v1/rpc/accept_invitation`, {
      method: "POST",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
  },
};
