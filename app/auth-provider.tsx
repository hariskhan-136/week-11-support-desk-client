"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiFetch, ApiError } from "@/lib/api";
import {
  clearSession,
  getSession,
  saveSession,
  type SessionData,
  type SessionUser,
} from "@/lib/session";

interface AuthContextValue {
  token: string | null;
  user: SessionUser | null;
  role: SessionUser["role"] | null;
  isRestoring: boolean;
  signIn: (session: SessionData) => void;
  signOut: () => void;
}

interface MeResponse {
  id: number;
  email: string;
  fullName: string;
  role: "customer" | "agent" | "admin";
  createdAt: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const storedSession = getSession();

      if (!storedSession) {
        setIsRestoring(false);
        return;
      }

      try {
        const user = await apiFetch<MeResponse>("/auth/me");

        const restoredSession: SessionData = {
          token: storedSession.token,
          user,
        };

        saveSession(restoredSession);
        setSession(restoredSession);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          setSession(null);
        } else {
          // Keep the stored session for temporary API failures.
          setSession(storedSession);
        }
      } finally {
        setIsRestoring(false);
      }
    }

    void restoreSession();
  }, []);

  function signIn(newSession: SessionData) {
    saveSession(newSession);
    setSession(newSession);
  }

  function signOut() {
    clearSession();
    setSession(null);
  }

  return (
    <AuthContext.Provider
      value={{
        token: session?.token ?? null,
        user: session?.user ?? null,
        role: session?.user.role ?? null,
        isRestoring,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
