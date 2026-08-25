"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthService } from "@/services/api/auth.service";

const RESEND_STORAGE_KEY = "taskly-forgot-password-resend";
const COOLDOWN_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RESEND_TRIALS = 3;

interface ResendState {
  email: string;
  resendCount: number;
  cooldownUntil: number;
}

const validateEmail = (email: string) => {
  if (!email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Enter a valid email address.";
  return "";
};

const getInitialResendState = (): ResendState | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = sessionStorage.getItem(RESEND_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState(
    () => getInitialResendState()?.email || ""
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isSuccess, setIsSuccess] = useState(
    () => !!getInitialResendState()?.email
  );

  const [resendCount, setResendCount] = useState(
    () => getInitialResendState()?.resendCount || 0
  );
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(
    () => getInitialResendState()?.cooldownUntil || null
  );
  const [now, setNow] = useState(() => Date.now());

  // Tick current time when a cooldown is active
  useEffect(() => {
    if (!cooldownUntil || cooldownUntil <= Date.now()) return;

    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= cooldownUntil) {
        setCooldownUntil(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const remainingSeconds = cooldownUntil
    ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000))
    : 0;

  const persistResendState = useCallback(
    (newEmail: string, count: number, until: number) => {
      const state: ResendState = {
        email: newEmail,
        resendCount: count,
        cooldownUntil: until,
      };
      try {
        sessionStorage.setItem(RESEND_STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore storage write errors
      }
    },
    []
  );

  const handleSendRecovery = async (
    targetEmail: string,
    isResendAttempt = false
  ) => {
    const trimmed = targetEmail.trim();
    const emailErr = validateEmail(trimmed);
    if (emailErr) {
      setError(emailErr);
      return;
    }

    setIsLoading(true);
    setError("");
    setApiError("");

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;

      const { error: reqError } = await AuthService.forgotPassword({
        email: trimmed,
        redirectTo,
      });

      if (reqError) {
        // Controlled generic error for network/service rate limits
        if (
          reqError.message?.toLowerCase().includes("rate limit") ||
          reqError.status === 429
        ) {
          setApiError(
            "Too many requests. Please wait a few minutes before trying again."
          );
        } else {
          setApiError(
            reqError.message ||
              "An unexpected error occurred. Please try again."
          );
        }
        return;
      }

      // Neutral success state
      setIsSuccess(true);

      const nextCount = isResendAttempt ? resendCount + 1 : 0;
      const nextCooldown = Date.now() + COOLDOWN_DURATION_MS;

      setResendCount(nextCount);
      setCooldownUntil(nextCooldown);
      persistResendState(trimmed, nextCount, nextCooldown);
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendRecovery(email, false);
  };

  const handleResend = () => {
    if (remainingSeconds > 0 || resendCount >= MAX_RESEND_TRIALS || isLoading)
      return;
    handleSendRecovery(email, true);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center relative overflow-hidden">
      {/* Background Visual Accents */}
      <div className="absolute bottom-0 right-0 p-12 opacity-40 pointer-events-none">
        <div className="relative w-[256px] h-[256px]">
          <div className="absolute inset-0 bg-[rgba(0,82,204,0.2)] blur-[50px] rounded-xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[128px] h-[128px] border border-[rgba(0,61,155,0.1)] rounded-xl" />
        </div>
      </div>

      {/* Header / Top Navigation */}
      <header className="w-full max-w-[1280px] h-[80px] px-6 md:px-10 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <svg
            width="18"
            height="20"
            viewBox="0 0 18 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
            aria-hidden="true"
          >
            <path
              d="M9 20L0 15V5L9 0L18 5V15L9 20ZM6.1 7.25C6.48333 6.85 6.925 6.54167 7.425 6.325C7.925 6.10833 8.45 6 9 6C9.55 6 10.075 6.10833 10.575 6.325C11.075 6.54167 11.5167 6.85 11.9 7.25L14.9 5.575L9 2.3L3.1 5.575L6.1 7.25ZM8 17.15V13.875C7.1 13.6417 6.375 13.1667 5.825 12.45C5.275 11.7333 5 10.9167 5 10C5 9.81667 5.00833 9.64583 5.025 9.4875C5.04167 9.32917 5.075 9.16667 5.125 9L2 7.25V13.825L8 17.15ZM9 12C9.55 12 10.0208 11.8042 10.4125 11.4125C10.8042 11.0208 11 10.55 11 10C11 9.45 10.8042 8.97917 10.4125 8.5875C10.0208 8.19583 9.55 8 9 8C8.45 8 7.97917 8.19583 7.5875 8.5875C7.19583 8.97917 7 9.45 7 10C7 10.55 7.19583 11.0208 7.5875 11.4125C7.97917 11.8042 8.45 12 9 12ZM10 17.15L16 13.825V7.25L12.875 9C12.925 9.16667 12.9583 9.32917 12.975 9.4875C12.9917 9.64583 13 9.81667 13 10C13 10.9167 12.725 11.7333 12.175 12.45C11.625 13.1667 10.9 13.6417 10 13.875V17.15Z"
              fill="#0052CC"
            />
          </svg>
          <span className="font-bold text-[20px] text-neutral tracking-[-0.5px]">
            TASKLY
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1920px] flex items-center justify-center py-8 px-4 z-10">
        <div className="bg-white w-full max-w-[576px] rounded-lg shadow-[0px_24px_48px_0px_rgba(4,27,60,0.06)] p-8 md:p-12 flex flex-col items-start relative">
          <div className="w-full flex flex-col items-center mb-8 md:mb-10 text-center">
            <h1 className="text-[28px] md:text-[30px] font-semibold text-neutral tracking-[-0.75px] mb-2">
              Forgot Password
            </h1>
            <p className="text-[14px] text-slate-700">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-6"
            noValidate
          >
            {isSuccess && (
              <div
                className="w-full bg-[#e8f5e9] border border-success text-success text-[14px] px-4 py-3 rounded-md leading-relaxed"
                role="status"
                aria-live="polite"
              >
                If an account exists with this email, we’ve sent a password
                reset link.
              </div>
            )}

            {apiError && (
              <div
                className="w-full bg-[#ffebee] border border-error text-error text-[14px] px-4 py-3 rounded-md"
                role="alert"
              >
                {apiError}
              </div>
            )}

            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                const newEmail = e.target.value;
                setEmail(newEmail);
                if (error) setError("");
                if (apiError) setApiError("");

                const stored = getInitialResendState();
                if (
                  stored &&
                  stored.email.toLowerCase() !== newEmail.trim().toLowerCase()
                ) {
                  setIsSuccess(false);
                  setCooldownUntil(null);
                  setResendCount(0);
                } else if (
                  stored &&
                  stored.email.toLowerCase() === newEmail.trim().toLowerCase()
                ) {
                  setIsSuccess(true);
                  setCooldownUntil(stored.cooldownUntil);
                  setResendCount(stored.resendCount);
                }
              }}
              error={error}
            />

            <Button type="submit" isLoading={isLoading} className="mt-2">
              Send Reset Link
            </Button>
          </form>

          {/* Resend Section when link has been sent */}
          {isSuccess && (
            <div className="w-full flex flex-col items-center justify-center gap-2 mt-6 pt-6 border-t border-slate-100">
              <span className="text-slate-700 text-[13px]">
                Didn&apos;t receive an email?
              </span>

              {resendCount >= MAX_RESEND_TRIALS ? (
                <span className="text-slate-400 text-[13px] font-medium">
                  Resend limit reached ({resendCount}/{MAX_RESEND_TRIALS})
                </span>
              ) : remainingSeconds > 0 ? (
                <button
                  type="button"
                  disabled
                  className="text-slate-400 text-[13px] font-semibold cursor-not-allowed"
                >
                  Resend in {formatTimer(remainingSeconds)}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-primary hover:underline text-[13px] font-semibold focus:outline-none"
                >
                  Resend email ({resendCount}/{MAX_RESEND_TRIALS} trials used)
                </button>
              )}
            </div>
          )}

          {/* Back to Login Navigation */}
          <div className="w-full flex items-center justify-center gap-1 mt-8">
            <a
              href="/login"
              className="text-primary font-semibold text-[14px] hover:underline flex items-center gap-1"
            >
              ← Back to Login
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
