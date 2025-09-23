import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import protectedRouter from './protected.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/protected', protectedRouter);

export default router;
