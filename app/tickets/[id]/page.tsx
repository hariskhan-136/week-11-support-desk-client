"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { apiFetch, ApiError } from "@/lib/api";
import { getSession } from "@/lib/session";
import type { Ticket } from "@/lib/tickets";

interface TicketComment {
  id: number;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: {
    id: number;
    email: string;
    fullName: string;
    role: "customer" | "agent" | "admin";
    createdAt: string;
  };
}

interface TicketEvent {
  id: number;
  fromStatus: string | null;
  toStatus: string | null;
  note: string | null;
  createdAt: string;
  actor: {
    id: number;
    email: string;
    fullName: string;
    role: "customer" | "agent" | "admin";
    createdAt: string;
  } | null;
}

interface CreateCommentResponse {
  id: number;
  body: string;
  isInternal: boolean;
  createdAt: string;
  author: {
    id: number;
    email: string;
    fullName: string;
    role: "customer" | "agent" | "admin";
    createdAt: string;
  };
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [events, setEvents] = useState<TicketEvent[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [commentBody, setCommentBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const session = getSession();
  const canCreateInternalComment =
    session?.user.role === "agent" || session?.user.role === "admin";

  useEffect(() => {
    async function loadTicket() {
      setIsLoading(true);
      setError("");
      setNotFound(false);

      try {
        const [ticketResponse, commentsResponse, eventsResponse] =
          await Promise.all([
            apiFetch<Ticket>(`/tickets/${params.id}`),
            apiFetch<TicketComment[]>(`/tickets/${params.id}/comments`),
            apiFetch<TicketEvent[]>(`/tickets/${params.id}/events`),
          ]);

        setTicket(ticketResponse);
        setComments(commentsResponse);
        setEvents(eventsResponse);
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 404) {
            setNotFound(true);
          } else {
            setError(error.message);
          }
        } else {
          setError("Unable to load ticket.");
        }
      } finally {
        setIsLoading(false);
      }
    }

    void loadTicket();
  }, [params.id]);

  async function handleAddComment() {
    const trimmedBody = commentBody.trim();

    setCommentError("");

    if (!trimmedBody) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    setIsSubmittingComment(true);

    try {
      const response = await apiFetch<CreateCommentResponse>(
        `/tickets/${params.id}/comments`,
        {
          method: "POST",
          body: JSON.stringify({
            body: trimmedBody,
            isInternal: canCreateInternalComment ? isInternal : false,
          }),
        },
      );

      setComments((currentComments) => [...currentComments, response]);

      setCommentBody("");
      setIsInternal(false);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          setCommentError(error.message);
        } else if (error.status === 403) {
          setCommentError(
            "You do not have permission to create an internal comment.",
          );
        } else if (error.status === 404) {
          setCommentError("Ticket not found.");
        } else {
          setCommentError(error.message);
        }
      } else {
        setCommentError("Unable to add comment.");
      }
    } finally {
      setIsSubmittingComment(false);
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-gray-500">Loading ticket...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-lg border p-8 text-center">
          <h1 className="text-xl font-semibold">Ticket not found</h1>

          <p className="mt-2 text-gray-500">
            The ticket you are looking for does not exist or you do not have
            access to it.
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="rounded-lg border border-red-200 p-8">
          <p className="text-red-600">{error}</p>
        </div>
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-8">
        <p className="text-gray-500">Ticket not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{ticket.subject}</h1>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded bg-gray-100 px-2 py-1 text-xs">
            {ticket.status}
          </span>

          <span className="rounded bg-gray-100 px-2 py-1 text-xs">
            {ticket.priority}
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

      <div className="space-y-6">
        <section className="rounded-lg border p-6">
          <h2 className="mb-3 font-semibold">Description</h2>

          <p className="whitespace-pre-wrap text-gray-700">{ticket.body}</p>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="mb-4 font-semibold">Ticket Information</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Requester</p>

              <p className="font-medium">
                {ticket.requester?.fullName ?? "Unknown"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Assignee</p>

              <p className="font-medium">
                {ticket.assignee?.fullName ?? "Unassigned"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Created</p>

              <p className="font-medium">
                {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Due</p>

              <p className="font-medium">
                {new Date(ticket.dueAt).toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="mb-4 font-semibold">Comments</h2>

          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">No comments yet.</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{comment.author.fullName}</p>

                      <p className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {comment.isInternal && (
                      <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                        Internal
                      </span>
                    )}
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-gray-700">
                    {comment.body}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border-t pt-6">
            <h3 className="mb-3 font-medium">Add Comment</h3>

            <textarea
              value={commentBody}
              onChange={(event) => setCommentBody(event.target.value)}
              placeholder="Write your comment..."
              rows={4}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2"
            />

            {canCreateInternalComment && (
              <label className="mt-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(event) => setIsInternal(event.target.checked)}
                />

                <span className="text-sm">Internal comment</span>
              </label>
            )}

            {commentError && (
              <p className="mt-3 text-sm text-red-600">{commentError}</p>
            )}

            <button
              type="button"
              onClick={handleAddComment}
              disabled={isSubmittingComment}
              className="mt-4 rounded bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmittingComment ? "Adding..." : "Add Comment"}
            </button>
          </div>
        </section>

        <section className="rounded-lg border p-6">
          <h2 className="mb-4 font-semibold">Events</h2>

          {events.length === 0 ? (
            <p className="text-sm text-gray-500">No events yet.</p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">
                      {event.actor?.fullName ?? "System"}
                    </p>

                    <p className="text-xs text-gray-500">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {event.fromStatus && event.toStatus && (
                    <p className="mt-2 text-sm text-gray-700">
                      Status changed from{" "}
                      <span className="font-medium">{event.fromStatus}</span> to{" "}
                      <span className="font-medium">{event.toStatus}</span>
                    </p>
                  )}

                  {event.note && (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                      {event.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
