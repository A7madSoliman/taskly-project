import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getInitials } from "@/lib/utils/avatar";

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  jobTitle?: string;
}

export function MobileDrawer({
  isOpen,
  onClose,
  userName,
  jobTitle,
}: MobileDrawerProps) {
  if (!isOpen) return null;

  const initials = getInitials(userName);

  return (
    <div
      className="fixed inset-0 z-50 lg:hidden flex"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation Menu"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content container */}
      <div className="relative w-[280px] max-w-[85vw] bg-[#f1f3ff] h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Brand Header & Close */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[rgba(195,198,214,0.3)] shrink-0">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/svg/brand/logo-taskly.svg"
              alt="Taskly Logo"
              width={18}
              height={20}
              className="shrink-0"
              priority
            />
            <span className="font-bold text-[20px] text-[#041b3c] tracking-[-0.5px]">
              TASKLY
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1 rounded-md focus:outline-none"
            aria-label="Close navigation menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {/* Projects (Active) */}
          <Link
            href="/project"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-3 rounded-[8px] text-[14px] font-semibold bg-white text-[#0052cc] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
          >
            <Image
              src="/assets/svg/icons/icon-projects.svg"
              alt=""
              width={18}
              height={18}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>Projects</span>
          </Link>

          {/* Project Epics (Inactive) */}
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-3 rounded-[8px] text-[14px] font-normal text-[#4f5f7b] hover:bg-white/60 transition-all text-left w-full"
          >
            <Image
              src="/assets/svg/icons/icon-epics.svg"
              alt=""
              width={20}
              height={18}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>Project Epics</span>
          </button>

          {/* Project Tasks (Inactive) */}
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-3 rounded-[8px] text-[14px] font-normal text-[#4f5f7b] hover:bg-white/60 transition-all text-left w-full"
          >
            <Image
              src="/assets/svg/icons/icon-tasks.svg"
              alt=""
              width={20}
              height={16}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>Project Tasks</span>
          </button>

          {/* Project Members (Inactive) */}
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-3 rounded-[8px] text-[14px] font-normal text-[#4f5f7b] hover:bg-white/60 transition-all text-left w-full"
          >
            <Image
              src="/assets/svg/icons/icon-members.svg"
              alt=""
              width={22}
              height={16}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>Project Members</span>
          </button>

          {/* Project Details (Inactive) */}
          <button
            type="button"
            className="flex items-center gap-3 px-3 py-3 rounded-[8px] text-[14px] font-normal text-[#4f5f7b] hover:bg-white/60 transition-all text-left w-full"
          >
            <Image
              src="/assets/svg/icons/icon-details.svg"
              alt=""
              width={20}
              height={20}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>Project Details</span>
          </button>
        </nav>

        {/* Footer: User profile & Logout */}
        <div className="p-4 border-t border-[rgba(195,198,214,0.3)] flex flex-col gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0052cc] text-white font-bold text-[14px] flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-[14px] text-[#041b3c] truncate">
                {userName || "User"}
              </span>
              <span className="font-semibold text-[11px] text-[#4f5f7b] uppercase tracking-[0.5px] truncate">
                {jobTitle || "WORKSPACE MEMBER"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[14px] font-semibold text-[#d92d20] hover:bg-red-50/50 transition-all text-left w-full"
          >
            <Image
              src="/assets/svg/icons/icon-logout.svg"
              alt=""
              width={18}
              height={18}
              className="shrink-0"
              aria-hidden="true"
            />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
