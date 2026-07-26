import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { listCategories, listSuppliers, validateCoupon } from "../controllers/catalog.controller";

const router = Router();

router.get("/categories", asyncHandler(listCategories));
router.get("/suppliers", asyncHandler(listSuppliers));
router.post("/coupons/validate", asyncHandler(validateCoupon));

export default router;
