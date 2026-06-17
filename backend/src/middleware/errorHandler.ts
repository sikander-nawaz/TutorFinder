import type { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";
import { logger } from "../lib/logger.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ValidationError) {
    sendError({ res, statusCode: err.statusCode, message: err.message, errors: err.errors });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, "Operational server error");
    }
    sendError({ res, statusCode: err.statusCode, message: err.message });
    return;
  }

  logger.error({ err }, "Unhandled error");
  sendError({ res, statusCode: 500, message: "Internal server error" });
}

export function notFoundHandler(_req: Request, res: Response): void {
  sendError({ res, statusCode: 404, message: "Route not found" });
}
