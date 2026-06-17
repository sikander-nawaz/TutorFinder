import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors.js";

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return next(new ForbiddenError("You do not have permission to access this resource"));
    }
    next();
  };
}
