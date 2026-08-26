"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { EpicsService, ProjectEpic } from "@/services/api/epics.service";
import { ProjectsService } from "@/services/api/projects.service";
import { EpicCard, EpicCardSkeletonGrid } from "@/components/epics/EpicCard";

type EpicsStatus = "loading" | "error" | "empty" | "ready";

export default function ProjectEpicsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const [status, setStatus] = useState<EpicsStatus>("loading");
  const [epics, setEpics] = useState<ProjectEpic[]>([]);
  const [projectName, setProjectName] = useState<string>("Project");

  // Breadcrumb metadata only — failure must not corrupt the epics data (§33).
  useEffect(() => {
    let isMounted = true;
    ProjectsService.getById(projectId).then(({ data }) => {
      if (isMounted && data) setProjectName(data.name);
    });
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const loadEpics = useCallback(async () => {
    try {
      const { data, error } = await EpicsService.getByProject(projectId);
      if (error) {
        setStatus("error");
        return;
      }
      if (!data || data.length === 0) {
        setEpics([]);
        setStatus("empty");
        return;
      }
      setEpics(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [projectId]);

  // Initial fetch + refetch whenever projectId changes (§32).
  // Loading is the render-phase default state; setState only happens in
  // async callbacks (consistent with the members page lint pattern).
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;
      await loadEpics();
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [loadEpics]);

  const headerSection = (
    <>
      {/* Breadcrumb */}
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-2">
        Projects <span className="text-slate-300 mx-1">›</span> {projectName}{" "}
        <span className="text-slate-300 mx-1">›</span> Epics
      </div>
      {/* Heading + search + CTA row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-[30px] font-bold text-[#041b3c] tracking-[-0.5px]">
          Project Epics
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Inert search — visible per preserved design; TM-16 owns no
              search behavior: readOnly, no state, no handlers. */}
          <div className="relative w-full sm:w-[240px]">
            <Image
              src="/assets/svg/icons/icon-search-magnifier.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search epics..."
              value=""
              readOnly
              aria-readonly="true"
              aria-label="Search epics (not available yet)"
              tabIndex={-1}
              className="w-full h-[40px] rounded-[4px] bg-[#d7e2ff] pl-9 pr-3 text-[14px] text-[#041b3c] placeholder:text-[#5b6b8c] outline-none cursor-default"
            />
          </div>
          <Link
            href={`/project/${projectId}/epics/new`}
            className="flex h-[40px] items-center gap-2 rounded-[4px] bg-[#0052cc] px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
          >
            <Image
              src="/assets/svg/icons/icon-plus.svg"
              alt=""
              width={14}
              height={14}
              aria-hidden="true"
            />
            New Epic
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <AppShell>
      <div className="w-full max-w-[1216px] mx-auto py-2">
        {headerSection}

        {/* Loading — PRESERVED DESIGN (epics-loading-desktop): 6 skeleton
            cards in the same grid; mobile stacks via responsive grid. */}
        {status === "loading" && (
          <div className="mt-6">
            <EpicCardSkeletonGrid count={6} />
          </div>
        )}

        {/* Error — approved copy + Retry Connection; no reload/redirect */}
        {status === "error" && (
          <div className="mt-6 p-10 flex flex-col items-center text-center gap-3 bg-white rounded-lg border border-[rgba(195,198,214,0.3)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)]">
            <h2 className="text-[20px] font-bold text-[#041b3c]">
              Something went wrong
            </h2>
            <p className="text-[14px] text-[#737685] max-w-md">
              We&apos;re having trouble retrieving your project epics right now.
              Please try again in a moment.
            </p>
            <button
              type="button"
              onClick={loadEpics}
              className="mt-2 rounded-[4px] bg-[#0052cc] px-6 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty — preserved illustration + approved copy + create CTA */}
        {status === "empty" && (
          <div className="mt-6 p-10 flex flex-col items-center text-center gap-4">
            <Image
              src="/assets/svg/illustrations/illustration-empty-epics.svg"
              alt=""
              width={160}
              height={160}
              priority
            />
            <h2 className="text-[22px] font-bold text-[#041b3c] mt-2">
              No epics in this project yet.
            </h2>
            <p className="text-[14px] text-[#737685] max-w-md">
              Break down your large project into manageable epics to track
              progress better and maintain architectural clarity.
            </p>
            <Link
              href={`/project/${projectId}/epics/new`}
              className="mt-2 flex h-[44px] items-center gap-2 rounded-[4px] bg-[#0052cc] px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Create First Epic
            </Link>
          </div>
        )}

        {/* Ready — desktop 2-col grid / mobile single column (same grid) */}
        {status === "ready" && (
          <>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {epics.map((epic) => (
                <EpicCard key={epic.id} epic={epic} />
              ))}
            </div>

            {/* Pagination — DISPLAY ONLY (TM-17 owns functionality).
                Real loaded data only; all controls inert/disabled. */}
            <div className="hidden lg:flex mt-6 items-center justify-between">
              <span className="text-[13px] text-[#737685]">
                Showing {epics.length} of {epics.length} epics
              </span>
              <nav
                aria-label="Pagination (coming soon)"
                className="flex items-center gap-2"
              >
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label="Previous page"
                  className="p-2 opacity-50 cursor-not-allowed"
                >
                  <Image
                    src="/assets/svg/icons/icon-pagination-left.svg"
                    alt=""
                    width={16}
                    height={16}
                    aria-hidden="true"
                  />
                </button>
                <span
                  aria-current="page"
                  className="flex h-8 min-w-8 items-center justify-center rounded-[4px] bg-[#041b3c] px-2 text-[13px] font-semibold text-white"
                >
                  1
                </span>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label="Next page"
                  className="p-2 opacity-50 cursor-not-allowed"
                >
                  <Image
                    src="/assets/svg/icons/icon-pagination-right.svg"
                    alt=""
                    width={16}
                    height={16}
                    aria-hidden="true"
                  />
                </button>
              </nav>
            </div>
          </>
        )}

        {/* Mobile FAB — functional navigation to create route (TM-16 owns) */}
        <Link
          href={`/project/${projectId}/epics/new`}
          aria-label="New Epic"
          className="lg:hidden fixed bottom-20 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#0052cc] shadow-[0px_4px_10px_0px_rgba(4,27,60,0.25)] transition-opacity hover:opacity-90"
        >
          <Image
            src="/assets/svg/icons/icon-plus.svg"
            alt=""
            width={20}
            height={20}
            aria-hidden="true"
          />
        </Link>
      </div>
    </AppShell>
  );
}
