import type { Family, User } from '@prisma/client';
import { UserType } from '@prisma/client';
import { prisma } from '../../src/utils/db.js';
import { authService } from '../../src/services/auth.service.js';

export const createFamily = (data: Partial<Family> = {}): Promise<Family> => {
  return prisma.family.create({
    data: {
      name: 'Test Family',
      ...data,
    },
  });
};

/**
 * Create a family with members (adults and optionally children)
 */
export const createFamilyWithMembers = async (
  familyData: Partial<Family> = {},
  adults: Array<{ name: string; email: string; password?: string }> = [
    { name: 'Test Adult', email: `adult_${Date.now()}_${Math.random()}@test.com`, password: 'password123' },
  ],
  children: Array<{ name: string; age: number }> = []
): Promise<Family> => {
  const family = await prisma.family.create({
    data: {
      name: 'Test Family',
      ...familyData,
    },
  });

  // Create adults
  for (const adult of adults) {
    const passwordHash = adult.password
      ? await authService.hashPassword(adult.password)
      : undefined;
    
    await prisma.user.create({
      data: {
        familyId: family.id,
        type: UserType.ADULT,
        name: adult.name,
        email: adult.email,
        passwordHash,
      },
    });
  }

  // Create children
  for (const child of children) {
    await prisma.user.create({
      data: {
        familyId: family.id,
        type: UserType.CHILD,
        name: child.name,
        age: child.age,
        email: `${child.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${Math.random()}@child.local`,
      },
    });
  }

  return prisma.family.findUniqueOrThrow({
    where: { id: family.id },
    include: { members: true },
  });
};

/**
 * Create an adult user for a family
 */
export const createAdult = async (
  familyId: string,
  data: Partial<User> = {}
): Promise<User> => {
  const passwordHash = await authService.hashPassword('password123');
  
  return prisma.user.create({
    data: {
      familyId,
      type: UserType.ADULT,
      name: 'Test Adult',
      email: `adult_${Date.now()}@test.com`,
      passwordHash,
      ...data,
    },
  });
};

/**
 * Create a child user for a family
 */
export const createChild = async (
  familyId: string,
  data: Partial<User> = {}
): Promise<User> => {
  return prisma.user.create({
    data: {
      familyId,
      type: UserType.CHILD,
      name: 'Test Child',
      age: 10,
      email: `child_${Date.now()}@child.local`,
      ...data,
    },
  });
};

