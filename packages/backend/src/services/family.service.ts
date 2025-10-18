import { prisma } from '../utils/db.js';
import { FamilyStatus, UserType, Prisma, Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';

export interface CreateFamilyData {
  name?: string;
  adults: Array<{
    name: string;
    email: string;
    passwordHash?: string;
    oauthProvider?: string;
    oauthProviderId?: string;
    profilePhotoUrl?: string;
  }>;
  children?: Array<{
    name: string;
    age: number;
  }>;
}

export interface UpdateFamilyData {
  name?: string;
}

export interface AddMemberData {
  type: UserType;
  name: string;
  age?: number;
  email?: string;
  passwordHash?: string;
  oauthProvider?: string;
  oauthProviderId?: string;
  profilePhotoUrl?: string;
}

export interface UpdateMemberData {
  name?: string;
  age?: number;
  email?: string;
  profilePhotoUrl?: string;
}

export interface FamilyFilters {
  status?: FamilyStatus;
  isActive?: boolean;
}

/**
 * Family service for managing family entities
 */
export const familyService = {
  /**
   * Create a new family with members
   */
  createFamily: async (data: CreateFamilyData) => {
    const { name, adults, children = [] } = data;

    // Validate at least one adult is provided
    if (!adults || adults.length === 0) {
      throw new ApiError(
        400,
        'At least one adult is required to create a family',
      );
    }

    // Check if any adult email already exists
    const existingEmails = await prisma.user.findMany({
      where: {
        email: {
          in: adults.map((a) => a.email),
        },
      },
    });

    if (existingEmails.length > 0) {
      throw new ApiError(
        400,
        `Email already exists: ${existingEmails.map((u) => u.email).join(', ')}`,
      );
    }

    // Create family with members in a transaction
    const family = await prisma.family.create({
      data: {
        name,
        status: FamilyStatus.PENDING,
        isActive: true,
        members: {
          create: [
            ...adults.map((adult) => ({
              type: UserType.ADULT,
              name: adult.name,
              email: adult.email,
              passwordHash: adult.passwordHash,
              oauthProvider: adult.oauthProvider,
              oauthProviderId: adult.oauthProviderId,
              profilePhotoUrl: adult.profilePhotoUrl,
            })),
            ...children.map((child) => ({
              type: UserType.CHILD,
              name: child.name,
              age: child.age,
              email: `${child.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}@child.local`,
            })),
          ],
        },
      },
      include: {
        members: true,
      },
    });

    return family;
  },

  /**
   * Get family by ID
   * Authorization: FAMILY users can only view their own family
   */
  getFamilyById: async (id: string, userId?: string, userRole?: Role) => {
    const family = await prisma.family.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            id: true,
            type: true,
            name: true,
            age: true,
            email: true,
            profilePhotoUrl: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

    // Check authorization if userId and userRole are provided
    if (userId && userRole) {
      if (userRole === Role.FAMILY) {
        // Get user's family to verify access
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { familyId: true },
        });

        if (!user) {
          throw new ApiError(404, 'User not found');
        }

        if (user.familyId !== id) {
          throw new ApiError(403, 'You can only access your own family');
        }
      }
      // TRIP_ADMIN and SUPER_ADMIN can access any family
    }

    return family;
  },

  /**
   * Get all families with optional filters
   */
  getAllFamilies: async (filters?: FamilyFilters) => {
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
        members: {
          select: {
            id: true,
            type: true,
            name: true,
            age: true,
            email: true,
            profilePhotoUrl: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return families;
  },

  /**
   * Get families attending trips that a specific trip admin manages
   * Trip admins should only see families registered for their trips
   */
  getFamiliesForTripAdmin: async (
    tripAdminId: string,
    filters?: FamilyFilters,
  ) => {
    const where: Prisma.FamilyWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // Get families that are attending trips managed by this admin
    where.tripsAttending = {
      some: {
        trip: {
          admins: {
            some: {
              id: tripAdminId,
            },
          },
        },
      },
    };

    const families = await prisma.family.findMany({
      where,
      include: {
        members: {
          select: {
            id: true,
            type: true,
            name: true,
            age: true,
            email: true,
            profilePhotoUrl: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return families;
  },

  /**
   * Update family details
   * Authorization: FAMILY users can only update their own family
   */
  updateFamily: async (
    id: string,
    data: UpdateFamilyData,
    userId: string,
    userRole: Role,
  ) => {
    // Check if family exists
    const existingFamily = await prisma.family.findUnique({
      where: { id },
    });

    if (!existingFamily) {
      throw new ApiError(404, 'Family not found');
    }

    // Check authorization
    if (userRole === Role.FAMILY) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { familyId: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (user.familyId !== id) {
        throw new ApiError(403, 'You can only update your own family');
      }
    }
    // SUPER_ADMIN can update any family

    const updatedFamily = await prisma.family.update({
      where: { id },
      data: {
        name: data.name,
        updatedAt: new Date(),
      },
      include: {
        members: {
          select: {
            id: true,
            type: true,
            name: true,
            age: true,
            email: true,
            profilePhotoUrl: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return updatedFamily;
  },

  /**
   * Approve family (Super-admin only)
   */
  approveFamily: async (id: string) => {
    const family = await prisma.family.findUnique({
      where: { id },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

    if (family.status === FamilyStatus.APPROVED) {
      throw new ApiError(400, 'Family is already approved');
    }

    const approvedFamily = await prisma.family.update({
      where: { id },
      data: {
        status: FamilyStatus.APPROVED,
        updatedAt: new Date(),
      },
      include: {
        members: {
          select: {
            id: true,
            type: true,
            name: true,
            age: true,
            email: true,
            profilePhotoUrl: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return approvedFamily;
  },

  /**
   * Deactivate family (soft delete)
   */
  deactivateFamily: async (id: string) => {
    const family = await prisma.family.findUnique({
      where: { id },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

    if (!family.isActive) {
      throw new ApiError(400, 'Family is already deactivated');
    }

    const deactivatedFamily = await prisma.family.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
      include: {
        members: {
          select: {
            id: true,
            type: true,
            name: true,
            age: true,
            email: true,
            profilePhotoUrl: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return deactivatedFamily;
  },

  /**
   * Reactivate family
   */
  reactivateFamily: async (id: string) => {
    const family = await prisma.family.findUnique({
      where: { id },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

    if (family.isActive) {
      throw new ApiError(400, 'Family is already active');
    }

    const reactivatedFamily = await prisma.family.update({
      where: { id },
      data: {
        isActive: true,
        updatedAt: new Date(),
      },
      include: {
        members: {
          select: {
            id: true,
            type: true,
            name: true,
            age: true,
            email: true,
            profilePhotoUrl: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return reactivatedFamily;
  },

  /**
   * Delete family permanently
   */
  deleteFamily: async (id: string) => {
    const family = await prisma.family.findUnique({
      where: { id },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

    await prisma.family.delete({
      where: { id },
    });

    return { message: 'Family deleted successfully' };
  },

  /**
   * Add a member to a family
   * Authorization: FAMILY users can only add to their own family
   */
  addMember: async (
    familyId: string,
    memberData: AddMemberData,
    userId: string,
    userRole: Role,
  ) => {
    // Check if family exists
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

    // Check authorization
    if (userRole === Role.FAMILY) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { familyId: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (user.familyId !== familyId) {
        throw new ApiError(403, 'You can only add members to your own family');
      }
    }
    // SUPER_ADMIN can add to any family

    // Validate adult member has email
    if (memberData.type === UserType.ADULT && !memberData.email) {
      throw new ApiError(400, 'Adult members must have an email');
    }

    // Validate child member has age
    if (memberData.type === UserType.CHILD && !memberData.age) {
      throw new ApiError(400, 'Child members must have an age');
    }

    // Check if email already exists (for adults)
    if (memberData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: memberData.email },
      });

      if (existingUser) {
        throw new ApiError(400, 'Email already exists');
      }
    }

    // Generate email for child if not provided
    const email =
      memberData.email ||
      `${memberData.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}@child.local`;

    const member = await prisma.user.create({
      data: {
        familyId,
        type: memberData.type,
        name: memberData.name,
        age: memberData.age,
        email,
        passwordHash: memberData.passwordHash,
        oauthProvider: memberData.oauthProvider,
        oauthProviderId: memberData.oauthProviderId,
        profilePhotoUrl: memberData.profilePhotoUrl,
      },
    });

    return member;
  },

  /**
   * Update a family member
   * Authorization: FAMILY users can only update members in their own family
   */
  updateMember: async (
    familyId: string,
    memberId: string,
    memberData: UpdateMemberData,
    userId: string,
    userRole: Role,
  ) => {
    // Check if member exists and belongs to the family
    const member = await prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new ApiError(404, 'Member not found');
    }

    if (member.familyId !== familyId) {
      throw new ApiError(403, 'Member does not belong to this family');
    }

    // Check authorization
    if (userRole === Role.FAMILY) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { familyId: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (user.familyId !== familyId) {
        throw new ApiError(
          403,
          'You can only update members in your own family',
        );
      }
    }
    // SUPER_ADMIN can update any member

    // Check if email is being updated and already exists
    if (memberData.email && memberData.email !== member.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: memberData.email },
      });

      if (existingUser) {
        throw new ApiError(400, 'Email already exists');
      }
    }

    const updatedMember = await prisma.user.update({
      where: { id: memberId },
      data: {
        name: memberData.name,
        age: memberData.age,
        email: memberData.email,
        profilePhotoUrl: memberData.profilePhotoUrl,
        updatedAt: new Date(),
      },
    });

    return updatedMember;
  },

  /**
   * Remove a member from a family
   * Authorization: FAMILY users can only remove members from their own family
   */
  removeMember: async (
    familyId: string,
    memberId: string,
    userId: string,
    userRole: Role,
  ) => {
    // Check if member exists and belongs to the family
    const member = await prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new ApiError(404, 'Member not found');
    }

    if (member.familyId !== familyId) {
      throw new ApiError(403, 'Member does not belong to this family');
    }

    // Check authorization
    if (userRole === Role.FAMILY) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { familyId: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (user.familyId !== familyId) {
        throw new ApiError(
          403,
          'You can only remove members from your own family',
        );
      }
    }
    // SUPER_ADMIN can remove any member

    // Check if this is the last adult in the family
    const adultCount = await prisma.user.count({
      where: {
        familyId,
        type: UserType.ADULT,
      },
    });

    if (member.type === UserType.ADULT && adultCount <= 1) {
      throw new ApiError(400, 'Cannot remove the last adult from a family');
    }

    await prisma.user.delete({
      where: { id: memberId },
    });

    return { message: 'Member removed successfully' };
  },

  /**
   * Get family members
   * Authorization: FAMILY users can only view their own family members
   */
  getFamilyMembers: async (
    familyId: string,
    userId: string,
    userRole: Role,
  ) => {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

    // Check authorization
    if (userRole === Role.FAMILY) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { familyId: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (user.familyId !== familyId) {
        throw new ApiError(403, 'You can only access your own family members');
      }
    }
    // TRIP_ADMIN and SUPER_ADMIN can view any family members

    const members = await prisma.user.findMany({
      where: { familyId },
      select: {
        id: true,
        type: true,
        name: true,
        age: true,
        email: true,
        profilePhotoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
    });

    return members;
  },

  /**
   * Get adults in a family
   * Authorization: FAMILY users can only view their own family adults
   */
  getFamilyAdults: async (familyId: string, userId: string, userRole: Role) => {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

    // Check authorization
    if (userRole === Role.FAMILY) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { familyId: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (user.familyId !== familyId) {
        throw new ApiError(403, 'You can only access your own family members');
      }
    }
    // TRIP_ADMIN and SUPER_ADMIN can view any family

    const adults = await prisma.user.findMany({
      where: {
        familyId,
        type: UserType.ADULT,
      },
      select: {
        id: true,
        type: true,
        name: true,
        email: true,
        profilePhotoUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return adults;
  },

  /**
   * Get children in a family
   * Authorization: FAMILY users can only view their own family children
   */
  getFamilyChildren: async (
    familyId: string,
    userId: string,
    userRole: Role,
  ) => {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

    // Check authorization
    if (userRole === Role.FAMILY) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { familyId: true },
      });

      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      if (user.familyId !== familyId) {
        throw new ApiError(403, 'You can only access your own family members');
      }
    }
    // TRIP_ADMIN and SUPER_ADMIN can view any family

    const children = await prisma.user.findMany({
      where: {
        familyId,
        type: UserType.CHILD,
      },
      select: {
        id: true,
        type: true,
        name: true,
        age: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { age: 'desc' },
    });

    return children;
  },
};
