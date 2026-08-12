import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (socket && socket.connected) return socket;

  if (!socket) {
    socket = io(SOCKET_URL, { auth: { token } });
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
