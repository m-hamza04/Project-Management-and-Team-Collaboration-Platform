import prisma from '../config/db';
import { NotificationType } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { getIO } from '../config/socket';

export const createNotification = async (input: {
  userId: string;
  type: NotificationType;
  message: string;
}) => {
  const notification = await prisma.notification.create({ data: input });

  // Push it live to the user if they're connected. Wrapped in try/catch so that
  // if socket.io isn't initialized (e.g. running a script outside the server)
  // normal DB-backed notifications still work fine.
  try {
    getIO().to(input.userId).emit('notification', notification);
  } catch {
    // socket not initialized — safe to ignore, notification is still saved in DB
  }

  return notification;
};

export const getMyNotifications = async (userId: string, unreadOnly?: boolean) => {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { createdAt: 'desc' },
  });
};

export const markAsRead = async (id: string, userId: string) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) {
    throw ApiError.notFound('Notification not found');
  }
  return prisma.notification.update({ where: { id }, data: { isRead: true } });
};

export const markAllAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
