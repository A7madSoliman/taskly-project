import { createClient, SupportedStorage } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const TASKLY_REMEMBER_UNTIL_KEY = "taskly-auth-remember-until";
export const TASKLY_AUTH_MODE_KEY = "taskly-auth-mode";

/**
 * Configure whether the authentication session should be persisted
 * in persistent storage (1 calendar month expiry) or session-scoped storage.
 */
export const setAuthRememberPreference = (remember: boolean): void => {
  if (typeof window === "undefined") return;

  if (remember) {
    localStorage.setItem(TASKLY_AUTH_MODE_KEY, "remembered");
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    localStorage.setItem(
      TASKLY_REMEMBER_UNTIL_KEY,
      expiry.getTime().toString()
    );
  } else {
    localStorage.setItem(TASKLY_AUTH_MODE_KEY, "session");
    localStorage.removeItem(TASKLY_REMEMBER_UNTIL_KEY);
  }
};

export const customAuthStorage: SupportedStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === "undefined") return null;

    const mode = localStorage.getItem(TASKLY_AUTH_MODE_KEY);

    if (mode === "remembered") {
      const rememberUntil = localStorage.getItem(TASKLY_REMEMBER_UNTIL_KEY);
      if (rememberUntil) {
        const expiryTimestamp = Number(rememberUntil);
        if (Date.now() > expiryTimestamp) {
          // One-month remembered duration expired -> clean up and invalidate
          localStorage.removeItem(key);
          localStorage.removeItem(TASKLY_REMEMBER_UNTIL_KEY);
          localStorage.removeItem(TASKLY_AUTH_MODE_KEY);
          return null;
        }
        const localValue = localStorage.getItem(key);
        if (localValue) return localValue;
      }
    } else if (mode === "session") {
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) return sessionValue;
    } else {
      // Fallback: check remembered first, then session
      const rememberUntil = localStorage.getItem(TASKLY_REMEMBER_UNTIL_KEY);
      if (rememberUntil) {
        const expiryTimestamp = Number(rememberUntil);
        if (Date.now() <= expiryTimestamp) {
          const localValue = localStorage.getItem(key);
          if (localValue) return localValue;
        }
      }
      return sessionStorage.getItem(key);
    }

    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === "undefined") return;

    const mode = localStorage.getItem(TASKLY_AUTH_MODE_KEY) || "remembered";

    if (mode === "remembered") {
      sessionStorage.removeItem(key);
      localStorage.setItem(key, value);
      if (!localStorage.getItem(TASKLY_REMEMBER_UNTIL_KEY)) {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        localStorage.setItem(
          TASKLY_REMEMBER_UNTIL_KEY,
          expiry.getTime().toString()
        );
      }
    } else {
      localStorage.removeItem(key);
      localStorage.removeItem(TASKLY_REMEMBER_UNTIL_KEY);
      sessionStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
    localStorage.removeItem(TASKLY_REMEMBER_UNTIL_KEY);
    localStorage.removeItem(TASKLY_AUTH_MODE_KEY);
    sessionStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: customAuthStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
