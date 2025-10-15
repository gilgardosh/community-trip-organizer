# Super Admin Page - Type Fixes

## Issue

The `super-admin/page.tsx` file was using mock data types instead of the actual API types, causing TypeScript errors.

## Changes Made

### 1. Added `getAdmins()` to API (`lib/api.ts`)

```typescript
/**
 * Get all admins - alias for getAllUsers for backward compatibility
 */
export async function getAdmins(): Promise<AdminUser[]> {
  return getAllUsers();
}
```

### 2. Updated Super Admin Page Types

#### Import Changes

- **Before:** `import { Admin } from '@/data/mock/admins'`
- **After:** `import { AdminUser } from '@/types/admin'`

#### State Type Changes

- **Before:** `useState<Admin[]>([])`
- **After:** `useState<AdminUser[]>([])`

### 3. Fixed Type Mappings

#### Family Status

- API uses: `'PENDING' | 'APPROVED'`
- Fixed comparisons to use correct enum values
- Removed invalid 'INACTIVE' status check

#### Family Members

- **Property:** `type: 'ADULT' | 'CHILD'` (not `isChild: boolean`)
- **Before:** `family.members?.filter(m => !m.isChild)`
- **After:** `family.members?.filter(m => m.type === 'ADULT')`

#### Trip Admins

- **Property:** `admins: TripAdmin[]` (not `adminIds`)
- **Before:** `trip.adminIds?.[0]`
- **After:** `trip.admins[0]`

#### Trip Status

- **Property:** `draft: boolean` (no `status` property)
- Display logic uses `trip.draft ? 'draft' : 'published'`

#### Role Mappings

Updated badge display to use API enum values:

- `SUPER_ADMIN` → "סופר אדמין"
- `TRIP_ADMIN` → "מנהל טיול"
- `FAMILY` → "משתתף"

### 4. Fixed Data Formatting

#### Family Join Date

- **Before:** `family.joinDate` (doesn't exist)
- **After:** `new Date(family.createdAt).toLocaleDateString('he-IL')`

#### Trip Dates

- **Before:** `trip.startDate` (string display)
- **After:** `new Date(trip.startDate).toLocaleDateString('he-IL')`

## Result

✅ All TypeScript errors resolved
✅ Page now uses real API types
✅ Properly integrates with backend data structure
✅ No breaking changes to functionality

## API Compatibility

The page now correctly uses:

- `getFamilies()` - Returns `Family[]` with proper status and member types
- `getTrips()` - Returns `Trip[]` with admins array and draft status
- `getAdmins()` - Returns `AdminUser[]` with proper roles

All API calls work with the actual backend types defined in `/types/`.
