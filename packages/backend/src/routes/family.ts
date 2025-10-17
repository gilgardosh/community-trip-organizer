import { Router } from 'express';
import { familyController } from '../controllers/family.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { rateLimiters } from '../middleware/rateLimiter.js';
import { Role } from '@prisma/client';

const router = Router();

// Public route - create a new family (during registration)
// Note: In production, this might be restricted or combined with user registration
router.post('/', rateLimiters.auth, familyController.createFamily);

// Protected routes - require authentication
router.use(protect);

// Get all families
// SUPER_ADMIN: see all families
// TRIP_ADMIN: see only families attending trips they manage
// FAMILY: see only their own family
router.get('/', rateLimiters.api, familyController.getAllFamilies);

// Get family by ID
// SUPER_ADMIN, TRIP_ADMIN: can view any family
// FAMILY: can only view their own family
router.get('/:id', rateLimiters.api, familyController.getFamilyById);

// Update family details
// SUPER_ADMIN: can update any family
// FAMILY: can only update their own family
router.put(
  '/:id',
  rateLimiters.write,
  authorize(Role.SUPER_ADMIN, Role.FAMILY),
  familyController.updateFamily,
);

// Approve family (SUPER_ADMIN only)
router.post(
  '/:id/approve',
  rateLimiters.write,
  authorize(Role.SUPER_ADMIN),
  familyController.approveFamily,
);

// Deactivate family (SUPER_ADMIN only)
router.post(
  '/:id/deactivate',
  rateLimiters.write,
  authorize(Role.SUPER_ADMIN),
  familyController.deactivateFamily,
);

// Reactivate family (SUPER_ADMIN only)
router.post(
  '/:id/reactivate',
  rateLimiters.write,
  authorize(Role.SUPER_ADMIN),
  familyController.reactivateFamily,
);

// Delete family permanently (SUPER_ADMIN only)
router.delete(
  '/:id',
  rateLimiters.write,
  authorize(Role.SUPER_ADMIN),
  familyController.deleteFamily,
);

// Family member management routes

// Get all members of a family
router.get('/:id/members', rateLimiters.api, familyController.getFamilyMembers);

// Get adults of a family
router.get('/:id/adults', rateLimiters.api, familyController.getFamilyAdults);

// Get children of a family
router.get('/:id/children', rateLimiters.api, familyController.getFamilyChildren);

// Add a member to a family
// SUPER_ADMIN: can add to any family
// FAMILY: can only add to their own family
router.post(
  '/:id/members',
  rateLimiters.write,
  authorize(Role.SUPER_ADMIN, Role.FAMILY),
  familyController.addMember,
);

// Update a member in a family
// SUPER_ADMIN: can update any member
// FAMILY: can only update members in their own family
router.put(
  '/:id/members/:memberId',
  rateLimiters.write,
  authorize(Role.SUPER_ADMIN, Role.FAMILY),
  familyController.updateMember,
);

// Remove a member from a family
// SUPER_ADMIN: can remove any member
// FAMILY: can only remove members from their own family
router.delete(
  '/:id/members/:memberId',
  rateLimiters.write,
  authorize(Role.SUPER_ADMIN, Role.FAMILY),
  familyController.removeMember,
);

export default router;
