"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  rewardPoints?: number;
}

interface AuthState {
  user: AuthUser | null;
  /** Short-lived JWT, kept in memory only. Renewed from the httpOnly refresh cookie. */
  accessToken: string | null;
  setSession: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setSession: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clear: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "bevsupply-auth",
      // Only the profile is persisted; the token is re-issued via /auth/refresh.
      partialize: (s) => ({ user: s.user }),
    },
  ),
);
