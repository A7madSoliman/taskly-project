"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { MemberCard, MemberRow } from "@/components/members/MemberRow";
import { MemberSkeletonList } from "@/components/members/MemberSkeleton";
import { InviteMemberModal } from "@/components/members/InviteMemberModal";
import { ProjectMobileBottomNav } from "@/components/layout/ProjectMobileBottomNav";
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
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const focusTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear focus restoration timer on unmount / project change
  useEffect(() => {
    return () => {
      if (focusTimerRef.current) {
        clearTimeout(focusTimerRef.current);
        focusTimerRef.current = null;
      }
    };
  }, [projectId]);

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

  const handleOpenInviteModal = () => {
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    }
    setSuccessMessage(null);
    setIsInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setIsInviteModalOpen(false);
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
    }
    // Restore focus to Invite Member CTA
    focusTimerRef.current = setTimeout(() => {
      document.getElementById("invite-member-cta-btn")?.focus();
    }, 50);
  };

  const handleInviteSuccess = () => {
    setSuccessMessage("Invitation sent successfully.");
  };

  const headerSection = (
    <>
      {/* Breadcrumb */}
      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-2">
        Projects <span className="text-slate-300 mx-1">›</span> {projectName}{" "}
        <span className="text-slate-300 mx-1">›</span>{" "}
        <span className="font-bold text-[#0052cc]">Members</span>
      </div>
      {/* Heading + CTA row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-[30px] font-bold text-[#041b3c] tracking-[-0.5px]">
          Project Members
        </h1>
        <Button
          id="invite-member-cta-btn"
          type="button"
          fullWidth={false}
          onClick={handleOpenInviteModal}
          className="h-12 px-6 shrink-0 shadow-[0_5px_12px_rgba(0,82,204,0.20)] hover:opacity-95 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Image
              src="/assets/svg/icons/icon-user-invite-plus.svg"
              alt=""
              width={18}
              height={18}
              className="brightness-0 invert"
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
      <div className="w-full max-w-[1216px] mx-auto py-2 pb-24 lg:pb-2">
        {headerSection}

        {/* Success Alert */}
        {successMessage && (
          <div
            role="status"
            className="mt-4 flex items-center justify-between rounded-[6px] border border-[#a6f4c5] bg-[#edfcf2] px-4 py-3 text-[13px] font-medium text-[#027a48]"
          >
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="cursor-pointer text-[12px] font-semibold text-[#027a48] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Invite Member Modal */}
        <InviteMemberModal
          projectId={projectId}
          isOpen={isInviteModalOpen}
          onClose={handleCloseInviteModal}
          onSuccess={handleInviteSuccess}
        />

        {/* Content container */}
        <div className="mx-auto mt-6 w-full max-w-[790px] bg-white rounded-lg border border-[rgba(195,198,214,0.3)] shadow-[0px_1px_3px_0px_rgba(4,27,60,0.05)] overflow-hidden md:mt-20">
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
                      <th className="w-1/2 px-9 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#737685]">
                        MEMBER
                      </th>
                      <th className="w-1/4 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-[#737685]">
                        ROLE
                      </th>
                      <th className="w-1/4 px-9 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-[#737685]">
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

        {/* Mobile Fixed Bottom Navigation Bar */}
        <ProjectMobileBottomNav projectId={projectId} />
      </div>
    </AppShell>
  );
}
