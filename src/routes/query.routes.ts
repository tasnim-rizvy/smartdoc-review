import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getHistory, handleQuery } from "../controllers/query.controller";

const router = Router();

router.use(authenticate)

router.post('/', handleQuery);
router.get('/history', getHistory);

export default router;