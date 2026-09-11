import { clearSession, saveSession } from "@/lib/session";

describe("apiFetch", () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    jest.resetModules();
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000";
    localStorage.clear();
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  });

  it("attaches Authorization header when signed in", async () => {
    saveSession({
      token: "test-token",
      user: {
        id: 2,
        email: "agent1@supportdesk.local",
        fullName: "Support Agent One",
        role: "agent",
      },
    });

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    global.fetch = fetchMock;

    const { apiFetch } = await import("@/lib/api");

    await apiFetch("/tickets");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, options] = fetchMock.mock.calls[0];

    expect(options?.headers).toBeDefined();

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("does not attach Authorization header when signed out", async () => {
    clearSession();

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    global.fetch = fetchMock;

    const { apiFetch } = await import("@/lib/api");

    await apiFetch("/tickets");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [, options] = fetchMock.mock.calls[0];

    expect(options?.headers).toBeDefined();

    const headers = new Headers(options?.headers);

    expect(headers.get("Authorization")).toBeNull();
  });
});
