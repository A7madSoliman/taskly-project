"use client";

import React from "react";
import Image from "next/image";
import { ProjectEpic } from "@/services/api/epics.service";

/**
 * TM-16 epic card unit (PRESERVED DESIGN, epics-list-desktop 45:2643 /
 * epics-list-mobile 51:2).
 *
 * Colors verified by direct pixel sampling of the preserved reference PNG
 * (PNG is primary visual authority; screen.json raw values conflicted and
 * were demoted to PRESERVED-METADATA FALLBACK):
 *   - left accent stripe: #004e32 (dark green)
 *   - epic badge: bg #82f9be, text #005235
 *   - assignee avatar fill: #65dca4 (mint)
 */

const CARD_BASE =
  "relative bg-white rounded-[8px] border border-[rgba(195,198,214,0.3)] " +
  "shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] overflow-hidden";

/** Left accent stripe (PRESERVED DESIGN — sampled #004e32 from reference.png). */
function AccentStripe() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-y-0 left-0 w-[3px] bg-[#004e32]"
    />
  );
}

/** Initials from a person name; empty string when no usable name exists. */
function getInitials(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

/** Stable en-GB day-month-year formatting, e.g. "22 Oct 2025" (TM-16 §14). */
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatCreatedDate(created_at: string): string | null {
  const date = new Date(created_at);
  if (Number.isNaN(date.getTime())) return null;
  return dateFormat.format(date);
}

export function EpicCard({ epic }: { epic: ProjectEpic }) {
  // Null-assignee contract (§11): omit the identity block entirely.
  const initials = getInitials(epic.assignee?.name);
  const createdDate = formatCreatedDate(epic.created_at);

  return (
    <div data-testid="epic-card" className={`${CARD_BASE} p-5 pl-6`}>
      <AccentStripe />

      {/* Badge + inert 3-dots */}
      <div className="flex items-start justify-between gap-3">
        {epic.epic_id ? (
          <span className="inline-block rounded-[2px] bg-[#82f9be] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#005235]">
            {epic.epic_id}
          </span>
        ) : null}
        <button
          type="button"
          aria-label="More options"
          tabIndex={-1}
          aria-disabled="true"
          className="p-1 pointer-events-none shrink-0"
        >
          <Image
            src="/assets/svg/icons/icon-more-options.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Title */}
      <h3 className="mt-3 text-[18px] font-semibold leading-snug text-[#041b3c] break-words">
        {epic.title}
      </h3>

      {/* Assignee block — omitted entirely when assignee is null */}
      {epic.assignee?.name ? (
        <div className="mt-4 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#65dca4] text-[12px] font-semibold text-[#041b3c]"
          >
            {initials || ""}
          </span>
          <span className="flex flex-col">
            <span className="text-[12px] font-medium text-[#041b3c]">
              {epic.assignee.name}
            </span>
            <span className="text-[10px] text-[#737685]">Assignee</span>
          </span>
        </div>
      ) : null}

      {/* Footer metadata row */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {/* Created-by (§12): omit the whole line when created_by is null */}
        {epic.created_by?.name ? (
          <span className="text-[12px] text-[#737685] truncate">
            Created by: {epic.created_by.name}
          </span>
        ) : null}
        {/* Created date only — TASK-AUTHORITY SEMANTIC ADAPTATION (§13):
            deadline is never rendered as the card date. */}
        {createdDate ? (
          <span className="flex items-center gap-1.5 text-[12px] text-[#737685]">
            <Image
              src="/assets/svg/icons/icon-calendar.svg"
              alt=""
              width={14}
              height={14}
              aria-hidden="true"
            />
            {createdDate}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Loading skeleton mirroring EpicCard anatomy (PRESERVED DESIGN,
 * epics-loading-desktop 51:719).
 */
export function EpicCardSkeleton() {
  return (
    <div
      data-testid="epic-card-skeleton"
      aria-hidden="true"
      className={`${CARD_BASE} p-5 pl-6`}
    >
      <AccentStripe />
      <div className="flex items-start justify-between">
        <div className="h-6 w-20 rounded-[2px] bg-[#eceef5] animate-pulse" />
        <div className="h-4 w-4 rounded-full bg-[#eceef5] animate-pulse" />
      </div>
      <div className="mt-4 h-4 w-3/4 rounded bg-[#eceef5] animate-pulse" />
      <div className="mt-5 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-[#eceef5] animate-pulse" />
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 rounded bg-[#eceef5] animate-pulse" />
          <div className="h-2.5 w-14 rounded bg-[#eceef5] animate-pulse" />
        </div>
      </div>
      <div className="mt-6 h-3 w-40 rounded bg-[#eceef5] animate-pulse" />
    </div>
  );
}

export function EpicCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <EpicCardSkeleton key={i} />
      ))}
    </div>
  );
}
