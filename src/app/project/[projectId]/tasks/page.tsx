"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Plus, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectsService } from "@/services/api/projects.service";
import {
  TasksService,
  BoardTask,
  TaskStatus,
} from "@/services/api/tasks.service";
import { TaskColumn } from "@/components/tasks/TaskColumn";
import { TaskCard } from "@/components/tasks/TaskCard";

const BOARD_COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "TO_DO", label: "TO DO" },
  { status: "IN_PROGRESS", label: "IN PROGRESS" },
  { status: "BLOCKED", label: "BLOCKED" },
  { status: "IN_REVIEW", label: "IN REVIEW" },
  { status: "READY_FOR_QA", label: "READY FOR QA" },
  { status: "REOPENED", label: "REOPENED" },
  { status: "READY_FOR_PRODUCTION", label: "READY FOR PRODUCTION" },
  { status: "DONE", label: "DONE" },
];

export default function ProjectTasksPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params?.projectId as string;
  const viewParam = searchParams.get("view") || "board";

  const [projectName, setProjectName] = useState("Project");
  const [tasksByStatus, setTasksByStatus] = useState<
    Record<TaskStatus, BoardTask[]>
  >({
    TO_DO: [],
    IN_PROGRESS: [],
    BLOCKED: [],
    IN_REVIEW: [],
    READY_FOR_QA: [],
    REOPENED: [],
    READY_FOR_PRODUCTION: [],
    DONE: [],
  });

  const [columnLoading, setColumnLoading] = useState<
    Record<TaskStatus, boolean>
  >({
    TO_DO: true,
    IN_PROGRESS: true,
    BLOCKED: true,
    IN_REVIEW: true,
    READY_FOR_QA: true,
    REOPENED: true,
    READY_FOR_PRODUCTION: true,
    DONE: true,
  });

  const [columnError, setColumnError] = useState<Record<TaskStatus, boolean>>({
    TO_DO: false,
    IN_PROGRESS: false,
    BLOCKED: false,
    IN_REVIEW: false,
    READY_FOR_QA: false,
    REOPENED: false,
    READY_FOR_PRODUCTION: false,
    DONE: false,
  });

  const requestSeqRef = useRef<Record<TaskStatus, number>>({
    TO_DO: 0,
    IN_PROGRESS: 0,
    BLOCKED: 0,
    IN_REVIEW: 0,
    READY_FOR_QA: 0,
    REOPENED: 0,
    READY_FOR_PRODUCTION: 0,
    DONE: 0,
  });

  // Load project name for breadcrumbs
  useEffect(() => {
    let isMounted = true;
    ProjectsService.getById(projectId).then(({ data }) => {
      if (isMounted && data) {
        setProjectName(data.name);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Fetch tasks for a single column independently
  const loadColumnTasks = useCallback(
    async (status: TaskStatus) => {
      const seq = ++requestSeqRef.current[status];
      setColumnLoading((prev) => ({ ...prev, [status]: true }));
      setColumnError((prev) => ({ ...prev, [status]: false }));

      try {
        const { data, error } = await TasksService.getByProjectStatus(
          projectId,
          status
        );
        if (seq !== requestSeqRef.current[status]) return;

        if (error) {
          setColumnError((prev) => ({ ...prev, [status]: true }));
        } else {
          setTasksByStatus((prev) => ({
            ...prev,
            [status]: data ?? [],
          }));
        }
      } catch {
        if (seq !== requestSeqRef.current[status]) return;
        setColumnError((prev) => ({ ...prev, [status]: true }));
      } finally {
        if (seq === requestSeqRef.current[status]) {
          setColumnLoading((prev) => ({ ...prev, [status]: false }));
        }
      }
    },
    [projectId]
  );

  // Initial load for all 8 columns
  useEffect(() => {
    BOARD_COLUMNS.forEach((col) => {
      void loadColumnTasks(col.status);
    });
  }, [loadColumnTasks]);

  // Combined flat tasks for Mobile Vertical View
  const allMobileTasks = useMemo(() => {
    return BOARD_COLUMNS.flatMap((col) => tasksByStatus[col.status]);
  }, [tasksByStatus]);

  const isAnyColumnLoading = useMemo(() => {
    return Object.values(columnLoading).some(Boolean);
  }, [columnLoading]);

  const handleViewChange = (newView: string) => {
    if (newView === "list") {
      router.push(`/project/${projectId}/tasks?view=list`);
    } else {
      router.push(`/project/${projectId}/tasks?view=board`);
    }
  };

  return (
    <AppShell>
      <div className="flex h-full w-full flex-col pb-20 lg:pb-8">
        {/* Breadcrumb Bar (Desktop Only) */}
        <nav
          aria-label="Breadcrumb"
          className="mb-2 hidden flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.6px] text-[#737685] lg:flex"
        >
          <Link
            href="/project"
            className="transition-colors hover:text-[#0052cc] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0052cc]"
          >
            PROJECTS
          </Link>
          <span aria-hidden="true" className="text-[#a0a5b5]">
            &gt;
          </span>
          <span className="max-w-[200px] truncate text-[#737685]">
            {projectName}
          </span>
          <span aria-hidden="true" className="text-[#a0a5b5]">
            &gt;
          </span>
          <span className="text-[#0052cc]">TASKS</span>
        </nav>

        {/* Header and Controls */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#041b3c]">
              Active Workboard
            </h1>
            <p className="mt-1 text-[13px] text-[#53627b]">
              Manage and track project tasks across workflow stages.
            </p>
          </div>

          {/* Desktop Upper-Right Controls (Search + View Switcher ONLY) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Inert Search Box */}
            <div className="relative w-[260px]">
              <Search
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737685]"
              />
              <input
                type="text"
                placeholder="Search tasks..."
                aria-label="Search tasks"
                readOnly
                tabIndex={0}
                className="h-10 w-full rounded-[4px] border border-[#d9deeb] bg-[#f8f9fc] pl-9 pr-3 text-[13px] text-[#041b3c] placeholder:text-[#737685] focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]"
              />
            </div>

            {/* View Switcher Select */}
            <div className="relative">
              <select
                aria-label="View switcher"
                value={viewParam === "list" ? "list" : "board"}
                onChange={(e) => handleViewChange(e.target.value)}
                className="h-10 appearance-none rounded-[4px] border border-[#d9deeb] bg-white pl-3.5 pr-9 text-[13px] font-semibold text-[#041b3c] shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]"
              >
                <option value="board">Board View</option>
                <option value="list">List View</option>
              </select>
              <ChevronDown
                size={15}
                strokeWidth={2}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737685]"
              />
            </div>
          </div>

          {/* Mobile Header Controls (Full-width Search + Full-width + Create Task) */}
          <div className="flex flex-col gap-3 lg:hidden">
            <div className="relative w-full">
              <Search
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737685]"
              />
              <input
                type="text"
                placeholder="Search tasks..."
                aria-label="Search tasks"
                readOnly
                tabIndex={0}
                className="h-11 w-full rounded-[6px] border border-[#d9deeb] bg-[#dbe4ff]/40 pl-9 pr-3 text-[14px] text-[#041b3c] placeholder:text-[#737685] focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]"
              />
            </div>

            <Link
              href={`/project/${projectId}/tasks/new`}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[4px] bg-[#0052cc] px-4 text-[14px] font-semibold text-white shadow-[0_2px_4px_rgba(0,82,204,0.18)] transition-opacity hover:opacity-95"
            >
              + Create Task
            </Link>
          </div>
        </div>

        {/* Desktop Kanban Board View (Horizontal Scrolling across all 8 columns with 24px gap) */}
        <div className="hidden lg:block flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 items-start min-w-max">
            {BOARD_COLUMNS.map((col) => (
              <TaskColumn
                key={col.status}
                projectId={projectId}
                status={col.status}
                tasks={tasksByStatus[col.status]}
                loading={columnLoading[col.status]}
                error={columnError[col.status]}
                onRetry={() => void loadColumnTasks(col.status)}
              />
            ))}
          </div>
        </div>

        {/* Mobile Vertical Task List Layout */}
        <div className="block lg:hidden flex-1">
          {isAnyColumnLoading && allMobileTasks.length === 0 ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-28 rounded-[8px] border border-[#d9deeb] bg-[#f0f2f7]" />
              <div className="h-28 rounded-[8px] border border-[#d9deeb] bg-[#f0f2f7]" />
              <div className="h-28 rounded-[8px] border border-[#d9deeb] bg-[#f0f2f7]" />
            </div>
          ) : null}

          {!isAnyColumnLoading && allMobileTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-[#d9deeb] bg-[#f8f9ff] px-5 py-12 text-center">
              <p className="text-[16px] font-semibold text-[#041b3c]">
                No tasks found
              </p>
              <p className="mt-1 text-[13px] text-[#68758c]">
                Get started by creating your first task in this project.
              </p>
              <Link
                href={`/project/${projectId}/tasks/new`}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#0052cc] px-6 text-[14px] font-semibold text-white shadow-[0_2px_4px_rgba(0,82,204,0.18)]"
              >
                <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
                Create Task
              </Link>
            </div>
          ) : null}

          {allMobileTasks.length > 0 ? (
            <div className="space-y-3">
              {allMobileTasks.map((task) => (
                <TaskCard key={task.id} task={task} variant="mobile" />
              ))}
            </div>
          ) : null}
        </div>

        {/* Mobile Fixed Bottom Navigation Bar (lg:hidden) */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-[#e5e8f0] bg-white px-2 shadow-[0_-2px_10px_rgba(4,27,60,0.05)] lg:hidden"
        >
          <Link
            href="/project"
            className="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-semibold text-[#737685] transition-colors hover:text-[#0052cc]"
          >
            <Image
              src="/assets/svg/icons/icon-projects.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
              className="opacity-70"
            />
            <span>Projects</span>
          </Link>

          <Link
            href={`/project/${projectId}/epics`}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-semibold text-[#737685] transition-colors hover:text-[#0052cc]"
          >
            <Image
              src="/assets/svg/icons/icon-epics.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
              className="opacity-70"
            />
            <span>Epics</span>
          </Link>

          <Link
            href={`/project/${projectId}/tasks`}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-bold text-[#0052cc]"
          >
            <Image
              src="/assets/svg/icons/icon-tasks.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
            />
            <span>Tasks</span>
          </Link>

          <Link
            href={`/project/${projectId}/members`}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-semibold text-[#737685] transition-colors hover:text-[#0052cc]"
          >
            <Image
              src="/assets/svg/icons/icon-members.svg"
              alt=""
              width={22}
              height={20}
              aria-hidden="true"
              className="opacity-70"
            />
            <span>Members</span>
          </Link>

          <Link
            href={`/project/${projectId}/edit`}
            className="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-semibold text-[#737685] transition-colors hover:text-[#0052cc]"
          >
            <Image
              src="/assets/svg/icons/icon-details.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
              className="opacity-70"
            />
            <span>Details</span>
          </Link>
        </nav>
      </div>
    </AppShell>
  );
}
