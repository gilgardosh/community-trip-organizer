import { prisma } from '../utils/db.js';
import { ActionType } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

export const logService = {
  log: async (
    userId: string,
    actionType: ActionType,
    entityType: string,
    entityId: string,
    changes?: JsonValue,
  ) => {
    await prisma.log.create({
      data: {
        userId,
        actionType,
        entityType,
        entityId,
        changes,
      },
    });
  },
};
