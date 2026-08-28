"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { ProjectsService } from "@/services/api/projects.service";

interface InviteMemberModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const validateEmail = (email: string): string => {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Enter a valid email address.";
  }
  return "";
};

export function InviteMemberModal({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const pendingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const requestSeqRef = useRef(0);

  // Invalidate any in-flight request on unmount
  useEffect(() => {
    const seqRef = requestSeqRef;
    const pRef = pendingRef;
    return () => {
      seqRef.current++;
      pRef.current = false;
    };
  }, []);

  // Immediate layout-safe lifecycle reset: when projectId changes or modal opens
  useLayoutEffect(() => {
    requestSeqRef.current++;
    pendingRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPending(false);
    setEmail("");
    setError(null);
    setApiError(null);
  }, [projectId, isOpen]);

  // Focus management and Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    // Focus initial email input
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!pendingRef.current) {
          e.preventDefault();
          requestSeqRef.current++;
          setEmail("");
          setError(null);
          setApiError(null);
          onClose();
        }
        return;
      }

      // Trap focus inside modal
      if (e.key === "Tab" && modalRef.current) {
        // Exclude disabled elements from focusable selector
        const focusableSelector =
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';
        const focusableElements =
          modalRef.current.querySelectorAll<HTMLElement>(focusableSelector);

        if (focusableElements.length === 0) {
          // If no enabled focusable elements (e.g. while pending), keep focus on dialog root
          e.preventDefault();
          modalRef.current.focus();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === firstElement ||
            document.activeElement === modalRef.current
          ) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (
            document.activeElement === lastElement ||
            document.activeElement === modalRef.current
          ) {
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
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingRef.current) return;

    const trimmedEmail = email.trim();
    const validationError = validateEmail(trimmedEmail);
    if (validationError) {
      setError(validationError);
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setApiError(null);
    setIsPending(true);
    pendingRef.current = true;

    // Shift focus to container if focused control is becoming disabled
    modalRef.current?.focus();

    const seq = ++requestSeqRef.current;
    const appUrl = typeof window !== "undefined" ? window.location.origin : "";

    try {
      const { error: rpcError } = await ProjectsService.invite({
        email: trimmedEmail,
        projectId,
        appUrl,
      });

      if (seq !== requestSeqRef.current) return;

      if (rpcError) {
        setApiError("Failed to send invitation. Please try again.");
        return;
      }

      // Success
      setEmail("");
      onClose();
      onSuccess();
    } catch {
      if (seq !== requestSeqRef.current) return;
      setApiError("Failed to send invitation. Please try again.");
    } finally {
      if (seq === requestSeqRef.current) {
        setIsPending(false);
        pendingRef.current = false;
      }
    }
  };

  const handleClose = () => {
    if (pendingRef.current) return;
    requestSeqRef.current++;
    setEmail("");
    setError(null);
    setApiError(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full bg-white md:max-w-[480px] md:rounded-[12px] rounded-t-[16px] p-6 md:p-8 shadow-[0_20px_40px_rgba(4,27,60,0.16)] border border-[#e2e6f0] flex flex-col relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 focus:outline-none"
      >
        {/* Mobile top drag handle indicator */}
        <div className="md:hidden flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-[#d0d5dd]" />
        </div>

        {/* Top Header: Icon + Close button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#dbe4ff] text-[#0052cc]">
            <Image
              src="/assets/svg/icons/icon-user-invite-plus.svg"
              alt=""
              width={22}
              height={22}
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            aria-label="Close invite modal"
            className="flex h-8 w-8 items-center justify-center rounded-[6px] text-[#737685] hover:bg-[#f0f2f7] hover:text-[#041b3c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Modal Heading & Description */}
        <div className="mt-4">
          <h2
            id="invite-modal-title"
            className="text-[20px] font-bold text-[#041b3c] tracking-[-0.4px]"
          >
            Invite Team Member
          </h2>
          <p className="mt-1 text-[13px] text-[#68758c] leading-relaxed">
            Send an invitation to collaborate on this project. They will receive
            an email with an access link.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-4"
          noValidate
        >
          {apiError && (
            <div
              role="alert"
              className="rounded-[6px] border border-[#fda29b] bg-[#fff4f2] px-4 py-2.5 text-[13px] font-medium text-[#b42318]"
            >
              {apiError}
            </div>
          )}

          <div>
            <label
              htmlFor="invite-email-input"
              className="block text-[11px] font-bold uppercase tracking-[0.5px] text-[#737685] mb-1.5"
            >
              EMAIL ADDRESS
            </label>
            <input
              ref={inputRef}
              id="invite-email-input"
              name="email"
              type="email"
              placeholder="Enter email address"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
                if (apiError) setApiError(null);
              }}
              disabled={isPending}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "invite-email-error" : undefined}
              className={`h-11 w-full rounded-[6px] border bg-[#f8f9fc] px-3.5 text-[14px] text-[#041b3c] placeholder:text-[#737685] transition-colors focus:border-[#0052cc] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0052cc] disabled:bg-[#f0f2f7] disabled:text-[#929bad] ${
                error ? "border-[#d92d20]" : "border-[#d9deeb]"
              }`}
            />
            {error && (
              <p
                id="invite-email-error"
                role="alert"
                className="mt-1.5 text-[12px] font-medium text-[#d92d20]"
              >
                {error}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-col-reverse md:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="h-11 w-full md:w-auto px-5 rounded-[6px] border border-[#d9deeb] bg-white text-[13px] font-semibold text-[#041b3c] hover:bg-[#f8f9fc] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-11 w-full md:w-auto px-6 rounded-[6px] bg-[#0052cc] text-[13px] font-semibold text-white shadow-[0_2px_4px_rgba(0,82,204,0.18)] hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0052cc] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Invitation</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
