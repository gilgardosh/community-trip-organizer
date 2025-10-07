# Seed Data Relationships Diagram

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SEED DATA STRUCTURE                          │
│                   (Hebrew names for UI/DB data)                      │
└─────────────────────────────────────────────────────────────────────┘

USERS (37 total)
├── Super Admin (1)
│   └── שרה כהן / Sarah Cohen (admin@example.com)
│       ├── Participates in: Summer Camp, City Tour
│       └── Administers: City Tour (as super admin)
│
└── Trip Admins (5)
    ├── יוסי לוי / Yossi Levi (john.johnson@example.com)
    │   └── Admins: Summer Camp (co-admin with super admin), City Tour
    ├── מיכאל אבני / Michael Avni (michael.smith@example.com)
    │   └── Admins: Winter Retreat, Family Reunion (co-admin)
    ├── אבי מזרחי / Avi Mizrahi (carlos.garcia@example.com)
    │   └── Admins: Beach Getaway (draft), Memorial Day (past)
    ├── אלי בן-דוד / Eli Ben-David (luis.rodriguez@example.com)
    │   └── Admins: Autumn Hiking, Family Reunion (co-admin)
    └── נתן רוזנברג / Natan Rosenberg (mark.anderson@example.com)
        └── Admins: Spring Festival

FAMILIES (12 total)
├── Active & Approved (9)
│   ├── משפחת מנהל / Admin Family (1 member) ⭐ SUPER_ADMIN FAMILY
│   │   └── שרה כהן / Sarah Cohen (SUPER_ADMIN) ──► Participates in 2 trips
│   │
│   ├── משפחת לוי / The Levi Family (4 members)
│   │   ├── יוסי לוי / Yossi Levi (TRIP_ADMIN) ──► Admins Summer Camp, City Tour
│   │   ├── רחל לוי / Rachel Levi
│   │   ├── דניאל לוי / Daniel Levi (child, 12)
│   │   └── נועה לוי / Noa Levi (child, 9) - Gluten-free
│   │
│   ├── משפחת אבני / The Avni Family (3 members)
│   │   ├── מיכאל אבני / Michael Avni (TRIP_ADMIN) ──► Admins Winter Retreat, Family Reunion
│   │   ├── שירה אבני / Shira Avni
│   │   └── תמר אבני / Tamar Avni (child, 7)
│   │
│   ├── משפחת מזרחי / The Mizrahi Family (5 members)
│   │   ├── אבי מזרחי / Avi Mizrahi (TRIP_ADMIN) ──► Admins Beach Getaway, Memorial Day
│   │   ├── מיכל מזרחי / Michal Mizrahi
│   │   ├── אייל מזרחי / Eyal Mizrahi (child, 15)
│   │   ├── ליאור מזרחי / Lior Mizrahi (child, 13)
│   │   └── יונתן מזרחי / Yonatan Mizrahi (child, 8) - Vegetarian preferred
│   │
│   ├── משפחת שפיר / The Shafir Family (3 members)
│   │   ├── דוד שפיר / David Shafir
│   │   ├── עדי שפיר / Adi Shafir
│   │   └── מאיה שפיר / Maya Shafir (child, 6) - SEVERE NUT ALLERGIES
│   │
│   ├── משפחת בן-דוד / The Ben-David Family (4 members)
│   │   ├── אלי בן-דוד / Eli Ben-David (TRIP_ADMIN) ──► Admins Autumn Hiking, Family Reunion
│   │   ├── אנה בן-דוד / Ana Ben-David
│   │   ├── עומר בן-דוד / Omer Ben-David (child, 11)
│   │   └── שני בן-דוד / Shani Ben-David (child, 14)
│   │
│   ├── משפחת רפאלי / The Refaeli Family (4 members)
│   │   ├── עמית רפאלי / Amit Refaeli
│   │   ├── ליאת רפאלי / Liat Refaeli
│   │   ├── איתי רפאלי / Itay Refaeli (child, 10) - Halal/Kosher required
│   │   └── רוני רפאלי / Roni Refaeli (child, 8)
│   │
│   ├── משפחת כפלן / The Kaplan Family (4 members)
│   │   ├── גיל כפלן / Gil Kaplan
│   │   ├── דנה כפלן / Dana Kaplan
│   │   ├── עדן כפלן / Eden Kaplan (child, 9) - Strict vegetarian, Jain
│   │   └── טל כפלן / Tal Kaplan (child, 5)
│   │
│   ├── משפחת רוזנברג / The Rosenberg Family (3 members)
│   │   ├── נתן רוזנברג / Natan Rosenberg (TRIP_ADMIN) ──► Admins Spring Festival
│   │   ├── הדס רוזנברג / Hadas Rosenberg - Lactose intolerant
│   │   └── אור רוזנברג / Or Rosenberg (child, 16)
│   │
│   └── משפחת ברוך / The Baruch Family (3 members)
│       ├── יניב ברוך / Yaniv Baruch
│       ├── כרמל ברוך / Carmel Baruch
│       └── אלמוג ברוך / Almog Baruch (child, 12)
│
├── Pending Approval (1)
│   └── משפחת פרידמן / The Friedman Family (2 members)
│       ├── רון פרידמן / Ron Friedman
│       └── ענת פרידמן / Anat Friedman
│
└── Inactive (1)
    └── משפחת ברון / The Baron Family (1 member)
        └── אריאל ברון / Ariel Baron

TRIPS (8 total)
├── Published Upcoming (5)
│   ├── מחנה קיץ 2025 / Summer Camp 2025 (Jul 15-20, 2025)
│   │   ├── Admins: יוסי לוי (Yossi Levi) + שרה כהן (Sarah - Super Admin) - CO-ADMINS
│   │   ├── Attendees: 7 families (23+ people)
│   │   │   ├── Admin Family (Vegetarian)
│   │   │   ├── Levi Family (Gluten-free for Noa)
│   │   │   ├── Avni Family
│   │   │   ├── Mizrahi Family (Vegetarian preferred)
│   │   │   ├── Shafir Family (Nut allergies - Maya)
│   │   │   ├── Refaeli Family (Halal required)
│   │   │   └── Kaplan Family (Vegetarian, no eggs)
│   │   ├── Schedule: 15 items across 3 days (Hebrew titles)
│   │   └── Gear Items: 4 types (Hebrew names)
│   │       ├── אוהלים / Tents (4-person) → 8 needed, 8 assigned ✓
│   │       ├── שקי שינה / Sleeping Bags → 24 needed, 24 assigned ✓
│   │       ├── כיריים קמפינג / Camp Stoves → 5 needed, 5 assigned ✓
│   │       └── צידניות / Coolers → 7 needed, 7 assigned ✓
│   │
│   ├── הרפתקת טיולים בסתיו 2025 / Autumn Hiking 2025 (Oct 12-15, 2025)
│   │   ├── Admin: אלי בן-דוד (Eli Ben-David)
│   │   ├── Attendees: 5 families
│   │   │   ├── Ben-David Family
│   │   │   ├── Refaeli Family (Halal)
│   │   │   ├── Kaplan Family (Vegetarian, Jain)
│   │   │   ├── Baruch Family
│   │   │   └── Levi Family (Gluten-free)
│   │   ├── Schedule: 9 items across 2 days (Hebrew titles)
│   │   └── Gear Items: 2 types (Hebrew names)
│   │       ├── תיקי גב לטיולים / Hiking Backpacks → 15 needed, 15 assigned ✓
│   │       └── מקלות טיול / Trekking Poles → 10 needed, 10 assigned ✓
│   │
│   ├── מפגש חורף 2026 / Winter Retreat 2026 (Jan 10-15, 2026)
│   │   ├── Admin: מיכאל אבני (Michael Avni)
│   │   ├── Attendees: 5 families
│   │   │   ├── Avni Family
│   │   │   ├── Mizrahi Family (Vegetarian)
│   │   │   ├── Levi Family (Gluten-free)
│   │   │   ├── Baruch Family
│   │   │   └── Rosenberg Family (Lactose intolerant)
│   │   ├── Schedule: 13 items across 3 days (Hebrew titles)
│   │   └── Gear Items: 2 types (Hebrew names)
│   │       ├── ערכות ציוד סקי / Ski Equipment → 12 needed, 10 assigned ⚠️
│   │       └── סנובורדים / Snowboards → 6 needed, 3 assigned ⚠️
│   │
│   ├── סוף שבוע פסטיבל האביב 2026 / Spring Festival 2026 (Apr 17-19, 2026)
│   │   ├── Admin: נתן רוזנברג (Natan Rosenberg)
│   │   ├── Attendees: 7 families (largest!)
│   │   │   ├── Rosenberg Family
│   │   │   ├── Mizrahi Family (Vegetarian)
│   │   │   ├── Shafir Family (Severe nut allergies)
│   │   │   ├── Avni Family
│   │   │   ├── Refaeli Family (Halal)
│   │   │   ├── Kaplan Family (Strict vegetarian)
│   │   │   └── Ben-David Family
│   │   ├── Schedule: 11 items across 2 days (Hebrew titles)
│   │   └── Gear Items: None (community center)
│   │
│   └── סיור היסטורי בעיר 2026 / City Tour 2026 (May 23-24, 2026)
│       ├── Admin: שרה כהן (Sarah Cohen - SUPER ADMIN) ⭐
│       ├── Attendees: 4 families
│       │   ├── Admin Family (super admin participating)
│       │   ├── Levi Family
│       │   ├── Baruch Family
│       │   └── Rosenberg Family (Lactose-free)
│       └── Gear Items: None (urban tour)
│
├── Published Future (1)
│   └── מפגש קהילתי משפחתי 2026 / Family Reunion 2026 (Jul 4-6, 2026)
│       ├── Admins: מיכאל אבני (Michael Avni) & אלי בן-דוד (Eli Ben-David) - CO-ADMINS
│       ├── Attendees: 9 families (biggest reunion!)
│       │   ├── Levi, Avni, Mizrahi, Shafir
│       │   ├── Refaeli, Kaplan, Ben-David, Baruch, Rosenberg
│       └── Gear Items: TBD
│
├── Draft Trips (1)
│   └── חופשת חוף 2025 / Beach Getaway 2025 (Aug 20-25, 2025)
│       ├── Admin: אבי מזרחי (Avi Mizrahi)
│       ├── Status: DRAFT (hidden from regular users)
│       ├── Attendees: 2 families
│       │   ├── Mizrahi Family
│       │   └── Shafir Family (Nut allergies)
│       └── Gear Items: None (planning)
│
└── Past Trips (1)
    └── קמפינג יום הזיכרון 2025 / Memorial Day 2025 (May 24-27, 2025) - COMPLETED
        ├── Admin: אבי מזרחי (Avi Mizrahi)
        └── Attendees: 3 families
            ├── Mizrahi Family
            ├── Levi Family
            └── Refaeli Family

DIETARY REQUIREMENTS (21 instances across 40 attendances)
├── Critical Allergies
│   └── מאיה שפיר (Maya Shafir): Severe nut allergies
├── Religious Requirements
│   ├── משפחת רפאלי (Refaeli Family): Halal/Kosher meat required
│   └── משפחת כפלן (Kaplan Family): Jain dietary preferences
├── Dietary Preferences
│   ├── נועה לוי (Noa Levi): Gluten-free
│   ├── משפחת מזרחי (Mizrahi Family): Vegetarian preferred, no pork
│   ├── משפחת מנהל (Admin Family): Vegetarian
│   ├── משפחת כפלן (Kaplan Family): Strict vegetarian, no eggs
│   └── הדס רוזנברג (Hadas Rosenberg): Lactose intolerant

GEAR ASSIGNMENTS (31 total across 3 trips - Hebrew gear names)
Summer Camp:
├── Admin Family: 1 tent, 1 sleeping bag, 1 cooler
├── Levi Family: 2 tents, 4 sleeping bags, 1 stove
├── Avni Family: 1 tent, 3 sleeping bags, 1 stove
├── Mizrahi Family: 1 tent, 5 sleeping bags, 1 stove, 2 coolers
├── Shafir Family: 1 tent, 3 sleeping bags, 2 coolers
├── Refaeli Family: 1 tent, 4 sleeping bags, 1 stove
└── Kaplan Family: 1 tent, 4 sleeping bags, 1 stove, 2 coolers

Winter Retreat:
├── Avni Family: 3 ski sets
├── Levi Family: 4 ski sets
├── Mizrahi Family: 2 snowboards
├── Baruch Family: 2 ski sets
└── Rosenberg Family: 1 ski set, 1 snowboard

Autumn Hiking:
├── Ben-David Family: 4 backpacks, 4 poles
├── Refaeli Family: 4 backpacks, 2 poles
├── Kaplan Family: 4 backpacks, 2 poles
├── Baruch Family: 1 backpack, 1 pole
└── Levi Family: 2 backpacks, 1 pole

TRIP SCHEDULES (48 items total across 4 trips - Hebrew titles)
├── מחנה קיץ 2025 / Summer Camp: 15 items (3 days)
├── מפגש חורף 2026 / Winter Retreat: 13 items (3 days)
├── הרפתקת טיולים בסתיו 2025 / Autumn Hiking: 9 items (2 days)
└── סוף שבוע פסטיבל האביב 2026 / Spring Festival: 11 items (2 days)
```

## Access Control Matrix

| User                  | Role        | Can Access                          | Special Permissions                                              |
| --------------------- | ----------- | ----------------------------------- | ---------------------------------------------------------------- |
| שרה כהן (Sarah Cohen) | SUPER_ADMIN | All trips, All families             | Full system control, approve families, **participates in trips** |
| יוסי לוי (Yossi Levi) | TRIP_ADMIN  | Summer Camp (co-admin), City Tour   | Manage trips, gear, attendees                                    |
| מיכאל אבני (Michael)  | TRIP_ADMIN  | Winter Retreat, Family Reunion      | Manage trips, gear, attendees                                    |
| אבי מזרחי (Avi)       | TRIP_ADMIN  | Beach Getaway (draft), Memorial Day | Manage trips, gear, attendees                                    |
| אלי בן-דוד (Eli)      | TRIP_ADMIN  | Autumn Hiking, Family Reunion       | Manage trips, gear, attendees                                    |
| נתן רוזנברג (Natan)   | TRIP_ADMIN  | Spring Festival                     | Manage trip, gear, attendees                                     |
| Other Adults          | FAMILY      | Their family's data                 | View published trips, manage family                              |
| Children              | FAMILY      | Their family's data                 | Limited access                                                   |
| Pending (Friedman)    | FAMILY      | Limited access                      | Cannot attend trips until approved                               |
| Inactive (Baron)      | FAMILY      | View only                           | Cannot attend trips (inactive family)                            |

## Testing Coverage

✅ **Role-Based Access Control**

- Super Admin can manage everything
- Trip Admins can only manage their specific trips
- Family users can only see their family data
- Co-admins can both manage the same trip

✅ **Trip States**

- Published upcoming trips (5)
- Published future trip (1)
- Draft trips (1 - Beach Getaway)
- Past trips (1 - Memorial Day)

✅ **Family States**

- Approved & Active (9 families)
- Pending approval (Wilson family)
- Inactive (Brown family)

✅ **Dietary Requirements**

- Critical allergies (severe nut allergies)
- Religious requirements (halal, Jain)
- Medical restrictions (lactose intolerance)
- Dietary preferences (vegetarian, gluten-free)

✅ **Trip Schedules**

- Multi-day detailed itineraries
- Time slots (morning, afternoon, evening)
- Specific locations and activities
- Various trip lengths (2-6 days)

✅ **Gear Management**

- Multiple gear categories (camping, ski, hiking)
- Partial assignments (some items not fully covered)
- Multiple families contributing gear
- Quantity tracking

✅ **Trip Attendance**

- Families attending multiple trips
- Trips with varying attendance (3-9 families)
- Draft trip with limited attendance
- Past trip with historical data

✅ **Multi-Admin Trips**

- Family Reunion with 2 co-admins (Avni + Ben-David)
- Summer Camp with super admin + trip admin co-admins (Sarah + Yossi)
- Single admin trips for comparison
- Super admin administering City Tour (as primary admin)

✅ **Super Admin Participation**

- Super admin participates as regular attendee in trips
- Super admin administers trips (City Tour)
- Super admin co-administers trips (Summer Camp with Yossi)
- Can manage all trips but specifically runs one

## Data Statistics

- **Total Users:** 37 (1 super admin, 5 trip admins, 31 family members)
- **Total Families:** 12 (9 active, 1 pending, 1 inactive, 1 super admin family)
- **Total Trips:** 8 (6 published, 1 draft, 1 past)
- **Trip Attendances:** 40+
- **Dietary Requirements:** 21 instances (52.5% coverage)
- **Gear Assignments:** 31 across 3 trips
- **Schedule Items:** 48 across 4 trips (all in Hebrew)
- **Most Active Family:** Levi & Mizrahi (6 trips each)
- **Biggest Event:** Family Reunion (9 families)
- **Smallest Event:** City Tour (4 families, including super admin)
- **Super Admin Trips:** 2 as participant (Summer Camp, City Tour), 1 as admin (City Tour)

## Hebrew Data Notes

All user-facing data is in Hebrew:

- Family names (משפחות)
- Member names (שמות אנשים)
- Trip names and descriptions
- Gear item names (ציוד)
- Schedule item titles and descriptions

Technical data remains in English:

- Email addresses
- Role names (SUPER_ADMIN, TRIP_ADMIN, FAMILY)
- Status fields (APPROVED, PENDING, INACTIVE)
- Database field names
- Code structure and comments

```

```
