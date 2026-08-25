import React from "react";
import Image from "next/image";
import { getInitials } from "@/lib/utils/avatar";

export interface NavbarProps {
  userName?: string;
  jobTitle?: string;
  onMenuClick: () => void;
}

export function Navbar({ userName, jobTitle, onMenuClick }: NavbarProps) {
  const initials = getInitials(userName);

  return (
    <header className="h-16 w-full bg-white border-b border-[rgba(195,198,214,0.3)] px-4 lg:px-8 flex items-center justify-between shrink-0 z-10">
      {/* Mobile left side: Hamburger toggle + TASKLY brand */}
      <div className="flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 -ml-2 text-[#041b3c] hover:bg-slate-100 rounded-md focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Image
            src="/assets/svg/icons/icon-mobile-menu.svg"
            alt=""
            width={18}
            height={12}
            className="shrink-0"
            aria-hidden="true"
          />
        </button>

        <div className="flex items-center gap-2">
          <Image
            src="/assets/svg/brand/logo-taskly.svg"
            alt="Taskly Logo"
            width={18}
            height={20}
            className="shrink-0"
            priority
          />
          <span className="font-bold text-[18px] text-neutral tracking-[-0.5px]">
            TASKLY
          </span>
        </div>
      </div>

      {/* Desktop left spacer (when sidebar is present) */}
      <div className="hidden lg:block" />

      {/* Right side: User info + Initials avatar */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="font-bold text-[14px] text-[#041b3c] leading-tight">
            {userName || "User"}
          </span>
          <span className="font-semibold text-[11px] text-[#4f5f7b] uppercase tracking-[0.5px]">
            {jobTitle || "WORKSPACE MEMBER"}
          </span>
        </div>

        <div
          className="w-10 h-10 rounded-full bg-[#0052cc] text-white font-bold text-[14px] flex items-center justify-center select-none shrink-0 shadow-sm"
          title={userName || "User"}
          aria-label={`User avatar: ${userName || "User"}`}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
