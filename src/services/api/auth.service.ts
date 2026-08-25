import { supabase, setAuthRememberPreference } from "@/lib/supabase/client";
import { SUPABASE_URL, getHeaders } from "./config";

export interface SignUpData {
  email: string;
  password?: string;
  name: string;
  jobTitle?: string;
}

export interface LoginData {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export const AuthService = {
  signUp: async ({ email, password, name, jobTitle }: SignUpData) => {
    return supabase.auth.signUp({
      email,
      password: password || "",
      options: {
        data: {
          name,
          job_title: jobTitle,
        },
      },
    });
  },
  login: async ({ email, password, rememberMe = false }: LoginData) => {
    setAuthRememberPreference(rememberMe);
    return supabase.auth.signInWithPassword({
      email,
      password: password || "",
    });
  },
  getUser: async (jwt?: string) => {
    return supabase.auth.getUser(jwt);
  },
  updatePassword: async ({ password }: { password: string }) => {
    return supabase.auth.updateUser({
      password,
    });
  },
  refreshToken: async (refreshToken: string) => {
    return fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },
  forgotPassword: async ({
    email,
    redirectTo,
  }: {
    email: string;
    redirectTo?: string;
  }) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
  },
  clearRecoverySession: async () => {
    return supabase.auth.signOut({ scope: "local" });
  },
  getSession: async () => {
    return supabase.auth.getSession();
  },
  logout: async (token: string) => {
    return fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: getHeaders(token),
    });
  },
};
