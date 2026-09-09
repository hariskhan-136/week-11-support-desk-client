import { clearSession, getSession } from "./session";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  return API_URL.replace(/\/$/, "");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const session = getSession();

  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (
      response.status === 401 &&
      !path.startsWith("/auth/login") &&
      !path.startsWith("/auth/register")
    ) {
      clearSession();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    let message = `Request failed with status ${response.status}`;
    let fields: Record<string, string> | undefined;

    if (response.status !== 204) {
      try {
        const errorBody = await response.json();

        if (typeof errorBody?.message === "string") {
          message = errorBody.message;
        }

        if (errorBody?.fields && typeof errorBody.fields === "object") {
          fields = errorBody.fields;
        }
      } catch {
        // Keep the default error message.
      }
    }

    throw new ApiError(response.status, message, fields);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
