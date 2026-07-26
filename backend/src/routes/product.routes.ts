import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  listProducts, getProduct, createProduct, createProductSchema,
} from "../controllers/product.controller";

const router = Router();

router.get("/", asyncHandler(listProducts));
router.get("/:slug", asyncHandler(getProduct));
router.post(
  "/",
  authenticate,
  authorize("warehouse_manager", "super_admin"),
  validate(createProductSchema),
  asyncHandler(createProduct),
);

export default router;
