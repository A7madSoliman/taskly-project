import React from "react";

/**
 * TM-14 loading skeleton unit (PRESERVED DESIGN, members-loading-desktop).
 * Circular avatar placeholder + longer name bar + shorter email bar + role pill.
 */
export function MemberSkeleton() {
  return (
    <div
      data-testid="member-skeleton"
      className="flex items-center gap-3 py-4"
      aria-hidden="true"
    >
      {/* Avatar placeholder */}
      <div className="w-10 h-10 rounded-full bg-[#eceef5] shrink-0 animate-pulse" />
      {/* Name + email bars */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3.5 w-40 rounded bg-[#eceef5] animate-pulse" />
        <div className="h-3 w-28 rounded bg-[#eceef5] animate-pulse" />
      </div>
      {/* Role pill */}
      <div className="w-16 h-6 rounded-full bg-[#eceef5] shrink-0 animate-pulse" />
    </div>
  );
}

export function MemberSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-[rgba(195,198,214,0.3)]">
      {Array.from({ length: count }, (_, i) => (
        <MemberSkeleton key={i} />
      ))}
    </div>
  );
}
