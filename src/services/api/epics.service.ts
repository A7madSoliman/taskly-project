import { supabase } from "@/lib/supabase/client";
import { SUPABASE_URL, getHeaders } from "./config";

export interface NewEpicInput {
  title: string;
  description: string | null;
  assignee_id: string | null;
  deadline: string | null;
}

export const EpicsService = {
  create: async (projectId: string, data: NewEpicInput) => {
    return supabase.from("epics").insert({
      title: data.title,
      description: data.description,
      assignee_id: data.assignee_id,
      project_id: projectId,
      deadline: data.deadline,
    });
  },
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
