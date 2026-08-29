"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  Layers,
  RotateCw,
  Search,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import {
  TasksService,
  TaskDetails,
  TaskStatus,
  TaskUpdatePatch,
} from "@/services/api/tasks.service";
import {
  ProjectsService,
  ProjectMember,
} from "@/services/api/projects.service";
import { EpicsService } from "@/services/api/epics.service";
import { STATUS_CONFIG } from "./TaskCard";
import { getInitials } from "@/lib/utils/avatar";

export type TaskUpdateField =
  "title" | "description" | "assignee_id" | "due_date" | "epic_id" | "status";

export type TaskUpdateResult =
  | { outcome: "success"; task: TaskDetails }
  | { outcome: "failure" }
  | { outcome: "stale" };

interface TaskDetailsModalProps {
  projectId: string;
  taskId: string;
  onClose: () => void;
  onDeleteRequested?: (target: {
    id: string;
    status: TaskDetails["status"];
  }) => void;
  onTaskUpdate?: (
    taskId: string,
    field: TaskUpdateField,
    patch: TaskUpdatePatch,
    previousStatus?: TaskStatus,
    targetStatus?: TaskStatus
  ) => Promise<TaskUpdateResult>;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TO_DO", label: "TO DO" },
  { value: "IN_PROGRESS", label: "IN PROGRESS" },
  { value: "BLOCKED", label: "BLOCKED" },
  { value: "IN_REVIEW", label: "IN REVIEW" },
  { value: "READY_FOR_QA", label: "READY FOR QA" },
  { value: "REOPENED", label: "REOPENED" },
  { value: "READY_FOR_PRODUCTION", label: "READY FOR PRODUCTION" },
  { value: "DONE", label: "DONE" },
];

const taskDueDateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDetailsCreatedAt(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? "—" : taskDueDateFormat.format(date);
}

function getLocalTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalDateInputValue(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatEpicDisplay(epicId: string, title: string): string {
  const full = `${epicId} ${title}`.trim();
  if (full.length <= 100) return full;
  return `${full.slice(0, 97)}...`;
}

interface ToastState {
  type: "success" | "error";
  message: string;
}

export function TaskDetailsModal({
  projectId,
  taskId,
  onClose,
  onDeleteRequested,
  onTaskUpdate,
}: TaskDetailsModalProps) {
  const [task, setTask] = useState<TaskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [titleDraft, setTitleDraft] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);

  const [descriptionDraft, setDescriptionDraft] = useState("");

  const [dueDateDraft, setDueDateDraft] = useState("");
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  const [statusOpen, setStatusOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [epicOpen, setEpicOpen] = useState(false);
  const [epicSearch, setEpicSearch] = useState("");

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(false);

  const [epics, setEpics] = useState<
    { id: string; epic_id: string; title: string }[]
  >([]);
  const [epicsLoading, setEpicsLoading] = useState(false);
  const [epicsError, setEpicsError] = useState(false);

  const [fieldPending, setFieldPending] = useState<
    Record<TaskUpdateField, boolean>
  >({
    title: false,
    description: false,
    assignee_id: false,
    due_date: false,
    epic_id: false,
    status: false,
  });

  const fieldSeqRef = useRef<Record<TaskUpdateField, number>>({
    title: 0,
    description: 0,
    assignee_id: 0,
    due_date: 0,
    epic_id: 0,
    status: 0,
  });

  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const statusSelectorRef = useRef<HTMLDivElement | null>(null);
  const assigneeSelectorRef = useRef<HTMLDivElement | null>(null);
  const epicSelectorRef = useRef<HTMLDivElement | null>(null);
  const epicSearchInputRef = useRef<HTMLInputElement | null>(null);

  const initialFetchSeqRef = useRef(0);
  const membersSeqRef = useRef(0);
  const epicsSeqRef = useRef(0);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = null;
      }
      setToast({ type, message });
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
        toastTimeoutRef.current = null;
      }, 4000);
    },
    []
  );

  const fetchDetails = useCallback(async () => {
    const seq = ++initialFetchSeqRef.current;
    await Promise.resolve();
    setLoading(true);
    setError(false);

    try {
      const { data, error: apiError } = await TasksService.getDetails(
        projectId,
        taskId
      );
      if (seq !== initialFetchSeqRef.current) return;

      if (apiError) {
        setError(true);
        setTask(null);
      } else if (!data) {
        setError(false);
        setTask(null);
      } else {
        setError(false);
        setTask(data);
        setTitleDraft(data.title);
        setDescriptionDraft(data.description ?? "");
        setDueDateDraft(toLocalDateInputValue(data.due_date));
      }
    } catch {
      if (seq !== initialFetchSeqRef.current) return;
      setError(true);
      setTask(null);
    } finally {
      if (seq === initialFetchSeqRef.current) {
        setLoading(false);
      }
    }
  }, [projectId, taskId]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;
      void fetchDetails();
    };
    void run();

    return () => {
      isMounted = false;
    };
  }, [fetchDetails]);

  const fetchMembers = useCallback(async () => {
    const seq = ++membersSeqRef.current;
    setMembersLoading(true);
    setMembersError(false);
    try {
      const { data, error } = await ProjectsService.getMembers(projectId);
      if (seq !== membersSeqRef.current) return;
      if (error) {
        setMembersError(true);
      } else {
        setMembers(data ?? []);
      }
    } catch {
      if (seq !== membersSeqRef.current) return;
      setMembersError(true);
    } finally {
      if (seq === membersSeqRef.current) {
        setMembersLoading(false);
      }
    }
  }, [projectId]);

  const fetchEpics = useCallback(async () => {
    const seq = ++epicsSeqRef.current;
    setEpicsLoading(true);
    setEpicsError(false);
    try {
      const { data, error } = await EpicsService.getAllByProject(projectId);
      if (seq !== epicsSeqRef.current) return;
      if (error) {
        setEpicsError(true);
      } else {
        const loadedEpics = data ?? [];
        setEpics(loadedEpics);

        if (task && task.epic_id) {
          const epicFound = loadedEpics.some((e) => e.id === task.epic_id);
          if (!epicFound) {
            const detailsRes = await TasksService.getDetails(projectId, taskId);
            if (seq !== epicsSeqRef.current) return;
            if (detailsRes.data) {
              if (detailsRes.data.epic_id === null) {
                setTask((prev) =>
                  prev ? { ...prev, epic_id: null, epic: null } : null
                );
              } else if (detailsRes.data.epic_id === task.epic_id) {
                if (onTaskUpdate) {
                  const result = await onTaskUpdate(taskId, "epic_id", {
                    epic_id: null,
                  });
                  if (
                    result.outcome === "success" &&
                    seq === epicsSeqRef.current
                  ) {
                    setTask((prev) =>
                      prev
                        ? {
                            ...prev,
                            epic_id: result.task.epic_id,
                            epic: result.task.epic,
                          }
                        : null
                    );
                  }
                }
              }
            }
          }
        }
      }
    } catch {
      if (seq !== epicsSeqRef.current) return;
      setEpicsError(true);
    } finally {
      if (seq === epicsSeqRef.current) {
        setEpicsLoading(false);
      }
    }
  }, [projectId, taskId, task, onTaskUpdate]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;
      void fetchMembers();
      void fetchEpics();
    };
    void run();

    return () => {
      isMounted = false;
    };
  }, [fetchMembers, fetchEpics]);

  useEffect(() => {
    if (epicOpen) {
      const timer = setTimeout(() => {
        epicSearchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [epicOpen]);

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        statusSelectorRef.current &&
        !statusSelectorRef.current.contains(target)
      ) {
        setStatusOpen(false);
      }
      if (
        assigneeSelectorRef.current &&
        !assigneeSelectorRef.current.contains(target)
      ) {
        setAssigneeOpen(false);
      }
      if (
        epicSelectorRef.current &&
        !epicSelectorRef.current.contains(target)
      ) {
        setEpicOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (statusOpen || assigneeOpen || epicOpen) {
          setStatusOpen(false);
          setAssigneeOpen(false);
          setEpicOpen(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      window.removeEventListener("keydown", handleKeyDown);
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [statusOpen, assigneeOpen, epicOpen, onClose]);

  const filteredEpics = useMemo(() => {
    if (!epicSearch.trim()) return epics;
    const q = epicSearch.toLowerCase();
    return epics.filter(
      (e) =>
        e.epic_id.toLowerCase().includes(q) || e.title.toLowerCase().includes(q)
    );
  }, [epics, epicSearch]);

  const commitFieldUpdate = useCallback(
    async (
      field: TaskUpdateField,
      patch: TaskUpdatePatch,
      optimisticTaskPatch: Partial<TaskDetails>,
      rollbackTaskPatch: Partial<TaskDetails>,
      previousStatus?: TaskStatus,
      targetStatus?: TaskStatus
    ) => {
      if (!onTaskUpdate || !task) return;

      if (fieldPending[field]) return;

      const gen = ++fieldSeqRef.current[field];

      setTask((prev) => (prev ? { ...prev, ...optimisticTaskPatch } : null));
      setFieldPending((prev) => ({ ...prev, [field]: true }));

      try {
        const result = await onTaskUpdate(
          taskId,
          field,
          patch,
          previousStatus,
          targetStatus
        );

        if (gen !== fieldSeqRef.current[field]) {
          return;
        }

        // Always release pending lock when this request is the current generation
        setFieldPending((prev) => ({ ...prev, [field]: false }));

        if (result.outcome === "success") {
          setTask((prev) => {
            if (!prev) return null;
            switch (field) {
              case "title":
                return { ...prev, title: result.task.title };
              case "description":
                return { ...prev, description: result.task.description };
              case "assignee_id":
                return {
                  ...prev,
                  assignee: result.task.assignee,
                };
              case "due_date":
                return { ...prev, due_date: result.task.due_date };
              case "epic_id":
                return {
                  ...prev,
                  epic_id: result.task.epic_id,
                  epic: result.task.epic,
                };
              case "status":
                return { ...prev, status: result.task.status };
              default:
                return prev;
            }
          });
          showToast("success", "Task updated successfully.");
        } else if (result.outcome === "failure") {
          setTask((prev) => (prev ? { ...prev, ...rollbackTaskPatch } : null));
          if (field === "title" && rollbackTaskPatch.title !== undefined) {
            setTitleDraft(rollbackTaskPatch.title);
          }
          if (
            field === "description" &&
            rollbackTaskPatch.description !== undefined
          ) {
            setDescriptionDraft(rollbackTaskPatch.description ?? "");
          }
          if (field === "due_date") {
            setDueDateDraft(toLocalDateInputValue(rollbackTaskPatch.due_date));
          }
          showToast("error", "Failed to update task. Please try again.");
        }
        // If result.outcome === "stale": zero toast, zero rollback, pending lock released above.
      } catch {
        if (gen === fieldSeqRef.current[field]) {
          setFieldPending((prev) => ({ ...prev, [field]: false }));
          setTask((prev) => (prev ? { ...prev, ...rollbackTaskPatch } : null));
          if (field === "title" && rollbackTaskPatch.title !== undefined) {
            setTitleDraft(rollbackTaskPatch.title);
          }
          if (
            field === "description" &&
            rollbackTaskPatch.description !== undefined
          ) {
            setDescriptionDraft(rollbackTaskPatch.description ?? "");
          }
          if (field === "due_date") {
            setDueDateDraft(toLocalDateInputValue(rollbackTaskPatch.due_date));
          }
          showToast("error", "Failed to update task. Please try again.");
        }
      }
    },
    [onTaskUpdate, task, taskId, fieldPending, showToast]
  );

  const handleTitleBlur = () => {
    if (!task) return;
    const trimmed = titleDraft.trim();
    if (trimmed.length === 0) {
      setTitleError("Title is required.");
      setTitleDraft(task.title);
      return;
    }
    setTitleError(null);
    if (trimmed === task.title) return;

    const previousTitle = task.title;
    void commitFieldUpdate(
      "title",
      { title: trimmed },
      { title: trimmed },
      { title: previousTitle }
    );
  };

  const handleDescriptionBlur = () => {
    if (!task) return;
    const trimmed = descriptionDraft.trim();
    const normalizedValue = trimmed.length > 0 ? trimmed : null;
    const currentNormalized = task.description?.trim() || null;
    if (normalizedValue === currentNormalized) return;

    const previousDescription = task.description;
    void commitFieldUpdate(
      "description",
      { description: normalizedValue },
      { description: normalizedValue },
      { description: previousDescription }
    );
  };

  const handleDueDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!task) return;
    const rawVal = e.target.value.trim();
    setDueDateDraft(rawVal);

    if (!rawVal) {
      setDueDateError(null);
      if (task.due_date === null) return;
      const prevDueDate = task.due_date;
      void commitFieldUpdate(
        "due_date",
        { due_date: null },
        { due_date: null },
        { due_date: prevDueDate }
      );
      return;
    }

    const parts = rawVal.split("-");
    if (
      parts.length !== 3 ||
      parts[0].length !== 4 ||
      parts[1].length !== 2 ||
      parts[2].length !== 2
    ) {
      setDueDateError("Invalid due date.");
      setDueDateDraft(toLocalDateInputValue(task.due_date));
      return;
    }

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);

    if (
      Number.isNaN(y) ||
      Number.isNaN(m) ||
      Number.isNaN(d) ||
      m < 1 ||
      m > 12 ||
      d < 1 ||
      d > 31
    ) {
      setDueDateError("Invalid due date.");
      setDueDateDraft(toLocalDateInputValue(task.due_date));
      return;
    }

    // Real calendar validation: construct local date without UTC conversion
    const testDate = new Date(y, m - 1, d);
    if (
      testDate.getFullYear() !== y ||
      testDate.getMonth() !== m - 1 ||
      testDate.getDate() !== d
    ) {
      setDueDateError("Invalid due date.");
      setDueDateDraft(toLocalDateInputValue(task.due_date));
      return;
    }

    const todayStr = getLocalTodayDateString();
    if (rawVal < todayStr) {
      setDueDateError("Due date cannot be in the past.");
      setDueDateDraft(toLocalDateInputValue(task.due_date));
      return;
    }

    setDueDateError(null);

    // Direct date-only string YYYY-MM-DD (no UTC ISO conversion)
    if (toLocalDateInputValue(task.due_date) === rawVal) return;

    const prevDueDate = task.due_date;
    void commitFieldUpdate(
      "due_date",
      { due_date: rawVal },
      { due_date: rawVal },
      { due_date: prevDueDate }
    );
  };

  const handleStatusSelect = (nextStatus: TaskStatus) => {
    if (!task) return;
    setStatusOpen(false);
    if (nextStatus === task.status) return;

    const previousStatus = task.status;
    void commitFieldUpdate(
      "status",
      { status: nextStatus },
      { status: nextStatus },
      { status: previousStatus },
      previousStatus,
      nextStatus
    );
  };

  const handleAssigneeSelect = (memberUserId: string | null) => {
    if (!task) return;
    setAssigneeOpen(false);
    const currentAssigneeId = task.assignee?.id ?? null;
    if (memberUserId === currentAssigneeId) return;

    const selectedMem = members.find((m) => m.user_id === memberUserId);
    const optimisticAssignee = memberUserId
      ? {
          id: memberUserId,
          name:
            selectedMem?.metadata?.name || selectedMem?.email || "Team Member",
          email: selectedMem?.email || null,
          department: selectedMem?.metadata?.job_title || null,
        }
      : null;

    const previousAssignee = task.assignee;
    void commitFieldUpdate(
      "assignee_id",
      { assignee_id: memberUserId },
      { assignee: optimisticAssignee },
      { assignee: previousAssignee }
    );
  };

  const handleEpicSelect = (epicIdVal: string | null) => {
    if (!task) return;
    setEpicOpen(false);
    if (epicIdVal === task.epic_id) return;

    const selectedEp = epics.find((e) => e.id === epicIdVal);
    const optimisticEpic =
      epicIdVal && selectedEp
        ? {
            id: epicIdVal,
            epic_id: selectedEp.epic_id,
            title: selectedEp.title,
          }
        : null;

    const previousEpicId = task.epic_id;
    const previousEpic = task.epic;

    void commitFieldUpdate(
      "epic_id",
      { epic_id: epicIdVal },
      { epic_id: epicIdVal, epic: optimisticEpic },
      { epic_id: previousEpicId, epic: previousEpic }
    );
  };

  const assigneeName = task?.assignee?.name?.trim() || null;
  const creatorName = task?.created_by?.name?.trim() || null;
  const statusCfg = task?.status
    ? STATUS_CONFIG[task.status] || STATUS_CONFIG.TO_DO
    : STATUS_CONFIG.TO_DO;
  const createdAtFormatted = formatDetailsCreatedAt(task?.created_at);

  const epicDisplay = task?.epic?.epic_id
    ? task.epic.title
      ? `${task.epic.epic_id} (${task.epic.title})`
      : task.epic.epic_id
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-black/50 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-details-title"
      onClick={onClose}
    >
      <div
        className="hidden lg:flex relative w-full max-w-[900px] max-h-[85vh] flex-col rounded-[12px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {toast && (
          <div
            role="alert"
            className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-[6px] px-4 py-2.5 text-[13px] font-semibold shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 ${
              toast.type === "success"
                ? "bg-[#ecfdf3] text-[#027a48] border border-[#a6f4c5]"
                : "bg-[#fff4f2] text-[#b42318] border border-[#fda29b]"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={16} className="text-[#12b76a]" />
            ) : (
              <XCircle size={16} className="text-[#f04438]" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close task details"
          className="cursor-pointer absolute top-5 right-6 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#737685] transition-colors hover:bg-[#f2f4f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc]"
        >
          <X size={20} aria-hidden="true" />
        </button>

        {loading ? (
          <div className="flex h-[480px] w-full items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0052cc] border-t-transparent" />
              <p className="text-[13px] font-medium text-[#737685]">
                Loading task details...
              </p>
            </div>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="flex h-[400px] w-full flex-col items-center justify-center p-8 text-center">
            <p className="text-[16px] font-semibold text-[#b42318]">
              Failed to load task details
            </p>
            <p className="mt-1 text-[13px] text-[#737685]">
              An unexpected error occurred while retrieving this task.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => void fetchDetails()}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-[6px] bg-[#0052cc] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc]"
              >
                <RotateCw size={14} aria-hidden="true" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-[6px] border border-[#d9deeb] bg-white px-4 py-2 text-[13px] font-semibold text-[#53627b] hover:bg-[#f8f9fc]"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}

        {!loading && !error && !task ? (
          <div className="flex h-[340px] w-full flex-col items-center justify-center p-8 text-center">
            <p className="text-[16px] font-semibold text-[#041b3c]">
              Task not found
            </p>
            <p className="mt-1 text-[13px] text-[#737685]">
              The requested task does not exist or has been removed.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer mt-4 rounded-[6px] bg-[#0052cc] px-4 py-2 text-[13px] font-semibold text-white"
            >
              Close
            </button>
          </div>
        ) : null}

        {!loading && !error && task ? (
          <>
            <div className="flex flex-1 min-h-0">
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center rounded-[4px] bg-[#dbe4ff] px-2.5 py-1 text-[11px] font-bold text-[#0052cc]">
                    {task.task_id || "TASK"}
                  </span>
                  <div ref={epicSelectorRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setEpicOpen((prev) => !prev);
                        setStatusOpen(false);
                        setAssigneeOpen(false);
                      }}
                      disabled={fieldPending.epic_id}
                      aria-haspopup="listbox"
                      aria-expanded={epicOpen}
                      className="cursor-pointer inline-flex items-center gap-1.5 rounded-[4px] border border-[#d9deeb] bg-[#f8f9fc] px-2.5 py-1 text-[11px] font-semibold text-[#4f5f7b] hover:bg-[#eef2f6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:opacity-60"
                    >
                      <Layers
                        size={13}
                        aria-hidden="true"
                        className="text-[#0052cc]"
                      />
                      <span>{epicDisplay || "Add Epic Link"}</span>
                      <ChevronDown
                        size={12}
                        className={`text-slate-400 transition-transform ${epicOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {epicOpen && (
                      <div
                        role="listbox"
                        className="absolute top-[calc(100%+4px)] left-0 z-40 w-72 rounded-md border border-[rgba(195,198,214,0.4)] bg-white p-2 shadow-xl max-h-72 flex flex-col"
                      >
                        <div className="relative mb-2 shrink-0">
                          <input
                            ref={epicSearchInputRef}
                            type="text"
                            placeholder="Search Epics..."
                            value={epicSearch}
                            onChange={(e) => setEpicSearch(e.target.value)}
                            className="w-full h-8 rounded-sm bg-[#f8f9fc] pl-8 pr-3 text-[12px] text-[#041b3c] placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0052cc] transition-all"
                          />
                          <Search
                            size={14}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                            aria-hidden="true"
                          />
                        </div>

                        <div className="overflow-y-auto max-h-48 flex flex-col gap-0.5">
                          <button
                            type="button"
                            role="option"
                            aria-selected={!task.epic_id}
                            onClick={() => handleEpicSelect(null)}
                            className="flex w-full items-center px-3 py-1.5 text-[13px] text-slate-500 rounded-sm text-left hover:bg-[#f8f9fc] transition-colors cursor-pointer"
                          >
                            No Epic Link (Unlinked)
                          </button>

                          {epicsLoading ? (
                            <div className="px-3 py-2 text-[12px] text-slate-400 text-center">
                              Loading epics...
                            </div>
                          ) : epicsError ? (
                            <div className="px-3 py-2 text-[12px] text-[#b42318] text-center">
                              Failed to load epics
                            </div>
                          ) : filteredEpics.length === 0 ? (
                            <div className="px-3 py-2 text-[12px] text-slate-400 text-center">
                              No epics found
                            </div>
                          ) : (
                            filteredEpics.map((ep) => {
                              const isSelected = task.epic_id === ep.id;
                              const label = formatEpicDisplay(
                                ep.epic_id,
                                ep.title
                              );
                              return (
                                <button
                                  key={ep.id}
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  onClick={() => handleEpicSelect(ep.id)}
                                  className={`flex w-full items-center px-3 py-1.5 text-[13px] rounded-sm text-[#041b3c] text-left hover:bg-[#f8f9fc] transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-[#eef2f6] font-bold text-[#0052cc]"
                                      : ""
                                  }`}
                                >
                                  <span className="truncate">{label}</span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative pr-10">
                  <input
                    id="task-details-title"
                    type="text"
                    value={titleDraft}
                    onChange={(e) => {
                      setTitleDraft(e.target.value);
                      if (titleError) setTitleError(null);
                    }}
                    onBlur={handleTitleBlur}
                    disabled={fieldPending.title}
                    aria-label="Task title"
                    className={`w-full rounded-[6px] border bg-white px-3 py-1.5 text-[22px] font-bold leading-snug text-[#041b3c] transition-colors focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc] disabled:opacity-60 ${
                      titleError
                        ? "border-[#f04438] ring-1 ring-[#f04438]"
                        : "border-transparent hover:border-[#d9deeb]"
                    }`}
                  />
                  {titleError && (
                    <p
                      className="mt-1 text-[11px] font-medium text-[#b42318]"
                      role="alert"
                    >
                      {titleError}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                    DESCRIPTION
                  </h3>
                  <textarea
                    rows={6}
                    value={descriptionDraft}
                    onChange={(e) => setDescriptionDraft(e.target.value)}
                    onBlur={handleDescriptionBlur}
                    disabled={fieldPending.description}
                    placeholder="No description provided"
                    aria-label="Task description"
                    className="mt-2.5 w-full rounded-[8px] border border-[#e5e8f0] bg-white p-4 text-[13px] leading-relaxed text-[#4f5f7b] placeholder:text-[#737685] min-h-[160px] whitespace-pre-wrap break-words resize-y transition-colors focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc] disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="w-[280px] shrink-0 border-l border-[#eef2f6] bg-[#f8f9fc] p-6 overflow-y-auto flex flex-col gap-5">
                <div ref={statusSelectorRef} className="relative">
                  <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                    STATUS
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusOpen((prev) => !prev);
                      setAssigneeOpen(false);
                      setEpicOpen(false);
                    }}
                    disabled={fieldPending.status}
                    aria-haspopup="listbox"
                    aria-expanded={statusOpen}
                    className="cursor-pointer mt-1.5 flex h-10 w-full items-center justify-between rounded-[6px] border border-[#d9deeb] bg-white px-3 py-2 text-[13px] font-semibold text-[#041b3c] hover:border-[#ccd4e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:opacity-60"
                  >
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-[3px] px-2 py-0.5 text-[11px] font-bold uppercase ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotBg}`}
                      />
                      {statusCfg.label}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-500 transition-transform ${statusOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {statusOpen && (
                    <div
                      role="listbox"
                      className="absolute top-[calc(100%+4px)] left-0 z-40 w-full rounded-md border border-[rgba(195,198,214,0.4)] bg-white py-1 shadow-lg max-h-60 overflow-y-auto"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={task.status === opt.value}
                          onClick={() => handleStatusSelect(opt.value)}
                          className={`flex w-full items-center px-4 py-2 text-[13px] text-[#041b3c] text-left hover:bg-[#f8f9fc] transition-colors cursor-pointer ${
                            task.status === opt.value
                              ? "bg-[#eef2f6] font-bold text-[#0052cc]"
                              : ""
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div ref={assigneeSelectorRef} className="relative">
                  <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                    ASSIGNEE
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAssigneeOpen((prev) => !prev);
                      setStatusOpen(false);
                      setEpicOpen(false);
                    }}
                    disabled={fieldPending.assignee_id}
                    aria-haspopup="listbox"
                    aria-expanded={assigneeOpen}
                    className="cursor-pointer mt-1.5 flex h-10 w-full items-center justify-between rounded-[6px] border border-[#d9deeb] bg-white px-3 py-2 text-[13px] font-medium text-[#041b3c] hover:border-[#ccd4e5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:opacity-60"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {assigneeName ? (
                        <span
                          aria-hidden="true"
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dbe4ff] text-[9px] font-bold text-[#0052cc]"
                        >
                          {getInitials(assigneeName)}
                        </span>
                      ) : (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#60708b]">
                          <UserRound
                            size={12}
                            strokeWidth={1.8}
                            aria-hidden="true"
                          />
                        </span>
                      )}
                      <span className="truncate">
                        {assigneeName || "Unassigned"}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-500 transition-transform ${assigneeOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {assigneeOpen && (
                    <div
                      role="listbox"
                      className="absolute top-[calc(100%+4px)] left-0 z-40 w-full rounded-md border border-[rgba(195,198,214,0.4)] bg-white py-1 shadow-lg max-h-60 overflow-y-auto"
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={!task.assignee}
                        onClick={() => handleAssigneeSelect(null)}
                        className="flex w-full items-center px-4 py-2 text-[13px] text-slate-500 text-left hover:bg-[#f8f9fc] transition-colors cursor-pointer"
                      >
                        Unassigned
                      </button>

                      {membersLoading ? (
                        <div className="px-4 py-2 text-[12px] text-slate-400 text-center">
                          Loading members...
                        </div>
                      ) : membersError ? (
                        <div className="px-4 py-2 text-[12px] text-[#b42318] text-center">
                          Failed to load members
                        </div>
                      ) : (
                        members.map((mem) => {
                          const name = mem.metadata?.name || mem.email;
                          const isSelected = task.assignee?.id === mem.user_id;
                          return (
                            <button
                              key={mem.member_id}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => handleAssigneeSelect(mem.user_id)}
                              className={`flex w-full items-center px-4 py-2 text-[13px] text-[#041b3c] text-left hover:bg-[#f8f9fc] transition-colors cursor-pointer ${
                                isSelected
                                  ? "bg-[#eef2f6] font-bold text-[#0052cc]"
                                  : ""
                              }`}
                            >
                              {name}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                    REPORTER
                  </label>
                  <div className="mt-1.5 flex items-center gap-2 px-1 text-[13px] font-medium text-[#041b3c]">
                    {creatorName ? (
                      <span
                        aria-hidden="true"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dbe4ff] text-[9px] font-bold text-[#0052cc]"
                      >
                        {getInitials(creatorName)}
                      </span>
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#60708b]">
                        <UserRound
                          size={12}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </span>
                    )}
                    <span className="truncate">
                      {creatorName || "Unavailable"}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-[#eef2f6]" />

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                    Due Date
                  </label>
                  <div className="mt-1.5 relative">
                    <input
                      type="date"
                      value={dueDateDraft}
                      onChange={handleDueDateChange}
                      disabled={fieldPending.due_date}
                      aria-label="Due date"
                      className={`flex h-10 w-full items-center rounded-[6px] border bg-white px-3 py-2 text-[13px] font-medium text-[#53627b] transition-colors focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc] disabled:opacity-60 ${
                        dueDateError
                          ? "border-[#f04438] ring-1 ring-[#f04438]"
                          : "border-[#d9deeb]"
                      }`}
                    />
                    {dueDateError && (
                      <p
                        className="mt-1 text-[11px] font-medium text-[#b42318]"
                        role="alert"
                      >
                        {dueDateError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[12px] text-[#737685]">
                  <span>Created At</span>
                  <span className="font-semibold text-[#041b3c]">
                    {createdAtFormatted}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#eef2f6] bg-white px-8 py-3.5">
              <button
                type="button"
                disabled
                aria-disabled="true"
                tabIndex={-1}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#737685] opacity-60 cursor-default"
              >
                <Copy size={13} aria-hidden="true" />
                <span>Copy link</span>
              </button>

              <div className="flex items-center gap-3">
                {onDeleteRequested && task ? (
                  <button
                    type="button"
                    onClick={() =>
                      onDeleteRequested({ id: task.id, status: task.status })
                    }
                    className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#fecdca] bg-[#fff4f2] px-4 py-2 text-[13px] font-semibold text-[#d92d20] transition-colors hover:bg-[#fee4e2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d92d20] cursor-pointer"
                  >
                    <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
                    <span>Delete Task</span>
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-[6px] bg-[#e8edf7] px-5 py-2 text-[13px] font-semibold text-[#041b3c] transition-colors hover:bg-[#dbe4ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc]"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div
        className="flex lg:hidden fixed inset-x-0 bottom-0 max-h-[88vh] flex-col rounded-t-[20px] bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-[#d9deeb]" />
        </div>

        {toast && (
          <div
            role="alert"
            className={`mx-5 mt-2 flex items-center gap-2 rounded-[6px] px-3.5 py-2 text-[12px] font-semibold shadow ${
              toast.type === "success"
                ? "bg-[#ecfdf3] text-[#027a48] border border-[#a6f4c5]"
                : "bg-[#fff4f2] text-[#b42318] border border-[#fda29b]"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={15} className="text-[#12b76a]" />
            ) : (
              <XCircle size={15} className="text-[#f04438]" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-2 border-b border-[#f0f2f7]">
          <span className="text-[12px] font-bold uppercase tracking-[0.3px] text-[#737685]">
            {task?.task_id || "TASK"}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close task details"
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full text-[#737685] hover:bg-[#f2f4f8]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-8">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0052cc] border-t-transparent" />
            </div>
          ) : null}

          {!loading && error ? (
            <div className="py-12 text-center">
              <p className="text-[15px] font-semibold text-[#b42318]">
                Failed to load task details
              </p>
              <button
                type="button"
                onClick={() => void fetchDetails()}
                className="cursor-pointer mt-4 rounded-[6px] bg-[#0052cc] px-5 py-2 text-[13px] font-semibold text-white"
              >
                Retry
              </button>
            </div>
          ) : null}

          {!loading && !error && !task ? (
            <div className="py-12 text-center">
              <p className="text-[15px] font-semibold text-[#041b3c]">
                Task not found
              </p>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer mt-4 rounded-[6px] bg-[#0052cc] px-5 py-2 text-[13px] font-semibold text-white"
              >
                Close
              </button>
            </div>
          ) : null}

          {!loading && !error && task ? (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={titleDraft}
                  onChange={(e) => {
                    setTitleDraft(e.target.value);
                    if (titleError) setTitleError(null);
                  }}
                  onBlur={handleTitleBlur}
                  disabled={fieldPending.title}
                  aria-label="Task title"
                  className={`w-full rounded-[6px] border bg-white px-2.5 py-1.5 text-[18px] font-bold leading-snug text-[#041b3c] transition-colors focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc] disabled:opacity-60 ${
                    titleError
                      ? "border-[#f04438] ring-1 ring-[#f04438]"
                      : "border-transparent hover:border-[#d9deeb]"
                  }`}
                />
                {titleError && (
                  <p
                    className="mt-1 text-[11px] font-medium text-[#b42318]"
                    role="alert"
                  >
                    {titleError}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusSelect(e.target.value as TaskStatus)
                    }
                    disabled={fieldPending.status}
                    aria-label="Task status"
                    className={`appearance-none rounded-[4px] px-3 py-1.5 pr-8 text-[11px] font-bold uppercase ${statusCfg.bg} ${statusCfg.text} border border-transparent focus:outline-none focus:ring-2 focus:ring-[#0052cc] disabled:opacity-60`}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-current"
                  />
                </div>

                <div className="relative max-w-full">
                  <select
                    value={task.epic_id || ""}
                    onChange={(e) =>
                      handleEpicSelect(e.target.value ? e.target.value : null)
                    }
                    disabled={fieldPending.epic_id}
                    aria-label="Epic link"
                    className="appearance-none rounded-[4px] border border-[#d9deeb] bg-[#f8f9fc] px-3 py-1.5 pr-8 text-[11px] font-semibold text-[#4f5f7b] focus:outline-none focus:ring-2 focus:ring-[#0052cc] disabled:opacity-60 truncate max-w-[200px]"
                  >
                    <option value="">No Epic Link</option>
                    {epics.map((ep) => (
                      <option key={ep.id} value={ep.id}>
                        {formatEpicDisplay(ep.epic_id, ep.title)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="rounded-[8px] border border-[#e5e8f0] bg-[#f8f9fc] p-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.4px] text-[#929bad]">
                    ASSIGNEE
                  </span>
                  <div className="mt-1.5 relative">
                    <select
                      value={task.assignee?.id || ""}
                      onChange={(e) =>
                        handleAssigneeSelect(
                          e.target.value ? e.target.value : null
                        )
                      }
                      disabled={fieldPending.assignee_id}
                      aria-label="Assignee"
                      className="w-full appearance-none rounded-[4px] border border-[#d9deeb] bg-white px-2 py-1 pr-6 text-[12px] font-semibold text-[#041b3c] focus:outline-none focus:ring-2 focus:ring-[#0052cc] disabled:opacity-60 truncate"
                    >
                      <option value="">Unassigned</option>
                      {members.map((mem) => (
                        <option key={mem.member_id} value={mem.user_id}>
                          {mem.metadata?.name || mem.email}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                <div className="rounded-[8px] border border-[#e5e8f0] bg-[#f8f9fc] p-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.4px] text-[#929bad]">
                    DUE DATE
                  </span>
                  <div className="mt-1.5 relative">
                    <input
                      type="date"
                      value={dueDateDraft}
                      onChange={handleDueDateChange}
                      disabled={fieldPending.due_date}
                      aria-label="Due date"
                      className={`w-full rounded-[4px] border bg-white px-2 py-1 text-[11px] font-semibold text-[#041b3c] focus:outline-none focus:ring-2 focus:ring-[#0052cc] disabled:opacity-60 ${
                        dueDateError ? "border-[#f04438]" : "border-[#d9deeb]"
                      }`}
                    />
                    {dueDateError && (
                      <p
                        className="mt-1 text-[10px] font-medium text-[#b42318]"
                        role="alert"
                      >
                        {dueDateError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-[8px] border border-[#e5e8f0] bg-[#f8f9fc] p-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.4px] text-[#929bad]">
                    CREATED BY
                  </span>
                  <div className="mt-1.5 flex items-center gap-2">
                    {creatorName ? (
                      <span
                        aria-hidden="true"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dbe4ff] text-[9px] font-bold text-[#0052cc]"
                      >
                        {getInitials(creatorName)}
                      </span>
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#60708b]">
                        <UserRound
                          size={12}
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                      </span>
                    )}
                    <span className="truncate text-[12px] font-semibold text-[#041b3c]">
                      {creatorName || "Unavailable"}
                    </span>
                  </div>
                </div>

                <div className="rounded-[8px] border border-[#e5e8f0] bg-[#f8f9fc] p-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.4px] text-[#929bad]">
                    CREATED AT
                  </span>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#041b3c]">
                    <Clock
                      size={13}
                      className="text-[#737685]"
                      aria-hidden="true"
                    />
                    <span className="truncate">{createdAtFormatted}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.4px] text-[#929bad]">
                  DESCRIPTION
                </span>
                <textarea
                  rows={4}
                  value={descriptionDraft}
                  onChange={(e) => setDescriptionDraft(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  disabled={fieldPending.description}
                  placeholder="No description provided"
                  aria-label="Task description"
                  className="mt-1.5 w-full rounded-[8px] border border-[#e5e8f0] bg-[#f8f9fc] p-3 text-[13px] leading-relaxed text-[#4f5f7b] placeholder:text-[#737685] min-h-[100px] whitespace-pre-wrap break-words resize-y transition-colors focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc] disabled:opacity-60"
                />
              </div>

              {onDeleteRequested && task ? (
                <div className="pt-4 border-t border-[#f0f2f7]">
                  <button
                    type="button"
                    onClick={() =>
                      onDeleteRequested({ id: task.id, status: task.status })
                    }
                    className="w-full flex items-center justify-center gap-2 rounded-[6px] border border-[#fecdca] bg-[#fff4f2] px-4 py-2.5 text-[13px] font-semibold text-[#d92d20] transition-colors hover:bg-[#fee4e2] cursor-pointer"
                  >
                    <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                    <span>Delete Task</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
