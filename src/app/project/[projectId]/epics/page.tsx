"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { EpicsService, ProjectEpic } from "@/services/api/epics.service";
import { ProjectsService } from "@/services/api/projects.service";
import { TasksService, TaskUpdatePatch } from "@/services/api/tasks.service";
import { EpicCard, EpicCardSkeletonGrid } from "@/components/epics/EpicCard";
import { EpicDetailsModal } from "@/components/epics/EpicDetailsModal";
import {
  TaskDetailsModal,
  TaskUpdateField,
  TaskUpdateResult,
} from "@/components/tasks/TaskDetailsModal";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { ProjectMobileBottomNav } from "@/components/layout/ProjectMobileBottomNav";
import {
  ChartNoAxesCombined,
  DraftingCompass,
  Grid3X3,
  Loader2,
  Rocket,
  RotateCw,
  Search,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

type EpicsStatus = "loading" | "error" | "empty" | "ready";

/**
 * TM-17 & TM-26 pagination & search contract.
 * Page size 6 (canonical Desktop design: 2 columns × 3 rows = 6).
 * Same chunk size used for Mobile infinite scroll.
 */
const PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_MS = 300;

export default function ProjectEpicsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const [status, setStatus] = useState<EpicsStatus>("loading");
  const [epics, setEpics] = useState<ProjectEpic[]>([]);
  const [projectName, setProjectName] = useState<string>("Project");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageTransitionLoading, setPageTransitionLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [isSearchPending, setIsSearchPending] = useState<boolean>(false);

  // Delete state
  const [epicToDelete, setEpicToDelete] = useState<ProjectEpic | null>(null);
  const [isDeletePending, setIsDeletePending] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deletePendingRef = useRef(false);
  const epicDeleteSeqRef = useRef(0);

  const handleEpicUpdated = useCallback((updatedEpic: ProjectEpic) => {
    setEpics((current) =>
      current.map((epic) =>
        epic.id === updatedEpic.id ? { ...epic, ...updatedEpic } : epic
      )
    );
  }, []);

  // Request guards & live-state mirrors
  const requestSeq = useRef(0);
  const pageLoadingRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const currentPageRef = useRef(1);
  const totalCountRef = useRef(0);
  const loadedCountRef = useRef(0);
  const loadMoreErrorRef = useRef(false);
  const projectIdRef = useRef(projectId);
  const prevProjectIdRef = useRef(projectId);
  const startedPageRef = useRef(1);
  const debouncedSearchTermRef = useRef(debouncedSearchTerm);
  const isSearchPendingRef = useRef(false);
  const isInitialMountRef = useRef(true);

  // Surviving project ownership transition
  useEffect(() => {
    if (prevProjectIdRef.current !== projectId) {
      prevProjectIdRef.current = projectId;
      epicDeleteSeqRef.current++;
      deletePendingRef.current = false;
      setIsDeletePending(false);
      setEpicToDelete(null);
      setDeleteError(null);
    }
  }, [projectId]);

  // True unmount-only invalidation
  useEffect(() => {
    const seqRef = epicDeleteSeqRef;
    return () => {
      seqRef.current++;
    };
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Keep live-state mirrors in sync
  useEffect(() => {
    projectIdRef.current = projectId;
    currentPageRef.current = currentPage;
    totalCountRef.current = totalCount;
    loadedCountRef.current = epics.length;
    loadMoreErrorRef.current = loadMoreError;
    projectIdRef.current = projectId;
    debouncedSearchTermRef.current = debouncedSearchTerm;
    isSearchPendingRef.current = isSearchPending;
  });

  // Breadcrumb metadata
  useEffect(() => {
    let isMounted = true;
    ProjectsService.getById(projectId).then(({ data }) => {
      if (isMounted && data) setProjectName(data.name);
    });
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Mobile detection
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Initial fetch / Search query change / Reconciliation
  const loadInitial = useCallback(
    async (
      queryToFetch?: string,
      isSearchTransition = false,
      deleteOwner?: { deleteGen: number; projectId: string; search: string }
    ): Promise<{
      outcome: "success" | "controlled-error" | "stale";
      total: number;
    }> => {
      const activeQuery = queryToFetch ?? debouncedSearchTermRef.current;
      const reqId = ++requestSeq.current;
      pageLoadingRef.current = false;
      loadingMoreRef.current = false;
      startedPageRef.current = 1;

      if (isSearchTransition) {
        setIsSearchPending(true);
        isSearchPendingRef.current = true;
      } else {
        setStatus("loading");
        setEpics([]);
        setTotalCount(0);
      }

      setCurrentPage(1);
      setPageTransitionLoading(false);
      setLoadingMore(false);
      setLoadMoreError(false);

      try {
        const { data, error, count } = await EpicsService.getByProject(
          projectId,
          { page: 1, limit: PAGE_SIZE, search: activeQuery }
        );
        if (reqId !== requestSeq.current) return { outcome: "stale", total: 0 };
        if (
          deleteOwner &&
          (epicDeleteSeqRef.current !== deleteOwner.deleteGen ||
            projectIdRef.current !== deleteOwner.projectId ||
            debouncedSearchTermRef.current !== deleteOwner.search)
        ) {
          return { outcome: "stale", total: 0 };
        }

        if (error) {
          setStatus("error");
          setIsSearchPending(false);
          isSearchPendingRef.current = false;
          return { outcome: "controlled-error", total: 0 };
        }
        const rows = data ?? [];
        const total = count ?? 0;
        setTotalCount(total);
        if (rows.length === 0 && total === 0) {
          setEpics([]);
          setStatus("empty");
        } else {
          setEpics(rows);
          setCurrentPage(1);
          setStatus("ready");
        }
        return { outcome: "success", total };
      } catch {
        if (reqId === requestSeq.current) {
          if (
            !deleteOwner ||
            (epicDeleteSeqRef.current === deleteOwner.deleteGen &&
              projectIdRef.current === deleteOwner.projectId &&
              debouncedSearchTermRef.current === deleteOwner.search)
          ) {
            setStatus("error");
            return { outcome: "controlled-error", total: 0 };
          }
        }
        return { outcome: "stale", total: 0 };
      } finally {
        if (reqId === requestSeq.current) {
          setIsSearchPending(false);
          isSearchPendingRef.current = false;
        }
      }
    },
    [projectId]
  );

  // Re-run on projectId or debouncedSearchTerm change.
  useEffect(() => {
    let isMounted = true;
    const currentGen = ++requestSeq.current;
    debouncedSearchTermRef.current = debouncedSearchTerm;

    const isSearchTransition = !isInitialMountRef.current;
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
    }

    const run = async () => {
      await Promise.resolve();
      if (!isMounted || currentGen !== requestSeq.current) return;
      await loadInitial(debouncedSearchTerm, isSearchTransition);
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [projectId, debouncedSearchTerm, loadInitial]);

  // Desktop page change / Reconciliation
  const goToPage = useCallback(
    async (
      page: number,
      deleteOwner?: { deleteGen: number; projectId: string; search: string }
    ): Promise<{
      outcome: "success" | "controlled-error" | "stale";
      total: number;
    }> => {
      if (pageLoadingRef.current && !deleteOwner) {
        return { outcome: "stale", total: totalCountRef.current };
      }
      const reqId = ++requestSeq.current;
      pageLoadingRef.current = true;
      setPageTransitionLoading(true);
      try {
        const { data, error, count } = await EpicsService.getByProject(
          projectId,
          {
            page,
            limit: PAGE_SIZE,
            search: debouncedSearchTermRef.current,
          }
        );
        if (reqId !== requestSeq.current) return { outcome: "stale", total: 0 };
        if (
          deleteOwner &&
          (epicDeleteSeqRef.current !== deleteOwner.deleteGen ||
            projectIdRef.current !== deleteOwner.projectId ||
            debouncedSearchTermRef.current !== deleteOwner.search)
        ) {
          return { outcome: "stale", total: 0 };
        }

        if (error) {
          setStatus("error");
          return { outcome: "controlled-error", total: 0 };
        }

        const rows = data ?? [];
        const total = count ?? 0;
        const calculatedTotalPages =
          total === 0 ? 0 : Math.ceil(total / PAGE_SIZE);

        if (total === 0) {
          setEpics([]);
          setTotalCount(0);
          setCurrentPage(1);
          setStatus("empty");
          return { outcome: "success", total: 0 };
        } else if (page > calculatedTotalPages && calculatedTotalPages >= 1) {
          // Fetch final valid page
          const finalPage = calculatedTotalPages;
          const corrResult = await EpicsService.getByProject(projectId, {
            page: finalPage,
            limit: PAGE_SIZE,
            search: debouncedSearchTermRef.current,
          });
          if (reqId !== requestSeq.current)
            return { outcome: "stale", total: 0 };
          if (
            deleteOwner &&
            (epicDeleteSeqRef.current !== deleteOwner.deleteGen ||
              projectIdRef.current !== deleteOwner.projectId ||
              debouncedSearchTermRef.current !== deleteOwner.search)
          ) {
            return { outcome: "stale", total: 0 };
          }

          if (corrResult.error) {
            setStatus("error");
            return { outcome: "controlled-error", total: 0 };
          }

          setEpics(corrResult.data ?? []);
          setTotalCount(corrResult.count ?? total);
          setCurrentPage(finalPage);
          setStatus("ready");
          return {
            outcome: "success",
            total: corrResult.count ?? total,
          };
        } else {
          setEpics(rows);
          setTotalCount(total);
          setCurrentPage(page);
          setStatus("ready");
          return { outcome: "success", total };
        }
      } catch {
        if (reqId === requestSeq.current) {
          if (
            !deleteOwner ||
            (epicDeleteSeqRef.current === deleteOwner.deleteGen &&
              projectIdRef.current === deleteOwner.projectId &&
              debouncedSearchTermRef.current === deleteOwner.search)
          ) {
            setStatus("error");
            return { outcome: "controlled-error", total: 0 };
          }
        }
        return { outcome: "stale", total: 0 };
      } finally {
        if (reqId === requestSeq.current) {
          pageLoadingRef.current = false;
          setPageTransitionLoading(false);
        }
      }
    },
    [projectId]
  );

  // Epics-origin task mutation coordinator
  const taskUpdateSeqRef = useRef<Record<string, Record<string, number>>>({});

  const handleEpicOriginTaskUpdate = useCallback(
    async (
      targetTaskId: string,
      field: TaskUpdateField,
      patch: TaskUpdatePatch
    ): Promise<TaskUpdateResult> => {
      // 1. Capture exact task UUID & project identity
      const capturedProjectId = projectIdRef.current;
      const capturedTaskId = targetTaskId;

      // 2. Track per-task per-field generation
      if (!taskUpdateSeqRef.current[capturedTaskId]) {
        taskUpdateSeqRef.current[capturedTaskId] = {};
      }
      const nextFieldSeq =
        (taskUpdateSeqRef.current[capturedTaskId][field] || 0) + 1;
      taskUpdateSeqRef.current[capturedTaskId][field] = nextFieldSeq;
      const fieldSeq = nextFieldSeq;

      try {
        // 3. Issue exactly ONE PATCH
        const { error: patchErr } = await TasksService.update(
          capturedTaskId,
          patch
        );
        if (patchErr) {
          return { outcome: "failure" };
        }

        // 4. Reject stale / project-changed / task-changed / unmounted results
        if (
          capturedProjectId !== projectIdRef.current ||
          fieldSeq !== taskUpdateSeqRef.current[capturedTaskId]?.[field]
        ) {
          return { outcome: "stale" };
        }

        // 5. Authoritative exact read-back
        const { data: updatedDetails, error: readBackErr } =
          await TasksService.getDetails(capturedProjectId, capturedTaskId);

        if (readBackErr || !updatedDetails) {
          return { outcome: "failure" };
        }

        // 6. Final stale check post read-back
        if (
          capturedProjectId !== projectIdRef.current ||
          fieldSeq !== taskUpdateSeqRef.current[capturedTaskId]?.[field]
        ) {
          return { outcome: "stale" };
        }

        // 7. Authoritative success
        return { outcome: "success", task: updatedDetails };
      } catch {
        return { outcome: "failure" };
      }
    },
    []
  );

  // Delete handlers
  const handleDeleteRequested = useCallback((epic: ProjectEpic) => {
    epicDeleteSeqRef.current++;
    deletePendingRef.current = false;
    setIsDeletePending(false);
    setEpicToDelete(epic);
    setDeleteError(null);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    if (deletePendingRef.current) return;
    epicDeleteSeqRef.current++;
    setEpicToDelete(null);
    setDeleteError(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!epicToDelete || deletePendingRef.current) return;

    const currentDeleteGen = ++epicDeleteSeqRef.current;
    deletePendingRef.current = true;
    setIsDeletePending(true);
    setDeleteError(null);

    const capturedOwner = {
      deleteGen: currentDeleteGen,
      targetUuid: epicToDelete.id,
      projectId: projectIdRef.current,
      search: debouncedSearchTermRef.current,
      page: currentPageRef.current,
    };

    try {
      const { error: deleteErr } = await EpicsService.delete(
        capturedOwner.targetUuid
      );
      if (currentDeleteGen !== epicDeleteSeqRef.current) return;

      if (deleteErr) {
        setDeleteError("Failed to delete epic. Please try again.");
        deletePendingRef.current = false;
        setIsDeletePending(false);
        return;
      }

      // Authoritative read-back verification: ensure record is absent
      const { data: readBackData, error: readBackErr } =
        await EpicsService.getDetails(
          capturedOwner.projectId,
          capturedOwner.targetUuid
        );
      if (currentDeleteGen !== epicDeleteSeqRef.current) return;

      if (readBackErr) {
        setDeleteError("Failed to delete epic. Please try again.");
        deletePendingRef.current = false;
        setIsDeletePending(false);
        return;
      }

      if (readBackData !== null) {
        // Record still exists - treat as delete failure / no-op
        setDeleteError("Failed to delete epic. Please try again.");
        deletePendingRef.current = false;
        setIsDeletePending(false);
        return;
      }

      // Verified successful deletion: Invalidate prior collection GET requests
      requestSeq.current++;

      if (selectedEpicId === capturedOwner.targetUuid) {
        setSelectedEpicId(null);
      }

      // Reconcile collection with joint ownership
      const deleteOwnerGuard = {
        deleteGen: capturedOwner.deleteGen,
        projectId: capturedOwner.projectId,
        search: capturedOwner.search,
      };

      let reconResult: {
        outcome: "success" | "controlled-error" | "stale";
        total: number;
      };

      if (isMobile) {
        // Mobile: reload stream from page 1
        reconResult = await loadInitial(
          capturedOwner.search,
          false,
          deleteOwnerGuard
        );
      } else {
        // Desktop: fetch current page or clamp using authoritative returned count
        reconResult = await goToPage(capturedOwner.page, deleteOwnerGuard);
      }

      if (reconResult.outcome === "stale") {
        // Stale generation: commit ZERO state writes
        return;
      }

      // After reconciliation attempt settles, verify delete owner is still current before closing
      if (
        epicDeleteSeqRef.current === capturedOwner.deleteGen &&
        projectIdRef.current === capturedOwner.projectId &&
        debouncedSearchTermRef.current === capturedOwner.search
      ) {
        setEpicToDelete(null);
        setDeleteError(null);
        deletePendingRef.current = false;
        setIsDeletePending(false);
      }
    } catch {
      if (currentDeleteGen === epicDeleteSeqRef.current) {
        setDeleteError("Failed to delete epic. Please try again.");
        deletePendingRef.current = false;
        setIsDeletePending(false);
      }
    }
  }, [epicToDelete, isMobile, selectedEpicId, goToPage, loadInitial]);

  // Mobile infinite scroll load-more
  const loadMore = useCallback(() => {
    if (loadingMoreRef.current) return;
    if (loadMoreErrorRef.current) return;
    if (isSearchPendingRef.current) return;
    if (loadedCountRef.current >= totalCountRef.current) return;
    const next = currentPageRef.current + 1;
    if (next <= startedPageRef.current) return;
    const reqId = ++requestSeq.current;
    startedPageRef.current = next;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(false);
    (async () => {
      try {
        const { data, error, count } = await EpicsService.getByProject(
          projectIdRef.current,
          {
            page: next,
            limit: PAGE_SIZE,
            search: debouncedSearchTermRef.current,
          }
        );
        if (reqId !== requestSeq.current) return;
        if (error) {
          startedPageRef.current = currentPageRef.current;
          setLoadMoreError(true);
          return;
        }
        const rows = data ?? [];
        const total = count ?? totalCountRef.current;
        setTotalCount(total);
        setEpics((current) => [...current, ...rows]);
        setCurrentPage(next);
      } catch {
        if (reqId === requestSeq.current) {
          startedPageRef.current = currentPageRef.current;
          setLoadMoreError(true);
        }
      } finally {
        if (reqId === requestSeq.current) {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        }
      }
    })();
  }, []);

  // Mobile observer callback ref
  const setSentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      const prev = sentinelRef.current as unknown as {
        __io?: IntersectionObserver;
      } | null;
      if (prev && prev.__io) prev.__io.disconnect();
      sentinelRef.current = node;
      if (!node || !isMobile) return;
      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) loadMore();
        },
        { rootMargin: "200px" }
      );
      (node as unknown as { __io?: IntersectionObserver }).__io = io;
      io.observe(node);
    },
    [isMobile, loadMore]
  );

  // Pagination range calculation (Restored TM-26 baseline algorithm)
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageNumbers = useMemo<(number | "...")[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);
    if (left > 2) pages.push("...");
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  const isSearchDebouncingOrLoading =
    searchTerm !== debouncedSearchTerm || isSearchPending;

  const headerSection = (
    <>
      {/* Breadcrumb */}
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[1px] text-slate-400">
        Projects <span className="mx-1 text-slate-300">›</span> {projectName}{" "}
        <span className="mx-1 text-slate-300">›</span>{" "}
        <span className="font-bold text-[#0052cc]">Epics</span>
      </div>

      {/* Title + Action bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-[30px] font-bold tracking-[-0.5px] text-[#041b3c]">
          Project Epics
        </h1>

        <div className="flex items-center gap-3">
          {/* Mobile Search input */}
          <div className="relative w-full lg:hidden">
            <Search
              size={18}
              strokeWidth={2}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b8398]"
            />
            {isSearchDebouncingOrLoading && (
              <Loader2
                size={16}
                aria-hidden="true"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-[#0052cc]"
              />
            )}
            <input
              type="text"
              placeholder="Search epics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search epics"
              className="h-12 w-full rounded-[8px] bg-[#d7e2ff] pl-[46px] pr-9 text-[14px] text-[#041b3c] outline-none placeholder:text-[#7b8398] focus-visible:ring-2 focus-visible:ring-[#0052cc]"
            />
          </div>

          {/* Desktop Search input */}
          <div className="relative hidden w-[303px] lg:block">
            <Search
              size={16}
              strokeWidth={2}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5b6b8c]"
            />
            {isSearchDebouncingOrLoading && (
              <Loader2
                size={16}
                aria-hidden="true"
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#0052cc]"
              />
            )}
            <input
              type="text"
              placeholder="Search epics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search epics"
              className="h-12 w-full rounded-[4px] bg-[#d7e2ff] pl-9 pr-9 text-[14px] text-[#041b3c] outline-none placeholder:text-[#5b6b8c] focus-visible:ring-2 focus-visible:ring-[#0052cc]"
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

  const pageBtnBase =
    "flex h-[30px] w-[30px] items-center justify-center rounded-[3px] border border-[#e9eaf3] bg-[#f9f9ff] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d9b] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 enabled:cursor-pointer";

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1216px] px-2 pb-40 pt-4 lg:p-0">
        {/* Render header whenever not initial project-wide loading, so search input is always accessible */}
        {headerSection}

        {/* Initial Loading skeleton state only (not search transitions) */}
        {status === "loading" && (
          <div className="mt-6 lg:mt-10">
            <EpicCardSkeletonGrid count={6} />
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="flex min-h-[calc(100vh-280px)] flex-col items-center justify-center gap-3 text-center lg:translate-y-8">
            <h2 className="text-[20px] font-bold text-[#041b3c]">
              {debouncedSearchTerm.trim().length > 0
                ? "Failed to search epics"
                : "Something went wrong"}
            </h2>
            <p className="max-w-[320px] text-[16px] leading-6 text-[#4f5262]">
              {debouncedSearchTerm.trim().length > 0
                ? "We encountered an error while searching project epics. Please try again."
                : "We're having trouble retrieving your project epics right now. Please try again in a moment."}
            </p>
            <button
              type="button"
              onClick={() => void loadInitial()}
              className="mt-2 flex h-11 cursor-pointer items-center gap-2 rounded-[4px] bg-[#0052cc] px-6 text-[16px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc]"
            >
              <RotateCw size={16} aria-hidden="true" />
              <span>
                {debouncedSearchTerm.trim().length > 0
                  ? "Retry Search"
                  : "Retry Connection"}
              </span>
            </button>
          </div>
        )}

        {/* Empty state — Search Empty vs Project Empty */}
        {status === "empty" && (
          <>
            {debouncedSearchTerm.trim().length > 0 ? (
              // B. Non-empty debounced query + zero filtered results
              <div className="flex min-h-[calc(100vh-280px)] flex-col items-center justify-center pb-16 pt-8 text-center lg:pb-8 lg:pt-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-[12px] bg-[#f0f4fd] text-[#0052cc]">
                  <Search size={32} strokeWidth={1.8} aria-hidden="true" />
                </div>
                <h2 className="mt-6 text-[24px] font-bold text-[#041b3c]">
                  No epics found matching your search
                </h2>
                <p className="mt-2 max-w-md text-[15px] leading-6 text-[#5d6578]">
                  We couldn&apos;t find any epics matching &ldquo;
                  <span className="font-semibold text-[#041b3c]">
                    {debouncedSearchTerm}
                  </span>
                  &rdquo;. Try searching with a different term or keyword.
                </p>
              </div>
            ) : (
              // A. Empty search query + zero project epics
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
                  No epics found for this project
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
                      className="flex flex-row items-start gap-4 rounded-[8px] border border-[#e8ebf4] bg-[#f7f8ff] p-4 md:flex-col md:min-h-[184px] md:p-6 md:gap-0"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#e3e9ff] text-[#0052cc]">
                        <Icon size={21} strokeWidth={1.9} aria-hidden="true" />
                      </span>
                      <div className="flex flex-col min-w-0 flex-1 md:mt-5">
                        <h3 className="text-[16px] font-semibold text-[#041b3c]">
                          {title}
                        </h3>
                        <p className="mt-1 md:mt-2 text-[14px] leading-[21px] text-[#5d6578]">
                          {copy}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Ready — desktop 2-col grid / mobile single column */}
        {status === "ready" && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-6 lg:mt-10 lg:grid-cols-2">
              {pageTransitionLoading ? (
                <EpicCardSkeletonGrid count={PAGE_SIZE} />
              ) : (
                epics.map((epic) => (
                  <EpicCard
                    key={epic.id}
                    epic={epic}
                    onOpenDetails={() => setSelectedEpicId(epic.id)}
                    onDeleteRequested={handleDeleteRequested}
                  />
                ))
              )}
            </div>

            {/* Desktop pagination */}
            <div className="hidden lg:flex mt-6 items-center justify-between">
              <span className="text-[13px] text-[#737685]">
                Showing {Math.min(currentPage * PAGE_SIZE, totalCount)} of{" "}
                {totalCount} epics
              </span>
              <nav aria-label="Pagination" className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={pageTransitionLoading || currentPage === 1}
                  aria-disabled={pageTransitionLoading || currentPage === 1}
                  aria-label="Previous page"
                  className={pageBtnBase}
                >
                  <Image
                    src="/assets/svg/icons/icon-pagination-left.svg"
                    alt=""
                    width={5}
                    height={7}
                    className={currentPage === 1 ? "opacity-40 grayscale" : ""}
                    aria-hidden="true"
                  />
                </button>
                {pageNumbers.map((p, i) =>
                  typeof p === "string" ? (
                    <span
                      key={`ellipsis-${i}`}
                      aria-hidden="true"
                      className="flex h-[30px] min-w-[30px] items-center justify-center text-[13px] text-[#737685]"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goToPage(p)}
                      disabled={pageTransitionLoading}
                      aria-disabled={pageTransitionLoading}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={`flex h-[30px] min-w-[30px] items-center justify-center rounded-[3px] px-2 text-[13px] font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003d9b] focus-visible:ring-offset-1 enabled:cursor-pointer disabled:cursor-not-allowed ${
                        p === currentPage
                          ? "bg-[#003d9b] text-white cursor-default"
                          : "border border-[#e9eaf3] bg-[#f9f9ff] text-[#041b3c]"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={pageTransitionLoading || currentPage === totalPages}
                  aria-disabled={
                    pageTransitionLoading || currentPage === totalPages
                  }
                  aria-label="Next page"
                  className={pageBtnBase}
                >
                  <Image
                    src="/assets/svg/icons/icon-pagination-right.svg"
                    alt=""
                    width={5}
                    height={7}
                    className={
                      currentPage === totalPages ? "opacity-40 grayscale" : ""
                    }
                    aria-hidden="true"
                  />
                </button>
              </nav>
            </div>

            {/* Mobile infinite-scroll sentinel + load-more treatment */}
            {isMobile && (
              <>
                <div
                  ref={setSentinelRef}
                  aria-hidden="true"
                  className="h-px w-full"
                />
                {loadingMore && (
                  <div className="mt-6">
                    <EpicCardSkeletonGrid count={2} />
                  </div>
                )}
                {loadMoreError && (
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        loadMoreErrorRef.current = false;
                        loadMore();
                      }}
                      className="flex h-11 cursor-pointer items-center rounded-[4px] bg-[#0052cc] px-6 text-[16px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc]"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Mobile FAB */}
        {!isSearchPending && status === "ready" && (
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

        {selectedEpicId ? (
          <EpicDetailsModal
            key={selectedEpicId}
            projectId={projectId}
            epicId={selectedEpicId}
            onClose={() => setSelectedEpicId(null)}
            onEpicUpdated={handleEpicUpdated}
            onSelectTask={(taskId) => {
              setSelectedEpicId(null);
              setSelectedTaskId(taskId);
            }}
          />
        ) : null}

        {selectedTaskId ? (
          <TaskDetailsModal
            key={selectedTaskId}
            projectId={projectId}
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
            onTaskUpdate={handleEpicOriginTaskUpdate}
          />
        ) : null}

        {/* Epic Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={Boolean(epicToDelete)}
          title="Delete Epic?"
          description="Deleting this epic will also permanently delete all tasks linked to it. This action cannot be undone."
          confirmLabel="Delete Epic"
          pendingLabel="Deleting..."
          error={deleteError}
          isPending={isDeletePending}
          onConfirm={handleDeleteConfirm}
          onClose={handleDeleteCancel}
        />

        {/* Mobile Fixed Bottom Navigation Bar */}
        <ProjectMobileBottomNav projectId={projectId} />
      </div>
    </AppShell>
  );
}
