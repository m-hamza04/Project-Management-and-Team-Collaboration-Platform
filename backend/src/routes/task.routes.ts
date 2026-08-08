import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validators/task.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(isAuthenticated);

// Only Project Manager (or Admin) creates tasks
router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(createTaskSchema),
  taskController.createTask
);

// Scoped by role inside the service
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);

// PM edits task details
router.patch(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(updateTaskSchema),
  taskController.updateTask
);

// Team Member (assignee) or PM updates status — checked inside service
router.patch(
  '/:id/status',
  validate(updateTaskStatusSchema),
  taskController.updateTaskStatus
);

router.delete(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER),
  taskController.deleteTask
);

export default router;
