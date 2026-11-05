import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  // Comma-separated list of allowed frontend origins.
  clientOrigins: (process.env.CLIENT_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean),
  db: {
    url: process.env.DATABASE_URL || process.env.MYSQL_URL || "",
    ssl: process.env.DB_SSL === "true",
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
    sslCa: process.env.DB_SSL_CA ?? "",
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "bevsupply",
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "dev-access-secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev-refresh-secret",
    accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL ?? "7d",
  },
  isProd: process.env.NODE_ENV === "production",
};

if (env.isProd) {
  const missing = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"].filter(
    (k) => !process.env[k],
  );
  if (missing.length) {
    throw new Error(`Missing required environment variables in production: ${missing.join(", ")}`);
  }
}
