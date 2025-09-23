import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { prisma } from '../utils/db.js';
import { ApiError } from '../utils/ApiError.js';
import { UserType, ActionType } from '@prisma/client';
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

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      familyId: family.id,
      type: UserType.ADULT,
    },
  });

  await logService.log(user.id, ActionType.CREATE, 'User', user.id);

  const token = authService.generateToken(user);
  res.status(201).json({ token });
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
};
