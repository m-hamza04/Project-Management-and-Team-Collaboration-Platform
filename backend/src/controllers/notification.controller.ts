import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import * as notificationService from '../services/notification.service';

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
  const unreadOnly = req.query.unreadOnly === 'true';
  const notifications = await notificationService.getMyNotifications(req.user!.id, unreadOnly);
  sendSuccess(res, 200, 'Notifications fetched', notifications);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(req.params.id as string, req.user!.id);
  sendSuccess(res, 200, 'Notification marked as read', notification);
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.user!.id);
  sendSuccess(res, 200, 'All notifications marked as read');
});
