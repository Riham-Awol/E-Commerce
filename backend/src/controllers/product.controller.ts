import type { Request, Response } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { z } from "zod";
import { pool } from "../config/db";
import { ApiError } from "../utils/ApiError";

interface ProductRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
}

const BASE_SELECT = `
  SELECT p.*, c.slug AS category_slug, c.name AS category_name,
         s.name AS supplier_name
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN suppliers s ON s.id = p.supplier_id
`;

/** GET /api/products — search, filter, sort and paginate the catalogue. */
export async function listProducts(req: Request, res: Response) {
  const {
    q, category, brand, supplier, minPrice, maxPrice, minRating,
    inStock, discounted, tag, sort, page = "1", limit = "12",
  } = req.query as Record<string, string>;

  const where: string[] = [];
  const params: Record<string, any> = {};

  if (q) {
    where.push("(p.name LIKE :q OR p.brand LIKE :q OR p.barcode LIKE :q OR p.country_of_origin LIKE :q)");
    params.q = `%${q}%`;
  }
  if (category) { where.push("c.slug = :category"); params.category = category; }
  if (brand) { where.push("p.brand = :brand"); params.brand = brand; }
  if (supplier) { where.push("s.name = :supplier"); params.supplier = supplier; }
  if (minPrice) { where.push("p.wholesale_price >= :minPrice"); params.minPrice = Number(minPrice); }
  if (maxPrice) { where.push("p.wholesale_price <= :maxPrice"); params.maxPrice = Number(maxPrice); }
  if (minRating) { where.push("p.rating >= :minRating"); params.minRating = Number(minRating); }
  if (inStock === "true") where.push("p.stock > 0");
  if (discounted === "true") where.push("p.discount_percent > 0");
  if (tag) { where.push("FIND_IN_SET(:tag, p.tags)"); params.tag = tag; }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const orderMap: Record<string, string> = {
    "price-asc": "p.wholesale_price ASC",
    "price-desc": "p.wholesale_price DESC",
    rating: "p.rating DESC",
    newest: "p.created_at DESC",
  };
  const orderSql = `ORDER BY ${orderMap[sort] ?? "p.featured DESC, p.id ASC"}`;

  const perPage = Math.min(Number(limit) || 12, 60);
  const currentPage = Math.max(Number(page) || 1, 1);
  const offset = (currentPage - 1) * perPage;

  const [countRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN suppliers s ON s.id = p.supplier_id ${whereSql}`,
    params,
  );
  const total = Number(countRows[0].total);

  const [rows] = await pool.query<ProductRow[]>(
    `${BASE_SELECT} ${whereSql} ${orderSql} LIMIT :limit OFFSET :offset`,
    { ...params, limit: perPage, offset },
  );

  res.json({
    success: true,
    data: rows,
    pagination: { page: currentPage, limit: perPage, total, pages: Math.ceil(total / perPage) },
  });
}

/** GET /api/products/:slug — a single product with its images and reviews. */
export async function getProduct(req: Request, res: Response) {
  const { slug } = req.params;
  const [rows] = await pool.query<ProductRow[]>(`${BASE_SELECT} WHERE p.slug = :slug`, { slug });
  const product = rows[0];
  if (!product) throw ApiError.notFound("Product not found");

  const [images] = await pool.query<RowDataPacket[]>(
    "SELECT url FROM product_images WHERE product_id = :id ORDER BY position",
    { id: product.id },
  );
  const [reviews] = await pool.query<RowDataPacket[]>(
    `SELECT r.rating, r.title, r.body, r.verified, r.helpful, r.created_at, u.name AS author
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.product_id = :id ORDER BY r.created_at DESC LIMIT 20`,
    { id: product.id },
  );

  res.json({ success: true, data: { ...product, images: images.map((i) => i.url), reviews } });
}

export const createProductSchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  brand: z.string().optional(),
  categoryId: z.number().optional(),
  supplierId: z.number().optional(),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  description: z.string().optional(),
  retailPrice: z.number().positive(),
  wholesalePrice: z.number().positive(),
  discountPercent: z.number().min(0).max(100).default(0),
  stock: z.number().int().min(0).default(0),
  minOrderQty: z.number().int().min(1).default(1),
});

/** POST /api/products — warehouse/admin creates a catalogue entry. */
export async function createProduct(req: Request, res: Response) {
  const b = req.body as z.infer<typeof createProductSchema>;
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO products
       (slug, name, brand, category_id, supplier_id, sku, barcode, description,
        retail_price, wholesale_price, discount_percent, stock, min_order_qty)
     VALUES (:slug, :name, :brand, :categoryId, :supplierId, :sku, :barcode, :description,
        :retailPrice, :wholesalePrice, :discountPercent, :stock, :minOrderQty)`,
    {
      slug: b.slug, name: b.name, brand: b.brand ?? null,
      categoryId: b.categoryId ?? null, supplierId: b.supplierId ?? null,
      sku: b.sku, barcode: b.barcode ?? null, description: b.description ?? null,
      retailPrice: b.retailPrice, wholesalePrice: b.wholesalePrice,
      discountPercent: b.discountPercent, stock: b.stock, minOrderQty: b.minOrderQty,
    },
  );
  res.status(201).json({ success: true, id: result.insertId });
}
