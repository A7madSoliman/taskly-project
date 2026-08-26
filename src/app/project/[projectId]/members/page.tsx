"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { MemberCard, MemberRow } from "@/components/members/MemberRow";
import { MemberSkeletonList } from "@/components/members/MemberSkeleton";
import {
  ProjectsService,
  ProjectMember,
} from "@/services/api/projects.service";

type MembersStatus = "loading" | "error" | "empty" | "ready";

export default function ProjectMembersPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const [status, setStatus] = useState<MembersStatus>("loading");
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [projectName, setProjectName] = useState<string>("Project");

  // Preload the project name for the breadcrumb (reuses TM-13 getById service).
  useEffect(() => {
    let isMounted = true;
    ProjectsService.getById(projectId).then(({ data }) => {
      if (isMounted && data) setProjectName(data.name);
    });
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const loadMembers = useCallback(async () => {
    try {
      const { data, error } = await ProjectsService.getMembers(projectId);
      if (error) {
        setStatus("error");
        return;
      }
      if (!data || data.length === 0) {
        setMembers([]);
        setStatus("empty");
        return;
      }
      setMembers(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [projectId]);

  useEffect(() => {
    // Initial load: mark loading synchronously via render-phase default,
    // then resolve asynchronously (setState only in async callbacks).
    let isMounted = true;
    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;
      await loadMembers();
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [loadMembers]);

  const headerSection = (
    <>
      {/* Breadcrumb */}
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-2">
        Projects <span className="text-slate-300 mx-1">›</span> {projectName}{" "}
        <span className="text-slate-300 mx-1">›</span> Members
      </div>
      {/* Heading + CTA row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-[30px] font-bold text-[#041b3c] tracking-[-0.5px]">
          Project Members
        </h1>
        <Button
          type="button"
          fullWidth={false}
          tabIndex={-1}
          aria-disabled="true"
          className="px-5 py-2.5 pointer-events-none shrink-0"
        >
          <span className="flex items-center gap-2">
            <Image
              src="/assets/svg/icons/icon-user-invite-plus.svg"
              alt=""
              width={18}
              height={18}
              aria-hidden="true"
            />
            Invite Member
          </span>
        </Button>
      </div>
    </>
  );

  return (
    <AppShell>
      <div className="w-full max-w-[1216px] mx-auto py-2">
        {headerSection}

        {/* Content container */}
        <div className="mt-6 bg-white rounded-lg border border-[rgba(195,198,214,0.3)] shadow-[0px_1px_3px_0px_rgba(4,27,60,0.05)] overflow-hidden">
          {/* Loading — PRESERVED skeleton structure (desktop) / card adaptation (mobile) */}
          {status === "loading" && (
            <div className="p-6">
              {/* Desktop: table headers hidden during loading per preserved reference */}
              <div className="hidden md:block">
                <MemberSkeletonList count={4} />
              </div>
              {/* Mobile: same unit adapted into stacked cards */}
              <div className="md:hidden flex flex-col gap-4">
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-[8px] border border-[rgba(195,198,214,0.3)] p-4"
                  >
                    <MemberSkeletonList count={1} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error — preserved layout structure, official Task copy, icon omitted (asset gap) */}
          {status === "error" && (
            <div className="p-10 flex flex-col items-center text-center gap-3">
              <h2 className="text-[20px] font-bold text-[#041b3c]">
                Something went wrong
              </h2>
              <p className="text-[14px] text-[#737685]">
                Failed to load project members. Please try again.
              </p>
              <Button
                type="button"
                fullWidth={false}
                onClick={loadMembers}
                className="mt-2 px-6 py-2.5"
              >
                Retry Connection
              </Button>
            </div>
          )}

          {/* Empty — MINIMAL ENGINEERING FALLBACK */}
          {status === "empty" && (
            <div className="p-10 flex flex-col items-center text-center gap-2">
              <h2 className="text-[18px] font-bold text-[#041b3c]">
                No members yet.
              </h2>
              <p className="text-[14px] text-[#737685]">
                Members invited to this project will appear here.
              </p>
            </div>
          )}

          {/* Populated — Desktop table / Mobile cards */}
          {status === "ready" && (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(195,198,214,0.3)]">
                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#737685]">
                        MEMBER
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#737685]">
                        ROLE
                      </th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#737685]">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <MemberRow key={member.member_id} member={member} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden flex flex-col gap-4 p-2">
                {members.map((member) => (
                  <MemberCard key={member.member_id} member={member} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
