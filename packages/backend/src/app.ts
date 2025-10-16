import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { getCorsConfig, isDevelopment } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/ApiError.js';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors(getCorsConfig()));
app.use(express.json());
app.use(morgan(isDevelopment ? 'dev' : 'combined'));
app.use(passport.initialize());

// API Routes
app.use('/api', apiRoutes);

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, 'Not Found'));
});

// Error Handler
app.use(errorHandler);

export default app;
