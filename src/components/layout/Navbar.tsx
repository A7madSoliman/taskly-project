import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getInitials } from "@/lib/utils/avatar";

export interface NavbarProps {
  userName?: string;
  jobTitle?: string;
  onMenuClick: () => void;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export function Navbar({
  userName,
  jobTitle,
  onMenuClick,
  onLogout,
  isLoggingOut,
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(userName);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

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
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="font-bold text-[14px] text-[#041b3c] leading-tight">
            {userName || "User"}
          </span>
          <span className=" mt-0.5 text-[11px] font-bold uppercase leading-none tracking-[0.7px] text-[#0052cc]">
            {jobTitle || "WORKSPACE MEMBER"}
          </span>
        </div>

        <button
          type="button"
          className="cursor-pointer w-10 h-10 rounded-full bg-[#0052cc] text-white font-bold text-[14px] flex items-center justify-center select-none shrink-0 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0052cc] focus:ring-offset-2"
          title={userName || "User"}
          aria-label={isDropdownOpen ? "Close user menu" : "Open user menu"}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {initials}
        </button>

        {/* Avatar Dropdown */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 mt-2 w-48 bg-white border border-[rgba(195,198,214,0.3)] shadow-lg rounded-[8px] flex flex-col py-2 z-50">
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                if (onLogout) onLogout();
              }}
              disabled={isLoggingOut}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] font-semibold text-[#d92d20] hover:bg-red-50/50 w-full text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src="/assets/svg/icons/icon-logout.svg"
                alt=""
                width={18}
                height={18}
                className="shrink-0"
                aria-hidden="true"
              />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
