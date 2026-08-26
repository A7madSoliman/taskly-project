"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ProjectsService } from "@/services/api/projects.service";
import { Lightbulb, SquarePen } from "lucide-react";

type PreloadStatus = "loading" | "error" | "not-found" | "ready";

export default function ProjectEditPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const [status, setStatus] = useState<PreloadStatus>("loading");
  const [preloadError, setPreloadError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {}
  );

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      setStatus("loading");
      setPreloadError(null);

      try {
        const { data, error } = await ProjectsService.getById(projectId);

        if (!isMounted) return;

        if (error) {
          setPreloadError(error.message || "Failed to load project.");
          setStatus("error");
          return;
        }

        if (!data) {
          setStatus("not-found");
          return;
        }

        setName(data.name);
        setDescription(data.description ?? "");
        setStatus("ready");
      } catch (err: unknown) {
        if (!isMounted) return;
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load project.";
        setPreloadError(errorMessage);
        setStatus("error");
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const validate = () => {
    const newErrors: { name?: string; description?: string } = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      newErrors.name = "Project name must be at least 3 characters.";
    } else if (trimmedName.length < 3) {
      newErrors.name = "Project name must be at least 3 characters.";
    } else if (trimmedName.length > 100) {
      newErrors.name = "Project name cannot exceed 100 characters.";
    }

    if (description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);
    setSubmitSuccess(false);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const trimmedName = name.trim();
      const trimmedDescription = description.trim();

      const { error } = await ProjectsService.update(projectId, {
        name: trimmedName,
        description: trimmedDescription.length > 0 ? trimmedDescription : null,
      });

      if (error) {
        setSubmitError(`Failed to update project: ${error.message}`);
      } else {
        setSubmitSuccess(true);
        setErrors({});
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setSubmitError(`Failed to update project: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = (
    <>
      <Input
        label="PROJECT TITLE *"
        placeholder="Project Title"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
        }}
        error={errors.name}
        disabled={isSubmitting}
        required
      />

      <div className="flex flex-col w-full relative">
        <Textarea
          label="DESCRIPTION"
          placeholder="Provide a high-level overview of the project's architectural objectives and key milestones..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description)
              setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          error={errors.description}
          disabled={isSubmitting}
          required={false}
          maxLength={500}
          rows={5}
        />
        <div className="text-right text-[11px] text-slate-400 mt-1 px-1">
          {description.length} / 500 characters
        </div>
      </div>
    </>
  );

  const feedbackBanners = (
    <>
      {submitSuccess && (
        <div className="bg-[#f1f3ff] border border-[rgba(0,82,204,0.2)] text-[#0052cc] rounded-[8px] px-4 py-3 text-[14px] font-semibold mb-6 flex justify-between items-center animate-in fade-in duration-200">
          <span>Changes saved successfully.</span>
          <button
            type="button"
            onClick={() => setSubmitSuccess(false)}
            className="text-[#0052cc] hover:text-[#003d99] focus:outline-none"
            aria-label="Dismiss success message"
          >
            ✕
          </button>
        </div>
      )}

      {submitError && (
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
      )}
    </>
  );

  return (
    <AppShell>
      {/* Preload loading */}
      {status === "loading" && (
        <div className="w-full max-w-[1216px] mx-auto py-2 flex justify-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Preload API failure */}
      {status === "error" && (
        <div className="w-full max-w-[1216px] mx-auto py-2">
          <div className="bg-white rounded-lg border border-[rgba(195,198,214,0.3)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] p-8 flex flex-col items-center gap-4">
            <p className="text-[14px] font-semibold text-[#d92d20]">
              Failed to load project: {preloadError}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                fullWidth={false}
                onClick={() => setStatus("loading")}
                className="px-6"
              >
                Retry
              </Button>
              <Link
                href="/project"
                className="text-[14px] font-bold text-slate-500 hover:text-slate-800 transition-colors self-center focus:outline-none focus:underline"
              >
                Back to Projects
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Project not found */}
      {status === "not-found" && (
        <div className="w-full max-w-[1216px] mx-auto py-2">
          <div className="bg-white rounded-lg border border-[rgba(195,198,214,0.3)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] p-8 flex flex-col items-center gap-4">
            <p className="text-[14px] font-semibold text-[#d92d20]">
              Project not found.
            </p>
            <Link
              href="/project"
              className="text-[14px] font-bold text-[#0052cc] hover:text-[#003d99] transition-colors focus:outline-none focus:underline"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      )}

      {/* Edit form */}
      {status === "ready" && (
        <div className="max-w-[1024px] mx-auto py-2">
          {/* Desktop Breadcrumbs and Main Page Heading */}
          <div className="hidden lg:block mb-6">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-2">
              Projects <span className="text-slate-300 mx-1">›</span> Project
              Title <span className="text-slate-300 mx-1">›</span>{" "}
              <span className="font-bold text-[#0052cc]">Edit</span>
            </div>
            <h1 className="text-[32px] font-bold text-[#041b3c] tracking-[-0.5px]">
              Edit Project
            </h1>
          </div>

          {/* Desktop Design Container (Card Layout) */}
          <div className="hidden lg:block bg-white rounded-lg border border-[rgba(195,198,214,0.3)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] overflow-hidden">
            {feedbackBanners}
            <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
              {/* Card Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-[rgba(195,198,214,0.2)]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] bg-[#e3e9ff] text-[#0052cc]">
                  <SquarePen size={22} strokeWidth={1.9} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-[18px] font-bold leading-6 text-[#041b3c]">
                    Edit Project
                  </h2>
                  <p className="mt-1 text-[14px] leading-5 text-[#737685]">
                    Define the scope and foundational details of your project.
                  </p>
                </div>
              </div>

              {formFields}

              {/* Desktop Action Row */}
              <div className="flex items-center justify-between w-full pt-6 border-t border-[rgba(195,198,214,0.2)] mt-2">
                <Link
                  href="/project"
                  className="text-[14px] font-bold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none focus:underline"
                >
                  Back
                </Link>
                <Button
                  type="submit"
                  fullWidth={false}
                  isLoading={isSubmitting}
                  className="px-6 py-3 shrink-0"
                >
                  Save Changes
                </Button>
              </div>
            </form>
            <div className="flex items-center gap-3 border-t border-[rgba(195,198,214,0.25)] bg-[#f7f8ff] px-8 py-5 text-[13px] leading-5 text-[#4f5f7b]">
              <Lightbulb
                size={19}
                strokeWidth={1.9}
                className="shrink-0 text-[#0052cc]"
                aria-hidden="true"
              />
              <p>
                <span className="font-semibold text-[#041b3c]">Pro Tip:</span>{" "}
                You can invite project members and assign epics immediately
                after the initial creation process.
              </p>
            </div>
          </div>

          {/* Mobile Design Container (Flat Layout) — MINIMAL RESPONSIVE ENGINEERING ADAPTATION */}
          <div className="block lg:hidden px-2">
            {feedbackBanners}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <h1 className="text-[24px] font-bold text-[#041b3c] tracking-[-0.5px]">
                Edit Project
              </h1>

              {formFields}

              {/* Mobile Actions Stack */}
              <div className="flex flex-col gap-4 mt-4">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full py-3.5"
                >
                  Save Changes
                </Button>
                <Link
                  href="/project"
                  className="text-[14px] font-bold text-[#0052cc] hover:text-[#003d99] transition-colors py-2 text-center focus:outline-none focus:underline"
                >
                  Back
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
