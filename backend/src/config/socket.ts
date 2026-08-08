import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

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

    socket.on('disconnect', () => {
      // socket.io automatically leaves rooms on disconnect, nothing to clean up here
    });
  });

  return io;
};

// Used anywhere else in the app (e.g. notification.service.ts) to push events
export const getIO = (): Server => {
  if (!io) throw new Error('Socket.io not initialized yet');
  return io;
};
