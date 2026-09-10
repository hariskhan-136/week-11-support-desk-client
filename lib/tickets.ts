import type { UserRole } from "./session";
import type { TicketStatus } from "./transitions";

export type TicketPriority = "low" | "normal" | "high" | "urgent";

export interface TicketUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface Ticket {
  id: number;
  subject: string;
  body: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  dueAt: string;
  requester: TicketUser | null;
  assignee: TicketUser | null;
}

export interface TicketListResponse {
  data: Ticket[];
  page: number;
  pageSize: number;
  total: number;
}
