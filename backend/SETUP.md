# Backend Setup — Project Management & Team Collaboration Platform
## (v2 — includes Socket.io real-time + File Attachments)

## 1. Merge into your existing `backend/` project

This ZIP REPLACES:
- `prisma/schema.prisma`
- `server.ts`
- `src/services/notification.service.ts`

This ZIP ADDS (new files, nothing to merge):
- `src/config/socket.ts`
- `src/config/supabase.ts`
- `src/middlewares/upload.middleware.ts`
- `src/services/attachment.service.ts`
- `src/controllers/attachment.controller.ts`
- `src/routes/attachment.routes.ts`
- everything from the previous round (auth, users, projects, tasks, discussions, notifications)

Do NOT copy over your `.env`, `prisma.config.ts`, or `node_modules`.

## 2. Install new dependencies

```bash
npm install bcryptjs jsonwebtoken zod socket.io @supabase/supabase-js multer
npm install -D @types/bcryptjs @types/jsonwebtoken @types/multer tsx
```

## 3. Add to your `.env`

```env
JWT_SECRET="replace-with-a-long-random-string"
JWT_EXPIRES_IN="7d"

SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

Find `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in:
Supabase Dashboard → Project Settings → API
(These are DIFFERENT from your `DATABASE_URL`/`DIRECT_URL` — those are for Postgres, these are for the Supabase API/Storage layer.)

Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. Create the Storage bucket in Supabase

Dashboard → Storage → New Bucket:
- Name: `task-attachments`
- Public: ON (so `getPublicUrl` works directly; tighten with signed URLs later if you need private files)

## 5. Add seed script to package.json

```json
"scripts": {
  "seed": "tsx prisma/seed.ts"
}
```

## 6. Run migration (adds the new Attachment table + ATTACHMENT_ADDED enum value)

```bash
npx prisma migrate dev --name add_attachments
npx prisma generate
```

## 7. Seed the first Admin, then start the server

```bash
npm run seed
npm run dev
```

You should see:
```
Server running on port 5000
Socket.io ready for real-time connections
```

## How Socket.io Connects (frontend reference, for later)

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  auth: { token: "<the JWT from login>" }
});

socket.on("notification", (data) => {
  console.log("New notification:", data);
});
```

Every time `createNotification()` runs anywhere in the backend (task assigned,
status changed, discussion added, attachment added), it now ALSO pushes that
same notification live to the relevant user's browser via Socket.io — no
polling needed on the frontend.

## New API Routes

| Method | Route | Access |
|---|---|---|
| POST | `/api/v1/tasks/:taskId/attachments` (multipart, field name `file`) | Project members |
| GET | `/api/v1/tasks/:taskId/attachments` | Project members |
| DELETE | `/api/v1/tasks/:taskId/attachments/:id` | Uploader, PM, Admin |

## Still Not Built

- Deadline-approaching notifications (needs `node-cron` scheduled job)
- Dashboard aggregation endpoints (per-role counts)
- Email notifications (Resend, same pattern as Cosmet)

## v3 Addition — Live Project Chat

New model: `Message` (linked to Project + author). Distinct from Task
Discussion — this is a general live chat room per project, not tied to a
specific task.

### How it works
- **Sending**: happens directly over the socket (`send-message` event), not REST — lower latency for live chat
- **History**: `GET /api/v1/projects/:projectId/messages` (REST, last 100 messages)
- **Joining a room**: client emits `join-project` with the projectId when opening the chat tab; server verifies membership before allowing the join
- Access control is identical to everything else project-related: Admin, the assigned PM, or a member of that project

### Socket events reference (frontend)

```javascript
socket.emit('join-project', projectId);
socket.emit('leave-project', projectId); // when navigating away

socket.emit('send-message', { projectId, content: 'hello team' });

socket.on('new-message', (message) => {
  // append to chat UI — fires for everyone in that project's room, including sender
});
```

### Migration

```bash
npx prisma migrate dev --name add_live_chat
npx prisma generate
```
