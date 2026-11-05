import type { Request, Response } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { z } from "zod";
import { pool } from "../config/db";
import { ApiError } from "../utils/ApiError";

export const createOrderSchema = z.object({
  // Each line identifies its product by numeric id or by slug (the storefront uses slugs).
  items: z
    .array(
      z
        .object({
          productId: z.number().optional(),
          slug: z.string().optional(),
          quantity: z.number().int().positive(),
        })
        .refine((i) => i.productId !== undefined || i.slug, "productId or slug is required"),
    )
    .min(1),
  paymentMethod: z.string().min(1),
  fulfilment: z.enum(["delivery", "pickup"]).default("delivery"),
  deliveryAddress: z.string().optional(),
  deliveryDate: z.string().optional(),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

interface ProductRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
  wholesale_price: number;
  discount_percent: number;
  stock: number;
  min_order_qty: number;
}

/** POST /api/orders — creates an order atomically, decrementing stock. */
export async function createOrder(req: Request, res: Response) {
  const body = req.body as z.infer<typeof createOrderSchema>;
  const userId = req.user!.sub;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const ids = body.items.map((i) => i.productId ?? -1);
    const slugs = body.items.map((i) => i.slug ?? "");
    const [products] = await conn.query<ProductRow[]>(
      `SELECT id, slug, name, wholesale_price, discount_percent, stock, min_order_qty
       FROM products WHERE id IN (?) OR slug IN (?) FOR UPDATE`,
      [ids, slugs],
    );
    const byId = new Map(products.map((p) => [p.id, p]));
    const bySlug = new Map(products.map((p) => [p.slug, p]));

    let subtotal = 0;
    const lines: { product: ProductRow; qty: number; unitPrice: number }[] = [];

    for (const item of body.items) {
      const product =
        item.productId !== undefined ? byId.get(item.productId) : bySlug.get(item.slug!);
      if (!product) throw ApiError.badRequest(`Product ${item.productId ?? item.slug} not found`);
      if (item.quantity < product.min_order_qty) {
        throw ApiError.badRequest(`${product.name}: minimum order is ${product.min_order_qty}`);
      }
      if (product.stock < item.quantity) {
        throw ApiError.conflict(`${product.name}: only ${product.stock} in stock`);
      }
      const unitPrice = +(Number(product.wholesale_price) * (1 - Number(product.discount_percent) / 100)).toFixed(2);
      subtotal += unitPrice * item.quantity;
      lines.push({ product, qty: item.quantity, unitPrice });
    }

    subtotal = +subtotal.toFixed(2);

    // Coupon
    let discount = 0;
    if (body.couponCode) {
      const [coupons] = await conn.query<RowDataPacket[]>(
        "SELECT percent_off, min_subtotal FROM coupons WHERE code = :code AND active = 1",
        { code: body.couponCode.toUpperCase() },
      );
      const coupon = coupons[0];
      if (coupon && subtotal >= Number(coupon.min_subtotal)) {
        discount = +(subtotal * (Number(coupon.percent_off) / 100)).toFixed(2);
      }
    }

    const afterDiscount = subtotal - discount;
    const tax = +(afterDiscount * 0.08).toFixed(2);
    const deliveryFee = body.fulfilment === "pickup" || afterDiscount > 250 ? 0 : 12.5;
    const total = +(afterDiscount + tax + deliveryFee).toFixed(2);
    const reference = `BVS-${Math.floor(100000 + Math.random() * 899999)}`;

    const [orderResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO orders
         (reference, user_id, subtotal, tax, delivery_fee, discount, total,
          payment_method, fulfilment, delivery_address, delivery_date, notes)
       VALUES (:reference, :userId, :subtotal, :tax, :deliveryFee, :discount, :total,
          :paymentMethod, :fulfilment, :deliveryAddress, :deliveryDate, :notes)`,
      {
        reference, userId, subtotal, tax, deliveryFee, discount, total,
        paymentMethod: body.paymentMethod, fulfilment: body.fulfilment,
        deliveryAddress: body.deliveryAddress ?? null,
        deliveryDate: body.deliveryDate ?? null, notes: body.notes ?? null,
      },
    );
    const orderId = orderResult.insertId;

    for (const line of lines) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity)
         VALUES (:orderId, :productId, :name, :unitPrice, :qty)`,
        { orderId, productId: line.product.id, name: line.product.name, unitPrice: line.unitPrice, qty: line.qty },
      );
      await conn.query("UPDATE products SET stock = stock - :qty WHERE id = :id", {
        qty: line.qty, id: line.product.id,
      });
    }

    await conn.query(
      "INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES (:userId, 'order.create', 'order', :orderId)",
      { userId, orderId: String(orderId) },
    );

    await conn.commit();
    res.status(201).json({
      success: true,
      order: { id: orderId, reference, subtotal, tax, deliveryFee, discount, total, status: "pending" },
    });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** GET /api/orders — the authenticated customer's orders, with line items. */
export async function listMyOrders(req: Request, res: Response) {
  const [orders] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM orders WHERE user_id = :userId ORDER BY created_at DESC, id DESC",
    { userId: req.user!.sub },
  );
  if (orders.length === 0) {
    res.json({ success: true, data: [] });
    return;
  }
  const [items] = await pool.query<RowDataPacket[]>(
    "SELECT order_id, product_name, unit_price, quantity FROM order_items WHERE order_id IN (?)",
    [orders.map((o) => o.id)],
  );
  res.json({
    success: true,
    data: orders.map((o) => ({ ...o, items: items.filter((i) => i.order_id === o.id) })),
  });
}

/** GET /api/orders/:reference — a single order with its line items. */
export async function getOrder(req: Request, res: Response) {
  const [orders] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM orders WHERE reference = :ref",
    { ref: req.params.reference },
  );
  const order = orders[0];
  if (!order) throw ApiError.notFound("Order not found");

  const staff = ["finance", "super_admin", "sales_agent", "warehouse_manager"];
  if (order.user_id !== req.user!.sub && !staff.includes(req.user!.role)) {
    throw ApiError.forbidden();
  }

  const [items] = await pool.query<RowDataPacket[]>(
    "SELECT product_name, unit_price, quantity FROM order_items WHERE order_id = :id",
    { id: order.id },
  );
  res.json({ success: true, data: { ...order, items } });
}

export const updateStatusSchema = z.object({
  status: z.enum([
    "pending", "confirmed", "packed", "ready_for_dispatch",
    "out_for_delivery", "delivered", "cancelled", "returned", "refunded",
  ]),
});

/** PATCH /api/orders/:reference/status — staff advance the order status. */
export async function updateOrderStatus(req: Request, res: Response) {
  const { status } = req.body as z.infer<typeof updateStatusSchema>;
  const [result] = await pool.query<ResultSetHeader>(
    "UPDATE orders SET status = :status WHERE reference = :ref",
    { status, ref: req.params.reference },
  );
  if (result.affectedRows === 0) throw ApiError.notFound("Order not found");
  res.json({ success: true, status });
}
