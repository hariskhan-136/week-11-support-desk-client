import { render, screen, waitFor } from "@testing-library/react";
import TicketDetailPage from "@/app/tickets/[id]/page";

const mockGetSession = jest.fn();
const mockApiFetch = jest.fn();

jest.mock("next/navigation", () => ({
  useParams: () => ({
    id: "6",
  }),
}));

jest.mock("@/lib/session", () => ({
  getSession: () => mockGetSession(),
}));

jest.mock("@/lib/api", () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
  ApiError: class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
      super(message);
      this.status = status;
      this.message = message;
    }
  },
}));

describe("TicketDetailPage roles", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockApiFetch.mockImplementation(async (path: string) => {
      if (path === "/tickets/6") {
        return {
          id: 6,
          subject: "Password reset request",
          body: "I need help resetting my password.",
          status: "open",
          priority: "normal",
          createdAt: "2026-09-01T10:00:00.000Z",
          dueAt: "2099-09-04T10:00:00.000Z",
          requester: {
            id: 4,
            email: "customer1@supportdesk.local",
            fullName: "Customer One",
            role: "customer",
            createdAt: "2026-01-01T10:00:00.000Z",
          },
          assignee: null,
        };
      }

      if (path === "/tickets/6/comments") {
        return [];
      }

      if (path === "/tickets/6/events") {
        return [];
      }

      return [];
    });
  });

  it("shows agent controls for an agent", async () => {
    mockGetSession.mockReturnValue({
      token: "agent-token",
      user: {
        id: 2,
        email: "agent1@supportdesk.local",
        fullName: "Support Agent One",
        role: "agent",
      },
    });

    render(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Password reset request")).toBeInTheDocument();
    });

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Change status")).toBeInTheDocument();

    expect(screen.getByText("Assign Ticket")).toBeInTheDocument();
    expect(screen.getByLabelText("Assign Ticket")).toBeInTheDocument();

    expect(screen.getByText("Internal comment")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("hides agent controls for a customer", async () => {
    mockGetSession.mockReturnValue({
      token: "customer-token",
      user: {
        id: 4,
        email: "customer1@supportdesk.local",
        fullName: "Customer One",
        role: "customer",
      },
    });

    render(<TicketDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Password reset request")).toBeInTheDocument();
    });

    expect(screen.queryByText("Status")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Change status")).not.toBeInTheDocument();

    expect(screen.queryByText("Assign Ticket")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Assign Ticket")).not.toBeInTheDocument();

    expect(screen.queryByText("Internal comment")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});
