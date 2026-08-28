"use client";

import React, { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  pendingLabel?: string;
  error?: string | null;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel = "Delete",
  pendingLabel = "Deleting...",
  error,
  isPending,
  onConfirm,
  onClose,
}: DeleteConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  // Focus management and Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Capture currently focused element before opening
    if (document.activeElement instanceof HTMLElement) {
      previousFocusedElementRef.current = document.activeElement;
    }

    // Focus confirm button or modal container
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!isPending) {
          e.preventDefault();
          onClose();
        }
        return;
      }

      // Trap focus within modal
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements =
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);

      // Restore focus to previous element if still connected
      const prevEl = previousFocusedElementRef.current;
      if (
        prevEl &&
        typeof prevEl.focus === "function" &&
        document.body.contains(prevEl)
      ) {
        prevEl.focus();
      }
    };
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPending) {
      onClose();
    }
  };

  return (
    <div
      role="presentation"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#041b3c]/50 backdrop-blur-[2px] transition-opacity md:items-center"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        className="w-full max-w-[480px] rounded-t-[16px] bg-white p-6 shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.1),0px_8px_8px_-4px_rgba(16,24,40,0.04)] md:rounded-[12px] md:p-8"
      >
        <h2
          id="delete-dialog-title"
          className="text-[20px] font-bold text-[#041b3c]"
        >
          {title}
        </h2>

        <p
          id="delete-dialog-description"
          className="mt-3 text-[14px] leading-[22px] text-[#53627b]"
        >
          {description}
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-[6px] border border-[#fecdca] bg-[#fff4f2] px-3.5 py-2.5 text-[13px] font-medium text-[#b42318]"
          >
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 md:flex-row md:justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="h-11 rounded-[6px] border border-[#d0d5dd] bg-white px-5 text-[14px] font-semibold text-[#344054] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition-colors hover:bg-[#f9fafb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-[#d92d20] px-5 text-[14px] font-semibold text-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition-colors hover:bg-[#b42318] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d92d20] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                  aria-hidden="true"
                />
                <span>{pendingLabel}</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
