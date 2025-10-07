import { prisma } from '../utils/db.js';
import { ActionType } from '@prisma/client';
import { JsonValue } from '@prisma/client/runtime/library';

/**
 * Service for logging user actions
 */
export const logService = {
  /**
   * Log a user action
   */
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
        changes: changes ?? undefined,
      },
    });
  },

  /**
   * Log an OAuth login
   * Uses the standard LOGIN action type but adds provider info in changes
   */
  logOAuthLogin: async (userId: string, provider: string, entityId: string) => {
    await prisma.log.create({
      data: {
        userId,
        actionType: ActionType.LOGIN, // Use standard LOGIN until OAUTH_LOGIN is added
        entityType: 'User',
        entityId,
        changes: { provider, authType: 'oauth' }, // Mark as OAuth login in changes
      },
    });
  },
};
