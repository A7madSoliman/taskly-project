"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/api/auth.service";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";

export interface AppShellProps {
  children: React.ReactNode;
}

interface UserMetadataState {
  name: string;
  jobTitle: string;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userMetadata, setUserMetadata] = useState<UserMetadataState>({
    name: "",
    jobTitle: "",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      try {
        const { data, error } = await AuthService.getUser();
        if (!isMounted) return;

        if (error || !data.user) {
          router.replace("/login");
          return;
        }

        const metadata = data.user.user_metadata || {};
        setUserMetadata({
          name: metadata.name || metadata.full_name || "",
          jobTitle: metadata.job_title || metadata.role || "",
        });
      } catch {
        if (isMounted) {
          router.replace("/login");
        }
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#f9f9ff] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-row relative text-neutral">
      {/* Desktop Left Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        userName={userMetadata.name}
        jobTitle={userMetadata.jobTitle}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Navbar */}
        <Navbar
          userName={userMetadata.name}
          jobTitle={userMetadata.jobTitle}
          onMenuClick={() => setIsMobileOpen(true)}
        />

        {/* Main Content Area Canvas */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
