import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import config from '../config/index.js';

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
  
  // Ensure JWT secret is defined
  const secret = config.jwt.secret;
  if (!secret) {
    throw new Error('JWT secret is not defined');
  }
  
  // Generate token
  return jwt.sign(payload, String(secret), {
    expiresIn: config.jwt.expiresIn ?? '1d',
  });
};

/**
 * Check if a user logged in via OAuth
 */
const isOAuthUser = (user: User): boolean => {
  return !!user.oauthProvider && (!user.passwordHash || user.passwordHash === '');
};

/**
 * Get redirect URL after OAuth login
 */
const getOAuthRedirectUrl = (token: string): string => {
  return `${config.clientUrl}/oauth-success?token=${token}`;
};

export const authService = {
  hashPassword,
  comparePasswords,
  generateToken,
  isOAuthUser,
  getOAuthRedirectUrl,
};
