import { Router } from "express";
import { register, login, refresh, logout } from "../controllers/auth.controller";
import { validate, registerSchema, loginSchema, refreshSchema, logoutSchema } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', authenticate, validate(logoutSchema), logout);

export default router;