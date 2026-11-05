/**
 * Creates (or re-creates) all tables in the database configured by the
 * DB_* / DATABASE_URL environment variables:
 *   npm run db:migrate
 *
 * WARNING: schema.sql drops existing tables first, so this wipes all data.
 * The CREATE DATABASE / USE lines are skipped so it works on hosted MySQL
 * providers that give you a fixed database name.
 */
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import { connectionOptions } from "../config/db";

export async function migrate() {
  // Resolves to src/db/schema.sql both from src/ (ts-node) and dist/ (node).
  const file = path.resolve(__dirname, "../../src/db/schema.sql");
  const sql = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => !/^\s*(CREATE DATABASE|USE |CHARACTER SET)/i.test(line))
    .join("\n");

  const conn = await mysql.createConnection({ ...connectionOptions, multipleStatements: true });
  try {
    await conn.query(sql);
    console.log("✔ Tables created");
  } finally {
    await conn.end();
  }
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
}
