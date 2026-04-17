import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { upload, list, get, remove } from "../controllers/documents.contoller";

const router = Router();

router.use(authenticate);

router.post('/upload', upload);
router.get('/', list);
router.get('/:id', get);
router.delete('/:id', remove);

export default router;