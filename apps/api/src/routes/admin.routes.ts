import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { getLogs, getStats } from "../controllers/admin.controller";

const router = Router();
router.use(authenticate, requireAdmin);

router.get('/logs', getLogs);
router.get('/stats', getStats);

export default router;