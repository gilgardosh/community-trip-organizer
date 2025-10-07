import { prisma } from '../utils/db.js';
import { Prisma, Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';

export interface CreateTripData {
  name: string;
  location: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  attendanceCutoffDate?: Date;
  photoAlbumLink?: string;
}

export interface UpdateTripData {
  name?: string;
  location?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  attendanceCutoffDate?: Date;
  photoAlbumLink?: string;
}

export interface TripFilters {
  draft?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
  includePast?: boolean;
}

export interface AssignAdminsData {
  adminIds: string[];
}

export interface MarkAttendanceData {
  familyId: string;
  attending: boolean;
}

/**
 * Trip service for managing trip entities
 */
export const tripService = {
  /**
   * Create a new trip (draft mode by default)
   * Only TRIP_ADMIN and SUPER_ADMIN can create trips
   */
  createTrip: async (data: CreateTripData) => {
    const {
      name,
      location,
      description,
      startDate,
      endDate,
      attendanceCutoffDate,
      photoAlbumLink,
    } = data;

    // Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      throw new ApiError(400, 'End date must be after start date');
    }

    if (
      attendanceCutoffDate &&
      new Date(attendanceCutoffDate) > new Date(startDate)
    ) {
      throw new ApiError(
        400,
        'Attendance cutoff date must be before trip start date',
      );
    }

    // Create trip in draft mode
    const trip = await prisma.trip.create({
      data: {
        name,
        location,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        attendanceCutoffDate: attendanceCutoffDate
          ? new Date(attendanceCutoffDate)
          : null,
        photoAlbumLink,
        draft: true, // Always create in draft mode
      },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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
        gearItems: true,
      },
    });

    return trip;
  },

  /**
   * Get trip by ID
   * Returns trip based on user role and access level
   */
  getTripById: async (id: string, userId: string, userRole: Role) => {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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
        gearItems: {
          include: {
            assignments: {
              include: {
                family: {
                  include: {
                    members: {
                      select: {
                        id: true,
                        type: true,
                        name: true,
                      },
                    },
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

    // Draft trips are only visible to admins and super-admins
    if (trip.draft) {
      const isTripAdmin = trip.admins.some((admin) => admin.id === userId);
      if (userRole !== Role.SUPER_ADMIN && !isTripAdmin) {
        throw new ApiError(
          403,
          'Draft trips are only visible to trip admins and super-admins',
        );
      }
    }

    // Trip admins can only see trips they manage
    if (userRole === Role.TRIP_ADMIN) {
      const isTripAdmin = trip.admins.some((admin) => admin.id === userId);
      if (!isTripAdmin) {
        throw new ApiError(403, 'You can only view trips you manage');
      }
    }

    return trip;
  },

  /**
   * Get all trips with optional filters
   * Returns trips based on user role
   */
  getAllTrips: async (
    userId: string,
    userRole: Role,
    filters?: TripFilters,
  ) => {
    const where: Prisma.TripWhereInput = {};

    // Handle draft filter based on role
    if (userRole === Role.FAMILY) {
      // Families can only see published trips
      where.draft = false;
    } else if (filters?.draft !== undefined) {
      // Admins and super-admins can filter by draft status
      where.draft = filters.draft;
    }

    // Trip admins can only see their own trips
    if (userRole === Role.TRIP_ADMIN) {
      where.admins = {
        some: {
          id: userId,
        },
      };
    }

    // Date filters
    if (filters?.startDateFrom || filters?.startDateTo) {
      where.startDate = {};
      if (filters.startDateFrom) {
        where.startDate.gte = new Date(filters.startDateFrom);
      }
      if (filters.startDateTo) {
        where.startDate.lte = new Date(filters.startDateTo);
      }
    }

    // Exclude past trips unless explicitly requested
    if (!filters?.includePast) {
      const today = new Date();
      if (!where.startDate) {
        where.startDate = { gte: today };
      } else if (
        typeof where.startDate === 'object' &&
        !('gte' in where.startDate)
      ) {
        (where.startDate as { gte?: Date }).gte = today;
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
            role: true,
          },
        },
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
        gearItems: {
          include: {
            assignments: {
              include: {
                family: {
                  include: {
                    members: {
                      select: {
                        id: true,
                        type: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return trips;
  },

  /**
   * Update trip details
   * Only admins of the trip or super-admins can update
   */
  updateTrip: async (
    id: string,
    data: UpdateTripData,
    userId: string,
    userRole: Role,
  ) => {
    const existingTrip = await prisma.trip.findUnique({
      where: { id },
      include: {
        admins: true,
      },
    });

    if (!existingTrip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Check permissions
    const isTripAdmin = existingTrip.admins.some(
      (admin) => admin.id === userId,
    );
    if (userRole !== Role.SUPER_ADMIN && !isTripAdmin) {
      throw new ApiError(
        403,
        'Only trip admins and super-admins can update trips',
      );
    }

    // Validate dates if provided
    const startDate = data.startDate
      ? new Date(data.startDate)
      : existingTrip.startDate;
    const endDate = data.endDate
      ? new Date(data.endDate)
      : existingTrip.endDate;

    if (endDate < startDate) {
      throw new ApiError(400, 'End date must be after start date');
    }

    if (
      data.attendanceCutoffDate &&
      new Date(data.attendanceCutoffDate) > startDate
    ) {
      throw new ApiError(
        400,
        'Attendance cutoff date must be before trip start date',
      );
    }

    // Prevent updates to past trips
    if (
      new Date(existingTrip.startDate) < new Date() &&
      userRole !== Role.SUPER_ADMIN
    ) {
      throw new ApiError(400, 'Cannot update past trips');
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        attendanceCutoffDate: data.attendanceCutoffDate
          ? new Date(data.attendanceCutoffDate)
          : undefined,
        photoAlbumLink: data.photoAlbumLink,
        updatedAt: new Date(),
      },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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
        gearItems: {
          include: {
            assignments: {
              include: {
                family: {
                  include: {
                    members: {
                      select: {
                        id: true,
                        type: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return updatedTrip;
  },

  /**
   * Publish trip (remove from draft mode)
   * Only SUPER_ADMIN can publish trips
   */
  publishTrip: async (id: string) => {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        admins: true,
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    if (!trip.draft) {
      throw new ApiError(400, 'Trip is already published');
    }

    // Ensure trip has at least one admin before publishing
    if (trip.admins.length === 0) {
      throw new ApiError(
        400,
        'Trip must have at least one admin before publishing',
      );
    }

    const publishedTrip = await prisma.trip.update({
      where: { id },
      data: {
        draft: false,
        updatedAt: new Date(),
      },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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
        gearItems: true,
      },
    });

    return publishedTrip;
  },

  /**
   * Unpublish trip (set to draft mode)
   * Only SUPER_ADMIN can unpublish trips
   */
  unpublishTrip: async (id: string) => {
    const trip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    if (trip.draft) {
      throw new ApiError(400, 'Trip is already in draft mode');
    }

    const unpublishedTrip = await prisma.trip.update({
      where: { id },
      data: {
        draft: true,
        updatedAt: new Date(),
      },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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
        gearItems: true,
      },
    });

    return unpublishedTrip;
  },

  /**
   * Assign admins to a trip
   * Only SUPER_ADMIN can assign trip admins
   */
  assignAdmins: async (id: string, data: AssignAdminsData) => {
    const trip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Validate that all admin IDs exist and are adults
    const admins = await prisma.user.findMany({
      where: {
        id: { in: data.adminIds },
      },
    });

    if (admins.length !== data.adminIds.length) {
      throw new ApiError(400, 'One or more admin IDs are invalid');
    }

    // Ensure all admins are adults
    const nonAdults = admins.filter((admin) => admin.type !== 'ADULT');
    if (nonAdults.length > 0) {
      throw new ApiError(400, 'Only adults can be assigned as trip admins');
    }

    // Update trip admins
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        admins: {
          set: data.adminIds.map((adminId) => ({ id: adminId })),
        },
        updatedAt: new Date(),
      },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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
        gearItems: true,
      },
    });

    return updatedTrip;
  },

  /**
   * Add an admin to a trip
   * Only SUPER_ADMIN can add admins
   */
  addAdmin: async (id: string, adminId: string) => {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        admins: true,
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Check if admin is already assigned
    if (trip.admins.some((admin) => admin.id === adminId)) {
      throw new ApiError(400, 'Admin is already assigned to this trip');
    }

    // Validate admin exists and is an adult
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new ApiError(404, 'Admin not found');
    }

    if (admin.type !== 'ADULT') {
      throw new ApiError(400, 'Only adults can be assigned as trip admins');
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        admins: {
          connect: { id: adminId },
        },
        updatedAt: new Date(),
      },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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
        gearItems: true,
      },
    });

    return updatedTrip;
  },

  /**
   * Remove an admin from a trip
   * Only SUPER_ADMIN can remove admins
   */
  removeAdmin: async (id: string, adminId: string) => {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        admins: true,
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Check if admin is assigned
    if (!trip.admins.some((admin) => admin.id === adminId)) {
      throw new ApiError(400, 'Admin is not assigned to this trip');
    }

    // Prevent removing the last admin from a published trip
    if (!trip.draft && trip.admins.length <= 1) {
      throw new ApiError(
        400,
        'Cannot remove the last admin from a published trip',
      );
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        admins: {
          disconnect: { id: adminId },
        },
        updatedAt: new Date(),
      },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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
        gearItems: true,
      },
    });

    return updatedTrip;
  },

  /**
   * Mark family attendance for a trip
   * Families can mark their own attendance, admins can mark for any family
   */
  markAttendance: async (
    tripId: string,
    data: MarkAttendanceData,
    userId: string,
    userRole: Role,
  ) => {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        admins: true,
        attendees: true,
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Can't mark attendance for draft trips
    if (trip.draft) {
      throw new ApiError(400, 'Cannot mark attendance for draft trips');
    }

    // Check attendance cutoff date
    if (
      trip.attendanceCutoffDate &&
      new Date() > new Date(trip.attendanceCutoffDate)
    ) {
      throw new ApiError(400, 'Attendance cutoff date has passed');
    }

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { family: true },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const isTripAdmin = trip.admins.some((admin) => admin.id === userId);
    const isOwnFamily = user.familyId === data.familyId;

    if (userRole === Role.FAMILY && !isOwnFamily) {
      throw new ApiError(
        403,
        'You can only mark attendance for your own family',
      );
    }

    if (userRole === Role.TRIP_ADMIN && !isTripAdmin) {
      throw new ApiError(
        403,
        'You can only mark attendance for trips you manage',
      );
    }

    // Validate family exists
    const family = await prisma.family.findUnique({
      where: { id: data.familyId },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

    // Check if family is approved
    if (family.status !== 'APPROVED') {
      throw new ApiError(400, 'Only approved families can mark attendance');
    }

    // Check if family is active
    if (!family.isActive) {
      throw new ApiError(400, 'Only active families can mark attendance');
    }

    // Handle attendance
    if (data.attending) {
      // Add attendance
      await prisma.tripAttendance.upsert({
        where: {
          tripId_familyId: {
            tripId,
            familyId: data.familyId,
          },
        },
        create: {
          tripId,
          familyId: data.familyId,
        },
        update: {},
      });
    } else {
      // Remove attendance
      await prisma.tripAttendance
        .delete({
          where: {
            tripId_familyId: {
              tripId,
              familyId: data.familyId,
            },
          },
        })
        .catch(() => {
          // Ignore if attendance doesn't exist
        });
    }

    // Return updated trip
    const updatedTrip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        admins: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
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
        gearItems: {
          include: {
            assignments: {
              include: {
                family: {
                  include: {
                    members: {
                      select: {
                        id: true,
                        type: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return updatedTrip;
  },

  /**
   * Get trip attendees
   */
  getTripAttendees: async (tripId: string, userId: string, userRole: Role) => {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        admins: true,
      },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    // Check permissions for draft trips
    if (trip.draft) {
      const isTripAdmin = trip.admins.some((admin) => admin.id === userId);
      if (userRole !== Role.SUPER_ADMIN && !isTripAdmin) {
        throw new ApiError(
          403,
          'Draft trips are only visible to trip admins and super-admins',
        );
      }
    }

    const attendees = await prisma.tripAttendance.findMany({
      where: { tripId },
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
    });

    return attendees;
  },

  /**
   * Delete trip permanently
   * Only SUPER_ADMIN can delete trips
   */
  deleteTrip: async (id: string) => {
    const trip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!trip) {
      throw new ApiError(404, 'Trip not found');
    }

    await prisma.trip.delete({
      where: { id },
    });

    return { message: 'Trip deleted successfully' };
  },
};
