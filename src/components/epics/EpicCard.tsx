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
      className="absolute inset-y-0 left-0 hidden w-[3px] bg-[#004e32] lg:block"
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
  // Null-assignee contract (§11): omit the identity block entirely;
  // content-driven layout lets the card collapse without blank gaps.
  const initials = getInitials(epic.assignee?.name);
  const createdDate = formatCreatedDate(epic.created_at);

  return (
    <div data-testid="epic-card" className={`${CARD_BASE} flex flex-col`}>
      <AccentStripe />

      {/* Body — grounded on epics-list-desktop.png: 16px top/side padding,
          badge h≈23px, badge→title ≈12px, title→assignee ≈16px. */}
      <div className="pl-5 pr-4 pt-4">
        {/* Badge + inert 3-dots (canonical icon is 4×16px, inset ~15px
            from top/right, aligned with the badge row) */}
        <div className="flex items-start justify-between">
          {epic.epic_id ? (
            <span className="inline-flex h-[23px] items-center rounded-[2px] bg-[#dae2ff] px-2.5 text-[10px] font-bold uppercase leading-[13px] tracking-wide text-[#003d9b] lg:bg-[#82f9be] lg:text-[#005235]">
              {epic.epic_id}
            </span>
          ) : null}
          <button
            type="button"
            aria-label="More options"
            tabIndex={-1}
            aria-disabled="true"
            className="-m-1 p-1 pointer-events-none shrink-0"
          >
            <Image
              src="/assets/svg/icons/icon-more-options.svg"
              alt=""
              width={4}
              height={16}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Title */}
        <h3 className="mt-[18px] text-[18px] font-semibold leading-snug text-[#041b3c] break-words">
          {epic.title}
        </h3>

        {/* Assignee block — omitted entirely when assignee is null */}
        {epic.assignee?.name ? (
          <div className="mt-4 mb-6 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0052cc] text-[10px] font-semibold text-white lg:h-10 lg:w-10 lg:bg-[#65dca4] lg:text-[12px] lg:text-[#041b3c]"
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
      </div>

      {/* Footer — PRESERVED DESIGN: subtle #f0f0f6 divider across the full
          card width, then a compact white metadata strip (created-by left,
          calendar + created-date right). */}
      <div className="mt-auto flex h-[50px] flex-wrap items-center justify-between gap-x-4 gap-y-1 border-[#f0f0f6] bg-white pl-5 pr-4 lg:border-t">
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
      className={`${CARD_BASE} flex flex-col`}
    >
      <AccentStripe />
      <div className="pl-5 pr-4 pt-4">
        <div className="flex items-start justify-between">
          <div className="h-[23px] w-20 animate-pulse rounded-[2px] bg-[#eceef5]" />
          <div className="h-4 w-1 animate-pulse rounded bg-[#eceef5]" />
        </div>
        <div className="mt-[18px] h-5 w-3/4 animate-pulse rounded bg-[#eceef5]" />
        <div className="mb-6 mt-4 flex items-center gap-3">
          <div className="h-7 w-7 animate-pulse rounded-full bg-[#eceef5] lg:h-10 lg:w-10" />
          <div className="flex flex-col gap-2">
            <div className="h-3 w-24 animate-pulse rounded bg-[#eceef5]" />
            <div className="h-2.5 w-14 animate-pulse rounded bg-[#eceef5]" />
          </div>
        </div>
      </div>
      <div className="mt-auto flex h-[50px] items-center justify-between border-[#f0f0f6] px-4 pl-5 lg:border-t">
        <div className="h-3 w-32 animate-pulse rounded bg-[#eceef5]" />
        <div className="h-3 w-20 animate-pulse rounded bg-[#eceef5]" />
      </div>
    </div>
  );
}

export function EpicCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <EpicCardSkeleton key={i} />
      ))}
    </div>
  );
}
