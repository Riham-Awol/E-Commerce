import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const isApiError = err instanceof ApiError;
  const status = isApiError ? err.status : 500;
  const message = isApiError ? err.message : "Internal server error";

  if (!isApiError) {
    // Always log unexpected errors so they show up in the host's logs.
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(isApiError && err.details ? { details: err.details } : {}),
  });
}
