import React from "react";
import Image from "next/image";
import { getInitials } from "@/lib/utils/avatar";
import type { ProjectMember } from "@/services/api/projects.service";

const ROLE_BADGE_STYLES: Record<string, string> = {
  owner: "bg-[#0052cc] text-white",
  admin: "bg-[#d7e2ff] text-[#041b3c]",
  member: "bg-[#e8edff] text-[#041b3c]",
  viewer: "bg-[#f1f3ff] text-[#4f5f7b]",
};

const NEUTRAL_ROLE_FALLBACK = "bg-[#f1f3ff] text-[#4f5f7b]";

export function getRoleBadgeClass(role: string): string {
  return ROLE_BADGE_STYLES[role.toLowerCase()] ?? NEUTRAL_ROLE_FALLBACK;
}

interface MemberRowProps {
  member: ProjectMember;
}

/**
 * TM-14 member presentation unit.
 * Desktop: table row (MEMBER | ROLE | ACTIONS).
 * Mobile: card layout. Rendered by the page inside the matching container.
 */
export function MemberRow({ member }: MemberRowProps) {
  const name = member.metadata?.name;
  const initials = getInitials(name);
  const roleLabel = member.role ? member.role.toUpperCase() : "";
  const badgeClass = getRoleBadgeClass(member.role || "");
  const isOwner = member.role?.toLowerCase() === "owner";

  return (
    <>
      {/* Desktop table row */}
      <tr className="border-b border-[rgba(195,198,214,0.3)] last:border-b-0">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[8px] bg-[#d7e2ff] flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <span className="text-[13px] font-bold text-[#0052cc]">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-[#041b3c] truncate">
                {name}
              </p>
              <p className="text-[12px] text-[#737685] truncate">
                {member.email}
              </p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}
          >
            {roleLabel}
          </span>
        </td>
        <td className="px-9 py-4 text-right">
          {!isOwner && (
            <button
              type="button"
              tabIndex={-1}
              aria-disabled="true"
              className="pointer-events-none p-1 text-[#737685]"
              aria-label={`Actions for ${name || "member"} (not available yet)`}
            >
              <Image
                src="/assets/svg/icons/icon-vertical-actions.svg"
                alt=""
                width={4}
                height={16}
                className="h-4 w-1"
                aria-hidden="true"
              />
            </button>
          )}
        </td>
      </tr>
    </>
  );
}

/** Mobile card variant of the same member data. */
export function MemberCard({ member }: MemberRowProps) {
  const name = member.metadata?.name;
  const initials = getInitials(name);
  const roleLabel = member.role ? member.role.toUpperCase() : "";
  const badgeClass = getRoleBadgeClass(member.role || "");
  const isOwner = member.role?.toLowerCase() === "owner";

  return (
    <div className="bg-white rounded-[8px] border border-[rgba(195,198,214,0.3)] shadow-[0px_1px_3px_0px_rgba(4,27,60,0.05)] p-4 flex items-center gap-3">
      <div
        className="w-11 h-11 rounded-[8px] bg-[#d7e2ff] flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <span className="text-[14px] font-bold text-[#0052cc]">{initials}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-[#041b3c] truncate">
          {name}
        </p>
        <p className="text-[12px] text-[#737685] truncate break-all">
          {member.email}
        </p>
      </div>
      <span
        className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}
      >
        {roleLabel}
      </span>
      {!isOwner && (
        <button
          type="button"
          tabIndex={-1}
          aria-disabled="true"
          className="pointer-events-none ml-1 p-1 text-[#737685]"
          aria-label={`Actions for ${name || "member"} (not available yet)`}
        >
          <Image
            src="/assets/svg/icons/icon-vertical-actions.svg"
            alt=""
            width={4}
            height={16}
            className="h-4 w-1"
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
