import type { Family } from '@prisma/client';
import { prisma } from '../../src/utils/db.js';

export const createFamily = (data: Partial<Family> = {}): Promise<Family> => {
  return prisma.family.create({
    data: {
      name: 'Test Family',
      ...data,
    },
  });
};
