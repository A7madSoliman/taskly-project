"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onLogout,
  isLoggingOut,
}: SidebarProps) {
  const pathname = usePathname() || "";
  const params = useParams();

  const paramProjectId = params?.projectId as string | undefined;
  const pathParts = pathname.split("/");
  const urlProjectId =
    pathParts[1] === "project" && pathParts[2] && pathParts[2] !== "add"
      ? pathParts[2]
      : undefined;

  const projectId = paramProjectId || urlProjectId;
  const isProjectScoped = Boolean(projectId);
  const projectBase = isProjectScoped ? `/project/${projectId}` : "";

  const isProjectsActive =
    pathname === "/project" || pathname === "/project/add";
  const isEpicsActive =
    Boolean(isProjectScoped) &&
    (pathname === `${projectBase}/epics` ||
      pathname.startsWith(`${projectBase}/epics/`));
  const isTasksActive =
    Boolean(isProjectScoped) &&
    (pathname === `${projectBase}/tasks` ||
      pathname.startsWith(`${projectBase}/tasks/`));
  const isMembersActive =
    Boolean(isProjectScoped) &&
    (pathname === `${projectBase}/members` ||
      pathname.startsWith(`${projectBase}/members/`));
  const isDetailsActive =
    Boolean(isProjectScoped) &&
    (pathname === `${projectBase}/edit` ||
      pathname.startsWith(`${projectBase}/edit/`));

  const activeLinkClass = `flex items-center gap-3 px-3 py-3 rounded-[8px] text-[14px] font-semibold transition-all ${
    isCollapsed ? "justify-center px-0" : ""
  } bg-white text-[#0052cc] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]`;

  const inactiveLinkClass = `flex items-center gap-3 px-3 py-3 rounded-[8px] text-[14px] font-normal text-[#4f5f7b] hover:bg-white/60 transition-all text-left w-full ${
    isCollapsed ? "justify-center px-0" : ""
  }`;

  const disabledButtonClass = `flex items-center gap-3 px-3 py-3 rounded-[8px] text-[14px] font-normal text-[#4f5f7b] hover:bg-white/60 transition-all text-left w-full cursor-not-allowed opacity-60 ${
    isCollapsed ? "justify-center px-0" : ""
  }`;

  return (
    <aside
      className={`hidden lg:flex flex-col bg-[#f1f3ff] border-r border-[rgba(195,198,214,0.3)] shrink-0 transition-all duration-200 h-screen sticky top-0 ${
        isCollapsed ? "w-[72px]" : "w-64"
      }`}
      aria-label="Desktop Sidebar"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-[rgba(195,198,214,0.3)] shrink-0">
        <Image
          src="/assets/svg/brand/logo-taskly.svg"
          alt="Taskly Logo"
          width={18}
          height={20}
          className="shrink-0"
          priority
        />
        {!isCollapsed && (
          <span className="font-bold text-[20px] text-[#041b3c] tracking-[-0.5px]">
            TASKLY
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
        {/* Projects */}
        <Link
          href="/project"
          className={isProjectsActive ? activeLinkClass : inactiveLinkClass}
          title="Projects"
        >
          <Image
            src="/assets/svg/icons/icon-projects.svg"
            alt=""
            width={18}
            height={18}
            className="shrink-0"
            aria-hidden="true"
          />
          {!isCollapsed && <span>Projects</span>}
        </Link>

        {/* Project Epics */}
        {isProjectScoped ? (
          <Link
            href={`${projectBase}/epics`}
            className={isEpicsActive ? activeLinkClass : inactiveLinkClass}
            title="Project Epics"
          >
            <Image
              src="/assets/svg/icons/icon-epics.svg"
              alt=""
              width={20}
              height={18}
              className="shrink-0"
              aria-hidden="true"
            />
            {!isCollapsed && <span>Project Epics</span>}
          </Link>
        ) : (
          <button
            type="button"
            className={disabledButtonClass}
            title="Project Epics"
            disabled
          >
            <Image
              src="/assets/svg/icons/icon-epics.svg"
              alt=""
              width={20}
              height={18}
              className="shrink-0"
              aria-hidden="true"
            />
            {!isCollapsed && <span>Project Epics</span>}
          </button>
        )}

        {/* Project Tasks */}
        {isProjectScoped ? (
          <Link
            href={`${projectBase}/tasks`}
            className={isTasksActive ? activeLinkClass : inactiveLinkClass}
            title="Project Tasks"
          >
            <Image
              src="/assets/svg/icons/icon-tasks.svg"
              alt=""
              width={20}
              height={16}
              className="shrink-0"
              aria-hidden="true"
            />
            {!isCollapsed && <span>Project Tasks</span>}
          </Link>
        ) : (
          <button
            type="button"
            className={disabledButtonClass}
            title="Project Tasks"
            disabled
          >
            <Image
              src="/assets/svg/icons/icon-tasks.svg"
              alt=""
              width={20}
              height={16}
              className="shrink-0"
              aria-hidden="true"
            />
            {!isCollapsed && <span>Project Tasks</span>}
          </button>
        )}

        {/* Project Members */}
        {isProjectScoped ? (
          <Link
            href={`${projectBase}/members`}
            className={isMembersActive ? activeLinkClass : inactiveLinkClass}
            title="Project Members"
          >
            <Image
              src="/assets/svg/icons/icon-members.svg"
              alt=""
              width={22}
              height={16}
              className="shrink-0"
              aria-hidden="true"
            />
            {!isCollapsed && <span>Project Members</span>}
          </Link>
        ) : (
          <button
            type="button"
            className={disabledButtonClass}
            title="Project Members"
            disabled
          >
            <Image
              src="/assets/svg/icons/icon-members.svg"
              alt=""
              width={22}
              height={16}
              className="shrink-0"
              aria-hidden="true"
            />
            {!isCollapsed && <span>Project Members</span>}
          </button>
        )}

        {/* Project Details */}
        {isProjectScoped ? (
          <Link
            href={`${projectBase}/edit`}
            className={isDetailsActive ? activeLinkClass : inactiveLinkClass}
            title="Project Details"
          >
            <Image
              src="/assets/svg/icons/icon-details.svg"
              alt=""
              width={20}
              height={20}
              className="shrink-0"
              aria-hidden="true"
            />
            {!isCollapsed && <span>Project Details</span>}
          </Link>
        ) : (
          <button
            type="button"
            className={disabledButtonClass}
            title="Project Details"
            disabled
          >
            <Image
              src="/assets/svg/icons/icon-details.svg"
              alt=""
              width={20}
              height={20}
              className="shrink-0"
              aria-hidden="true"
            />
            {!isCollapsed && <span>Project Details</span>}
          </button>
        )}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[rgba(195,198,214,0.3)] flex flex-col gap-1 shrink-0">
        {/* Collapse / Expand Toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`flex items-center gap-3 px-3 py-3 rounded-[8px] text-[14px] font-semibold text-[#041b3c] hover:bg-white/60 transition-all text-left w-full ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Image
            src="/assets/svg/icons/icon-collapse.svg"
            alt=""
            width={12}
            height={20}
            className={`shrink-0 transition-transform duration-200 ${
              isCollapsed ? "" : "rotate-180"
            }`}
            aria-hidden="true"
          />
          {!isCollapsed && <span>Collapse</span>}
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className={`flex items-center gap-3 px-3 py-3 rounded-[8px] text-[14px] font-semibold text-[#d92d20] hover:bg-red-50/50 transition-all text-left w-full disabled:opacity-50 disabled:cursor-not-allowed ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
          title="Logout"
        >
          <Image
            src="/assets/svg/icons/icon-logout.svg"
            alt=""
            width={18}
            height={18}
            className="shrink-0"
            aria-hidden="true"
          />
          {!isCollapsed && (
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
