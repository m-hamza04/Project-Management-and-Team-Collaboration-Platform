import { Router } from 'express';
import * as attachmentController from '../controllers/attachment.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router({ mergeParams: true });

router.use(isAuthenticated);

router.post('/', upload.single('file'), attachmentController.uploadAttachment);
router.get('/', attachmentController.getAttachments);
router.delete('/:id', attachmentController.deleteAttachment);

export default router;
