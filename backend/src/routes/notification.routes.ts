import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router();

router.use(isAuthenticated);

router.get('/', notificationController.getMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

export default router;
