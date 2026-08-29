import { test as base, expect } from "@playwright/test";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Safety contracts and types for disposable test fixtures.
 *
 * PHASE B CONTRACT:
 * - Dedicated Node-scoped Supabase client (persistSession: false, no browser storage).
 * - Authenticated strictly via normal QA user credentials (signInWithPassword).
 * - Exact-ID registration immediately upon successful row creation.
 * - Ownership checks: createEpic/createTask require exact currently owned parent IDs.
 * - Cleanup targets ONLY exact owned UUIDs (.eq("id", exactUuid)).
 * - Order: Task -> Epic -> Project with exact-ID read-back absence verification.
 * - Cleanup failures are aggregated so teardown always attempts every registered entity.
 * - Zero .like(), .ilike(), prefix, title, or wildcard deletions.
 */

export interface DisposableProject {
  id: string;
  name: string;
}

export interface DisposableEpic {
  id: string;
  projectId: string;
  title: string;
}

export interface DisposableTask {
  id: string;
  projectId: string;
  epicId: string;
  title: string;
}

export interface DisposableDataFixture {
  createProject(namePrefix?: string): Promise<DisposableProject>;
  createEpic(projectId: string, titlePrefix?: string): Promise<DisposableEpic>;
  createTask(
    projectId: string,
    epicId: string,
    titlePrefix?: string
  ): Promise<DisposableTask>;
  verifyProject(id: string): Promise<boolean>;
  verifyEpic(id: string): Promise<boolean>;
  verifyTask(id: string): Promise<boolean>;
  cleanup(): Promise<void>;
}

// Module-internal ownership registry (not exported or externally mutating)
class DisposableDataRegistry {
  private projectId: string | null = null;
  private epicId: string | null = null;
  private taskId: string | null = null;

  registerProject(id: string) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid project ID registration");
    }
    this.projectId = id;
  }

  registerEpic(id: string) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid epic ID registration");
    }
    this.epicId = id;
  }

  registerTask(id: string) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid task ID registration");
    }
    this.taskId = id;
  }

  getRegisteredIds() {
    return {
      projectId: this.projectId,
      epicId: this.epicId,
      taskId: this.taskId,
    };
  }

  clearTask() {
    this.taskId = null;
  }

  clearEpic() {
    this.epicId = null;
  }

  clearProject() {
    this.projectId = null;
  }
}

export function createNodeSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/ANON_KEY are required for Node QA client."
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function authenticateNodeClient(
  client: SupabaseClient
): Promise<void> {
  const email = process.env.TASKLY_QA_EMAIL;
  const password = process.env.TASKLY_QA_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "TASKLY_QA_EMAIL and TASKLY_QA_PASSWORD are required for Node QA client authentication."
    );
  }

  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Node QA client authentication failed.");
  }
}

export function createDisposableDataFixture(
  client: SupabaseClient
): DisposableDataFixture {
  const registry = new DisposableDataRegistry();

  const cleanup = async (): Promise<void> => {
    const { taskId, epicId, projectId } = registry.getRegisteredIds();
    const cleanupErrors: string[] = [];

    // 1. Exact Task cleanup
    if (taskId) {
      try {
        const { error: delError } = await client
          .from("tasks")
          .delete()
          .eq("id", taskId);

        if (delError) {
          cleanupErrors.push("Failed to delete exact task record.");
        } else {
          // Verify exact absence
          const { data: readBack, error: readBackError } = await client
            .from("tasks")
            .select("id")
            .eq("id", taskId)
            .maybeSingle();

          if (readBackError) {
            cleanupErrors.push("Read-back error verifying task absence.");
          } else if (readBack) {
            cleanupErrors.push("Exact task record still present after delete.");
          } else {
            registry.clearTask();
          }
        }
      } catch {
        cleanupErrors.push("Unexpected exception during task cleanup.");
      }
    }

    // 2. Exact Epic cleanup
    if (epicId) {
      try {
        const { error: delError } = await client
          .from("epics")
          .delete()
          .eq("id", epicId);

        if (delError) {
          cleanupErrors.push("Failed to delete exact epic record.");
        } else {
          // Verify exact absence
          const { data: readBack, error: readBackError } = await client
            .from("epics")
            .select("id")
            .eq("id", epicId)
            .maybeSingle();

          if (readBackError) {
            cleanupErrors.push("Read-back error verifying epic absence.");
          } else if (readBack) {
            cleanupErrors.push("Exact epic record still present after delete.");
          } else {
            registry.clearEpic();
          }
        }
      } catch {
        cleanupErrors.push("Unexpected exception during epic cleanup.");
      }
    }

    // 3. Exact Project cleanup
    if (projectId) {
      try {
        const { error: delError } = await client
          .from("projects")
          .delete()
          .eq("id", projectId);

        if (delError) {
          cleanupErrors.push("Failed to delete exact project record.");
        } else {
          // Verify exact absence
          const { data: readBack, error: readBackError } = await client
            .from("projects")
            .select("id")
            .eq("id", projectId)
            .maybeSingle();

          if (readBackError) {
            cleanupErrors.push("Read-back error verifying project absence.");
          } else if (readBack) {
            cleanupErrors.push(
              "Exact project record still present after delete."
            );
          } else {
            registry.clearProject();
          }
        }
      } catch {
        cleanupErrors.push("Unexpected exception during project cleanup.");
      }
    }

    if (cleanupErrors.length > 0) {
      throw new Error(
        `Fixture cleanup encountered failures: ${cleanupErrors.join("; ")}`
      );
    }
  };

  return {
    createProject: async (namePrefix = "QA Disposable Project") => {
      const uniqueName = `${namePrefix} [${Date.now()}]`;
      const { data, error } = await client
        .from("projects")
        .insert({
          name: uniqueName,
          description: "Disposable project created for automated QA validation",
        })
        .select("id, name")
        .single();

      if (error || !data || !data.id) {
        throw new Error("Failed to create exact disposable project.");
      }

      registry.registerProject(data.id);
      return {
        id: data.id,
        name: data.name,
      };
    },

    createEpic: async (
      projectId: string,
      titlePrefix = "QA Disposable Epic"
    ) => {
      const { projectId: ownedProjectId } = registry.getRegisteredIds();

      // Enforce parent ownership before any backend mutation
      if (!ownedProjectId || projectId !== ownedProjectId) {
        throw new Error("Disposable epic parent is not owned by this fixture.");
      }

      const uniqueTitle = `${titlePrefix} [${Date.now()}]`;
      const { data, error } = await client
        .from("epics")
        .insert({
          project_id: projectId,
          title: uniqueTitle,
          description: "Disposable epic created for automated QA validation",
          assignee_id: null,
          deadline: null,
        })
        .select("id, title, project_id")
        .single();

      if (error || !data || !data.id) {
        throw new Error("Failed to create exact disposable epic.");
      }

      registry.registerEpic(data.id);
      return {
        id: data.id,
        projectId: data.project_id,
        title: data.title,
      };
    },

    createTask: async (
      projectId: string,
      epicId: string,
      titlePrefix = "QA Disposable Task"
    ) => {
      const { projectId: ownedProjectId, epicId: ownedEpicId } =
        registry.getRegisteredIds();

      // Enforce parent ownership before any backend mutation
      if (
        !ownedProjectId ||
        !ownedEpicId ||
        projectId !== ownedProjectId ||
        epicId !== ownedEpicId
      ) {
        throw new Error(
          "Disposable task parents are not owned by this fixture."
        );
      }

      const uniqueTitle = `${titlePrefix} [${Date.now()}]`;
      const { data, error } = await client
        .from("tasks")
        .insert({
          project_id: projectId,
          epic_id: epicId,
          title: uniqueTitle,
          description: "Disposable task created for automated QA validation",
          status: "TO_DO",
          assignee_id: null,
          due_date: null,
        })
        .select("id, title, project_id, epic_id")
        .single();

      if (error || !data || !data.id) {
        throw new Error("Failed to create exact disposable task.");
      }

      registry.registerTask(data.id);
      return {
        id: data.id,
        projectId: data.project_id,
        epicId: data.epic_id || epicId,
        title: data.title,
      };
    },

    verifyProject: async (id: string) => {
      const { data, error } = await client
        .from("projects")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw new Error("Query error verifying project existence.");
      }

      return !!data && data.id === id;
    },

    verifyEpic: async (id: string) => {
      const { data, error } = await client
        .from("epics")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw new Error("Query error verifying epic existence.");
      }

      return !!data && data.id === id;
    },

    verifyTask: async (id: string) => {
      const { data, error } = await client
        .from("tasks")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw new Error("Query error verifying task existence.");
      }

      return !!data && data.id === id;
    },

    cleanup,
  };
}

export const test = base.extend<{
  disposableData: DisposableDataFixture;
}>({
  disposableData: async ({}, runFixture) => {
    const client = createNodeSupabaseClient();
    await authenticateNodeClient(client);
    const fixture = createDisposableDataFixture(client);

    try {
      await runFixture(fixture);
    } finally {
      await fixture.cleanup();
    }
  },
});

export { expect };
