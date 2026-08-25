import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Project } from "@/services/api/projects.service";

export function formatProjectDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formattedDate = formatProjectDate(project.created_at);

  return (
    <div className="relative bg-white rounded-[8px] border border-[rgba(195,198,214,0.3)] shadow-[0px_1px_3px_0px_rgba(4,27,60,0.05)] p-5 flex flex-col justify-between h-full min-h-[190px]">
      {/* Overlay Link for semantic, accessible card navigation */}
      <Link
        href={`/project/${project.id}/epics`}
        className="absolute inset-0 z-0 cursor-pointer rounded-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Open project ${project.name}`}
      />

      {/* Top Header & Content */}
      <div className="relative z-10 pointer-events-none">
        {/* Mobile Header with 3-dots actions (Visual only, interactive sibling layered above overlay) */}
        <div className="flex items-start justify-between gap-2 md:hidden mb-2">
          <h2 className="text-[18px] font-semibold text-[#041b3c] leading-snug break-words">
            {project.name}
          </h2>
          <button
            type="button"
            className="text-[#737685] p-1 shrink-0 -mr-1 hover:text-[#041b3c] transition-colors pointer-events-auto"
            aria-label="Project actions"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Image
              src="/assets/svg/icons/icon-vertical-actions.svg"
              alt=""
              width={4}
              height={16}
              className="w-1 h-4"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Desktop Header */}
        <h2 className="hidden md:block text-[18px] font-semibold text-[#041b3c] leading-snug break-words mb-2">
          {project.name}
        </h2>

        {/* Description (Nullable Safe) */}
        {project.description && (
          <p className="text-[14px] text-[#434654] leading-[22px] line-clamp-3 mb-4">
            {project.description}
          </p>
        )}
      </div>

      {/* Footers */}
      <div className="relative z-10 pointer-events-none mt-auto pt-3 border-t border-[rgba(195,198,214,0.2)]">
        {/* Desktop Metadata Footer */}
        <div className="hidden md:flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#737685] tracking-wider uppercase">
            CREATED AT
          </span>
          <span className="text-[12px] font-medium text-[#041b3c]">
            {formattedDate}
          </span>
        </div>

        {/* Mobile Metadata Footer */}
        <div className="flex md:hidden items-center gap-2 text-[12px] font-medium text-[#041b3c]">
          <Image
            src="/assets/svg/icons/icon-calendar.svg"
            alt=""
            width={16}
            height={16}
            className="w-4 h-4 text-primary"
            aria-hidden="true"
          />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}

export function AddProjectCard() {
  return (
    <Link
      href="/project/add"
      className="group bg-white/40 hover:bg-white rounded-[8px] border-2 border-dashed border-[rgba(195,198,214,0.5)] hover:border-primary p-5 flex flex-col items-center justify-center text-center transition-all min-h-[190px] h-full"
    >
      <div className="w-10 h-10 rounded-[8px] bg-[#0052cc]/5 group-hover:bg-[#0052cc]/10 flex items-center justify-center mb-3 transition-colors">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0052cc"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      </div>
      <span className="text-[12px] font-bold tracking-wider text-[#041b3c] group-hover:text-primary transition-colors uppercase">
        ADD PROJECT
      </span>
    </Link>
  );
}
