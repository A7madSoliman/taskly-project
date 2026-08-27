"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Link2, ListTodo, X } from "lucide-react";
import {
  EpicsService,
  ProjectEpic,
  UpdateEpicInput,
} from "@/services/api/epics.service";
import {
  ProjectMember,
  ProjectsService,
} from "@/services/api/projects.service";
import { getInitials } from "@/lib/utils/avatar";

interface EpicDetailsModalProps {
  projectId: string;
  epicId: string;
  onClose: () => void;
  onEpicUpdated: (updatedEpic: ProjectEpic) => void;
}

type DetailsStatus = "loading" | "ready" | "error";
type EditableField = "title" | "description" | "assignee" | "deadline";
type MembersStatus = "idle" | "loading" | "ready" | "error";
type UpdateResult = "success" | "failure" | "ignored";

const createdDateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string): string | null {
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
  );
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
}: {
  label: string;
  name?: string | null;
  fallback: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.25px] text-[#929bad]">
        {label}
      </p>
      <div className="mt-2.5 flex min-h-7 items-center gap-2.5">
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
      </div>
    </div>
  );
}

export function EpicDetailsModal({
  projectId,
  epicId,
  onClose,
  onEpicUpdated,
}: EpicDetailsModalProps) {
  const [status, setStatus] = useState<DetailsStatus>("loading");
  const [epic, setEpic] = useState<ProjectEpic | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Record<EditableField, boolean>>({
    title: false,
    description: false,
    assignee: false,
    deadline: false,
  });
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [membersStatus, setMembersStatus] = useState<MembersStatus>("idle");
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const requestSequence = useRef(0);
  const membersRequestSequence = useRef(0);
  const fieldRequestSequence = useRef<Record<EditableField, number>>({
    title: 0,
    description: 0,
    assignee: 0,
    deadline: 0,
  });
  const savingRef = useRef<Record<EditableField, boolean>>({
    title: false,
    description: false,
    assignee: false,
    deadline: false,
  });
  const epicRef = useRef<ProjectEpic | null>(null);
  const assigneeRef = useRef<HTMLDivElement | null>(null);
  const deadlineInputRef = useRef<HTMLInputElement | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showUpdateError = useCallback(() => {
    setToastVisible(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 4000);
  }, []);

  const loadDetails = useCallback(async () => {
    const requestId = ++requestSequence.current;
    setStatus("loading");
    setEpic(null);
    epicRef.current = null;

    const result = await EpicsService.getDetails(projectId, epicId);
    if (requestId !== requestSequence.current) return;

    if (result.error || !result.data) {
      setStatus("error");
      return;
    }

    epicRef.current = result.data;
    setEpic(result.data);
    setTitleDraft(result.data.title);
    setDescriptionDraft(result.data.description ?? "");
    setTitleError(null);
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
      membersRequestSequence.current += 1;
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [loadDetails]);

  useEffect(() => {
    if (!assigneeOpen) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!assigneeRef.current?.contains(event.target as Node)) {
        setAssigneeOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAssigneeOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [assigneeOpen]);

  const updateField = async (
    field: EditableField,
    data: UpdateEpicInput,
    patch: Partial<ProjectEpic>
  ): Promise<UpdateResult> => {
    const currentEpic = epicRef.current;
    if (!currentEpic || savingRef.current[field]) return "ignored";

    const requestId = ++fieldRequestSequence.current[field];
    savingRef.current[field] = true;
    setSaving((current) => ({ ...current, [field]: true }));
    let error: unknown = null;
    try {
      ({ error } = await EpicsService.update(currentEpic.id, data));
    } catch (caughtError) {
      error = caughtError;
    }

    if (requestId !== fieldRequestSequence.current[field]) return "ignored";
    savingRef.current[field] = false;
    setSaving((current) => ({ ...current, [field]: false }));

    if (error) {
      showUpdateError();
      return "failure";
    }

    const latestEpic = epicRef.current;
    if (!latestEpic) return "ignored";
    const updatedEpic = { ...latestEpic, ...patch };
    epicRef.current = updatedEpic;
    setEpic(updatedEpic);
    onEpicUpdated(updatedEpic);
    return "success";
  };

  const handleTitleBlur = async () => {
    const currentEpic = epicRef.current;
    if (!currentEpic || saving.title) return;
    if (titleDraft.trim().length === 0) {
      setTitleError("Title is required.");
      return;
    }
    if (titleDraft === currentEpic.title) {
      setTitleError(null);
      return;
    }

    setTitleError(null);
    const previousTitle = currentEpic.title;
    const result = await updateField(
      "title",
      { title: titleDraft },
      { title: titleDraft }
    );
    if (result === "failure") setTitleDraft(previousTitle);
  };

  const handleDescriptionBlur = async () => {
    const currentEpic = epicRef.current;
    if (!currentEpic || saving.description) return;
    const previousDescription = currentEpic.description ?? "";
    if (descriptionDraft === previousDescription) return;

    const result = await updateField(
      "description",
      { description: descriptionDraft },
      { description: descriptionDraft }
    );
    if (result === "failure") setDescriptionDraft(previousDescription);
  };

  const loadMembers = async () => {
    if (membersStatus === "loading" || membersStatus === "ready") return;
    const requestId = ++membersRequestSequence.current;
    setMembersStatus("loading");
    const { data, error } = await ProjectsService.getMembers(projectId);
    if (requestId !== membersRequestSequence.current) return;
    if (error) {
      setMembersStatus("error");
      return;
    }
    setMembers(data ?? []);
    setMembersStatus("ready");
  };

  const handleAssigneeTrigger = () => {
    if (saving.assignee) return;
    setAssigneeOpen((open) => !open);
    if (!assigneeOpen) void loadMembers();
  };

  const handleAssigneeSelect = async (member: ProjectMember | null) => {
    const currentEpic = epicRef.current;
    if (!currentEpic || saving.assignee) return;

    const nextAssignee = member
      ? {
          sub: member.user_id,
          name: member.metadata?.name || member.email,
          email: member.email,
          department: member.metadata?.job_title || "",
        }
      : null;
    if (currentEpic.assignee?.sub === nextAssignee?.sub) {
      setAssigneeOpen(false);
      return;
    }

    setAssigneeOpen(false);
    await updateField(
      "assignee",
      { assignee_id: nextAssignee?.sub ?? null },
      { assignee: nextAssignee }
    );
  };

  const handleDeadlineChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const currentEpic = epicRef.current;
    if (!currentEpic || saving.deadline) return;
    const nextDeadline = event.target.value || null;
    const previousDeadline = currentEpic.deadline;
    if (nextDeadline === previousDeadline) return;

    const result = await updateField(
      "deadline",
      { deadline: nextDeadline },
      { deadline: nextDeadline }
    );
    if (result === "failure" && deadlineInputRef.current) {
      deadlineInputRef.current.value = previousDeadline ?? "";
    }
  };

  const openDeadlinePicker = () => {
    if (saving.deadline) return;
    const input = deadlineInputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
      } catch {
        input.focus();
      }
    } else {
      input.focus();
      input.click();
    }
  };

  const createdDate = epic ? formatDate(epic.created_at) : null;
  const deadlineDate = epic?.deadline ? formatDate(epic.deadline) : null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[rgba(85,105,143,0.34)] backdrop-blur-[2.5px]"
        aria-hidden="true"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Epic details"
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
            <div className="relative mt-5">
              <input
                id="epic-details-title"
                value={titleDraft}
                onChange={(event) => {
                  setTitleDraft(event.target.value);
                  if (titleError) setTitleError(null);
                }}
                onBlur={handleTitleBlur}
                disabled={saving.title}
                aria-label="Epic title"
                aria-invalid={!!titleError}
                aria-busy={saving.title}
                className={`flex h-[57px] w-full rounded-[10px] border bg-white px-3 text-[20px] font-bold leading-7 text-[#041b3c] outline-none transition-colors sm:text-[21px] ${
                  titleError
                    ? "border-[#d92d20] focus:ring-2 focus:ring-[#fda29b]"
                    : "border-[#cad8ff] focus:ring-2 focus:ring-[#0052cc]"
                } disabled:cursor-wait disabled:bg-[#f8f9fc]`}
              />
              {titleError ? (
                <p
                  className="absolute left-3 top-full mt-1 text-[11px] font-medium text-[#d92d20]"
                  role="alert"
                >
                  {titleError}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 flex h-[57px] items-center rounded-[10px] border border-[#e3e7f1] px-3">
              <span className="h-5 w-2/3 animate-pulse rounded bg-[#e8ebf3]" />
            </div>
          )}
        </header>

        <div className="min-h-0 overflow-y-auto px-6 pb-8 pt-8 [scrollbar-width:none] sm:px-8 sm:pb-8 [&::-webkit-scrollbar]:hidden">
          {status === "loading" ? <DetailsSkeleton /> : null}

          {status === "error" ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center px-4 text-center">
              <h2 className="text-[18px] font-semibold text-[#041b3c]">
                Unable to load epic details
              </h2>
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
              <textarea
                value={descriptionDraft}
                onChange={(event) => setDescriptionDraft(event.target.value)}
                onBlur={handleDescriptionBlur}
                disabled={saving.description}
                aria-label="Epic description"
                aria-busy={saving.description}
                placeholder="No description provided"
                className="min-h-[149px] w-full resize-none rounded-[10px] border border-[#cad8ff] bg-white px-3 py-3 text-[16px] leading-6 text-[#0c284c] outline-none transition-colors placeholder:text-[#0c284c] focus:ring-2 focus:ring-[#0052cc] disabled:cursor-wait disabled:bg-[#f8f9fc]"
              />

              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 border-b border-[#eef0f5] pb-7 sm:grid-cols-3 sm:gap-6 sm:border-b-0 sm:pb-0">
                <Person
                  label="Created by"
                  name={epic.created_by?.name}
                  fallback="Unavailable"
                />

                <div ref={assigneeRef} className="relative min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25px] text-[#929bad]">
                    Assignee
                  </p>
                  <button
                    type="button"
                    onClick={handleAssigneeTrigger}
                    disabled={saving.assignee}
                    aria-label="Change epic assignee"
                    aria-haspopup="listbox"
                    aria-expanded={assigneeOpen}
                    aria-busy={saving.assignee}
                    className="mt-2.5 flex h-10 w-full items-center gap-2.5 rounded-[8px] border border-[#cad8ff] px-2 text-left outline-none transition-colors hover:border-[#9fb8f3] focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:cursor-wait disabled:bg-[#f8f9fc]"
                  >
                    {epic.assignee ? (
                      <span
                        aria-hidden="true"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0052cc] text-[10px] font-semibold text-white"
                      >
                        {getInitials(epic.assignee.name)}
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#041b3c]">
                      {epic.assignee?.name || "Unassigned"}
                    </span>
                    <ChevronDown
                      size={17}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="ml-auto shrink-0 text-[#67758d]"
                    />
                  </button>

                  {assigneeOpen ? (
                    <div
                      role="listbox"
                      aria-label="Project members"
                      className="absolute z-20 mt-2 max-h-52 w-full overflow-y-auto rounded-[8px] border border-[#cad8ff] bg-white p-1 shadow-[0_10px_28px_rgba(4,27,60,0.16)]"
                    >
                      {membersStatus === "loading" ? (
                        <p className="px-2 py-2 text-[12px] text-[#67758d]">
                          Loading members...
                        </p>
                      ) : null}
                      {membersStatus === "error" ? (
                        <button
                          type="button"
                          onClick={() => void loadMembers()}
                          className="w-full rounded-[5px] px-2 py-2 text-left text-[12px] font-medium text-[#0052cc] hover:bg-[#f1f3ff]"
                        >
                          Unable to load members. Retry
                        </button>
                      ) : null}
                      {membersStatus === "ready" ? (
                        <>
                          <button
                            type="button"
                            role="option"
                            aria-selected={!epic.assignee}
                            onClick={() => void handleAssigneeSelect(null)}
                            className="flex w-full items-center gap-2 rounded-[5px] px-2 py-2 text-left text-[13px] text-[#041b3c] hover:bg-[#f1f3ff]"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e8ebf3] text-[10px] font-semibold text-[#67758d]">
                              --
                            </span>
                            <span className="truncate">Unassigned</span>
                          </button>
                          {members.map((member) => {
                            const name = member.metadata?.name || member.email;
                            const selected =
                              epic.assignee?.sub === member.user_id;
                            return (
                              <button
                                key={member.member_id}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                onClick={() =>
                                  void handleAssigneeSelect(member)
                                }
                                className={`flex w-full items-center gap-2 rounded-[5px] px-2 py-2 text-left text-[13px] text-[#041b3c] hover:bg-[#f1f3ff] ${
                                  selected ? "bg-[#eef3ff]" : ""
                                }`}
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0052cc] text-[10px] font-semibold text-white">
                                  {getInitials(name)}
                                </span>
                                <span className="min-w-0 truncate">{name}</span>
                              </button>
                            );
                          })}
                        </>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="relative min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25px] text-[#929bad]">
                    Deadline
                  </p>
                  <input
                    ref={deadlineInputRef}
                    type="date"
                    value={epic.deadline ?? ""}
                    onChange={handleDeadlineChange}
                    aria-label="Epic deadline"
                    className="pointer-events-none absolute h-px w-px opacity-0"
                    tabIndex={-1}
                  />
                  <button
                    type="button"
                    onClick={openDeadlinePicker}
                    disabled={saving.deadline}
                    aria-label="Change epic deadline"
                    aria-busy={saving.deadline}
                    className="mt-2.5 flex h-10 w-full items-center gap-2 rounded-[8px] border border-[#cad8ff] px-2 text-left text-[#041b3c] outline-none transition-colors hover:border-[#9fb8f3] focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:cursor-wait disabled:bg-[#f8f9fc]"
                  >
                    <Image
                      src="/assets/svg/icons/icon-calendar.svg"
                      alt=""
                      width={15}
                      height={15}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium tracking-[-0.1px] sm:text-[14px] sm:tracking-normal">
                      {deadlineDate || "—"}
                    </span>
                    <ChevronDown
                      size={17}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className="ml-auto shrink-0 text-[#67758d]"
                    />
                  </button>
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
                <h2 className="text-[19px] font-semibold text-[#041b3c]">
                  <span className="sm:hidden">Tasks</span>
                  <span className="hidden sm:inline">Epic Tasks</span>
                </h2>
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

        {toastVisible ? (
          <div
            role="alert"
            className="absolute bottom-6 left-6 right-6 z-30 rounded-[8px] border border-[#fda29b] bg-[#fff4f2] px-4 py-3 text-[13px] font-medium text-[#b42318] shadow-[0_8px_20px_rgba(4,27,60,0.14)] sm:left-auto sm:w-[310px]"
          >
            Failed to update epic. Please try again.
          </div>
        ) : null}
      </section>
    </div>
  );
}
