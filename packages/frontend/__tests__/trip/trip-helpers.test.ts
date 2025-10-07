import { describe, it, expect } from 'vitest';
import {
  getTripStatus,
  canEditAttendance,
  getTotalQuantityAssigned,
  isGearItemFullyAssigned,
} from '@/types/trip';
import type { Trip, GearItem } from '@/types/trip';

const baseTrip: Trip = {
  id: '1',
  name: 'טיול בדיקה',
  location: 'תל אביב',
  description: 'טיול לבדיקה',
  startDate: '',
  endDate: '',
  draft: false,
  createdAt: '2024-10-01T00:00:00.000Z',
  updatedAt: '2024-10-01T00:00:00.000Z',
  admins: [],
  attendees: [],
  gearItems: [],
};

describe('Trip Type Helpers', () => {
  describe('getTripStatus', () => {
    it('returns draft for draft trips', () => {
      const trip = { ...baseTrip, draft: true };
      expect(getTripStatus(trip)).toBe('draft');
    });

    it('returns past for trips that have ended', () => {
      const trip = {
        ...baseTrip,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      };
      expect(getTripStatus(trip)).toBe('past');
    });

    it('returns active for ongoing trips', () => {
      const trip = {
        ...baseTrip,
        startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      };
      expect(getTripStatus(trip)).toBe('active');
    });

    it('returns upcoming for future trips', () => {
      const trip = {
        ...baseTrip,
        startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      expect(getTripStatus(trip)).toBe('upcoming');
    });
  });

  describe('canEditAttendance', () => {
    it('returns false for draft trips', () => {
      const trip = { ...baseTrip, draft: true };
      expect(canEditAttendance(trip)).toBe(false);
    });

    it('returns true when no cutoff date is set', () => {
      const trip = {
        ...baseTrip,
        attendanceCutoffDate: undefined,
      };
      expect(canEditAttendance(trip)).toBe(true);
    });

    it('returns true before cutoff date', () => {
      const trip = {
        ...baseTrip,
        attendanceCutoffDate: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };
      expect(canEditAttendance(trip)).toBe(true);
    });

    it('returns false after cutoff date', () => {
      const trip = {
        ...baseTrip,
        attendanceCutoffDate: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      };
      expect(canEditAttendance(trip)).toBe(false);
    });
  });

  describe('getTotalQuantityAssigned', () => {
    it('returns 0 for gear with no assignments', () => {
      const gearItem: GearItem = {
        id: '1',
        tripId: '1',
        name: 'אוהלים',
        quantityNeeded: 5,
        assignments: [],
      };
      expect(getTotalQuantityAssigned(gearItem)).toBe(0);
    });

    it('sums up all assigned quantities', () => {
      const gearItem: GearItem = {
        id: '1',
        tripId: '1',
        name: 'אוהלים',
        quantityNeeded: 5,
        assignments: [
          {
            id: 'a1',
            gearItemId: '1',
            familyId: 'f1',
            quantityAssigned: 2,
            family: {
              id: 'f1',
              members: [],
            },
          },
          {
            id: 'a2',
            gearItemId: '1',
            familyId: 'f2',
            quantityAssigned: 1,
            family: {
              id: 'f2',
              members: [],
            },
          },
        ],
      };
      expect(getTotalQuantityAssigned(gearItem)).toBe(3);
    });
  });

  describe('isGearItemFullyAssigned', () => {
    it('returns false when assigned quantity is less than needed', () => {
      const gearItem: GearItem = {
        id: '1',
        tripId: '1',
        name: 'אוהלים',
        quantityNeeded: 5,
        assignments: [
          {
            id: 'a1',
            gearItemId: '1',
            familyId: 'f1',
            quantityAssigned: 3,
            family: {
              id: 'f1',
              members: [],
            },
          },
        ],
      };
      expect(isGearItemFullyAssigned(gearItem)).toBe(false);
    });

    it('returns true when assigned quantity equals needed', () => {
      const gearItem: GearItem = {
        id: '1',
        tripId: '1',
        name: 'אוהלים',
        quantityNeeded: 5,
        assignments: [
          {
            id: 'a1',
            gearItemId: '1',
            familyId: 'f1',
            quantityAssigned: 5,
            family: {
              id: 'f1',
              members: [],
            },
          },
        ],
      };
      expect(isGearItemFullyAssigned(gearItem)).toBe(true);
    });

    it('returns true when assigned quantity exceeds needed', () => {
      const gearItem: GearItem = {
        id: '1',
        tripId: '1',
        name: 'אוהלים',
        quantityNeeded: 5,
        assignments: [
          {
            id: 'a1',
            gearItemId: '1',
            familyId: 'f1',
            quantityAssigned: 7,
            family: {
              id: 'f1',
              members: [],
            },
          },
        ],
      };
      expect(isGearItemFullyAssigned(gearItem)).toBe(true);
    });
  });
});
