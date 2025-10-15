import { Router } from 'express';
import { tripController } from '../controllers/trip.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { Role } from '@prisma/client';

const router = Router();

// All trip routes require authentication
router.use(protect);

// Create a new trip (draft mode by default)
// Only TRIP_ADMIN and SUPER_ADMIN can create trips
router.post(
  '/',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  tripController.createTrip,
);

// Get all trips
// FAMILY: only published trips
// TRIP_ADMIN: only trips they manage (including drafts)
// SUPER_ADMIN: all trips
router.get('/', tripController.getAllTrips);

// Get trip by ID
// FAMILY: only published trips
// TRIP_ADMIN: only trips they manage (including drafts)
// SUPER_ADMIN: all trips
router.get('/:id', tripController.getTripById);

// Update trip
// Only trip admins of this trip and SUPER_ADMIN can update
router.put(
  '/:id',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  tripController.updateTrip,
);

// Delete trip permanently (SUPER_ADMIN only)
router.delete('/:id', authorize(Role.SUPER_ADMIN), tripController.deleteTrip);

// Trip publishing workflow

// Publish trip (SUPER_ADMIN only)
router.post(
  '/:id/publish',
  authorize(Role.SUPER_ADMIN),
  tripController.publishTrip,
);

// Unpublish trip - set to draft (SUPER_ADMIN only)
router.post(
  '/:id/unpublish',
  authorize(Role.SUPER_ADMIN),
  tripController.unpublishTrip,
);

// Trip admin management

// Assign admins to trip (replace all admins) - SUPER_ADMIN only
router.put(
  '/:id/admins',
  authorize(Role.SUPER_ADMIN),
  tripController.assignAdmins,
);

// Add an admin to trip (SUPER_ADMIN only)
router.post(
  '/:id/admins/:adminId',
  authorize(Role.SUPER_ADMIN),
  tripController.addAdmin,
);

// Remove an admin from trip (SUPER_ADMIN only)
router.delete(
  '/:id/admins/:adminId',
  authorize(Role.SUPER_ADMIN),
  tripController.removeAdmin,
);

// Trip attendance

// Mark attendance for a trip
// FAMILY: can mark their own family's attendance
// TRIP_ADMIN: can mark for any family in trips they manage
// SUPER_ADMIN: can mark for any family in any trip
router.post('/:id/attendance', tripController.markAttendance);

// Get trip attendees
// All authenticated users can view (based on role and trip visibility)
router.get('/:id/attendees', tripController.getTripAttendees);

// Dietary requirements

// Update dietary requirements for a family
// FAMILY: can update their own dietary requirements
// TRIP_ADMIN: can update for any family in trips they manage
// SUPER_ADMIN: can update for any family
router.put(
  '/:id/dietary-requirements',
  tripController.updateDietaryRequirements,
);

// Trip schedule management

// Get trip schedule
router.get('/:id/schedule', tripController.getTripSchedule);

// Add schedule item (TRIP_ADMIN and SUPER_ADMIN only)
router.post(
  '/:id/schedule',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  tripController.addScheduleItem,
);

// Update schedule item (TRIP_ADMIN and SUPER_ADMIN only)
router.put(
  '/:id/schedule/:scheduleId',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  tripController.updateScheduleItem,
);

// Delete schedule item (TRIP_ADMIN and SUPER_ADMIN only)
router.delete(
  '/:id/schedule/:scheduleId',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  tripController.deleteScheduleItem,
);

export default router;
