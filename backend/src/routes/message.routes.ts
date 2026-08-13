import { Router } from 'express';
import * as messageController from '../controllers/message.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { sendMessageSchema } from '../validators/message.validator';

const router = Router({ mergeParams: true });

router.use(isAuthenticated);

router.post('/', validate(sendMessageSchema), messageController.sendMessage);
router.get('/', messageController.getMessages);

export default router;
