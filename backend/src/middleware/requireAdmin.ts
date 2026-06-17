import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors.js";

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.userRole !== "admin") {
    return next(new ForbiddenError("Admin access required"));
  }
  next();
}
