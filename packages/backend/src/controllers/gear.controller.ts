import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { gearService } from '../services/gear.service.js';
import { logService } from '../services/log.service.js';
import { ActionType, User } from '@prisma/client';

// Validation schemas
const createGearItemSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
  name: z.string().min(1, 'Gear item name is required'),
  quantityNeeded: z
    .number()
    .int()
    .min(1, 'Quantity needed must be at least 1'),
});

const updateGearItemSchema = z.object({
  name: z.string().min(1).optional(),
  quantityNeeded: z
    .number()
    .int()
    .min(1, 'Quantity needed must be at least 1')
    .optional(),
});

const assignGearSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  quantityAssigned: z
    .number()
    .int()
    .min(1, 'Quantity assigned must be at least 1'),
});

/**
 * Create a new gear item for a trip
 * @route POST /api/gear
 * @access Trip admins of the specific trip, SUPER_ADMIN
 */
const createGearItem = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const data = createGearItemSchema.parse(req.body);

  const gearItem = await gearService.createGearItem(data, user.id, user.role);

  // Log gear item creation
  await logService.log(user.id, ActionType.CREATE, 'GearItem', gearItem.id, {
    tripId: data.tripId,
    name: data.name,
    quantityNeeded: data.quantityNeeded,
  });

  res.status(201).json(gearItem);
});

/**
 * Get all gear items for a trip
 * @route GET /api/gear/trip/:tripId
 * @access All authenticated users (based on role and trip status)
 */
const getGearItemsByTripId = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const gearItems = await gearService.getGearItemsByTripId(
      req.params.tripId,
      user.id,
      user.role,
    );

    res.json(gearItems);
  },
);

/**
 * Get gear item by ID
 * @route GET /api/gear/:id
 * @access All authenticated users (based on role and trip status)
 */
const getGearItemById = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const gearItem = await gearService.getGearItemById(
    req.params.id,
    user.id,
    user.role,
  );

  res.json(gearItem);
});

/**
 * Update gear item
 * @route PUT /api/gear/:id
 * @access Trip admins of the specific trip, SUPER_ADMIN
 */
const updateGearItem = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const data = updateGearItemSchema.parse(req.body);

  const gearItem = await gearService.updateGearItem(
    req.params.id,
    data,
    user.id,
    user.role,
  );

  // Log gear item update
  await logService.log(user.id, ActionType.UPDATE, 'GearItem', gearItem.id, {
    ...data,
  });

  res.json(gearItem);
});

/**
 * Delete gear item
 * @route DELETE /api/gear/:id
 * @access Trip admins of the specific trip, SUPER_ADMIN
 */
const deleteGearItem = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const result = await gearService.deleteGearItem(
    req.params.id,
    user.id,
    user.role,
  );

  // Log gear item deletion
  await logService.log(user.id, ActionType.DELETE, 'GearItem', req.params.id);

  res.json(result);
});

/**
 * Assign gear to a family (volunteer)
 * @route POST /api/gear/:id/assign
 * @access Families can volunteer for their own gear, trip admins can assign to any family
 */
const assignGear = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const data = assignGearSchema.parse(req.body);

  const assignment = await gearService.assignGear(
    req.params.id,
    data,
    user.id,
    user.role,
  );

  // Log gear assignment
  await logService.log(
    user.id,
    ActionType.CREATE,
    'GearAssignment',
    assignment.id,
    {
      gearItemId: req.params.id,
      familyId: data.familyId,
      quantityAssigned: data.quantityAssigned,
    },
  );

  res.status(201).json(assignment);
});

/**
 * Remove gear assignment from a family
 * @route DELETE /api/gear/:id/assign/:familyId
 * @access Families can remove their own assignments, trip admins can remove any
 */
const removeGearAssignment = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const result = await gearService.removeGearAssignment(
      req.params.id,
      req.params.familyId,
      user.id,
      user.role,
    );

    // Log gear assignment removal
    await logService.log(user.id, ActionType.DELETE, 'GearAssignment', '', {
      gearItemId: req.params.id,
      familyId: req.params.familyId,
    });

    res.json(result);
  },
);

/**
 * Get gear summary for a trip
 * @route GET /api/gear/trip/:tripId/summary
 * @access All authenticated users (based on role and trip status)
 */
const getGearSummary = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const summary = await gearService.getGearSummary(
    req.params.tripId,
    user.id,
    user.role,
  );

  res.json(summary);
});

/**
 * Get family's gear assignments for a trip
 * @route GET /api/gear/trip/:tripId/family/:familyId
 * @access Families can view their own, trip admins can view for any family
 */
const getFamilyGearAssignments = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as User;
    const assignments = await gearService.getFamilyGearAssignments(
      req.params.tripId,
      req.params.familyId,
      user.id,
      user.role,
    );

    res.json(assignments);
  },
);

export const gearController = {
  createGearItem,
  getGearItemsByTripId,
  getGearItemById,
  updateGearItem,
  deleteGearItem,
  assignGear,
  removeGearAssignment,
  getGearSummary,
  getFamilyGearAssignments,
};
