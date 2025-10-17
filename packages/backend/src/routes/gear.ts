import { Router } from 'express';
import { gearController } from '../controllers/gear.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { rateLimiters } from '../middleware/rateLimiter.js';
import { cacheResponse, invalidateCache } from '../middleware/cache.js';
import { Role } from '@prisma/client';

const router = Router();

// All gear routes require authentication
router.use(protect);

// Create a new gear item for a trip
// Only TRIP_ADMIN (of that specific trip) and SUPER_ADMIN can create gear items
router.post(
  '/',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  rateLimiters.write,
  gearController.createGearItem,
  invalidateCache(/^GET:.*\/api\/gear/),
);

// Get all gear items for a trip
// All authenticated users can view (based on role and trip status)
router.get('/trip/:tripId', cacheResponse({ ttl: 300 }), rateLimiters.api, gearController.getGearItemsByTripId);

// Get gear summary for a trip
// All authenticated users can view (based on role and trip status)
router.get('/trip/:tripId/summary', cacheResponse({ ttl: 180 }), rateLimiters.api, gearController.getGearSummary);

// Get family's gear assignments for a trip
// Families can view their own, trip admins can view for any family
router.get(
  '/trip/:tripId/family/:familyId',
  cacheResponse({ ttl: 180 }),
  rateLimiters.api,
  gearController.getFamilyGearAssignments,
);

// Get gear item by ID
// All authenticated users can view (based on role and trip status)
router.get('/:id', cacheResponse({ ttl: 600 }), rateLimiters.api, gearController.getGearItemById);

// Update gear item
// Only trip admins of the specific trip and SUPER_ADMIN can update
router.put(
  '/:id',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  rateLimiters.write,
  gearController.updateGearItem,
  invalidateCache(/^GET:.*\/api\/gear/),
);

// Delete gear item
// Only trip admins of the specific trip and SUPER_ADMIN can delete
router.delete(
  '/:id',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  rateLimiters.write,
  gearController.deleteGearItem,
);

// Assign gear to a family (volunteer)
// Families can volunteer for their own gear, trip admins can assign to any family
router.post('/:id/assign', rateLimiters.write, gearController.assignGear, invalidateCache(/^GET:.*\/api\/gear/));

// Remove gear assignment from a family
// Families can remove their own assignments, trip admins can remove any
router.delete('/:id/assign/:familyId', rateLimiters.write, gearController.removeGearAssignment, invalidateCache(/^GET:.*\/api\/gear/));

export default router;
