import type { RowDataPacket } from "mysql2";
import { pool } from "../config/db";
import { migrate } from "./migrate";
import { seed } from "./seed";

/**
 * On first boot against an empty database, create the tables and load the
 * catalogue — so hosts without a shell (e.g. Render's free plan) need no manual
 * setup step. Existing data is never touched. Disable with AUTO_SETUP_DB=false.
 */
export async function autoSetupDatabase(): Promise<void> {
  if (process.env.AUTO_SETUP_DB === "false") return;
  const [rows] = await pool.query<RowDataPacket[]>("SHOW TABLES LIKE 'users'");
  if (rows.length) {
    await upgradeSchema();
    return;
  }
  console.log("Empty database detected — creating tables and loading demo catalogue…");
  await migrate();
  await seed({ closePool: false });
}

/** Add columns introduced after a database was first created. Safe to run repeatedly. */
async function upgradeSchema(): Promise<void> {
  const [cols] = await pool.query<RowDataPacket[]>(
    "SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders'",
  );
  const have = new Set(cols.map((c) => String(c.name)));
  if (!have.has("stripe_session_id")) {
    console.log("Upgrading schema: adding orders.stripe_session_id");
    await pool.query(
      "ALTER TABLE orders ADD COLUMN stripe_session_id VARCHAR(255) NULL AFTER payment_status, ADD INDEX idx_orders_stripe_session (stripe_session_id)",
    );
  }
  if (!have.has("paid_at")) {
    console.log("Upgrading schema: adding orders.paid_at");
    await pool.query("ALTER TABLE orders ADD COLUMN paid_at DATETIME NULL AFTER stripe_session_id");
  }
}
