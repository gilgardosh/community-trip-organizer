/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Prisma } from '@prisma/client';
import { prisma } from '../../src/utils/db.js';

export async function clearDatabase() {
  const modelNames = Prisma.dmmf.datamodel.models.map((model) => model.name);

  for (const modelName of modelNames) {
    const clientProperty =
      (modelName.charAt(0).toLowerCase() +
        modelName.slice(1)) as keyof typeof prisma;
    try {
      if (
        typeof prisma[clientProperty] === 'object' &&
        prisma[clientProperty] !== null &&
        'deleteMany' in prisma[clientProperty]
      ) {
        await (prisma[clientProperty] as any).deleteMany({});
      }
    } catch (error) {
      if (error instanceof TypeError || (error as any).code === 'P2023') {
        continue;
      }
      console.log({ error });
    }
  }
}

