import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { prisma } from '../utils/db.js';
import { ApiError } from '../utils/ApiError.js';
import { UserType, ActionType, Role } from '@prisma/client';
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
  res.status(201).json({ token });
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
  
  const { name, email, password, familyName, role } = createAdminSchema.parse(req.body);

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
  await logService.log(
    adminUser.id, 
    ActionType.CREATE, 
    'User', 
    user.id, 
    { role: user.role }
  );

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
  res.status(200).json({ token });
});

export const authController = {
  register,
  login,
  createAdmin,
};
