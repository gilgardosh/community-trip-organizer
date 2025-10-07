import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import protectedRouter from './protected.js';
import roleProtectedRouter from './role-protected.js';
import familyRouter from './family.js';
import tripRouter from './trip.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/protected', protectedRouter);
router.use('/role-protected', roleProtectedRouter);
router.use('/families', familyRouter);
router.use('/trips', tripRouter);

export default router;
