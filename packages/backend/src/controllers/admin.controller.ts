import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { familyService } from '../services/family.service.js';
import { tripService } from '../services/trip.service.js';
import { logService } from '../services/log.service.js';
import { ActionType, Role, User, UserType, FamilyStatus } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';

/**
 * Admin controller for super-admin and administrative operations
 */
export const adminController = {
  /**
   * Update user role
   * POST /api/admin/users/:userId/role
   */
  updateUserRole: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { role } = req.body as { role: Role };

      if (!role || !Object.values(Role).includes(role)) {
        throw new ApiError(400, 'Valid role is required');
      }

      const updatedUser = await adminService.updateUserRole(userId, { role });

      // Log the role change
      await logService.log(
        (req.user as User).id,
        ActionType.UPDATE,
        'User',
        userId,
        { role },
      );

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all users
   * GET /api/admin/users
   */
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role, type } = req.query;

      const users = await adminService.getAllUsers({
        role: role as Role | undefined,
        type: type as UserType | undefined,
      });

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get system dashboard metrics
   * GET /api/admin/metrics
   */
  getDashboardMetrics: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const metrics = await adminService.getDashboardMetrics();

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get system summary
   * GET /api/admin/summary
   */
  getSystemSummary: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const summary = await adminService.getSystemSummary();

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get trip statistics
   * GET /api/admin/stats/trips
   */
  getTripStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { draft, startDateFrom, startDateTo } = req.query;

      const stats = await adminService.getTripStats({
        draft: draft === 'true' ? true : draft === 'false' ? false : undefined,
        startDateFrom: startDateFrom
          ? new Date(startDateFrom as string)
          : undefined,
        startDateTo: startDateTo ? new Date(startDateTo as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get family statistics
   * GET /api/admin/stats/families
   */
  getFamilyStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, isActive } = req.query;

      const stats = await adminService.getFamilyStats({
        status: status as FamilyStatus | undefined,
        isActive:
          isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      });

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get trip attendance report
   * GET /api/admin/reports/trips/:tripId/attendance
   */
  getTripAttendanceReport: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tripId } = req.params;

      const report = await adminService.getTripAttendanceReport(tripId);

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get activity logs
   * GET /api/admin/logs
   */
  getActivityLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        userId,
        actionType,
        entityType,
        entityId,
        startDate,
        endDate,
        limit,
        offset,
      } = req.query;

      const logs = await adminService.getActivityLogs({
        userId: userId as string | undefined,
        actionType: actionType as ActionType | undefined,
        entityType: entityType as string | undefined,
        entityId: entityId as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get activity logs for a specific user
   * GET /api/admin/users/:userId/logs
   */
  getUserActivityLogs: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { userId } = req.params;
      const { actionType, entityType, startDate, endDate, limit, offset } =
        req.query;

      const logs = await adminService.getUserActivityLogs(userId, {
        actionType: actionType as ActionType | undefined,
        entityType: entityType as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get activity logs for a specific entity
   * GET /api/admin/logs/:entityType/:entityId
   */
  getEntityActivityLogs: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { entityType, entityId } = req.params;
      const { startDate, endDate, limit, offset } = req.query;

      const logs = await adminService.getEntityActivityLogs(
        entityType,
        entityId,
        {
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
          limit: limit ? parseInt(limit as string) : undefined,
          offset: offset ? parseInt(offset as string) : undefined,
        },
      );

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Export system data
   * POST /api/admin/export
   */
  exportData: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        includeUsers,
        includeFamilies,
        includeTrips,
        includeLogs,
        includeAttendance,
        includeGear,
        startDate,
        endDate,
      } = req.body as {
        includeUsers?: boolean;
        includeFamilies?: boolean;
        includeTrips?: boolean;
        includeLogs?: boolean;
        includeAttendance?: boolean;
        includeGear?: boolean;
        startDate?: string;
        endDate?: string;
      };

      const exportData = await adminService.exportData({
        includeUsers: includeUsers !== false,
        includeFamilies: includeFamilies !== false,
        includeTrips: includeTrips !== false,
        includeLogs: includeLogs === true,
        includeAttendance: includeAttendance !== false,
        includeGear: includeGear !== false,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });

      // Log the export
      await logService.log(
        (req.user as User).id,
        ActionType.CREATE,
        'DataExport',
        'export',
        {
          includeUsers: includeUsers !== false,
          includeFamilies: includeFamilies !== false,
          includeTrips: includeTrips !== false,
          includeLogs: includeLogs === true,
          includeAttendance: includeAttendance !== false,
          includeGear: includeGear !== false,
        },
      );

      res.status(200).json({
        success: true,
        data: exportData,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get pending families
   * GET /api/admin/families/pending
   */
  getPendingFamilies: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const families = await adminService.getPendingFamilies();

      res.status(200).json({
        success: true,
        data: families,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Approve family
   * POST /api/admin/families/:familyId/approve
   */
  approveFamily: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { familyId } = req.params;

      const family = await familyService.approveFamily(familyId);

      // Log the approval
      await logService.log(
        (req.user as User).id,
        ActionType.UPDATE,
        'Family',
        familyId,
        { status: 'APPROVED' },
      );

      res.status(200).json({
        success: true,
        data: family,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bulk approve families
   * POST /api/admin/families/bulk-approve
   */
  bulkApproveFamilies: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { familyIds } = req.body as { familyIds: string[] };

      if (!Array.isArray(familyIds) || familyIds.length === 0) {
        throw new ApiError(
          400,
          'familyIds must be a non-empty array of family IDs',
        );
      }

      const result = await adminService.bulkApproveFamilies(familyIds);

      // Log the bulk approval
      await logService.log(
        (req.user as User).id,
        ActionType.UPDATE,
        'Family',
        'bulk',
        { approvedIds: familyIds },
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Deactivate family
   * POST /api/admin/families/:familyId/deactivate
   */
  deactivateFamily: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { familyId } = req.params;

      const family = await familyService.deactivateFamily(familyId);

      // Log the deactivation
      await logService.log(
        (req.user as User).id,
        ActionType.UPDATE,
        'Family',
        familyId,
        { isActive: false },
      );

      res.status(200).json({
        success: true,
        data: family,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reactivate family
   * POST /api/admin/families/:familyId/reactivate
   */
  reactivateFamily: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { familyId } = req.params;

      const family = await familyService.reactivateFamily(familyId);

      // Log the reactivation
      await logService.log(
        (req.user as User).id,
        ActionType.UPDATE,
        'Family',
        familyId,
        { isActive: true },
      );

      res.status(200).json({
        success: true,
        data: family,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Bulk deactivate families
   * POST /api/admin/families/bulk-deactivate
   */
  bulkDeactivateFamilies: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { familyIds } = req.body as { familyIds: string[] };

      if (!Array.isArray(familyIds) || familyIds.length === 0) {
        throw new ApiError(
          400,
          'familyIds must be a non-empty array of family IDs',
        );
      }

      const result = await adminService.bulkDeactivateFamilies(familyIds);

      // Log the bulk deactivation
      await logService.log(
        (req.user as User).id,
        ActionType.UPDATE,
        'Family',
        'bulk',
        { deactivatedIds: familyIds },
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete family
   * DELETE /api/admin/families/:familyId
   */
  deleteFamily: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { familyId } = req.params;

      const result = await familyService.deleteFamily(familyId);

      // Log the deletion
      await logService.log(
        (req.user as User).id,
        ActionType.DELETE,
        'Family',
        familyId,
        {},
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Publish trip
   * POST /api/admin/trips/:tripId/publish
   */
  publishTrip: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId } = req.params;

      const trip = await tripService.publishTrip(tripId);

      // Log the publication
      await logService.log(
        (req.user as User).id,
        ActionType.UPDATE,
        'Trip',
        tripId,
        { draft: false },
      );

      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Unpublish trip
   * POST /api/admin/trips/:tripId/unpublish
   */
  unpublishTrip: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId } = req.params;

      const trip = await tripService.unpublishTrip(tripId);

      // Log the unpublication
      await logService.log(
        (req.user as User).id,
        ActionType.UPDATE,
        'Trip',
        tripId,
        { draft: true },
      );

      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Assign admins to trip
   * POST /api/admin/trips/:tripId/admins
   */
  assignTripAdmins: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tripId } = req.params;
      const { adminIds } = req.body as { adminIds: string[] };

      if (!Array.isArray(adminIds)) {
        throw new ApiError(400, 'adminIds must be an array');
      }

      const trip = await tripService.assignAdmins(tripId, { adminIds });

      // Log the admin assignment
      await logService.log(
        (req.user as User).id,
        ActionType.UPDATE,
        'Trip',
        tripId,
        { adminIds },
      );

      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add admin to trip
   * POST /api/admin/trips/:tripId/admins/:adminId
   */
  addTripAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId, adminId } = req.params;

      const trip = await tripService.addAdmin(tripId, adminId);

      // Log the admin addition
      await logService.log(
        (req.user as User).id,
        ActionType.UPDATE,
        'Trip',
        tripId,
        { addedAdmin: adminId },
      );

      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Remove admin from trip
   * DELETE /api/admin/trips/:tripId/admins/:adminId
   */
  removeTripAdmin: async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { tripId, adminId } = req.params;

      const trip = await tripService.removeAdmin(tripId, adminId);

      // Log the admin removal
      await logService.log(
        (req.user as User).id,
        ActionType.UPDATE,
        'Trip',
        tripId,
        { removedAdmin: adminId },
      );

      res.status(200).json({
        success: true,
        data: trip,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete trip
   * DELETE /api/admin/trips/:tripId
   */
  deleteTrip: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId } = req.params;

      const result = await tripService.deleteTrip(tripId);

      // Log the deletion
      await logService.log(
        (req.user as User).id,
        ActionType.DELETE,
        'Trip',
        tripId,
        {},
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
