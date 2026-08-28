"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthService } from "@/services/api/auth.service";
import { AuthHeader } from "@/components/shared/AuthHeader";

const validateEmail = (email: string) => {
  if (!email.trim()) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Enter a valid email address.";
  return "";
};

const validatePassword = (password: string) => {
  if (!password) return "Password is required.";
  return "";
};

const INTERNAL_BASE = new URL("https://taskly.internal");

function getValidReturnTo(rawReturnTo: string | null): string | null {
  if (!rawReturnTo || typeof rawReturnTo !== "string") return null;

  // Reject leading/trailing whitespace or whitespace within
  if (rawReturnTo.trim() !== rawReturnTo) return null;

  try {
    const parsed = new URL(rawReturnTo, INTERNAL_BASE);

    // Reject external origins, protocol-relative, and backslash-normalized forms
    if (parsed.origin !== INTERNAL_BASE.origin) {
      return null;
    }

    // Require exact /invite pathname
    if (parsed.pathname !== "/invite") {
      return null;
    }

    // Require exactly one non-empty token query parameter
    const tokens = parsed.searchParams.getAll("token");
    if (tokens.length !== 1) {
      return null;
    }

    const token = tokens[0].trim();
    if (!token) {
      return null;
    }

    // Reconstruct clean safe returnTo discarding any extra query parameters or hash
    const safeParams = new URLSearchParams({ token });
    return `/invite?${safeParams.toString()}`;
  } catch {
    return null;
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawReturnTo = searchParams.get("returnTo");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);

    if (emailErr || passErr) {
      setErrors({
        email: emailErr,
        password: passErr,
      });
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const { data, error } = await AuthService.login({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (error) {
        // Controlled user-facing message for invalid login credentials
        if (
          error.message?.toLowerCase().includes("invalid login credentials") ||
          error.message?.toLowerCase().includes("invalid grant") ||
          error.status === 400
        ) {
          setApiError("Invalid email or password");
        } else {
          setApiError(
            error.message || "An unexpected error occurred. Please try again."
          );
        }
        return;
      }

      if (data.session && data.user) {
        const validReturnTo = getValidReturnTo(rawReturnTo);
        if (validReturnTo) {
          router.replace(validReturnTo);
        } else {
          router.replace("/project");
        }
      } else {
        setApiError(
          "Authentication session could not be established. Please try again."
        );
      }
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
      <AuthHeader />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1920px] flex items-center justify-center py-8 px-4 z-10">
        <div className="bg-white w-full max-w-[576px] rounded-lg shadow-[0px_24px_48px_0px_rgba(4,27,60,0.06)] p-8 md:p-12 flex flex-col items-start relative">
          <div className="w-full flex flex-col items-center mb-8 md:mb-10 text-center">
            <h1 className="text-[28px] md:text-[30px] font-semibold text-neutral tracking-[-0.75px] mb-2">
              Welcome Back
            </h1>
            <p className="text-[14px] text-slate-700">
              Please enter your details to access your workspace
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col gap-6"
            noValidate
          >
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
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              trailingIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-700 hover:text-neutral focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              }
            />

            <div className="flex items-center justify-between w-full">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded-sm text-primary focus:ring-primary border-slate-300 cursor-pointer accent-[#0052CC]"
                />
                <span className="text-slate-700 text-[12px] font-semibold">
                  Remember Me
                </span>
              </label>

              <a
                href="/forgot-password"
                className="text-primary hover:underline text-[12px] font-semibold focus:outline-none"
              >
                Forgot Password?
              </a>
            </div>

            <Button type="submit" isLoading={isLoading} className="mt-2">
              Log In
            </Button>
          </form>

          <div className="w-full flex items-center justify-center gap-1 mt-8">
            <span className="text-slate-700 text-[14px]">
              Don&apos;t have an account?
            </span>
            <a
              href="/sign-up"
              className="text-primary font-semibold text-[14px] hover:underline"
            >
              Sign Up
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[#0052cc] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
