"use client";

import React from "react";
import Link from "next/link";
import { Plus, RotateCw } from "lucide-react";
import { BoardTask, TaskStatus } from "@/services/api/tasks.service";
import { TaskCard, STATUS_CONFIG } from "./TaskCard";

interface TaskColumnProps {
  projectId: string;
  status: TaskStatus;
  tasks: BoardTask[];
  loading: boolean;
  error: boolean;
  onRetry?: () => void;
  onSelectTask?: (taskId: string) => void;
}

export function TaskColumn({
  projectId,
  status,
  tasks,
  loading,
  error,
  onRetry,
  onSelectTask,
}: TaskColumnProps) {
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.TO_DO;

  return (
    <div className="flex w-[284px] min-w-[284px] shrink-0 flex-col rounded-[10px] border border-[#e2e6f0] bg-[#f8f9fc] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 pb-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-1 text-[11px] font-bold uppercase tracking-[0.2px] ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotBg}`} />
            <span className="truncate">{statusCfg.label}</span>
          </span>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-[#4f5f7b] shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-[#e2e6f0]">
            {loading ? "..." : tasks.length}
          </span>
        </div>

        <Link
          href={`/project/${projectId}/tasks/new?status=${status}`}
          aria-label={`Add new task with status ${statusCfg.label}`}
          className="flex h-7 w-7 items-center justify-center rounded-[6px] text-[#4f5f7b] transition-colors hover:bg-[#e8edf7] hover:text-[#0052cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc]"
        >
          <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
        </Link>
      </div>

      {/* Dashed Add New Task Slot */}
      <Link
        href={`/project/${projectId}/tasks/new?status=${status}`}
        className="mb-3 flex h-11 w-full items-center justify-center gap-2 rounded-[4px] border border-dashed border-[#cad5ec] bg-white/40 text-[11px] font-bold uppercase tracking-[1px] text-[#60708b] transition-colors hover:border-[#0052cc] hover:bg-white hover:text-[#0052cc]"
      >
        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-current text-[11px] leading-none">
          +
        </span>
        <span>ADD NEW TASK</span>
      </Link>

      {/* Column Body */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-0.5 min-h-[140px] max-h-[calc(100vh-320px)]">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-[96px] rounded-[4px] border border-[#e5e8f0] bg-[#edf0f7]" />
            <div className="h-[96px] rounded-[4px] border border-[#e5e8f0] bg-[#edf0f7]" />
          </div>
        ) : null}

        {!loading && error ? (
          <div className="flex flex-col items-center justify-center rounded-[4px] border border-dashed border-[#fda29b] bg-[#fff4f2] p-4 text-center">
            <p className="text-[12px] font-medium text-[#b42318]">
              Failed to load
            </p>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#0052cc] hover:underline"
              >
                <RotateCw size={11} aria-hidden="true" />
                Retry
              </button>
            ) : null}
          </div>
        ) : null}

        {!loading && !error && tasks.length > 0
          ? tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant="desktop"
                onSelect={onSelectTask}
              />
            ))
          : null}
      </div>
    </div>
  );
}
