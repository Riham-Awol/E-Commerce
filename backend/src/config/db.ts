import mysql from "mysql2/promise";
import { env } from "./env";

/**
 * Connection settings. Hosted providers (Railway, Aiven, PlanetScale…) usually
 * hand out a single connection URL — set DATABASE_URL and it takes priority over
 * the individual DB_* variables. Set DB_SSL=true when the provider requires TLS,
 * and DB_SSL_CA to the provider's CA certificate if it isn't publicly trusted.
 */
export const connectionOptions: mysql.ConnectionOptions = {
  ...(env.db.url
    ? { uri: env.db.url }
    : {
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
        database: env.db.database,
      }),
  ...(env.db.ssl
    ? {
        ssl: {
          rejectUnauthorized: env.db.sslRejectUnauthorized,
          // Provider CA certificate (PEM text), e.g. Aiven's ca.pem.
          ...(env.db.sslCa ? { ca: env.db.sslCa.replace(/\\n/g, "\n") } : {}),
        },
      }
    : {}),
};

/**
 * Shared MySQL connection pool. Every query in the app borrows a connection
 * from this pool, so we never open a new socket per request.
 */
export const pool = mysql.createPool({
  ...connectionOptions,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  dateStrings: true,
  // DECIMAL columns come back as numbers rather than strings.
  decimalNumbers: true,
});

export async function assertDbConnection(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
  } finally {
    conn.release();
  }
}
