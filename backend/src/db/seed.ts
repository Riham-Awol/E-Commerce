/**
 * Seeds the BevSupply database with demo categories, suppliers, products,
 * coupons and users. Run after applying schema.sql:
 *   npm run seed
 */
import bcrypt from "bcryptjs";
import { pool } from "../config/db";

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

const products = [
  ["classic-cola-330ml", "Classic Cola 330ml Can", "FizzCo", "soft-drinks", "Atlas Wholesale", 0.9, 0.55, 10, 4200, "bestseller,offer", 1],
  ["thunder-energy-250ml", "Thunder Energy 250ml", "Voltage", "energy-drinks", "Nova Beverages", 1.8, 1.1, 15, 2600, "bestseller,offer,imported", 1],
  ["alpine-spring-water-500ml", "Alpine Spring Water 500ml", "PureAlp", "water", "Highland Springs", 0.6, 0.32, 0, 8800, "bestseller,wholesale", 1],
  ["orange-sunrise-juice-1l", "Orange Sunrise Juice 1L", "GrovePress", "juice", "Orchard Direct", 2.4, 1.5, 20, 1900, "offer,new", 1],
  ["whole-milk-1l-uht", "Whole Milk 1L UHT", "DairyGold", "milk", "Meadow Farms", 1.2, 0.78, 0, 2400, "wholesale", 0],
  ["dark-roast-cold-brew-300ml", "Dark Roast Cold Brew 300ml", "Nightshift", "coffee", "Bean & Barrel", 2.9, 1.9, 10, 1400, "new,bestseller", 1],
  ["green-tea-infusion-500ml", "Green Tea Infusion 500ml", "LeafLite", "tea", "Orient Trading", 1.5, 0.95, 0, 2100, "imported", 0],
  ["golden-lager-330ml", "Golden Lager 330ml", "Hopyard", "beer", "Brewers Union", 1.4, 0.9, 12, 3600, "offer,imported", 1],
  ["reserve-red-wine-750ml", "Reserve Red Wine 750ml", "Vallefino", "wine", "Vintage Cellars", 8.5, 5.8, 0, 640, "imported,wholesale", 1],
  ["highland-malt-whisky-700ml", "Highland Malt Whisky 700ml", "GlenOra", "spirits", "Vintage Cellars", 24.0, 18.5, 5, 320, "imported", 0],
  ["isotonic-sports-blue-500ml", "Isotonic Sports Blue 500ml", "Kinetix", "sports-drinks", "Nova Beverages", 1.3, 0.82, 18, 2700, "offer,bestseller", 0],
  ["mixed-beverage-party-crate", "Mixed Beverage Party Crate", "BevSupply", "bulk-packages", "Atlas Wholesale", 39.0, 29.0, 22, 210, "offer,wholesale,bestseller", 1],
];

const coupons = [
  ["BEV10", 10, 0],
  ["WHOLESALE15", 15, 100],
  ["WELCOME5", 5, 0],
];

async function seed() {
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
      await conn.query("INSERT INTO suppliers (name, category, rating) VALUES (?, ?, ?)", [name, category, rating]);
    }

    console.log("Seeding products…");
    let n = 0;
    for (const [slug, name, brand, catSlug, supName, retail, wholesale, discount, stock, tags, featured] of products) {
      n += 1;
      const [[cat]] = (await conn.query("SELECT id FROM categories WHERE slug = ?", [catSlug])) as any;
      const [[sup]] = (await conn.query("SELECT id FROM suppliers WHERE name = ?", [supName])) as any;
      const sku = `BVS-${String(n).padStart(4, "0")}`;
      const [result]: any = await conn.query(
        `INSERT INTO products
          (slug, name, brand, category_id, supplier_id, sku, barcode, description,
           volume, package_size, country_of_origin, retail_price, wholesale_price,
           discount_percent, stock, min_order_qty, rating, review_count, featured, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, '330ml', '24-pack', 'Imported',
           ?, ?, ?, ?, 6, 4.6, 24, ?, ?)`,
        [slug, name, brand, cat.id, sup.id, sku, `50${String(1234567 + n * 733).padStart(11, "0")}`,
         `${name} distributed by BevSupply.`, retail, wholesale, discount, stock, featured, tags],
      );
      await conn.query(
        "INSERT INTO product_images (product_id, url, position) VALUES (?, ?, 0)",
        [result.insertId, "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80"],
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
    const hash = await bcrypt.hash("Password123", 10);
    const users: [string, string, string][] = [
      ["Metro Foods Ltd", "customer@bevsupply.com", "customer"],
      ["Warehouse Ops", "warehouse@bevsupply.com", "warehouse_manager"],
      ["Finance Desk", "finance@bevsupply.com", "finance"],
      ["System Admin", "admin@bevsupply.com", "super_admin"],
    ];
    for (const [name, email, role] of users) {
      await conn.query(
        "INSERT INTO users (name, email, password_hash, role, email_verified) VALUES (?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE role = VALUES(role)",
        [name, email, hash, role],
      );
    }

    console.log("✔ Seed complete. Demo login: customer@bevsupply.com / Password123");
  } finally {
    conn.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
