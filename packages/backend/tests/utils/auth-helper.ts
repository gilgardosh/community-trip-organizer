import { UserType, Role, type User } from '@prisma/client';
import { authService } from '../../src/services/auth.service.js';
import { createFamily } from './factories.js';
import { prisma } from '../../src/utils/db.js';

/**
 * Create a test user for authentication tests
 */
export async function createTestUser(
  email = 'test@example.com',
  password = 'password123',
): Promise<User> {
  // Create a family for the user
  const family = await createFamily();

  // Hash the password
  const passwordHash = await authService.hashPassword(password);

  // Create the user
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Test User',
      passwordHash,
      familyId: family.id,
      type: UserType.ADULT,
      role: Role.FAMILY,
    },
  });

  return user;
}

/**
 * Create a test user with a specified role
 */
export async function createTestUserWithRole(
  role: Role,
  email = `${role.toLowerCase()}@example.com`,
  password = 'password123',
): Promise<User> {
  // Create a family for the user
  const family = await createFamily();

  // Hash the password
  const passwordHash = await authService.hashPassword(password);

  // Create the user with specified role
  const user = await prisma.user.create({
    data: {
      email,
      name: `${role} Test User`,
      passwordHash,
      familyId: family.id,
      type: UserType.ADULT,
      role,
    },
  });

  return user;
}
