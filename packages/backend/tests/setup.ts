import { execSync } from 'child_process';
import { afterAll, beforeAll } from 'vitest';
import { prisma } from '../src/utils/db.js';

beforeAll(() => {
  execSync('yarn db:test:migrate', { stdio: 'inherit' });
});

afterAll(async () => {
  await prisma.$disconnect();
});
