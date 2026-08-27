"use client";

import React from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import { BoardTask, TaskStatus } from "@/services/api/tasks.service";
import { getInitials } from "@/lib/utils/avatar";

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; bg: string; text: string; dotBg: string; border: string }
> = {
  TO_DO: {
    label: "TO DO",
    bg: "bg-[#e8ebf3]",
    text: "text-[#4f5f7b]",
    dotBg: "bg-[#7e8b9f]",
    border: "border-[#d8dce8]",
  },
  IN_PROGRESS: {
    label: "IN PROGRESS",
    bg: "bg-[#dbe4ff]",
    text: "text-[#0052cc]",
    dotBg: "bg-[#0052cc]",
    border: "border-[#cad8ff]",
  },
  BLOCKED: {
    label: "BLOCKED",
    bg: "bg-[#fee4e2]",
    text: "text-[#d92d20]",
    dotBg: "bg-[#d92d20]",
    border: "border-[#fecdca]",
  },
  IN_REVIEW: {
    label: "IN REVIEW",
    bg: "bg-[#fef0c7]",
    text: "text-[#b54708]",
    dotBg: "bg-[#b54708]",
    border: "border-[#fedf89]",
  },
  READY_FOR_QA: {
    label: "READY FOR QA",
    bg: "bg-[#e0f2fe]",
    text: "text-[#0284c7]",
    dotBg: "bg-[#0284c7]",
    border: "border-[#bae6fd]",
  },
  REOPENED: {
    label: "REOPENED",
    bg: "bg-[#ffedd5]",
    text: "text-[#ea580c]",
    dotBg: "bg-[#ea580c]",
    border: "border-[#fed7aa]",
  },
  READY_FOR_PRODUCTION: {
    label: "READY FOR PRODUCTION",
    bg: "bg-[#ccfbf1]",
    text: "text-[#0f766e]",
    dotBg: "bg-[#0f766e]",
    border: "border-[#99f6e4]",
  },
  DONE: {
    label: "DONE",
    bg: "bg-[#dcfce7]",
    text: "text-[#16a34a]",
    dotBg: "bg-[#16a34a]",
    border: "border-[#bbf7d0]",
  },
};

const taskDueDateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatTaskDueDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : taskDueDateFormat.format(date);
}

interface TaskCardProps {
  task: BoardTask;
  variant?: "desktop" | "mobile";
}

export function TaskCard({ task, variant = "desktop" }: TaskCardProps) {
  const assigneeName = task.assignee?.name?.trim() || null;
  const dueDateFormatted = formatTaskDueDate(task.due_date);
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TO_DO;

  if (variant === "mobile") {
    return (
      <div className="flex flex-col justify-between rounded-[8px] border border-[#d9e1f2] bg-white p-4 shadow-[0_1px_2px_rgba(4,27,60,0.03)]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.3px] text-[#737685]">
            {task.task_id || "TASK"}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2px] ${statusCfg.bg} ${statusCfg.text}`}
          >
            {statusCfg.label}
          </span>
        </div>

        <h4 className="mt-2.5 text-[15px] font-semibold leading-snug text-[#041b3c] break-words">
          {task.title}
        </h4>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#f0f2f7] pt-3 text-[#68758c]">
          <div className="flex min-w-0 items-center gap-2.5">
            {assigneeName ? (
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dbe4ff] text-[10px] font-bold text-[#0052cc]"
              >
                {getInitials(assigneeName)}
              </span>
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#60708b]">
                <UserRound size={13} strokeWidth={1.8} aria-hidden="true" />
              </span>
            )}
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-[0.4px] text-[#929bad]">
                DUE DATE
              </span>
              <span className="text-[12px] font-semibold text-[#041b3c]">
                {dueDateFormatted}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Board Card (Inert, non-draggable, canonical layout)
  return (
    <div className="group relative flex flex-col justify-between rounded-[4px] border border-[#e5e8f0] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:border-[#ccd4e5] hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
      <h4 className="text-[14px] font-medium leading-snug text-[#041b3c] break-words">
        {task.title}
      </h4>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.3px] text-[#737685]">
          <Image
            src="/assets/svg/icons/icon-calendar.svg"
            alt=""
            width={12}
            height={12}
            aria-hidden="true"
          />
          <span>{dueDateFormatted}</span>
        </div>

        <div className="flex min-w-0 items-center">
          {assigneeName ? (
            <span
              aria-hidden="true"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#dbe4ff] text-[9px] font-bold text-[#0052cc]"
              title={assigneeName}
            >
              {getInitials(assigneeName)}
            </span>
          ) : (
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#60708b]"
              title="Unassigned"
            >
              <UserRound size={11} strokeWidth={1.8} aria-hidden="true" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
