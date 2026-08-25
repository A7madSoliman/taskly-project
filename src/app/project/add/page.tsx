"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ProjectsService } from "@/services/api/projects.service";

export default function AddProjectPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {}
  );

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
      const { error } = await ProjectsService.create({
        name: name.trim(),
        description: description || undefined,
      });

      if (error) {
        setSubmitError(`Failed to create project: ${error.message}`);
      } else {
        setSubmitSuccess(true);
        setName("");
        setDescription("");
        setErrors({});
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setSubmitError(`Failed to create project: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-[1024px] mx-auto py-2">
        {/* Desktop Breadcrumbs and Main Page Heading */}
        <div className="hidden lg:block mb-6">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-2">
            Projects <span className="text-slate-300 mx-1">›</span> Add New
            Project
          </div>
          <h1 className="text-[32px] font-bold text-[#041b3c] tracking-[-0.5px]">
            Add New Project
          </h1>
        </div>

        {/* Global Feedback Banners */}
        {submitSuccess && (
          <div className="bg-[#f1f3ff] border border-[rgba(0,82,204,0.2)] text-[#0052cc] rounded-[8px] px-4 py-3 text-[14px] font-semibold mb-6 flex justify-between items-center animate-in fade-in duration-200">
            <span>Project created successfully</span>
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

        {/* Desktop Design Container (Card Layout) */}
        <div className="hidden lg:block bg-white rounded-lg border border-[rgba(195,198,214,0.3)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.05)] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
            {/* Initialize Header with decorative icon */}
            <div className="flex items-start gap-4 pb-6 border-b border-[rgba(195,198,214,0.2)]">
              <div className="w-12 h-12 bg-[#f1f3ff] rounded-lg flex items-center justify-center text-[#0052cc] shrink-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12L11 14L15 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-[#041b3c]">
                  Initialize New Project
                </h2>
                <p className="text-[13px] text-slate-500 mt-1">
                  Define the scope and foundational details of your project.
                </p>
              </div>
            </div>

            {/* Title Field */}
            <Input
              label="PROJECT TITLE *"
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={errors.name}
              disabled={isSubmitting}
              required
            />

            {/* Description Field */}
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

            {/* Desktop Action Row */}
            <div className="flex items-center justify-between pt-6 border-t border-[rgba(195,198,214,0.2)] mt-2">
              <Link
                href="/project"
                className="text-[14px] font-bold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none focus:underline"
              >
                Back
              </Link>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="px-6 py-3 min-w-[140px]"
              >
                Create Project
              </Button>
            </div>
          </form>

          {/* Attached Pro Tip footer */}
          <div className="bg-[#f1f3ff] px-8 py-4 border-t border-[rgba(195,198,214,0.2)] text-[12px] text-[#0052cc] flex items-center gap-2">
            <span role="img" aria-label="lightbulb">
              💡
            </span>
            <span className="font-medium">
              Pro Tip: You can invite project members and assign epics
              immediately after the initial creation process.
            </span>
          </div>
        </div>

        {/* Mobile Design Container (Direct Flat Layout) */}
        <div className="block lg:hidden px-2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Header info directly on canvas */}
            <div>
              <h1 className="text-[24px] font-bold text-[#041b3c] tracking-[-0.5px]">
                Initialize New Project
              </h1>
              <p className="text-[14px] text-slate-500 mt-1">
                Define the scope and foundational details of your project.
              </p>
            </div>

            {/* Title Field */}
            <Input
              label="PROJECT TITLE *"
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={errors.name}
              disabled={isSubmitting}
              required
            />

            {/* Description Field */}
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
                {description.length} / 500
              </div>
            </div>

            {/* Mobile Actions Stack */}
            <div className="flex flex-col gap-4 mt-4">
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full py-3.5"
              >
                Create Project
              </Button>
              <Link
                href="/project"
                className="text-[14px] font-bold text-[#0052cc] hover:text-[#003d99] transition-colors py-2 text-center focus:outline-none focus:underline"
              >
                Back
              </Link>
            </div>

            {/* Detached Pro Tip Card */}
            <div className="bg-[#f1f3ff] rounded-xl p-4 mt-4 border border-[rgba(195,198,214,0.1)]">
              <h3 className="text-[13px] font-bold text-[#0052cc] mb-1">
                Pro Tip
              </h3>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                You can invite project members and assign epics immediately
                after the initial creation process.
              </p>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
