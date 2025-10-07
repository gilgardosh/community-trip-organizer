import { prisma } from '../utils/db.js';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';

export interface CreateGearItemData {
  tripId: string;
  name: string;
  quantityNeeded: number;
}

export interface UpdateGearItemData {
  name?: string;
  quantityNeeded?: number;
}

export interface AssignGearData {
  familyId: string;
  quantityAssigned: number;
}

export interface GearSummary {
  gearItemId: string;
  name: string;
  quantityNeeded: number;
  totalAssigned: number;
  assignments: Array<{
    familyId: string;
    familyName: string | null;
    quantityAssigned: number;
  }>;
}

/**
 * Gear service for managing gear items and assignments
 */
export const gearService = {
  /**
   * Create a new gear item for a trip
   * Only trip admins of the specific trip and SUPER_ADMIN can create gear items
   */
  createGearItem: async (
    data: CreateGearItemData,
    userId: string,
    userRole: Role,
  ) => {
    const { tripId, name, quantityNeeded } = data;

    // Validate quantity
    if (quantityNeeded <= 0) {
      throw new ApiError(400, 'Quantity needed must be greater than 0');
    }

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        admins: { select: { id: true } },
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Check authorization: must be trip admin or super admin
    const isTripAdmin = trip.admins.some((admin) => admin.id === userId);
    if (userRole !== Role.SUPER_ADMIN && !isTripAdmin) {
      throw new ApiError(403, 'You must be a trip admin to create gear items');
    }

    // Create gear item
    const gearItem = await prisma.gearItem.create({
      data: {
        tripId,
        name,
        quantityNeeded,
      },
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
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

    return gearItem;
  },

  /**
   * Get all gear items for a trip
   * All authenticated users can view gear for published trips
   * Trip admins and SUPER_ADMIN can view gear for their draft trips
   */
  getGearItemsByTripId: async (
    tripId: string,
    userId: string,
    userRole: Role,
  ) => {
    // Check if trip exists and user has access
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        admins: { select: { id: true } },
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Check access for draft trips
    if (trip.draft) {
      const isTripAdmin = trip.admins.some((admin) => admin.id === userId);
      if (userRole !== Role.SUPER_ADMIN && !isTripAdmin) {
        throw new ApiError(403, 'Cannot view gear for draft trips');
      }
    }

    // Get all gear items with assignments
    const gearItems = await prisma.gearItem.findMany({
      where: { tripId },
      include: {
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
      orderBy: { name: 'asc' },
    });

    return gearItems;
  },

  /**
   * Get gear item by ID
   */
  getGearItemById: async (id: string, userId: string, userRole: Role) => {
    const gearItem = await prisma.gearItem.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            admins: { select: { id: true } },
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

    if (!gearItem) {
      throw new ApiError(404, 'Gear item not found');
    }

    // Check access for draft trips
    if (gearItem.trip.draft) {
      const isTripAdmin = gearItem.trip.admins.some(
        (admin) => admin.id === userId,
      );
      if (userRole !== Role.SUPER_ADMIN && !isTripAdmin) {
        throw new ApiError(403, 'Cannot view gear for draft trips');
      }
    }

    return gearItem;
  },

  /**
   * Update gear item
   * Only trip admins of the specific trip and SUPER_ADMIN can update gear items
   */
  updateGearItem: async (
    id: string,
    data: UpdateGearItemData,
    userId: string,
    userRole: Role,
  ) => {
    // Validate quantity if provided
    if (data.quantityNeeded !== undefined && data.quantityNeeded <= 0) {
      throw new ApiError(400, 'Quantity needed must be greater than 0');
    }

    // Get gear item with trip and assignments
    const existingGearItem = await prisma.gearItem.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            admins: { select: { id: true } },
          },
        },
        assignments: true,
      },
    });

    if (!existingGearItem) {
      throw new ApiError(404, 'Gear item not found');
    }

    // Check authorization
    const isTripAdmin = existingGearItem.trip.admins.some(
      (admin) => admin.id === userId,
    );
    if (userRole !== Role.SUPER_ADMIN && !isTripAdmin) {
      throw new ApiError(403, 'You must be a trip admin to update gear items');
    }

    // Check if reducing quantity below total assigned
    if (data.quantityNeeded !== undefined) {
      const totalAssigned = existingGearItem.assignments.reduce(
        (sum, assignment) => sum + assignment.quantityAssigned,
        0,
      );

      if (data.quantityNeeded < totalAssigned) {
        throw new ApiError(
          400,
          `Cannot reduce quantity needed below total assigned (${totalAssigned})`,
        );
      }
    }

    // Update gear item
    const gearItem = await prisma.gearItem.update({
      where: { id },
      data,
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
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

    return gearItem;
  },

  /**
   * Delete gear item
   * Only trip admins of the specific trip and SUPER_ADMIN can delete gear items
   */
  deleteGearItem: async (id: string, userId: string, userRole: Role) => {
    const gearItem = await prisma.gearItem.findUnique({
      where: { id },
      include: {
        trip: {
          include: {
            admins: { select: { id: true } },
          },
        },
      },
    });

    if (!gearItem) {
      throw new ApiError(404, 'Gear item not found');
    }

    // Check authorization
    const isTripAdmin = gearItem.trip.admins.some(
      (admin) => admin.id === userId,
    );
    if (userRole !== Role.SUPER_ADMIN && !isTripAdmin) {
      throw new ApiError(403, 'You must be a trip admin to delete gear items');
    }

    // Delete gear item (assignments will be cascade deleted)
    await prisma.gearItem.delete({
      where: { id },
    });

    return { message: 'Gear item deleted successfully' };
  },

  /**
   * Assign gear to a family (volunteer)
   * Families can volunteer for their own gear, trip admins can assign to any family
   */
  assignGear: async (
    gearItemId: string,
    data: AssignGearData,
    userId: string,
    userRole: Role,
  ) => {
    const { familyId, quantityAssigned } = data;

    // Validate quantity
    if (quantityAssigned <= 0) {
      throw new ApiError(400, 'Quantity assigned must be greater than 0');
    }

    // Get gear item with trip info
    const gearItem = await prisma.gearItem.findUnique({
      where: { id: gearItemId },
      include: {
        trip: {
          include: {
            admins: { select: { id: true } },
          },
        },
        assignments: true,
      },
    });

    if (!gearItem) {
      throw new ApiError(404, 'Gear item not found');
    }

    // Check if trip has started
    if (new Date() > new Date(gearItem.trip.startDate)) {
      throw new ApiError(400, 'Cannot assign gear after trip has started');
    }

    // Get user's family
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check authorization: families can only assign to themselves
    const isTripAdmin = gearItem.trip.admins.some(
      (admin) => admin.id === userId,
    );
    if (
      userRole === Role.FAMILY &&
      user.familyId !== familyId &&
      !isTripAdmin
    ) {
      throw new ApiError(
        403,
        'Families can only volunteer for their own gear',
      );
    }

    // Check if family is attending the trip
    const attendance = await prisma.tripAttendance.findUnique({
      where: {
        tripId_familyId: {
          tripId: gearItem.trip.id,
          familyId,
        },
      },
    });

    if (!attendance) {
      throw new ApiError(
        400,
        'Family must be attending the trip to volunteer for gear',
      );
    }

    // Calculate total assigned quantity (excluding current family if updating)
    const totalAssigned = gearItem.assignments
      .filter((a) => a.familyId !== familyId)
      .reduce((sum, assignment) => sum + assignment.quantityAssigned, 0);

    // Check if total would exceed needed quantity
    if (totalAssigned + quantityAssigned > gearItem.quantityNeeded) {
      const available = gearItem.quantityNeeded - totalAssigned;
      throw new ApiError(
        400,
        `Cannot assign more than needed. Available: ${available}, Requested: ${quantityAssigned}`,
      );
    }

    // Use transaction to ensure consistency
    const assignment = await prisma.$transaction(async (tx) => {
      // Upsert assignment
      const assignment = await tx.gearAssignment.upsert({
        where: {
          gearItemId_familyId: {
            gearItemId,
            familyId,
          },
        },
        update: {
          quantityAssigned,
        },
        create: {
          gearItemId,
          familyId,
          quantityAssigned,
        },
        include: {
          gearItem: {
            select: {
              id: true,
              name: true,
              quantityNeeded: true,
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

      return assignment;
    });

    return assignment;
  },

  /**
   * Remove gear assignment from a family
   * Families can remove their own assignments, trip admins can remove any
   */
  removeGearAssignment: async (
    gearItemId: string,
    familyId: string,
    userId: string,
    userRole: Role,
  ) => {
    // Get gear item with trip info
    const gearItem = await prisma.gearItem.findUnique({
      where: { id: gearItemId },
      include: {
        trip: {
          include: {
            admins: { select: { id: true } },
          },
        },
      },
    });

    if (!gearItem) {
      throw new ApiError(404, 'Gear item not found');
    }

    // Check if trip has started
    if (new Date() > new Date(gearItem.trip.startDate)) {
      throw new ApiError(
        400,
        'Cannot remove gear assignment after trip has started',
      );
    }

    // Get user's family
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check authorization
    const isTripAdmin = gearItem.trip.admins.some(
      (admin) => admin.id === userId,
    );
    if (
      userRole === Role.FAMILY &&
      user.familyId !== familyId &&
      !isTripAdmin
    ) {
      throw new ApiError(
        403,
        'Families can only remove their own gear assignments',
      );
    }

    // Check if assignment exists
    const assignment = await prisma.gearAssignment.findUnique({
      where: {
        gearItemId_familyId: {
          gearItemId,
          familyId,
        },
      },
    });

    if (!assignment) {
      throw new ApiError(404, 'Gear assignment not found');
    }

    // Delete assignment
    await prisma.gearAssignment.delete({
      where: {
        gearItemId_familyId: {
          gearItemId,
          familyId,
        },
      },
    });

    return { message: 'Gear assignment removed successfully' };
  },

  /**
   * Get gear summary for a trip
   * Shows all gear items with assignment status
   */
  getGearSummary: async (tripId: string, userId: string, userRole: Role) => {
    // Check if trip exists and user has access
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        admins: { select: { id: true } },
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Check access for draft trips
    if (trip.draft) {
      const isTripAdmin = trip.admins.some((admin) => admin.id === userId);
      if (userRole !== Role.SUPER_ADMIN && !isTripAdmin) {
        throw new ApiError(403, 'Cannot view gear for draft trips');
      }
    }

    // Get all gear items with assignments
    const gearItems = await prisma.gearItem.findMany({
      where: { tripId },
      include: {
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
      orderBy: { name: 'asc' },
    });

    // Build summary
    const summary: GearSummary[] = gearItems.map((item) => {
      const totalAssigned = item.assignments.reduce(
        (sum, assignment) => sum + assignment.quantityAssigned,
        0,
      );

      return {
        gearItemId: item.id,
        name: item.name,
        quantityNeeded: item.quantityNeeded,
        totalAssigned,
        assignments: item.assignments.map((assignment) => ({
          familyId: assignment.familyId,
          familyName: assignment.family.name,
          quantityAssigned: assignment.quantityAssigned,
        })),
      };
    });

    return summary;
  },

  /**
   * Get family's gear assignments for a trip
   * Families can view their own, trip admins can view for any family
   */
  getFamilyGearAssignments: async (
    tripId: string,
    familyId: string,
    userId: string,
    userRole: Role,
  ) => {
    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        admins: { select: { id: true } },
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Get user's family
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { familyId: true },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check authorization
    const isTripAdmin = trip.admins.some((admin) => admin.id === userId);
    if (
      userRole === Role.FAMILY &&
      user.familyId !== familyId &&
      !isTripAdmin
    ) {
      throw new ApiError(403, 'Cannot view other families gear assignments');
    }

    // Get assignments
    const assignments = await prisma.gearAssignment.findMany({
      where: {
        familyId,
        gearItem: {
          tripId,
        },
      },
      include: {
        gearItem: {
          select: {
            id: true,
            name: true,
            quantityNeeded: true,
          },
        },
      },
    });

    return assignments;
  },
};
