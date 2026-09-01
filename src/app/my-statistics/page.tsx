"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectMobileBottomNav } from "@/components/layout/ProjectMobileBottomNav";
import { ProjectsService, Project } from "@/services/api/projects.service";
import {
  StatisticsService,
  CalendarStats,
  ProjectTaskCount,
} from "@/services/api/statistics.service";
import { AuthService } from "@/services/api/auth.service";
import type { TaskStatus } from "@/services/api/tasks.service";
import { TASK_STATUS_OPTIONS } from "@/lib/constants/task-status";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  ChevronDown,
  Layers3,
  RotateCcw,
} from "lucide-react";

const STATS_COLOR_MAP: Record<
  TaskStatus,
  { dotColor: string; textColor: string; badgeBg: string; chartColor: string }
> = {
  TO_DO: {
    dotColor: "bg-[#737685]",
    textColor: "text-[#4f5f7b]",
    badgeBg: "bg-[#f1f3f9]",
    chartColor: "#737685",
  },
  IN_PROGRESS: {
    dotColor: "bg-[#0052cc]",
    textColor: "text-[#0052cc]",
    badgeBg: "bg-[#eef4ff]",
    chartColor: "#0052cc",
  },
  BLOCKED: {
    dotColor: "bg-[#d92d20]",
    textColor: "text-[#d92d20]",
    badgeBg: "bg-[#fef3f2]",
    chartColor: "#d92d20",
  },
  IN_REVIEW: {
    dotColor: "bg-[#f79009]",
    textColor: "text-[#b54708]",
    badgeBg: "bg-[#fffaeb]",
    chartColor: "#f79009",
  },
  READY_FOR_QA: {
    dotColor: "bg-[#7a5af8]",
    textColor: "text-[#6938ef]",
    badgeBg: "bg-[#f4f3ff]",
    chartColor: "#7a5af8",
  },
  REOPENED: {
    dotColor: "bg-[#ee46bc]",
    textColor: "text-[#c11574]",
    badgeBg: "bg-[#fdf2fa]",
    chartColor: "#ee46bc",
  },
  READY_FOR_PRODUCTION: {
    dotColor: "bg-[#0ba5ec]",
    textColor: "text-[#026aa2]",
    badgeBg: "bg-[#f0f9ff]",
    chartColor: "#0ba5ec",
  },
  DONE: {
    dotColor: "bg-[#12b76a]",
    textColor: "text-[#027a48]",
    badgeBg: "bg-[#ecfdf3]",
    chartColor: "#12b76a",
  },
};

// Canonical ordered statuses for normalization & rendering
const CANONICAL_STATUSES: {
  status: TaskStatus;
  label: string;
  dotColor: string;
  textColor: string;
  badgeBg: string;
  chartColor: string;
}[] = TASK_STATUS_OPTIONS.map((opt) => ({
  status: opt.value,
  label: opt.label,
  ...STATS_COLOR_MAP[opt.value],
}));

// Helper: Format local date as YYYY-MM-DD
function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper: Parse YYYY-MM-DD to local Date object
function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Helper: Calculate default current local week (Sunday to Saturday)
function getCurrentLocalWeek(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const sunday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - dayOfWeek
  );
  const saturday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - dayOfWeek + 6
  );
  return {
    start: formatLocalDate(sunday),
    end: formatLocalDate(saturday),
  };
}

// Helper: Get list of calendar dates between start and end (inclusive)
function getDatesInRange(startStr: string, endStr: string): string[] {
  const start = parseLocalDate(startStr);
  const end = parseLocalDate(endStr);
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end && dates.length < 10) {
    dates.push(formatLocalDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// Helper: Safe count normalizer (converts non-finite/negative/malformed to 0)
function toSafeCount(val: unknown): number {
  if (typeof val !== "number" || !Number.isFinite(val) || val < 0) {
    return 0;
  }
  return val;
}

// Helper: Format date for display in calendar header (e.g. "Mon, 12 May")
function formatDisplayDate(dateStr: string): {
  dayName: string;
  dayNumMonth: string;
} {
  const d = parseLocalDate(dateStr);
  const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = d.getDate();
  const monthName = d.toLocaleDateString("en-US", { month: "short" });
  return {
    dayName,
    dayNumMonth: `${dayNum} ${monthName}`,
  };
}

export default function MyStatisticsPage() {
  const router = useRouter();

  // Initial local week
  const initialWeek = useMemo(() => getCurrentLocalWeek(), []);

  // Filter States
  const [startDate, setStartDate] = useState<string>(initialWeek.start);
  const [endDate, setEndDate] = useState<string>(initialWeek.end);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Date validation error state
  const [dateError, setDateError] = useState<string | null>(null);

  // Available Projects list
  const [projects, setProjects] = useState<Project[]>([]);

  // Statistics Data State
  const [calendarStats, setCalendarStats] = useState<CalendarStats | null>(
    null
  );
  const [projectCounts, setProjectCounts] = useState<ProjectTaskCount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Request generation ref to guard against out-of-order responses
  const requestSeqRef = useRef<number>(0);

  // Load Projects on initial mount
  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const { data, error } = await ProjectsService.getAll();
        if (!isMounted) return;
        if (!error && data) {
          setProjects(data as Project[]);
        }
      } catch {
        // Handled silently for project dropdown
      }
    };
    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  // Dashboard Fetching Coordinator
  const fetchDashboard = useCallback(
    async (start: string, end: string, projId: string, st: string) => {
      // 1. FIRST: Advance request generation to immediately stale any prior in-flight request
      const currentSeq = ++requestSeqRef.current;

      // 2. THEN: Validate date range before issuing RPCs
      const startDateObj = parseLocalDate(start);
      const endDateObj = parseLocalDate(end);

      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        setDateError("Please enter valid dates.");
        setIsLoading(false);
        return;
      }

      if (endDateObj < startDateObj) {
        setDateError("End date must be on or after start date.");
        setIsLoading(false);
        return;
      }

      const diffTime = endDateObj.getTime() - startDateObj.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 7) {
        setDateError("Date range cannot exceed 7 days.");
        setIsLoading(false);
        return;
      }

      // Valid range: Clear error and set loading for this generation
      setDateError(null);
      setIsLoading(true);
      setHasError(false);

      const apiProjectId = projId === "ALL" ? null : projId;
      const apiStatus = st === "ALL" ? null : (st as TaskStatus);

      try {
        const [calRes, projRes] = await Promise.all([
          StatisticsService.getCalendarStats(
            start,
            end,
            apiProjectId,
            apiStatus
          ),
          StatisticsService.getTasksCountPerProject(start, end),
        ]);

        if (currentSeq !== requestSeqRef.current) {
          return; // Discard stale request generation
        }

        if (calRes.error || projRes.error) {
          // Check auth session
          const { data: userData, error: userError } =
            await AuthService.getUser();
          if (currentSeq !== requestSeqRef.current) return;
          if (userError || !userData?.user) {
            router.replace("/login");
            return;
          }
          setHasError(true);
          return;
        }

        setCalendarStats(calRes.data);
        setProjectCounts(projRes.data || []);
        setHasError(false);
      } catch {
        if (currentSeq !== requestSeqRef.current) return;
        const { data: userData, error: userError } =
          await AuthService.getUser();
        if (currentSeq !== requestSeqRef.current) return;
        if (userError || !userData?.user) {
          router.replace("/login");
          return;
        }
        setHasError(true);
      } finally {
        if (currentSeq === requestSeqRef.current) {
          setIsLoading(false);
        }
      }
    },
    [router]
  );

  // Trigger dashboard fetch when filters change
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;
      void fetchDashboard(
        startDate,
        endDate,
        selectedProjectId,
        selectedStatus
      );
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [startDate, endDate, selectedProjectId, selectedStatus, fetchDashboard]);

  // Derived selected dates in range (max 7)
  const selectedDates = useMemo(() => {
    if (dateError) return [];
    try {
      return getDatesInRange(startDate, endDate);
    } catch {
      return [];
    }
  }, [startDate, endDate, dateError]);

  const todayStr = useMemo(() => formatLocalDate(new Date()), []);

  // Prepare safe, normalized totals for Doughnut Chart
  const normalizedTotals = useMemo(() => {
    const rawTotals = calendarStats?.totals || {};
    return CANONICAL_STATUSES.map((item) => ({
      ...item,
      count: toSafeCount(rawTotals[item.status]),
    }));
  }, [calendarStats]);

  const totalDoughnutCount = useMemo(() => {
    return toSafeCount(
      normalizedTotals.reduce((sum, item) => sum + item.count, 0)
    );
  }, [normalizedTotals]);

  // Generate safe SVG donut slices
  const doughnutSlices = useMemo(() => {
    if (totalDoughnutCount <= 0) return [];
    let accumulatedAngle = 0;
    const radius = 64;
    const circumference = 2 * Math.PI * radius;

    return normalizedTotals.map((item) => {
      const percentage =
        totalDoughnutCount > 0 ? item.count / totalDoughnutCount : 0;
      const strokeDasharray = `${percentage * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += percentage;
      return {
        ...item,
        percentage: Math.round(percentage * 100),
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [normalizedTotals, totalDoughnutCount]);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1360px] pb-16 lg:pb-8">
        {/* Page Header */}
        <div className="flex flex-col gap-1 pb-6">
          <h1 className="text-[26px] lg:text-[30px] font-bold text-[#041b3c] tracking-[-0.5px]">
            Weekly Planner
          </h1>
          <p className="text-[14px] font-normal text-[#4f5f7b]">
            Manage your deadlines and track team velocity.
          </p>
        </div>

        {/* Filter Controls Card */}
        <div className="mb-6 rounded-[8px] border border-[#e5e8f0] bg-white p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Date Range Inputs */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                DATE RANGE (MAX 7 DAYS)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label="Start date"
                    className="h-10 rounded-[6px] border border-[#d9deeb] bg-[#f8f9fc] px-3 py-2 text-[13px] font-medium text-[#041b3c] focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]"
                  />
                </div>
                <span className="text-[13px] font-medium text-[#737685]">
                  to
                </span>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    aria-label="End date"
                    className="h-10 rounded-[6px] border border-[#d9deeb] bg-[#f8f9fc] px-3 py-2 text-[13px] font-medium text-[#041b3c] focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]"
                  />
                </div>
              </div>
            </div>

            {/* Project & Status Dropdowns */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {/* Project Filter */}
              <div className="flex flex-col gap-1.5 flex-1 sm:w-56">
                <label
                  htmlFor="stats-project-filter"
                  className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]"
                >
                  PROJECT
                </label>
                <div className="relative">
                  <select
                    id="stats-project-filter"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    aria-label="Filter by project"
                    className="h-10 w-full appearance-none rounded-[6px] border border-[#d9deeb] bg-[#f8f9fc] px-3 py-2 pr-8 text-[13px] font-semibold text-[#041b3c] focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc] truncate"
                  >
                    <option value="ALL">All Projects</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col gap-1.5 flex-1 sm:w-56">
                <label
                  htmlFor="stats-status-filter"
                  className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]"
                >
                  STATUS
                </label>
                <div className="relative">
                  <select
                    id="stats-status-filter"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    aria-label="Filter by status"
                    className="h-10 w-full appearance-none rounded-[6px] border border-[#d9deeb] bg-[#f8f9fc] px-3 py-2 pr-8 text-[13px] font-semibold text-[#041b3c] focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]"
                  >
                    <option value="ALL">All Statuses</option>
                    {CANONICAL_STATUSES.map((st) => (
                      <option key={st.status} value={st.status}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Validation Error Banner */}
          {dateError && (
            <div
              role="alert"
              className="mt-4 flex items-center gap-2 rounded-[6px] border border-[#fda29b] bg-[#fff4f2] px-3 py-2 text-[13px] font-medium text-[#b42318]"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{dateError}</span>
            </div>
          )}
        </div>

        {/* Global Error & Retry View */}
        {hasError ? (
          <div className="mb-6 flex flex-col items-center justify-center rounded-[8px] border border-[#fda29b] bg-[#fff4f2] p-8 text-center">
            <AlertCircle size={36} className="mb-3 text-[#d92d20]" />
            <h2 className="text-[16px] font-bold text-[#b42318]">
              Failed to load statistics
            </h2>
            <p className="mt-1 text-[13px] text-[#7a271a] max-w-md">
              There was a problem retrieving your task statistics. Please try
              again.
            </p>
            <button
              type="button"
              onClick={() =>
                void fetchDashboard(
                  startDate,
                  endDate,
                  selectedProjectId,
                  selectedStatus
                )
              }
              className="mt-4 inline-flex items-center gap-2 rounded-[6px] bg-[#d92d20] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#b42318] cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>Retry</span>
            </button>
          </div>
        ) : null}

        {/* Loading Spinner Indicator */}
        {isLoading && !hasError && (
          <div className="mb-6 flex items-center justify-center py-6">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-[#0052cc] border-t-transparent" />
            <span className="ml-3 text-[13px] font-medium text-[#4f5f7b]">
              Updating statistics...
            </span>
          </div>
        )}

        {/* 1. KPI Cards Grid */}
        <div className="mb-6 flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible">
          {/* Total Tasks */}
          <div className="min-w-[240px] flex-1 rounded-[8px] border border-[#e5e8f0] bg-white p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                TOTAL TASKS
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f3ff] text-[#0052cc]">
                <Layers3 size={18} />
              </div>
            </div>
            <div className="mt-3 text-[32px] font-bold leading-tight text-[#041b3c]">
              {calendarStats ? calendarStats.total_tasks : 0}
            </div>
          </div>

          {/* Completed Tasks */}
          <div className="min-w-[240px] flex-1 rounded-[8px] border border-[#e5e8f0] bg-white p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                COMPLETED TASKS
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ecfdf3] text-[#027a48]">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-3 text-[32px] font-bold leading-tight text-[#041b3c]">
              {calendarStats ? calendarStats.done_tasks : 0}
            </div>
          </div>

          {/* Overdue Tasks */}
          <div className="min-w-[240px] flex-1 rounded-[8px] border border-[#e5e8f0] bg-white p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                OVERDUE TASKS
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fef3f2] text-[#d92d20]">
                <AlertCircle size={18} />
              </div>
            </div>
            <div className="mt-3 text-[32px] font-bold leading-tight text-[#041b3c]">
              {calendarStats ? calendarStats.overdue_tasks : 0}
            </div>
          </div>
        </div>

        {/* 2. Weekly Calendar View */}
        <div className="mb-6 rounded-[8px] border border-[#e5e8f0] bg-white p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#041b3c]">
              Weekly Schedule
            </h2>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#737685]">
              <CalendarIcon size={14} />
              <span>
                {selectedDates.length > 0
                  ? `${selectedDates[0]} to ${selectedDates[selectedDates.length - 1]}`
                  : "No date range"}
              </span>
            </div>
          </div>

          {/* Desktop 7-Column Grid */}
          <div className="hidden lg:grid grid-cols-7 gap-3">
            {selectedDates.map((dateStr) => {
              const { dayName, dayNumMonth } = formatDisplayDate(dateStr);
              const isToday = dateStr === todayStr;
              const dayEntry = calendarStats?.daily.find(
                (d) => d.day === dateStr
              );
              const statuses = dayEntry?.statuses || {};

              // Check if day has any tasks
              const activeStatuses = CANONICAL_STATUSES.filter(
                (st) => (statuses[st.status] || 0) > 0
              );
              const hasTasks = activeStatuses.length > 0;

              return (
                <div
                  key={dateStr}
                  className={`flex flex-col rounded-[8px] border p-3 transition-all min-h-[190px] ${
                    isToday
                      ? "border-[#0052cc] bg-[#f8faff] shadow-[0px_0px_0px_1px_#0052cc]"
                      : "border-[#e5e8f0] bg-[#f8f9fc]"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#eef2f6] pb-2">
                    <span className="text-[12px] font-bold uppercase text-[#737685]">
                      {dayName}
                    </span>
                    <span
                      className={`text-[12px] font-bold ${
                        isToday ? "text-[#0052cc]" : "text-[#041b3c]"
                      }`}
                    >
                      {dayNumMonth}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-1 flex-col gap-1.5">
                    {hasTasks ? (
                      activeStatuses.map((st) => (
                        <div
                          key={st.status}
                          className={`flex items-center justify-between rounded-[4px] px-2 py-1 text-[11px] font-semibold ${st.badgeBg} ${st.textColor}`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${st.dotColor}`}
                            />
                            <span className="truncate">{st.label}</span>
                          </div>
                          <span className="ml-1 font-bold">
                            {statuses[st.status]}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-1 items-center justify-center text-[12px] font-medium text-[#929bad]">
                        No Tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Vertical Day-Row Layout */}
          <div className="flex flex-col gap-3 lg:hidden">
            {selectedDates.map((dateStr) => {
              const { dayName, dayNumMonth } = formatDisplayDate(dateStr);
              const isToday = dateStr === todayStr;
              const dayEntry = calendarStats?.daily.find(
                (d) => d.day === dateStr
              );
              const statuses = dayEntry?.statuses || {};

              const activeStatuses = CANONICAL_STATUSES.filter(
                (st) => (statuses[st.status] || 0) > 0
              );
              const hasTasks = activeStatuses.length > 0;

              return (
                <div
                  key={dateStr}
                  className={`rounded-[8px] border p-3 ${
                    isToday
                      ? "border-[#0052cc] bg-[#f8faff] shadow-[0px_0px_0px_1px_#0052cc]"
                      : "border-[#e5e8f0] bg-[#f8f9fc]"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#eef2f6]">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold uppercase text-[#737685]">
                        {dayName}
                      </span>
                      <span
                        className={`text-[13px] font-bold ${
                          isToday ? "text-[#0052cc]" : "text-[#041b3c]"
                        }`}
                      >
                        {dayNumMonth}
                      </span>
                    </div>
                    {isToday && (
                      <span className="rounded-full bg-[#0052cc] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-[0.4px]">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {hasTasks ? (
                      activeStatuses.map((st) => (
                        <div
                          key={st.status}
                          className={`flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-[11px] font-semibold ${st.badgeBg} ${st.textColor}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${st.dotColor}`}
                          />
                          <span>{st.label}:</span>
                          <span className="font-bold">
                            {statuses[st.status]}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-1 text-[12px] font-medium text-[#929bad]">
                        No Tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Bottom Section: Doughnut Chart & All Projects Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Doughnut Chart (Tasks by Status) */}
          <div className="rounded-[8px] border border-[#e5e8f0] bg-white p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] lg:col-span-6">
            <h2 className="text-[15px] font-bold text-[#041b3c] mb-4">
              Tasks by Status
            </h2>

            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-around">
              {/* Accessible SVG Doughnut Graphic */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg
                  width="160"
                  height="160"
                  viewBox="0 0 160 160"
                  className="-rotate-90 transform"
                  aria-hidden="true"
                >
                  {/* Background Track Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="64"
                    fill="transparent"
                    stroke="#f1f3f9"
                    strokeWidth="20"
                  />
                  {/* Slices */}
                  {doughnutSlices.map((slice) => (
                    <circle
                      key={slice.status}
                      cx="80"
                      cy="80"
                      r="64"
                      fill="transparent"
                      stroke={slice.chartColor}
                      strokeWidth="20"
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      strokeLinecap="butt"
                    />
                  ))}
                </svg>

                {/* Central Metric */}
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[24px] font-bold leading-none text-[#041b3c]">
                    {totalDoughnutCount}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                    Total
                  </span>
                </div>
              </div>

              {/* Accessible Status Breakdown Legend */}
              <div className="flex flex-col gap-1.5 flex-1 w-full max-h-56 overflow-y-auto pr-1">
                {normalizedTotals.map((st) => (
                  <div
                    key={st.status}
                    className="flex items-center justify-between text-[12px] py-0.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${st.dotColor}`}
                      />
                      <span className="font-semibold text-[#4f5f7b] truncate">
                        {st.label}
                      </span>
                    </div>
                    <span className="font-bold text-[#041b3c] ml-2">
                      {st.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* All Projects Tasks Count */}
          <div className="rounded-[8px] border border-[#e5e8f0] bg-white p-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] lg:col-span-6">
            <h2 className="text-[15px] font-bold text-[#041b3c] mb-4">
              All Projects
            </h2>

            {projectCounts.length > 0 ? (
              <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
                {projectCounts.map((proj) => (
                  <div
                    key={proj.project_id}
                    className="flex items-center justify-between rounded-[6px] border border-[#e5e8f0] bg-[#f8f9fc] px-3.5 py-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#eef4ff] text-[#0052cc] shrink-0">
                        <FolderOpen size={15} />
                      </div>
                      <span className="text-[13px] font-semibold text-[#041b3c] truncate">
                        {proj.project_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className="text-[14px] font-bold text-[#041b3c]">
                        {proj.tasks_count}
                      </span>
                      <span className="text-[11px] font-medium text-[#737685]">
                        {proj.tasks_count === 1 ? "task" : "tasks"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center text-center text-[#929bad]">
                <FolderOpen size={28} className="mb-2 stroke-1" />
                <span className="text-[13px] font-medium">
                  No projects found in this date range
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Global Mobile Bottom Navigation */}
        <ProjectMobileBottomNav />
      </div>
    </AppShell>
  );
}
