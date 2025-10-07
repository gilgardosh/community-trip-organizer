import { describe, it, expect } from 'vitest';
import {
  getTotalQuantityAssigned,
  getRemainingQuantity,
  isGearItemFullyAssigned,
  getGearItemStatus,
  getFamilyAssignment,
  canAssignMore,
} from '@/types/gear';
import type { GearItem } from '@/types/gear';

describe('Gear Helper Functions', () => {
  const baseGearItem: GearItem = {
    id: 'gear-1',
    tripId: 'trip-1',
    name: 'אוהל',
    quantityNeeded: 5,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    assignments: [],
  };

  describe('getTotalQuantityAssigned', () => {
    it('should return 0 for no assignments', () => {
      expect(getTotalQuantityAssigned(baseGearItem)).toBe(0);
    });

    it('should sum all assigned quantities', () => {
      const gearItem: GearItem = {
        ...baseGearItem,
        assignments: [
          {
            id: 'a1',
            gearItemId: 'gear-1',
            familyId: 'f1',
            quantityAssigned: 2,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            family: { id: 'f1', members: [] },
          },
          {
            id: 'a2',
            gearItemId: 'gear-1',
            familyId: 'f2',
            quantityAssigned: 3,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            family: { id: 'f2', members: [] },
          },
        ],
      };

      expect(getTotalQuantityAssigned(gearItem)).toBe(5);
    });
  });

  describe('getRemainingQuantity', () => {
    it('should return full quantity when nothing assigned', () => {
      expect(getRemainingQuantity(baseGearItem)).toBe(5);
    });

    it('should return remaining quantity', () => {
      const gearItem: GearItem = {
        ...baseGearItem,
        assignments: [
          {
            id: 'a1',
            gearItemId: 'gear-1',
            familyId: 'f1',
            quantityAssigned: 3,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            family: { id: 'f1', members: [] },
          },
        ],
      };

      expect(getRemainingQuantity(gearItem)).toBe(2);
    });

    it('should return 0 when fully assigned', () => {
      const gearItem: GearItem = {
        ...baseGearItem,
        assignments: [
          {
            id: 'a1',
            gearItemId: 'gear-1',
            familyId: 'f1',
            quantityAssigned: 5,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            family: { id: 'f1', members: [] },
          },
        ],
      };

      expect(getRemainingQuantity(gearItem)).toBe(0);
    });

    it('should return 0 when over-assigned', () => {
      const gearItem: GearItem = {
        ...baseGearItem,
        assignments: [
          {
            id: 'a1',
            gearItemId: 'gear-1',
            familyId: 'f1',
            quantityAssigned: 7,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            family: { id: 'f1', members: [] },
          },
        ],
      };

      expect(getRemainingQuantity(gearItem)).toBe(0);
    });
  });

  describe('isGearItemFullyAssigned', () => {
    it('should return false when not assigned', () => {
      expect(isGearItemFullyAssigned(baseGearItem)).toBe(false);
    });

    it('should return false when partially assigned', () => {
      const gearItem: GearItem = {
        ...baseGearItem,
        assignments: [
          {
            id: 'a1',
            gearItemId: 'gear-1',
            familyId: 'f1',
            quantityAssigned: 3,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            family: { id: 'f1', members: [] },
          },
        ],
      };

      expect(isGearItemFullyAssigned(gearItem)).toBe(false);
    });

    it('should return true when fully assigned', () => {
      const gearItem: GearItem = {
        ...baseGearItem,
        assignments: [
          {
            id: 'a1',
            gearItemId: 'gear-1',
            familyId: 'f1',
            quantityAssigned: 5,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            family: { id: 'f1', members: [] },
          },
        ],
      };

      expect(isGearItemFullyAssigned(gearItem)).toBe(true);
    });
  });

  describe('getGearItemStatus', () => {
    it('should return "unassigned" when no assignments', () => {
      expect(getGearItemStatus(baseGearItem)).toBe('unassigned');
    });

    it('should return "partial" when partially assigned', () => {
      const gearItem: GearItem = {
        ...baseGearItem,
        assignments: [
          {
            id: 'a1',
            gearItemId: 'gear-1',
            familyId: 'f1',
            quantityAssigned: 3,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            family: { id: 'f1', members: [] },
          },
        ],
      };

      expect(getGearItemStatus(gearItem)).toBe('partial');
    });

    it('should return "complete" when fully assigned', () => {
      const gearItem: GearItem = {
        ...baseGearItem,
        assignments: [
          {
            id: 'a1',
            gearItemId: 'gear-1',
            familyId: 'f1',
            quantityAssigned: 5,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            family: { id: 'f1', members: [] },
          },
        ],
      };

      expect(getGearItemStatus(gearItem)).toBe('complete');
    });
  });

  describe('getFamilyAssignment', () => {
    it('should return undefined when family has no assignment', () => {
      expect(getFamilyAssignment(baseGearItem, 'family-1')).toBeUndefined();
    });

    it('should return assignment when family has one', () => {
      const assignment = {
        id: 'a1',
        gearItemId: 'gear-1',
        familyId: 'family-1',
        quantityAssigned: 3,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        family: { id: 'family-1', members: [] },
      };

      const gearItem: GearItem = {
        ...baseGearItem,
        assignments: [assignment],
      };

      expect(getFamilyAssignment(gearItem, 'family-1')).toEqual(assignment);
    });
  });

  describe('canAssignMore', () => {
    it('should return true when item is not fully assigned', () => {
      expect(canAssignMore(baseGearItem)).toBe(true);
    });

    it('should return false when item is fully assigned', () => {
      const gearItem: GearItem = {
        ...baseGearItem,
        assignments: [
          {
            id: 'a1',
            gearItemId: 'gear-1',
            familyId: 'f1',
            quantityAssigned: 5,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-01-01T00:00:00Z',
            family: { id: 'f1', members: [] },
          },
        ],
      };

      expect(canAssignMore(gearItem)).toBe(false);
    });
  });
});
