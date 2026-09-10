"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { apiFetch, ApiError } from "@/lib/api";
import type { Tag } from "@/lib/tags";
import type { Ticket, TicketListResponse } from "@/lib/tickets";
import Link from "next/link";

export default function TicketsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    async function loadTags() {
      try {
        const response = await apiFetch<Tag[]>("/tags");
        setTags(response);
      } catch {
        setTags([]);
      }
    }

    void loadTags();
  }, []);

  useEffect(() => {
    async function loadTickets() {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams();

      const queryKeys = [
        "status",
        "priority",
        "assigneeId",
        "tag",
        "q",
        "sort",
        "order",
        "page",
        "pageSize",
        "overdue",
      ];

      for (const key of queryKeys) {
        const value = searchParams.get(key);

        if (value) {
          params.set(key, value);
        }
      }

      const queryString = params.toString();
      const path = queryString ? `/tickets?${queryString}` : "/tickets";

      try {
        const response = await apiFetch<TicketListResponse>(path);

        setTickets(response.data);
        setPage(response.page);
        setPageSize(response.pageSize);
        setTotal(response.total);
      } catch (error) {
        if (error instanceof ApiError) {
          setError(error.message);
        } else {
          setError("Unable to load tickets.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadTickets();
  }, [searchParams]);

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQuery = searchParams.get("q") ?? "";

      if (search === currentQuery) {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (search.trim()) {
        params.set("q", search.trim());
      } else {
        params.delete("q");
      }

      params.set("page", "1");

      router.push(`/tickets?${params.toString()}`);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search, searchParams, router]);

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");

    router.push(`/tickets?${params.toString()}`);
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  const hasFilters =
    searchParams.has("status") ||
    searchParams.has("priority") ||
    searchParams.has("assigneeId") ||
    searchParams.has("tag") ||
    searchParams.has("q") ||
    searchParams.has("sort") ||
    searchParams.has("order") ||
    searchParams.has("overdue");

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Tickets</h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage support tickets.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <input
          type="search"
          value={search}
          onChange={handleSearch}
          placeholder="Search tickets..."
          className="rounded border px-3 py-2"
        />

        <select
          value={searchParams.get("status") ?? ""}
          onChange={(event) => updateFilter("status", event.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={searchParams.get("priority") ?? ""}
          onChange={(event) => updateFilter("priority", event.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <label className="flex items-center gap-2 rounded border px-3 py-2">
          <input
            type="checkbox"
            checked={searchParams.get("overdue") === "true"}
            onChange={(event) =>
              updateFilter("overdue", event.target.checked ? "true" : "")
            }
          />

          <span className="text-sm">Overdue only</span>
        </label>

        <select
          value={searchParams.get("sort") ?? ""}
          onChange={(event) => updateFilter("sort", event.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">Sort by</option>
          <option value="createdAt">Created date</option>
          <option value="dueAt">Due date</option>
          <option value="priority">Priority</option>
        </select>

        <select
          value={searchParams.get("tag") ?? ""}
          onChange={(event) => updateFilter("tag", event.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">All tags</option>

          {tags.map((tag) => (
            <option key={tag.id} value={tag.name}>
              {tag.name}
            </option>
          ))}
        </select>

        <select
          value={searchParams.get("order") ?? ""}
          onChange={(event) => updateFilter("order", event.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="">Order</option>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <select
          value={searchParams.get("pageSize") ?? "20"}
          onChange={(event) => updateFilter("pageSize", event.target.value)}
          className="rounded border px-3 py-2"
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
          <option value="100">100 per page</option>
        </select>
      </div>

      {isLoading && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-500">Loading tickets...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-lg border border-red-200 p-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!isLoading && !error && tickets.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-gray-500">
            {total === 0 && !hasFilters
              ? "You have no tickets."
              : "No tickets match your filters."}
          </p>
        </div>
      )}

      {!isLoading && !error && tickets.length > 0 && (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="block rounded-lg border p-5 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">{ticket.subject}</h2>

                  <p className="mt-1 text-sm text-gray-500">{ticket.body}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                    {ticket.status}
                  </span>

                  {new Date(ticket.dueAt).getTime() < Date.now() &&
                    ticket.status !== "resolved" &&
                    ticket.status !== "closed" && (
                      <span className="rounded bg-red-100 px-2 py-1 text-xs text-red-700">
                        Overdue
                      </span>
                    )}
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-3">
                <div>
                  <span className="font-medium">Priority:</span>{" "}
                  {ticket.priority}
                </div>

                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {new Date(ticket.createdAt).toLocaleString()}
                </div>

                <div>
                  <span className="font-medium">Due:</span>{" "}
                  {new Date(ticket.dueAt).toLocaleString()}
                </div>
              </div>
            </Link>
          ))}

          <div className="flex items-center justify-between border-t pt-4">
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(page - 1));
                router.push(`/tickets?${params.toString()}`);
              }}
              disabled={page <= 1}
              className="rounded border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-500">
              Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
            </span>

            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.set("page", String(page + 1));
                router.push(`/tickets?${params.toString()}`);
              }}
              disabled={page >= Math.ceil(total / pageSize)}
              className="rounded border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
