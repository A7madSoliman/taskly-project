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
  getUser: async (token: string) => {
    return fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "GET",
      headers: getHeaders(token),
    });
  },
  updatePassword: async (token: string, data: unknown) => {
    return fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
  },
  refreshToken: async (refreshToken: string) => {
    return fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },
  forgotPassword: async (email: string) => {
    return fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
  },
  logout: async (token: string) => {
    return fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: getHeaders(token),
    });
  },
};
