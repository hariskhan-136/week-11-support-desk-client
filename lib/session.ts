export type UserRole = "customer" | "agent" | "admin";

export interface SessionUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt?: string;
}

export interface SessionData {
  token: string;
  user: SessionUser;
}

const SESSION_KEY = "support-desk-session";

export function getSession(): SessionData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session: SessionData): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}
