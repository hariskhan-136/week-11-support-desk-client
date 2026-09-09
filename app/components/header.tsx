"use client";

import Link from "next/link";

import { useAuth } from "../auth-provider";

export function Header() {
  const { user, signOut } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/tickets" className="font-semibold">
          Support Desk
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">{user.fullName}</span>
            <span className="ml-2 text-gray-500">({user.role})</span>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="rounded border px-3 py-2 text-sm hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
