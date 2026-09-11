"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch, ApiError } from "@/lib/api";
import type { Ticket, TicketPriority } from "@/lib/tickets";

export default function NewTicketPage() {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("normal");

  const [subjectError, setSubjectError] = useState("");
  const [bodyError, setBodyError] = useState("");
  const [priorityError, setPriorityError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearErrors() {
    setSubjectError("");
    setBodyError("");
    setPriorityError("");
    setFormError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    clearErrors();

    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();

    let hasValidationError = false;

    if (!trimmedSubject) {
      setSubjectError("Subject is required.");
      hasValidationError = true;
    }

    if (!trimmedBody) {
      setBodyError("Description is required.");
      hasValidationError = true;
    }

    if (hasValidationError) {
      return;
    }

    setIsSubmitting(true);

    try {
      const ticket = await apiFetch<Ticket>("/tickets", {
        method: "POST",
        body: JSON.stringify({
          subject: trimmedSubject,
          body: trimmedBody,
          priority,
        }),
      });

      router.push(`/tickets/${ticket.id}`);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 400) {
          if (error.fields?.subject) {
            setSubjectError(error.fields.subject);
          }

          if (error.fields?.body) {
            setBodyError(error.fields.body);
          }

          if (error.fields?.priority) {
            setPriorityError(error.fields.priority);
          }

          if (!error.fields) {
            setFormError(error.message);
          }
        } else if (error.status === 401) {
          setFormError("Please sign in again.");
        } else {
          setFormError(error.message);
        }
      } else {
        setFormError("Unable to create ticket.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">New Ticket</h1>

        <p className="mt-1 text-sm text-gray-500">
          Create a new support ticket.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{formError}</p>
          </div>
        )}

        <div>
          <label htmlFor="subject" className="mb-2 block text-sm font-medium">
            Subject
          </label>

          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(event) => {
              setSubject(event.target.value);
              setSubjectError("");
              setFormError("");
            }}
            className="w-full rounded border px-3 py-2"
            placeholder="Enter ticket subject"
          />

          {subjectError && (
            <p className="mt-1 text-sm text-red-600">{subjectError}</p>
          )}
        </div>

        <div>
          <label htmlFor="body" className="mb-2 block text-sm font-medium">
            Description
          </label>

          <textarea
            id="body"
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              setBodyError("");
              setFormError("");
            }}
            rows={8}
            className="w-full rounded border px-3 py-2"
            placeholder="Describe your issue..."
          />

          {bodyError && (
            <p className="mt-1 text-sm text-red-600">{bodyError}</p>
          )}
        </div>

        <div>
          <label htmlFor="priority" className="mb-2 block text-sm font-medium">
            Priority
          </label>

          <select
            id="priority"
            value={priority}
            onChange={(event) => {
              setPriority(event.target.value as TicketPriority);
              setPriorityError("");
              setFormError("");
            }}
            className="w-full rounded border px-3 py-2"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {priorityError && (
            <p className="mt-1 text-sm text-red-600">{priorityError}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-black px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Ticket"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/tickets")}
            className="rounded border px-5 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
