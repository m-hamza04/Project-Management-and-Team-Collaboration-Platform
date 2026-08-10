# Frontend — Flowdeck (Project Management & Team Collaboration Platform)

A distinct visual identity was chosen for this build — an icon-only left
sidebar with a sliding "glow pill" active indicator, a warm amber accent on
a deep charcoal base (not the typical purple-gradient SaaS look), and
"orbit dot" priority indicators instead of flat badges. See the design
tokens in `src/styles/index.css` if you want to adjust the palette/type.

## 1. Install

```bash
cd frontend
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

`.env` should point at your running backend:
```env
VITE_API_URL="http://localhost:5000/api/v1"
VITE_SOCKET_URL="http://localhost:5000"
```

## 3. Run

```bash
npm run dev
```

Opens on `http://localhost:5173`. Make sure your backend (`npm run dev` in
`backend/`) is running on port 5000 first, and that you've already run
`npm run seed` there to get an Admin login.

## 4. Log in

Use the seeded Admin account from the backend:
- Email: `admin@example.com`
- Password: `Admin@123`

From there:
1. Go to **Users** → create a Project Manager and a couple of Team Members
2. Go to **Projects** → create a project, assign the PM
3. Open the project → **Add Member** to bring team members in
4. **New Task** to create tasks, assign them, set priority/due date
5. Open any task card → update status, start a discussion, attach a file
6. Watch **Notifications** — they arrive live via Socket.io, no refresh needed

## Folder Structure

```
src/
├── api/            # axios calls per resource (auth, projects, tasks, ...)
├── app/            # Redux store + typed hooks
├── components/
│   ├── layout/     # Sidebar, Topbar, AppLayout
│   ├── ui/         # Button, Input, Modal, Card, Badge, Toast, etc.
│   ├── projects/   # project-specific modals (create, add member)
│   ├── tasks/      # kanban board, task card, task detail modal
│   └── users/      # user creation modal
├── features/auth/  # Redux auth slice
├── hooks/          # useSocket (real-time notifications)
├── pages/          # one folder per route
├── styles/         # design tokens (index.css)
├── types/          # TS types mirroring the Prisma schema
├── router.tsx       # route tree (code-based TanStack Router)
├── App.tsx          # provider wiring
└── main.tsx          # entry point
```

## What's Implemented

- **Auth** — login, register (always Team Member), JWT stored in Redux + localStorage, auto-logout on 401
- **Role-aware routing** — Admin sees Users nav item, others don't; Users page redirects non-admins away
- **Dashboard** — stat cards computed from live project/task data, recent projects, upcoming deadlines
- **Projects** — search, status filter, create (Admin), detail page with member management, task Kanban
- **Tasks** — global Kanban board with project filter, per-task modal with status change, discussion thread, file attachments
- **Notifications** — list + mark read/all, **live push via Socket.io** (toast + badge update without refresh)
- **Users** — Admin CRUD, inline role change
- **Profile** — current user info

## What's Not Built Yet (say the word when ready)

- Calendar view (bonus feature)
- Activity timeline (bonus feature)
- Email notifications (backend needs Resend integration first)
- Analytics dashboard (bonus feature)
- Mobile-specific navigation polish (currently responsive but sidebar stays icon-only at all sizes — a collapsible drawer for small screens would be a nice follow-up)
