import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { Role } from '@prisma/client';

const router = Router();

// All user-management routes are Admin-only
router.use(isAuthenticated, authorizeRoles(Role.ADMIN));

router.post('/', validate(createUserSchema), userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
