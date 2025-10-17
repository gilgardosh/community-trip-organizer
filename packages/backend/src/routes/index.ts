import { Router } from 'express';
import { rateLimiters } from '../middleware/rateLimiter.js';
import healthRouter from './health.js';
import monitoringRouter from './monitoring.js';
import authRouter from './auth.js';
import protectedRouter from './protected.js';
import roleProtectedRouter from './role-protected.js';
import familyRouter from './family.js';
import tripRouter from './trip.js';
import gearRouter from './gear.js';
import whatsappRouter from './whatsapp.js';
import adminRouter from './admin.js';

const router = Router();

// Apply general API rate limiting to protected routes
router.use('/health', rateLimiters.api, healthRouter);
router.use('/monitoring', rateLimiters.api, monitoringRouter);
router.use('/protected', rateLimiters.api, protectedRouter);
router.use('/role-protected', rateLimiters.api, roleProtectedRouter);

// Auth, admin, families, trips, whatsapp, and gear have their own specific rate limiters
router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/families', familyRouter);
router.use('/trips', tripRouter);
router.use('/gear', gearRouter);
router.use('/whatsapp', whatsappRouter);

export default router;
