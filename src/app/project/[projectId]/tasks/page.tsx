"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCw,
  Search,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectsService } from "@/services/api/projects.service";
import {
  TasksService,
  BoardTask,
  TaskStatus,
  TaskUpdatePatch,
} from "@/services/api/tasks.service";
import { TaskColumn } from "@/components/tasks/TaskColumn";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskRow } from "@/components/tasks/TaskRow";
import {
  TaskDetailsModal,
  TaskUpdateField,
  TaskUpdateResult,
} from "@/components/tasks/TaskDetailsModal";
import { DeleteConfirmationModal } from "@/components/ui/DeleteConfirmationModal";
import { ProjectMobileBottomNav } from "@/components/layout/ProjectMobileBottomNav";

const PAGE_SIZE = 10;

const BOARD_COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "TO_DO", label: "TO DO" },
  { status: "IN_PROGRESS", label: "IN PROGRESS" },
  { status: "BLOCKED", label: "BLOCKED" },
  { status: "IN_REVIEW", label: "IN REVIEW" },
  { status: "READY_FOR_QA", label: "READY FOR QA" },
  { status: "REOPENED", label: "REOPENED" },
  { status: "READY_FOR_PRODUCTION", label: "READY FOR PRODUCTION" },
  { status: "DONE", label: "DONE" },
];

export default function ProjectTasksPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params?.projectId as string;
  const viewParam = searchParams.get("view") || "board";

  const [projectName, setProjectName] = useState("Project");
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // --- Search State (Page-Local) ---
  const [searchInput, setSearchInput] = useState<string>("");
  const [inputSearchGen, setInputSearchGen] = useState<number>(0);
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [activeSearchGen, setActiveSearchGen] = useState<number>(0);
  const searchRequestSeqRef = useRef<number>(0);
  const searchTermRef = useRef<string>("");

  // --- Desktop List State ---
  const [listTasks, setListTasks] = useState<BoardTask[]>([]);
  const [listTotalCount, setListTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [requestedPage, setRequestedPage] = useState<number>(1);
  const [listLoading, setListLoading] = useState<boolean>(true);
  const [listError, setListError] = useState<boolean>(false);

  // --- Desktop Board State ---
  const [boardTasks, setBoardTasks] = useState<Record<TaskStatus, BoardTask[]>>(
    {
      TO_DO: [],
      IN_PROGRESS: [],
      BLOCKED: [],
      IN_REVIEW: [],
      READY_FOR_QA: [],
      REOPENED: [],
      READY_FOR_PRODUCTION: [],
      DONE: [],
    }
  );
  const [boardTotalCounts, setBoardTotalCounts] = useState<
    Record<TaskStatus, number>
  >({
    TO_DO: 0,
    IN_PROGRESS: 0,
    BLOCKED: 0,
    IN_REVIEW: 0,
    READY_FOR_QA: 0,
    REOPENED: 0,
    READY_FOR_PRODUCTION: 0,
    DONE: 0,
  });
  const [boardPageIndex, setBoardPageIndex] = useState<
    Record<TaskStatus, number>
  >({
    TO_DO: 0,
    IN_PROGRESS: 0,
    BLOCKED: 0,
    IN_REVIEW: 0,
    READY_FOR_QA: 0,
    REOPENED: 0,
    READY_FOR_PRODUCTION: 0,
    DONE: 0,
  });
  const [boardLoadingInitial, setBoardLoadingInitial] = useState<
    Record<TaskStatus, boolean>
  >({
    TO_DO: true,
    IN_PROGRESS: true,
    BLOCKED: true,
    IN_REVIEW: true,
    READY_FOR_QA: true,
    REOPENED: true,
    READY_FOR_PRODUCTION: true,
    DONE: true,
  });
  const [boardErrorInitial, setBoardErrorInitial] = useState<
    Record<TaskStatus, boolean>
  >({
    TO_DO: false,
    IN_PROGRESS: false,
    BLOCKED: false,
    IN_REVIEW: false,
    READY_FOR_QA: false,
    REOPENED: false,
    READY_FOR_PRODUCTION: false,
    DONE: false,
  });
  const [boardInitialSuccessGen, setBoardInitialSuccessGen] = useState<
    Record<TaskStatus, number | null>
  >({
    TO_DO: null,
    IN_PROGRESS: null,
    BLOCKED: null,
    IN_REVIEW: null,
    READY_FOR_QA: null,
    REOPENED: null,
    READY_FOR_PRODUCTION: null,
    DONE: null,
  });
  const [boardLoadingMore, setBoardLoadingMore] = useState<
    Record<TaskStatus, boolean>
  >({
    TO_DO: false,
    IN_PROGRESS: false,
    BLOCKED: false,
    IN_REVIEW: false,
    READY_FOR_QA: false,
    REOPENED: false,
    READY_FOR_PRODUCTION: false,
    DONE: false,
  });
  const [boardErrorMore, setBoardErrorMore] = useState<
    Record<TaskStatus, boolean>
  >({
    TO_DO: false,
    IN_PROGRESS: false,
    BLOCKED: false,
    IN_REVIEW: false,
    READY_FOR_QA: false,
    REOPENED: false,
    READY_FOR_PRODUCTION: false,
    DONE: false,
  });

  // --- Mobile State ---
  const [mobileTasks, setMobileTasks] = useState<BoardTask[]>([]);
  const [mobileLoadingInitial, setMobileLoadingInitial] =
    useState<boolean>(true);
  const [mobileLoadingMore, setMobileLoadingMore] = useState<boolean>(false);
  const [mobileError, setMobileError] = useState<boolean>(false);
  const [mobileAllExhausted, setMobileAllExhausted] = useState<boolean>(false);

  // --- Mobile Mutable State Refs (Breaks callback/effect dependency cycle) ---
  const activeMobileStatusIndexRef = useRef<number>(0);
  const mobileStatusPageIndexRef = useRef<number>(0);
  const mobileStatusLoadedCountRef = useRef<number>(0);

  // --- Sequence Refs & In-Flight Guarding ---
  const listSeqRef = useRef<number>(0);
  const boardSeqRef = useRef<Record<TaskStatus, number>>({
    TO_DO: 0,
    IN_PROGRESS: 0,
    BLOCKED: 0,
    IN_REVIEW: 0,
    READY_FOR_QA: 0,
    REOPENED: 0,
    READY_FOR_PRODUCTION: 0,
    DONE: 0,
  });
  const boardInFlightRef = useRef<Record<TaskStatus, boolean>>({
    TO_DO: false,
    IN_PROGRESS: false,
    BLOCKED: false,
    IN_REVIEW: false,
    READY_FOR_QA: false,
    REOPENED: false,
    READY_FOR_PRODUCTION: false,
    DONE: false,
  });
  const mobileSeqRef = useRef<number>(0);
  const mobileInFlightRef = useRef<boolean>(false);

  // --- TM-27 & TM-30 Mutation Tracking Refs ---
  const [boardDragPending, setBoardDragPending] = useState<boolean>(false);
  const [boardDragError, setBoardDragError] = useState<string | null>(null);
  const pendingMutationRef = useRef<boolean>(false);
  const pendingMoveStatusesRef = useRef<Set<TaskStatus>>(new Set());
  const boardMutationSeqRef = useRef<number>(0);
  const taskStatusMutationSeqRef = useRef<Record<string, number>>({});
  const taskUpdateSeqRef = useRef<Record<string, Record<string, number>>>({});

  // --- Task Delete State (Shared by Desktop List TaskRow and Mobile TaskCard) ---
  const [taskToDelete, setTaskToDelete] = useState<BoardTask | null>(null);
  const [isDeletePending, setIsDeletePending] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const activeDeleteOwnerRef = useRef<{
    taskId: string;
    deleteGen: number;
    pending: boolean;
  }>({
    taskId: "",
    deleteGen: 0,
    pending: false,
  });
  const taskDeleteSeqRef = useRef<Record<string, number>>({});

  const projectIdRef = useRef(projectId);
  const modeRef = useRef<"board" | "list" | "mobile" | null>(null);
  const prevOwnerRef = useRef<{
    projectId: string;
    mode: "board" | "list" | "mobile" | null;
  }>({ projectId, mode: null });
  const currentPageRef = useRef(currentPage);

  useEffect(() => {
    projectIdRef.current = projectId;
    currentPageRef.current = currentPage;
  });

  // --- Search Input & Debounce Handling ---
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    // Immediate Stale-Query Invalidation on EVERY user keystroke
    const nextGen = ++searchRequestSeqRef.current;
    setInputSearchGen(nextGen);
    searchTermRef.current = value.trim();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setActiveSearchGen(searchRequestSeqRef.current);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchInput]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      keyboardCodes: {
        start: ["Space"],
        cancel: ["Escape"],
        end: ["Space"],
      },
    })
  );

  const fetchBoardColumnInitial = useCallback(
    async (
      status: TaskStatus,
      deleteOwner?: {
        targetUuid: string;
        deleteGen: number;
        projectId: string;
        mode: "board" | "list" | "mobile" | null;
        status: TaskStatus;
        searchGen: number;
        searchTerm: string;
      },
      overrideSearch?: string
    ): Promise<{
      outcome: "success" | "controlled-error" | "stale";
      total: number;
    }> => {
      const activeSearch =
        overrideSearch !== undefined
          ? overrideSearch
          : deleteOwner
            ? deleteOwner.searchTerm
            : debouncedSearch;
      const capturedSearchGen = deleteOwner
        ? deleteOwner.searchGen
        : searchRequestSeqRef.current;
      const capturedSearchTerm = activeSearch;
      const capturedProjectId = projectId;
      const seq = ++boardSeqRef.current[status];
      boardInFlightRef.current[status] = true;

      setBoardLoadingInitial((prev) => ({ ...prev, [status]: true }));
      setBoardErrorInitial((prev) => ({ ...prev, [status]: false }));
      setBoardErrorMore((prev) => ({ ...prev, [status]: false }));
      setBoardInitialSuccessGen((prev) => ({ ...prev, [status]: null }));

      try {
        const { data, count, error } =
          await TasksService.getByProjectStatusPaginated(
            capturedProjectId,
            status,
            0,
            PAGE_SIZE - 1,
            capturedSearchTerm
          );
        if (
          seq !== boardSeqRef.current[status] ||
          capturedSearchGen !== searchRequestSeqRef.current ||
          capturedProjectId !== projectIdRef.current ||
          modeRef.current !== "board"
        ) {
          return { outcome: "stale", total: 0 };
        }
        if (
          deleteOwner &&
          (taskDeleteSeqRef.current[deleteOwner.targetUuid] !==
            deleteOwner.deleteGen ||
            projectIdRef.current !== deleteOwner.projectId ||
            modeRef.current !== deleteOwner.mode ||
            deleteOwner.status !== status)
        ) {
          return { outcome: "stale", total: 0 };
        }

        if (error) {
          setBoardErrorInitial((prev) => ({ ...prev, [status]: true }));
          setBoardInitialSuccessGen((prev) => ({ ...prev, [status]: null }));
          return { outcome: "controlled-error", total: 0 };
        } else {
          const total = count ?? 0;
          setBoardTasks((prev) => ({ ...prev, [status]: data ?? [] }));
          setBoardTotalCounts((prev) => ({ ...prev, [status]: total }));
          setBoardPageIndex((prev) => ({ ...prev, [status]: 0 }));
          setBoardInitialSuccessGen((prev) => ({
            ...prev,
            [status]: capturedSearchGen,
          }));
          return { outcome: "success", total };
        }
      } catch {
        if (
          seq !== boardSeqRef.current[status] ||
          capturedSearchGen !== searchRequestSeqRef.current ||
          capturedProjectId !== projectIdRef.current ||
          modeRef.current !== "board"
        ) {
          return { outcome: "stale", total: 0 };
        }
        if (
          !deleteOwner ||
          (taskDeleteSeqRef.current[deleteOwner.targetUuid] ===
            deleteOwner.deleteGen &&
            projectIdRef.current === deleteOwner.projectId &&
            modeRef.current === deleteOwner.mode &&
            deleteOwner.status === status)
        ) {
          setBoardErrorInitial((prev) => ({ ...prev, [status]: true }));
          setBoardInitialSuccessGen((prev) => ({ ...prev, [status]: null }));
          return { outcome: "controlled-error", total: 0 };
        }
        return { outcome: "stale", total: 0 };
      } finally {
        if (
          seq === boardSeqRef.current[status] &&
          capturedSearchGen === searchRequestSeqRef.current &&
          capturedProjectId === projectIdRef.current &&
          modeRef.current === "board"
        ) {
          boardInFlightRef.current[status] = false;
          setBoardLoadingInitial((prev) => ({ ...prev, [status]: false }));
        }
      }
    },
    [projectId, debouncedSearch]
  );

  const handleDragStart = useCallback(() => {
    setBoardDragError(null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current as
        | {
            taskId?: string;
            sourceStatus?: unknown;
            task?: BoardTask;
          }
        | undefined;
      const overData = over.data.current as
        | {
            status?: unknown;
          }
        | undefined;

      if (!activeData || !overData) return;

      const rawSourceStatus = activeData.sourceStatus;
      const rawTargetStatus = overData.status;
      const taskId = activeData.taskId;
      const activeTask = activeData.task;

      if (!taskId || !activeTask) return;

      // Status whitelist validation
      const validStatuses: TaskStatus[] = [
        "TO_DO",
        "IN_PROGRESS",
        "BLOCKED",
        "IN_REVIEW",
        "READY_FOR_QA",
        "REOPENED",
        "READY_FOR_PRODUCTION",
        "DONE",
      ];

      if (
        typeof rawSourceStatus !== "string" ||
        !validStatuses.includes(rawSourceStatus as TaskStatus) ||
        typeof rawTargetStatus !== "string" ||
        !validStatuses.includes(rawTargetStatus as TaskStatus)
      ) {
        return;
      }

      const sourceStatus = rawSourceStatus as TaskStatus;
      const targetStatus = rawTargetStatus as TaskStatus;

      // Same status: NO-OP, no PATCH, no local reorder (BEFORE anything else)
      if (sourceStatus === targetStatus) return;

      // Check if confirmed delete is actively pending for this exact task
      if (
        activeDeleteOwnerRef.current.pending &&
        activeDeleteOwnerRef.current.taskId === taskId
      ) {
        return;
      }

      // Guard: At most ONE Board status mutation at a time
      if (pendingMutationRef.current) return;

      // Invariant: Verify task exists in current loaded source rows
      const originalSourceIndex = boardTasks[sourceStatus].findIndex(
        (t) => t.id === taskId
      );
      if (originalSourceIndex < 0) return;

      // Capture pre-move request state & immutable rollback data
      const sourceHadInFlightRead = boardInFlightRef.current[sourceStatus];
      const targetHadInFlightRead = boardInFlightRef.current[targetStatus];

      const originalTask: BoardTask = { ...activeTask, status: sourceStatus };
      const prevSourceCount = boardTotalCounts[sourceStatus];
      const prevTargetCount = boardTotalCounts[targetStatus];

      // Mutation Generation & Captured Search Dimensions
      const mutationSeq = ++boardMutationSeqRef.current;
      const nextTaskStatusSeq =
        (taskStatusMutationSeqRef.current[taskId] || 0) + 1;
      taskStatusMutationSeqRef.current[taskId] = nextTaskStatusSeq;
      const taskStatusSeq = nextTaskStatusSeq;
      const capturedDeleteGen = taskDeleteSeqRef.current[taskId] || 0;
      const capturedSearchGen = searchRequestSeqRef.current;
      const capturedSearchTerm = debouncedSearch;
      const capturedProjectId = projectId;

      // Synchronously invalidate collection generations for sourceStatus and targetStatus
      const sourceReconcileSeq = ++boardSeqRef.current[sourceStatus];
      const targetReconcileSeq = ++boardSeqRef.current[targetStatus];

      // Clear stale loading/in-flight states synchronously for ONLY source & target
      boardInFlightRef.current[sourceStatus] = false;
      boardInFlightRef.current[targetStatus] = false;
      setBoardLoadingInitial((prev) => ({
        ...prev,
        [sourceStatus]: false,
        [targetStatus]: false,
      }));
      setBoardLoadingMore((prev) => ({
        ...prev,
        [sourceStatus]: false,
        [targetStatus]: false,
      }));

      // Mark pending mutation & pause new load-more for source/target
      pendingMutationRef.current = true;
      pendingMoveStatusesRef.current.add(sourceStatus);
      pendingMoveStatusesRef.current.add(targetStatus);
      setBoardDragPending(true);
      setBoardDragError(null);

      // Optimistic visual placement
      const optimisticMovedTask: BoardTask = {
        ...activeTask,
        status: targetStatus,
      };

      setBoardTasks((prev) => {
        const nextSource = prev[sourceStatus].filter((t) => t.id !== taskId);
        const existingTarget = prev[targetStatus].filter(
          (t) => t.id !== taskId
        );
        return {
          ...prev,
          [sourceStatus]: nextSource,
          [targetStatus]: [...existingTarget, optimisticMovedTask],
        };
      });

      // ----------------------------------------------------
      // PHASE A: PATCH MUTATION
      // ----------------------------------------------------
      let patchSucceeded = false;
      try {
        const { error } = await TasksService.updateStatus(taskId, targetStatus);
        if (error) {
          throw error;
        }
        patchSucceeded = true;
      } catch {
        // Genuine PATCH failure: execute rollback ONLY if mutation generation still owns lifecycle
        if (
          mutationSeq === boardMutationSeqRef.current &&
          taskStatusSeq === taskStatusMutationSeqRef.current[taskId] &&
          capturedDeleteGen === (taskDeleteSeqRef.current[taskId] || 0) &&
          !(
            activeDeleteOwnerRef.current.pending &&
            activeDeleteOwnerRef.current.taskId === taskId
          ) &&
          capturedSearchGen === searchRequestSeqRef.current &&
          capturedProjectId === projectIdRef.current &&
          modeRef.current === "board"
        ) {
          setBoardTasks((prev) => {
            const currentSource = prev[sourceStatus].filter(
              (t) => t.id !== taskId
            );
            const restoredSource = [...currentSource];
            if (
              originalSourceIndex >= 0 &&
              originalSourceIndex <= restoredSource.length
            ) {
              restoredSource.splice(originalSourceIndex, 0, originalTask);
            } else {
              restoredSource.push(originalTask);
            }

            const currentTarget = prev[targetStatus].filter(
              (t) => t.id !== taskId
            );

            return {
              ...prev,
              [sourceStatus]: restoredSource,
              [targetStatus]: currentTarget,
            };
          });

          setBoardTotalCounts((prev) => ({
            ...prev,
            [sourceStatus]: prevSourceCount,
            [targetStatus]: prevTargetCount,
          }));

          setBoardDragError(
            "Failed to update task status. The task was restored."
          );

          // If source or target had an in-flight read lost at drag start, recover that read
          if (sourceHadInFlightRead) {
            void fetchBoardColumnInitial(sourceStatus);
          }
          if (targetHadInFlightRead) {
            void fetchBoardColumnInitial(targetStatus);
          }
        }
      }

      if (!patchSucceeded) {
        if (mutationSeq === boardMutationSeqRef.current) {
          pendingMoveStatusesRef.current.delete(sourceStatus);
          pendingMoveStatusesRef.current.delete(targetStatus);
          pendingMutationRef.current = false;
          setBoardDragPending(false);
        }
        return;
      }

      // Check mutation ownership after PATCH await
      if (
        mutationSeq !== boardMutationSeqRef.current ||
        taskStatusSeq !== taskStatusMutationSeqRef.current[taskId] ||
        capturedDeleteGen !== (taskDeleteSeqRef.current[taskId] || 0) ||
        (activeDeleteOwnerRef.current.pending &&
          activeDeleteOwnerRef.current.taskId === taskId)
      ) {
        return;
      }

      // Immediate post-PATCH arithmetic for local UI continuity if search didn't change
      if (
        capturedSearchGen === searchRequestSeqRef.current &&
        capturedProjectId === projectIdRef.current &&
        modeRef.current === "board"
      ) {
        setBoardTotalCounts((prev) => ({
          ...prev,
          [sourceStatus]: Math.max(0, prevSourceCount - 1),
          [targetStatus]: prevTargetCount + 1,
        }));
        setBoardDragError(null);
      }

      // ----------------------------------------------------
      // PHASE B: INDEPENDENT RECONCILIATION (PAGE 0)
      // ----------------------------------------------------
      boardInFlightRef.current[sourceStatus] = true;
      boardInFlightRef.current[targetStatus] = true;

      const [sourceResult, targetResult] = await Promise.allSettled([
        TasksService.getByProjectStatusPaginated(
          capturedProjectId,
          sourceStatus,
          0,
          PAGE_SIZE - 1,
          capturedSearchTerm
        ),
        TasksService.getByProjectStatusPaginated(
          capturedProjectId,
          targetStatus,
          0,
          PAGE_SIZE - 1,
          capturedSearchTerm
        ),
      ]);

      // Check mutation ownership after reconciliation await
      if (
        mutationSeq !== boardMutationSeqRef.current ||
        taskStatusSeq !== taskStatusMutationSeqRef.current[taskId] ||
        capturedDeleteGen !== (taskDeleteSeqRef.current[taskId] || 0) ||
        (activeDeleteOwnerRef.current.pending &&
          activeDeleteOwnerRef.current.taskId === taskId)
      ) {
        return;
      }

      // Handle Source Reconciliation independently
      if (
        sourceReconcileSeq === boardSeqRef.current[sourceStatus] &&
        capturedSearchGen === searchRequestSeqRef.current &&
        capturedProjectId === projectIdRef.current &&
        modeRef.current === "board"
      ) {
        boardInFlightRef.current[sourceStatus] = false;
        if (
          sourceResult.status === "fulfilled" &&
          !sourceResult.value.error &&
          sourceResult.value.data
        ) {
          const sourceRows = sourceResult.value.data.filter(
            (t) => t.id !== taskId
          );
          setBoardTasks((prev) => ({
            ...prev,
            [sourceStatus]: sourceRows,
          }));
          setBoardTotalCounts((prev) => ({
            ...prev,
            [sourceStatus]: sourceResult.value.count ?? 0,
          }));
          setBoardPageIndex((prev) => ({ ...prev, [sourceStatus]: 0 }));
          setBoardErrorInitial((prev) => ({ ...prev, [sourceStatus]: false }));
          setBoardErrorMore((prev) => ({ ...prev, [sourceStatus]: false }));
        } else {
          // Reconciliation failed: do NOT rollback PATCH. Mark column error and remain retryable
          setBoardErrorInitial((prev) => ({ ...prev, [sourceStatus]: true }));
        }
      }

      // Handle Target Reconciliation independently
      if (
        targetReconcileSeq === boardSeqRef.current[targetStatus] &&
        capturedSearchGen === searchRequestSeqRef.current &&
        capturedProjectId === projectIdRef.current &&
        modeRef.current === "board"
      ) {
        boardInFlightRef.current[targetStatus] = false;
        if (
          targetResult.status === "fulfilled" &&
          !targetResult.value.error &&
          targetResult.value.data
        ) {
          const fetchedTarget = targetResult.value.data.filter(
            (t) => t.id !== taskId
          );
          setBoardTasks((prev) => ({
            ...prev,
            [targetStatus]: [...fetchedTarget, optimisticMovedTask],
          }));
          setBoardTotalCounts((prev) => ({
            ...prev,
            [targetStatus]: targetResult.value.count ?? 0,
          }));
          setBoardPageIndex((prev) => ({ ...prev, [targetStatus]: 0 }));
          setBoardErrorInitial((prev) => ({ ...prev, [targetStatus]: false }));
          setBoardErrorMore((prev) => ({ ...prev, [targetStatus]: false }));
        } else {
          // Reconciliation failed: do NOT rollback PATCH. Mark column error and remain retryable
          setBoardErrorInitial((prev) => ({ ...prev, [targetStatus]: true }));
        }
      }

      // Cleanup pending mutation lock if still owning generation
      if (mutationSeq === boardMutationSeqRef.current) {
        pendingMoveStatusesRef.current.delete(sourceStatus);
        pendingMoveStatusesRef.current.delete(targetStatus);
        pendingMutationRef.current = false;
        setBoardDragPending(false);
      }

      // If search changed during DnD, trigger current-query reconciliation read
      if (
        capturedSearchGen !== searchRequestSeqRef.current &&
        capturedProjectId === projectIdRef.current &&
        modeRef.current === "board"
      ) {
        void fetchBoardColumnInitial(sourceStatus);
        void fetchBoardColumnInitial(targetStatus);
      }
    },
    [
      boardTasks,
      boardTotalCounts,
      projectId,
      debouncedSearch,
      fetchBoardColumnInitial,
    ]
  );

  // Evaluate media query
  useEffect(() => {
    let isMounted = true;
    const update = () => {
      if (isMounted) {
        setIsDesktop(window.matchMedia("(min-width: 1024px)").matches);
      }
    };

    const media = window.matchMedia("(min-width: 1024px)");
    void Promise.resolve().then(update);

    media.addEventListener("change", update);
    return () => {
      isMounted = false;
      media.removeEventListener("change", update);
    };
  }, []);

  const mode: "board" | "list" | "mobile" | null = useMemo(() => {
    if (isDesktop === null) return null;
    if (!isDesktop) return "mobile";
    return viewParam === "list" ? "list" : "board";
  }, [isDesktop, viewParam]);

  // Surviving project or mode ownership transition
  useEffect(() => {
    const prev = prevOwnerRef.current;
    if (prev.projectId !== projectId || prev.mode !== mode) {
      if (prev.projectId !== projectId) {
        // Reset search input on project identity change
        setSearchInput("");
        setDebouncedSearch("");
        searchTermRef.current = "";
        searchRequestSeqRef.current++;
      }
      prevOwnerRef.current = { projectId, mode };
      taskDeleteSeqRef.current = {};
      activeDeleteOwnerRef.current = {
        taskId: "",
        deleteGen: 0,
        pending: false,
      };
      setIsDeletePending(false);
      setTaskToDelete(null);
      setDeleteError(null);
    }
  }, [projectId, mode]);

  // True unmount-only invalidation
  useEffect(() => {
    const seqRef = taskDeleteSeqRef;
    const deleteOwner = activeDeleteOwnerRef;
    return () => {
      seqRef.current = {};
      deleteOwner.current = {
        taskId: "",
        deleteGen: 0,
        pending: false,
      };
    };
  }, []);

  // Keep live modeRef in sync
  useEffect(() => {
    modeRef.current = mode;
  });

  // Load project name
  useEffect(() => {
    let isMounted = true;
    ProjectsService.getById(projectId).then(({ data }) => {
      if (isMounted && data) {
        setProjectName(data.name);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // ----------------------------------------------------
  // DESKTOP LIST FETCH & PAGINATION
  // ----------------------------------------------------
  const fetchListPage = useCallback(
    async (
      pageToFetch: number,
      deleteOwner?: {
        targetUuid: string;
        deleteGen: number;
        projectId: string;
        mode: "board" | "list" | "mobile" | null;
        searchGen: number;
        searchTerm: string;
      },
      overrideSearch?: string
    ): Promise<{
      outcome: "success" | "controlled-error" | "stale";
      total: number;
    }> => {
      const activeSearch =
        overrideSearch !== undefined
          ? overrideSearch
          : deleteOwner
            ? deleteOwner.searchTerm
            : debouncedSearch;
      const searchGen = deleteOwner
        ? deleteOwner.searchGen
        : searchRequestSeqRef.current;
      const capturedProjectId = projectId;
      const seq = ++listSeqRef.current;
      setRequestedPage(pageToFetch);
      setListLoading(true);
      setListError(false);

      const from = (pageToFetch - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      try {
        const { data, count, error } = await TasksService.getByProjectPaginated(
          capturedProjectId,
          from,
          to,
          activeSearch
        );
        if (
          seq !== listSeqRef.current ||
          searchGen !== searchRequestSeqRef.current ||
          capturedProjectId !== projectIdRef.current ||
          modeRef.current !== "list"
        ) {
          return { outcome: "stale", total: 0 };
        }
        if (
          deleteOwner &&
          (taskDeleteSeqRef.current[deleteOwner.targetUuid] !==
            deleteOwner.deleteGen ||
            projectIdRef.current !== deleteOwner.projectId ||
            modeRef.current !== deleteOwner.mode)
        ) {
          return { outcome: "stale", total: 0 };
        }

        if (error) {
          setListError(true);
          return { outcome: "controlled-error", total: 0 };
        } else {
          const fetchedRows = data ?? [];
          const total = count ?? 0;
          const calculatedTotalPages =
            total === 0 ? 0 : Math.ceil(total / PAGE_SIZE);

          if (total === 0) {
            setCurrentPage(1);
            setRequestedPage(1);
            setListTotalCount(0);
            setListTasks([]);
            return { outcome: "success", total: 0 };
          } else if (pageToFetch > calculatedTotalPages) {
            // Corrective read
            const clampedPage = calculatedTotalPages;
            setRequestedPage(clampedPage);
            const clampedFrom = (clampedPage - 1) * PAGE_SIZE;
            const clampedTo = clampedFrom + PAGE_SIZE - 1;

            const corrResult = await TasksService.getByProjectPaginated(
              capturedProjectId,
              clampedFrom,
              clampedTo,
              activeSearch
            );
            if (
              seq !== listSeqRef.current ||
              searchGen !== searchRequestSeqRef.current ||
              capturedProjectId !== projectIdRef.current ||
              modeRef.current !== "list"
            ) {
              return { outcome: "stale", total: 0 };
            }
            if (
              deleteOwner &&
              (taskDeleteSeqRef.current[deleteOwner.targetUuid] !==
                deleteOwner.deleteGen ||
                projectIdRef.current !== deleteOwner.projectId ||
                modeRef.current !== deleteOwner.mode)
            ) {
              return { outcome: "stale", total: 0 };
            }

            if (corrResult.error) {
              setListError(true);
              return { outcome: "controlled-error", total: 0 };
            } else {
              const finalRows = corrResult.data ?? [];
              const finalCount = corrResult.count ?? total;
              const finalTotalPages =
                finalCount === 0 ? 0 : Math.ceil(finalCount / PAGE_SIZE);
              const settledPage =
                finalTotalPages === 0
                  ? 1
                  : Math.min(clampedPage, finalTotalPages);

              setCurrentPage(settledPage);
              setRequestedPage(settledPage);
              setListTotalCount(finalCount);
              setListTasks(finalRows);
              return { outcome: "success", total: finalCount };
            }
          } else {
            setCurrentPage(pageToFetch);
            setRequestedPage(pageToFetch);
            setListTotalCount(total);
            setListTasks(fetchedRows);
            return { outcome: "success", total };
          }
        }
      } catch {
        if (
          seq !== listSeqRef.current ||
          searchGen !== searchRequestSeqRef.current ||
          capturedProjectId !== projectIdRef.current ||
          modeRef.current !== "list"
        ) {
          return { outcome: "stale", total: 0 };
        }
        if (
          !deleteOwner ||
          (taskDeleteSeqRef.current[deleteOwner.targetUuid] ===
            deleteOwner.deleteGen &&
            projectIdRef.current === deleteOwner.projectId &&
            modeRef.current === deleteOwner.mode)
        ) {
          setListError(true);
          return { outcome: "controlled-error", total: 0 };
        }
        return { outcome: "stale", total: 0 };
      } finally {
        if (
          seq === listSeqRef.current &&
          searchGen === searchRequestSeqRef.current &&
          capturedProjectId === projectIdRef.current &&
          modeRef.current === "list"
        ) {
          setListLoading(false);
        }
      }
    },
    [projectId, debouncedSearch]
  );

  const fetchBoardColumnNext = useCallback(
    async (status: TaskStatus, options?: { isRetry?: boolean }) => {
      if (boardInFlightRef.current[status]) return;
      if (pendingMoveStatusesRef.current.has(status)) return;

      const total = boardTotalCounts[status];
      const consumedBackendRows = Math.min(
        (boardPageIndex[status] + 1) * PAGE_SIZE,
        total
      );
      if (consumedBackendRows >= total) return;
      if (boardErrorMore[status] && !options?.isRetry) return;

      const nextPageIndex = boardPageIndex[status] + 1;
      const from = nextPageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const capturedSearchGen = searchRequestSeqRef.current;
      const capturedSearchTerm = debouncedSearch;
      const capturedProjectId = projectId;
      const seq = ++boardSeqRef.current[status];
      boardInFlightRef.current[status] = true;

      setBoardLoadingMore((prev) => ({ ...prev, [status]: true }));
      setBoardErrorMore((prev) => ({ ...prev, [status]: false }));

      try {
        const { data, count, error } =
          await TasksService.getByProjectStatusPaginated(
            capturedProjectId,
            status,
            from,
            to,
            capturedSearchTerm
          );
        if (
          seq !== boardSeqRef.current[status] ||
          capturedSearchGen !== searchRequestSeqRef.current ||
          capturedProjectId !== projectIdRef.current ||
          modeRef.current !== "board"
        ) {
          return;
        }

        if (error) {
          setBoardErrorMore((prev) => ({ ...prev, [status]: true }));
        } else {
          const newRows = data ?? [];
          setBoardTasks((prev) => {
            const existing = prev[status];
            const existingIds = new Set(existing.map((t) => t.id));
            const uniqueIncoming = newRows.filter(
              (t) => !existingIds.has(t.id)
            );
            return { ...prev, [status]: [...existing, ...uniqueIncoming] };
          });
          if (count !== null) {
            setBoardTotalCounts((prev) => ({ ...prev, [status]: count }));
          }
          setBoardPageIndex((prev) => ({ ...prev, [status]: nextPageIndex }));
        }
      } catch {
        if (
          seq !== boardSeqRef.current[status] ||
          capturedSearchGen !== searchRequestSeqRef.current ||
          capturedProjectId !== projectIdRef.current ||
          modeRef.current !== "board"
        ) {
          return;
        }
        setBoardErrorMore((prev) => ({ ...prev, [status]: true }));
      } finally {
        if (
          seq === boardSeqRef.current[status] &&
          capturedSearchGen === searchRequestSeqRef.current &&
          capturedProjectId === projectIdRef.current &&
          modeRef.current === "board"
        ) {
          boardInFlightRef.current[status] = false;
          setBoardLoadingMore((prev) => ({ ...prev, [status]: false }));
        }
      }
    },
    [
      projectId,
      debouncedSearch,
      boardTotalCounts,
      boardPageIndex,
      boardErrorMore,
    ]
  );

  const retryBoardColumnMore = useCallback(
    (status: TaskStatus) => {
      void fetchBoardColumnNext(status, { isRetry: true });
    },
    [fetchBoardColumnNext]
  );

  // ----------------------------------------------------
  // MOBILE SEQUENTIAL CANONICAL-STATUS INFINITE SCROLL
  // ----------------------------------------------------
  const fetchMobileSequential = useCallback(
    async (
      initialStatusIdx: number,
      initialPageIdx: number,
      isInitialMobileEntry: boolean = false,
      deleteOwner?: {
        targetUuid: string;
        deleteGen: number;
        projectId: string;
        mode: "board" | "list" | "mobile" | null;
        searchGen: number;
        searchTerm: string;
      },
      overrideSearch?: string
    ): Promise<{ outcome: "success" | "controlled-error" | "stale" }> => {
      if (mobileInFlightRef.current && !deleteOwner) {
        return { outcome: "stale" };
      }

      let curStatusIdx = initialStatusIdx;
      let curPageIdx = initialPageIdx;

      if (curStatusIdx >= BOARD_COLUMNS.length) {
        setMobileAllExhausted(true);
        setMobileLoadingInitial(false);
        setMobileLoadingMore(false);
        return { outcome: "success" };
      }

      const activeSearch =
        overrideSearch !== undefined
          ? overrideSearch
          : deleteOwner
            ? deleteOwner.searchTerm
            : debouncedSearch;
      const searchGen = deleteOwner
        ? deleteOwner.searchGen
        : searchRequestSeqRef.current;
      const capturedProjectId = projectId;
      const seq = ++mobileSeqRef.current;
      mobileInFlightRef.current = true;

      if (isInitialMobileEntry || (curStatusIdx === 0 && curPageIdx === 0)) {
        setMobileLoadingInitial(true);
        setMobileError(false);
      } else {
        setMobileLoadingMore(true);
        setMobileError(false);
      }

      try {
        // Stream through statuses. For each status, fetch until exhausted, then advance.
        while (curStatusIdx < BOARD_COLUMNS.length) {
          const statusCol = BOARD_COLUMNS[curStatusIdx];
          const status = statusCol.status;
          const from = curPageIdx * PAGE_SIZE;
          const to = from + PAGE_SIZE - 1;

          const { data, count, error } =
            await TasksService.getByProjectStatusPaginated(
              capturedProjectId,
              status,
              from,
              to,
              activeSearch
            );

          if (
            seq !== mobileSeqRef.current ||
            searchGen !== searchRequestSeqRef.current ||
            capturedProjectId !== projectIdRef.current ||
            modeRef.current !== "mobile"
          ) {
            return { outcome: "stale" };
          }
          if (
            deleteOwner &&
            (taskDeleteSeqRef.current[deleteOwner.targetUuid] !==
              deleteOwner.deleteGen ||
              projectIdRef.current !== deleteOwner.projectId ||
              modeRef.current !== deleteOwner.mode)
          ) {
            return { outcome: "stale" };
          }

          if (error) {
            setMobileError(true);
            return { outcome: "controlled-error" };
          }

          const fetchedRows = data ?? [];
          const total = count ?? 0;

          if (fetchedRows.length > 0) {
            // Deduplicate rows per status by backend UUID
            setMobileTasks((prev) => {
              const existingIds = new Set(prev.map((t) => t.id));
              const uniqueNew = fetchedRows.filter(
                (t) => !existingIds.has(t.id)
              );
              return [...prev, ...uniqueNew];
            });
          }

          const loadedSoFar =
            (curPageIdx === 0 ? 0 : mobileStatusLoadedCountRef.current) +
            fetchedRows.length;
          mobileStatusLoadedCountRef.current = loadedSoFar;

          if (loadedSoFar >= total || fetchedRows.length === 0) {
            // Status is completely exhausted! Advance to next status
            curStatusIdx += 1;
            curPageIdx = 0;
            activeMobileStatusIndexRef.current = curStatusIdx;
            mobileStatusPageIndexRef.current = 0;
            mobileStatusLoadedCountRef.current = 0;

            if (curStatusIdx >= BOARD_COLUMNS.length) {
              setMobileAllExhausted(true);
              break;
            }

            // Continue loop to start next canonical status
            continue;
          } else {
            // More remain in active status (multi-page status)
            curPageIdx += 1;
            activeMobileStatusIndexRef.current = curStatusIdx;
            mobileStatusPageIndexRef.current = curPageIdx;
            // Break so next page can be fetched incrementally or continued
            break;
          }
        }
        return { outcome: "success" };
      } catch {
        if (
          seq !== mobileSeqRef.current ||
          searchGen !== searchRequestSeqRef.current ||
          capturedProjectId !== projectIdRef.current ||
          modeRef.current !== "mobile"
        ) {
          return { outcome: "stale" };
        }
        if (
          !deleteOwner ||
          (taskDeleteSeqRef.current[deleteOwner.targetUuid] ===
            deleteOwner.deleteGen &&
            projectIdRef.current === deleteOwner.projectId &&
            modeRef.current === deleteOwner.mode)
        ) {
          setMobileError(true);
          return { outcome: "controlled-error" };
        }
        return { outcome: "stale" };
      } finally {
        if (
          seq === mobileSeqRef.current &&
          searchGen === searchRequestSeqRef.current &&
          capturedProjectId === projectIdRef.current &&
          modeRef.current === "mobile"
        ) {
          mobileInFlightRef.current = false;
          setMobileLoadingInitial(false);
          setMobileLoadingMore(false);
        }
      }
    },
    [projectId, debouncedSearch]
  );

  // ----------------------------------------------------
  // SHARED TASK DELETE HANDLERS (Desktop List, Mobile & Board)
  // ----------------------------------------------------
  const handleDeleteRequested = useCallback((task: BoardTask) => {
    // Opening confirmation is NOT confirmed delete; do not increment taskDeleteSeqRef
    setTaskToDelete(task);
    setDeleteError(null);
  }, []);

  const handleBoardDeleteRequested = useCallback(
    (target: { id: string; status: TaskStatus }) => {
      // Opening confirmation is NOT confirmed delete; do not increment taskDeleteSeqRef
      const deleteTarget: BoardTask = {
        id: target.id,
        task_id: "TASK",
        title: "Task",
        status: target.status,
        due_date: null,
        assignee: null,
      };

      // Close TaskDetailsModal to prevent overlapping modal focus traps
      setSelectedTaskId(null);
      setTaskToDelete(deleteTarget);
      setDeleteError(null);
    },
    []
  );

  const handleDeleteCancel = useCallback(() => {
    // Cancel confirmation: if no active delete mutation is pending, clear selection with zero invalidation
    if (activeDeleteOwnerRef.current.pending) return;
    setTaskToDelete(null);
    setDeleteError(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!taskToDelete || activeDeleteOwnerRef.current.pending) return;

    const targetUuid = taskToDelete.id;
    const nextDeleteGen = (taskDeleteSeqRef.current[targetUuid] || 0) + 1;
    taskDeleteSeqRef.current[targetUuid] = nextDeleteGen;
    const currentDeleteGen = nextDeleteGen;

    activeDeleteOwnerRef.current = {
      taskId: targetUuid,
      deleteGen: currentDeleteGen,
      pending: true,
    };
    setIsDeletePending(true);
    setDeleteError(null);

    const capturedOwner = {
      deleteGen: currentDeleteGen,
      targetUuid,
      targetStatus: taskToDelete.status,
      projectId: projectIdRef.current,
      mode: modeRef.current,
      page: currentPageRef.current,
      searchGen: searchRequestSeqRef.current,
      searchTerm: debouncedSearch,
    };

    try {
      const { error: deleteErr } = await TasksService.delete(
        capturedOwner.targetUuid
      );
      if (
        currentDeleteGen !== taskDeleteSeqRef.current[targetUuid] ||
        !activeDeleteOwnerRef.current.pending ||
        activeDeleteOwnerRef.current.taskId !== targetUuid
      ) {
        return;
      }

      if (deleteErr) {
        setDeleteError("Failed to delete task. Please try again.");
        activeDeleteOwnerRef.current = {
          taskId: "",
          deleteGen: 0,
          pending: false,
        };
        setIsDeletePending(false);
        return;
      }

      // Authoritative read-back verification: ensure record is absent
      const { data: readBackData, error: readBackErr } =
        await TasksService.getDetails(
          capturedOwner.projectId,
          capturedOwner.targetUuid
        );
      if (
        currentDeleteGen !== taskDeleteSeqRef.current[targetUuid] ||
        !activeDeleteOwnerRef.current.pending ||
        activeDeleteOwnerRef.current.taskId !== targetUuid
      ) {
        return;
      }

      if (readBackErr) {
        setDeleteError("Failed to delete task. Please try again.");
        activeDeleteOwnerRef.current = {
          taskId: "",
          deleteGen: 0,
          pending: false,
        };
        setIsDeletePending(false);
        return;
      }

      if (readBackData !== null) {
        // Record still exists - treat as delete failure / no-op
        setDeleteError("Failed to delete task. Please try again.");
        activeDeleteOwnerRef.current = {
          taskId: "",
          deleteGen: 0,
          pending: false,
        };
        setIsDeletePending(false);
        return;
      }

      if (selectedTaskId === capturedOwner.targetUuid) {
        setSelectedTaskId(null);
      }

      // Reconcile according to captured active mode under joint ownership
      let reconOutcome: "success" | "controlled-error" | "stale" = "stale";

      if (capturedOwner.mode === "mobile") {
        // Mobile: invalidate prior sequence and reload canonical stream from start
        mobileSeqRef.current++;
        activeMobileStatusIndexRef.current = 0;
        mobileStatusPageIndexRef.current = 0;
        mobileStatusLoadedCountRef.current = 0;
        setMobileTasks([]);
        setMobileAllExhausted(false);
        setMobileError(false);

        const res = await fetchMobileSequential(0, 0, true, {
          targetUuid: capturedOwner.targetUuid,
          deleteGen: capturedOwner.deleteGen,
          projectId: capturedOwner.projectId,
          mode: capturedOwner.mode,
          searchGen: capturedOwner.searchGen,
          searchTerm: capturedOwner.searchTerm,
        });
        reconOutcome = res.outcome;
      } else if (capturedOwner.mode === "list") {
        // Desktop List: invalidate prior list sequence and re-fetch list page
        listSeqRef.current++;
        const res = await fetchListPage(capturedOwner.page, {
          targetUuid: capturedOwner.targetUuid,
          deleteGen: capturedOwner.deleteGen,
          projectId: capturedOwner.projectId,
          mode: capturedOwner.mode,
          searchGen: capturedOwner.searchGen,
          searchTerm: capturedOwner.searchTerm,
        });
        reconOutcome = res.outcome;
      } else if (capturedOwner.mode === "board") {
        // Desktop Board: invalidate affected Board-status GET generation and refetch
        if (capturedOwner.targetStatus) {
          boardSeqRef.current[capturedOwner.targetStatus]++;
          const res = await fetchBoardColumnInitial(
            capturedOwner.targetStatus,
            {
              targetUuid: capturedOwner.targetUuid,
              deleteGen: capturedOwner.deleteGen,
              projectId: capturedOwner.projectId,
              mode: capturedOwner.mode,
              status: capturedOwner.targetStatus,
              searchGen: capturedOwner.searchGen,
              searchTerm: capturedOwner.searchTerm,
            }
          );
          reconOutcome = res.outcome;
        }
      }

      if (reconOutcome === "stale") {
        // If search changed during delete, refresh current active search
        if (
          capturedOwner.searchGen !== searchRequestSeqRef.current &&
          projectIdRef.current === capturedOwner.projectId
        ) {
          if (modeRef.current === "list") {
            void fetchListPage(currentPageRef.current);
          } else if (
            modeRef.current === "board" &&
            capturedOwner.targetStatus
          ) {
            void fetchBoardColumnInitial(capturedOwner.targetStatus);
          } else if (modeRef.current === "mobile") {
            void fetchMobileSequential(0, 0, true);
          }
        }
        return;
      }

      // For both "success" and "controlled-error":
      if (
        taskDeleteSeqRef.current[targetUuid] === capturedOwner.deleteGen &&
        activeDeleteOwnerRef.current.taskId === targetUuid &&
        projectIdRef.current === capturedOwner.projectId &&
        modeRef.current === capturedOwner.mode
      ) {
        setTaskToDelete(null);
        setDeleteError(null);
        activeDeleteOwnerRef.current = {
          taskId: "",
          deleteGen: 0,
          pending: false,
        };
        setIsDeletePending(false);
      }
    } catch {
      if (
        currentDeleteGen === taskDeleteSeqRef.current[targetUuid] &&
        activeDeleteOwnerRef.current.taskId === targetUuid
      ) {
        activeDeleteOwnerRef.current = {
          taskId: "",
          deleteGen: 0,
          pending: false,
        };
        setIsDeletePending(false);
        if (
          projectIdRef.current === capturedOwner.projectId &&
          modeRef.current === capturedOwner.mode &&
          searchRequestSeqRef.current === capturedOwner.searchGen &&
          debouncedSearch === capturedOwner.searchTerm
        ) {
          setDeleteError("Failed to delete task. Please try again.");
        }
      }
    }
  }, [
    taskToDelete,
    selectedTaskId,
    debouncedSearch,
    fetchListPage,
    fetchMobileSequential,
    fetchBoardColumnInitial,
  ]);

  // ----------------------------------------------------
  // TM-30 TASK UPDATE COORDINATOR
  // ----------------------------------------------------
  const handleTaskUpdate = useCallback(
    async (
      targetTaskId: string,
      field: TaskUpdateField,
      patch: TaskUpdatePatch,
      previousStatus?: TaskStatus,
      targetStatus?: TaskStatus
    ): Promise<TaskUpdateResult> => {
      // Safety Guard: Check if confirmed delete is actively pending for this exact task
      if (
        activeDeleteOwnerRef.current.pending &&
        activeDeleteOwnerRef.current.taskId === targetTaskId
      ) {
        return { outcome: "stale" };
      }

      // Track per-task per-field generation
      if (!taskUpdateSeqRef.current[targetTaskId]) {
        taskUpdateSeqRef.current[targetTaskId] = {};
      }
      const nextFieldSeq =
        (taskUpdateSeqRef.current[targetTaskId][field] || 0) + 1;
      taskUpdateSeqRef.current[targetTaskId][field] = nextFieldSeq;
      const fieldSeq = nextFieldSeq;

      let taskStatusSeq = 0;
      if (field === "status") {
        const nextStatusSeq =
          (taskStatusMutationSeqRef.current[targetTaskId] || 0) + 1;
        taskStatusMutationSeqRef.current[targetTaskId] = nextStatusSeq;
        taskStatusSeq = nextStatusSeq;
      }

      const capturedProjectId = projectId;
      const capturedDeleteGen = taskDeleteSeqRef.current[targetTaskId] || 0;

      try {
        // Step 1: Execute exactly one PATCH
        const { error: patchErr } = await TasksService.update(
          targetTaskId,
          patch
        );
        if (patchErr) {
          return { outcome: "failure" };
        }

        // Check ownership post-PATCH
        if (
          capturedProjectId !== projectIdRef.current ||
          fieldSeq !== taskUpdateSeqRef.current[targetTaskId]?.[field] ||
          (field === "status" &&
            taskStatusSeq !== taskStatusMutationSeqRef.current[targetTaskId]) ||
          (activeDeleteOwnerRef.current.pending &&
            activeDeleteOwnerRef.current.taskId === targetTaskId) ||
          capturedDeleteGen !== (taskDeleteSeqRef.current[targetTaskId] || 0)
        ) {
          return { outcome: "stale" };
        }

        // Step 2: Authoritative exact read-back
        const { data: updatedDetails, error: readBackErr } =
          await TasksService.getDetails(capturedProjectId, targetTaskId);

        if (readBackErr || !updatedDetails) {
          return { outcome: "failure" };
        }

        // Check ownership post-read-back
        if (
          capturedProjectId !== projectIdRef.current ||
          fieldSeq !== taskUpdateSeqRef.current[targetTaskId]?.[field] ||
          (field === "status" &&
            taskStatusSeq !== taskStatusMutationSeqRef.current[targetTaskId]) ||
          (activeDeleteOwnerRef.current.pending &&
            activeDeleteOwnerRef.current.taskId === targetTaskId) ||
          capturedDeleteGen !== (taskDeleteSeqRef.current[targetTaskId] || 0)
        ) {
          return { outcome: "stale" };
        }

        // Final pre-reconciliation delete and status recheck
        if (
          capturedProjectId !== projectIdRef.current ||
          fieldSeq !== taskUpdateSeqRef.current[targetTaskId]?.[field] ||
          (field === "status" &&
            taskStatusSeq !== taskStatusMutationSeqRef.current[targetTaskId]) ||
          (activeDeleteOwnerRef.current.pending &&
            activeDeleteOwnerRef.current.taskId === targetTaskId) ||
          capturedDeleteGen !== (taskDeleteSeqRef.current[targetTaskId] || 0)
        ) {
          return { outcome: "stale" };
        }

        // Step 3: Authoritative Parent Collections Reconciliation
        const currentMode = modeRef.current;
        const isSearchActive = Boolean(debouncedSearch.trim());

        if (field === "title") {
          if (!isSearchActive) {
            // No active search: direct slice update
            setBoardTasks((prev) => {
              const next = { ...prev };
              (Object.keys(next) as TaskStatus[]).forEach((st) => {
                next[st] = next[st].map((t) =>
                  t.id === targetTaskId
                    ? { ...t, title: updatedDetails.title }
                    : t
                );
              });
              return next;
            });
            setListTasks((prev) =>
              prev.map((t) =>
                t.id === targetTaskId
                  ? { ...t, title: updatedDetails.title }
                  : t
              )
            );
            setMobileTasks((prev) =>
              prev.map((t) =>
                t.id === targetTaskId
                  ? { ...t, title: updatedDetails.title }
                  : t
              )
            );
          } else {
            // Search is active: reconcile under CURRENT search query
            if (currentMode === "board") {
              const taskSt = updatedDetails.status;
              void fetchBoardColumnInitial(taskSt);
            } else if (currentMode === "list") {
              void fetchListPage(currentPageRef.current);
            } else if (currentMode === "mobile") {
              mobileSeqRef.current++;
              activeMobileStatusIndexRef.current = 0;
              mobileStatusPageIndexRef.current = 0;
              mobileStatusLoadedCountRef.current = 0;
              setMobileTasks([]);
              setMobileAllExhausted(false);
              setMobileError(false);
              void fetchMobileSequential(0, 0, true);
            }
          }
        } else if (field === "status") {
          const srcStatus = previousStatus;
          const tgtStatus = targetStatus || updatedDetails.status;

          if (currentMode === "board") {
            if (srcStatus && srcStatus !== tgtStatus) {
              void fetchBoardColumnInitial(srcStatus);
            }
            void fetchBoardColumnInitial(tgtStatus);
          } else if (currentMode === "list") {
            void fetchListPage(currentPageRef.current);
          } else if (currentMode === "mobile") {
            mobileSeqRef.current++;
            activeMobileStatusIndexRef.current = 0;
            mobileStatusPageIndexRef.current = 0;
            mobileStatusLoadedCountRef.current = 0;
            setMobileTasks([]);
            setMobileAllExhausted(false);
            setMobileError(false);
            void fetchMobileSequential(0, 0, true);
          }
        } else if (field === "assignee_id") {
          // Slice patch on matching loaded tasks
          const nextAssignee = updatedDetails.assignee;
          setBoardTasks((prev) => {
            const next = { ...prev };
            (Object.keys(next) as TaskStatus[]).forEach((st) => {
              next[st] = next[st].map((t) =>
                t.id === targetTaskId ? { ...t, assignee: nextAssignee } : t
              );
            });
            return next;
          });
          setListTasks((prev) =>
            prev.map((t) =>
              t.id === targetTaskId ? { ...t, assignee: nextAssignee } : t
            )
          );
          setMobileTasks((prev) =>
            prev.map((t) =>
              t.id === targetTaskId ? { ...t, assignee: nextAssignee } : t
            )
          );
        } else if (field === "due_date") {
          // Slice patch on matching loaded tasks
          const nextDueDate = updatedDetails.due_date;
          setBoardTasks((prev) => {
            const next = { ...prev };
            (Object.keys(next) as TaskStatus[]).forEach((st) => {
              next[st] = next[st].map((t) =>
                t.id === targetTaskId ? { ...t, due_date: nextDueDate } : t
              );
            });
            return next;
          });
          setListTasks((prev) =>
            prev.map((t) =>
              t.id === targetTaskId ? { ...t, due_date: nextDueDate } : t
            )
          );
          setMobileTasks((prev) =>
            prev.map((t) =>
              t.id === targetTaskId ? { ...t, due_date: nextDueDate } : t
            )
          );
        }

        return { outcome: "success", task: updatedDetails };
      } catch {
        return { outcome: "failure" };
      }
    },
    [
      projectId,
      debouncedSearch,
      fetchBoardColumnInitial,
      fetchListPage,
      fetchMobileSequential,
    ]
  );

  // Observer callback for Mobile Sentinel
  const handleMobileLoadMore = useCallback(() => {
    if (mobileInFlightRef.current) return;
    if (mobileError) return;
    if (mobileAllExhausted) return;

    void fetchMobileSequential(
      activeMobileStatusIndexRef.current,
      mobileStatusPageIndexRef.current
    );
  }, [mobileError, mobileAllExhausted, fetchMobileSequential]);

  const handleMobileRetry = useCallback(() => {
    setMobileError(false);
    void fetchMobileSequential(
      activeMobileStatusIndexRef.current,
      mobileStatusPageIndexRef.current
    );
  }, [fetchMobileSequential]);

  // Mobile Sentinel Attachment (Callback Ref)
  const mobileSentinelRef = useRef<HTMLDivElement | null>(null);
  const setMobileSentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      const prev = mobileSentinelRef.current as unknown as {
        __io?: IntersectionObserver;
      } | null;
      if (prev && prev.__io) prev.__io.disconnect();
      mobileSentinelRef.current = node;

      if (!node || mode !== "mobile" || mobileAllExhausted) return;

      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            handleMobileLoadMore();
          }
        },
        { root: null, rootMargin: "200px 0px", threshold: 0 }
      );
      (node as unknown as { __io?: IntersectionObserver }).__io = io;
      io.observe(node);
    },
    [mode, mobileAllExhausted, handleMobileLoadMore]
  );

  // ----------------------------------------------------
  // MODE, PROJECT & SEARCH RESPONSIVE LIFECYCLE INITIALIZATION
  // ----------------------------------------------------
  useEffect(() => {
    if (mode === null) return;

    // Invalidate any active Board DnD mutation lifecycle immediately on transition
    boardMutationSeqRef.current++;
    pendingMutationRef.current = false;
    pendingMoveStatusesRef.current.clear();

    let isMounted = true;
    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;

      setBoardDragPending(false);
      setBoardDragError(null);

      if (mode === "list") {
        // Reset Board & Mobile sequences and in-flight flags
        Object.keys(boardSeqRef.current).forEach((k) => {
          const statusKey = k as TaskStatus;
          boardSeqRef.current[statusKey]++;
          boardInFlightRef.current[statusKey] = false;
        });
        setBoardInitialSuccessGen({
          TO_DO: null,
          IN_PROGRESS: null,
          BLOCKED: null,
          IN_REVIEW: null,
          READY_FOR_QA: null,
          REOPENED: null,
          READY_FOR_PRODUCTION: null,
          DONE: null,
        });
        mobileSeqRef.current++;
        mobileInFlightRef.current = false;

        setCurrentPage(1);
        setRequestedPage(1);
        setListTasks([]);
        setListTotalCount(0);
        void fetchListPage(1);
      } else if (mode === "board") {
        // Reset List & Mobile sequences and in-flight flags
        listSeqRef.current++;
        mobileSeqRef.current++;
        mobileInFlightRef.current = false;

        Object.keys(boardSeqRef.current).forEach((k) => {
          const statusKey = k as TaskStatus;
          boardSeqRef.current[statusKey]++;
          boardInFlightRef.current[statusKey] = false;
        });
        setBoardInitialSuccessGen({
          TO_DO: null,
          IN_PROGRESS: null,
          BLOCKED: null,
          IN_REVIEW: null,
          READY_FOR_QA: null,
          REOPENED: null,
          READY_FOR_PRODUCTION: null,
          DONE: null,
        });

        BOARD_COLUMNS.forEach((col) => {
          void fetchBoardColumnInitial(col.status);
        });
      } else if (mode === "mobile") {
        // Reset List & Board sequences and in-flight flags
        listSeqRef.current++;
        Object.keys(boardSeqRef.current).forEach((k) => {
          const statusKey = k as TaskStatus;
          boardSeqRef.current[statusKey]++;
          boardInFlightRef.current[statusKey] = false;
        });
        setBoardInitialSuccessGen({
          TO_DO: null,
          IN_PROGRESS: null,
          BLOCKED: null,
          IN_REVIEW: null,
          READY_FOR_QA: null,
          REOPENED: null,
          READY_FOR_PRODUCTION: null,
          DONE: null,
        });

        mobileSeqRef.current++;
        mobileInFlightRef.current = false;

        setMobileTasks([]);
        activeMobileStatusIndexRef.current = 0;
        mobileStatusPageIndexRef.current = 0;
        mobileStatusLoadedCountRef.current = 0;
        setMobileAllExhausted(false);
        setMobileError(false);

        void fetchMobileSequential(0, 0, true);
      }
    };

    void run();

    return () => {
      isMounted = false;
    };
  }, [
    projectId,
    mode,
    debouncedSearch,
    fetchListPage,
    fetchBoardColumnInitial,
    fetchMobileSequential,
  ]);

  const handleViewChange = (newView: string) => {
    if (newView === "list") {
      router.push(`/project/${projectId}/tasks?view=list`);
    } else {
      router.push(`/project/${projectId}/tasks?view=board`);
    }
  };

  // --- List Pagination Calculations & Presentation ---
  const totalPages =
    listTotalCount === 0 ? 0 : Math.ceil(listTotalCount / PAGE_SIZE);

  const pageNumbers = useMemo<(number | "...")[]>(() => {
    if (totalPages <= 0) return [];
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

  // --- Board Search All-Zero Computation ---
  const isBoardSearchAllZero = useMemo(() => {
    if (
      mode !== "board" ||
      !debouncedSearch ||
      activeSearchGen !== inputSearchGen
    ) {
      return false;
    }
    const allEightCurrentGenCompleted = BOARD_COLUMNS.every(
      (col) =>
        boardInitialSuccessGen[col.status] !== null &&
        boardInitialSuccessGen[col.status] === activeSearchGen
    );
    const totalCountAllZero = BOARD_COLUMNS.every(
      (col) => boardTotalCounts[col.status] === 0
    );
    return allEightCurrentGenCompleted && totalCountAllZero;
  }, [
    mode,
    debouncedSearch,
    activeSearchGen,
    inputSearchGen,
    boardInitialSuccessGen,
    boardTotalCounts,
  ]);

  return (
    <AppShell>
      <div className="flex h-full w-full flex-col pb-20 lg:pb-8">
        {/* Breadcrumb Bar (Desktop Only) */}
        <nav
          aria-label="Breadcrumb"
          className="mb-2 hidden flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.6px] text-[#737685] lg:flex"
        >
          <Link
            href="/project"
            className="transition-colors hover:text-[#0052cc] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0052cc]"
          >
            PROJECTS
          </Link>
          <span aria-hidden="true" className="text-[#a0a5b5]">
            &gt;
          </span>
          <span className="max-w-[200px] truncate text-[#737685]">
            {projectName}
          </span>
          <span aria-hidden="true" className="text-[#a0a5b5]">
            &gt;
          </span>
          <span className="text-[#0052cc]">TASKS</span>
        </nav>

        {/* Header and Controls */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#041b3c]">
              Active Workboard
            </h1>
            <p className="mt-1 text-[13px] text-[#53627b]">
              Manage and track project tasks across workflow stages.
            </p>
          </div>

          {/* Desktop Upper-Right Controls */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative w-[260px]">
              <Search
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737685]"
              />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search tasks..."
                aria-label="Search tasks"
                tabIndex={0}
                className="h-10 w-full rounded-[4px] border border-[#d9deeb] bg-[#f8f9fc] pl-9 pr-3 text-[13px] text-[#041b3c] placeholder:text-[#737685] focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]"
              />
            </div>

            <div className="relative">
              <select
                aria-label="View switcher"
                value={viewParam === "list" ? "list" : "board"}
                onChange={(e) => handleViewChange(e.target.value)}
                className="h-10 appearance-none rounded-[4px] border border-[#d9deeb] bg-white pl-3.5 pr-9 text-[13px] font-semibold text-[#041b3c] shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]"
              >
                <option value="board">Board View</option>
                <option value="list">List View</option>
              </select>
              <ChevronDown
                size={15}
                strokeWidth={2}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737685]"
              />
            </div>
          </div>

          {/* Mobile Header Controls */}
          <div className="flex flex-col gap-3 lg:hidden">
            <div className="relative w-full">
              <Search
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737685]"
              />
              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search tasks..."
                aria-label="Search tasks"
                tabIndex={0}
                className="h-11 w-full rounded-[6px] border border-[#d9deeb] bg-[#dbe4ff]/40 pl-9 pr-3 text-[14px] text-[#041b3c] placeholder:text-[#737685] focus:border-[#0052cc] focus:outline-none focus:ring-1 focus:ring-[#0052cc]"
              />
            </div>

            <Link
              href={`/project/${projectId}/tasks/new`}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[4px] bg-[#0052cc] px-4 text-[14px] font-semibold text-white shadow-[0_2px_4px_rgba(0,82,204,0.18)] transition-opacity hover:opacity-95"
            >
              + Create Task
            </Link>
          </div>
        </div>

        {/* Desktop Kanban Board View */}
        {isDesktop && mode === "board" ? (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {boardDragError ? (
              <div
                role="alert"
                className="mb-4 flex items-center justify-between rounded-[6px] border border-[#fda29b] bg-[#fff4f2] px-4 py-3 text-[13px] font-medium text-[#b42318]"
              >
                <span>{boardDragError}</span>
                <button
                  type="button"
                  onClick={() => setBoardDragError(null)}
                  className="cursor-pointer text-[12px] font-semibold text-[#b42318] hover:underline"
                >
                  Dismiss
                </button>
              </div>
            ) : null}

            {isBoardSearchAllZero ? (
              <div
                role="status"
                className="mb-4 rounded-[6px] border border-[#d9deeb] bg-[#f8f9fc] px-4 py-3 text-[13px] font-medium text-[#53627b]"
              >
                No tasks found matching your search
              </div>
            ) : null}

            <div className="hidden lg:block flex-1 overflow-x-auto pb-4">
              <div className="flex gap-6 items-start min-w-max">
                {BOARD_COLUMNS.map((col) => (
                  <TaskColumn
                    key={col.status}
                    projectId={projectId}
                    status={col.status}
                    tasks={boardTasks[col.status]}
                    totalCount={boardTotalCounts[col.status]}
                    loading={boardLoadingInitial[col.status]}
                    error={boardErrorInitial[col.status]}
                    onRetry={() => void fetchBoardColumnInitial(col.status)}
                    onSelectTask={(id) => setSelectedTaskId(id)}
                    hasMore={
                      Math.min(
                        (boardPageIndex[col.status] + 1) * PAGE_SIZE,
                        boardTotalCounts[col.status]
                      ) < boardTotalCounts[col.status]
                    }
                    loadMoreLoading={boardLoadingMore[col.status]}
                    loadMoreError={boardErrorMore[col.status]}
                    onLoadMore={() => void fetchBoardColumnNext(col.status)}
                    onLoadMoreRetry={() => retryBoardColumnMore(col.status)}
                    isDragDisabled={boardDragPending}
                  />
                ))}
              </div>
            </div>
          </DndContext>
        ) : null}

        {/* Desktop List View */}
        {isDesktop && mode === "list" ? (
          <div className="hidden lg:flex flex-1 flex-col pb-4">
            <div className="rounded-[8px] border border-[#e2e6f0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#eef2f6] bg-[#f8f9fc] text-[11px] font-bold uppercase tracking-[0.6px] text-[#737685]">
                      <th scope="col" className="px-6 py-3.5">
                        TASK ID
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        TITLE
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        STATUS
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        DUE DATE
                      </th>
                      <th scope="col" className="px-6 py-3.5">
                        ASSIGNEE
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-right">
                        SETTINGS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {listLoading ? (
                      Array.from({ length: 5 }).map((_, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-[#f0f2f7] animate-pulse"
                        >
                          <td className="px-6 py-4">
                            <div className="h-4 w-16 rounded bg-[#edf0f7]" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-48 rounded bg-[#edf0f7]" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-6 w-24 rounded bg-[#edf0f7]" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="h-4 w-20 rounded bg-[#edf0f7]" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-[#edf0f7]" />
                              <div className="h-4 w-24 rounded bg-[#edf0f7]" />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="inline-block h-6 w-6 rounded bg-[#edf0f7]" />
                          </td>
                        </tr>
                      ))
                    ) : listError ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <p className="text-[14px] font-medium text-[#b42318]">
                              {debouncedSearch
                                ? "Failed to search tasks"
                                : "Failed to load tasks"}
                            </p>
                            <button
                              type="button"
                              onClick={() => void fetchListPage(requestedPage)}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-[4px] bg-[#0052cc] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc]"
                            >
                              <RotateCw size={14} aria-hidden="true" />
                              <span>Retry</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : listTasks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <p className="text-[15px] font-semibold text-[#041b3c]">
                              {debouncedSearch
                                ? "No tasks found matching your search"
                                : "No tasks found for this project"}
                            </p>
                            {!debouncedSearch && (
                              <>
                                <p className="text-[13px] text-[#737685]">
                                  There are no tasks in this project yet.
                                </p>
                                <Link
                                  href={`/project/${projectId}/tasks/new`}
                                  className="inline-flex items-center gap-1.5 rounded-[4px] bg-[#0052cc] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_1px_2px_rgba(0,82,204,0.2)] transition-opacity hover:opacity-90"
                                >
                                  <Plus
                                    size={15}
                                    strokeWidth={2.2}
                                    aria-hidden="true"
                                  />
                                  <span>Add Task</span>
                                </Link>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      listTasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          onSelect={(id) => setSelectedTaskId(id)}
                          onDeleteRequested={handleDeleteRequested}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Functional Pagination Controls */}
              <div className="flex items-center justify-end gap-1.5 border-t border-[#f0f2f7] px-6 py-3">
                <button
                  type="button"
                  onClick={() => void fetchListPage(currentPage - 1)}
                  disabled={listLoading || currentPage === 1}
                  aria-disabled={listLoading || currentPage === 1}
                  aria-label="Previous page"
                  className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#e9eaf3] bg-[#f9f9ff] text-[#041b3c] transition-colors hover:bg-[#eef2f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:cursor-not-allowed disabled:opacity-40 enabled:cursor-pointer"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>

                {pageNumbers.map((p, i) =>
                  typeof p === "string" ? (
                    <span
                      key={`ellipsis-${i}`}
                      aria-hidden="true"
                      className="flex h-8 min-w-8 items-center justify-center text-[13px] text-[#737685]"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        if (p !== currentPage && !listLoading) {
                          void fetchListPage(p);
                        }
                      }}
                      disabled={listLoading}
                      aria-disabled={listLoading}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={`flex h-8 min-w-8 items-center justify-center rounded-[4px] px-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:cursor-not-allowed disabled:opacity-40 ${
                        p === currentPage
                          ? "bg-[#0052cc] text-white cursor-default"
                          : "border border-[#e9eaf3] bg-[#f9f9ff] text-[#041b3c] hover:bg-[#eef2f6] enabled:cursor-pointer"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => void fetchListPage(currentPage + 1)}
                  disabled={
                    listLoading ||
                    totalPages === 0 ||
                    currentPage === totalPages
                  }
                  aria-disabled={
                    listLoading ||
                    totalPages === 0 ||
                    currentPage === totalPages
                  }
                  aria-label="Next page"
                  className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#e9eaf3] bg-[#f9f9ff] text-[#041b3c] transition-colors hover:bg-[#eef2f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:cursor-not-allowed disabled:opacity-40 enabled:cursor-pointer"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Desktop List View Floating Add Button */}
            <Link
              href={`/project/${projectId}/tasks/new`}
              aria-label="Add Task"
              className="fixed bottom-8 right-8 z-20 flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#0052cc] text-white shadow-[0_4px_12px_rgba(0,82,204,0.3)] transition-transform hover:scale-105"
            >
              <Plus size={22} strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </div>
        ) : null}

        {/* Mobile Vertical Task List Layout */}
        {!isDesktop && isDesktop !== null ? (
          <div className="block lg:hidden flex-1">
            {mobileLoadingInitial && mobileTasks.length === 0 ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-28 rounded-[8px] border border-[#d9deeb] bg-[#f0f2f7]" />
                <div className="h-28 rounded-[8px] border border-[#d9deeb] bg-[#f0f2f7]" />
                <div className="h-28 rounded-[8px] border border-[#d9deeb] bg-[#f0f2f7]" />
              </div>
            ) : null}

            {!mobileLoadingInitial &&
            mobileTasks.length === 0 &&
            mobileAllExhausted ? (
              <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-[#d9deeb] bg-[#f8f9ff] px-5 py-12 text-center">
                <p className="text-[16px] font-semibold text-[#041b3c]">
                  {debouncedSearch
                    ? "No tasks found matching your search"
                    : "No tasks found for this project"}
                </p>
                {!debouncedSearch && (
                  <>
                    <p className="mt-1 text-[13px] text-[#68758c]">
                      Get started by creating your first task in this project.
                    </p>
                    <Link
                      href={`/project/${projectId}/tasks/new`}
                      className="mt-5 inline-flex h-11 items-center gap-2 rounded-[6px] bg-[#0052cc] px-6 text-[14px] font-semibold text-white shadow-[0_2px_4px_rgba(0,82,204,0.18)]"
                    >
                      <Plus size={16} strokeWidth={2.2} aria-hidden="true" />
                      Create Task
                    </Link>
                  </>
                )}
              </div>
            ) : null}

            {mobileTasks.length > 0 ? (
              <div className="space-y-3 pb-6">
                {mobileTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    variant="mobile"
                    onSelect={(id) => setSelectedTaskId(id)}
                    onDeleteRequested={handleDeleteRequested}
                  />
                ))}
              </div>
            ) : null}

            {/* Mobile Sentinel & Load-More / Retry controls */}
            {!mobileAllExhausted && !mobileError ? (
              <div
                ref={setMobileSentinelRef}
                aria-hidden="true"
                className="h-1 w-full"
              />
            ) : null}

            {mobileLoadingMore ? (
              <div className="py-4 text-center">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#0052cc] border-t-transparent" />
              </div>
            ) : null}

            {mobileError ? (
              <div className="my-4 flex flex-col items-center justify-center rounded-[8px] border border-dashed border-[#fda29b] bg-[#fff4f2] p-4 text-center">
                <p className="text-[13px] font-medium text-[#b42318]">
                  {debouncedSearch
                    ? "Failed to search tasks"
                    : "Failed to load tasks"}
                </p>
                <button
                  type="button"
                  onClick={handleMobileRetry}
                  className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-[4px] bg-[#0052cc] px-4 py-1.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc]"
                >
                  <RotateCw size={13} aria-hidden="true" />
                  <span>Retry</span>
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Task Details Modal */}
        {selectedTaskId ? (
          <TaskDetailsModal
            projectId={projectId}
            taskId={selectedTaskId}
            onClose={() => setSelectedTaskId(null)}
            onDeleteRequested={
              mode === "board" ? handleBoardDeleteRequested : undefined
            }
            onTaskUpdate={handleTaskUpdate}
          />
        ) : null}

        {/* Task Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={Boolean(taskToDelete)}
          title="Delete Task?"
          description="Are you sure you want to delete this task? This action cannot be undone."
          confirmLabel="Delete Task"
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
