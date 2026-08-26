"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Link2, ListTodo, X } from "lucide-react";
import { EpicsService, ProjectEpic } from "@/services/api/epics.service";
import { getInitials } from "@/lib/utils/avatar";

interface EpicDetailsModalProps {
  projectId: string;
  epicId: string;
  onClose: () => void;
}

type DetailsStatus = "loading" | "ready" | "error";

const createdDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : createdDateFormat.format(date);
}

function DetailsSkeleton() {
  return (
    <div className="animate-pulse" aria-label="Loading epic details">
      <div className="h-[149px] rounded-[10px] border border-[#e3e7f1] bg-[#f5f6fb]" />
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-6">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index}>
            <div className="h-3 w-20 rounded bg-[#e8ebf3]" />
            <div className="mt-3 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-[#e1e6f2]" />
              <div className="h-4 w-24 rounded bg-[#e8ebf3]" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-11 h-6 w-28 rounded bg-[#e8ebf3]" />
      <div className="mt-7 h-[248px] rounded-[8px] border border-dashed border-[#d9deeb] bg-[#f1f3ff]" />
    </div>
  );
}

function Person({
  label,
  name,
  fallback,
  withChevron = false,
}: {
  label: string;
  name?: string | null;
  fallback: string;
  withChevron?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.25px] text-[#929bad]">
        {label}
      </p>
      <div
        className={`mt-2.5 flex min-h-7 items-center gap-2.5 ${
          withChevron ? "h-10 rounded-[8px] border border-[#cad8ff] px-2" : ""
        }`}
      >
        {name ? (
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0052cc] text-[10px] font-semibold text-white"
          >
            {getInitials(name)}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#041b3c]">
          {name || fallback}
        </span>
        {withChevron ? (
          <ChevronDown
            size={17}
            strokeWidth={1.8}
            aria-hidden="true"
            className="ml-auto shrink-0 text-[#67758d]"
          />
        ) : null}
      </div>
    </div>
  );
}

export function EpicDetailsModal({
  projectId,
  epicId,
  onClose,
}: EpicDetailsModalProps) {
  const [status, setStatus] = useState<DetailsStatus>("loading");
  const [epic, setEpic] = useState<ProjectEpic | null>(null);
  const requestSequence = useRef(0);

  const loadDetails = useCallback(async () => {
    const requestId = ++requestSequence.current;
    setStatus("loading");
    setEpic(null);

    const result = await EpicsService.getDetails(projectId, epicId);
    if (requestId !== requestSequence.current) return;

    if (result.error || !result.data) {
      setStatus("error");
      return;
    }

    setEpic(result.data);
    setStatus("ready");
  }, [epicId, projectId]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      await Promise.resolve();
      if (isMounted) await loadDetails();
    };
    run();
    return () => {
      isMounted = false;
      requestSequence.current += 1;
    };
  }, [loadDetails]);

  const createdDate = epic ? formatDate(epic.created_at) : null;
  const deadlineDate = epic?.deadline ? formatDate(epic.deadline) : null;
  const description = epic?.description?.trim() || "No description provided";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[rgba(85,105,143,0.34)] backdrop-blur-[2.5px]"
        aria-hidden="true"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="epic-details-title"
        className="relative z-10 flex max-h-[calc(100dvh-32px)] w-full max-w-[672px] flex-col overflow-hidden rounded-[8px] bg-white shadow-[0_24px_65px_rgba(4,27,60,0.28)] lg:h-[calc(100dvh-146px)] lg:max-h-[878px]"
      >
        <header className="shrink-0 border-b border-[#f0f1f6] bg-white px-6 pb-8 pt-7 sm:px-8 sm:pb-8 sm:pt-9">
          <div className="flex min-h-6 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2 text-[#0052cc]">
              <span
                aria-hidden="true"
                className="flex h-[14px] w-[20px] shrink-0 items-center gap-[3px]"
              >
                <span className="h-[10px] w-[6px] rounded-[2px] bg-[#0052cc]" />
                <span className="h-[14px] w-[7px] rounded-[2px] bg-[#003d9b]" />
              </span>
              {epic ? (
                <span className="truncate text-[13px] font-semibold tracking-[0.35px] text-[#60708b]">
                  {epic.epic_id}
                </span>
              ) : (
                <span className="h-3.5 w-20 animate-pulse rounded bg-[#e8ebf3]" />
              )}
            </div>

            <div className="flex shrink-0 items-center gap-4 sm:gap-6">
              <button
                type="button"
                aria-disabled="true"
                className="hidden cursor-default items-center gap-2 text-[14px] font-medium text-[#343b4c] sm:flex"
              >
                <Link2 size={16} strokeWidth={1.9} aria-hidden="true" />
                Copy link
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close epic details"
                className="-m-2 flex h-10 w-10 items-center justify-center rounded-[6px] text-[#67758d] transition-colors hover:bg-[#f1f3ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc]"
              >
                <X size={22} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
          </div>

          {epic ? (
            <h2
              id="epic-details-title"
              className="mt-5 flex min-h-[57px] items-center rounded-[10px] border border-[#cad8ff] px-3 text-[20px] font-bold leading-7 text-[#041b3c] sm:text-[21px]"
            >
              {epic.title}
            </h2>
          ) : (
            <div className="mt-5 flex h-[57px] items-center rounded-[10px] border border-[#e3e7f1] px-3">
              <span className="h-5 w-2/3 animate-pulse rounded bg-[#e8ebf3]" />
              <h2 id="epic-details-title" className="sr-only">
                Epic details
              </h2>
            </div>
          )}
        </header>

        <div className="min-h-0 overflow-y-auto px-6 pb-8 pt-8 [scrollbar-width:none] sm:px-8 sm:pb-8 [&::-webkit-scrollbar]:hidden">
          {status === "loading" ? <DetailsSkeleton /> : null}

          {status === "error" ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center px-4 text-center">
              <h3 className="text-[18px] font-semibold text-[#041b3c]">
                Unable to load epic details
              </h3>
              <p className="mt-2 max-w-[300px] text-[14px] leading-6 text-[#687287]">
                Please try the request again.
              </p>
              <button
                type="button"
                onClick={loadDetails}
                className="mt-5 h-10 rounded-[4px] bg-[#0052cc] px-5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] focus-visible:ring-offset-2"
              >
                Retry
              </button>
            </div>
          ) : null}

          {status === "ready" && epic ? (
            <>
              <div className="min-h-[149px] rounded-[10px] border border-[#cad8ff] px-3 py-3 text-[16px] leading-6 text-[#0c284c]">
                {description}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 border-b border-[#eef0f5] pb-7 sm:grid-cols-3 sm:gap-6 sm:border-b-0 sm:pb-0">
                <Person
                  label="Created by"
                  name={epic.created_by?.name}
                  fallback="Unavailable"
                />
                <Person
                  label="Assignee"
                  name={epic.assignee?.name}
                  fallback="Unassigned"
                  withChevron
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25px] text-[#929bad]">
                    Deadline
                  </p>
                  <div className="mt-2.5 flex h-10 items-center gap-2 rounded-[8px] border border-[#cad8ff] px-2 text-[#041b3c]">
                    <Image
                      src="/assets/svg/icons/icon-calendar.svg"
                      alt=""
                      width={15}
                      height={15}
                      aria-hidden="true"
                    />
                    <span className="truncate text-[12px] font-medium tracking-[-0.1px] sm:text-[14px] sm:tracking-normal">
                      {deadlineDate || "—"}
                    </span>
                    <ChevronDown
                      size={17}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="ml-auto shrink-0 text-[#67758d]"
                    />
                  </div>
                </div>
                <div className="min-w-0 sm:col-start-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25px] text-[#929bad]">
                    Created at
                  </p>
                  <div className="mt-2.5 flex min-h-7 items-center gap-2">
                    <Image
                      src="/assets/svg/icons/icon-calendar.svg"
                      alt=""
                      width={15}
                      height={15}
                      aria-hidden="true"
                    />
                    <span className="text-[14px] font-medium text-[#041b3c]">
                      {createdDate || "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between gap-4">
                <h3 className="text-[19px] font-semibold text-[#041b3c]">
                  <span className="sm:hidden">Tasks</span>
                  <span className="hidden sm:inline">Epic Tasks</span>
                </h3>
                <span className="rounded-full bg-[#dbe4ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2px] text-[#4f5f7b] sm:hidden">
                  0 Tasks
                </span>
                <button
                  type="button"
                  aria-disabled="true"
                  className="hidden cursor-default text-[14px] font-semibold text-[#0052cc] sm:block"
                >
                  + Add Task
                </button>
              </div>

              <div className="mt-6 flex min-h-[248px] flex-col items-center justify-center rounded-[8px] border border-dashed border-[#d9deeb] bg-[#f1f3ff] px-5 py-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#d7e2ff] text-[#7f91b6]">
                  <ListTodo size={23} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <p className="mt-4 text-[16px] font-medium leading-6 text-[#041b3c]">
                  No tasks have been added to this epic yet
                </p>
                <button
                  type="button"
                  aria-disabled="true"
                  className="mt-4 flex h-11 cursor-default items-center gap-2 rounded-[2px] bg-[#0052cc] px-6 text-[16px] font-semibold text-white shadow-[0_3px_8px_rgba(0,82,204,0.18)]"
                >
                  <Image
                    src="/assets/svg/icons/icon-plus.svg"
                    alt=""
                    width={16}
                    height={16}
                    aria-hidden="true"
                  />
                  Add Task
                </button>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
}
