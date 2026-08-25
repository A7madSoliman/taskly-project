"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthService } from "@/services/api/auth.service";

// Shared Validation Logic
const validateName = (name: string) => {
  if (!name) return "Name is required.";
  if (name.length < 3 || name.length > 50)
    return "3-50 characters, letters only.";
  if (
    !/^[a-zA-Z\u00C0-\u017F\u0600-\u06FF]+(?: [a-zA-Z\u00C0-\u017F\u0600-\u06FF]+)*$/.test(
      name
    )
  ) {
    return "3-50 characters, letters only. No consecutive spaces.";
  }
  return "";
};

const validateEmail = (email: string) => {
  if (!email) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Enter a valid email address.";
  return "";
};

export const checkPasswordLength = (pwd: string) =>
  pwd.length >= 8 && pwd.length <= 64;
export const checkPasswordComplexity = (pwd: string) =>
  /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd);
export const checkPasswordSpecial = (pwd: string) =>
  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
export const checkPasswordNoSpaces = (pwd: string) => !/\s/.test(pwd);

const validatePassword = (password: string) => {
  if (!password) return "Password is required.";
  if (!checkPasswordLength(password))
    return "Password must be 8-64 characters.";
  if (!checkPasswordNoSpaces(password))
    return "Password must not contain spaces.";
  if (!checkPasswordComplexity(password))
    return "One uppercase, lowercase, and digit required.";
  if (!checkPasswordSpecial(password)) return "One special character required.";
  return "";
};

const CheckIcon = ({ checked }: { checked: boolean }) => {
  if (checked) {
    return (
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-success shrink-0"
      >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    );
  }
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-slate-300 shrink-0"
    >
      <circle cx="12" cy="12" r="10"></circle>
    </svg>
  );
};

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    jobTitle: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setApiError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);
    const confirmErr =
      formData.password !== formData.confirmPassword
        ? "Passwords do not match."
        : "";

    if (nameErr || emailErr || passErr || confirmErr) {
      setErrors({
        name: nameErr,
        email: emailErr,
        password: passErr,
        confirmPassword: confirmErr,
      });
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const { data, error } = await AuthService.signUp({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        jobTitle: formData.jobTitle.trim() || undefined,
      });

      if (error) {
        setApiError(error.message);
        return;
      }

      if (data.user && data.session) {
        router.push("/project");
      } else if (data.user && !data.session) {
        setApiError(
          "UNEXPECTED AUTH SESSION FAILURE: Email confirmation is required by the server."
        );
      }
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isLengthValid = checkPasswordLength(formData.password);
  const isComplexityValid = checkPasswordComplexity(formData.password);
  const isSpecialValid = checkPasswordSpecial(formData.password);

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
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-primary"
            aria-hidden="true"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
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
              Create your workspace
            </h1>
            <p className="text-[14px] text-slate-700">
              Join the editorial approach to task management.
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
              name="name"
              label="Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              helpText="3-50 characters, letters only."
            />

            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="yourname@company.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <Input
              name="jobTitle"
              label="Job Title (Optional)"
              placeholder="e.g. Project Manager"
              value={formData.jobTitle}
              onChange={handleChange}
              error={errors.jobTitle}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                trailingIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-700 hover:text-neutral focus:outline-none"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                }
              />
              <Input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                trailingIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-700 hover:text-neutral focus:outline-none"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
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
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                }
              />
            </div>

            <div className="bg-[#e8edff] rounded-md p-4 flex flex-col gap-2 w-full mt-[-8px]">
              <div className="flex items-center gap-2">
                <CheckIcon checked={isLengthValid} />
                <span className="text-[#434654] text-[11px]">
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon checked={isComplexityValid} />
                <span className="text-[#434654] text-[11px]">
                  One uppercase, lowercase, and digit
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon checked={isSpecialValid} />
                <span className="text-[#434654] text-[11px]">
                  One special character
                </span>
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="mt-2">
              Create Account
            </Button>
          </form>

          <div className="w-full flex items-center justify-center gap-1 mt-8">
            <span className="text-slate-700 text-[14px]">
              Already have an account?
            </span>
            <a
              href="/login"
              className="text-primary font-semibold text-[14px] hover:underline"
            >
              Log in
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
