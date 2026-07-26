import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

/** Validates req.body against a Zod schema, replacing it with the parsed value. */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(ApiError.badRequest("Validation failed", result.error.flatten().fieldErrors));
    }
    req.body = result.data;
    next();
  };
}
