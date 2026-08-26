import { supabase } from "@/lib/supabase/client";
import { SUPABASE_URL, getHeaders } from "./config";

export interface NewEpicInput {
  title: string;
  description: string | null;
  assignee_id: string | null;
  deadline: string | null;
}

export interface EpicUser {
  sub: string;
  name: string;
  email: string;
  department: string;
}

export interface ProjectEpic {
  id: string;
  epic_id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  created_at: string;
  created_by: EpicUser | null;
  assignee: EpicUser | null;
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
  getByProject: async (projectId: string) => {
    return supabase
      .from("project_epics")
      .select(
        "id, epic_id, title, description, deadline, created_at, created_by, assignee"
      )
      .eq("project_id", projectId);
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
