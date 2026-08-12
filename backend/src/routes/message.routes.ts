import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(isAuthenticated);

router.get('/', messageController.getMessages);

export default router;
