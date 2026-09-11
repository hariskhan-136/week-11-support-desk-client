import { render, screen, waitFor } from "@testing-library/react";
import TicketsPage from "@/app/tickets/page";

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@/lib/api", () => ({
  apiFetch: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

import { apiFetch } from "@/lib/api";

const mockedApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe("TicketsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("renders ticket rows from a mocked page envelope", async () => {
    mockedApiFetch
      .mockResolvedValueOnce([
        {
          id: 1,
          name: "Bug",
        },
      ] as never)
      .mockResolvedValueOnce({
        data: [
          {
            id: 6,
            subject: "Password reset request",
            body: "I need help resetting my password.",
            status: "open",
            priority: "normal",
            createdAt: "2026-09-01T10:00:00.000Z",
            dueAt: "2099-09-04T10:00:00.000Z",
            requester: null,
            assignee: null,
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
      } as never);

    render(<TicketsPage />);

    expect(screen.getByText("Loading tickets...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Password reset request")).toBeInTheDocument();
    });

    expect(
      screen.getByText("I need help resetting my password."),
    ).toBeInTheDocument();

    expect(screen.getByText("open")).toBeInTheDocument();
    expect(screen.getByText("normal")).toBeInTheDocument();

    expect(mockedApiFetch).toHaveBeenCalledWith("/tickets");
  });

  it("renders the empty state when there are no tickets", async () => {
    mockedApiFetch.mockResolvedValueOnce([] as never).mockResolvedValueOnce({
      data: [],
      page: 1,
      pageSize: 20,
      total: 0,
    } as never);

    render(<TicketsPage />);

    await waitFor(() => {
      expect(screen.getByText("You have no tickets.")).toBeInTheDocument();
    });

    expect(
      screen.queryByText("No tickets match your filters."),
    ).not.toBeInTheDocument();
  });
});
