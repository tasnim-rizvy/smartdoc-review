import { Router } from "express";
import { register, login, refresh, logout } from "../controllers/auth.controller";
import { validate, registerSchema, loginSchema } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);

export default router;