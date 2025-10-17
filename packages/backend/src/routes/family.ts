import { Router } from 'express';
import { familyController } from '../controllers/family.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { rateLimiters } from '../middleware/rateLimiter.js';
import { cacheResponse, invalidateCache } from '../middleware/cache.js';
import { Role } from '@prisma/client';

const router = Router();

// Public route - create a new family (during registration)
// Note: In production, this might be restricted or combined with user registration
router.post(
  '/',
  rateLimiters.auth,
  familyController.createFamily,
  invalidateCache(/^GET:.*\/api\/families$/),
);

// Protected routes - require authentication
router.use(protect);

// Get all families
// SUPER_ADMIN: see all families
// TRIP_ADMIN: see only families attending trips they manage
// FAMILY: see only their own family
router.get(
  '/',
  cacheResponse({ ttl: 300 }),
  rateLimiters.api,
  familyController.getAllFamilies,
);

// Get family by ID
// SUPER_ADMIN, TRIP_ADMIN: can view any family
// FAMILY: can only view their own family
router.get(
  '/:id',
  cacheResponse({ ttl: 600 }),
  rateLimiters.api,
  familyController.getFamilyById,
);

// Update family details
// SUPER_ADMIN: can update any family
// FAMILY: can only update their own family
router.put(
  '/:id',
  authorize(Role.SUPER_ADMIN, Role.FAMILY),
  rateLimiters.write,
  familyController.updateFamily,
  invalidateCache(/^GET:.*\/api\/families/),
);

// Approve family (SUPER_ADMIN only)
router.post(
  '/:id/approve',
  authorize(Role.SUPER_ADMIN),
  rateLimiters.write,
  familyController.approveFamily,
);

// Deactivate family (SUPER_ADMIN only)
router.post(
  '/:id/deactivate',
  authorize(Role.SUPER_ADMIN),
  rateLimiters.write,
  familyController.deactivateFamily,
);

// Reactivate family (SUPER_ADMIN only)
router.post(
  '/:id/reactivate',
  authorize(Role.SUPER_ADMIN),
  rateLimiters.write,
  familyController.reactivateFamily,
);

// Delete family permanently (SUPER_ADMIN only)
router.delete(
  '/:id',
  authorize(Role.SUPER_ADMIN),
  rateLimiters.write,
  familyController.deleteFamily,
);

// Family member management routes

// Get all members of a family
router.get(
  '/:id/members',
  cacheResponse({ ttl: 300 }),
  rateLimiters.api,
  familyController.getFamilyMembers,
);

// Get adults of a family
router.get(
  '/:id/adults',
  cacheResponse({ ttl: 300 }),
  rateLimiters.api,
  familyController.getFamilyAdults,
);

// Get children of a family
router.get(
  '/:id/children',
  cacheResponse({ ttl: 300 }),
  rateLimiters.api,
  familyController.getFamilyChildren,
);

// Add a member to a family
// SUPER_ADMIN: can add to any family
// FAMILY: can only add to their own family
router.post(
  '/:id/members',
  authorize(Role.SUPER_ADMIN, Role.FAMILY),
  rateLimiters.write,
  familyController.addMember,
  invalidateCache(/^GET:.*\/api\/families.*\/members|adults|children/),
);

// Update a member in a family
// SUPER_ADMIN: can update any member
// FAMILY: can only update members in their own family
router.put(
  '/:id/members/:memberId',
  authorize(Role.SUPER_ADMIN, Role.FAMILY),
  rateLimiters.write,
  familyController.updateMember,
  invalidateCache(/^GET:.*\/api\/families.*\/members|adults|children/),
);

// Remove a member from a family
// SUPER_ADMIN: can remove any member
// FAMILY: can only remove members from their own family
router.delete(
  '/:id/members/:memberId',
  authorize(Role.SUPER_ADMIN, Role.FAMILY),
  rateLimiters.write,
  familyController.removeMember,
);

export default router;
