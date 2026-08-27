import { supabase } from "@/lib/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";
import { SUPABASE_URL, getHeaders } from "./config";

export type TaskStatus =
  | "TO_DO"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "IN_REVIEW"
  | "READY_FOR_QA"
  | "REOPENED"
  | "READY_FOR_PRODUCTION"
  | "DONE";

export interface CreateTaskInput {
  title: string;
  epic_id?: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  status: TaskStatus;
}

export interface CreatedTask {
  id: string;
  project_id: string;
  epic_id: string | null;
  title: string;
  description: string | null;
  assignee_id: string | null;
  due_date: string | null;
  status: TaskStatus;
  created_at: string;
}

export interface ProjectTaskAssignee {
  id: string | null;
  name: string | null;
  email: string | null;
  department: string | null;
}

export interface ProjectTask {
  id: string;
  title: string;
  due_date: string | null;
  assignee: ProjectTaskAssignee;
}

export interface BoardTask {
  id: string;
  task_id: string;
  title: string;
  due_date: string | null;
  status: TaskStatus;
  assignee: ProjectTaskAssignee | null;
}

export interface TaskEpic {
  id: string | null;
  epic_id: string | null;
  title: string | null;
}

export interface TaskCreator {
  id: string | null;
  name: string | null;
  email: string | null;
}

export interface TaskDetails {
  id: string;
  project_id: string;
  task_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  epic_id: string | null;
  epic: TaskEpic | null;
  created_by: TaskCreator | null;
  assignee: ProjectTaskAssignee | null;
}

export const TasksService = {
  getDetails: async (
    projectId: string,
    taskId: string
  ): Promise<{
    data: TaskDetails | null;
    error: PostgrestError | null;
  }> => {
    const { data, error } = await supabase
      .from("project_tasks")
      .select(
        `
        id,
        project_id,
        task_id,
        title,
        description,
        status,
        due_date,
        created_at,
        epic_id,
        epic,
        created_by,
        assignee
      `
      )
      .eq("project_id", projectId)
      .eq("id", taskId)
      .maybeSingle();

    if (error) return { data: null, error };
    return { data: (data as TaskDetails) ?? null, error: null };
  },
  getByProject: async (
    projectId: string
  ): Promise<{
    data: BoardTask[] | null;
    error: PostgrestError | null;
  }> => {
    const { data, error } = await supabase
      .from("project_tasks")
      .select("id, task_id, title, due_date, status, assignee")
      .eq("project_id", projectId);

    if (error) return { data: null, error };
    return { data: (data as BoardTask[]) ?? [], error: null };
  },
  getByProjectStatus: async (
    projectId: string,
    status: TaskStatus
  ): Promise<{
    data: BoardTask[] | null;
    error: PostgrestError | null;
  }> => {
    const { data, error } = await supabase
      .from("project_tasks")
      .select("id, task_id, title, due_date, status, assignee")
      .eq("project_id", projectId)
      .eq("status", status);

    if (error) return { data: null, error };
    return { data: (data as BoardTask[]) ?? [], error: null };
  },
  getByEpic: async (
    epicId: string
  ): Promise<{
    data: ProjectTask[] | null;
    error: PostgrestError | null;
  }> => {
    const { data, error } = await supabase
      .from("project_tasks")
      .select("id, title, due_date, assignee")
      .eq("epic_id", epicId);

    if (error) return { data: null, error };
    return { data: (data as ProjectTask[]) ?? [], error: null };
  },
  create: async (
    projectId: string,
    input: CreateTaskInput
  ): Promise<{ data: CreatedTask | null; error: PostgrestError | null }> => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId,
        ...input,
      })
      .select(
        "id, project_id, epic_id, title, description, assignee_id, due_date, status, created_at"
      )
      .single();

    if (error) return { data: null, error };
    return { data: data as CreatedTask, error: null };
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
