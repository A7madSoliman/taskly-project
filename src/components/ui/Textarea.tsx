import React, { useId, forwardRef } from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helpText?: React.ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helpText, className = "", id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="flex flex-col w-full relative">
        <div className="flex justify-between items-center mb-2 px-1">
          <label
            htmlFor={textareaId}
            className="text-slate-700 text-[11px] font-bold uppercase tracking-[0.55px]"
          >
            {label}
          </label>
          {props.required === false && (
            <span className="text-[#737685] text-[11px] font-semibold">
              Optional
            </span>
          )}
        </div>
        <div className="relative flex items-center w-full">
          <textarea
            id={textareaId}
            ref={ref}
            rows={rows}
            className={`flex w-full items-center bg-surface-highest px-4 py-3 rounded-sm text-neutral text-[16px] placeholder:text-[#737685] outline-none focus:ring-2 focus:ring-primary-container transition-all resize-y ${
              error ? "ring-2 ring-error" : ""
            } ${className}`}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${textareaId}-error`
                : helpText
                  ? `${textareaId}-help`
                  : undefined
            }
            {...props}
          />
        </div>
        {error ? (
          <p
            id={`${textareaId}-error`}
            className="text-error text-[11px] mt-1 px-1"
            role="alert"
          >
            {error}
          </p>
        ) : helpText ? (
          <div
            id={`${textareaId}-help`}
            className="text-slate-300 text-[11px] mt-1 px-1"
          >
            {helpText}
          </div>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
