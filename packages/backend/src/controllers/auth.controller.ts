import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { prisma } from '../utils/db.js';
import { ApiError } from '../utils/ApiError.js';
import { UserType, ActionType, Role, User } from '@prisma/client';
import { logService } from '../services/log.service.js';

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  familyName: z.string().optional(),
});

const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, familyName } = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  const passwordHash = await authService.hashPassword(password);

  const family = await prisma.family.create({
    data: {
      name: familyName || `${name}'s Family`,
    },
  });

  // Create user with default FAMILY role
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      familyId: family.id,
      type: UserType.ADULT,
      role: Role.FAMILY, // Explicitly set the default role
    },
  });

  await logService.log(user.id, ActionType.CREATE, 'User', user.id);

  const token = authService.generateToken(user);
  
  // Get family with members for response
  const familyWithMembers = await prisma.family.findUnique({
    where: { id: family.id },
    include: { members: true },
  });

  res.status(201).json({
    user,
    family: familyWithMembers,
    tokens: {
      accessToken: token,
      refreshToken: token, // For now, using same token (can be improved later)
    },
  });
});

const createAdminSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  familyName: z.string().optional(),
  role: z.enum([Role.TRIP_ADMIN, Role.SUPER_ADMIN]),
});

const createAdmin = asyncHandler(async (req: Request, res: Response) => {
  // This endpoint should only be accessible to SUPER_ADMIN users
  // (authorization middleware will be applied in routes)

  const { name, email, password, familyName, role } = createAdminSchema.parse(
    req.body,
  );

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(400, 'User already exists');
  }

  const passwordHash = await authService.hashPassword(password);

  const family = await prisma.family.create({
    data: {
      name: familyName || `${name}'s Family`,
    },
  });

  // Create an admin user with specified role
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      familyId: family.id,
      type: UserType.ADULT,
      role, // Set the role as specified
    },
  });

  // Log the creation by the logged-in SUPER_ADMIN user
  const adminUser = req.user as { id: string };
  await logService.log(adminUser.id, ActionType.CREATE, 'User', user.id, {
    role: user.role,
  });

  res.status(201).json({
    message: `Successfully created ${role} user`,
    userId: user.id,
    email: user.email,
  });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isMatch = await authService.comparePasswords(
    password,
    user.passwordHash,
  );
  if (!isMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  await logService.log(user.id, ActionType.LOGIN, 'User', user.id);

  const token = authService.generateToken(user);
  
  // Get family with members for response
  const family = await prisma.family.findUnique({
    where: { id: user.familyId },
    include: { members: true },
  });

  res.status(200).json({
    user,
    family,
    tokens: {
      accessToken: token,
      refreshToken: token, // For now, using same token (can be improved later)
    },
  });
});

/**
 * Handle OAuth callback after successful authentication
 */
const oauthCallback = asyncHandler(async (req: Request, res: Response) => {
  // The user object is attached by passport after successful OAuth authentication
  const user = req.user as User;

  if (!user) {
    throw new ApiError(401, 'Authentication failed');
  }

  // Log the OAuth login
  await logService.logOAuthLogin(
    user.id,
    user.oauthProvider || 'unknown',
    user.id,
  );

  // Generate a JWT token for the user
  const token = authService.generateToken(user);

  // Redirect to the frontend with the token
  const redirectUrl = authService.getOAuthRedirectUrl(token);
  res.redirect(redirectUrl);
});

/**
 * Get current user's information
 */
const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;

  if (!user) {
    throw new ApiError(401, 'Not authenticated');
  }

  // Get family with members
  const family = await prisma.family.findUnique({
    where: { id: user.familyId },
    include: { members: true },
  });

  res.status(200).json({
    user,
    family,
    tokens: {
      accessToken: '', // Not needed for this endpoint
      refreshToken: '',
    },
  });
});

export const authController = {
  register,
  login,
  createAdmin,
  oauthCallback,
  getCurrentUser,
};
