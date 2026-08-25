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
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
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

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const { error } = await AuthService.logout();
      if (error) {
        setLogoutError("Logout failed, please try again.");
        setIsLoggingOut(false);
      } else {
        router.replace("/login");
      }
    } catch {
      setLogoutError("Logout failed, please try again.");
      setIsLoggingOut(false);
    }
  };

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
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        userName={userMetadata.name}
        jobTitle={userMetadata.jobTitle}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Navbar */}
        <Navbar
          userName={userMetadata.name}
          jobTitle={userMetadata.jobTitle}
          onMenuClick={() => setIsMobileOpen(true)}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />

        {/* Global Error Banner for App Shell */}
        {logoutError && (
          <div className="bg-[#fee4e2] border-b border-[#f04438] px-4 lg:px-8 py-3 flex items-center justify-between shrink-0 z-10">
            <span className="text-[#d92d20] text-[14px] font-semibold">
              {logoutError}
            </span>
            <button
              onClick={() => setLogoutError(null)}
              className="text-[#d92d20] hover:text-[#b42318] focus:outline-none"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Content Area Canvas */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
