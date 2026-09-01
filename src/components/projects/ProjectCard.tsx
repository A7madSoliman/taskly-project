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
    <div className="relative bg-white rounded-[8px] border-2 border-[#c3c6d6] shadow-[0px_1px_3px_0px_rgba(4,27,60,0.05)] p-5 flex flex-col justify-between h-full min-h-[190px]">
      {/* Overlay Link for semantic, accessible card navigation */}
      <Link
        href={`/project/${project.id}/epics`}
        className="absolute inset-0 z-0 cursor-pointer rounded-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Open project ${project.name}`}
      />

      {/* TM-13 Edit Entry — independently actionable above the overlay Link */}
      <div className="absolute top-3 right-3 z-20 hidden md:block">
        <Link
          href={`/project/${project.id}/edit`}
          className="text-[12px] font-bold text-[#0052cc] hover:text-[#003d99] bg-white/90 rounded-[6px] px-3 py-1.5 border border-[rgba(0,82,204,0.2)] transition-colors focus:outline-none focus:underline"
        >
          Edit
        </Link>
      </div>
      <div className="absolute bottom-3 right-3 z-20 md:hidden">
        <Link
          href={`/project/${project.id}/edit`}
          className="text-[12px] font-bold text-[#0052cc] hover:text-[#003d99] bg-white/90 rounded-[6px] px-3 py-1.5 border border-[rgba(0,82,204,0.2)] transition-colors focus:outline-none focus:underline"
        >
          Edit
        </Link>
      </div>

      {/* Top Header & Content */}
      <div className="relative z-10 pointer-events-none">
        {/* Header */}
        <h2 className="text-[18px] font-semibold text-[#041b3c] leading-snug break-words mb-2">
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
