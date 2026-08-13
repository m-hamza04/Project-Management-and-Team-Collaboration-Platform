# Flowdeck — Admin Console

A **standalone** app, separate from the main Flowdeck frontend — same pattern
as the Cosmet Admin Panel. This is for Administrators only; it talks to the
same backend API as the main app.

## 1. Install

```bash
cd admin-panel
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

```env
VITE_API_URL="http://localhost:5000/api/v1"
```

## 3. Run

```bash
npm run dev
```

Opens on **`http://localhost:5174`** — different port from the main
Flowdeck app (`5173`), so you can run both at once and test side by side.

## 4. Log in

Only accounts with the `ADMIN` role can get past the login screen — if a
Project Manager or Team Member tries to log in here, they're rejected with
a clear message even though their credentials are valid (the check happens
client-side after a successful login, since the backend's `/auth/login`
endpoint itself doesn't restrict by role).

Use your seeded Admin account:
- Email: `admin@example.com`
- Password: `Admin@123`

## What's Different From the Main App

This isn't a trimmed copy — it's built around what an Administrator
specifically needs, per the assignment brief ("Access the complete system
from a single dashboard"):

- **Overview dashboard** — org-wide stats (total users, total/active
  projects, total tasks) plus two charts: a donut of projects by status,
  a bar chart of tasks by status
- **Users** — full CRUD, inline role changes, active/inactive toggle,
  search + role filter
- **Projects** — full list with search/status filter, create (assign a
  PM), click into a project for a monitoring view: status control, team
  list, and a **task completion progress bar** computed from that
  project's tasks
- No task creation/assignment, no discussions, no chat — those are the
  Project Manager's and Team Member's job in the main app. The Admin
  console is about oversight and control, not day-to-day execution.

## Shared Design System

Same color tokens, fonts, and UI primitives as the main Flowdeck app —
intentionally, so it reads as the same product family. The sidebar uses a
small square "control" indicator instead of the main app's rounded pill,
to visually signal "this is the control tower" without breaking brand
consistency. See `src/styles/index.css` to adjust.

## Storage Isolation

This app stores its session under `admin_token`/`admin_user` in
localStorage (vs. `token`/`user` in the main app), so you can be logged
into both apps simultaneously in the same browser without one logging the
other out.

## Note on Bundle Size

The production build shows a "chunk larger than 500kB" warning — this is
from `recharts` (the dashboard charts). It's not an error and won't affect
functionality; if you want to trim it later, dynamic-import the Dashboard
route or swap recharts for a lighter chart lib.
