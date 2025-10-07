// API client for family management and other services

import { getStoredTokens } from '@/lib/auth'
import type {
  Family,
  FamilyMember,
  CreateFamilyData,
  UpdateFamilyData,
  AddMemberData,
  UpdateMemberData,
  FamilyFilters,
} from '@/types/family'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// API helper with auth headers
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const tokens = getStoredTokens()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (tokens?.accessToken) {
    headers['Authorization'] = `Bearer ${tokens.accessToken}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `Request failed with status ${response.status}`)
  }

  return response
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
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create family')
  }

  return response.json()
}

/**
 * Get all families with optional filters
 */
export async function getFamilies(filters?: FamilyFilters): Promise<Family[]> {
  const params = new URLSearchParams()
  
  if (filters?.status) {
    params.append('status', filters.status)
  }
  
  if (filters?.isActive !== undefined) {
    params.append('isActive', String(filters.isActive))
  }

  const queryString = params.toString()
  const endpoint = `/api/families${queryString ? `?${queryString}` : ''}`
  
  const response = await fetchWithAuth(endpoint)
  return response.json()
}

/**
 * Get family by ID
 */
export async function getFamilyById(id: string): Promise<Family> {
  const response = await fetchWithAuth(`/api/families/${id}`)
  return response.json()
}

/**
 * Update family details
 */
export async function updateFamily(id: string, data: UpdateFamilyData): Promise<Family> {
  const response = await fetchWithAuth(`/api/families/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.json()
}

/**
 * Approve family (Super-admin only)
 */
export async function approveFamily(id: string): Promise<Family> {
  const response = await fetchWithAuth(`/api/families/${id}/approve`, {
    method: 'POST',
  })
  return response.json()
}

/**
 * Deactivate family (Super-admin only)
 */
export async function deactivateFamily(id: string): Promise<Family> {
  const response = await fetchWithAuth(`/api/families/${id}/deactivate`, {
    method: 'POST',
  })
  return response.json()
}

/**
 * Reactivate family (Super-admin only)
 */
export async function reactivateFamily(id: string): Promise<Family> {
  const response = await fetchWithAuth(`/api/families/${id}/reactivate`, {
    method: 'POST',
  })
  return response.json()
}

/**
 * Delete family permanently (Super-admin only)
 */
export async function deleteFamily(id: string): Promise<{ message: string }> {
  const response = await fetchWithAuth(`/api/families/${id}`, {
    method: 'DELETE',
  })
  return response.json()
}

/**
 * Get family members
 */
export async function getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
  const response = await fetchWithAuth(`/api/families/${familyId}/members`)
  return response.json()
}

/**
 * Get family adults
 */
export async function getFamilyAdults(familyId: string): Promise<FamilyMember[]> {
  const response = await fetchWithAuth(`/api/families/${familyId}/adults`)
  return response.json()
}

/**
 * Get family children
 */
export async function getFamilyChildren(familyId: string): Promise<FamilyMember[]> {
  const response = await fetchWithAuth(`/api/families/${familyId}/children`)
  return response.json()
}

/**
 * Add a member to a family
 */
export async function addFamilyMember(familyId: string, data: AddMemberData): Promise<FamilyMember> {
  const response = await fetchWithAuth(`/api/families/${familyId}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.json()
}

/**
 * Update a family member
 */
export async function updateFamilyMember(
  familyId: string,
  memberId: string,
  data: UpdateMemberData
): Promise<FamilyMember> {
  const response = await fetchWithAuth(`/api/families/${familyId}/members/${memberId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.json()
}

/**
 * Remove a member from a family
 */
export async function removeFamilyMember(
  familyId: string,
  memberId: string
): Promise<{ message: string }> {
  const response = await fetchWithAuth(`/api/families/${familyId}/members/${memberId}`, {
    method: 'DELETE',
  })
  return response.json()
}
