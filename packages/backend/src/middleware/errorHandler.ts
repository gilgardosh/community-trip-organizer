import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  console.error(err);

  return res.status(500).json({
    message: 'Internal Server Error',
  });
};
