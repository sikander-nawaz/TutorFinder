import type { Request, Response, NextFunction } from "express";
import { tokenService } from "../services/tokenService.js";
import { UnauthorizedError } from "../utils/errors.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.accessToken as string | undefined;

  if (!token) {
    return next(new UnauthorizedError("Access token missing"));
  }

  try {
    const payload = tokenService.verifyAccessToken(token);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
}
