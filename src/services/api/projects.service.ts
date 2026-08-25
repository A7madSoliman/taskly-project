import { supabase } from "@/lib/supabase/client";
import { SUPABASE_URL, getHeaders } from "./config";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export const ProjectsService = {
  getAll: async () => {
    return supabase.rpc("get_projects");
  },
  create: async (data: { name: string; description?: string }) => {
    return supabase.from("projects").insert([data]);
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
