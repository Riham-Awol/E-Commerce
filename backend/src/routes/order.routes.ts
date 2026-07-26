import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createOrder, listMyOrders, getOrder, updateOrderStatus,
  createOrderSchema, updateStatusSchema,
} from "../controllers/order.controller";

const router = Router();

router.use(authenticate);

router.post("/", validate(createOrderSchema), asyncHandler(createOrder));
router.get("/", asyncHandler(listMyOrders));
router.get("/:reference", asyncHandler(getOrder));
router.patch(
  "/:reference/status",
  authorize("warehouse_manager", "delivery_driver", "sales_agent", "super_admin"),
  validate(updateStatusSchema),
  asyncHandler(updateOrderStatus),
);

export default router;
