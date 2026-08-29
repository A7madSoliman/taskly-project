import { supabase } from "@/lib/supabase/client";
import type { PostgrestError } from "@supabase/supabase-js";
import type { TaskStatus } from "@/services/api/tasks.service";

export type TaskStatusTotals = Partial<Record<TaskStatus, number>>;

export interface DailyTaskStats {
  day: string;
  statuses: TaskStatusTotals;
}

export interface CalendarStats {
  daily: DailyTaskStats[];
  totals: TaskStatusTotals;
  total_tasks: number;
  done_tasks: number;
  overdue_tasks: number;
}

export interface ProjectTaskCount {
  project_id: string;
  project_name: string;
  tasks_count: number;
}

export const StatisticsService = {
  getCalendarStats: async (
    startDate: string,
    endDate: string,
    projectId: string | null = null,
    status: TaskStatus | null = null
  ): Promise<{ data: CalendarStats | null; error: PostgrestError | null }> => {
    const { data, error } = await supabase.rpc("get_tasks_calendar_stats", {
      p_start_date: startDate,
      p_end_date: endDate,
      p_project_id: projectId,
      p_status: status,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data as CalendarStats, error: null };
  },

  getTasksCountPerProject: async (
    startDate: string,
    endDate: string
  ): Promise<{
    data: ProjectTaskCount[] | null;
    error: PostgrestError | null;
  }> => {
    const { data, error } = await supabase.rpc("get_tasks_count_per_project", {
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: (data as ProjectTaskCount[]) ?? [], error: null };
  },
};
