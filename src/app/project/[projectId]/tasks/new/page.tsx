"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { EpicsService } from "@/services/api/epics.service";
import {
  ProjectsService,
  ProjectMember,
} from "@/services/api/projects.service";
import {
  TasksService,
  TaskStatus,
  CreateTaskInput,
} from "@/services/api/tasks.service";
import {
  TASK_STATUS_OPTIONS,
  TASK_STATUS_SET,
} from "@/lib/constants/task-status";

interface EpicSelectorItem {
  id: string;
  epic_id: string;
  title: string;
}

const STATUS_OPTIONS = TASK_STATUS_OPTIONS;
const VALID_STATUSES = TASK_STATUS_SET;

function parseInitialStatus(statusParam: string | null): TaskStatus {
  if (statusParam && VALID_STATUSES.has(statusParam as TaskStatus)) {
    return statusParam as TaskStatus;
  }
  return "TO_DO";
}

function formatEpicDisplay(epicId: string, title: string): string {
  const full = `${epicId} ${title}`.trim();
  if (full.length <= 100) return full;
  return `${full.slice(0, 97)}...`;
}

export default function NewTaskPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params?.projectId as string;
  const initialEpicIdParam = searchParams.get("epicId");
  const initialStatusParam = searchParams.get("status");

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<TaskStatus>(() =>
    parseInitialStatus(initialStatusParam)
  );
  const [epicIdState, setEpicIdState] = useState<string>("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [projectName, setProjectName] = useState("Project");
  const [epics, setEpics] = useState<EpicSelectorItem[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  // Custom Dropdown Open States
  const [statusOpen, setStatusOpen] = useState(false);
  const [epicOpen, setEpicOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [epicSearch, setEpicSearch] = useState("");

  const desktopStatusRef = useRef<HTMLDivElement>(null);
  const desktopEpicRef = useRef<HTMLDivElement>(null);
  const desktopAssigneeRef = useRef<HTMLDivElement>(null);

  const mobileStatusRef = useRef<HTMLDivElement>(null);
  const mobileEpicRef = useRef<HTMLDivElement>(null);
  const mobileAssigneeRef = useRef<HTMLDivElement>(null);

  const epicSearchInputRef = useRef<HTMLInputElement>(null);
  const mobileEpicSearchInputRef = useRef<HTMLInputElement>(null);

  const titleInputId = useId();
  const dueDateInputId = useId();
  const descriptionInputId = useId();

  // Close dropdowns on outside mousedown/pointerdown or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | PointerEvent) => {
      const target = e.target as Node;
      const isInsideStatus =
        (desktopStatusRef.current &&
          desktopStatusRef.current.contains(target)) ||
        (mobileStatusRef.current && mobileStatusRef.current.contains(target));
      if (!isInsideStatus) {
        setStatusOpen(false);
      }

      const isInsideEpic =
        (desktopEpicRef.current && desktopEpicRef.current.contains(target)) ||
        (mobileEpicRef.current && mobileEpicRef.current.contains(target));
      if (!isInsideEpic) {
        setEpicOpen(false);
      }

      const isInsideAssignee =
        (desktopAssigneeRef.current &&
          desktopAssigneeRef.current.contains(target)) ||
        (mobileAssigneeRef.current &&
          mobileAssigneeRef.current.contains(target));
      if (!isInsideAssignee) {
        setAssigneeOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStatusOpen(false);
        setEpicOpen(false);
        setAssigneeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Focus epic search input when epic dropdown opens
  useEffect(() => {
    if (epicOpen) {
      const timer = setTimeout(() => {
        epicSearchInputRef.current?.focus();
        mobileEpicSearchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [epicOpen]);

  // Load project name
  useEffect(() => {
    let isMounted = true;
    ProjectsService.getById(projectId).then(({ data }) => {
      if (isMounted && data) setProjectName(data.name);
    });
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Load all project epics for selector
  useEffect(() => {
    let isMounted = true;
    EpicsService.getAllByProject(projectId).then(({ data }) => {
      if (!isMounted) return;
      const loadedEpics = data ?? [];
      setEpics(loadedEpics);

      // Handle epic prefill
      if (initialEpicIdParam) {
        const found = loadedEpics.some(
          (item) => item.id === initialEpicIdParam
        );
        if (found) {
          setEpicIdState(initialEpicIdParam);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [projectId, initialEpicIdParam]);

  // Load project members
  useEffect(() => {
    let isMounted = true;
    ProjectsService.getMembers(projectId).then(({ data }) => {
      if (!isMounted) return;
      setMembers(data ?? []);
    });
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const filteredEpics = useMemo(() => {
    if (!epicSearch.trim()) return epics;
    const query = epicSearch.toLowerCase();
    return epics.filter(
      (e) =>
        e.epic_id.toLowerCase().includes(query) ||
        e.title.toLowerCase().includes(query)
    );
  }, [epics, epicSearch]);

  const selectedEpic = useMemo(
    () => epics.find((e) => e.id === epicIdState),
    [epics, epicIdState]
  );

  const selectedMember = useMemo(
    () => members.find((m) => m.user_id === assigneeId),
    [members, assigneeId]
  );

  const handleTitleBlur = () => {
    if (title.trim().length === 0) {
      setTitleError("Title is required.");
    } else {
      setTitleError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setTitleError("Title is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateTaskInput = {
        title: trimmedTitle,
        status,
      };

      if (epicIdState) {
        payload.epic_id = epicIdState;
      }
      if (assigneeId) {
        payload.assignee_id = assigneeId;
      }
      if (dueDate) {
        payload.due_date = new Date(dueDate).toISOString();
      }
      if (description.trim()) {
        payload.description = description.trim();
      }

      const { error } = await TasksService.create(projectId, payload);

      if (error) {
        setSubmitError("Failed to create task. Please try again.");
      } else {
        router.push(`/project/${projectId}/tasks`);
      }
    } catch {
      setSubmitError("Failed to create task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackBanner =
    submitError !== null ? (
      <div className="bg-[#fee4e2] border border-[#f04438] text-[#d92d20] rounded-[8px] px-4 py-3 text-[14px] font-semibold mb-6 flex justify-between items-center animate-in fade-in duration-200">
        <span>{submitError}</span>
        <button
          type="button"
          onClick={() => setSubmitError(null)}
          className="text-[#d92d20] hover:text-[#b42318] focus:outline-none"
          aria-label="Dismiss error message"
        >
          ✕
        </button>
      </div>
    ) : null;

  return (
    <AppShell>
      <div className="max-w-[1024px] mx-auto py-2">
        {/* Desktop Breadcrumb + Heading */}
        <div className="hidden lg:block mb-6">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-2">
            PROJECTS <span className="text-slate-300 mx-1">›</span>{" "}
            {projectName} <span className="text-slate-300 mx-1">›</span> TASKS{" "}
            <span className="text-slate-300 mx-1">›</span>{" "}
            <span className="font-bold text-[#0052cc]">NEW TASK</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#041b3c] tracking-[-0.5px]">
            Create New Task
          </h1>
          <p className="text-[14px] text-slate-500 mt-1">
            Initialize a new work item within the Architectural Workspace
            ecosystem.
          </p>
        </div>

        {feedbackBanner}

        {/* Desktop Form Card Layout */}
        <div className="hidden lg:block bg-white rounded-lg border border-[rgba(195,198,214,0.3)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] overflow-visible">
          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
            {/* Title Field */}
            <div className="flex flex-col w-full relative">
              <label
                htmlFor={titleInputId}
                className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1"
              >
                TITLE <span className="text-error">*</span>
              </label>
              <input
                id={titleInputId}
                type="text"
                placeholder="e.g., Finalize structural schematics"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError(null);
                }}
                onBlur={handleTitleBlur}
                disabled={isSubmitting}
                aria-invalid={!!titleError}
                className={`flex h-[48px] w-full items-center bg-surface-highest px-4 py-3 rounded-sm text-neutral text-[16px] placeholder:text-[#737685] outline-none transition-all focus:ring-2 focus:ring-primary-container ${
                  titleError ? "ring-2 ring-error" : ""
                }`}
              />
              {titleError && (
                <p className="text-error text-[11px] mt-1 px-1" role="alert">
                  {titleError}
                </p>
              )}
            </div>

            {/* Status & Assignee Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Status Custom Dropdown */}
              <div
                ref={desktopStatusRef}
                className="flex flex-col w-full relative"
              >
                <label className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1">
                  STATUS <span className="text-error">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStatusOpen((prev) => !prev);
                    setEpicOpen(false);
                    setAssigneeOpen(false);
                  }}
                  disabled={isSubmitting}
                  aria-haspopup="listbox"
                  aria-expanded={statusOpen}
                  className="flex h-[48px] w-full items-center justify-between bg-surface-highest px-4 py-3 rounded-sm text-neutral text-[16px] font-medium outline-none transition-all focus:ring-2 focus:ring-primary-container text-left cursor-pointer"
                >
                  <span>
                    {STATUS_OPTIONS.find((opt) => opt.value === status)?.label}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-500 transition-transform ${
                      statusOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {statusOpen && (
                  <div
                    role="listbox"
                    className="absolute top-[calc(100%+4px)] left-0 z-30 w-full rounded-md border border-[rgba(195,198,214,0.4)] bg-white py-1 shadow-lg max-h-60 overflow-y-auto"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        role="option"
                        aria-selected={status === opt.value}
                        onClick={() => {
                          setStatus(opt.value);
                          setStatusOpen(false);
                        }}
                        className={`flex w-full items-center px-4 py-2.5 text-[14px] text-neutral text-left hover:bg-surface-low transition-colors cursor-pointer ${
                          status === opt.value
                            ? "bg-surface-low font-bold text-[#0052cc]"
                            : ""
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Assignee Custom Dropdown */}
              <div
                ref={desktopAssigneeRef}
                className="flex flex-col w-full relative"
              >
                <label className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1">
                  ASSIGNEE
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAssigneeOpen((prev) => !prev);
                    setStatusOpen(false);
                    setEpicOpen(false);
                  }}
                  disabled={isSubmitting}
                  aria-haspopup="listbox"
                  aria-expanded={assigneeOpen}
                  className="flex h-[48px] w-full items-center justify-between bg-surface-highest px-4 py-3 rounded-sm text-neutral text-[16px] outline-none transition-all focus:ring-2 focus:ring-primary-container text-left cursor-pointer"
                >
                  <span
                    className={
                      selectedMember
                        ? "text-neutral font-medium"
                        : "text-[#737685]"
                    }
                  >
                    {selectedMember
                      ? selectedMember.metadata?.name || selectedMember.email
                      : "Select Team Member"}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-500 transition-transform ${
                      assigneeOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {assigneeOpen && (
                  <div
                    role="listbox"
                    className="absolute top-[calc(100%+4px)] left-0 z-30 w-full rounded-md border border-[rgba(195,198,214,0.4)] bg-white py-1 shadow-lg max-h-60 overflow-y-auto"
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={!assigneeId}
                      onClick={() => {
                        setAssigneeId("");
                        setAssigneeOpen(false);
                      }}
                      className="flex w-full items-center px-4 py-2.5 text-[14px] text-slate-500 text-left hover:bg-surface-low transition-colors cursor-pointer"
                    >
                      Select Team Member (Unassigned)
                    </button>
                    {members.map((member) => {
                      const name = member.metadata?.name || member.email;
                      const isSelected = assigneeId === member.user_id;
                      return (
                        <button
                          key={member.member_id}
                          type="button"
                          role="option"
                          aria-selected={isSelected}
                          onClick={() => {
                            setAssigneeId(member.user_id);
                            setAssigneeOpen(false);
                          }}
                          className={`flex w-full items-center px-4 py-2.5 text-[14px] text-neutral text-left hover:bg-surface-low transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-surface-low font-bold text-[#0052cc]"
                              : ""
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Epic Custom Dropdown with Search */}
            <div ref={desktopEpicRef} className="flex flex-col w-full relative">
              <label className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1">
                EPIC
              </label>
              <button
                type="button"
                onClick={() => {
                  setEpicOpen((prev) => !prev);
                  setStatusOpen(false);
                  setAssigneeOpen(false);
                }}
                disabled={isSubmitting}
                aria-haspopup="listbox"
                aria-expanded={epicOpen}
                className="flex h-[48px] w-full items-center justify-between bg-surface-highest px-4 py-3 rounded-sm text-neutral text-[16px] outline-none transition-all focus:ring-2 focus:ring-primary-container text-left cursor-pointer"
              >
                <span
                  className={
                    selectedEpic ? "text-neutral font-medium" : "text-[#737685]"
                  }
                >
                  {selectedEpic
                    ? formatEpicDisplay(
                        selectedEpic.epic_id,
                        selectedEpic.title
                      )
                    : "Select Epic Link"}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-500 transition-transform ${
                    epicOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {epicOpen && (
                <div
                  role="listbox"
                  className="absolute top-[calc(100%+4px)] left-0 z-40 w-full rounded-md border border-[rgba(195,198,214,0.4)] bg-white p-2 shadow-xl max-h-72 flex flex-col"
                >
                  {/* Search Input */}
                  <div className="relative mb-2 shrink-0">
                    <input
                      ref={epicSearchInputRef}
                      type="text"
                      placeholder="Search Epics..."
                      value={epicSearch}
                      onChange={(e) => setEpicSearch(e.target.value)}
                      className="w-full h-10 rounded-sm bg-surface-low pl-9 pr-3 text-[14px] text-neutral placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                    />
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Epics List */}
                  <div className="overflow-y-auto max-h-48 flex flex-col gap-0.5">
                    <button
                      type="button"
                      role="option"
                      aria-selected={!epicIdState}
                      onClick={() => {
                        setEpicIdState("");
                        setEpicOpen(false);
                      }}
                      className="flex w-full items-center px-3 py-2 text-[14px] text-slate-500 rounded-sm text-left hover:bg-surface-low transition-colors cursor-pointer"
                    >
                      No Epic Link (Unlinked)
                    </button>

                    {filteredEpics.length === 0 ? (
                      <div className="px-3 py-3 text-[13px] text-slate-400 text-center">
                        No epics found
                      </div>
                    ) : (
                      filteredEpics.map((epicItem) => {
                        const isSelected = epicIdState === epicItem.id;
                        const label = formatEpicDisplay(
                          epicItem.epic_id,
                          epicItem.title
                        );
                        return (
                          <button
                            key={epicItem.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setEpicIdState(epicItem.id);
                              setEpicOpen(false);
                            }}
                            className={`flex w-full items-center px-3 py-2 text-[14px] rounded-sm text-neutral text-left hover:bg-surface-low transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-surface-low font-bold text-[#0052cc]"
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

            {/* Due Date Field */}
            <div className="flex flex-col w-full relative">
              <label
                htmlFor={dueDateInputId}
                className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1"
              >
                DUE DATE
              </label>
              <input
                id={dueDateInputId}
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
                className="flex h-[48px] w-full items-center bg-surface-highest px-4 py-3 rounded-sm text-neutral text-[16px] outline-none transition-all focus:ring-2 focus:ring-primary-container"
              />
            </div>

            {/* Description Field */}
            <div className="flex flex-col w-full relative">
              <label
                htmlFor={descriptionInputId}
                className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1"
              >
                DESCRIPTION
              </label>
              <textarea
                id={descriptionInputId}
                rows={5}
                placeholder="Briefly describe the task scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[140px] w-full resize-y rounded-sm bg-surface-highest px-4 py-3 text-[16px] text-neutral outline-none transition-all placeholder:text-[#737685] focus:ring-2 focus:ring-primary-container"
              />
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-end gap-4 w-full pt-6 border-t border-[rgba(195,198,214,0.2)] mt-2">
              <Link
                href={`/project/${projectId}/tasks`}
                className="text-[14px] font-bold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none focus:underline"
              >
                Back
              </Link>
              <Button
                type="submit"
                fullWidth={false}
                isLoading={isSubmitting}
                className="px-6 py-3 shrink-0"
              >
                Create Task
              </Button>
            </div>
          </form>
        </div>

        {/* Mobile Flat Layout */}
        <div className="block lg:hidden px-2 mt-4">
          <h1 className="text-[24px] font-bold text-[#041b3c] tracking-[-0.5px]">
            Create New Task
          </h1>
          <p className="text-[14px] text-slate-500 mt-1 mb-6">
            Initialize a new work item within the Architectural Workspace
            ecosystem.
          </p>

          {feedbackBanner}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Mobile Title */}
            <div className="flex flex-col w-full relative">
              <label
                htmlFor={`${titleInputId}-mobile`}
                className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1"
              >
                TITLE <span className="text-error">*</span>
              </label>
              <input
                id={`${titleInputId}-mobile`}
                type="text"
                placeholder="E.g., Design System Documentation"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError(null);
                }}
                onBlur={handleTitleBlur}
                disabled={isSubmitting}
                aria-invalid={!!titleError}
                className={`flex h-[48px] w-full items-center bg-surface-highest px-4 py-3 rounded-sm text-neutral text-[16px] placeholder:text-[#737685] outline-none transition-all focus:ring-2 focus:ring-primary-container ${
                  titleError ? "ring-2 ring-error" : ""
                }`}
              />
              {titleError && (
                <p className="text-error text-[11px] mt-1 px-1" role="alert">
                  {titleError}
                </p>
              )}
            </div>

            {/* Mobile Status */}
            <div
              ref={mobileStatusRef}
              className="flex flex-col w-full relative"
            >
              <label className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1">
                STATUS
              </label>
              <button
                type="button"
                onClick={() => {
                  setStatusOpen((prev) => !prev);
                  setEpicOpen(false);
                  setAssigneeOpen(false);
                }}
                disabled={isSubmitting}
                aria-haspopup="listbox"
                aria-expanded={statusOpen}
                className="flex h-[48px] w-full items-center justify-between bg-surface-highest px-4 py-3 rounded-sm text-neutral text-[16px] font-medium outline-none transition-all focus:ring-2 focus:ring-primary-container text-left cursor-pointer"
              >
                <span>
                  {STATUS_OPTIONS.find((opt) => opt.value === status)?.label}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-500 transition-transform ${
                    statusOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {statusOpen && (
                <div
                  role="listbox"
                  className="absolute top-[calc(100%+4px)] left-0 z-30 w-full rounded-md border border-[rgba(195,198,214,0.4)] bg-white py-1 shadow-lg max-h-60 overflow-y-auto"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={status === opt.value}
                      onClick={() => {
                        setStatus(opt.value);
                        setStatusOpen(false);
                      }}
                      className={`flex w-full items-center px-4 py-2.5 text-[14px] text-neutral text-left hover:bg-surface-low transition-colors cursor-pointer ${
                        status === opt.value
                          ? "bg-surface-low font-bold text-[#0052cc]"
                          : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Epic */}
            <div ref={mobileEpicRef} className="flex flex-col w-full relative">
              <label className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1">
                EPIC
              </label>
              <button
                type="button"
                onClick={() => {
                  setEpicOpen((prev) => !prev);
                  setStatusOpen(false);
                  setAssigneeOpen(false);
                }}
                disabled={isSubmitting}
                aria-haspopup="listbox"
                aria-expanded={epicOpen}
                className="flex h-[48px] w-full items-center justify-between bg-surface-highest px-4 py-3 rounded-sm text-neutral text-[16px] outline-none transition-all focus:ring-2 focus:ring-primary-container text-left cursor-pointer"
              >
                <span
                  className={
                    selectedEpic ? "text-neutral font-medium" : "text-[#737685]"
                  }
                >
                  {selectedEpic
                    ? formatEpicDisplay(
                        selectedEpic.epic_id,
                        selectedEpic.title
                      )
                    : "Select an Epic"}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-500 transition-transform ${
                    epicOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {epicOpen && (
                <div
                  role="listbox"
                  className="absolute top-[calc(100%+4px)] left-0 z-40 w-full rounded-md border border-[rgba(195,198,214,0.4)] bg-white p-2 shadow-xl max-h-72 flex flex-col"
                >
                  {/* Search Input */}
                  <div className="relative mb-2 shrink-0">
                    <input
                      ref={mobileEpicSearchInputRef}
                      type="text"
                      placeholder="Search Epics..."
                      value={epicSearch}
                      onChange={(e) => setEpicSearch(e.target.value)}
                      className="w-full h-10 rounded-sm bg-surface-low pl-9 pr-3 text-[14px] text-neutral placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-container transition-all"
                    />
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Epics List */}
                  <div className="overflow-y-auto max-h-48 flex flex-col gap-0.5">
                    <button
                      type="button"
                      role="option"
                      aria-selected={!epicIdState}
                      onClick={() => {
                        setEpicIdState("");
                        setEpicOpen(false);
                      }}
                      className="flex w-full items-center px-3 py-2 text-[14px] text-slate-500 rounded-sm text-left hover:bg-surface-low transition-colors cursor-pointer"
                    >
                      Select an Epic (Unlinked)
                    </button>

                    {filteredEpics.length === 0 ? (
                      <div className="px-3 py-3 text-[13px] text-slate-400 text-center">
                        No epics found
                      </div>
                    ) : (
                      filteredEpics.map((epicItem) => {
                        const isSelected = epicIdState === epicItem.id;
                        const label = formatEpicDisplay(
                          epicItem.epic_id,
                          epicItem.title
                        );
                        return (
                          <button
                            key={epicItem.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setEpicIdState(epicItem.id);
                              setEpicOpen(false);
                            }}
                            className={`flex w-full items-center px-3 py-2 text-[14px] rounded-sm text-neutral text-left hover:bg-surface-low transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-surface-low font-bold text-[#0052cc]"
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

            {/* Mobile Assignee */}
            <div
              ref={mobileAssigneeRef}
              className="flex flex-col w-full relative"
            >
              <label className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1">
                ASSIGNEE
              </label>
              <button
                type="button"
                onClick={() => {
                  setAssigneeOpen((prev) => !prev);
                  setStatusOpen(false);
                  setEpicOpen(false);
                }}
                disabled={isSubmitting}
                aria-haspopup="listbox"
                aria-expanded={assigneeOpen}
                className="flex h-[48px] w-full items-center justify-between bg-surface-highest px-4 py-3 rounded-sm text-neutral text-[16px] outline-none transition-all focus:ring-2 focus:ring-primary-container text-left cursor-pointer"
              >
                <span
                  className={
                    selectedMember
                      ? "text-neutral font-medium"
                      : "text-[#737685]"
                  }
                >
                  {selectedMember
                    ? selectedMember.metadata?.name || selectedMember.email
                    : "Select Team Member"}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-500 transition-transform ${
                    assigneeOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {assigneeOpen && (
                <div
                  role="listbox"
                  className="absolute top-[calc(100%+4px)] left-0 z-30 w-full rounded-md border border-[rgba(195,198,214,0.4)] bg-white py-1 shadow-lg max-h-60 overflow-y-auto"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={!assigneeId}
                    onClick={() => {
                      setAssigneeId("");
                      setAssigneeOpen(false);
                    }}
                    className="flex w-full items-center px-4 py-2.5 text-[14px] text-slate-500 text-left hover:bg-surface-low transition-colors cursor-pointer"
                  >
                    Select Team Member (Unassigned)
                  </button>
                  {members.map((member) => {
                    const name = member.metadata?.name || member.email;
                    const isSelected = assigneeId === member.user_id;
                    return (
                      <button
                        key={member.member_id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setAssigneeId(member.user_id);
                          setAssigneeOpen(false);
                        }}
                        className={`flex w-full items-center px-4 py-2.5 text-[14px] text-neutral text-left hover:bg-surface-low transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-surface-low font-bold text-[#0052cc]"
                            : ""
                        }`}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Due Date */}
            <div className="flex flex-col w-full relative">
              <label
                htmlFor={`${dueDateInputId}-mobile`}
                className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1"
              >
                DUE DATE
              </label>
              <input
                id={`${dueDateInputId}-mobile`}
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSubmitting}
                className="flex h-[48px] w-full items-center bg-surface-highest px-4 py-3 rounded-sm text-neutral text-[16px] outline-none transition-all focus:ring-2 focus:ring-primary-container"
              />
            </div>

            {/* Mobile Description */}
            <div className="flex flex-col w-full relative">
              <label
                htmlFor={`${descriptionInputId}-mobile`}
                className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1"
              >
                DESCRIPTION
              </label>
              <textarea
                id={`${descriptionInputId}-mobile`}
                rows={5}
                placeholder="Briefly describe the task scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                className="min-h-[140px] w-full resize-y rounded-sm bg-surface-highest px-4 py-3 text-[16px] text-neutral outline-none transition-all placeholder:text-[#737685] focus:ring-2 focus:ring-primary-container"
              />
            </div>

            {/* Mobile Actions */}
            <div className="flex flex-col gap-4 mt-4">
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full py-3.5"
              >
                Create Task
              </Button>
              <Link
                href={`/project/${projectId}/tasks`}
                className="text-[14px] font-bold text-[#0052cc] hover:text-[#003d99] transition-colors py-2 text-center focus:outline-none focus:underline"
              >
                Back
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
