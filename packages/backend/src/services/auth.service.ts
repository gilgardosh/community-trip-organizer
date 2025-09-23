import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import config from '../config/index.js';

const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

const comparePasswords = (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

const generateToken = (user: Pick<User, 'id' | 'role'>): string => {
  const payload = {
    id: user.id,
    role: user.role,
  };
  if (!config.jwt.secret) {
    throw new Error('JWT secret is not defined');
  }
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn ?? '1d',
  });
};

export const authService = {
  hashPassword,
  comparePasswords,
  generateToken,
};
