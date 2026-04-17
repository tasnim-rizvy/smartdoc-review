import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { getHistory, handleQuery } from "../controllers/query.controller";
import { validate, querySchema } from "../middlewares/validate.middleware";

const router = Router();
router.use(authenticate)

router.post('/', validate(querySchema), handleQuery);
router.get('/history', getHistory);

export default router;