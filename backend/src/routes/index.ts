import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import discussionRoutes from './discussion.routes';
import notificationRoutes from './notification.routes';
import attachmentRoutes from './attachment.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/tasks/:taskId/discussions', discussionRoutes);
router.use('/tasks/:taskId/attachments', attachmentRoutes);
router.use('/notifications', notificationRoutes);

export default router;
