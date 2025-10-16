import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { env } from '../config/env.js';

/**
 * Hash a password with bcrypt
 */
const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

/**
 * Compare a plain text password with a hash
 */
const comparePasswords = (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a JWT token for the user
 */
const generateToken = (user: Pick<User, 'id' | 'role'>): string => {
  const payload = {
    id: user.id,
    role: user.role,
  };

  // Generate token (env.JWT_SECRET is already validated)
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Check if a user logged in via OAuth
 */
const isOAuthUser = (user: User): boolean => {
  return (
    !!user.oauthProvider && (!user.passwordHash || user.passwordHash === '')
  );
};

/**
 * Get redirect URL after OAuth login
 */
const getOAuthRedirectUrl = (token: string): string => {
  return `${env.CLIENT_URL}/oauth-success?token=${token}`;
};

export const authService = {
  hashPassword,
  comparePasswords,
  generateToken,
  isOAuthUser,
  getOAuthRedirectUrl,
};
