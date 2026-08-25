import React from "react";
import Image from "next/image";

export function AuthHeader() {
  return (
    <header className="w-full max-w-[1280px] h-[80px] px-6 md:px-10 flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-2">
        <Image
          src="/assets/svg/brand/logo-taskly.svg"
          alt="Taskly Logo"
          width={18}
          height={20}
          className="shrink-0"
          priority
        />
        <span className="font-bold text-[20px] text-neutral tracking-[-0.5px]">
          TASKLY
        </span>
      </div>
    </header>
  );
}
