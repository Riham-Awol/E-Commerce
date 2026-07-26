import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2";
import { pool } from "../config/db";
import { ApiError } from "../utils/ApiError";

/** GET /api/categories — with a live product count per category. */
export async function listCategories(_req: Request, res: Response) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT c.id, c.slug, c.name, c.icon, c.color, COUNT(p.id) AS product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id ORDER BY c.name`,
  );
  res.json({ success: true, data: rows });
}

/** GET /api/suppliers — active suppliers with their product counts. */
export async function listSuppliers(_req: Request, res: Response) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT s.id, s.name, s.category, s.rating, COUNT(p.id) AS product_count
     FROM suppliers s
     LEFT JOIN products p ON p.supplier_id = s.id
     WHERE s.active = 1
     GROUP BY s.id ORDER BY s.rating DESC`,
  );
  res.json({ success: true, data: rows });
}

/** POST /api/coupons/validate — check a coupon against a subtotal. */
export async function validateCoupon(req: Request, res: Response) {
  const { code, subtotal } = req.body as { code?: string; subtotal?: number };
  if (!code) throw ApiError.badRequest("Coupon code required");

  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT code, percent_off, min_subtotal FROM coupons WHERE code = :code AND active = 1 AND (expires_at IS NULL OR expires_at >= CURDATE())",
    { code: code.toUpperCase() },
  );
  const coupon = rows[0];
  if (!coupon) throw ApiError.notFound("Invalid or expired coupon");
  if (subtotal !== undefined && subtotal < Number(coupon.min_subtotal)) {
    throw ApiError.badRequest(`Minimum subtotal for this coupon is ${coupon.min_subtotal}`);
  }
  res.json({ success: true, data: { code: coupon.code, percentOff: coupon.percent_off } });
}
