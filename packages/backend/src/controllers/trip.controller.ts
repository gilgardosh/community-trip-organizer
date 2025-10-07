import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { tripService } from '../services/trip.service.js';
import { logService } from '../services/log.service.js';
import { ActionType, User } from '@prisma/client';

// Validation schemas
const createTripSchema = z.object({
  name: z.string().min(1, 'Trip name is required'),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)),
  attendanceCutoffDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  photoAlbumLink: z.string().url().optional().or(z.literal('')),
});

const updateTripSchema = z.object({
  name: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  endDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  attendanceCutoffDate: z.string().or(z.date()).transform((val) => new Date(val)).optional(),
  photoAlbumLink: z.string().url().optional().or(z.literal('')),
});

const assignAdminsSchema = z.object({
  adminIds: z.array(z.string()).min(1, 'At least one admin is required'),
});

const markAttendanceSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  attending: z.boolean(),
});

/**
 * Create a new trip
 * @route POST /api/trips
 * @access TRIP_ADMIN, SUPER_ADMIN
 */
const createTrip = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const data = createTripSchema.parse(req.body);

  const trip = await tripService.createTrip(data);

  // Log trip creation
  await logService.log(
    user.id,
    ActionType.CREATE,
    'Trip',
    trip.id,
    {
      name: data.name,
      location: data.location,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
    },
  );

  res.status(201).json(trip);
});

/**
 * Get all trips
 * @route GET /api/trips
 * @access All authenticated users
 */
const getAllTrips = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const { draft, startDateFrom, startDateTo, includePast } = req.query;

  const filters = {
    draft: draft === 'true' ? true : draft === 'false' ? false : undefined,
    startDateFrom: startDateFrom ? new Date(startDateFrom as string) : undefined,
    startDateTo: startDateTo ? new Date(startDateTo as string) : undefined,
    includePast: includePast === 'true',
  };

  const trips = await tripService.getAllTrips(user.id, user.role, filters);

  res.json(trips);
});

/**
 * Get trip by ID
 * @route GET /api/trips/:id
 * @access All authenticated users (based on role and trip status)
 */
const getTripById = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const trip = await tripService.getTripById(req.params.id, user.id, user.role);

  res.json(trip);
});

/**
 * Update trip
 * @route PUT /api/trips/:id
 * @access Trip admins of this trip, SUPER_ADMIN
 */
const updateTrip = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const data = updateTripSchema.parse(req.body);

  const trip = await tripService.updateTrip(
    req.params.id,
    data,
    user.id,
    user.role,
  );

  // Log trip update
  await logService.log(
    user.id,
    ActionType.UPDATE,
    'Trip',
    trip.id,
    {
      ...data,
      startDate: data.startDate?.toISOString(),
      endDate: data.endDate?.toISOString(),
      attendanceCutoffDate: data.attendanceCutoffDate?.toISOString(),
    },
  );

  res.json(trip);
});

/**
 * Publish trip
 * @route POST /api/trips/:id/publish
 * @access SUPER_ADMIN
 */
const publishTrip = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const trip = await tripService.publishTrip(req.params.id);

  // Log trip publishing
  await logService.log(
    user.id,
    ActionType.UPDATE,
    'Trip',
    trip.id,
    { action: 'published' },
  );

  res.json(trip);
});

/**
 * Unpublish trip (set to draft)
 * @route POST /api/trips/:id/unpublish
 * @access SUPER_ADMIN
 */
const unpublishTrip = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const trip = await tripService.unpublishTrip(req.params.id);

  // Log trip unpublishing
  await logService.log(
    user.id,
    ActionType.UPDATE,
    'Trip',
    trip.id,
    { action: 'unpublished' },
  );

  res.json(trip);
});

/**
 * Assign admins to trip
 * @route PUT /api/trips/:id/admins
 * @access SUPER_ADMIN
 */
const assignAdmins = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const data = assignAdminsSchema.parse(req.body);

  const trip = await tripService.assignAdmins(req.params.id, data);

  // Log admin assignment
  await logService.log(
    user.id,
    ActionType.UPDATE,
    'Trip',
    trip.id,
    { action: 'admins_assigned', adminIds: data.adminIds },
  );

  res.json(trip);
});

/**
 * Add admin to trip
 * @route POST /api/trips/:id/admins/:adminId
 * @access SUPER_ADMIN
 */
const addAdmin = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const trip = await tripService.addAdmin(req.params.id, req.params.adminId);

  // Log admin addition
  await logService.log(
    user.id,
    ActionType.UPDATE,
    'Trip',
    trip.id,
    { action: 'admin_added', adminId: req.params.adminId },
  );

  res.json(trip);
});

/**
 * Remove admin from trip
 * @route DELETE /api/trips/:id/admins/:adminId
 * @access SUPER_ADMIN
 */
const removeAdmin = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const trip = await tripService.removeAdmin(req.params.id, req.params.adminId);

  // Log admin removal
  await logService.log(
    user.id,
    ActionType.UPDATE,
    'Trip',
    trip.id,
    { action: 'admin_removed', adminId: req.params.adminId },
  );

  res.json(trip);
});

/**
 * Mark attendance for a trip
 * @route POST /api/trips/:id/attendance
 * @access Families can mark their own, trip admins can mark for any family in their trips
 */
const markAttendance = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const data = markAttendanceSchema.parse(req.body);

  const trip = await tripService.markAttendance(
    req.params.id,
    data,
    user.id,
    user.role,
  );

  // Log attendance change
  await logService.log(
    user.id,
    ActionType.UPDATE,
    'TripAttendance',
    req.params.id,
    {
      familyId: data.familyId,
      attending: data.attending,
    },
  );

  res.json(trip);
});

/**
 * Get trip attendees
 * @route GET /api/trips/:id/attendees
 * @access All authenticated users (based on role and trip status)
 */
const getTripAttendees = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const attendees = await tripService.getTripAttendees(
    req.params.id,
    user.id,
    user.role,
  );

  res.json(attendees);
});

/**
 * Delete trip
 * @route DELETE /api/trips/:id
 * @access SUPER_ADMIN
 */
const deleteTrip = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const result = await tripService.deleteTrip(req.params.id);

  // Log trip deletion
  await logService.log(
    user.id,
    ActionType.DELETE,
    'Trip',
    req.params.id,
  );

  res.json(result);
});

export const tripController = {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  publishTrip,
  unpublishTrip,
  assignAdmins,
  addAdmin,
  removeAdmin,
  markAttendance,
  getTripAttendees,
  deleteTrip,
};

