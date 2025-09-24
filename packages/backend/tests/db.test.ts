import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { clearDatabase } from './utils/db.js';
import { createFamily } from './utils/factories.js';
import { prisma } from '../src/utils/db.js';

describe('Database Tests', () => {
  beforeAll(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
  });

  it('should create and retrieve a family', async () => {
    const family = await createFamily({ name: 'The New Family' });
    const retrievedFamily = await prisma.family.findUnique({
      where: { id: family.id },
    });
    expect(retrievedFamily).not.toBeNull();
    expect(retrievedFamily?.name).toBe('The New Family');
  });
});
