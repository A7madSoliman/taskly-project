"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProjectMobileBottomNavProps {
  projectId: string;
}

interface NavDestination {
  label: string;
  href: string;
  icon: string;
  iconWidth: number;
  iconHeight: number;
  isActive: (pathname: string, projectId: string) => boolean;
}

export function ProjectMobileBottomNav({
  projectId,
}: ProjectMobileBottomNavProps) {
  const pathname = usePathname() || "";

  const destinations: NavDestination[] = [
    {
      label: "Projects",
      href: "/project",
      icon: "/assets/svg/icons/icon-projects.svg",
      iconWidth: 20,
      iconHeight: 20,
      isActive: (path) => path === "/project",
    },
    {
      label: "Epics",
      href: `/project/${projectId}/epics`,
      icon: "/assets/svg/icons/icon-epics.svg",
      iconWidth: 20,
      iconHeight: 20,
      isActive: (path, id) =>
        path === `/project/${id}/epics` ||
        path.startsWith(`/project/${id}/epics/`),
    },
    {
      label: "Tasks",
      href: `/project/${projectId}/tasks`,
      icon: "/assets/svg/icons/icon-tasks.svg",
      iconWidth: 20,
      iconHeight: 20,
      isActive: (path, id) =>
        path === `/project/${id}/tasks` ||
        path.startsWith(`/project/${id}/tasks/`),
    },
    {
      label: "Members",
      href: `/project/${projectId}/members`,
      icon: "/assets/svg/icons/icon-members.svg",
      iconWidth: 22,
      iconHeight: 20,
      isActive: (path, id) =>
        path === `/project/${id}/members` ||
        path.startsWith(`/project/${id}/members/`),
    },
    {
      label: "Details",
      href: `/project/${projectId}/edit`,
      icon: "/assets/svg/icons/icon-details.svg",
      iconWidth: 20,
      iconHeight: 20,
      isActive: (path, id) =>
        path === `/project/${id}/edit` ||
        path.startsWith(`/project/${id}/edit/`),
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-[#e5e8f0] bg-white px-2 shadow-[0_-2px_10px_rgba(4,27,60,0.05)] lg:hidden"
    >
      {destinations.map((dest) => {
        const active = dest.isActive(pathname, projectId);
        return (
          <Link
            key={dest.label}
            href={dest.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] transition-colors ${
              active
                ? "font-bold text-[#0052cc]"
                : "font-semibold text-[#737685] hover:text-[#0052cc]"
            }`}
          >
            <Image
              src={dest.icon}
              alt=""
              width={dest.iconWidth}
              height={dest.iconHeight}
              aria-hidden="true"
              className={active ? "" : "opacity-70"}
            />
            <span>{dest.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
