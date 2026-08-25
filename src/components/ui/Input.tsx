import React, { useId, forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helpText?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helpText, trailingIcon, className = "", id, ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="flex flex-col w-full relative">
        <label
          htmlFor={inputId}
          className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px] mb-2 px-1"
        >
          {label}
        </label>
        <div className="relative flex items-center w-full">
          <input
            id={inputId}
            ref={ref}
            className={`flex h-[48px] w-full items-center bg-surface-highest px-4 py-3 rounded-sm text-neutral text-[16px] placeholder:text-[#737685] outline-none focus:ring-2 focus:ring-primary-container transition-all ${
              error ? "ring-2 ring-error" : ""
            } ${className}`}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helpText
                  ? `${inputId}-help`
                  : undefined
            }
            {...props}
          />
          {trailingIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
              {trailingIcon}
            </div>
          )}
        </div>
        {error ? (
          <p
            id={`${inputId}-error`}
            className="text-error text-[11px] mt-1 px-1"
            role="alert"
          >
            {error}
          </p>
        ) : helpText ? (
          <div
            id={`${inputId}-help`}
            className="text-slate-300 text-[11px] mt-1 px-1"
          >
            {helpText}
          </div>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
