import type { UserRole } from "./session";

export function canManageTickets(role: UserRole): boolean {
  return role === "agent" || role === "admin";
}

export function canAssignTickets(role: UserRole): boolean {
  return role === "agent" || role === "admin";
}

export function canChangeStatus(role: UserRole): boolean {
  return role === "agent" || role === "admin";
}

export function canManageTags(role: UserRole): boolean {
  return role === "agent" || role === "admin";
}

export function canWriteInternalComments(role: UserRole): boolean {
  return role === "agent" || role === "admin";
}

export function canCreateTags(role: UserRole): boolean {
  return role === "admin";
}

export function canDeleteTickets(role: UserRole): boolean {
  return role === "admin";
}
