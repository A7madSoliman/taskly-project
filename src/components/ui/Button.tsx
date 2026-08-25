import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  isLoading?: boolean;
}

export function Button({
  className = "",
  variant = "primary",
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    "flex h-[48px] items-center justify-center rounded-sm font-semibold text-[16px] transition-opacity drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] w-full";

  let variantClasses = "";
  if (variant === "primary") {
    // Signature gradient flow 135deg from primary to primaryContainer
    variantClasses =
      "bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-container)_100%)] text-white";
  } else if (variant === "secondary") {
    variantClasses = "bg-surface-low text-neutral border border-slate-300";
  } else if (variant === "ghost") {
    variantClasses = "bg-transparent text-primary drop-shadow-none";
  }

  const disabledClasses =
    disabled || isLoading
      ? "opacity-50 cursor-not-allowed"
      : "hover:opacity-90";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}
