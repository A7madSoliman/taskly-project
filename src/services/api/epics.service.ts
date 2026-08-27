import { supabase } from "@/lib/supabase/client";
import { SUPABASE_URL, getHeaders } from "./config";

export interface NewEpicInput {
  title: string;
  description: string | null;
  assignee_id: string | null;
  deadline: string | null;
}

export interface UpdateEpicInput {
  title?: string;
  description?: string;
  assignee_id?: string | null;
  deadline?: string | null;
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
  getByProject: async (
    projectId: string,
    options: { page: number; limit: number; search?: string }
  ) => {
    const { page, limit, search } = options;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    // Server-side pagination via PostgREST range + exact count.
    // No .order() — TM-17 / Postman contract do not specify ordering.
    // count:"exact" is the SDK-approved equivalent of Prefer: count=exact
    // (responds with total in `count`, mirroring Content-Range).
    let query = supabase
      .from("project_epics")
      .select(
        "id, epic_id, title, description, deadline, created_at, created_by, assignee",
        { count: "exact" }
      )
      .eq("project_id", projectId);

    if (search && search.trim().length > 0) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    return query.range(from, to);
  },
  getAllByProject: async (
    projectId: string
  ): Promise<{
    data: { id: string; epic_id: string; title: string }[] | null;
    error: unknown | null;
  }> => {
    try {
      const { data, error } = await supabase
        .from("project_epics")
        .select("id, epic_id, title")
        .eq("project_id", projectId);

      if (error) return { data: null, error };

      return {
        data: (data as { id: string; epic_id: string; title: string }[]) ?? [],
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  },
  getDetails: async (
    projectId: string,
    epicId: string
  ): Promise<{ data: ProjectEpic | null; error: unknown | null }> => {
    try {
      const { data, error } = await supabase
        .from("project_epics")
        .select(
          "id, epic_id, title, description, deadline, created_at, created_by, assignee"
        )
        .eq("project_id", projectId)
        .eq("id", epicId);

      if (error) return { data: null, error };

      return {
        data: (data?.[0] as ProjectEpic | undefined) ?? null,
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  },
  update: async (epicId: string, data: UpdateEpicInput) => {
    return supabase.from("epics").update(data).eq("id", epicId);
  },
  delete: async (token: string, epicId: string) => {
    return fetch(`${SUPABASE_URL}/rest/v1/epics?id=eq.${epicId}`, {
      method: "DELETE",
      headers: getHeaders(token),
    });
  },
};
