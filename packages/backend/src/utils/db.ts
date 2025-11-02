import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton for Serverless Environments
 * 
 * Important: Reusing Prisma Client instances across function invocations
 * prevents connection exhaustion in serverless environments.
 * 
 * This pattern ensures:
 * 1. Only one Prisma Client instance is created per function container
 * 2. Connections are reused when the function is "warm"
 * 3. Proper cleanup on module hot-reload during development
 */

// Prevent multiple instances during hot-reload in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown (for local development with nodemon)
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
