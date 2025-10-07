# Seed Data Documentation

This document describes the development seed data created for testing and development purposes.

## Running the Seed Script

From the backend directory, run:

```bash
yarn db:seed
```

## Default Password

**All users have the same password: `password123`**

## Users & Families

### Super Admin

- **Email:** admin@example.com
- **Name:** Sarah Admin
- **Role:** SUPER_ADMIN
- **Family:** Admin Family

### Trip Admins

1. **John Johnson** - `john.johnson@example.com`
   - Role: TRIP_ADMIN
   - Admin of: Summer Camp 2025
   - Family: The Johnsons

2. **Michael Smith** - `michael.smith@example.com`
   - Role: TRIP_ADMIN
   - Admin of: Winter Retreat 2026
   - Family: The Smiths

3. **Carlos Garcia** - `carlos.garcia@example.com`
   - Role: TRIP_ADMIN
   - Admin of: Beach Getaway 2025 (draft)
   - Family: The Garcia Family

### Regular Families

#### The Johnsons (4 members) - APPROVED, ACTIVE

- John Johnson (Adult, 42) - `john.johnson@example.com` - TRIP_ADMIN
- Jane Johnson (Adult, 40) - `jane.johnson@example.com`
- Jimmy Johnson (Child, 12) - `jimmy.johnson@child.local`
- Jenny Johnson (Child, 9) - `jenny.johnson@child.local`

#### The Smiths (3 members) - APPROVED, ACTIVE

- Michael Smith (Adult, 38) - `michael.smith@example.com` - TRIP_ADMIN
- Sarah Smith (Adult, 36) - `sarah.smith@example.com`
- Sophie Smith (Child, 7) - `sophie.smith@child.local`

#### The Garcia Family (5 members) - APPROVED, ACTIVE

- Carlos Garcia (Adult, 45) - `carlos.garcia@example.com` - TRIP_ADMIN
- Maria Garcia (Adult, 43) - `maria.garcia@example.com`
- Diego Garcia (Child, 15) - `diego.garcia@child.local`
- Isabella Garcia (Child, 13) - `isabella.garcia@child.local`
- Lucas Garcia (Child, 8) - `lucas.garcia@child.local`

#### The Chen Family (3 members) - APPROVED, ACTIVE

- David Chen (Adult, 35) - `david.chen@example.com`
- Lisa Chen (Adult, 33) - `lisa.chen@example.com`
- Emily Chen (Child, 6) - `emily.chen@child.local`

#### The Wilson Family (2 members) - PENDING, ACTIVE

- Robert Wilson (Adult, 50) - `robert.wilson@example.com`
- Emma Wilson (Adult, 48) - `emma.wilson@example.com`

#### The Brown Family (1 member) - APPROVED, INACTIVE

- Thomas Brown (Adult, 55) - `thomas.brown@example.com`

## Trips

### 1. Summer Camp 2025 (Active)

- **Location:** Mountain Lake Campground
- **Dates:** July 15-20, 2025
- **Status:** Published (draft: false)
- **Cutoff Date:** June 30, 2025
- **Admin:** John Johnson
- **Attendees:** 4 families (Johnsons, Smiths, Garcias, Chens)
- **Photo Album:** https://photos.example.com/summer-camp-2025

**Gear Items:**

- Tents (4-person): 5 needed
  - Johnsons: 2
  - Smiths: 1
  - Garcias: 1
  - Chens: 1
- Sleeping Bags: 15 needed
  - Johnsons: 4
  - Smiths: 3
  - Garcias: 5
  - Chens: 3
- Camp Stoves: 3 needed
  - Smiths: 1
  - Garcias: 1
- Coolers (Large): 4 needed
  - Garcias: 2
  - Chens: 2

### 2. Winter Retreat 2026 (Active)

- **Location:** Snowy Peaks Lodge
- **Dates:** January 10-15, 2026
- **Status:** Published (draft: false)
- **Cutoff Date:** December 20, 2025
- **Admin:** Michael Smith
- **Attendees:** 3 families (Smiths, Garcias, Johnsons)

**Gear Items:**

- Ski Equipment Sets: 10 needed
  - Smiths: 3
  - Johnsons: 4
- Snowboards: 5 needed
  - Garcias: 2

### 3. Beach Getaway 2025 (Draft)

- **Location:** Sunny Shores Beach
- **Dates:** August 20-25, 2025
- **Status:** Draft (draft: true)
- **Cutoff Date:** August 1, 2025
- **Admin:** Carlos Garcia
- **Attendees:** 2 families (Garcias, Chens)
- **Gear Items:** None yet (still in planning)

## Testing Scenarios

The seed data supports testing various scenarios:

1. **Super Admin Access:** Login as admin@example.com to manage all trips and families
2. **Trip Admin Access:** Login as trip admins to manage their specific trips
3. **Family Access:** Login as regular family members to view and manage family data
4. **Pending Approval:** Wilson family is pending approval (test approval workflow)
5. **Inactive Family:** Brown family is inactive (test filtering)
6. **Draft Trip:** Beach Getaway is a draft (test draft vs published trips)
7. **Gear Management:** Summer Camp and Winter Retreat have gear items and assignments
8. **Trip Attendance:** Multiple families attending multiple trips

## Quick Login Credentials

For quick testing, use these credentials:

- **Super Admin:** admin@example.com / password123
- **Trip Admin (Summer Camp):** john.johnson@example.com / password123
- **Trip Admin (Winter Retreat):** michael.smith@example.com / password123
- **Trip Admin (Beach - Draft):** carlos.garcia@example.com / password123
- **Regular User:** david.chen@example.com / password123
- **Pending Approval:** robert.wilson@example.com / password123
