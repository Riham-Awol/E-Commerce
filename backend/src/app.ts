import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { notFoundHandler, errorHandler } from "./middleware/error";

import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import catalogRoutes from "./routes/catalog.routes";

export function createApp() {
  const app = express();

  // Behind a hosting proxy (Render, Railway, Fly…): needed for secure cookies
  // and correct client IPs in the rate limiter.
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: env.clientOrigins, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan(env.isProd ? "combined" : "dev"));

  // Brute-force protection on credential endpoints, keyed by IP + email so that
  // users behind a shared proxy (e.g. the Vercel rewrite) don't share one bucket.
  const credentialLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: (req) => `${req.ip}|${String(req.body?.email ?? "").toLowerCase()}`,
    message: { success: false, message: "Too many attempts. Please try again in a few minutes." },
  });
  app.use(["/api/auth/login", "/api/auth/register"], credentialLimiter);

  app.get("/api/health", (_req, res) =>
    res.json({ success: true, service: "bevsupply-api", time: new Date().toISOString() }),
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api", catalogRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
