// Trip types

export type TripStatus = 'draft' | 'published' | 'upcoming' | 'active' | 'past';

export interface TripAdmin {
  id: string;
  name: string;
  email?: string;
  role: string;
}

export interface TripAttendee {
  id: string;
  tripId: string;
  familyId: string;
  dietaryRequirements?: string;
  createdAt: string;
  updatedAt: string;
  family: {
    id: string;
    name?: string;
    members: Array<{
      id: string;
      type: string;
      name: string;
      age?: number;
    }>;
  };
}

export interface TripScheduleItem {
  id: string;
  tripId: string;
  day: number;
  startTime: string;
  endTime?: string;
  title: string;
  description?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GearAssignment {
  id: string;
  gearItemId: string;
  familyId: string;
  quantityAssigned: number;
  family: {
    id: string;
    name?: string;
    members: Array<{
      id: string;
      type: string;
      name: string;
    }>;
  };
}

export interface GearItem {
  id: string;
  tripId: string;
  name: string;
  quantityNeeded: number;
  assignments: GearAssignment[];
}

export interface Trip {
  id: string;
  name: string;
  location: string;
  description?: string;
  startDate: string;
  endDate: string;
  attendanceCutoffDate?: string;
  photoAlbumLink?: string;
  draft: boolean;
  createdAt: string;
  updatedAt: string;
  admins: TripAdmin[];
  attendees: TripAttendee[];
  gearItems: GearItem[];
  scheduleItems: TripScheduleItem[];
}

export interface CreateTripData {
  name: string;
  location: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  attendanceCutoffDate?: string | Date;
  photoAlbumLink?: string;
}

export interface UpdateTripData {
  name?: string;
  location?: string;
  description?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  attendanceCutoffDate?: string | Date;
  photoAlbumLink?: string;
}

export interface TripFilters {
  draft?: boolean;
  startDateFrom?: string | Date;
  startDateTo?: string | Date;
  includePast?: boolean;
}

export interface MarkAttendanceData {
  familyId: string;
  attending: boolean;
}

export interface AssignAdminsData {
  adminIds: string[];
}

// Helper functions
export function getTripStatus(trip: Trip): TripStatus {
  if (trip.draft) {
    return 'draft';
  }

  const now = new Date();
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  if (now > endDate) {
    return 'past';
  }

  if (now >= startDate && now <= endDate) {
    return 'active';
  }

  return 'upcoming';
}

export function canEditAttendance(trip: Trip): boolean {
  if (trip.draft) {
    return false;
  }

  if (!trip.attendanceCutoffDate) {
    return true;
  }

  const now = new Date();
  const cutoffDate = new Date(trip.attendanceCutoffDate);

  return now <= cutoffDate;
}

export function getTotalQuantityAssigned(gearItem: GearItem): number {
  return gearItem.assignments.reduce(
    (sum, assignment) => sum + assignment.quantityAssigned,
    0,
  );
}

export function isGearItemFullyAssigned(gearItem: GearItem): boolean {
  return getTotalQuantityAssigned(gearItem) >= gearItem.quantityNeeded;
}
