import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { upload, list, get, remove } from '../controllers/documents.controller';
import { uploadMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

router.post('/upload', uploadMiddleware.single('file'), upload);
router.get('/', list);
router.get('/:id', get);
router.delete('/:id', remove);

export default router;
