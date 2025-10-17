import { Router } from 'express';
import { whatsappController } from '../controllers/whatsapp.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { rateLimiters } from '../middleware/rateLimiter.js';
import { Role } from '@prisma/client';

const router = Router();

// All WhatsApp routes require authentication and rate limiting
router.use(protect);
router.use(rateLimiters.write);

// Template Management Routes
// Only SUPER_ADMIN can manage templates

// Create a new template
router.post(
  '/templates',
  authorize(Role.SUPER_ADMIN),
  whatsappController.createTemplate,
);

// Get all templates
// TRIP_ADMIN and SUPER_ADMIN can view templates
router.get(
  '/templates',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  whatsappController.getAllTemplates,
);

// Get template by ID
router.get(
  '/templates/:id',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  whatsappController.getTemplateById,
);

// Update template
router.put(
  '/templates/:id',
  authorize(Role.SUPER_ADMIN),
  whatsappController.updateTemplate,
);

// Delete template
router.delete(
  '/templates/:id',
  authorize(Role.SUPER_ADMIN),
  whatsappController.deleteTemplate,
);

// Message Generation Routes
// TRIP_ADMIN and SUPER_ADMIN can generate messages

// Generate message from template (manual)
router.post(
  '/generate',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  whatsappController.generateMessage,
);

// Generate trip-specific messages

// Trip created message
router.post(
  '/trip/:tripId/created',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  whatsappController.generateTripCreatedMessage,
);

// Trip published message
router.post(
  '/trip/:tripId/published',
  authorize(Role.SUPER_ADMIN),
  whatsappController.generateTripPublishedMessage,
);

// Attendance update message
router.post(
  '/trip/:tripId/attendance',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  whatsappController.generateAttendanceUpdateMessage,
);

// Gear assignment message
router.post(
  '/trip/:tripId/gear',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  whatsappController.generateGearAssignmentMessage,
);

// Trip reminder message
router.post(
  '/trip/:tripId/reminder',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  whatsappController.generateTripReminderMessage,
);

// Trip start message
router.post(
  '/trip/:tripId/start',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  whatsappController.generateTripStartMessage,
);

// Attendance cutoff reminder message
router.post(
  '/trip/:tripId/cutoff-reminder',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  whatsappController.generateAttendanceCutoffReminderMessage,
);

// Message History Routes

// Get message history for a trip
router.get(
  '/trip/:tripId/messages',
  authorize(Role.TRIP_ADMIN, Role.SUPER_ADMIN),
  whatsappController.getTripMessageHistory,
);

// Get all messages (SUPER_ADMIN only)
router.get(
  '/messages',
  authorize(Role.SUPER_ADMIN),
  whatsappController.getAllMessages,
);

export default router;
