# Seed Data Documentation# מסמך נתוני הזריעה / Seed Data Documentation# Seed Data Documentation

This document describes the comprehensive development seed data for testing and development.

## Running the Seed Scriptמסמך זה מתאר את נתוני הזריעה המקיפים לפיתוח ובדיקות.This document describes the comprehensive development seed data for testing and development.

From the backend directory, run:

```bashThis document describes the comprehensive development seed data for testing and development.## Running the Seed Script

yarn db:seed

```

## Default Password## הרצת סקריפט הזריעה / Running the Seed ScriptFrom the backend directory, run:

**All users have the same password: `password123`**

## Summary Statistics`bash`bash

- **1 Super Admin** (participates in 2 trips, administers 1 trip)yarn db:seedyarn db:seed

- **11 Families** (9 active approved, 1 pending, 1 inactive)

- **8 Trips** (6 published, 1 draft, 1 past)``````

- **5 Trip Admins**

- **40+ Trip Attendances** with dietary requirements

- **31 Gear Assignments** across 3 trips

- **48 Schedule Items** across 4 trips## סיסמה ברירת מחדל / Default Password## Default Password

## Features Demonstrated

✓ **Dietary Requirements Tracking** - Multiple families with various dietary needs **לכל המשתמשים: `password123`** / **All users: `password123`\*\***All users have the same password: `password123`\*\*

✓ **Detailed Trip Schedules** - Day-by-day itineraries with times and locations

✓ **Multiple Trip Admins** - Some trips have co-admins

✓ **Comprehensive Gear Management** - Gear items and family assignments

✓ **Draft and Published Trips** - Different trip statuses ## סטטיסטיקות / Statistics## Summary Statistics

✓ **Past Trips** - Historical data for completed trips

✓ **Diverse Family Structures** - Various family sizes and compositions

✓ **Super Admin Participation** - Super admin participates in trips and manages one

- 1 מנהל על (משתתפת ב-2 טיולים, מנהלת אחד) / 1 Super Admin (participates in 2 trips, admins 1)- **1 Super Admin**

---

- 11 משפחות / 11 Families- **11 Families** (9 active approved, 1 pending, 1 inactive)

## Users & Families

- 8 טיולים / 8 Trips - **8 Trips** (6 published, 1 draft, 1 past)

### Super Admin

- 5 מנהלי טיולים / 5 Trip Admins- **5 Trip Admins**

- **Email:** admin@example.com

- **Name:** שרה כהן (Sarah Cohen)- 40+ השתתפויות / 40+ Attendances- **40+ Trip Attendances** with dietary requirements

- **Role:** SUPER_ADMIN

- **Family:** משפחת מנהל (Admin Family)- 31 הקצאות ציוד / 31 Gear Assignments- **31 Gear Assignments** across 3 trips

- **Participating in:** Summer Camp 2025, Historical City Tour 2026

- **Administering:** Historical City Tour 2026 (as super admin)- 48 פריטי לוח זמנים / 48 Schedule Items- **48 Schedule Items** across 4 trips

### Trip Admins

1. **יוסי לוי (Yossi Levi)** - `john.johnson@example.com`## משפחות / Families## Features Demonstrated
   - Role: TRIP_ADMIN

   - Admin of: Summer Camp 2025 (co-admin with super admin), Historical City Tour 2026

   - Family: משפחת לוי (The Levi Family) - 4 members

### מנהל על / Super Admin✓ **Dietary Requirements Tracking** - Multiple families with various dietary needs

2. **מיכאל אבני (Michael Avni)** - `michael.smith@example.com`
   - Role: TRIP_ADMIN**שרה כהן** (Sarah Cohen) - admin@example.com - משפחת מנהל ✓ **Detailed Trip Schedules** - Day-by-day itineraries with times and locations

   - Admin of: Winter Retreat 2026, Community Family Reunion 2026 (co-admin)

   - Family: משפחת אבני (The Avni Family) - 3 membersמשתתפת ב: מחנה קיץ, סיור בעיר | מנהלת: סיור בעיר✓ **Multiple Trip Admins** - Some trips have co-admins

3. **אבי מזרחי (Avi Mizrahi)** - `carlos.garcia@example.com`✓ **Comprehensive Gear Management** - Gear items and family assignments
   - Role: TRIP_ADMIN

   - Admin of: Beach Getaway 2025 (draft), Memorial Day Camping 2025 (past)### מנהלי טיולים / Trip Admins✓ **Draft and Published Trips** - Different trip statuses

   - Family: משפחת מזרחי (The Mizrahi Family) - 5 members

✓ **Past Trips** - Historical data for completed trips

4. **אלי בן-דוד (Eli Ben-David)** - `luis.rodriguez@example.com`
   - Role: TRIP_ADMIN1. **יוסי לוי** (Yossi Levi) - john.johnson@example.com - משפחת לוי (4)✓ **Diverse Family Structures** - Various family sizes and compositions

   - Admin of: Autumn Hiking Adventure 2025, Community Family Reunion 2026 (co-admin)

   - Family: משפחת בן-דוד (The Ben-David Family) - 4 members - מנהל: מחנה קיץ (+ מנהלת על), סיור בעיר

5. **נתן רוזנברג (Natan Rosenberg)** - `mark.anderson@example.com`---
   - Role: TRIP_ADMIN

   - Admin of: Spring Festival Weekend 20262. **מיכאל אבני** (Michael Avni) - michael.smith@example.com - משפחת אבני (3)

   - Family: משפחת רוזנברג (The Rosenberg Family) - 3 members

   - מנהל: מפגש חורף, מפגש משפחתי (מנהל משותף)## Users & Families

---

### All Families

3. **אבי מזרחי** (Avi Mizrahi) - carlos.garcia@example.com - משפחת מזרחי (5)### Super Admin

#### 1. משפחת מנהל / Admin Family (1 member) - APPROVED, ACTIVE

- מנהל: חופשת חוף (טיוטה), יום הזיכרון (עבר)

- שרה כהן (Sarah Cohen) - Adult, 45 - `admin@example.com` - **SUPER_ADMIN**

- **Email:** admin@example.com

**Attending:** Summer Camp, City Tour

4. **אלי בן-דוד** (Eli Ben-David) - luis.rodriguez@example.com - משפחת בן-דוד (4)- **Name:** Sarah Admin

#### 2. משפחת לוי / The Levi Family (4 members) - APPROVED, ACTIVE

- מנהל: הרפתקת סתיו, מפגש משפחתי (מנהל משותף)- **Role:** SUPER_ADMIN

- יוסי לוי (Yossi Levi) - Adult, 42 - `john.johnson@example.com` - **TRIP_ADMIN**

- רחל לוי (Rachel Levi) - Adult, 40 - `jane.johnson@example.com`- **Family:** Admin Family

- דניאל לוי (Daniel Levi) - Child, 12 - `jimmy.johnson@child.local`

- נועה לוי (Noa Levi) - Child, 9 - `jenny.johnson@child.local`5. **נתן רוזנברג** (Natan Rosenberg) - mark.anderson@example.com - משפחת רוזנברג (3)

**Attending:** Summer Camp, Winter Retreat, Autumn Hiking, City Tour, Family Reunion, Memorial Day (past) - מנהל: פסטיבל האביב### Trip Admins

#### 3. משפחת אבני / The Avni Family (3 members) - APPROVED, ACTIVE

- מיכאל אבני (Michael Avni) - Adult, 38 - `michael.smith@example.com` - **TRIP_ADMIN**### כל המשפחות / All Families1. **John Johnson** - `john.johnson@example.com`

- שירה אבני (Shira Avni) - Adult, 36 - `sarah.smith@example.com`

- תמר אבני (Tamar Avni) - Child, 7 - `sophie.smith@child.local` - Role: TRIP_ADMIN

**Attending:** Summer Camp, Winter Retreat, Spring Festival, Family Reunion| משפחה / Family | חברים | סטטוס | דרישות תזונתיות | - Admin of: Summer Camp 2025, Historical City Tour 2026

#### 4. משפחת מזרחי / The Mizrahi Family (5 members) - APPROVED, ACTIVE|---|---|---|---| - Family: The Johnsons (4 members)

- אבי מזרחי (Avi Mizrahi) - Adult, 45 - `carlos.garcia@example.com` - **TRIP_ADMIN**| **משפחת מנהל** / Admin Family (1) | שרה כהן / Sarah Cohen (45) | מאושר, פעיל | צמחוני / Vegetarian |

- מיכל מזרחי (Michal Mizrahi) - Adult, 43 - `maria.garcia@example.com`

- אייל מזרחי (Eyal Mizrahi) - Child, 15 - `diego.garcia@child.local`| **משפחת לוי** / Levi (4) | יוסי (42), רחל (40), דניאל (12), נועה (9) | מאושר, פעיל | ללא גלוטן - נועה |2. **Michael Smith** - `michael.smith@example.com`

- ליאור מזרחי (Lior Mizrahi) - Child, 13 - `isabella.garcia@child.local`

- יונתן מזרחי (Yonatan Mizrahi) - Child, 8 - `lucas.garcia@child.local`| **משפחת אבני** / Avni (3) | מיכאל (38), שירה (36), תמר (7) | מאושר, פעיל | - | - Role: TRIP_ADMIN

**Attending:** Summer Camp, Winter Retreat, Beach Getaway (draft), Spring Festival, Family Reunion, Memorial Day (past)| **משפחת מזרחי** / Mizrahi (5) | אבי (45), מיכל (43), אייל (15), ליאור (13), יונתן (8) | מאושר, פעיל | צמחוני מועדף | - Admin of: Winter Retreat 2026, Community Family Reunion 2026 (co-admin)

#### 5. משפחת שפיר / The Shafir Family (3 members) - APPROVED, ACTIVE| **משפחת שפיר** / Shafir (3) | דוד (35), עדי (33), מאיה (6) | מאושר, פעיל | אלרגיות חמורות לאגוזים - מאיה | - Family: The Smiths (3 members)

- דוד שפיר (David Shafir) - Adult, 35 - `david.chen@example.com`| **משפחת פרידמן** / Friedman (2) | רון (50), ענת (48) | **ממתין לאישור**, פעיל | - |

- עדי שפיר (Adi Shafir) - Adult, 33 - `lisa.chen@example.com`

- מאיה שפיר (Maya Shafir) - Child, 6 - `emily.chen@child.local`| **משפחת ברון** / Baron (1) | אריאל (55) | מאושר, **לא פעיל** | - |3. **Carlos Garcia** - `carlos.garcia@example.com`

**Attending:** Summer Camp, Beach Getaway (draft), Spring Festival, Family Reunion | **משפחת בן-דוד** / Ben-David (4) | אלי (41), אנה (39), עומר (11), שני (14) | מאושר, פעיל | - | - Role: TRIP_ADMIN

**Dietary:** Severe nut allergies - Maya

| **משפחת רפאלי** / Refaeli (4) | עמית (44), ליאת (42), איתי (10), רוני (8) | מאושר, פעיל | כשר | - Admin of: Beach Getaway 2025 (draft), Memorial Day Camping 2025 (past)

#### 6. משפחת פרידמן / The Friedman Family (2 members) - PENDING, ACTIVE

| **משפחת כפלן** / Kaplan (4) | גיל (37), דנה (35), עדן (9), טל (5) | מאושר, פעיל | צמחוני קפדן, ג'ייני | - Family: The Garcia Family (5 members)

- רון פרידמן (Ron Friedman) - Adult, 50 - `robert.wilson@example.com`

- ענת פרידמן (Anat Friedman) - Adult, 48 - `emma.wilson@example.com`| **משפחת רוזנברג** / Rosenberg (3) | נתן (46), הדס (44), אור (16) | מאושר, פעיל | אי סבילות ללקטוז - הדס |

**Status:** Pending approval - not attending any trips yet| **משפחת ברוך** / Baruch (3) | יניב (40), כרמל (38), אלמוג (12) | מאושר, פעיל | - |4. **Luis Rodriguez** - `luis.rodriguez@example.com`

#### 7. משפחת ברון / The Baron Family (1 member) - APPROVED, INACTIVE - Role: TRIP_ADMIN

- אריאל ברון (Ariel Baron) - Adult, 55 - `thomas.brown@example.com`## טיולים / Trips - Admin of: Autumn Hiking Adventure 2025, Community Family Reunion 2026 (co-admin)

**Status:** Inactive family - not attending any trips - Family: The Rodriguez Family (4 members)

#### 8. משפחת בן-דוד / The Ben-David Family (4 members) - APPROVED, ACTIVE### 1. מחנה קיץ 2025 / Summer Camp 2025

- אלי בן-דוד (Eli Ben-David) - Adult, 41 - `luis.rodriguez@example.com` - **TRIP_ADMIN\*\***15-20 ביולי** | חניון אגם ההרים | **מנהלים:** יוסי לוי + שרה כהן (מנהלת על) 5. **Mark Anderson\*\* - `mark.anderson@example.com`

- אנה בן-דוד (Ana Ben-David) - Adult, 39 - `ana.rodriguez@example.com`

- עומר בן-דוד (Omer Ben-David) - Child, 11 - `miguel.rodriguez@child.local`**משתתפים (7):** מנהל, לוי, אבני, מזרחי, שפיר, רפאלי, כפלן - Role: TRIP_ADMIN

- שני בן-דוד (Shani Ben-David) - Child, 14 - `sofia.rodriguez@child.local`

**ציוד:** 8 אוהלים, 24 שקי שינה, 5 כיריים, 7 צידניות - **100% מכוסה ✓** - Admin of: Spring Festival Weekend 2026

**Attending:** Autumn Hiking, Spring Festival, Family Reunion

**לוח זמנים:** 15 פריטים ב-3 ימים - Family: The Anderson Family (3 members)

#### 9. משפחת רפאלי / The Refaeli Family (4 members) - APPROVED, ACTIVE

- עמית רפאלי (Amit Refaeli) - Adult, 44 - `james.lee@example.com`

- ליאת רפאלי (Liat Refaeli) - Adult, 42 - `michelle.lee@example.com`### 2. מפגש חורף 2026 / Winter Retreat 2026---

- איתי רפאלי (Itay Refaeli) - Child, 10 - `kevin.lee@child.local`

- רוני רפאלי (Roni Refaeli) - Child, 8 - `amy.lee@child.local`**10-15 בינואר** | אכסניית פסגות השלג | **מנהל:** מיכאל אבני

**Attending:** Summer Camp, Autumn Hiking, Spring Festival, Family Reunion, Memorial Day (past) **משתתפים (5):** אבני, מזרחי, לוי, ברוך, רוזנברג ### All Families

**Dietary:** Halal/Kosher meat required

**ציוד:** 10/12 סקי, 3/6 סנובורד - **72% מכוסה**

#### 10. משפחת כפלן / The Kaplan Family (4 members) - APPROVED, ACTIVE

**לוח זמנים:** 13 פריטים ב-3 ימים#### 1. The Johnsons (4 members) - APPROVED, ACTIVE

- גיל כפלן (Gil Kaplan) - Adult, 37 - `raj.patel@example.com`

- דנה כפלן (Dana Kaplan) - Adult, 35 - `priya.patel@example.com`

- עדן כפלן (Eden Kaplan) - Child, 9 - `aisha.patel@child.local`

- טל כפלן (Tal Kaplan) - Child, 5 - `arjun.patel@child.local`### 3. חופשת חוף 2025 / Beach Getaway 2025 **(טיוטה / DRAFT)**- John Johnson (Adult, 42) - `john.johnson@example.com` - **TRIP_ADMIN**

**Attending:** Summer Camp, Autumn Hiking, Spring Festival, Family Reunion **20-25 באוגוסט** | חוף החולות המבריקים | **מנהל:** אבי מזרחי - Jane Johnson (Adult, 40) - `jane.johnson@example.com`

**Dietary:** Strict vegetarian, no eggs, Jain dietary preferences

**משתתפים (2):** מזרחי, שפיר- Jimmy Johnson (Child, 12) - `jimmy.johnson@child.local`

#### 11. משפחת רוזנברג / The Rosenberg Family (3 members) - APPROVED, ACTIVE

- Jenny Johnson (Child, 9) - `jenny.johnson@child.local`

- נתן רוזנברג (Natan Rosenberg) - Adult, 46 - `mark.anderson@example.com` - **TRIP_ADMIN**

- הדס רוזנברג (Hadas Rosenberg) - Adult, 44 - `jennifer.anderson@example.com`### 4. הרפתקת טיולים בסתיו 2025 / Autumn Hiking Adventure 2025

- אור רוזנברג (Or Rosenberg) - Child, 16 - `tyler.anderson@child.local`

**12-15 באוקטובר** | קניון הסלעים האדומים | **מנהל:** אלי בן-דוד **Attending:** Summer Camp, Winter Retreat, Autumn Hiking, City Tour, Family Reunion, Memorial Day (past)

**Attending:** Winter Retreat, Spring Festival, City Tour, Family Reunion

**Dietary:** Lactose intolerant - Hadas**משתתפים (5):** בן-דוד, רפאלי, כפלן, ברוך, לוי

#### 12. משפחת ברוך / The Baruch Family (3 members) - APPROVED, ACTIVE**ציוד:** 15/15 תיקי גב, 10/10 מקלות - **100% מכוסה ✓** #### 2. The Smiths (3 members) - APPROVED, ACTIVE

- יניב ברוך (Yaniv Baruch) - Adult, 40 - `daniel.kim@example.com`**לוח זמנים:** 9 פריטים ב-2 ימים

- כרמל ברוך (Carmel Baruch) - Adult, 38 - `hannah.kim@example.com`

- אלמוג ברוך (Almog Baruch) - Child, 12 - `grace.kim@child.local`- Michael Smith (Adult, 38) - `michael.smith@example.com` - **TRIP_ADMIN**

**Attending:** Winter Retreat, Autumn Hiking, City Tour, Family Reunion### 5. סוף שבוע פסטיבל האביב 2026 / Spring Festival Weekend 2026- Sarah Smith (Adult, 36) - `sarah.smith@example.com`

---**17-19 באפריל** | מרכז קהילתי עמק הפריחה | **מנהל:** נתן רוזנברג - Sophie Smith (Child, 7) - `sophie.smith@child.local`

## Trips**משתתפים (7):** רוזנברג, מזרחי, שפיר, אבני, רפאלי, כפלן, בן-דוד

### 1. מחנה קיץ 2025 / Summer Camp 2025 (Published, Upcoming)**לוח זמנים:** 11 פריטים ב-2 ימים**Attending:** Summer Camp, Winter Retreat, Spring Festival, Family Reunion

- **Location:** חניון אגם ההרים (Mountain Lake Campground)

- **Dates:** July 15-20, 2025 (6 days)

- **Status:** Published### 6. סיור היסטורי בעיר 2026 / Historical City Tour 2026#### 3. The Garcia Family (5 members) - APPROVED, ACTIVE

- **Cutoff Date:** June 30, 2025

- **Admins:** יוסי לוי (Yossi Levi) + שרה כהן (Sarah Cohen - Super Admin)**23-24 במאי** | מחוז המורשת | **מנהל:** שרה כהן (מנהלת על)

- **Photo Album:** https://photos.example.com/summer-camp-2025

- **Attendees:** 7 families (23+ people)**משתתפים (4):** מנהל, לוי, ברוך, רוזנברג- Carlos Garcia (Adult, 45) - `carlos.garcia@example.com` - **TRIP_ADMIN**
  - Admin Family (Vegetarian)

  - Levi (Gluten-free for Noa)- Maria Garcia (Adult, 43) - `maria.garcia@example.com`

  - Avni

  - Mizrahi (Vegetarian meals preferred, no pork)### 7. מפגש קהילתי משפחתי 2026 / Community Family Reunion 2026- Diego Garcia (Child, 15) - `diego.garcia@child.local`

  - Shafir (Nut allergies - Maya)

  - Refaeli (Kosher meat required)**4-6 ביולי** | פארק ריברסייד | **מנהלים משותפים:** מיכאל אבני + אלי בן-דוד - Isabella Garcia (Child, 13) - `isabella.garcia@child.local`

  - Kaplan (Vegetarian family, no eggs)

**משתתפים (9):** לוי, אבני, מזרחי, שפיר, רפאלי, כפלן, בן-דוד, ברוך, רוזנברג- Lucas Garcia (Child, 8) - `lucas.garcia@child.local`

**Gear Items:**

- אוהלים (ל-4 אנשים) / Tents (4-person): 8 needed → 8 assigned ✓

- שקי שינה / Sleeping Bags: 24 needed → 24 assigned ✓

- כיריים קמפינג / Camp Stoves: 5 needed → 5 assigned ✓### 8. קמפינג יום הזיכרון 2025 / Memorial Day Camping 2025 **(עבר / PAST)\*\***Attending:\*\* Summer Camp, Winter Retreat, Beach Getaway (draft), Spring Festival, Family Reunion, Memorial Day (past)

- צידניות (גדולות) / Coolers (Large): 7 needed → 7 assigned ✓

**24-27 במאי** | חניון שפת האגם | **מנהל:** אבי מזרחי

**Schedule:** 15 items across 3 days

- Day 1: Arrival & setup, lake activities, campfire**משתתפים (3):** מזרחי, לוי, רפאלי#### 4. The Chen Family (3 members) - APPROVED, ACTIVE

- Day 2: Morning hike, free time, talent show

- Day 3: Scavenger hunt, departure

### 2. מפגש חורף 2026 / Winter Retreat 2026 (Published, Future)## תרחישי בדיקה / Testing Scenarios- David Chen (Adult, 35) - `david.chen@example.com`

- **Location:** אכסניית פסגות השלג (Snowy Peaks Lodge)- Lisa Chen (Adult, 33) - `lisa.chen@example.com`

- **Dates:** January 10-15, 2026 (6 days)

- **Status:** Published✅ **גישה מבוססת תפקידים** - מנהל על, 5 מנהלי טיולים, משתמשים רגילים - Emily Chen (Child, 6) - `emily.chen@child.local`

- **Cutoff Date:** December 20, 2025

- **Admin:** מיכאל אבני (Michael Avni)✅ **סטטוסי משפחה** - 9 פעילות, 1 ממתינה, 1 לא פעילה

- **Attendees:** 5 families
  - Avni✅ **סטטוסי טיול** - 6 מפורסמים, 1 טיוטה, 1 עבר **Attending:** Summer Camp, Beach Getaway (draft), Spring Festival, Family Reunion

  - Mizrahi (Vegetarian preferred)

  - Levi (Gluten-free options needed)✅ **דרישות תזונתיות** - 21/40 השתתפויות (52.5%) **Dietary:** Severe nut allergies (Emily)

  - Baruch

  - Rosenberg (Lactose intolerant - Hadas)✅ **לוחות זמנים** - 4 טיולים עם מסלולים מפורטים

**Gear Items:**✅ **ניהול ציוד** - 3 טיולים עם הקצאות #### 5. The Wilson Family (2 members) - PENDING, ACTIVE

- ערכות ציוד סקי / Ski Equipment Sets: 12 needed → 10 assigned (2 short)

- סנובורדים / Snowboards: 6 needed → 3 assigned (3 short)✅ **מנהלים משותפים** - מפגש משפחתי עם 2 מנהלים

**Schedule:** 13 items across 3 days✅ **מנהל על משתתף** - שרה כהן משתתפת ב-2 טיולים, מנהלת אחד- Robert Wilson (Adult, 50) - `robert.wilson@example.com`

- Day 1: Check-in, welcome dinner, hot cocoa

- Day 2: Skiing/snowboarding sessions, movie night- Emma Wilson (Adult, 48) - `emma.wilson@example.com`

- Day 3: Final ski session, farewell brunch

## פרטי כניסה / Login Credentials

### 3. חופשת חוף 2025 / Beach Getaway 2025 (Draft)

**Status:** Pending approval - not attending any trips yet

- **Location:** חוף החולות המבריקים (Sunny Shores Beach)

- **Dates:** August 20-25, 2025 (6 days)**סיסמה לכולם: password123**

- **Status:** **DRAFT** (not published, hidden from regular users)

- **Cutoff Date:** August 1, 2025#### 6. The Brown Family (1 member) - APPROVED, INACTIVE

- **Admin:** אבי מזרחי (Avi Mizrahi)

- **Attendees:** 2 families- **מנהל על:** admin@example.com
  - Mizrahi

  - Shafir (Nut allergies)- **מנהלי טיולים:** john.johnson@example.com, michael.smith@example.com, carlos.garcia@example.com, luis.rodriguez@example.com, mark.anderson@example.com- Thomas Brown (Adult, 55) - `thomas.brown@example.com`

**Gear Items:** None yet (still in planning) - **משתמשים רגילים:** david.chen@example.com, james.lee@example.com, raj.patel@example.com, daniel.kim@example.com

**Schedule:** None yet (still in planning)

- **סטטוס מיוחד:** robert.wilson@example.com (ממתין), thomas.brown@example.com (לא פעיל)**Status:** Inactive family - not attending any trips

### 4. הרפתקת טיולים בסתיו 2025 / Autumn Hiking Adventure 2025 (Published, Upcoming)

- **Location:** הפארק הלאומי קניון הסלעים האדומים (Red Rock Canyon National Park)

- **Dates:** October 12-15, 2025 (4 days)---#### 7. The Rodriguez Family (4 members) - APPROVED, ACTIVE

- **Status:** Published

- **Cutoff Date:** October 1, 2025

- **Admin:** אלי בן-דוד (Eli Ben-David)

- **Photo Album:** https://photos.example.com/autumn-hiking-2025**עודכן:** 8 באוקטובר 2025 | **תואם ל:** כל התכונות האחרונות- Luis Rodriguez (Adult, 41) - `luis.rodriguez@example.com` - **TRIP_ADMIN\*\*

- **Attendees:** 5 families
  - Ben-David- Ana Rodriguez (Adult, 39) - `ana.rodriguez@example.com`

  - Refaeli (Kosher meals)- Miguel Rodriguez (Child, 11) - `miguel.rodriguez@child.local`

  - Kaplan (Vegetarian, Jain dietary preferences)- Sofia Rodriguez (Child, 14) - `sofia.rodriguez@child.local`

  - Baruch

  - Levi (Gluten-free)**Attending:** Autumn Hiking, Spring Festival, Family Reunion

**Gear Items:**#### 8. The Lee Family (4 members) - APPROVED, ACTIVE

- תיקי גב לטיולים / Hiking Backpacks: 15 needed → 15 assigned ✓

- מקלות טיול / Trekking Poles: 10 needed → 10 assigned ✓- James Lee (Adult, 44) - `james.lee@example.com`

- Michelle Lee (Adult, 42) - `michelle.lee@example.com`

**Schedule:** 9 items across 2 days- Kevin Lee (Child, 10) - `kevin.lee@child.local`

- Day 1: Canyon rim hike, photography walk, dinner out- Amy Lee (Child, 8) - `amy.lee@child.local`

- Day 2: Waterfall trail hike, departure

**Attending:** Summer Camp, Autumn Hiking, Spring Festival, Family Reunion, Memorial Day (past)

### 5. סוף שבוע פסטיבל האביב 2026 / Spring Festival Weekend 2026 (Published, Future)**Dietary:** Halal meat required

- **Location:** מרכז קהילתי עמק הפריחה (Blossom Valley Community Center)#### 9. The Patel Family (4 members) - APPROVED, ACTIVE

- **Dates:** April 17-19, 2026 (3 days)

- **Status:** Published- Raj Patel (Adult, 37) - `raj.patel@example.com`

- **Cutoff Date:** April 10, 2026- Priya Patel (Adult, 35) - `priya.patel@example.com`

- **Admin:** נתן רוזנברג (Natan Rosenberg)- Aisha Patel (Child, 9) - `aisha.patel@child.local`

- **Attendees:** 7 families (largest event!)- Arjun Patel (Child, 5) - `arjun.patel@child.local`
  - Rosenberg

  - Mizrahi (Vegetarian)**Attending:** Summer Camp, Autumn Hiking, Spring Festival, Family Reunion

  - Shafir (Severe nut allergies - keep separate)**Dietary:** Strict vegetarian, no eggs, Jain dietary preferences

  - Avni

  - Refaeli (Kosher required)#### 10. The Anderson Family (3 members) - APPROVED, ACTIVE

  - Kaplan (Strict vegetarian)

  - Ben-David- Mark Anderson (Adult, 46) - `mark.anderson@example.com` - **TRIP_ADMIN**

- Jennifer Anderson (Adult, 44) - `jennifer.anderson@example.com`

**Gear Items:** None (community center provides facilities)- Tyler Anderson (Child, 16) - `tyler.anderson@child.local`

**Schedule:** 11 items across 2 days**Attending:** Winter Retreat, Spring Festival, City Tour, Family Reunion

- Day 1: Opening ceremony, cultural fair, kids activities, musical performances, community dinner**Dietary:** Lactose intolerant (Jennifer)

- Day 2: Outdoor games, lunch, spring parade, closing ceremony

#### 11. The Kim Family (3 members) - APPROVED, ACTIVE

### 6. סיור היסטורי בעיר 2026 / Historical City Tour 2026 (Published, Future)

- Daniel Kim (Adult, 40) - `daniel.kim@example.com`

- **Location:** מחוז המורשת במרכז העיר (Downtown Heritage District)- Hannah Kim (Adult, 38) - `hannah.kim@example.com`

- **Dates:** May 23-24, 2026 (2 days)- Grace Kim (Child, 12) - `grace.kim@child.local`

- **Status:** Published

- **Cutoff Date:** May 15, 2026**Attending:** Winter Retreat, Autumn Hiking, City Tour, Family Reunion

- **Admin:** שרה כהן (Sarah Cohen - Super Admin)

- **Attendees:** 4 families---
  - Admin Family

  - Levi## Trips

  - Baruch

  - Rosenberg (Lactose-free)### 1. Summer Camp 2025 (Published, Upcoming)

**Gear Items:** None (urban tour) - **Location:** Mountain Lake Campground

**Schedule:** None yet (flexible city tour)- **Dates:** July 15-20, 2025 (6 days)

- **Status:** Published

### 7. מפגש קהילתי משפחתי 2026 / Community Family Reunion 2026 (Published, Future)- **Cutoff Date:** June 30, 2025

- **Admin:** John Johnson

- **Location:** פארק ואזור בילוי ריברסייד (Riverside Park and Recreation Area)- **Photo Album:** https://photos.example.com/summer-camp-2025

- **Dates:** July 4-6, 2026 (3 days)- **Attendees:** 6 families (22+ people)

- **Status:** Published - Johnsons (Gluten-free for Jenny)

- **Cutoff Date:** June 25, 2026 - Smiths

- **Admins:** מיכאל אבני (Michael Avni) & אלי בן-דוד (Eli Ben-David) - co-admins - Garcias (Vegetarian meals preferred, no pork)

- **Photo Album:** https://photos.example.com/reunion-2026 - Chens (Nut allergies - Emily)

- **Attendees:** 9 families (biggest reunion!) - Lees (Halal meat required)
  - Levi (Gluten-free) - Patels (Vegetarian family, no eggs)

  - Avni

  - Mizrahi (Vegetarian preferred)**Gear Items:**

  - Shafir (Nut allergies)- Tents (4-person): 7 needed → 7 assigned ✓

  - Refaeli (Kosher)- Sleeping Bags: 22 needed → 22 assigned ✓

  - Kaplan (Vegetarian)- Camp Stoves: 4 needed → 4 assigned ✓

  - Ben-David- Coolers (Large): 6 needed → 4 assigned (2 short)

  - Baruch

  - Rosenberg (Lactose intolerant)**Schedule:** 15 items across 3 days

- Day 1: Arrival, lake activities, campfire

**Gear Items:** TBD (will be added closer to date) - Day 2: Morning hike, free time, talent show

**Schedule:** TBD (will be added closer to date)- Day 3: Scavenger hunt, departure

### 8. קמפינג יום הזיכרון 2025 / Memorial Day Camping 2025 (Past Trip)### 2. Winter Retreat 2026 (Published, Future)

- **Location:** חניון שפת האגם (Lakeside Campground)- **Location:** Snowy Peaks Lodge

- **Dates:** May 24-27, 2025 (4 days) - **COMPLETED**- **Dates:** January 10-15, 2026 (6 days)

- **Status:** Published (past)- **Status:** Published

- **Cutoff Date:** May 15, 2025- **Cutoff Date:** December 20, 2025

- **Admin:** אבי מזרחי (Avi Mizrahi)- **Admin:** Michael Smith

- **Photo Album:** https://photos.example.com/memorial-day-2025- **Attendees:** 5 families

- **Attendees:** 3 families - Smiths
  - Mizrahi - Garcias (Vegetarian preferred)

  - Levi - Johnsons (Gluten-free options needed)

  - Refaeli - Kims

  - Andersons (Lactose intolerant - Jennifer)

**Note:** This is historical data for a completed trip

**Gear Items:**

---- Ski Equipment Sets: 12 needed → 10 assigned (2 short)

- Snowboards: 6 needed → 3 assigned (3 short)

## Testing Scenarios

**Schedule:** 13 items across 3 days

The seed data supports comprehensive testing:- Day 1: Check-in, welcome dinner, hot cocoa

- Day 2: Skiing/snowboarding sessions, movie night

### 1. Role-Based Access- Day 3: Final ski session, farewell brunch

- **Super Admin:** Login as admin@example.com to manage all trips and families, participates in 2 trips

- **Trip Admins:** Test with 5 different trip admins, each managing different trips### 3. Beach Getaway 2025 (Draft)

- **Regular Families:** Test with 6 regular family accounts

- **Location:** Sunny Shores Beach

### 2. Family Status- **Dates:** August 20-25, 2025 (6 days)

- **Active Approved:** 9 families participating in trips- **Status:** **DRAFT** (not published, hidden from regular users)

- **Pending Approval:** Friedman family (test approval workflow)- **Cutoff Date:** August 1, 2025

- **Inactive:** Baron family (test filtering and restrictions)- **Admin:** Carlos Garcia

- **Attendees:** 2 families

### 3. Trip Status - Garcias

- **Published Upcoming:** 5 trips - Chens (Nut allergies)

- **Draft:** Beach Getaway (test visibility restrictions)

- **Past:** Memorial Day (test historical data display)**Gear Items:** None yet (still in planning)

- **Future:** Family Reunion (test long-term planning)**Schedule:** None yet (still in planning)

### 4. Dietary Requirements### 4. Autumn Hiking Adventure 2025 (Published, Upcoming)

- **Multiple Types:** Gluten-free, vegetarian, kosher/halal, nut allergies, lactose-free, Jain

- **Severity Levels:** From preferences to severe allergies- **Location:** Red Rock Canyon National Park

- **Family-Wide:** Some families have dietary restrictions for all members- **Dates:** October 12-15, 2025 (4 days)

- **Status:** Published

### 5. Trip Schedules- **Cutoff Date:** October 1, 2025

- **Detailed Itineraries:** 4 trips with full day-by-day schedules- **Admin:** Luis Rodriguez

- **Various Formats:** 2-day and 3-day trips- **Photo Album:** https://photos.example.com/autumn-hiking-2025

- **Time Slots:** Morning, afternoon, evening activities- **Attendees:** 5 families

- **Locations:** Specific venues and meeting points - Rodriguezes
  - Lees (Halal meals)

### 6. Gear Management - Patels (Vegetarian, Jain dietary preferences)

- **Multiple Categories:** Camping gear, ski equipment, hiking gear - Kims

- **Assignment Tracking:** Which families bring what quantities - Johnsons (Gluten-free)

- **Shortfall Identification:** Some items not fully covered

**Gear Items:**

### 7. Multi-Admin Trips- Hiking Backpacks: 15 needed → 15 assigned ✓

- **Co-Admin Model:** Family Reunion has 2 admins (test collaborative management)- Trekking Poles: 10 needed → 10 assigned ✓

- **Single Admin:** Other trips test individual responsibility

- **Super Admin as Co-Admin:** Summer Camp with super admin + trip admin**Schedule:** 9 items across 2 days

- Day 1: Canyon rim hike, photography walk, dinner out

### 8. Attendance Patterns- Day 2: Waterfall trail hike, departure

- **High Attendance:** Family Reunion with 9 families

- **Low Attendance:** City Tour with 4 families (including super admin)### 5. Spring Festival Weekend 2026 (Published, Future)

- **Draft Trip:** Beach Getaway with 2 families (test pre-planning)

- **Location:** Blossom Valley Community Center

### 9. Super Admin Participation- **Dates:** April 17-19, 2026 (3 days)

- **Participates as Regular User:** Attends Summer Camp and City Tour- **Status:** Published

- **Administers Trip:** Manages Historical City Tour- **Cutoff Date:** April 10, 2026

- **Co-Administers:** Co-admin of Summer Camp with Yossi Levi- **Admin:** Mark Anderson

- **Attendees:** 7 families (largest event!)

--- - Andersons

- Garcias (Vegetarian)

## Quick Login Credentials - Chens (Severe nut allergies - keep separate)

- Smiths

**Password for ALL users:** `password123` - Lees (Halal required)

- Patels (Strict vegetarian)

### Super Admin - Rodriguezes

- **Email:** admin@example.com

- **Use for:** Full system access, publishing trips, approving families, and participating in trips**Gear Items:** None (community center provides facilities)

### Trip Admins**Schedule:** 11 items across 2 days

- **john.johnson@example.com** - (Summer Camp co-admin, City Tour)- Day 1: Opening ceremony, cultural fair, kids activities, musical performances, community dinner

- **michael.smith@example.com** - (Winter Retreat, Family Reunion co-admin)- Day 2: Outdoor games, lunch, spring parade, closing ceremony

- **carlos.garcia@example.com** - (Beach Getaway draft, Memorial Day past)

- **luis.rodriguez@example.com** - (Autumn Hiking, Family Reunion co-admin)### 6. Historical City Tour 2026 (Published, Future)

- **mark.anderson@example.com** - (Spring Festival)

- **Location:** Downtown Heritage District

### Regular Users- **Dates:** May 23-24, 2026 (2 days)

- **david.chen@example.com** - (Family with nut allergies)- **Status:** Published

- **james.lee@example.com** - (Family requiring kosher)- **Cutoff Date:** May 15, 2026

- **raj.patel@example.com** - (Vegetarian family)- **Admin:** John Johnson

- **daniel.kim@example.com** - (Regular family)- **Attendees:** 3 families
  - Johnsons

### Special Status - Kims

- **robert.wilson@example.com** - (Pending approval) - Andersons (Lactose-free)

- **thomas.brown@example.com** - (Inactive family)

**Gear Items:** None (urban tour)

---**Schedule:** None yet (flexible city tour)

## Data Insights### 7. Community Family Reunion 2026 (Published, Future)

### Family Participation- **Location:** Riverside Park and Recreation Area

- Most active families: **Levi & Mizrahi** (6 trips each)- **Dates:** July 4-6, 2026 (3 days)

- Least active approved family: **Ben-David** (3 trips)- **Status:** Published

- **Cutoff Date:** June 25, 2026

### Trip Popularity- **Admins:** Michael Smith & Luis Rodriguez (co-admins)

- Most popular: **Family Reunion** (9 families)- **Photo Album:** https://photos.example.com/reunion-2026

- Least popular: **City Tour** (4 families, including super admin)- **Attendees:** 9 families (biggest reunion!)

- Average attendance: 5.4 families per trip - Johnsons (Gluten-free)
  - Smiths

### Dietary Requirements Coverage - Garcias (Vegetarian preferred)

- **21 out of 40** trip attendances have dietary requirements (52.5%) - Chens (Nut allergies)

- Most common: Vegetarian preferences - Lees (Halal)

- Most critical: Severe nut allergies (Shafir family) - Patels (Vegetarian)
  - Rodriguezes

### Gear Coverage - Kims

- **Summer Camp:** 100% covered ✓ - Andersons (Lactose intolerant)

- **Winter Retreat:** 72% covered

- **Autumn Hiking:** 100% covered ✓**Gear Items:** TBD (will be added closer to date)

**Schedule:** TBD (will be added closer to date)

---

### 8. Memorial Day Camping 2025 (Past Trip)

**Last Updated:** October 8, 2025

**Compatible with:** All latest trip features (dietary requirements, schedules, gear management, super admin participation)- **Location:** Lakeside Campground

- **Dates:** May 24-27, 2025 (4 days) - **COMPLETED**
- **Status:** Published (past)
- **Cutoff Date:** May 15, 2025
- **Admin:** Carlos Garcia
- **Photo Album:** https://photos.example.com/memorial-day-2025
- **Attendees:** 3 families
  - Garcias
  - Johnsons
  - Lees

**Note:** This is historical data for a completed trip

---

## Testing Scenarios

The seed data supports comprehensive testing:

### 1. Role-Based Access

- **Super Admin:** Login as admin@example.com to manage all trips and families
- **Trip Admins:** Test with 5 different trip admins, each managing different trips
- **Regular Families:** Test with 6 regular family accounts

### 2. Family Status

- **Active Approved:** 9 families participating in trips
- **Pending Approval:** Wilson family (test approval workflow)
- **Inactive:** Brown family (test filtering and restrictions)

### 3. Trip Status

- **Published Upcoming:** 5 trips (Summer Camp, Winter Retreat, Autumn Hiking, Spring Festival, City Tour)
- **Draft:** Beach Getaway (test visibility restrictions)
- **Past:** Memorial Day (test historical data display)
- **Future:** Family Reunion (test long-term planning)

### 4. Dietary Requirements

- **Multiple Types:** Gluten-free, vegetarian, halal, nut allergies, lactose-free, Jain
- **Severity Levels:** From preferences to severe allergies
- **Family-Wide:** Some families have dietary restrictions for all members

### 5. Trip Schedules

- **Detailed Itineraries:** 4 trips with full day-by-day schedules
- **Various Formats:** 2-day and 3-day trips
- **Time Slots:** Morning, afternoon, evening activities
- **Locations:** Specific venues and meeting points

### 6. Gear Management

- **Multiple Categories:** Camping gear, ski equipment, hiking gear
- **Assignment Tracking:** Which families bring what quantities
- **Shortfall Identification:** Some items not fully covered

### 7. Multi-Admin Trips

- **Co-Admin Model:** Family Reunion has 2 admins (test collaborative management)
- **Single Admin:** Other trips test individual responsibility

### 8. Attendance Patterns

- **High Attendance:** Family Reunion with 9 families
- **Low Attendance:** City Tour with 3 families
- **Draft Trip:** Beach Getaway with 2 families (test pre-planning)

---

## Quick Login Credentials

**Password for ALL users:** `password123`

### Super Admin

- **Email:** admin@example.com
- **Use for:** Full system access, publishing trips, approving families

### Trip Admins

- **john.johnson@example.com** - (Summer Camp, City Tour)
- **michael.smith@example.com** - (Winter Retreat, Family Reunion co-admin)
- **carlos.garcia@example.com** - (Beach Getaway draft, Memorial Day past)
- **luis.rodriguez@example.com** - (Autumn Hiking, Family Reunion co-admin)
- **mark.anderson@example.com** - (Spring Festival)

### Regular Users

- **david.chen@example.com** - (Family with nut allergies)
- **james.lee@example.com** - (Family requiring halal)
- **raj.patel@example.com** - (Vegetarian family)
- **daniel.kim@example.com** - (Regular family)

### Special Status

- **robert.wilson@example.com** - (Pending approval)
- **thomas.brown@example.com** - (Inactive family)

---

## Data Insights

### Family Participation

- Most active families: **Johnsons & Garcias** (6 trips each)
- Least active approved family: **Rodriguezes** (3 trips)

### Trip Popularity

- Most popular: **Family Reunion** (9 families)
- Least popular: **City Tour** (3 families)
- Average attendance: 5.1 families per trip

### Dietary Requirements Coverage

- **21 out of 40** trip attendances have dietary requirements (52.5%)
- Most common: Vegetarian preferences
- Most critical: Severe nut allergies (Chen family)

### Gear Coverage

- **Summer Camp:** 94% covered (4 of 6 coolers needed)
- **Winter Retreat:** 72% covered
- **Autumn Hiking:** 100% covered ✓

---

**Last Updated:** October 8, 2025  
**Compatible with:** All latest trip features (dietary requirements, schedules, gear management)
