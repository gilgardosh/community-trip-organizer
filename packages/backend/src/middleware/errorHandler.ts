import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';
import { ZodError } from 'zod';
import { isDevelopment } from '../config/env.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(isDevelopment && { stack: err.stack }),
    });
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.issues,
      ...(isDevelopment && { stack: err.stack }),
    });
  }

  console.error(err);

  return res.status(500).json({
    message: 'Internal Server Error',
  });
};
