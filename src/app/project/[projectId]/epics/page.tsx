"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { EpicsService, ProjectEpic } from "@/services/api/epics.service";
import { ProjectsService } from "@/services/api/projects.service";
import { EpicCard, EpicCardSkeletonGrid } from "@/components/epics/EpicCard";
import {
  ChartNoAxesCombined,
  DraftingCompass,
  Grid3X3,
  Rocket,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

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
      <div className="mb-1 hidden text-[11px] font-bold uppercase tracking-[1px] text-slate-400 lg:block">
        Projects <span className="text-slate-300 mx-1">›</span> {projectName}{" "}
        <span className="text-slate-300 mx-1">›</span>{" "}
        <span className="text-[#0052cc]">Epics</span>
      </div>
      {/* Heading + search + CTA row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="hidden text-[30px] font-bold leading-[45px] tracking-[-0.5px] text-[#041b3c] lg:block">
          Project Epics
        </h1>
        <div className="flex w-full items-center gap-3 lg:w-auto lg:gap-8">
          {/* Inert search — visible per preserved design; TM-16 owns no
              search behavior: readOnly, no state, no handlers. */}
          <div className="relative w-full lg:hidden">
            <Image
              src="/assets/svg/icons/icon-search-magnifier.svg"
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Search Epics..."
              value=""
              readOnly
              aria-readonly="true"
              aria-label="Search epics (not available yet)"
              tabIndex={-1}
              className="h-12 w-full cursor-default rounded-[8px] bg-[#d7e2ff] pl-[58px] pr-4 text-[14px] text-[#041b3c] outline-none placeholder:text-[#7b8398]"
            />
          </div>
          <div className="relative hidden w-[303px] lg:block">
            <Image
              src="/assets/svg/icons/icon-search-magnifier.svg"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              type="text"
              placeholder="Search epics..."
              value=""
              readOnly
              aria-readonly="true"
              aria-label="Search epics (not available yet)"
              tabIndex={-1}
              className="h-12 w-full cursor-default rounded-[4px] bg-[#d7e2ff] pl-9 pr-3 text-[14px] text-[#041b3c] outline-none placeholder:text-[#5b6b8c]"
            />
          </div>
          <Link
            href={`/project/${projectId}/epics/new`}
            className="hidden h-12 shrink-0 items-center gap-2 rounded-[4px] bg-[#0052cc] px-[22px] text-[16px] font-semibold text-white transition-opacity hover:opacity-90 lg:flex"
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
      <div className="mx-auto w-full max-w-[1216px] px-2 pb-2 pt-4 lg:p-0">
        {status === "ready" && headerSection}

        {/* Loading — PRESERVED DESIGN (epics-loading-desktop): 6 skeleton
            cards in the same grid; mobile stacks via responsive grid. */}
        {status === "loading" && (
          <>
            <div className="hidden lg:block">
              <div className="h-4 w-44 animate-pulse rounded bg-[#eceef5]" />
              <div className="mt-4 flex items-center justify-between">
                <div className="h-10 w-64 animate-pulse rounded bg-[#e8ebf8]" />
                <div className="flex gap-4">
                  <div className="h-12 w-[128px] animate-pulse rounded bg-[#e8ebf8]" />
                  <div className="h-12 w-40 animate-pulse rounded bg-[#e8ebf8]" />
                </div>
              </div>
            </div>
            <div className="h-12 w-full animate-pulse rounded-[8px] bg-[#e8ebf8] lg:hidden" />
            <div className="mt-6 lg:mt-14">
              <EpicCardSkeletonGrid count={6} />
            </div>
          </>
        )}

        {/* Error — approved copy + Retry Connection; no reload/redirect */}
        {status === "error" && (
          <div className="flex min-h-[calc(100vh-128px)] flex-col items-center justify-center gap-3 text-center lg:translate-y-8">
            <h2 className="text-[20px] font-bold text-[#041b3c]">
              Something went wrong
            </h2>
            <p className="max-w-[320px] text-[16px] leading-6 text-[#4f5262]">
              We&apos;re having trouble retrieving your project epics right now.
              Please try again in a moment.
            </p>
            <button
              type="button"
              onClick={loadEpics}
              className="mt-2 flex h-11 items-center rounded-[4px] bg-[#0052cc] px-6 text-[16px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty — canonical four-tile composition, CTA, and benefit cards. */}
        {status === "empty" && (
          <div className="flex flex-col items-center pb-16 pt-8 text-center lg:pb-8 lg:pt-12">
            <div
              className="grid grid-cols-2 gap-2 rounded-[20px] border border-[#e1e6f3] bg-white p-3 shadow-[0_12px_32px_rgba(4,27,60,0.08)]"
              aria-hidden="true"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-[8px] bg-[#e8edff]">
                <Rocket
                  size={30}
                  strokeWidth={1.8}
                  className="text-[#0052cc]"
                />
              </span>
              <span className="flex h-16 w-16 items-center justify-center rounded-[8px] bg-[#f1f3ff]">
                <DraftingCompass
                  size={31}
                  strokeWidth={1.8}
                  className="text-[#003d9b]"
                />
              </span>
              <span className="flex h-16 w-16 items-center justify-center rounded-[8px] bg-[#f1f3ff]">
                <Grid3X3
                  size={29}
                  strokeWidth={1.7}
                  className="text-[#5b6b8c]"
                />
              </span>
              <Image
                src="/assets/svg/illustrations/illustration-empty-epics.svg"
                alt=""
                width={64}
                height={64}
              />
            </div>

            <h2 className="mt-8 text-[26px] font-bold leading-[34px] text-[#041b3c] lg:text-[30px] lg:leading-[38px]">
              No epics in this project yet.
            </h2>
            <p className="mt-3 max-w-md text-[16px] leading-6 text-[#4f5262] lg:text-[18px] lg:leading-[29px]">
              Break down your large project into manageable epics to track
              progress better and maintain architectural clarity.
            </p>
            <Link
              href={`/project/${projectId}/epics/new`}
              className="mt-7 flex h-12 items-center gap-2.5 rounded-[4px] bg-[#0052cc] px-7 text-[16px] font-semibold text-white shadow-[0_5px_12px_rgba(0,82,204,0.22)] transition-opacity hover:opacity-90 lg:h-[52px] lg:px-8"
            >
              <Zap
                size={18}
                strokeWidth={2}
                fill="currentColor"
                aria-hidden="true"
              />
              Create First Epic
            </Link>

            <div className="mt-12 grid w-full max-w-[936px] grid-cols-1 gap-4 text-left md:grid-cols-3 lg:mt-16 lg:gap-6">
              {[
                {
                  title: "High-Level Goals",
                  copy: "Define the broad objectives that span across multiple cycles.",
                  Icon: Sparkles,
                },
                {
                  title: "Hierarchy Design",
                  copy: "Link individual tasks to parent epics for a consolidated view.",
                  Icon: Workflow,
                },
                {
                  title: "Track Velocity",
                  copy: "Visualize percentage completion at a macro project level.",
                  Icon: ChartNoAxesCombined,
                },
              ].map(({ title, copy, Icon }) => (
                <article
                  key={title}
                  className="min-h-[184px] rounded-[8px] border border-[#e8ebf4] bg-[#f7f8ff] p-6"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#e3e9ff] text-[#0052cc]">
                    <Icon size={21} strokeWidth={1.9} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-[16px] font-semibold text-[#041b3c]">
                    {title}
                  </h3>
                  <p className="mt-2 max-w-[210px] text-[14px] leading-[21px] text-[#5d6578]">
                    {copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Ready — desktop 2-col grid / mobile single column (same grid) */}
        {status === "ready" && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-10 lg:grid-cols-2">
              {epics.map((epic) => (
                <EpicCard key={epic.id} epic={epic} />
              ))}
            </div>

            {/* Pagination — DISPLAY ONLY (TM-17 owns functionality).
                Real loaded data only; all controls inert/disabled.
                Styling grounded on reference.png: 30×30 controls, active
                page #003d9b, light-bordered squares with gray chevrons. */}
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
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-[3px] border border-[#e9eaf3] bg-[#f9f9ff] cursor-not-allowed"
                >
                  <Image
                    src="/assets/svg/icons/icon-pagination-left.svg"
                    alt=""
                    width={5}
                    height={7}
                    className="opacity-40 grayscale"
                    aria-hidden="true"
                  />
                </button>
                <span
                  aria-current="page"
                  className="flex h-[30px] min-w-[30px] items-center justify-center rounded-[3px] bg-[#003d9b] px-2 text-[13px] font-semibold text-white"
                >
                  1
                </span>
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label="Next page"
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-[3px] border border-[#e9eaf3] bg-[#f9f9ff] cursor-not-allowed"
                >
                  <Image
                    src="/assets/svg/icons/icon-pagination-right.svg"
                    alt=""
                    width={5}
                    height={7}
                    className="opacity-40 grayscale"
                    aria-hidden="true"
                  />
                </button>
              </nav>
            </div>
          </>
        )}

        {/* Mobile FAB — populated list navigation only. Empty state has its own CTA. */}
        {status === "ready" && (
          <Link
            href={`/project/${projectId}/epics/new`}
            aria-label="New Epic"
            className="fixed bottom-[100px] right-6 z-20 flex h-14 w-14 items-center justify-center rounded-[8px] bg-[#0052cc] shadow-[0px_4px_10px_0px_rgba(4,27,60,0.25)] transition-opacity hover:opacity-90 lg:hidden"
          >
            <Image
              src="/assets/svg/icons/icon-plus.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </AppShell>
  );
}
