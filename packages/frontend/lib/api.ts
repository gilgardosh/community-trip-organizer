// Simulated API functions that return promises to mimic server requests

import { mockFamilies, type Family } from "@/data/mock/families"
import { mockTrips, type Trip, mockFamilyParticipation, type FamilyParticipation } from "@/data/mock/trips"
import { mockAdmins, type Admin } from "@/data/mock/admins"
import { mockGearItems, type GearItem } from "@/data/mock/gear"
import { mockScheduleItems, type ScheduleItem } from "@/data/mock/schedule"
import { mockFamilyMembers, type FamilyMember } from "@/data/mock/family-members"
import { mockActivityLog, type ActivityLogEntry } from "@/data/mock/activity-log"

// Simulate network delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

// Family API
export async function getFamilies(): Promise<Family[]> {
  await delay()
  return mockFamilies
}

export async function getFamilyById(id: string): Promise<Family | null> {
  await delay()
  return mockFamilies.find((family) => family.id === id) || null
}

// Trip API
export async function getTrips(): Promise<Trip[]> {
  await delay()
  return mockTrips
}

export async function getTripById(id: string): Promise<Trip | null> {
  await delay()
  return mockTrips.find((trip) => trip.id === id) || null
}

export async function getUpcomingTrips(): Promise<Trip[]> {
  await delay()
  return mockTrips.filter((trip) => trip.status === "upcoming")
}

export async function getPastTrips(): Promise<Trip[]> {
  await delay()
  return mockTrips.filter((trip) => trip.status === "past")
}

export async function getTripWithParticipation(
  tripId: string,
  familyId: string,
): Promise<{
  trip: Trip | null
  participation: FamilyParticipation | null
}> {
  await delay()
  const trip = mockTrips.find((t) => t.id === tripId) || null
  const participation = mockFamilyParticipation.find((p) => p.tripId === tripId && p.familyId === familyId) || null

  return { trip, participation }
}

// Admin API
export async function getAdmins(): Promise<Admin[]> {
  await delay()
  return mockAdmins
}

// Gear API
export async function getGearItems(): Promise<GearItem[]> {
  await delay()
  return mockGearItems
}

export async function getGearItemsByTripId(tripId: string): Promise<GearItem[]> {
  await delay()
  // In a real app, this would filter by trip ID
  return mockGearItems
}

// Schedule API
export async function getScheduleItems(): Promise<ScheduleItem[]> {
  await delay()
  return mockScheduleItems
}

// Family Members API
export async function getFamilyMembers(): Promise<FamilyMember[]> {
  await delay()
  return mockFamilyMembers
}

// Activity Log API
export async function getActivityLog(): Promise<ActivityLogEntry[]> {
  await delay()
  return mockActivityLog
}

// Update functions (simulate server updates)
export async function updateTripAttendance(tripId: string, isAttending: boolean): Promise<void> {
  await delay()
  console.log(`[API] Updated trip ${tripId} attendance: ${isAttending}`)
}

export async function updateTripDietaryInfo(tripId: string, dietaryInfo: string): Promise<void> {
  await delay()
  console.log(`[API] Updated trip ${tripId} dietary info: ${dietaryInfo}`)
}

export async function updateFamilyStatus(familyId: string, status: string): Promise<void> {
  await delay()
  console.log(`[API] Updated family ${familyId} status: ${status}`)
}

export async function assignGearToFamily(gearId: string, familyName: string, quantity: number): Promise<void> {
  await delay()
  console.log(`[API] Assigned ${quantity} units of gear ${gearId} to ${familyName}`)
}

export async function getFamilyParticipation(tripId: string, familyId: string): Promise<FamilyParticipation | null> {
  await delay()
  return (
    mockFamilyParticipation.find(
      (participation) => participation.tripId === tripId && participation.familyId === familyId,
    ) || null
  )
}

export async function updateFamilyParticipation(
  tripId: string,
  familyId: string,
  updates: Partial<FamilyParticipation>,
): Promise<void> {
  await delay()
  console.log(`[API] Updated family ${familyId} participation for trip ${tripId}:`, updates)
}
