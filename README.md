# Support Desk Client

A role-based customer support ticket management frontend built with Next.js, TypeScript, Tailwind CSS, and the Week 10 Support Desk API.

The application provides a client-side interface for customers, agents, and administrators to manage support tickets, comments, assignments, statuses, tags, and ticket events.

---

## Tech Stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Jest
- Testing Library
- jsdom
- Fetch API
- GitHub Actions

---

## Related Backend

This frontend communicates with the **Week 10 Support Desk API**, which is built with:

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT Authentication
- bcrypt

The Week 10 backend provides the authentication, ticket, comment, tag, assignment, status, and event APIs consumed by this client.

The client does not contain its own database.

---

## Features

### Authentication

- Customer registration
- Login
- JWT authentication
- Session persistence using browser local storage
- Automatic Authorization header handling
- Sign out
- Automatic session clearing when an authenticated request returns `401 Unauthorized`
- Redirect to `/login` after an authenticated session expires

### Ticket Management

- View tickets
- View ticket details
- Create new tickets
- Ticket status
- Ticket priority
- Requester
- Assignee
- Due date
- Overdue indicator
- Ticket comments
- Ticket events

### Ticket List

The ticket list supports server-side filtering and pagination.

Available filters:

- Status
- Priority
- Assignee
- Tag
- Overdue
- Search

Search is sent to the API using the `q` query parameter.

The client does not perform ticket filtering locally.

### Sorting

Tickets can be sorted by:

- `createdAt`
- `dueAt`
- `priority`

Sorting supports:

- `asc`
- `desc`

### Pagination

The ticket list uses the API pagination envelope:

```json
{
  "data": [],
  "page": 1,
  "pageSize": 20,
  "total": 0
}
```

The `total` value is used to calculate the available pages.

### Query String State

Ticket filters, search, sorting, ordering, and pagination are stored in the URL query string.

This allows users to:

- Refresh the page without losing filters
- Use browser back/forward navigation
- Copy and paste filtered ticket URLs
- Preserve the current ticket list state

Search input is debounced before sending the request.

---

## Role-Based Interface

The client supports three roles.

### Customer

Customers can:

- Register
- Login
- Create tickets
- View their own tickets
- View ticket details
- Add public comments
- View public comments
- View ticket events available to them

Customers cannot:

- Assign tickets
- Change ticket status
- Create internal comments
- Manage tags
- Delete tickets

### Agent

Agents can:

- Login
- View tickets
- View ticket details
- Assign tickets
- Change ticket status
- Add public comments
- Add internal comments
- View internal comments
- Manage ticket tags

### Admin

Admins have the agent capabilities and can additionally:

- Create tags
- Delete tickets
- Perform administrative ticket operations

Role-dependent UI controls are centralized through:

```text
lib/permissions.ts
```

---

## Ticket Status Transitions

The client follows the status transition rules defined by the Support Desk API.

Allowed transitions:

```text
open → in_progress

in_progress → resolved

resolved → closed

resolved → in_progress

closed → in_progress
```

The client uses:

```text
lib/transitions.ts
```

to determine which status changes are available.

Illegal transitions are not presented as valid choices.

Reopening a closed ticket sends the required reopening note.

---

## Comments

Users can add comments from the ticket detail page.

Comments display:

- Author
- Creation time
- Comment body

Internal comments are clearly marked.

The internal comment option is available only to agents and administrators.

Comments are displayed oldest first.

---

## Ticket Events

Ticket events are displayed on the ticket detail page.

Events include information such as:

- Actor
- Creation time
- Previous status
- New status
- Event note

Events are displayed newest first.

---

## Error Handling

The client handles API errors using typed `ApiError` responses.

The API status code is preserved so the UI can provide appropriate messages.

Supported error cases include:

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity`

Examples include:

- Invalid form data
- Invalid credentials
- Unauthorized actions
- Missing tickets
- Invalid status transitions
- Invalid ticket assignments

---

## API Client

All API requests are centralized in:

```text
lib/api.ts
```

This module is the only module responsible for calling `fetch`.

The API client:

- Reads the configured API base URL
- Adds the JWT Bearer token when signed in
- Sets JSON content headers when required
- Handles non-2xx responses as errors
- Preserves HTTP status codes
- Preserves validation fields when provided
- Handles `204 No Content` responses without attempting to parse JSON
- Clears the session after unauthorized authenticated requests

---

## Session Management

Browser session storage is centralized in:

```text
lib/session.ts
```

The session contains:

- JWT access token
- User information
- User role

The client does not use:

- `middleware.ts`
- HTTP-only cookies

The token is stored in browser local storage according to the Week 11 client requirements.

---

## Environment Variables

Create a `.env.local` file in the project root.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

`NEXT_PUBLIC_API_URL` must point to the running Week 10 Support Desk API.

Do not commit real secrets or private environment files to the repository.

The application is also required to build successfully when:

- `NEXT_PUBLIC_API_URL` is not configured
- The backend API is not running

The API URL is therefore read at request time rather than being required during the Next.js production build.

---

## Installation

Install the project dependencies:

```bash
npm install
```

---

## Running the Client

Start the development server:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

Make sure the Week 10 Support Desk API is also running and that `NEXT_PUBLIC_API_URL` points to the API.

---

## Application Routes

### Login

```text
/login
```

Allows users to authenticate using their email and password.

### Register

```text
/register
```

Allows a new customer account to be created.

Registration does not allow users to select the `agent` or `admin` role.

### Ticket List

```text
/tickets
```

Displays the authenticated user's ticket list with:

- Filters
- Search
- Sorting
- Pagination
- Loading state
- Error state
- Empty state

### Create Ticket

```text
/tickets/new
```

Allows an authenticated user to create a new ticket.

Required fields:

- Subject
- Body
- Priority

The due date is calculated by the backend and is not entered by the client.

### Ticket Detail

```text
/tickets/[id]
```

Displays:

- Subject
- Description
- Status
- Priority
- Requester
- Assignee
- Created date
- Due date
- Overdue state
- Comments
- Events

Agents and administrators additionally receive controls for:

- Status changes
- Ticket assignment
- Internal comments

---

## Seed Accounts

The client uses the seeded accounts provided by the Week 10 Support Desk API.

All seeded accounts use:

```text
Password: SupportDesk123!
```

| Role     | Email                         |
| -------- | ----------------------------- |
| Admin    | `admin@supportdesk.local`     |
| Agent    | `agent1@supportdesk.local`    |
| Agent    | `agent2@supportdesk.local`    |
| Customer | `customer1@supportdesk.local` |
| Customer | `customer2@supportdesk.local` |
| Customer | `customer3@supportdesk.local` |
| Customer | `customer4@supportdesk.local` |
| Customer | `customer5@supportdesk.local` |

### Example Agent Account

```text
Email: agent1@supportdesk.local
Password: SupportDesk123!
```

### Example Customer Account

```text
Email: customer1@supportdesk.local
Password: SupportDesk123!
```

### Example Admin Account

```text
Email: admin@supportdesk.local
Password: SupportDesk123!
```

These accounts are created by the Week 10 backend seed.

---

## Testing

The project uses Jest, jsdom, and Testing Library.

Run the complete test suite:

```bash
npm test
```

The Week 11 test suite contains five required specifications.

### Spec 1 — API Client

Verifies:

- Authorization header is attached when signed in
- Authorization header is absent when signed out

### Spec 2 — Ticket List

Verifies:

- Ticket rows render from the API page envelope
- Empty state renders when there are no tickets

### Spec 3 — Filters

Verifies:

- Changing a filter updates the URL query string
- The filtered query is sent to the API

### Spec 4 — Roles

Verifies:

- Agent controls are visible to agents
- Agent controls are hidden from customers

### Spec 5 — Transitions

Verifies:

- All legal ticket status transitions
- All illegal ticket status transitions

Latest successful verification:

```text
Test Suites: 5 passed, 5 total
Tests:       8 passed, 8 total
Snapshots:   0 total
```

No tests are skipped.

---

## Production Build

Create an optimized production build:

```bash
npm run build
```

The production build must succeed without a running backend API.

Latest successful verification:

```text
✓ Compiled successfully
✓ Finished TypeScript
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

## Build Requirements

The client is designed so that the following works without a running API server:

```bash
npm run build
```

The API is only required when the application is actually making API requests at runtime.

---

## Project Structure

```text
app/
├── login/
│   └── page.tsx
├── register/
│   └── page.tsx
├── tickets/
│   ├── [id]/
│   │   └── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── page.tsx
├── layout.tsx
├── page.tsx
└── globals.css

lib/
├── api.ts
├── permissions.ts
├── session.ts
├── tickets.ts
└── transitions.ts

__tests__/
├── api-client.test.ts
├── filters.test.tsx
├── list.test.tsx
├── roles.test.tsx
└── transitions.test.ts

jest.config.ts
jest.setup.ts
package.json
package-lock.json
README.md
```

---

## Architectural Rules

The Week 11 client follows these architectural requirements:

- Data fetching is performed from Client Components.
- Browser storage is used for the authentication session.
- `lib/api.ts` is the only module that calls `fetch`.
- `lib/session.ts` is the only module responsible for session storage.
- `lib/permissions.ts` centralizes role permissions.
- `lib/transitions.ts` centralizes ticket status transitions.
- API filtering is performed by the backend.
- Ticket list state is represented in the URL query string.
- No `middleware.ts` is used.
- No HTTP-only authentication cookie is used.

---

## CI

The project is intended to be verified through GitHub Actions.

CI should run using Node.js 20 and perform:

```bash
npm ci
npm run build
npm test
```

The client build and tests do not require:

- A running PostgreSQL server
- A running backend API
- External API access
- Committed secrets

---

## API Relationship

The Week 11 client consumes the Week 10 Support Desk API.

The architecture is:

```text
┌──────────────────────────────┐
│      Support Desk Client     │
│                              │
│ Next.js + TypeScript         │
│ Tailwind CSS                 │
└──────────────┬───────────────┘
               │
               │ HTTP / JSON
               │ JWT Bearer Token
               ▼
┌──────────────────────────────┐
│       Support Desk API       │
│                              │
│ NestJS + TypeScript          │
│ PostgreSQL + TypeORM         │
│ JWT + bcrypt                 │
└──────────────┬───────────────┘
               │
               ▼
        PostgreSQL Database
```

The backend is responsible for:

- Authentication
- Authorization
- Ticket data
- Comments
- Tags
- Ticket events
- Status transition validation
- Assignment validation
- Database persistence

The frontend is responsible for:

- User interface
- Form handling
- Client-side session state
- API communication
- Role-based UI controls
- Ticket filtering and pagination UI
- Error presentation

---

## Week 10 Backend

The Week 10 backend repository contains the API consumed by this project.

The backend supports:

- Customer registration and login
- JWT authentication
- Role-based authorization
- Tickets
- Ticket comments
- Internal comments
- Ticket assignments
- Ticket status transitions
- Tags
- Ticket events
- PostgreSQL persistence

The Week 10 API documentation contains the complete endpoint and database information.

---

## Git and Contribution Workflow

Changes should be made through a feature branch and pull request.

Required workflow:

```text
Create branch
    ↓
Make changes
    ↓
Run verification
    ↓
Commit changes
    ↓
Push branch
    ↓
Open Pull Request
    ↓
Collaborator review
    ↓
Collaborator merges PR
    ↓
Update local default branch
```

Direct pushes to the default branch should not be used for changes that require review.

---

## Security

- Authentication uses JWT access tokens.
- Passwords are handled by the Week 10 API using bcrypt.
- Real secrets must not be committed.
- `.env.local` must not be committed.
- Customer users cannot select an elevated role during registration.
- Role-based controls are hidden from unauthorized users.
- Internal comment controls are hidden from customers.
- API authorization remains enforced by the backend even when a UI control is hidden.

---

## 👨‍💻 Developer

**Muhammad Haris**

GitHub: https://github.com/hariskhan-136

---

## 🎓 Internship

**Coding Pixel Full-Stack Internship Program**

**Week 11 — Support Desk Client**

**Repository created for Week 11 Support Desk Client internship exercise**
