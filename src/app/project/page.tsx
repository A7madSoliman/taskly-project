"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectsService, Project } from "@/services/api/projects.service";
import { AuthService } from "@/services/api/auth.service";
import { ProjectCard, AddProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/Button";

export default function ProjectPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchProjectsData = async () => {
      try {
        const { data, error } = await ProjectsService.getAll();
        if (!isMounted) return;

        if (error) {
          const { data: userData, error: userError } =
            await AuthService.getUser();
          if (!isMounted) return;
          if (userError || !userData?.user) {
            router.replace("/login");
            return;
          }

          setHasError(true);
          return;
        }

        setProjects(data || []);
        setHasError(false);
      } catch {
        if (!isMounted) return;
        const { data: userData, error: userError } =
          await AuthService.getUser();
        if (!isMounted) return;
        if (userError || !userData?.user) {
          router.replace("/login");
          return;
        }
        setHasError(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProjectsData();

    return () => {
      isMounted = false;
    };
  }, [router, retryTrigger]);

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    setRetryTrigger((prev) => prev + 1);
  };

  return (
    <AppShell>
      <div className="w-full max-w-[1216px] mx-auto flex flex-col min-h-[calc(100vh-10rem)]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[30px] font-bold text-[#041b3c] tracking-[-0.75px] leading-tight">
              Projects
            </h1>
            <p className="text-[14px] text-[#4f5f7b] mt-1">
              Manage and curate your projects
            </p>
          </div>

          {/* Desktop Top-Right Action */}
          {!hasError && !isLoading && projects.length > 0 && (
            <div className="hidden md:flex items-center">
              <Link href="/project/add">
                <Button
                  variant="primary"
                  fullWidth={false}
                  className="gap-2 h-10 px-4 text-sm font-medium"
                >
                  <Image
                    src="/assets/svg/icons/icon-plus.svg"
                    alt=""
                    width={11}
                    height={11}
                    className="w-[11px] h-[11px]"
                    aria-hidden="true"
                  />
                  <span>Create New Project</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Loading Header CTA Skeleton */}
          {isLoading && (
            <div className="hidden md:block w-44 h-10 bg-slate-200/70 rounded-[4px] animate-pulse" />
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((key) => (
              <div
                key={key}
                className="bg-white rounded-[8px] border border-[rgba(195,198,214,0.3)] shadow-[0px_1px_3px_0px_rgba(4,27,60,0.05)] p-5 min-h-[190px] flex flex-col justify-between animate-pulse"
              >
                <div>
                  <div className="h-5 bg-slate-200 rounded w-3/4 mb-3" />
                  <div className="h-3.5 bg-slate-200/80 rounded w-full mb-2" />
                  <div className="h-3.5 bg-slate-200/80 rounded w-4/5" />
                </div>
                <div className="pt-3 border-t border-[rgba(195,198,214,0.2)] flex items-center justify-between">
                  <div className="h-3 bg-slate-200/60 rounded w-16" />
                  <div className="h-3 bg-slate-200/60 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && hasError && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="w-12 h-12 rounded-xl bg-[#fee4e2] flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d92d20"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0-4 7h1.26A5 5 0 0 0 7 17h11" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-[#041b3c] mb-2">
              Something went wrong
            </h2>
            <p className="text-[14px] text-[#4f5f7b] max-w-sm mb-6 leading-relaxed">
              We&apos;re having trouble retrieving your projects right now.
              Please try again in a moment.
            </p>
            <Button
              variant="primary"
              onClick={handleRetry}
              className="h-10 px-5 text-sm font-medium"
            >
              Retry Connection
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasError && projects.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4">
            <div className="mb-6 relative flex items-center justify-center">
              <div className="w-56 h-56 relative flex items-center justify-center">
                <Image
                  src="/assets/svg/illustrations/illustration-empty-projects.svg"
                  alt=""
                  width={224}
                  height={224}
                  className="w-full h-full object-contain"
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#0052cc]/10 flex items-center justify-center">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0052cc"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="5" r="2" />
                      <path d="m9 20 3-6 3 6" />
                      <path d="m6 8 6 2 6-2" />
                      <path d="M12 10v4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-[24px] font-bold text-[#041b3c] mb-2">
              No Projects
            </h2>
            <p className="text-[14px] text-[#4f5f7b] max-w-md mb-6 leading-relaxed">
              You don’t have any projects yet. Start by defining your first
              architectural workspace to begin tracking tasks and epics.
            </p>
            <Link href="/project/add">
              <Button
                variant="primary"
                className="gap-2 h-10 px-5 text-sm font-medium"
              >
                <Image
                  src="/assets/svg/icons/icon-plus.svg"
                  alt=""
                  width={11}
                  height={11}
                  className="w-[11px] h-[11px]"
                  aria-hidden="true"
                />
                <span>Create New Project</span>
              </Button>
            </Link>
          </div>
        )}

        {/* Populated State */}
        {!isLoading && !hasError && projects.length > 0 && (
          <>
            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
              {/* Desktop Dashed Add Project Card */}
              <div className="hidden lg:block">
                <AddProjectCard />
              </div>
            </div>

            {/* Desktop Project Count Summary */}
            <div className="hidden md:flex items-center justify-between mt-10 pt-6 border-t border-[rgba(195,198,214,0.2)]">
              <span className="text-[14px] text-[#4f5f7b]">
                Showing {projects.length} of {projects.length} active projects
              </span>
            </div>

            {/* Mobile Floating Action Button (FAB) */}
            <Link
              href="/project/add"
              className="fixed bottom-6 right-6 md:hidden z-30 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all"
              aria-label="Create New Project"
            >
              <Image
                src="/assets/svg/icons/icon-plus.svg"
                alt=""
                width={16}
                height={16}
                className="w-4 h-4"
                aria-hidden="true"
              />
            </Link>
          </>
        )}
      </div>
    </AppShell>
  );
}
