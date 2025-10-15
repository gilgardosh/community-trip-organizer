import { prisma } from '../utils/db.js';
import {
  Role,
  FamilyStatus,
  ActionType,
  UserType,
  Prisma,
} from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';

export interface UpdateUserRoleData {
  role: Role;
}

export interface SystemMetrics {
  trips: {
    total: number;
    draft: number;
    published: number;
    upcoming: number;
    ongoing: number;
    past: number;
  };
  families: {
    total: number;
    pending: number;
    approved: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
    adults: number;
    children: number;
    superAdmins: number;
    tripAdmins: number;
  };
  attendance: {
    totalAttendances: number;
    averageAttendancePerTrip: number;
  };
}

export interface TripStats {
  id: string;
  name: string;
  location: string;
  startDate: Date;
  endDate: Date;
  draft: boolean;
  attendeeCount: number;
  gearItemsCount: number;
  totalGearAssignments: number;
  scheduleItemsCount: number;
  admins: {
    id: string;
    name: string;
    email: string;
  }[];
}

export interface FamilyStats {
  id: string;
  name: string | null;
  status: FamilyStatus;
  isActive: boolean;
  memberCount: number;
  adultsCount: number;
  childrenCount: number;
  tripsAttendedCount: number;
  gearAssignmentsCount: number;
  createdAt: Date;
}

export interface ActivityLogFilters {
  userId?: string;
  actionType?: ActionType;
  entityType?: string;
  entityId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface DataExportOptions {
  includeUsers?: boolean;
  includeFamilies?: boolean;
  includeTrips?: boolean;
  includeLogs?: boolean;
  includeAttendance?: boolean;
  includeGear?: boolean;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Admin service for super-admin and administrative operations
 */
export const adminService = {
  /**
   * Update user role
   * Only SUPER_ADMIN can update roles
   */
  updateUserRole: async (userId: string, data: UpdateUserRoleData) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Validate that only adults can have TRIP_ADMIN or SUPER_ADMIN roles
    if (
      user.type !== UserType.ADULT &&
      (data.role === Role.TRIP_ADMIN || data.role === Role.SUPER_ADMIN)
    ) {
      throw new ApiError(
        400,
        'Only adult users can be assigned TRIP_ADMIN or SUPER_ADMIN roles',
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: data.role,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        familyId: true,
        type: true,
        name: true,
        email: true,
        role: true,
        profilePhotoUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  },

  /**
   * Get all users with their roles
   * Only SUPER_ADMIN can view all users
   */
  getAllUsers: async (filters?: { role?: Role; type?: UserType }) => {
    const where: Prisma.UserWhereInput = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        familyId: true,
        type: true,
        name: true,
        email: true,
        age: true,
        role: true,
        profilePhotoUrl: true,
        createdAt: true,
        updatedAt: true,
        family: {
          select: {
            id: true,
            name: true,
            status: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ type: 'asc' }, { createdAt: 'desc' }],
    });

    return users;
  },

  /**
   * Get system-wide dashboard metrics
   */
  getDashboardMetrics: async (): Promise<SystemMetrics> => {
    const now = new Date();

    // Trip metrics
    const [
      totalTrips,
      draftTrips,
      publishedTrips,
      upcomingTrips,
      ongoingTrips,
      pastTrips,
    ] = await Promise.all([
      prisma.trip.count(),
      prisma.trip.count({ where: { draft: true } }),
      prisma.trip.count({ where: { draft: false } }),
      prisma.trip.count({ where: { draft: false, startDate: { gt: now } } }),
      prisma.trip.count({
        where: {
          draft: false,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
      prisma.trip.count({ where: { draft: false, endDate: { lt: now } } }),
    ]);

    // Family metrics
    const [
      totalFamilies,
      pendingFamilies,
      approvedFamilies,
      activeFamilies,
      inactiveFamilies,
    ] = await Promise.all([
      prisma.family.count(),
      prisma.family.count({ where: { status: FamilyStatus.PENDING } }),
      prisma.family.count({ where: { status: FamilyStatus.APPROVED } }),
      prisma.family.count({ where: { isActive: true } }),
      prisma.family.count({ where: { isActive: false } }),
    ]);

    // User metrics
    const [
      totalUsers,
      adults,
      children,
      superAdmins,
      tripAdmins,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { type: UserType.ADULT } }),
      prisma.user.count({ where: { type: UserType.CHILD } }),
      prisma.user.count({ where: { role: Role.SUPER_ADMIN } }),
      prisma.user.count({ where: { role: Role.TRIP_ADMIN } }),
    ]);

    // Attendance metrics
    const totalAttendances = await prisma.tripAttendance.count();
    const tripsWithAttendance = await prisma.trip.count({
      where: {
        attendees: {
          some: {},
        },
      },
    });

    const averageAttendancePerTrip =
      tripsWithAttendance > 0 ? totalAttendances / tripsWithAttendance : 0;

    return {
      trips: {
        total: totalTrips,
        draft: draftTrips,
        published: publishedTrips,
        upcoming: upcomingTrips,
        ongoing: ongoingTrips,
        past: pastTrips,
      },
      families: {
        total: totalFamilies,
        pending: pendingFamilies,
        approved: approvedFamilies,
        active: activeFamilies,
        inactive: inactiveFamilies,
      },
      users: {
        total: totalUsers,
        adults,
        children,
        superAdmins,
        tripAdmins,
      },
      attendance: {
        totalAttendances,
        averageAttendancePerTrip: Math.round(averageAttendancePerTrip * 10) / 10,
      },
    };
  },

  /**
   * Get detailed trip statistics
   */
  getTripStats: async (filters?: {
    draft?: boolean;
    startDateFrom?: Date;
    startDateTo?: Date;
  }): Promise<TripStats[]> => {
    const where: Prisma.TripWhereInput = {};

    if (filters?.draft !== undefined) {
      where.draft = filters.draft;
    }

    if (filters?.startDateFrom || filters?.startDateTo) {
      where.startDate = {};
      if (filters.startDateFrom) {
        where.startDate.gte = filters.startDateFrom;
      }
      if (filters.startDateTo) {
        where.startDate.lte = filters.startDateTo;
      }
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendees: true,
        gearItems: {
          include: {
            assignments: true,
          },
        },
        scheduleItems: true,
      },
      orderBy: {
        startDate: 'desc',
      },
    });

    return trips.map((trip) => ({
      id: trip.id,
      name: trip.name,
      location: trip.location,
      startDate: trip.startDate,
      endDate: trip.endDate,
      draft: trip.draft,
      attendeeCount: trip.attendees.length,
      gearItemsCount: trip.gearItems.length,
      totalGearAssignments: trip.gearItems.reduce(
        (sum, item) => sum + item.assignments.length,
        0,
      ),
      scheduleItemsCount: trip.scheduleItems.length,
      admins: trip.admins,
    }));
  },

  /**
   * Get detailed family statistics
   */
  getFamilyStats: async (filters?: {
    status?: FamilyStatus;
    isActive?: boolean;
  }): Promise<FamilyStats[]> => {
    const where: Prisma.FamilyWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const families = await prisma.family.findMany({
      where,
      include: {
        members: true,
        tripsAttending: true,
        gearAssignments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return families.map((family) => ({
      id: family.id,
      name: family.name,
      status: family.status,
      isActive: family.isActive,
      memberCount: family.members.length,
      adultsCount: family.members.filter((m) => m.type === UserType.ADULT)
        .length,
      childrenCount: family.members.filter((m) => m.type === UserType.CHILD)
        .length,
      tripsAttendedCount: family.tripsAttending.length,
      gearAssignmentsCount: family.gearAssignments.length,
      createdAt: family.createdAt,
    }));
  },

  /**
   * Get user activity logs with filters
   */
  getActivityLogs: async (filters?: ActivityLogFilters) => {
    const where: Prisma.LogWhereInput = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.actionType) {
      where.actionType = filters.actionType;
    }

    if (filters?.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters?.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    const logs = await prisma.log.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: filters?.limit || 100,
      skip: filters?.offset || 0,
    });

    const totalCount = await prisma.log.count({ where });

    return {
      logs,
      totalCount,
      limit: filters?.limit || 100,
      offset: filters?.offset || 0,
    };
  },

  /**
   * Get activity logs for a specific user
   */
  getUserActivityLogs: async (
    userId: string,
    filters?: Omit<ActivityLogFilters, 'userId'>,
  ) => {
    return adminService.getActivityLogs({
      ...filters,
      userId,
    });
  },

  /**
   * Get activity logs for a specific entity
   */
  getEntityActivityLogs: async (
    entityType: string,
    entityId: string,
    filters?: Omit<ActivityLogFilters, 'entityType' | 'entityId'>,
  ) => {
    return adminService.getActivityLogs({
      ...filters,
      entityType,
      entityId,
    });
  },

  /**
   * Export system data to JSON
   */
  exportData: async (options: DataExportOptions = {}) => {
    const {
      includeUsers = true,
      includeFamilies = true,
      includeTrips = true,
      includeLogs = false,
      includeAttendance = true,
      includeGear = true,
      startDate,
      endDate,
    } = options;

    const exportData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      filters: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    };

    // Build date filter condition
    const buildDateFilter = () => {
      const filter: { gte?: Date; lte?: Date } = {};
      if (startDate) {
        filter.gte = startDate;
      }
      if (endDate) {
        filter.lte = endDate;
      }
      return filter;
    };

    const hasDateFilter = startDate || endDate;

    if (includeUsers) {
      exportData.users = await prisma.user.findMany({
        where: hasDateFilter ? { createdAt: buildDateFilter() } : undefined,
        select: {
          id: true,
          familyId: true,
          type: true,
          name: true,
          email: true,
          age: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    if (includeFamilies) {
      exportData.families = await prisma.family.findMany({
        where: hasDateFilter ? { createdAt: buildDateFilter() } : undefined,
        include: {
          members: {
            select: {
              id: true,
              type: true,
              name: true,
              age: true,
              email: true,
              role: true,
            },
          },
        },
      });
    }

    if (includeTrips) {
      const tripFilter: Prisma.TripWhereInput = {};
      if (startDate || endDate) {
        tripFilter.startDate = buildDateFilter();
      }

      exportData.trips = await prisma.trip.findMany({
        where: Object.keys(tripFilter).length > 0 ? tripFilter : undefined,
        include: {
          admins: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          gearItems: includeGear
            ? {
                include: {
                  assignments: true,
                },
              }
            : false,
          scheduleItems: true,
        },
      });
    }

    if (includeAttendance) {
      exportData.attendance = await prisma.tripAttendance.findMany({
        where: hasDateFilter ? { createdAt: buildDateFilter() } : undefined,
        include: {
          trip: {
            select: {
              id: true,
              name: true,
              startDate: true,
            },
          },
          family: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    if (includeGear && !includeTrips) {
      exportData.gearItems = await prisma.gearItem.findMany({
        include: {
          trip: {
            select: {
              id: true,
              name: true,
            },
          },
          assignments: {
            include: {
              family: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    }

    if (includeLogs) {
      const logFilter: Prisma.LogWhereInput = {};
      if (startDate || endDate) {
        logFilter.timestamp = buildDateFilter();
      }

      exportData.logs = await prisma.log.findMany({
        where: Object.keys(logFilter).length > 0 ? logFilter : undefined,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });
    }

    return exportData;
  },

  /**
   * Get pending families awaiting approval
   */
  getPendingFamilies: async () => {
    const families = await prisma.family.findMany({
      where: {
        status: FamilyStatus.PENDING,
      },
      include: {
        members: {
          select: {
            id: true,
            type: true,
            name: true,
            age: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return families;
  },

  /**
   * Bulk approve families
   */
  bulkApproveFamilies: async (familyIds: string[]) => {
    // Validate all family IDs exist and are pending
    const families = await prisma.family.findMany({
      where: {
        id: { in: familyIds },
      },
    });

    if (families.length !== familyIds.length) {
      throw new ApiError(400, 'One or more family IDs are invalid');
    }

    const nonPendingFamilies = families.filter(
      (f) => f.status !== FamilyStatus.PENDING,
    );

    if (nonPendingFamilies.length > 0) {
      throw new ApiError(
        400,
        `The following families are not pending: ${nonPendingFamilies.map((f) => f.id).join(', ')}`,
      );
    }

    // Approve all families
    await prisma.family.updateMany({
      where: {
        id: { in: familyIds },
      },
      data: {
        status: FamilyStatus.APPROVED,
        updatedAt: new Date(),
      },
    });

    return {
      message: `Successfully approved ${familyIds.length} families`,
      approvedIds: familyIds,
    };
  },

  /**
   * Bulk deactivate families
   */
  bulkDeactivateFamilies: async (familyIds: string[]) => {
    // Validate all family IDs exist
    const families = await prisma.family.findMany({
      where: {
        id: { in: familyIds },
      },
    });

    if (families.length !== familyIds.length) {
      throw new ApiError(400, 'One or more family IDs are invalid');
    }

    const alreadyInactiveFamilies = families.filter((f) => !f.isActive);

    if (alreadyInactiveFamilies.length > 0) {
      throw new ApiError(
        400,
        `The following families are already inactive: ${alreadyInactiveFamilies.map((f) => f.id).join(', ')}`,
      );
    }

    // Deactivate all families
    await prisma.family.updateMany({
      where: {
        id: { in: familyIds },
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return {
      message: `Successfully deactivated ${familyIds.length} families`,
      deactivatedIds: familyIds,
    };
  },

  /**
   * Get system statistics summary for quick overview
   */
  getSystemSummary: async () => {
    const metrics = await adminService.getDashboardMetrics();

    return {
      summary: {
        totalTrips: metrics.trips.total,
        upcomingTrips: metrics.trips.upcoming,
        totalFamilies: metrics.families.total,
        pendingFamilies: metrics.families.pending,
        totalUsers: metrics.users.total,
        totalAdmins: metrics.users.superAdmins + metrics.users.tripAdmins,
      },
      metrics,
    };
  },

  /**
   * Get attendance report for a specific trip
   */
  getTripAttendanceReport: async (tripId: string) => {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        attendees: {
          include: {
            family: {
              include: {
                members: {
                  select: {
                    id: true,
                    type: true,
                    name: true,
                    age: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    const totalFamilies = trip.attendees.length;
    const totalAdults = trip.attendees.reduce(
      (sum, att) =>
        sum + att.family.members.filter((m) => m.type === UserType.ADULT).length,
      0,
    );
    const totalChildren = trip.attendees.reduce(
      (sum, att) =>
        sum + att.family.members.filter((m) => m.type === UserType.CHILD).length,
      0,
    );

    const familiesWithDietaryRequirements = trip.attendees.filter(
      (att) => att.dietaryRequirements,
    ).length;

    return {
      tripId: trip.id,
      tripName: trip.name,
      startDate: trip.startDate,
      endDate: trip.endDate,
      stats: {
        totalFamilies,
        totalAdults,
        totalChildren,
        totalParticipants: totalAdults + totalChildren,
        familiesWithDietaryRequirements,
      },
      attendees: trip.attendees.map((att) => ({
        familyId: att.familyId,
        familyName: att.family.name,
        adults: att.family.members.filter((m) => m.type === UserType.ADULT)
          .length,
        children: att.family.members.filter((m) => m.type === UserType.CHILD)
          .length,
        dietaryRequirements: att.dietaryRequirements,
      })),
    };
  },
};
