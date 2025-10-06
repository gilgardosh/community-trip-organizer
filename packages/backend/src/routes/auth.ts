import { Router, type RequestHandler } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import oauthPassport from '../middleware/oauth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

// Public routes for registration and login
router.post('/register', authController.register);
router.post('/login', authController.login);

// OAuth routes for Google
router.get('/google', oauthPassport.authenticate('google', {
  scope: ['profile', 'email']
}) as RequestHandler);

router.get('/google/callback', 
  oauthPassport.authenticate('google', { session: false, failureRedirect: '/login' }) as RequestHandler,
  authController.oauthCallback
);

// OAuth routes for Facebook
router.get('/facebook', oauthPassport.authenticate('facebook', {
  scope: ['email', 'public_profile']
}) as RequestHandler);

router.get('/facebook/callback',
  oauthPassport.authenticate('facebook', { session: false, failureRedirect: '/login' }) as RequestHandler,
  authController.oauthCallback
);

// Protected routes
// Only SUPER_ADMIN can create admin accounts
router.post(
  '/admin',
  protect,
  authorize(Role.SUPER_ADMIN),
  authController.createAdmin
);

export default router;
