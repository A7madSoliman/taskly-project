"use client";

import React, { useState } from "react";
import Image from "next/image";
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

import {
  checkPasswordLength,
  checkPasswordComplexity,
  checkPasswordSpecial,
  checkPasswordNoSpaces,
  validatePassword,
} from "@/lib/auth/password-validation";

export {
  checkPasswordLength,
  checkPasswordComplexity,
  checkPasswordSpecial,
  checkPasswordNoSpaces,
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
    <div className="min-h-screen w-full bg-[#f9f9ff] flex flex-col items-center relative">
      {/* Background Visual Accents (Desktop Only) */}
      <div className="hidden md:flex absolute bottom-0 right-0 p-[48px] opacity-40 pointer-events-none z-0">
        <div className="relative w-[256px] h-[256px]">
          <div className="absolute inset-0 bg-[rgba(0,82,204,0.2)] blur-[50px] rounded-[12px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[128px] h-[128px] border border-solid border-[rgba(0,61,155,0.1)] rounded-[12px]" />
        </div>
      </div>

      {/* Header / Top Navigation */}
      <header className="w-full max-w-[1920px] h-[80px] px-6 md:px-10 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/svg/signup/logo-taskly.svg"
            alt="Taskly Logo"
            width={18}
            height={20}
            className="shrink-0"
            priority
          />
          <span className="font-bold text-[20px] text-[#041b3c] tracking-[-0.5px] leading-[28px]">
            TASKLY
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full md:max-w-[1920px] flex md:items-center justify-center max-md:px-[24px] md:pt-[96px] md:pb-[48px] z-10 signup-form">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .signup-form label {
            color: #4f5f7b;
            font-weight: 700;
            line-height: 16.5px;
            letter-spacing: 0.55px;
            text-transform: uppercase;
          }
          @media (max-width: 767px) {
            .signup-form label {
              color: #434654 !important;
            }
          }
          @media (min-width: 768px) {
            .signup-job-title label::after {
              content: " (Optional)";
              font-weight: 400;
              text-transform: none;
              letter-spacing: normal;
              color: #737685;
            }
          }
          .signup-form [id$="-help"] {
            color: #c3c6d6 !important;
            line-height: 16.5px !important;
            margin-top: 6px !important;
          }
        `,
          }}
        />

        <div className="w-full max-w-[342px] md:max-w-[576px] md:bg-white md:rounded-[8px] md:shadow-[0px_24px_48px_0px_rgba(4,27,60,0.06)] md:p-[48px] flex flex-col items-start relative max-md:mt-[32px] max-md:mb-[74px]">
          <div className="w-full flex flex-col md:items-center max-md:items-start max-md:text-left mb-[40px] md:mb-[40px] md:text-center">
            <h1 className="text-[28px] md:text-[30px] font-semibold text-[#041b3c] tracking-[-0.8px] md:tracking-[-0.75px] leading-[40px] md:leading-[36px] mb-[6.875px] md:mb-[8px]">
              Create your workspace
            </h1>
            <p className="hidden md:block text-[14px] leading-[20px] text-[#4f5f7b]">
              Join the editorial approach to task management.
            </p>
            <p className="block md:hidden text-[14px] leading-[22.75px] text-[#434654] max-w-[342px]">
              Join the curated environment for institutional trust and task
              precision.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full flex flex-col max-md:gap-[24px] md:gap-[24px]"
            noValidate
          >
            {apiError && (
              <div
                className="w-full bg-[#ffebee] border border-error text-error text-[14px] px-4 py-3 rounded-[4px] md:rounded-[8px]"
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
              className="max-md:!h-[56px] max-md:!px-[16px] max-md:!py-[18px] max-md:!rounded-[8px] md:!h-[48px] md:!px-[16px] md:!py-[14px] md:!rounded-[4px] !bg-[#d7e2ff] !text-[#041b3c] placeholder:!text-[#737685] !text-[16px]"
            />

            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="yourname@company.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              className="max-md:!h-[56px] max-md:!px-[16px] max-md:!py-[18px] max-md:!rounded-[8px] md:!h-[48px] md:!px-[16px] md:!py-[14px] md:!rounded-[4px] !bg-[#d7e2ff] !text-[#041b3c] placeholder:!text-[#737685] !text-[16px]"
            />

            <div className="signup-job-title w-full">
              <Input
                name="jobTitle"
                label="Job Title"
                placeholder="e.g. Project Manager"
                value={formData.jobTitle}
                onChange={handleChange}
                error={errors.jobTitle}
                className="max-md:!h-[56px] max-md:!px-[16px] max-md:!py-[18px] max-md:!rounded-[8px] md:!h-[48px] md:!px-[16px] md:!py-[14px] md:!rounded-[4px] !bg-[#d7e2ff] !text-[#041b3c] placeholder:!text-[#737685] !text-[16px]"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-[24px] md:gap-[16px] w-full">
              <div className="w-full md:w-[232px]">
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  className="max-md:!h-[48px] max-md:!px-[16px] max-md:!py-[14px] max-md:!rounded-[8px] md:!h-[48px] md:!px-[16px] md:!py-[14px] md:!rounded-[4px] !bg-[#d7e2ff] !text-[#041b3c] placeholder:!text-[#737685] !text-[16px]"
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
                          aria-hidden="true"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
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
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  }
                />
              </div>
              <div className="w-full md:w-[232px]">
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  className="max-md:!h-[56px] max-md:!px-[16px] max-md:!py-[18px] max-md:!rounded-[8px] md:!h-[48px] md:!px-[16px] md:!py-[14px] md:!rounded-[4px] !bg-[#d7e2ff] !text-[#041b3c] placeholder:!text-[#737685] !text-[16px]"
                  trailingIcon={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                          aria-hidden="true"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
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
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  }
                />
              </div>
            </div>

            <div className="max-md:hidden bg-[#e8edff] rounded-[8px] p-[16px] flex flex-col gap-[7.5px] w-full md:w-[480px]">
              <div className="flex items-center gap-[8px]">
                <Image
                  src={
                    isLengthValid
                      ? "/assets/svg/signup/icon-check-active.svg"
                      : "/assets/svg/signup/icon-check-inactive.svg"
                  }
                  alt={isLengthValid ? "Valid" : "Invalid"}
                  width={12}
                  height={12}
                  className="w-[11.667px] h-[11.667px] shrink-0"
                />
                <span className="text-[#434654] text-[11px] leading-[16.5px]">
                  At least 8 characters
                </span>
              </div>
              <div className="flex items-center gap-[8px]">
                <Image
                  src={
                    isComplexityValid
                      ? "/assets/svg/signup/icon-check-active.svg"
                      : "/assets/svg/signup/icon-check-inactive.svg"
                  }
                  alt={isComplexityValid ? "Valid" : "Invalid"}
                  width={12}
                  height={12}
                  className="w-[11.667px] h-[11.667px] shrink-0"
                />
                <span className="text-[#434654] text-[11px] leading-[16.5px]">
                  One uppercase, lowercase, and digit
                </span>
              </div>
              <div className="flex items-center gap-[8px]">
                <Image
                  src={
                    isSpecialValid
                      ? "/assets/svg/signup/icon-check-active.svg"
                      : "/assets/svg/signup/icon-check-inactive.svg"
                  }
                  alt={isSpecialValid ? "Valid" : "Invalid"}
                  width={12}
                  height={12}
                  className="w-[11.667px] h-[11.667px] shrink-0"
                />
                <span className="text-[#434654] text-[11px] leading-[16.5px]">
                  One special character
                </span>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="max-md:!h-[56px] max-md:!w-[342px] md:!w-[480px] md:!h-[48px] !rounded-[8px] !font-semibold !text-[16px] !leading-[24px] !bg-[linear-gradient(135deg,#003d9b_0%,#0052cc_100%)] !text-white !drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] !border-none max-md:mt-[0px] md:mt-[0px]"
            >
              Create Account
            </Button>
          </form>

          <div className="w-full flex items-center justify-center gap-[4px] max-md:mt-[47.5px] md:mt-[32px]">
            <span className="text-[#4f5f7b] max-md:text-[#434654] text-[14px] leading-[20px]">
              Already have an account?
            </span>
            <a
              href="/login"
              className="text-[#003d9b] font-semibold text-[14px] leading-[20px] hover:underline"
            >
              Log in
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
