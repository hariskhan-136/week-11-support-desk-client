import type { UserRole } from "./session";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

const transitions: Record<TicketStatus, TicketStatus[]> = {
  open: ["in_progress"],
  in_progress: ["resolved"],
  resolved: ["closed", "in_progress"],
  closed: ["in_progress"],
};

export function getLegalTransitions(status: TicketStatus): TicketStatus[] {
  return transitions[status];
}

export function canTransition(from: TicketStatus, to: TicketStatus): boolean {
  return transitions[from].includes(to);
}

export function requiresReopenNote(
  from: TicketStatus,
  to: TicketStatus,
): boolean {
  return from === "closed" && to === "in_progress";
}

export function canChangeTicketStatus(role: UserRole): boolean {
  return role === "agent" || role === "admin";
}
