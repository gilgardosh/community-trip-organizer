import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import protectedRouter from './protected.js';
import roleProtectedRouter from './role-protected.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/protected', protectedRouter);
router.use('/role-protected', roleProtectedRouter);

export default router;
