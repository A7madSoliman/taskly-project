import { supabase } from "@/lib/supabase/client";
import { SUPABASE_URL, getHeaders } from "./config";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface GetProjectsOptions {
  page?: number;
  limit?: number;
}

export const ProjectsService = {
  getAll: async (options?: GetProjectsOptions) => {
    if (options?.limit) {
      const page = options.page || 1;
      const from = (page - 1) * options.limit;
      const to = from + options.limit - 1;
      return supabase
        .rpc("get_projects", {}, { count: "exact" })
        .range(from, to);
    }
    return supabase.rpc("get_projects");
  },
  create: async (data: { name: string; description?: string }) => {
    return supabase.from("projects").insert([data]);
  },
  getById: async (projectId: string) => {
    const { data, error } = await supabase.rpc("get_projects");
    if (error) return { data: null, error };
    const project =
      (data as Project[] | null)?.find((p) => p.id === projectId) || null;
    return { data: project, error: null };
  },
  update: async (
    projectId: string,
    data: { name: string; description: string | null }
  ) => {
    return supabase.from("projects").update(data).eq("id", projectId);
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
