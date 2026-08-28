"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  Copy,
  Layers,
  RotateCw,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { TasksService, TaskDetails } from "@/services/api/tasks.service";
import { STATUS_CONFIG } from "./TaskCard";
import { getInitials } from "@/lib/utils/avatar";

interface TaskDetailsModalProps {
  projectId: string;
  taskId: string;
  onClose: () => void;
  onDeleteRequested?: (target: {
    id: string;
    status: TaskDetails["status"];
  }) => void;
}

const taskDueDateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDetailsDueDate(dateString: string | null | undefined): string {
  if (dateString === null || dateString === undefined) return "No due date";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? "—" : taskDueDateFormat.format(date);
}

function formatDetailsCreatedAt(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? "—" : taskDueDateFormat.format(date);
}

export function TaskDetailsModal({
  projectId,
  taskId,
  onClose,
  onDeleteRequested,
}: TaskDetailsModalProps) {
  const [task, setTask] = useState<TaskDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const requestSeqRef = useRef(0);

  const fetchDetails = useCallback(async () => {
    const seq = ++requestSeqRef.current;
    await Promise.resolve();
    setLoading(true);
    setError(false);

    try {
      const { data, error: apiError } = await TasksService.getDetails(
        projectId,
        taskId
      );
      if (seq !== requestSeqRef.current) return;

      if (apiError) {
        setError(true);
        setTask(null);
      } else if (!data) {
        setError(false);
        setTask(null);
      } else {
        setError(false);
        setTask(data);
      }
    } catch {
      if (seq !== requestSeqRef.current) return;
      setError(true);
      setTask(null);
    } finally {
      if (seq === requestSeqRef.current) {
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

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const assigneeName = task?.assignee?.name?.trim() || null;
  const creatorName = task?.created_by?.name?.trim() || null;
  const statusCfg = task?.status
    ? STATUS_CONFIG[task.status] || STATUS_CONFIG.TO_DO
    : STATUS_CONFIG.TO_DO;
  const dueDateFormatted = formatDetailsDueDate(task?.due_date);
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
      {/* ========================================================================= */}
      {/* DESKTOP MODAL (Hidden on mobile) */}
      {/* ========================================================================= */}
      <div
        className="hidden lg:flex relative w-full max-w-[900px] max-h-[85vh] flex-col rounded-[12px] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Desktop Close X Button (Always available across loading, error, empty, and ready states) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close task details"
          className="cursor-pointer absolute top-5 right-6 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#737685] transition-colors hover:bg-[#f2f4f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc]"
        >
          <X size={20} aria-hidden="true" />
        </button>

        {/* Loading State */}
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

        {/* Error State */}
        {!loading && error ? (
          <div className="flex h-[380px] w-full flex-col items-center justify-center p-8 text-center">
            <p className="text-[16px] font-semibold text-[#b42318]">
              Failed to load task details
            </p>
            <p className="mt-1 text-[13px] text-[#737685]">
              Please check your connection and try again.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => void fetchDetails()}
                className="cursor-pointer inline-flex items-center gap-1.5 rounded-[6px] bg-[#0052cc] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                <RotateCw size={14} aria-hidden="true" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-[6px] border border-[#d9deeb] px-4 py-2 text-[13px] font-semibold text-[#53627b] hover:bg-[#f8f9fc]"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}

        {/* Empty State */}
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

        {/* Ready State - Dual Panel Desktop Modal */}
        {!loading && !error && task ? (
          <>
            <div className="flex flex-1 min-h-0">
              {/* Left Panel: Content */}
              <div className="flex-1 p-8 overflow-y-auto">
                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center rounded-[4px] bg-[#dbe4ff] px-2.5 py-1 text-[11px] font-bold text-[#0052cc]">
                    {task.task_id || "TASK"}
                  </span>
                  {epicDisplay ? (
                    <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-[#d9deeb] bg-[#f8f9fc] px-2.5 py-1 text-[11px] font-semibold text-[#4f5f7b]">
                      <Layers
                        size={13}
                        aria-hidden="true"
                        className="text-[#0052cc]"
                      />
                      <span>{epicDisplay}</span>
                    </span>
                  ) : null}
                </div>

                {/* Title */}
                <h2
                  id="task-details-title"
                  className="text-[22px] font-bold leading-snug text-[#041b3c] break-words pr-10"
                >
                  {task.title}
                </h2>

                {/* Description */}
                <div className="mt-6">
                  <h3 className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                    DESCRIPTION
                  </h3>
                  <div className="mt-2.5 rounded-[8px] border border-[#e5e8f0] bg-white p-4 text-[13px] leading-relaxed text-[#4f5f7b] min-h-[160px] whitespace-pre-wrap break-words">
                    {task.description?.trim() || "No description provided"}
                  </div>
                </div>
              </div>

              {/* Right Panel: Metadata */}
              <div className="w-[280px] shrink-0 border-l border-[#eef2f6] bg-[#f8f9fc] p-6 overflow-y-auto flex flex-col gap-5">
                {/* STATUS */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                    STATUS
                  </label>
                  <div className="mt-1.5 flex items-center justify-between rounded-[6px] border border-[#d9deeb] bg-white px-3 py-2 text-[13px] font-semibold text-[#041b3c]">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-[3px] px-2 py-0.5 text-[11px] font-bold uppercase ${statusCfg.bg} ${statusCfg.text}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotBg}`}
                      />
                      {statusCfg.label}
                    </span>
                  </div>
                </div>

                {/* ASSIGNEE */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                    ASSIGNEE
                  </label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-[6px] border border-[#d9deeb] bg-white px-3 py-2 text-[13px] font-medium text-[#041b3c]">
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
                </div>

                {/* REPORTER */}
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

                {/* Due Date */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685]">
                    Due Date
                  </label>
                  <div className="mt-1.5 flex items-center gap-2 rounded-[6px] border border-[#d9deeb] bg-white px-3 py-2 text-[13px] font-medium text-[#53627b]">
                    <Calendar
                      size={14}
                      className="text-[#737685]"
                      aria-hidden="true"
                    />
                    <span>{dueDateFormatted}</span>
                  </div>
                </div>

                {/* Created At */}
                <div className="flex items-center justify-between text-[12px] text-[#737685]">
                  <span>Created At</span>
                  <span className="font-semibold text-[#041b3c]">
                    {createdAtFormatted}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Modal Footer */}
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

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM SHEET (Hidden on desktop) */}
      {/* ========================================================================= */}
      <div
        className="flex lg:hidden fixed inset-x-0 bottom-0 max-h-[88vh] flex-col rounded-t-[20px] bg-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle bar */}
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-[#d9deeb]" />
        </div>

        {/* Mobile Header / Close */}
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

        {/* Mobile Body */}
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
              {/* Title */}
              <h2 className="text-[18px] font-bold leading-snug text-[#041b3c] break-words">
                {task.title}
              </h2>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-[3px] px-2.5 py-1 text-[10px] font-bold uppercase ${statusCfg.bg} ${statusCfg.text}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotBg}`}
                  />
                  {statusCfg.label}
                </span>
                {epicDisplay ? (
                  <span className="inline-flex items-center gap-1 rounded-[3px] border border-[#d9deeb] bg-[#f8f9fc] px-2.5 py-1 text-[10px] font-semibold text-[#4f5f7b]">
                    <Layers
                      size={11}
                      aria-hidden="true"
                      className="text-[#0052cc]"
                    />
                    <span>{epicDisplay}</span>
                  </span>
                ) : null}
              </div>

              {/* 2-Column Metadata Cards Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {/* Assignee Card */}
                <div className="rounded-[8px] border border-[#e5e8f0] bg-[#f8f9fc] p-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.4px] text-[#929bad]">
                    ASSIGNEE
                  </span>
                  <div className="mt-1.5 flex items-center gap-2">
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
                    <span className="truncate text-[12px] font-semibold text-[#041b3c]">
                      {assigneeName || "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Due Date Card */}
                <div className="rounded-[8px] border border-[#e5e8f0] bg-[#f8f9fc] p-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.4px] text-[#929bad]">
                    DUE DATE
                  </span>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#041b3c]">
                    <Calendar
                      size={13}
                      className="text-[#737685]"
                      aria-hidden="true"
                    />
                    <span className="truncate">{dueDateFormatted}</span>
                  </div>
                </div>

                {/* Created By Card */}
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

                {/* Created At Card */}
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

              {/* Description */}
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.4px] text-[#929bad]">
                  DESCRIPTION
                </span>
                <div className="mt-1.5 rounded-[8px] border border-[#e5e8f0] bg-[#f8f9fc] p-3.5 text-[13px] leading-relaxed text-[#4f5f7b] whitespace-pre-wrap break-words">
                  {task.description?.trim() || "No description provided"}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
