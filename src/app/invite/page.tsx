"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ProjectsService } from "@/services/api/projects.service";

type InvitePageState =
  | "checking_auth"
  | "invalid_token"
  | "ready"
  | "accepting"
  | "success"
  | "error";

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";

  const [state, setState] = useState<InvitePageState>("checking_auth");
  const [readyToken, setReadyToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pendingRef = useRef<boolean>(false);
  const acceptRequestSeqRef = useRef<number>(0);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Invalidate in-flight acceptance mutation and clear redirect timer on unmount
  useEffect(() => {
    return () => {
      acceptRequestSeqRef.current++;
      pendingRef.current = false;
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, []);

  // Authentication & token check
  useEffect(() => {
    let isMounted = true;
    const checkedToken = token;

    // Invalidate previous acceptance mutation ownership and clear any pending redirect timer
    acceptRequestSeqRef.current++;
    pendingRef.current = false;
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    const checkSession = async () => {
      await Promise.resolve();
      if (!isMounted) return;

      setReadyToken(null);
      setErrorMessage(null);

      if (!checkedToken) {
        setState("invalid_token");
        return;
      }

      setState("checking_auth");

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted || checkedToken !== token) return;

        if (!session || !session.user) {
          // Unauthenticated: redirect to login with validated returnTo
          const returnTo = encodeURIComponent(
            `/invite?token=${encodeURIComponent(checkedToken)}`
          );
          router.replace(`/login?returnTo=${returnTo}`);
          return;
        }

        setReadyToken(checkedToken);
        setState("ready");
      } catch {
        if (!isMounted || checkedToken !== token) return;
        const returnTo = encodeURIComponent(
          `/invite?token=${encodeURIComponent(checkedToken)}`
        );
        router.replace(`/login?returnTo=${returnTo}`);
      }
    };

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [token, router]);

  const handleAccept = async () => {
    // Current-token auth readiness gate
    if (
      !token ||
      readyToken !== token ||
      (state !== "ready" && state !== "error") ||
      pendingRef.current
    ) {
      return;
    }

    const acceptedToken = token;

    pendingRef.current = true;
    setState("accepting");
    setErrorMessage(null);

    // Clear any previous redirect timer defensively
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }

    const seq = ++acceptRequestSeqRef.current;

    try {
      const { error } = await ProjectsService.acceptInvitation({
        token: acceptedToken,
      });

      if (seq !== acceptRequestSeqRef.current) return;

      if (error) {
        setState("error");
        setErrorMessage(
          "This invitation is invalid, expired, or could not be accepted."
        );
        return;
      }

      // Success
      setState("success");
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
      redirectTimerRef.current = setTimeout(() => {
        if (
          seq === acceptRequestSeqRef.current &&
          readyToken === acceptedToken
        ) {
          router.replace("/project");
        }
        redirectTimerRef.current = null;
      }, 1200);
    } catch {
      if (seq !== acceptRequestSeqRef.current) return;
      setState("error");
      setErrorMessage(
        "This invitation is invalid, expired, or could not be accepted."
      );
    } finally {
      if (seq === acceptRequestSeqRef.current) {
        pendingRef.current = false;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center p-4">
      {/* Centered Taskly Logo */}
      <div className="mb-8 flex items-center gap-2.5">
        <Image
          src="/assets/svg/taskly-logo.svg"
          alt="Taskly"
          width={32}
          height={32}
          priority
        />
        <span className="text-[20px] font-bold tracking-[-0.4px] text-[#041b3c]">
          Taskly
        </span>
      </div>

      {/* Standalone Transactional Invitation Card */}
      <div className="w-full max-w-[480px] bg-white rounded-[12px] border border-[#e2e6f0] shadow-[0_12px_32px_rgba(4,27,60,0.06)] overflow-hidden">
        {/* Blue Top Accent Bar */}
        <div className="h-1.5 w-full bg-[#0052cc]" />

        <div className="p-6 md:p-8 flex flex-col items-center text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dbe4ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.5px] text-[#0052cc]">
            NEW PROJECT INVITATION
          </span>

          {/* Heading */}
          <h1 className="mt-4 text-[22px] md:text-[24px] font-bold text-[#041b3c] tracking-[-0.5px] leading-snug">
            You&apos;ve been invited to join a project
          </h1>

          <p className="mt-2 text-[14px] text-[#68758c] leading-relaxed max-w-[360px]">
            Collaborate with your team, manage tasks, and track project progress
            in Taskly.
          </p>

          {/* Error Message */}
          {(state === "error" || errorMessage) && (
            <div
              role="alert"
              className="mt-6 w-full rounded-[6px] border border-[#fda29b] bg-[#fff4f2] p-3 text-[13px] font-medium text-[#b42318] text-center"
            >
              {errorMessage ||
                "This invitation is invalid, expired, or could not be accepted."}
            </div>
          )}

          {/* Invalid Token State */}
          {state === "invalid_token" && (
            <div className="mt-6 w-full flex flex-col items-center gap-4">
              <div
                role="alert"
                className="w-full rounded-[6px] border border-[#fda29b] bg-[#fff4f2] p-3 text-[13px] font-medium text-[#b42318]"
              >
                Invitation link is invalid.
              </div>
              <Link
                href="/project"
                className="text-[13px] font-semibold text-[#0052cc] hover:underline"
              >
                Go to Projects
              </Link>
            </div>
          )}

          {/* Success State */}
          {state === "success" && (
            <div className="mt-6 w-full flex flex-col items-center gap-3">
              <div
                role="status"
                className="w-full rounded-[6px] border border-[#a6f4c5] bg-[#edfcf2] p-3.5 text-[14px] font-semibold text-[#027a48]"
              >
                Invitation accepted successfully.
              </div>
              <p className="text-[12px] text-[#68758c]">
                Redirecting to workspace...
              </p>
            </div>
          )}

          {/* Checking Auth State */}
          {state === "checking_auth" && (
            <div className="mt-8 flex items-center justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#0052cc] border-t-transparent" />
            </div>
          )}

          {/* Ready / Accepting / Error (with valid authenticated token) Actions */}
          {state !== "invalid_token" &&
            state !== "success" &&
            state !== "checking_auth" &&
            readyToken === token && (
              <div className="mt-8 w-full flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleAccept}
                  disabled={state === "accepting"}
                  className="h-12 w-full rounded-[6px] bg-[#0052cc] text-[14px] font-semibold text-white shadow-[0_2px_4px_rgba(0,82,204,0.18)] hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {state === "accepting" ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Accepting...</span>
                    </>
                  ) : (
                    <span>Accept Invitation</span>
                  )}
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9fc] flex flex-col items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#0052cc] border-t-transparent" />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
