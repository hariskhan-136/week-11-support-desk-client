import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
      this.message = message;
    }
  },
}));

import { apiFetch } from "@/lib/api";

const mockedApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

describe("TicketsPage filters", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockSearchParams = new URLSearchParams();

    mockedApiFetch.mockImplementation(async (path) => {
      if (path === "/tags") {
        return [
          {
            id: 1,
            name: "billing",
          },
        ] as never;
      }

      return {
        data: [],
        page: 1,
        pageSize: 20,
        total: 0,
      } as never;
    });
  });

  it("updates the query string and requests filtered tickets", async () => {
    const user = userEvent.setup();

    const { rerender } = render(<TicketsPage />);

    await waitFor(() => {
      expect(mockedApiFetch).toHaveBeenCalledWith("/tickets");
    });

    const prioritySelect = screen.getByDisplayValue("All priorities");

    await user.selectOptions(prioritySelect, "high");

    expect(mockPush).toHaveBeenCalledWith("/tickets?priority=high&page=1");

    mockSearchParams = new URLSearchParams("priority=high&page=1");

    rerender(<TicketsPage />);

    await waitFor(() => {
      expect(mockedApiFetch).toHaveBeenCalledWith(
        "/tickets?priority=high&page=1",
      );
    });
  });
});
