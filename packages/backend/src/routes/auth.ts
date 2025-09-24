import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

// Public routes for registration and login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
// Only SUPER_ADMIN can create admin accounts
router.post(
  '/admin',
  protect,
  authorize(Role.SUPER_ADMIN),
  authController.createAdmin
);

export default router;
