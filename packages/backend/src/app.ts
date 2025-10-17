import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import { getCorsConfig } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';
import {
  cspConfig,
  securityHeaders,
  preventParameterPollution,
  requestFingerprint,
} from './middleware/security.js';
import { requestLogger, errorLogger } from './middleware/requestLogger.js';

const app: Express = express();

// Security Middleware
app.use(helmet()); // Basic helmet protection
app.use(cspConfig); // Content Security Policy
app.use(securityHeaders); // Additional security headers
app.use(preventParameterPollution); // Prevent parameter pollution attacks
app.use(requestFingerprint); // Request fingerprinting for security tracking

// CORS and other middleware
app.use(cors(getCorsConfig()));
app.use(express.json());
app.use(requestLogger);
app.use(passport.initialize());

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, 'Not Found'));
});

// Error Logger (before error handler)
app.use(errorLogger);

// Error Handler
app.use(errorHandler);

export default app;
