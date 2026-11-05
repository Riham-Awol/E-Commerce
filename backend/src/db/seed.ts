/**
 * Seeds the BevSupply database with demo categories, suppliers, products,
 * coupons and users. Safe to re-run. Run after creating the tables:
 *   npm run db:migrate && npm run db:seed   (or: npm run db:setup)
 */
import bcrypt from "bcryptjs";
import { pool } from "../config/db";
import { catalogue, slugify, imageUrl } from "./catalogue";

const categories = [
  ["soft-drinks", "Soft Drinks", "🥤", "#E63946"],
  ["energy-drinks", "Energy Drinks", "⚡", "#F4A261"],
  ["water", "Water", "💧", "#2A9D8F"],
  ["juice", "Juice", "🧃", "#F4A261"],
  ["milk", "Milk", "🥛", "#1D3557"],
  ["coffee", "Coffee", "☕", "#6F4E37"],
  ["tea", "Tea", "🍵", "#2A9D8F"],
  ["beer", "Beer", "🍺", "#F4A261"],
  ["wine", "Wine", "🍷", "#722F37"],
  ["spirits", "Spirits", "🥃", "#1D3557"],
  ["health-drinks", "Health Drinks", "🌿", "#2A9D8F"],
  ["sports-drinks", "Sports Drinks", "🏃", "#E63946"],
  ["imported-drinks", "Imported Drinks", "🌍", "#1D3557"],
  ["local-drinks", "Local Drinks", "🏠", "#F4A261"],
  ["bulk-packages", "Bulk Packages", "📦", "#6F4E37"],
  ["accessories", "Accessories", "🧊", "#2A9D8F"],
];

const suppliers = [
  ["Atlas Wholesale", "Soft & bulk drinks", 4.8],
  ["Nova Beverages", "Energy & sports", 4.7],
  ["Highland Springs", "Water & mineral", 4.9],
  ["Vintage Cellars", "Wine & spirits", 4.9],
  ["Brewers Union", "Beer & craft", 4.6],
  ["Orchard Direct", "Juice & dairy", 4.5],
  ["Meadow Farms", "Dairy", 4.5],
  ["Bean & Barrel", "Coffee", 4.7],
  ["Orient Trading", "Tea & imported", 4.4],
];

const coupons = [
  ["BEV10", 10, 0],
  ["WHOLESALE15", 15, 100],
  ["WELCOME5", 5, 0],
];

export async function seed({ closePool = true } = {}) {
  const conn = await pool.getConnection();
  try {
    console.log("Seeding categories…");
    for (const [slug, name, icon, color] of categories) {
      await conn.query(
        "INSERT INTO categories (slug, name, icon, color) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)",
        [slug, name, icon, color],
      );
    }

    console.log("Seeding suppliers…");
    for (const [name, category, rating] of suppliers) {
      const [[found]] = (await conn.query("SELECT id FROM suppliers WHERE name = ?", [name])) as any;
      if (!found) {
        await conn.query("INSERT INTO suppliers (name, category, rating) VALUES (?, ?, ?)", [name, category, rating]);
      }
    }

    console.log("Seeding products…");
    for (const [i, item] of catalogue.entries()) {
      const [[cat]] = (await conn.query("SELECT id FROM categories WHERE slug = ?", [item.category])) as any;
      const [[sup]] = (await conn.query("SELECT id FROM suppliers WHERE name = ?", [item.supplier])) as any;
      const slug = slugify(item.name);
      const sku = `BVS-${String(i + 1).padStart(4, "0")}`;
      const barcode = `50${String(1234567 + i * 733).padStart(11, "0")}`;
      const description =
        `${item.name} by ${item.brand}. Distributed by BevSupply from ${item.supplier}. ` +
        "Ideal for retail shelves, restaurants and events. Wholesale tiers and bulk pricing available.";
      const minOrderQty = item.category === "bulk-packages" ? 1 : 6;
      const expiry = `2027-0${1 + (i % 9)}-15`;
      const values = [
        slug, item.name, item.brand, cat?.id ?? null, sup?.id ?? null, sku, barcode, description,
        item.ingredients ?? null, item.volume, item.pack, item.weight, item.origin, expiry,
        item.retail, item.wholesale, item.discount, item.stock, minOrderQty, item.rating,
        item.featured ? 1 : 0, item.tags.join(","),
      ];
      await conn.query(
        `INSERT INTO products
          (slug, name, brand, category_id, supplier_id, sku, barcode, description,
           ingredients, volume, package_size, weight_kg, country_of_origin, expiry_date,
           retail_price, wholesale_price, discount_percent, stock, min_order_qty, rating,
           featured, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), brand = VALUES(brand), category_id = VALUES(category_id),
           supplier_id = VALUES(supplier_id), retail_price = VALUES(retail_price),
           wholesale_price = VALUES(wholesale_price), discount_percent = VALUES(discount_percent),
           featured = VALUES(featured), tags = VALUES(tags)`,
        values,
      );
      const [[product]] = (await conn.query("SELECT id FROM products WHERE slug = ?", [slug])) as any;
      await conn.query("DELETE FROM product_images WHERE product_id = ?", [product.id]);
      await conn.query(
        "INSERT INTO product_images (product_id, url, position) VALUES (?, ?, 0)",
        [product.id, imageUrl(item.image)],
      );
    }

    console.log("Seeding coupons…");
    for (const [code, percent, min] of coupons) {
      await conn.query(
        "INSERT INTO coupons (code, percent_off, min_subtotal) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE percent_off = VALUES(percent_off)",
        [code, percent, min],
      );
    }

    console.log("Seeding users…");
    // Demo customer account — handy for trying the storefront.
    const demoHash = await bcrypt.hash("Password123", 10);
    await conn.query(
      "INSERT INTO users (name, email, password_hash, role, email_verified) VALUES (?, ?, ?, 'customer', 1) ON DUPLICATE KEY UPDATE role = VALUES(role)",
      ["Metro Foods Ltd", "customer@bevsupply.com", demoHash],
    );

    // Staff accounts. In production they are only created when ADMIN_PASSWORD
    // is set, so a live site never has staff logins with a publicly known password.
    const isProd = process.env.NODE_ENV === "production";
    const staffPassword = process.env.ADMIN_PASSWORD || (isProd ? "" : "Password123");
    if (staffPassword) {
      const staffHash = await bcrypt.hash(staffPassword, 10);
      const staff: [string, string, string][] = [
        ["Warehouse Ops", "warehouse@bevsupply.com", "warehouse_manager"],
        ["Finance Desk", "finance@bevsupply.com", "finance"],
        ["System Admin", "admin@bevsupply.com", "super_admin"],
      ];
      for (const [name, email, role] of staff) {
        await conn.query(
          "INSERT INTO users (name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE role = VALUES(role), password_hash = VALUES(password_hash)",
          [name, email, staffHash, role],
        );
      }
    } else {
      console.log("  (skipping staff accounts — set ADMIN_PASSWORD to create them)");
    }

    console.log("✔ Seed complete. Demo login: customer@bevsupply.com / Password123");
  } finally {
    conn.release();
    if (closePool) await pool.end();
  }
}

if (require.main === module) {
  seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}
