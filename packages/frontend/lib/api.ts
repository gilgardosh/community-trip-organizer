// API client for family management and other services

import { getStoredTokens } from '@/lib/auth';
import type {
  Family,
  FamilyMember,
  CreateFamilyData,
  UpdateFamilyData,
  AddMemberData,
  UpdateMemberData,
  FamilyFilters,
} from '@/types/family';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// API helper with auth headers
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const tokens = getStoredTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: 'Request failed' }));
    throw new Error(
      error.message || `Request failed with status ${response.status}`,
    );
  }

  return response;
}

// ==================== FAMILY API ====================

/**
 * Create a new family
 */
export async function createFamily(data: CreateFamilyData): Promise<Family> {
  const response = await fetch(`${API_URL}/api/families`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create family');
  }

  return response.json();
}

/**
 * Get all families with optional filters
 */
export async function getFamilies(filters?: FamilyFilters): Promise<Family[]> {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.append('status', filters.status);
  }

  if (filters?.isActive !== undefined) {
    params.append('isActive', String(filters.isActive));
  }

  const queryString = params.toString();
  const endpoint = `/api/families${queryString ? `?${queryString}` : ''}`;

  const response = await fetchWithAuth(endpoint);
  return response.json();
}

/**
 * Get family by ID
 */
export async function getFamilyById(id: string): Promise<Family> {
  const response = await fetchWithAuth(`/api/families/${id}`);
  return response.json();
}

/**
 * Update family details
 */
export async function updateFamily(
  id: string,
  data: UpdateFamilyData,
): Promise<Family> {
  const response = await fetchWithAuth(`/api/families/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Approve family (Super-admin only)
 */
export async function approveFamily(id: string): Promise<Family> {
  const response = await fetchWithAuth(`/api/families/${id}/approve`, {
    method: 'POST',
  });
  return response.json();
}

/**
 * Deactivate family (Super-admin only)
 */
export async function deactivateFamily(id: string): Promise<Family> {
  const response = await fetchWithAuth(`/api/families/${id}/deactivate`, {
    method: 'POST',
  });
  return response.json();
}

/**
 * Reactivate family (Super-admin only)
 */
export async function reactivateFamily(id: string): Promise<Family> {
  const response = await fetchWithAuth(`/api/families/${id}/reactivate`, {
    method: 'POST',
  });
  return response.json();
}

/**
 * Delete family permanently (Super-admin only)
 */
export async function deleteFamily(id: string): Promise<{ message: string }> {
  const response = await fetchWithAuth(`/api/families/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

/**
 * Get family members
 */
export async function getFamilyMembers(
  familyId: string,
): Promise<FamilyMember[]> {
  const response = await fetchWithAuth(`/api/families/${familyId}/members`);
  return response.json();
}

/**
 * Get family adults
 */
export async function getFamilyAdults(
  familyId: string,
): Promise<FamilyMember[]> {
  const response = await fetchWithAuth(`/api/families/${familyId}/adults`);
  return response.json();
}

/**
 * Get family children
 */
export async function getFamilyChildren(
  familyId: string,
): Promise<FamilyMember[]> {
  const response = await fetchWithAuth(`/api/families/${familyId}/children`);
  return response.json();
}

/**
 * Add a member to a family
 */
export async function addFamilyMember(
  familyId: string,
  data: AddMemberData,
): Promise<FamilyMember> {
  const response = await fetchWithAuth(`/api/families/${familyId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Update a family member
 */
export async function updateFamilyMember(
  familyId: string,
  memberId: string,
  data: UpdateMemberData,
): Promise<FamilyMember> {
  const response = await fetchWithAuth(
    `/api/families/${familyId}/members/${memberId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );
  return response.json();
}

/**
 * Remove a member from a family
 */
export async function removeFamilyMember(
  familyId: string,
  memberId: string,
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `/api/families/${familyId}/members/${memberId}`,
    {
      method: 'DELETE',
    },
  );
  return response.json();
}

// ==================== TRIP API ====================

import type {
  Trip as TripType,
  CreateTripData as CreateTripDataType,
  UpdateTripData as UpdateTripDataType,
  TripFilters as TripFiltersType,
  MarkAttendanceData,
  AssignAdminsData,
} from '@/types/trip';

/**
 * Get all trips with optional filters
 */
export async function getTrips(filters?: TripFiltersType): Promise<TripType[]> {
  const params = new URLSearchParams();

  if (filters?.draft !== undefined) {
    params.append('draft', String(filters.draft));
  }

  if (filters?.startDateFrom) {
    params.append(
      'startDateFrom',
      new Date(filters.startDateFrom).toISOString(),
    );
  }

  if (filters?.startDateTo) {
    params.append('startDateTo', new Date(filters.startDateTo).toISOString());
  }

  if (filters?.includePast !== undefined) {
    params.append('includePast', String(filters.includePast));
  }

  const queryString = params.toString();
  const endpoint = `/api/trips${queryString ? `?${queryString}` : ''}`;

  const response = await fetchWithAuth(endpoint);
  return response.json();
}

/**
 * Get trip by ID
 */
export async function getTripById(id: string): Promise<TripType> {
  const response = await fetchWithAuth(`/api/trips/${id}`);
  return response.json();
}

/**
 * Create a new trip
 */
export async function createTrip(data: CreateTripDataType): Promise<TripType> {
  const response = await fetchWithAuth(`/api/trips`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Update trip
 */
export async function updateTrip(
  id: string,
  data: UpdateTripDataType,
): Promise<TripType> {
  const response = await fetchWithAuth(`/api/trips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Publish trip (Super-admin only)
 */
export async function publishTrip(id: string): Promise<TripType> {
  const response = await fetchWithAuth(`/api/trips/${id}/publish`, {
    method: 'POST',
  });
  return response.json();
}

/**
 * Unpublish trip (Super-admin only)
 */
export async function unpublishTrip(id: string): Promise<TripType> {
  const response = await fetchWithAuth(`/api/trips/${id}/unpublish`, {
    method: 'POST',
  });
  return response.json();
}

/**
 * Assign admins to trip (Super-admin only)
 */
export async function assignTripAdmins(
  id: string,
  data: AssignAdminsData,
): Promise<TripType> {
  const response = await fetchWithAuth(`/api/trips/${id}/admins`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Add admin to trip (Super-admin only)
 */
export async function addTripAdmin(
  id: string,
  adminId: string,
): Promise<TripType> {
  const response = await fetchWithAuth(`/api/trips/${id}/admins/${adminId}`, {
    method: 'POST',
  });
  return response.json();
}

/**
 * Remove admin from trip (Super-admin only)
 */
export async function removeTripAdmin(
  id: string,
  adminId: string,
): Promise<TripType> {
  const response = await fetchWithAuth(`/api/trips/${id}/admins/${adminId}`, {
    method: 'DELETE',
  });
  return response.json();
}

/**
 * Mark attendance for a trip
 */
export async function markTripAttendance(
  tripId: string,
  data: MarkAttendanceData,
): Promise<TripType> {
  const response = await fetchWithAuth(`/api/trips/${tripId}/attendance`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Get trip attendees
 */
export async function getTripAttendees(tripId: string): Promise<unknown[]> {
  const response = await fetchWithAuth(`/api/trips/${tripId}/attendees`);
  return response.json();
}

/**
 * Delete trip (Super-admin only)
 */
export async function deleteTrip(id: string): Promise<{ message: string }> {
  const response = await fetchWithAuth(`/api/trips/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

/**
 * Update dietary requirements for a family
 */
export async function updateDietaryRequirements(
  tripId: string,
  familyId: string,
  dietaryRequirements?: string,
): Promise<unknown> {
  const response = await fetchWithAuth(
    `/api/trips/${tripId}/dietary-requirements`,
    {
      method: 'PUT',
      body: JSON.stringify({ familyId, dietaryRequirements }),
    },
  );
  return response.json();
}

/**
 * Get trip schedule
 */
export async function getTripSchedule(tripId: string): Promise<unknown[]> {
  const response = await fetchWithAuth(`/api/trips/${tripId}/schedule`);
  return response.json();
}

/**
 * Add schedule item to trip
 */
export async function addScheduleItem(
  tripId: string,
  data: {
    day: number;
    startTime: string;
    endTime?: string;
    title: string;
    description?: string;
    location?: string;
  },
): Promise<unknown> {
  const response = await fetchWithAuth(`/api/trips/${tripId}/schedule`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Update schedule item
 */
export async function updateScheduleItem(
  tripId: string,
  scheduleId: string,
  data: Partial<{
    day: number;
    startTime: string;
    endTime?: string;
    title: string;
    description?: string;
    location?: string;
  }>,
): Promise<unknown> {
  const response = await fetchWithAuth(
    `/api/trips/${tripId}/schedule/${scheduleId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
  );
  return response.json();
}

/**
 * Delete schedule item
 */
export async function deleteScheduleItem(
  tripId: string,
  scheduleId: string,
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `/api/trips/${tripId}/schedule/${scheduleId}`,
    {
      method: 'DELETE',
    },
  );
  return response.json();
}

// ==================== GEAR API ====================

import type {
  GearItem as GearItemType,
  CreateGearItemData,
  UpdateGearItemData,
  AssignGearData,
  GearSummary,
} from '@/types/gear';

/**
 * Create a new gear item
 */
export async function createGearItem(
  data: CreateGearItemData,
): Promise<GearItemType> {
  const response = await fetchWithAuth(`/api/gear`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Get all gear items for a trip
 */
export async function getGearItemsByTrip(
  tripId: string,
): Promise<GearItemType[]> {
  const response = await fetchWithAuth(`/api/gear/trip/${tripId}`);
  return response.json();
}

/**
 * Get gear item by ID
 */
export async function getGearItemById(id: string): Promise<GearItemType> {
  const response = await fetchWithAuth(`/api/gear/${id}`);
  return response.json();
}

/**
 * Update gear item
 */
export async function updateGearItem(
  id: string,
  data: UpdateGearItemData,
): Promise<GearItemType> {
  const response = await fetchWithAuth(`/api/gear/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Delete gear item
 */
export async function deleteGearItem(id: string): Promise<{ message: string }> {
  const response = await fetchWithAuth(`/api/gear/${id}`, {
    method: 'DELETE',
  });
  return response.json();
}

/**
 * Assign gear to a family
 */
export async function assignGear(
  gearItemId: string,
  data: AssignGearData,
): Promise<GearItemType> {
  const response = await fetchWithAuth(`/api/gear/${gearItemId}/assign`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * Remove gear assignment from a family
 */
export async function removeGearAssignment(
  gearItemId: string,
  familyId: string,
): Promise<{ message: string }> {
  const response = await fetchWithAuth(
    `/api/gear/${gearItemId}/assign/${familyId}`,
    {
      method: 'DELETE',
    },
  );
  return response.json();
}

/**
 * Get gear summary for a trip
 */
export async function getGearSummary(tripId: string): Promise<GearSummary> {
  const response = await fetchWithAuth(`/api/gear/trip/${tripId}/summary`);
  return response.json();
}

/**
 * Get family's gear assignments for a trip
 */
export async function getFamilyGearAssignments(
  tripId: string,
  familyId: string,
): Promise<GearItemType[]> {
  const response = await fetchWithAuth(
    `/api/gear/trip/${tripId}/family/${familyId}`,
  );
  return response.json();
}

/**
 * Get all admins (for super-admin panel)
 */
export async function getAdmins(): Promise<unknown[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock admin data
  return [
    {
      id: 'admin1',
      name: 'שרה מנהלת',
      email: 'sarah@example.com',
      role: 'מנהל טיול',
      avatar: null,
    },
    {
      id: 'admin2',
      name: 'יוסי מארגן',
      email: 'yossi@example.com',
      role: 'מנהל טיול',
      avatar: null,
    },
    {
      id: 'superadmin',
      name: 'אדמין ראשי',
      email: 'admin@example.com',
      role: 'סופר אדמין',
      avatar: null,
    },
  ];
}
