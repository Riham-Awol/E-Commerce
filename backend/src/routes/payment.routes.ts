import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  paymentConfig, createCheckoutSession, confirmPayment,
  checkoutSessionSchema, confirmSchema,
} from "../controllers/payment.controller";

// The webhook route is mounted separately in app.ts because it needs the raw body.
const router = Router();

router.get("/config", asyncHandler(paymentConfig));
router.post("/checkout-session", authenticate, validate(checkoutSessionSchema), asyncHandler(createCheckoutSession));
router.post("/confirm", authenticate, validate(confirmSchema), asyncHandler(confirmPayment));

export default router;
