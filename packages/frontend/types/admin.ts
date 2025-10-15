// Admin types for super-admin dashboard and management

import type { Role } from './auth';
import type { Family } from './family';
import type { Trip } from './trip';

/**
 * Admin User Interface
 */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  familyId: string;
  type: 'adult' | 'child';
  profilePhotoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Activity Log Entry
 */
export interface ActivityLog {
  id: string;
  userId: string;
  userName?: string;
  entityType:
    | 'TRIP'
    | 'FAMILY'
    | 'GEAR_ITEM'
    | 'USER'
    | 'WHATSAPP_TEMPLATE'
    | 'WHATSAPP_MESSAGE';
  entityId: string;
  actionType:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'APPROVE'
    | 'DEACTIVATE'
    | 'REACTIVATE';
  timestamp: string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Dashboard Metrics
 */
export interface DashboardMetrics {
  totalFamilies: number;
  activeFamilies: number;
  pendingFamilies: number;
  deactivatedFamilies: number;
  totalUsers: number;
  totalAdults: number;
  totalChildren: number;
  totalTrips: number;
  draftTrips: number;
  publishedTrips: number;
  completedTrips: number;
  totalGearItems: number;
  recentActivity: ActivityLog[];
}

/**
 * System Summary
 */
export interface SystemSummary {
  families: {
    total: number;
    active: number;
    pending: number;
    deactivated: number;
  };
  users: {
    total: number;
    adults: number;
    children: number;
    tripAdmins: number;
    superAdmins: number;
  };
  trips: {
    total: number;
    draft: number;
    published: number;
    completed: number;
    upcoming: number;
  };
}

/**
 * Trip Statistics
 */
export interface TripStats {
  totalTrips: number;
  averageAttendees: number;
  mostPopularLocation: string;
  upcomingTrips: number;
  completedTrips: number;
  tripsByMonth: Array<{
    month: string;
    count: number;
  }>;
}

/**
 * Family Statistics
 */
export interface FamilyStats {
  totalFamilies: number;
  averageMembersPerFamily: number;
  totalMembers: number;
  activeParticipation: number;
  newFamiliesThisMonth: number;
  familyGrowth: Array<{
    month: string;
    count: number;
  }>;
}

/**
 * Trip Attendance Report
 */
export interface TripAttendanceReport {
  tripId: string;
  tripName: string;
  totalFamilies: number;
  attendingFamilies: number;
  totalAttendees: number;
  adults: number;
  children: number;
  dietaryRequirements: Array<{
    familyId: string;
    familyName: string;
    requirements: string;
  }>;
  gearAssignments: Array<{
    gearName: string;
    familyName: string;
    quantity: number;
  }>;
}

/**
 * Update User Role Data
 */
export interface UpdateUserRoleData {
  role: Role;
}

/**
 * Export Data Request
 */
export interface ExportDataRequest {
  dataType: 'families' | 'trips' | 'users' | 'logs' | 'all';
  format: 'json' | 'csv';
  dateFrom?: string;
  dateTo?: string;
  filters?: Record<string, unknown>;
}

/**
 * Export Data Response
 */
export interface ExportDataResponse {
  filename: string;
  data: string;
  contentType: string;
}

/**
 * Activity Logs Filters
 */
export interface ActivityLogsFilters {
  entityType?: ActivityLog['entityType'];
  actionType?: ActivityLog['actionType'];
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/**
 * Bulk Approve Families Data
 */
export interface BulkApproveFamiliesData {
  familyIds: string[];
}

/**
 * Bulk Deactivate Families Data
 */
export interface BulkDeactivateFamiliesData {
  familyIds: string[];
}

/**
 * Admin statistics for families
 */
export interface AdminFamilyWithStats extends Family {
  totalTripsAttended?: number;
  totalGearAssignments?: number;
  lastActivityDate?: string;
}

/**
 * Admin statistics for trips
 */
export interface AdminTripWithStats extends Trip {
  totalAttendees?: number;
  totalFamilies?: number;
  completionRate?: number;
}
