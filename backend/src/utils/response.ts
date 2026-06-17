import type { Response } from "express";

interface SuccessOptions<T> {
  res: Response;
  statusCode?: number;
  message?: string;
  data?: T;
}

interface ErrorOptions {
  res: Response;
  statusCode?: number;
  message: string;
  errors?: Record<string, string[]>;
}

export function sendSuccess<T>({ res, statusCode = 200, message = "Success", data }: SuccessOptions<T>): void {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
}

export function sendError({ res, statusCode = 500, message, errors }: ErrorOptions): void {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}
