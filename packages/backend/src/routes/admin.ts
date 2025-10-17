import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { rateLimiters } from '../middleware/rateLimiter.js';
import { Role } from '@prisma/client';

const router = Router();

// All admin routes require authentication and rate limiting
router.use(protect);
router.use(rateLimiters.admin);

/**
 * User Management Routes (SUPER_ADMIN only)
 */

// Get all users
router.get('/users', authorize(Role.SUPER_ADMIN), adminController.getAllUsers);

// Update user role
router.post(
  '/users/:userId/role',
  authorize(Role.SUPER_ADMIN),
  adminController.updateUserRole,
);

// Get user activity logs
router.get(
  '/users/:userId/logs',
  authorize(Role.SUPER_ADMIN),
  adminController.getUserActivityLogs,
);

/**
 * Family Management Routes (SUPER_ADMIN only)
 */

// Get pending families
router.get(
  '/families/pending',
  authorize(Role.SUPER_ADMIN),
  adminController.getPendingFamilies,
);

// Bulk approve families
router.post(
  '/families/bulk-approve',
  authorize(Role.SUPER_ADMIN),
  adminController.bulkApproveFamilies,
);

// Bulk deactivate families
router.post(
  '/families/bulk-deactivate',
  authorize(Role.SUPER_ADMIN),
  adminController.bulkDeactivateFamilies,
);

// Approve family
router.post(
  '/families/:familyId/approve',
  authorize(Role.SUPER_ADMIN),
  adminController.approveFamily,
);

// Deactivate family
router.post(
  '/families/:familyId/deactivate',
  authorize(Role.SUPER_ADMIN),
  adminController.deactivateFamily,
);

// Reactivate family
router.post(
  '/families/:familyId/reactivate',
  authorize(Role.SUPER_ADMIN),
  adminController.reactivateFamily,
);

// Delete family permanently
router.delete(
  '/families/:familyId',
  authorize(Role.SUPER_ADMIN),
  adminController.deleteFamily,
);

/**
 * Trip Management Routes (SUPER_ADMIN only)
 */

// Publish trip
router.post(
  '/trips/:tripId/publish',
  authorize(Role.SUPER_ADMIN),
  adminController.publishTrip,
);

// Unpublish trip
router.post(
  '/trips/:tripId/unpublish',
  authorize(Role.SUPER_ADMIN),
  adminController.unpublishTrip,
);

// Assign admins to trip
router.post(
  '/trips/:tripId/admins',
  authorize(Role.SUPER_ADMIN),
  adminController.assignTripAdmins,
);

// Add admin to trip
router.post(
  '/trips/:tripId/admins/:adminId',
  authorize(Role.SUPER_ADMIN),
  adminController.addTripAdmin,
);

// Remove admin from trip
router.delete(
  '/trips/:tripId/admins/:adminId',
  authorize(Role.SUPER_ADMIN),
  adminController.removeTripAdmin,
);

// Delete trip permanently
router.delete(
  '/trips/:tripId',
  authorize(Role.SUPER_ADMIN),
  adminController.deleteTrip,
);

/**
 * Statistics and Reporting Routes (SUPER_ADMIN and TRIP_ADMIN)
 */

// Get system dashboard metrics
router.get(
  '/metrics',
  authorize(Role.SUPER_ADMIN, Role.TRIP_ADMIN),
  adminController.getDashboardMetrics,
);

// Get system summary
router.get(
  '/summary',
  authorize(Role.SUPER_ADMIN, Role.TRIP_ADMIN),
  adminController.getSystemSummary,
);

// Get trip statistics
router.get(
  '/stats/trips',
  authorize(Role.SUPER_ADMIN, Role.TRIP_ADMIN),
  adminController.getTripStats,
);

// Get family statistics
router.get(
  '/stats/families',
  authorize(Role.SUPER_ADMIN, Role.TRIP_ADMIN),
  adminController.getFamilyStats,
);

// Get trip attendance report
router.get(
  '/reports/trips/:tripId/attendance',
  authorize(Role.SUPER_ADMIN, Role.TRIP_ADMIN),
  adminController.getTripAttendanceReport,
);

/**
 * Activity Logs Routes (SUPER_ADMIN only)
 */

// Get all activity logs
router.get(
  '/logs',
  authorize(Role.SUPER_ADMIN),
  adminController.getActivityLogs,
);

// Get activity logs for a specific entity
router.get(
  '/logs/:entityType/:entityId',
  authorize(Role.SUPER_ADMIN),
  adminController.getEntityActivityLogs,
);

/**
 * Data Export Routes (SUPER_ADMIN only)
 */

// Export system data
router.post('/export', authorize(Role.SUPER_ADMIN), adminController.exportData);

export default router;
