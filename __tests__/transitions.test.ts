import {
  canTransition,
  getLegalTransitions,
  type TicketStatus,
} from "@/lib/transitions";

describe("Ticket status transitions", () => {
  const statuses: TicketStatus[] = [
    "open",
    "in_progress",
    "resolved",
    "closed",
  ];

  const expectedTransitions: Record<TicketStatus, TicketStatus[]> = {
    open: ["in_progress"],
    in_progress: ["resolved"],
    resolved: ["closed", "in_progress"],
    closed: ["in_progress"],
  };

  it("allows exactly the legal transitions for every status", () => {
    for (const from of statuses) {
      expect(getLegalTransitions(from)).toEqual(expectedTransitions[from]);

      for (const to of statuses) {
        const shouldBeAllowed = expectedTransitions[from].includes(to);

        expect(canTransition(from, to)).toBe(shouldBeAllowed);
      }
    }
  });
});
