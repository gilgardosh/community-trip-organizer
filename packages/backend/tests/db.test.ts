import { beforeEach, describe, expect, it } from 'vitest';
import { clearDatabase } from './utils/db.js';
import { createFamily } from './utils/factories.js';
import { prisma } from '../src/utils/db.js';

describe('Database Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('should create and retrieve a family', async () => {
    const family = await createFamily({ name: 'The Smiths' });
    const retrievedFamily = await prisma.family.findUnique({
      where: { id: family.id },
    });
    expect(retrievedFamily).not.toBeNull();
    expect(retrievedFamily?.name).toBe('The Smiths');
  });
});
