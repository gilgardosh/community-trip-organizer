// Gear types

export interface GearAssignment {
  id: string;
  gearItemId: string;
  familyId: string;
  quantityAssigned: number;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
  assignments: GearAssignment[];
}

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
  totalItems: number;
  totalQuantityNeeded: number;
  totalQuantityAssigned: number;
  fullyAssignedItems: number;
  partiallyAssignedItems: number;
  unassignedItems: number;
  items: GearItem[];
}

// Helper functions
export function getTotalQuantityAssigned(gearItem: GearItem): number {
  return gearItem.assignments.reduce(
    (sum, assignment) => sum + assignment.quantityAssigned,
    0,
  );
}

export function getRemainingQuantity(gearItem: GearItem): number {
  return Math.max(
    0,
    gearItem.quantityNeeded - getTotalQuantityAssigned(gearItem),
  );
}

export function isGearItemFullyAssigned(gearItem: GearItem): boolean {
  return getTotalQuantityAssigned(gearItem) >= gearItem.quantityNeeded;
}

export function getGearItemStatus(
  gearItem: GearItem,
): 'complete' | 'partial' | 'unassigned' {
  const totalAssigned = getTotalQuantityAssigned(gearItem);

  if (totalAssigned === 0) {
    return 'unassigned';
  }

  if (totalAssigned >= gearItem.quantityNeeded) {
    return 'complete';
  }

  return 'partial';
}

export function getFamilyAssignment(
  gearItem: GearItem,
  familyId: string,
): GearAssignment | undefined {
  return gearItem.assignments.find((a) => a.familyId === familyId);
}

export function canAssignMore(gearItem: GearItem): boolean {
  return getRemainingQuantity(gearItem) > 0;
}
