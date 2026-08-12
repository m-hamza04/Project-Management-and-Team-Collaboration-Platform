import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { useAppSelector } from '@/app/hooks';
import { AppNotification } from '@/types';
import { getSocket } from '@/lib/socket';

export const useSocket = (onNotification: (notification: AppNotification) => void) => {
  const token = useAppSelector((state) => state.auth.token);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = getSocket(token);
    socketRef.current = socket;

    socket.on('notification', onNotification);

    return () => {
      socket.off('notification', onNotification);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return socketRef;
};
