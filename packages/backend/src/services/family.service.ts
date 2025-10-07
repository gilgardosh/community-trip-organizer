import { prisma } from '../utils/db.js';
import { FamilyStatus, UserType, Prisma } from '@prisma/client';
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
      throw new ApiError(400, 'At least one adult is required to create a family');
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
        `Email already exists: ${existingEmails.map((u) => u.email).join(', ')}`
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
   */
  getFamilyById: async (id: string) => {
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
   * Update family details
   */
  updateFamily: async (id: string, data: UpdateFamilyData) => {
    // Check if family exists
    const existingFamily = await prisma.family.findUnique({
      where: { id },
    });

    if (!existingFamily) {
      throw new ApiError(404, 'Family not found');
    }

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
   */
  addMember: async (familyId: string, memberData: AddMemberData) => {
    // Check if family exists
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

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
   */
  updateMember: async (familyId: string, memberId: string, memberData: UpdateMemberData) => {
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
   */
  removeMember: async (familyId: string, memberId: string) => {
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
   */
  getFamilyMembers: async (familyId: string) => {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

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
   */
  getFamilyAdults: async (familyId: string) => {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

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
   */
  getFamilyChildren: async (familyId: string) => {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
    });

    if (!family) {
      throw new ApiError(404, 'Family not found');
    }

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
