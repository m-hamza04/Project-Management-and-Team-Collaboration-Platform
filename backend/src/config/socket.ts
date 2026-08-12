import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import prisma from './db';

let io: Server;

// Called once from server.ts, right after the HTTP server is created
export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: { origin: '*' }, // tighten this to your frontend URL in production
  });

  // Every socket connection must present a valid JWT, same one used for REST auth
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('Authentication token missing'));

      const decoded = verifyToken(token);
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;

    // Each user joins a private room named after their own id.
    // This lets us target a single user with io.to(userId).emit(...)
    // without tracking socket ids manually.
    socket.join(userId);

    // ── Live chat: join a project's chat room ──
    // Client calls this once when opening a project's chat tab.
    socket.on('join-project', async (projectId: string) => {
      const hasAccess = await userCanAccessProject(userId, socket.data.role, projectId);
      if (!hasAccess) return;
      socket.join(`project:${projectId}`);
    });

    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });

    // ── Live chat: send a message ──
    // Sent directly over the socket (not REST) for lower latency.
    socket.on('send-message', async (payload: { projectId: string; content: string }) => {
      const { projectId, content } = payload;
      if (!content?.trim()) return;

      const hasAccess = await userCanAccessProject(userId, socket.data.role, projectId);
      if (!hasAccess) return;

      const message = await prisma.message.create({
        data: { projectId, authorId: userId, content: content.trim() },
        include: { author: { select: { id: true, name: true, email: true, role: true } } },
      });

      // Broadcast to everyone currently viewing this project's chat, including the sender
      io.to(`project:${projectId}`).emit('new-message', message);
    });

    socket.on('disconnect', () => {
      // socket.io automatically leaves rooms on disconnect, nothing to clean up here
    });
  });

  return io;
};

// Shared access check: Admin, the project's PM, or a member of that project
async function userCanAccessProject(userId: string, role: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });
  if (!project) return false;
  if (role === 'ADMIN') return true;
  if (role === 'PROJECT_MANAGER' && project.managerId === userId) return true;
  if (role === 'TEAM_MEMBER' && project.members.some((m) => m.userId === userId)) return true;
  return false;
}

// Used anywhere else in the app (e.g. notification.service.ts) to push events
export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized yet');
  return io;
};
