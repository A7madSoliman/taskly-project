"use client";

import React from "react";
import { MoreHorizontal, UserRound } from "lucide-react";
import { BoardTask } from "@/services/api/tasks.service";
import { STATUS_CONFIG, formatTaskDueDate } from "./TaskCard";
import { getInitials } from "@/lib/utils/avatar";

interface TaskRowProps {
  task: BoardTask;
  onSelect?: (taskId: string) => void;
}

export function TaskRow({ task, onSelect }: TaskRowProps) {
  const assigneeName = task.assignee?.name?.trim() || null;
  const dueDateFormatted = formatTaskDueDate(task.due_date);
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TO_DO;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onSelect && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onSelect(task.id);
    }
  };

  return (
    <tr
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(task.id)}
      onKeyDown={handleKeyDown}
      className={`border-b border-[#f0f2f7] transition-colors ${
        onSelect
          ? "cursor-pointer hover:bg-[#f8faff] focus:bg-[#f0f4fc] focus:outline-none"
          : "hover:bg-[#f8faff]/80"
      }`}
    >
      {/* 1. TASK ID */}
      <td className="whitespace-nowrap px-6 py-4 text-[13px] font-bold text-[#0052cc]">
        {task.task_id || "TASK"}
      </td>

      {/* 2. TITLE */}
      <td className="px-6 py-4 text-[14px] font-semibold text-[#041b3c]">
        <div className="max-w-[420px] truncate" title={task.title}>
          {task.title}
        </div>
      </td>

      {/* 3. STATUS */}
      <td className="whitespace-nowrap px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.2px] ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotBg}`} />
          {statusCfg.label}
        </span>
      </td>

      {/* 4. DUE DATE */}
      <td className="whitespace-nowrap px-6 py-4 text-[13px] font-medium text-[#53627b]">
        {dueDateFormatted}
      </td>

      {/* 5. ASSIGNEE */}
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center gap-2">
          {assigneeName ? (
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dbe4ff] text-[10px] font-bold text-[#0052cc]"
              title={assigneeName}
            >
              {getInitials(assigneeName)}
            </span>
          ) : (
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef2ff] text-[#60708b]"
              title="Unassigned"
            >
              <UserRound size={13} strokeWidth={1.8} aria-hidden="true" />
            </span>
          )}
          <span className="truncate text-[13px] font-medium text-[#041b3c]">
            {assigneeName || "Unassigned"}
          </span>
        </div>
      </td>

      {/* 6. SETTINGS (Inert, stops event propagation) */}
      <td
        className="whitespace-nowrap px-6 py-4 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          disabled
          aria-disabled="true"
          aria-label="Task settings"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] text-[#737685] transition-colors hover:bg-[#eef2f6] disabled:cursor-default"
        >
          <MoreHorizontal size={18} aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}
