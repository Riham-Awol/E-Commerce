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
  if (rows.length) return;
  console.log("Empty database detected — creating tables and loading demo catalogue…");
  await migrate();
  await seed({ closePool: false });
}
