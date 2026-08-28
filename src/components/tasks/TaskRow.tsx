"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, Trash2, UserRound } from "lucide-react";
import { BoardTask } from "@/services/api/tasks.service";
import { STATUS_CONFIG, formatTaskDueDate } from "./TaskCard";
import { getInitials } from "@/lib/utils/avatar";

interface TaskRowProps {
  task: BoardTask;
  onSelect?: (taskId: string) => void;
  onDeleteRequested?: (task: BoardTask) => void;
}

export function TaskRow({ task, onSelect, onDeleteRequested }: TaskRowProps) {
  const assigneeName = task.assignee?.name?.trim() || null;
  const dueDateFormatted = formatTaskDueDate(task.due_date);
  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TO_DO;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  }>({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const updateMenuPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Position menu below trigger aligned to right edge, with 4px gap
      const menuWidth = 140;
      const left = Math.max(8, rect.right - menuWidth);
      const top = rect.bottom + 4;
      setMenuPosition({ top, left });
    }
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    updateMenuPosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isMenuOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onSelect && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onSelect(task.id);
    }
  };

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isMenuOpen) {
      updateMenuPosition();
    }
    setIsMenuOpen((prev) => !prev);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsMenuOpen(false);
    onDeleteRequested?.(task);
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

      {/* 6. SETTINGS (Action menu) */}
      <td
        className="whitespace-nowrap px-6 py-4 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={triggerRef}
          type="button"
          aria-label="Task settings"
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          onClick={handleToggleMenu}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!isMenuOpen) updateMenuPosition();
              setIsMenuOpen((prev) => !prev);
            }
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] text-[#737685] transition-colors hover:bg-[#eef2f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] cursor-pointer"
        >
          <MoreHorizontal size={18} aria-hidden="true" />
        </button>

        {isMenuOpen &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{
                position: "fixed",
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
              className="z-50 min-w-[140px] rounded-[6px] border border-[#e5e8f0] bg-white py-1 shadow-[0px_4px_16px_rgba(4,27,60,0.15)] text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                role="menuitem"
                type="button"
                onClick={handleDeleteClick}
                className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] font-medium text-[#d92d20] transition-colors hover:bg-[#fff4f2] focus-visible:bg-[#fff4f2] focus-visible:outline-none cursor-pointer"
              >
                <Trash2 size={15} strokeWidth={1.9} aria-hidden="true" />
                <span>Delete Task</span>
              </button>
            </div>,
            document.body
          )}
      </td>
    </tr>
  );
}
