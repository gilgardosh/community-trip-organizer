# Seed Data Relationships Diagram

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SEED DATA STRUCTURE                          │
└─────────────────────────────────────────────────────────────────────┘

USERS (19 total)
├── Super Admin (1)
│   └── Sarah Admin (admin@example.com)
│
└── Trip Admins (3)
    ├── John Johnson (Summer Camp Admin)
    ├── Michael Smith (Winter Retreat Admin)
    └── Carlos Garcia (Beach Getaway Admin)

FAMILIES (6 total)
├── Active & Approved (4)
│   ├── The Johnsons (4 members)
│   │   ├── John Johnson (TRIP_ADMIN) ──► Admins Summer Camp
│   │   ├── Jane Johnson
│   │   ├── Jimmy Johnson (child, 12)
│   │   └── Jenny Johnson (child, 9)
│   │
│   ├── The Smiths (3 members)
│   │   ├── Michael Smith (TRIP_ADMIN) ──► Admins Winter Retreat
│   │   ├── Sarah Smith
│   │   └── Sophie Smith (child, 7)
│   │
│   ├── The Garcia Family (5 members)
│   │   ├── Carlos Garcia (TRIP_ADMIN) ──► Admins Beach Getaway
│   │   ├── Maria Garcia
│   │   ├── Diego Garcia (child, 15)
│   │   ├── Isabella Garcia (child, 13)
│   │   └── Lucas Garcia (child, 8)
│   │
│   └── The Chen Family (3 members)
│       ├── David Chen
│       ├── Lisa Chen
│       └── Emily Chen (child, 6)
│
├── Pending Approval (1)
│   └── The Wilson Family (2 members)
│       ├── Robert Wilson
│       └── Emma Wilson
│
└── Inactive (1)
    └── The Brown Family (1 member)
        └── Thomas Brown

TRIPS (3 total)
├── Active Trips (2)
│   ├── Summer Camp 2025 (Jul 15-20, 2025)
│   │   ├── Admin: John Johnson
│   │   ├── Attendees: 4 families
│   │   │   ├── Johnsons
│   │   │   ├── Smiths
│   │   │   ├── Garcias
│   │   │   └── Chens
│   │   └── Gear Items: 4 types
│   │       ├── Tents (4-person) → 5 needed, 5 assigned
│   │       ├── Sleeping Bags → 15 needed, 15 assigned
│   │       ├── Camp Stoves → 3 needed, 2 assigned
│   │       └── Coolers → 4 needed, 4 assigned
│   │
│   └── Winter Retreat 2026 (Jan 10-15, 2026)
│       ├── Admin: Michael Smith
│       ├── Attendees: 3 families
│       │   ├── Smiths
│       │   ├── Garcias
│       │   └── Johnsons
│       └── Gear Items: 2 types
│           ├── Ski Equipment → 10 needed, 7 assigned
│           └── Snowboards → 5 needed, 2 assigned
│
└── Draft Trips (1)
    └── Beach Getaway 2025 (Aug 20-25, 2025)
        ├── Admin: Carlos Garcia
        ├── Attendees: 2 families
        │   ├── Garcias
        │   └── Chens
        └── Gear Items: None (still planning)

GEAR ASSIGNMENTS
Summer Camp:
├── Johnsons: 2 tents, 4 sleeping bags
├── Smiths: 1 tent, 3 sleeping bags, 1 stove
├── Garcias: 1 tent, 5 sleeping bags, 1 stove, 2 coolers
└── Chens: 1 tent, 3 sleeping bags, 2 coolers

Winter Retreat:
├── Smiths: 3 ski sets
├── Johnsons: 4 ski sets
└── Garcias: 2 snowboards
```

## Access Control Matrix

| User          | Role        | Can Access              | Special Permissions          |
| ------------- | ----------- | ----------------------- | ---------------------------- |
| Sarah Admin   | SUPER_ADMIN | All trips, All families | Full system control          |
| John Johnson  | TRIP_ADMIN  | Summer Camp 2025        | Manage trip, gear, attendees |
| Michael Smith | TRIP_ADMIN  | Winter Retreat 2026     | Manage trip, gear, attendees |
| Carlos Garcia | TRIP_ADMIN  | Beach Getaway 2025      | Manage trip, gear, attendees |
| Other Adults  | FAMILY      | Their family's data     | View trips, manage family    |
| Children      | FAMILY      | Their family's data     | Limited access               |

## Testing Coverage

✅ **Role-Based Access Control**

- Super Admin can manage everything
- Trip Admins can only manage their trips
- Family users can only see their family data

✅ **Trip States**

- Published trips (Summer Camp, Winter Retreat)
- Draft trips (Beach Getaway)

✅ **Family States**

- Approved & Active (4 families)
- Pending approval (Wilson)
- Inactive (Brown)

✅ **Gear Management**

- Multiple gear items per trip
- Partial assignments (not all gear covered yet)
- Multiple families contributing gear

✅ **Trip Attendance**

- Families attending multiple trips
- Trips with multiple families
