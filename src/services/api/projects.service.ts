import { supabase } from "@/lib/supabase/client";
import { SUPABASE_URL } from "./config";

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

export interface ProjectMemberMetadata {
  sub: string;
  name: string;
  email: string;
  job_title: string;
  email_verified: boolean;
  phone_verified: boolean;
}

export interface ProjectMember {
  member_id: string;
  project_id: string;
  user_id: string;
  role: string;
  email: string;
  metadata: ProjectMemberMetadata;
}

export interface InviteMemberInput {
  email: string;
  projectId: string;
  appUrl: string;
}

export interface AcceptInvitationInput {
  token: string;
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
  getMembers: async (projectId: string) => {
    return supabase
      .from("get_project_members")
      .select("member_id, project_id, user_id, role, email, metadata")
      .eq("project_id", projectId);
  },
  invite: async (input: InviteMemberInput) => {
    return supabase.rpc("invite_member", {
      p_email: input.email,
      p_project_id: input.projectId,
      p_app_url: input.appUrl,
      p_base_url: SUPABASE_URL,
    });
  },
  acceptInvitation: async (input: AcceptInvitationInput) => {
    return supabase.rpc("accept_invitation", {
      p_token: input.token,
    });
  },
};
