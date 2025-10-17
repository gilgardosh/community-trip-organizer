import { Router, type RequestHandler } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import oauthPassport from '../middleware/oauth.middleware.js';
import { rateLimiters } from '../middleware/rateLimiter.js';
import { Role } from '@prisma/client';

const router = Router();

// Public routes for registration and login
router.post('/register', rateLimiters.auth, authController.register);
router.post('/login', rateLimiters.auth, authController.login);

// OAuth routes for Google
router.get(
  '/google',
  rateLimiters.auth,
  oauthPassport.authenticate('google', {
    scope: ['profile', 'email'],
  }) as RequestHandler,
);

router.get(
  '/google/callback',
  rateLimiters.auth,
  oauthPassport.authenticate('google', {
    session: false,
    failureRedirect: '/login',
  }) as RequestHandler,
  authController.oauthCallback,
);

// OAuth routes for Facebook
router.get(
  '/facebook',
  rateLimiters.auth,
  oauthPassport.authenticate('facebook', {
    scope: ['email', 'public_profile'],
  }) as RequestHandler,
);

router.get(
  '/facebook/callback',
  rateLimiters.auth,
  oauthPassport.authenticate('facebook', {
    session: false,
    failureRedirect: '/login',
  }) as RequestHandler,
  authController.oauthCallback,
);

// Protected routes
// Get current user information
router.get('/me', protect, rateLimiters.api, authController.getCurrentUser);

// Only SUPER_ADMIN can create admin accounts
router.post(
  '/admin',
  protect,
  rateLimiters.write,
  authorize(Role.SUPER_ADMIN),
  authController.createAdmin,
);

export default router;
