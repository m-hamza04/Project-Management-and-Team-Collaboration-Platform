import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from '../validators/project.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(isAuthenticated);

// Only Admin creates projects & assigns a Project Manager
router.post(
  '/',
  authorizeRoles(Role.ADMIN),
  validate(createProjectSchema),
  projectController.createProject
);

// Scoped automatically by role inside the service (Admin: all, PM: own, TM: member-of)
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);

// Admin or the assigned Project Manager
router.patch(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(updateProjectSchema),
  projectController.updateProject
);

router.delete('/:id', authorizeRoles(Role.ADMIN), projectController.deleteProject);

// Project Manager (or Admin) manages team membership
router.post(
  '/:id/members',
  authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER),
  validate(addMemberSchema),
  projectController.addMember
);
router.delete(
  '/:id/members/:userId',
  authorizeRoles(Role.ADMIN, Role.PROJECT_MANAGER),
  projectController.removeMember
);

export default router;
