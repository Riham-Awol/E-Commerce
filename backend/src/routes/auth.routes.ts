import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  register, login, refresh, logout, me, registerSchema, loginSchema,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));
router.get("/me", authenticate, asyncHandler(me));

export default router;
