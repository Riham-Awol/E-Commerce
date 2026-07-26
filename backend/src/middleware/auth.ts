import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type TokenPayload } from "../utils/tokens";
import { ApiError } from "../utils/ApiError";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/** Extracts and verifies the JWT access token from the Authorization header. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const bearer = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const token = bearer ?? (req.cookies?.access_token as string | undefined);

  if (!token) return next(ApiError.unauthorized("Missing access token"));

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

/** Role-based access control — allow only the listed roles (super_admin always passes). */
export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.role === "super_admin" || roles.includes(req.user.role)) return next();
    return next(ApiError.forbidden("Insufficient role"));
  };
}
