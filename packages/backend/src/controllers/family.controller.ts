import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { familyService, FamilyFilters } from '../services/family.service.js';
import { logService } from '../services/log.service.js';
import { ActionType, UserType, User, FamilyStatus } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';

// Validation schemas
const adultSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  passwordHash: z.string().optional(),
  oauthProvider: z.string().optional(),
  oauthProviderId: z.string().optional(),
  profilePhotoUrl: z.string().url().optional().or(z.literal('')),
});

const childSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().min(0).max(18, 'Age must be between 0 and 18'),
});

const createFamilySchema = z.object({
  name: z.string().optional(),
  adults: z.array(adultSchema).min(1, 'At least one adult is required'),
  children: z.array(childSchema).optional(),
});

const updateFamilySchema = z.object({
  name: z.string().min(1).optional(),
});

const addMemberSchema = z.object({
  type: z.enum([UserType.ADULT, UserType.CHILD]),
  name: z.string().min(1, 'Name is required'),
  age: z.number().int().min(0).max(18).optional(),
  email: z.string().email().optional(),
  passwordHash: z.string().optional(),
  oauthProvider: z.string().optional(),
  oauthProviderId: z.string().optional(),
  profilePhotoUrl: z.string().url().optional().or(z.literal('')),
});

const updateMemberSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.number().int().min(0).max(18).optional(),
  email: z.string().email().optional(),
  profilePhotoUrl: z.string().url().optional().or(z.literal('')),
});

/**
 * Create a new family
 * Accessible by: Anyone (during registration)
 */
const createFamily = asyncHandler(async (req: Request, res: Response) => {
  const data = createFamilySchema.parse(req.body);

  const family = await familyService.createFamily(data);

  // Log family creation by the first adult
  const firstAdult = family.members.find((m) => m.type === UserType.ADULT);
  if (firstAdult) {
    await logService.log(firstAdult.id, ActionType.CREATE, 'Family', family.id, {
      name: family.name,
      memberCount: family.members.length,
    });
  }

  res.status(201).json(family);
});

/**
 * Get all families
 * Accessible by: SUPER_ADMIN (all families), TRIP_ADMIN (families in their trips only), FAMILY (own family only)
 */
const getAllFamilies = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  
  // Parse query filters
  const status = req.query.status as FamilyStatus | undefined;
  const isActive = req.query.isActive as string | undefined;

  const filters: FamilyFilters = {};
  if (status) {
    filters.status = status;
  }
  if (isActive !== undefined) {
    filters.isActive = isActive === 'true';
  }

  // FAMILY role can only see their own family
  if (user.role === 'FAMILY') {
    const family = await familyService.getFamilyById(user.familyId);
    res.status(200).json([family]);
  } 
  // TRIP_ADMIN can only see families in trips they admin
  else if (user.role === 'TRIP_ADMIN') {
    const families = await familyService.getFamiliesForTripAdmin(user.id, filters);
    res.status(200).json(families);
  }
  // SUPER_ADMIN can see all families
  else {
    const families = await familyService.getAllFamilies(filters);
    res.status(200).json(families);
  }
});

/**
 * Get family by ID
 * Accessible by: SUPER_ADMIN, TRIP_ADMIN, FAMILY (own family only)
 */
const getFamilyById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as User;

  // FAMILY role can only access their own family
  if (user.role === 'FAMILY' && user.familyId !== id) {
    throw new ApiError(403, 'You can only access your own family');
  }

  const family = await familyService.getFamilyById(id);
  res.status(200).json(family);
});

/**
 * Update family details
 * Accessible by: SUPER_ADMIN, FAMILY (own family only)
 */
const updateFamily = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as User;
  const data = updateFamilySchema.parse(req.body);

  // FAMILY role can only update their own family
  if (user.role === 'FAMILY' && user.familyId !== id) {
    throw new ApiError(403, 'You can only update your own family');
  }

  const oldFamily = await familyService.getFamilyById(id);
  const updatedFamily = await familyService.updateFamily(id, data);

  // Log the update
  await logService.log(user.id, ActionType.UPDATE, 'Family', id, {
    oldName: oldFamily.name,
    newName: updatedFamily.name,
  });

  res.status(200).json(updatedFamily);
});

/**
 * Approve family
 * Accessible by: SUPER_ADMIN only
 */
const approveFamily = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as User;

  const approvedFamily = await familyService.approveFamily(id);

  // Log the approval
  await logService.log(user.id, ActionType.UPDATE, 'Family', id, {
    action: 'approved',
    status: 'APPROVED',
  });

  res.status(200).json(approvedFamily);
});

/**
 * Deactivate family
 * Accessible by: SUPER_ADMIN only
 */
const deactivateFamily = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as User;

  const deactivatedFamily = await familyService.deactivateFamily(id);

  // Log the deactivation
  await logService.log(user.id, ActionType.UPDATE, 'Family', id, {
    action: 'deactivated',
    isActive: false,
  });

  res.status(200).json(deactivatedFamily);
});

/**
 * Reactivate family
 * Accessible by: SUPER_ADMIN only
 */
const reactivateFamily = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as User;

  const reactivatedFamily = await familyService.reactivateFamily(id);

  // Log the reactivation
  await logService.log(user.id, ActionType.UPDATE, 'Family', id, {
    action: 'reactivated',
    isActive: true,
  });

  res.status(200).json(reactivatedFamily);
});

/**
 * Delete family permanently
 * Accessible by: SUPER_ADMIN only
 */
const deleteFamily = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as User;

  await familyService.deleteFamily(id);

  // Log the deletion
  await logService.log(user.id, ActionType.DELETE, 'Family', id);

  res.status(200).json({ message: 'Family deleted successfully' });
});

/**
 * Add a member to a family
 * Accessible by: SUPER_ADMIN, FAMILY (own family only)
 */
const addMember = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as User;
  const data = addMemberSchema.parse(req.body);

  // FAMILY role can only add members to their own family
  if (user.role === 'FAMILY' && user.familyId !== id) {
    throw new ApiError(403, 'You can only add members to your own family');
  }

  const member = await familyService.addMember(id, data);

  // Log the member addition
  await logService.log(user.id, ActionType.CREATE, 'User', member.id, {
    familyId: id,
    type: member.type,
    name: member.name,
  });

  res.status(201).json(member);
});

/**
 * Update a family member
 * Accessible by: SUPER_ADMIN, FAMILY (own family only)
 */
const updateMember = asyncHandler(async (req: Request, res: Response) => {
  const { id, memberId } = req.params;
  const user = req.user as User;
  const data = updateMemberSchema.parse(req.body);

  // FAMILY role can only update members in their own family
  if (user.role === 'FAMILY' && user.familyId !== id) {
    throw new ApiError(403, 'You can only update members in your own family');
  }

  const updatedMember = await familyService.updateMember(id, memberId, data);

  // Log the member update
  await logService.log(user.id, ActionType.UPDATE, 'User', memberId, {
    familyId: id,
    changes: data,
  });

  res.status(200).json(updatedMember);
});

/**
 * Remove a member from a family
 * Accessible by: SUPER_ADMIN, FAMILY (own family only)
 */
const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const { id, memberId } = req.params;
  const user = req.user as User;

  // FAMILY role can only remove members from their own family
  if (user.role === 'FAMILY' && user.familyId !== id) {
    throw new ApiError(403, 'You can only remove members from your own family');
  }

  await familyService.removeMember(id, memberId);

  // Log the member removal
  await logService.log(user.id, ActionType.DELETE, 'User', memberId, {
    familyId: id,
  });

  res.status(200).json({ message: 'Member removed successfully' });
});

/**
 * Get family members
 * Accessible by: SUPER_ADMIN, TRIP_ADMIN, FAMILY (own family only)
 */
const getFamilyMembers = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as User;

  // FAMILY role can only access their own family members
  if (user.role === 'FAMILY' && user.familyId !== id) {
    throw new ApiError(403, 'You can only access your own family members');
  }

  const members = await familyService.getFamilyMembers(id);
  res.status(200).json(members);
});

/**
 * Get family adults
 * Accessible by: SUPER_ADMIN, TRIP_ADMIN, FAMILY (own family only)
 */
const getFamilyAdults = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as User;

  // FAMILY role can only access their own family adults
  if (user.role === 'FAMILY' && user.familyId !== id) {
    throw new ApiError(403, 'You can only access your own family members');
  }

  const adults = await familyService.getFamilyAdults(id);
  res.status(200).json(adults);
});

/**
 * Get family children
 * Accessible by: SUPER_ADMIN, TRIP_ADMIN, FAMILY (own family only)
 */
const getFamilyChildren = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as User;

  // FAMILY role can only access their own family children
  if (user.role === 'FAMILY' && user.familyId !== id) {
    throw new ApiError(403, 'You can only access your own family members');
  }

  const children = await familyService.getFamilyChildren(id);
  res.status(200).json(children);
});

export const familyController = {
  createFamily,
  getAllFamilies,
  getFamilyById,
  updateFamily,
  approveFamily,
  deactivateFamily,
  reactivateFamily,
  deleteFamily,
  addMember,
  updateMember,
  removeMember,
  getFamilyMembers,
  getFamilyAdults,
  getFamilyChildren,
};
