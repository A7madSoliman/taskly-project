"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { EpicsService } from "@/services/api/epics.service";
import {
  ProjectsService,
  ProjectMember,
} from "@/services/api/projects.service";

type FormErrors = {
  title?: string;
  deadline?: string;
};

/** Local-calendar today as YYYY-MM-DD (avoids UTC off-by-one). */
const getTodayLocal = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function NewEpicPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [deadline, setDeadline] = useState("");

  const [projectName, setProjectName] = useState("Project");
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Breadcrumb: reuse TM-13 getById (non-fatal on failure).
  useEffect(() => {
    let isMounted = true;
    ProjectsService.getById(projectId).then(({ data }) => {
      if (isMounted && data) setProjectName(data.name);
    });
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Optional assignee source: TM-14 members read. Failure must not block the form.
  useEffect(() => {
    let isMounted = true;
    ProjectsService.getMembers(projectId)
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setMembersError("Unable to load project members.");
          return;
        }
        setMembers(data ?? []);
      })
      .catch(() => {
        if (isMounted) setMembersError("Unable to load project members.");
      });
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle || trimmedTitle.length < 3) {
      newErrors.title = "Title must be at least 3 characters.";
    }

    if (deadline && deadline < getTodayLocal()) {
      newErrors.deadline = "Deadline must be today or a future date.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const trimmedDescription = description.trim();

      const { error } = await EpicsService.create(projectId, {
        title: title.trim(),
        description: trimmedDescription || null,
        assignee_id: assigneeId || null,
        deadline: deadline || null,
      });

      if (error) {
        setSubmitError(`Failed to create epic: ${error.message}`);
      } else {
        router.push(`/project/${projectId}/epics`);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setSubmitError(`Failed to create epic: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackBanner =
    submitError !== null ? (
      <div className="bg-[#fee4e2] border border-[#f04438] text-[#d92d20] rounded-[8px] px-4 py-3 text-[14px] font-semibold mb-6 flex justify-between items-center animate-in fade-in duration-200">
        <span>{submitError}</span>
        <button
          type="button"
          onClick={() => setSubmitError(null)}
          className="text-[#d92d20] hover:text-[#b42318] focus:outline-none"
          aria-label="Dismiss error message"
        >
          ✕
        </button>
      </div>
    ) : null;

  const formFields = (
    <>
      <Input
        label="TITLE *"
        placeholder="e.g. Structural Foundation Phase"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (errors.title)
            setErrors((prev) => ({ ...prev, title: undefined }));
        }}
        error={errors.title}
        disabled={isSubmitting}
        required
      />

      <Textarea
        label="DESCRIPTION"
        placeholder="Describe the scope and objectives of this epic..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={isSubmitting}
        required={false}
        rows={5}
      />

      {/* Assignee — optional select fed by project members */}
      <div className="flex flex-col w-full relative">
        <label
          htmlFor="epic-assignee"
          className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1"
        >
          ASSIGNEE
        </label>
        <div className="relative">
          <select
            id="epic-assignee"
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            disabled={isSubmitting}
            className="flex h-[48px] w-full items-center bg-surface-highest px-4 py-3 pr-10 rounded-sm text-neutral text-[16px] outline-none focus:ring-2 focus:ring-primary-container transition-all appearance-none"
          >
            <option value="">Select a member...</option>
            {members.map((member) => (
              <option key={member.member_id} value={member.user_id}>
                {member.metadata?.name || member.email}
              </option>
            ))}
          </select>
          <Image
            src="/assets/svg/icons/icon-chevron-dropdown.svg"
            alt=""
            width={12}
            height={8}
            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
        </div>
        {membersError && (
          <p className="text-error text-[11px] mt-1 px-1" role="alert">
            {membersError}
          </p>
        )}
      </div>

      {/* Deadline — optional date input */}
      <Input
        label="DEADLINE"
        type="date"
        min={getTodayLocal()}
        value={deadline}
        onChange={(e) => {
          setDeadline(e.target.value);
          if (errors.deadline)
            setErrors((prev) => ({ ...prev, deadline: undefined }));
        }}
        error={errors.deadline}
        disabled={isSubmitting}
      />
    </>
  );

  const desktopFormFields = (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[160px_minmax(0,1fr)] items-start gap-6">
        <label
          htmlFor="epic-title-desktop"
          className="pt-4 text-[11px] font-bold uppercase tracking-[0.55px] text-slate-700"
        >
          TITLE <span className="text-error">*</span>
        </label>
        <div>
          <input
            id="epic-title-desktop"
            placeholder="e.g. Structural Foundation Phase"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title)
                setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            disabled={isSubmitting}
            required
            aria-invalid={!!errors.title}
            className={`h-12 w-full rounded-sm bg-surface-highest px-4 text-[16px] text-neutral outline-none transition-all placeholder:text-[#737685] focus:ring-2 focus:ring-primary-container ${errors.title ? "ring-2 ring-error" : ""}`}
          />
          {errors.title && (
            <p className="mt-1 px-1 text-[11px] text-error" role="alert">
              {errors.title}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-[160px_minmax(0,1fr)] items-start gap-6">
        <div className="pt-3">
          <label
            htmlFor="epic-description-desktop"
            className="text-[11px] font-bold uppercase tracking-[0.55px] text-slate-700"
          >
            DESCRIPTION
          </label>
          <p className="mt-1 text-[11px] font-medium text-[#737685]">
            Optional
          </p>
        </div>
        <textarea
          id="epic-description-desktop"
          rows={5}
          placeholder="Describe the scope and objectives of this epic..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          className="min-h-[136px] w-full resize-y rounded-sm bg-surface-highest px-4 py-3 text-[16px] text-neutral outline-none transition-all placeholder:text-[#737685] focus:ring-2 focus:ring-primary-container"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 border-t border-[rgba(195,198,214,0.2)] pt-6">
        <div className="flex flex-col">
          <label
            htmlFor="epic-assignee-desktop"
            className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.55px] text-slate-700"
          >
            ASSIGNEE
          </label>
          <div className="relative">
            <select
              id="epic-assignee-desktop"
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={isSubmitting}
              className="h-12 w-full appearance-none rounded-sm bg-surface-highest px-4 pr-10 text-[16px] text-neutral outline-none transition-all focus:ring-2 focus:ring-primary-container"
            >
              <option value="">Select a member...</option>
              {members.map((member) => (
                <option key={member.member_id} value={member.user_id}>
                  {member.metadata?.name || member.email}
                </option>
              ))}
            </select>
            <Image
              src="/assets/svg/icons/icon-chevron-dropdown.svg"
              alt=""
              width={12}
              height={8}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
          </div>
          {membersError && (
            <p className="mt-1 px-1 text-[11px] text-error" role="alert">
              {membersError}
            </p>
          )}
        </div>

        <Input
          id="epic-deadline-desktop"
          label="DEADLINE"
          type="date"
          min={getTodayLocal()}
          value={deadline}
          onChange={(e) => {
            setDeadline(e.target.value);
            if (errors.deadline)
              setErrors((prev) => ({ ...prev, deadline: undefined }));
          }}
          error={errors.deadline}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="max-w-[1024px] mx-auto py-2">
        {/* Desktop breadcrumb + heading */}
        <div className="hidden lg:block mb-6">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-2">
            Projects <span className="text-slate-300 mx-1">›</span>{" "}
            {projectName} <span className="text-slate-300 mx-1">›</span> Epics{" "}
            <span className="text-slate-300 mx-1">›</span>{" "}
            <span className="font-bold text-[#0052cc]">New Epic</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#041b3c] tracking-[-0.5px]">
            Create New Epic
          </h1>
          <p className="text-[14px] text-slate-500 mt-1">
            Define a major project phase or high-level milestone to group
            related tasks and track independent progress.
          </p>
        </div>

        {feedbackBanner}

        {/* Desktop card layout */}
        <div className="hidden lg:block bg-white rounded-lg border border-[rgba(195,198,214,0.3)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
            {desktopFormFields}

            <div className="flex items-center justify-end gap-4 w-full pt-6 border-t border-[rgba(195,198,214,0.2)] mt-2">
              <Link
                href={`/project/${projectId}/epics`}
                className="text-[14px] font-bold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none focus:underline"
              >
                Cancel
              </Link>
              <Button
                type="submit"
                fullWidth={false}
                isLoading={isSubmitting}
                className="px-6 py-3 shrink-0"
              >
                Create Epic
              </Button>
            </div>
          </form>
        </div>

        {/* Mobile flat layout */}
        <div className="block lg:hidden px-2 mt-4">
          <h1 className="text-[24px] font-bold text-[#041b3c] tracking-[-0.5px]">
            Create New Epic
          </h1>
          <p className="text-[14px] text-slate-500 mt-1 mb-6">
            Define a high-level goal and organizational structure for your
            architectural phase.
          </p>

          {feedbackBanner}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {formFields}

            <div className="flex flex-col gap-4 mt-4">
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full py-3.5"
              >
                Create Epic
              </Button>
              <Link
                href={`/project/${projectId}/epics`}
                className="text-[14px] font-bold text-[#0052cc] hover:text-[#003d99] transition-colors py-2 text-center focus:outline-none focus:underline"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
