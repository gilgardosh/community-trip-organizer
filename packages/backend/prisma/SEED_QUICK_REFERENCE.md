# Seed Data Quick Reference

Quick reference for all seed data - perfect for testing and development.

**Default password for ALL users: `password123`**

---

## 🔐 Login Credentials

### Super Admin

```
Email: admin@example.com
Name: שרה כהן (Sarah Cohen)
Role: SUPER_ADMIN
Trips: Summer Camp (co-admin), City Tour (admin)
```

### Trip Admins

```
john.johnson@example.com     - יוסי לוי (Yossi Levi)        - Summer Camp (co-admin), City Tour
michael.smith@example.com    - מיכאל אבני (Michael Avni)    - Winter Retreat, Family Reunion (co-admin)
carlos.garcia@example.com    - אבי מזרחי (Avi Mizrahi)      - Beach Getaway (draft), Memorial Day (past)
luis.rodriguez@example.com   - אלי בן-דוד (Eli Ben-David)  - Autumn Hiking, Family Reunion (co-admin)
mark.anderson@example.com    - נתן רוזנברג (Natan Rosenberg) - Spring Festival
```

### Regular Users

```
jane.johnson@example.com     - רחל לוי (Rachel Levi)
sarah.smith@example.com      - שירה אבני (Shira Avni)
david.chen@example.com       - דוד שפיר (David Shafir) - Family with nut allergies
james.lee@example.com        - עמית רפאלי (Amit Refaeli) - Kosher requirements
raj.patel@example.com        - גיל כפלן (Gil Kaplan) - Vegetarian family
daniel.kim@example.com       - יניב ברוך (Yaniv Baruch)
```

### Special Status

```
robert.wilson@example.com    - רון פרידמן (Ron Friedman) - PENDING approval
thomas.brown@example.com     - אריאל ברון (Ariel Baron) - INACTIVE
```

---

## 👨‍👩‍👧‍👦 Families at a Glance

| Family                    | Members | Status     | Trips | Dietary Notes                    |
| ------------------------- | ------- | ---------- | ----- | -------------------------------- |
| משפחת מנהל (Admin)        | 1       | ✓ Active   | 2     | Vegetarian                       |
| משפחת לוי (Levi)          | 4       | ✓ Active   | 6     | Gluten-free (Noa)                |
| משפחת אבני (Avni)         | 3       | ✓ Active   | 4     | -                                |
| משפחת מזרחי (Mizrahi)     | 5       | ✓ Active   | 6     | Vegetarian preferred, no pork    |
| משפחת שפיר (Shafir)       | 3       | ✓ Active   | 4     | **Severe nut allergies** (Maya)  |
| משפחת פרידמן (Friedman)   | 2       | ⏳ Pending | 0     | -                                |
| משפחת ברון (Baron)        | 1       | ✗ Inactive | 0     | -                                |
| משפחת בן-דוד (Ben-David)  | 4       | ✓ Active   | 3     | -                                |
| משפחת רפאלי (Refaeli)     | 4       | ✓ Active   | 5     | Kosher/Halal meat                |
| משפחת כפלן (Kaplan)       | 4       | ✓ Active   | 4     | Strict vegetarian, no eggs, Jain |
| משפחת רוזנברג (Rosenberg) | 3       | ✓ Active   | 4     | Lactose intolerant (Hadas)       |
| משפחת ברוך (Baruch)       | 3       | ✓ Active   | 4     | -                                |

**Total:** 12 families, 37 members

---

## 🗓️ Trips Overview

| Trip                                             | Dates           | Status       | Families | Admin(s)                  | Gear   | Schedule   |
| ------------------------------------------------ | --------------- | ------------ | -------- | ------------------------- | ------ | ---------- |
| **מחנה קיץ 2025** (Summer Camp)                  | Jul 15-20, 2025 | 📢 Published | 7        | Yossi + Sarah (co-admins) | ✓ 100% | ✓ 15 items |
| **מפגש חורף 2026** (Winter Retreat)              | Jan 10-15, 2026 | 📢 Published | 5        | Michael                   | ⚠️ 72% | ✓ 13 items |
| **חופשת חוף 2025** (Beach Getaway)               | Aug 20-25, 2025 | 📝 Draft     | 2        | Avi                       | -      | -          |
| **הרפתקת טיולים בסתיו 2025** (Autumn Hiking)     | Oct 12-15, 2025 | 📢 Published | 5        | Eli                       | ✓ 100% | ✓ 9 items  |
| **סוף שבוע פסטיבל האביב 2026** (Spring Festival) | Apr 17-19, 2026 | 📢 Published | 7        | Natan                     | N/A    | ✓ 11 items |
| **סיור היסטורי בעיר 2026** (City Tour)           | May 23-24, 2026 | 📢 Published | 4        | Sarah (super admin)       | N/A    | -          |
| **מפגש קהילתי משפחתי 2026** (Family Reunion)     | Jul 4-6, 2026   | 📢 Published | 9        | Michael + Eli (co-admins) | TBD    | TBD        |
| **קמפינג יום הזיכרון 2025** (Memorial Day)       | May 24-27, 2025 | 🕐 Past      | 3        | Avi                       | -      | -          |

---

## 🎒 Gear Requirements

### Summer Camp (100% covered)

- ✓ אוהלים (Tents, 4-person): 8/8
- ✓ שקי שינה (Sleeping Bags): 24/24
- ✓ כיריים קמפינג (Camp Stoves): 5/5
- ✓ צידניות (Coolers, Large): 7/7

### Winter Retreat (72% covered)

- ⚠️ ערכות ציוד סקי (Ski Equipment): 10/12
- ⚠️ סנובורדים (Snowboards): 3/6

### Autumn Hiking (100% covered)

- ✓ תיקי גב לטיולים (Hiking Backpacks): 15/15
- ✓ מקלות טיול (Trekking Poles): 10/10

---

## 🍽️ Dietary Requirements Summary

| Requirement                 | Families Affected      | Trips Affected      |
| --------------------------- | ---------------------- | ------------------- |
| Vegetarian (preference)     | Admin, Mizrahi, Kaplan | 15 trip attendances |
| Gluten-free                 | Levi (Noa)             | 6 trip attendances  |
| **Severe nut allergies**    | Shafir (Maya)          | 4 trip attendances  |
| Kosher/Halal meat           | Refaeli                | 5 trip attendances  |
| Lactose intolerant          | Rosenberg (Hadas)      | 4 trip attendances  |
| Strict vegetarian (no eggs) | Kaplan                 | 4 trip attendances  |
| Jain dietary preferences    | Kaplan                 | 4 trip attendances  |
| No pork                     | Mizrahi                | 6 trip attendances  |

**Total:** 21 out of 40 trip attendances have dietary requirements (52.5%)

---

## 📅 Sample Schedules

### Summer Camp - Day 1 (Jul 15)

```
09:00 - הגעה והקמה (Arrival & Setup) - Main Campground
12:00 - ארוחת צהריים (Lunch) - Dining Pavilion
14:00 - פעילויות באגם (Lake Activities) - Lakeshore
18:00 - ארוחת ערב (Dinner) - Dining Pavilion
20:00 - מדורה (Campfire) - Fire Circle
```

### Winter Retreat - Day 1 (Jan 10)

```
10:00 - צ'ק-אין (Check-in) - Lodge Lobby
13:00 - ארוחת צהריים (Lunch) - Main Dining Hall
15:00 - ארוחת ברוכים הבאים (Welcome Dinner) - Main Dining Hall
19:00 - קקאו חם ופעילות הכרות (Hot Cocoa Social) - Fireside Lounge
```

### Spring Festival - Day 1 (Apr 17)

```
09:00 - טקס פתיחה (Opening Ceremony) - Main Stage
10:30 - יריד תרבות (Cultural Fair) - Exhibition Hall
12:00 - פעילויות לילדים (Kids Activities) - Children's Area
14:00 - הופעות מוזיקליות (Musical Performances) - Main Stage
18:00 - ארוחת ערב קהילתית (Community Dinner) - Dining Hall
```

---

## 🧪 Test Scenarios

### Authentication & Roles

✓ Super admin login and system management  
✓ Super admin participating in trips  
✓ Super admin administering a trip  
✓ Trip admin managing multiple trips  
✓ Co-admin collaboration (Family Reunion, Summer Camp)  
✓ Regular user access and restrictions

### Family Management

✓ Pending approval workflow (Friedman family)  
✓ Inactive family filtering (Baron family)  
✓ Family with severe allergies (Shafir)  
✓ Large families (Mizrahi - 5 members)  
✓ Single-member families (Admin, Baron)

### Trip Features

✓ Published upcoming trips (5 trips)  
✓ Draft trip visibility (Beach Getaway)  
✓ Past trip data (Memorial Day)  
✓ Dietary requirements tracking (21 attendances)  
✓ Gear assignments and shortfalls  
✓ Detailed schedules (48 items across 4 trips)  
✓ Photo albums (4 trips)

### Edge Cases

✓ Super admin as both participant and admin  
✓ Trips with cutoff dates  
✓ Multiple trip admins (co-admin model)  
✓ Missing gear coverage (Winter Retreat)  
✓ Trips without schedules (City Tour, Family Reunion)  
✓ Family participating in 6+ trips (Levi, Mizrahi)

---

## 📊 Statistics

- **Total Users:** 37 (1 super admin, 5 trip admins, 31 regular)
- **Total Families:** 12 (9 active approved, 1 pending, 1 inactive, 1 admin family)
- **Total Trips:** 8 (6 published, 1 draft, 1 past)
- **Trip Attendances:** 40+ with dietary info
- **Gear Items:** 8 types, 31 assignments
- **Schedule Items:** 48 across 4 trips
- **Most Popular Trip:** Family Reunion (9 families)
- **Most Active Families:** Levi, Mizrahi (6 trips each)

---

## 🚀 Quick Start

1. **Reset and seed database:**

   ```bash
   cd packages/backend
   yarn db:reset && yarn db:seed
   ```

2. **Login as super admin:**
   - Email: `admin@example.com`
   - Password: `password123`

3. **Try different scenarios:**
   - Manage trips as super admin
   - Participate in trips as super admin
   - Manage co-admin trips (Summer Camp, Family Reunion)
   - Approve pending family (Friedman)
   - View draft trip as admin (Beach Getaway)
   - Check gear shortfalls (Winter Retreat)

---

**Hebrew Data includes:**

- Family names (משפחות)
- Member names (שמות)
- Trip names and descriptions
- Gear items (ציוד)
- Schedule items (לוח זמנים)

**English remains for:**

- Email addresses
- Technical fields
- Code and documentation
- File names and structure
