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
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCw,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectsService } from "@/services/api/projects.service";
import {
  TasksService,
  BoardTask,
  TaskStatus,
} from "@/services/api/tasks.service";
import { TaskColumn } from "@/components/tasks/TaskColumn";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskRow } from "@/components/tasks/TaskRow";

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
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  // Board View State
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

  // List View State
  const [listTasks, setListTasks] = useState<BoardTask[]>([]);
  const [listLoading, setListLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<boolean>(false);

  // Request sequence guards
  const boardRequestSeqRef = useRef<Record<TaskStatus, number>>({
    TO_DO: 0,
    IN_PROGRESS: 0,
    BLOCKED: 0,
    IN_REVIEW: 0,
    READY_FOR_QA: 0,
    REOPENED: 0,
    READY_FOR_PRODUCTION: 0,
    DONE: 0,
  });
  const listRequestSeqRef = useRef<number>(0);

  // Evaluate media query
  useEffect(() => {
    let isMounted = true;
    const update = () => {
      if (isMounted) {
        setIsDesktop(window.matchMedia("(min-width: 1024px)").matches);
      }
    };

    const media = window.matchMedia("(min-width: 1024px)");
    void Promise.resolve().then(update);

    media.addEventListener("change", update);
    return () => {
      isMounted = false;
      media.removeEventListener("change", update);
    };
  }, []);

  // Derived mode:
  // Desktop + board -> "board"
  // Desktop + list -> "list"
  // Mobile + any -> "board"
  const mode: "board" | "list" | null = useMemo(() => {
    if (isDesktop === null) return null;
    if (!isDesktop) return "board";
    return viewParam === "list" ? "list" : "board";
  }, [isDesktop, viewParam]);

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

  // Fetch tasks for a single column independently (Board mode)
  const loadColumnTasks = useCallback(
    async (status: TaskStatus) => {
      const seq = ++boardRequestSeqRef.current[status];
      await Promise.resolve();
      setColumnLoading((prev) => ({ ...prev, [status]: true }));
      setColumnError((prev) => ({ ...prev, [status]: false }));

      try {
        const { data, error } = await TasksService.getByProjectStatus(
          projectId,
          status
        );
        if (seq !== boardRequestSeqRef.current[status]) return;

        if (error) {
          setColumnError((prev) => ({ ...prev, [status]: true }));
        } else {
          setTasksByStatus((prev) => ({
            ...prev,
            [status]: data ?? [],
          }));
        }
      } catch {
        if (seq !== boardRequestSeqRef.current[status]) return;
        setColumnError((prev) => ({ ...prev, [status]: true }));
      } finally {
        if (seq === boardRequestSeqRef.current[status]) {
          setColumnLoading((prev) => ({ ...prev, [status]: false }));
        }
      }
    },
    [projectId]
  );

  // Fetch project-wide tasks (List mode)
  const loadListTasks = useCallback(async () => {
    const seq = ++listRequestSeqRef.current;
    await Promise.resolve();
    setListLoading(true);
    setListError(false);

    try {
      const { data, error } = await TasksService.getByProject(projectId);
      if (seq !== listRequestSeqRef.current) return;

      if (error) {
        setListError(true);
      } else {
        setListTasks(data ?? []);
      }
    } catch {
      if (seq !== listRequestSeqRef.current) return;
      setListError(true);
    } finally {
      if (seq === listRequestSeqRef.current) {
        setListLoading(false);
      }
    }
  }, [projectId]);

  // Lifecycle triggered only after responsive mode resolves
  useEffect(() => {
    if (mode === null) return;

    let isMounted = true;
    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;

      if (mode === "board") {
        listRequestSeqRef.current++;
        BOARD_COLUMNS.forEach((col) => {
          void loadColumnTasks(col.status);
        });
      } else if (mode === "list") {
        Object.keys(boardRequestSeqRef.current).forEach((k) => {
          boardRequestSeqRef.current[k as TaskStatus]++;
        });
        void loadListTasks();
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [mode, loadColumnTasks, loadListTasks]);

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
        {isDesktop && mode === "board" ? (
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
        ) : null}

        {/* Desktop List View (when isDesktop && mode === "list") */}
        {isDesktop && mode === "list" ? (
          <div className="hidden lg:flex flex-1 flex-col pb-4">
            <div className="rounded-[8px] border border-[#e2e6f0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#eef2f6] bg-[#f8f9fc] text-[11px] font-bold uppercase tracking-[0.6px] text-[#737685]">
                      <th scope="col" className="px-6 py-3.5">
                        TASK ID
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        TITLE
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        STATUS
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        DUE DATE
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        ASSIGNEE
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-right">
                        SETTINGS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listLoading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-[#f0f2f7] animate-pulse"
                        >
                          <td className="px-6 py-4">
                            <div className="h-4 w-16 rounded bg-[#edf0f7]" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-48 rounded bg-[#edf0f7]" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 w-24 rounded bg-[#edf0f7]" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-20 rounded bg-[#edf0f7]" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-[#edf0f7]" />
                              <div className="h-4 w-24 rounded bg-[#edf0f7]" />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-block h-6 w-6 rounded bg-[#edf0f7]" />
                          </td>
                        </tr>
                      ))
                    ) : listError ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <p className="text-[14px] font-medium text-[#b42318]">
                              Failed to load tasks
                            </p>
                            <button
                              type="button"
                              onClick={() => void loadListTasks()}
                              className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#0052cc] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                            >
                              <RotateCw size={14} aria-hidden="true" />
                              <span>Retry</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : listTasks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <p className="text-[15px] font-semibold text-[#041b3c]">
                              No tasks found
                            </p>
                            <p className="text-[13px] text-[#737685]">
                              There are no tasks in this project yet.
                            </p>
                            <Link
                              href={`/project/${projectId}/tasks/new`}
                              className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#0052cc] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(0,82,204,0.2)] transition-opacity hover:opacity-90"
                            >
                              <Plus
                                size={15}
                                strokeWidth={2.2}
                                aria-hidden="true"
                              />
                              <span>Add Task</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      listTasks.map((task) => (
                        <TaskRow key={task.id} task={task} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Display-only Pagination Footer */}
              <div className="flex items-center justify-end gap-1.5 border-t border-[#f0f2f7] px-6 py-3">
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label="Previous page"
                  className="flex h-8 w-8 items-center justify-center rounded-[4px] text-[#98a2b3] cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label="Next page"
                  className="flex h-8 w-8 items-center justify-center rounded-[4px] text-[#98a2b3] cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Desktop List View Floating Add Button */}
            <Link
              href={`/project/${projectId}/tasks/new`}
              aria-label="Add Task"
              className="fixed bottom-8 right-8 z-20 flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#0052cc] text-white shadow-[0_4px_12px_rgba(0,82,204,0.3)] transition-transform hover:scale-105"
            >
              <Plus size={22} strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </div>
        ) : null}

        {/* Mobile Vertical Task List Layout (rendered when !isDesktop) */}
        {!isDesktop && isDesktop !== null ? (
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
        ) : null}

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
