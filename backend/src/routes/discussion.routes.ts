import { Router } from 'express';
import * as discussionController from '../controllers/discussion.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { addMessageSchema } from '../validators/discussion.validator';

// mergeParams so we can read :taskId from the parent router
const router = Router({ mergeParams: true });

router.use(isAuthenticated);

router.post('/', validate(addMessageSchema), discussionController.addMessage);
router.get('/', discussionController.getMessages);

export default router;
