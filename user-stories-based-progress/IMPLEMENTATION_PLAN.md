# Implementation Plan - User Story Gaps

**Date:** October 18, 2025  
**Status:** Draft - Pending decisions from USER_STORIES_QUESTIONS.md  
**Purpose:** Technical roadmap for implementing missing/incomplete features

---

## Table of Contents

- [Priority Overview](#priority-overview)
- [Phase 1: Critical Fixes & Clarifications](#phase-1-critical-fixes--clarifications)
- [Phase 2: Core Missing Features](#phase-2-core-missing-features)
- [Phase 3: Enhanced Features](#phase-3-enhanced-features)
- [Phase 4: Privacy & Compliance](#phase-4-privacy--compliance)
- [Database Schema Changes](#database-schema-changes)
- [API Endpoints Required](#api-endpoints-required)
- [Frontend Components Required](#frontend-components-required)
- [Testing Requirements](#testing-requirements)

---

## Priority Overview

### 🔴 P0 - Critical (Must implement before production)
1. Resolve trip deletion permissions conflict
2. Clarify and implement trip publishing workflow
3. Add trip participation notes field
4. Standardize status terminology

### 🟡 P1 - Important (Should implement soon)
5. Trip participation approval workflow
6. Email verification on registration
7. Password reset functionality
8. Enhanced error handling and messaging
9. Capacity limits for trips

### 🟢 P2 - Nice to Have (Future enhancements)
10. Family join request workflow
11. Per-member trip participation
12. Per-member dietary requirements
13. WhatsApp notification preferences
14. Data privacy controls
15. User-initiated account deletion

---

## Phase 1: Critical Fixes & Clarifications

**Estimated Effort:** 2-3 days  
**Dependencies:** Decisions from USER_STORIES_QUESTIONS.md

### 1.1 Implement Trip Cancellation/Deletion Workflow

**Decision:** ✅ RESOLVED - Trip admins soft-delete (cancel), super-admins hard-delete

**Implementation Requirements:**

#### Backend Changes

**Database Schema:**
```typescript
// Add to Trip model
deleted: boolean (default: false)
deletedAt: Date | null
deletedBy: string | null  // userId
deletionReason: string | null  // Required for cancellation
```

**API Endpoints:**
```typescript
// Trip Admin: Cancel trip (soft-delete)
POST /api/trips/:id/cancel
// Body: { reason: string }  // Required
// Sets: deleted=true, deletedAt=now, deletedBy=userId, deletionReason=reason
// Access: TRIP_ADMIN, SUPER_ADMIN

// Super-Admin: Restore cancelled trip
POST /api/trips/:id/restore
// Sets: deleted=false, deletedAt=null, deletedBy=null, deletionReason=null
// Access: SUPER_ADMIN only

// Super-Admin: Permanently delete trip
DELETE /api/trips/:id
// Hard deletes trip and all related data
// Access: SUPER_ADMIN only
// Can only delete already-cancelled trips
```

**Business Logic:**
- Families must select at least one member when marking attendance
- Empty `participatingMemberIds` array treated as all members (backward compatible)
- Dietary requirements optional but per-member when provided
- **Privacy:** Dietary requirements visible ONLY to:
  - The family who entered them
  - Trip admins for that specific trip
  - Super-admins
  - NOT visible to other families
- Gear volunteering remains family-level (not affected by member selection)
- Trip capacity counts total individuals (adults + children), not families
- Participant statistics: total families, total adults, total children
- Age information visible for capacity and future pricing considerations

#### Frontend Changes

**Trip Admin View:**
- Change "Delete Trip" button to "Cancel Trip"
- Show cancellation dialog with:
  - Warning message about cancellation
  - Required text field for cancellation reason
  - Confirmation checkbox
  - Note: "No notifications will be sent. You must contact participants manually."
- Show cancelled trips in separate "Cancelled" tab/filter
- Show cancellation reason and date in trip details

**Super-Admin View:**
- Show "Restore Trip" button on cancelled trips
- Show "Permanently Delete" button on cancelled trips
- Extra confirmation dialog for permanent deletion
- Warning: "This will permanently remove all trip data. This action cannot be undone."

**Family Member View:**
- Hide cancelled trips from all trip lists
- If family had marked attendance, trip disappears from "My Trips"
- No notification or message shown

**Filtering:**
- Default: Show only non-cancelled trips to families
- Admin views: Show filter toggle for cancelled trips
- Super-admin: Can view all trips including cancelled

#### Database Migration
```sql
ALTER TABLE "Trip" ADD COLUMN "deleted" BOOLEAN DEFAULT false;
ALTER TABLE "Trip" ADD COLUMN "deletedAt" TIMESTAMP;
ALTER TABLE "Trip" ADD COLUMN "deletedBy" TEXT;
ALTER TABLE "Trip" ADD COLUMN "deletionReason" TEXT;

CREATE INDEX "Trip_deleted_idx" ON "Trip"("deleted");
```

**Effort:** 1.5 days

**Priority:** P0 (Critical)

---

### 1.2 Implement Trip Publishing Workflow

**Decision:** ✅ RESOLVED - Request-based publishing with super-admin approval

**Implementation Requirements:**

#### Workflow
1. Family member creates trip → Status: DRAFT, creator becomes trip admin
2. Trip admin clicks "Request Publish" → Notifies all super-admins
3. Super-admin reviews trip → Can assign additional admins
4. Super-admin publishes trip → Status: PUBLISHED (visible to families)
5. Trip admin can edit details anytime (notifies participants if published)
6. Super-admin can unpublish if needed → Back to DRAFT

#### Backend Changes

**Database Schema:**
```typescript
// Add to Trip model
publishRequested: boolean (default: false)
publishRequestedAt: DateTime | null
publishedAt: DateTime | null
publishedBy: string | null  // userId
unpublishedAt: DateTime | null  // For audit trail
lastModifiedBy: string | null  // Track who last edited
lastModifiedAt: DateTime | null
```

**API Endpoints:**
```typescript
// Trip Admin: Request publish
POST /api/trips/:id/request-publish
// Sets: publishRequested=true, publishRequestedAt=now
// Sends notification to all super-admins
// Access: TRIP_ADMIN (for trips they admin)

// Super-Admin: Publish trip
POST /api/trips/:id/publish
// Sets: draft=false, publishedAt=now, publishedBy=userId, publishRequested=false
// Access: SUPER_ADMIN only

// Super-Admin: Unpublish trip
POST /api/trips/:id/unpublish
// Sets: draft=true, unpublishedAt=now
// Keeps publishedAt/publishedBy for history
// Access: SUPER_ADMIN only

// Trip Admin/Creator/Super-Admin: Assign admin
POST /api/trips/:id/admins
// Body: { userId: string }
// Adds user as trip admin
// Access: TRIP_ADMIN (for trips they admin), SUPER_ADMIN
```

**Business Logic:**
- Trip creator automatically becomes first trip admin
- Cannot request publish without: name, location, dates, at least one admin
- Trip admins can edit details at any time (draft or published)
- Editing published trip notifies all participants
- Unpublishing notifies families with marked attendance
- Trip creators, existing admins, and super-admins can assign new admins
- Cannot remove last admin from trip

#### Frontend Changes

**Trip Admin View:**
- Show "Request Publish" button on draft trips (if not already requested)
- Show "Publish Requested" badge if request pending
- Show "Published" badge with date if published
- "Edit Trip" button available at all times
- Warning dialog when editing published trip: "Participants will be notified"
- "Manage Admins" section accessible to creators and existing admins

**Super-Admin Dashboard:**
- "Pending Publish Requests" section showing:
  - Trip name, creator, request date
  - Quick link to trip details
  - "Publish" button
- "All Trips" view with filters: Draft, Published, Pending Request

**Super-Admin Trip Detail:**
- "Publish Trip" button (on draft trips)
- "Unpublish Trip" button (on published trips)
- "Assign Admin" button
- Show publish history: when published, by whom, if unpublished

**Family Member View:**
- Only see published trips
- Hidden when trip unpublished (removed from their lists)
- Notification if trip they're attending gets unpublished

**Notifications:**
- Super-admins: New publish request created
- Trip admin: Trip published by super-admin
- Trip admin: New admin assigned to their trip
- New admin: You've been assigned as trip admin
- Participants: Trip details edited (if published)
- Participants with attendance: Trip unpublished

#### Database Migration
```sql
ALTER TABLE "Trip" ADD COLUMN "publishRequested" BOOLEAN DEFAULT false;
ALTER TABLE "Trip" ADD COLUMN "publishRequestedAt" TIMESTAMP;
ALTER TABLE "Trip" ADD COLUMN "publishedAt" TIMESTAMP;
ALTER TABLE "Trip" ADD COLUMN "publishedBy" TEXT;
ALTER TABLE "Trip" ADD COLUMN "unpublishedAt" TIMESTAMP;
ALTER TABLE "Trip" ADD COLUMN "lastModifiedBy" TEXT;
ALTER TABLE "Trip" ADD COLUMN "lastModifiedAt" TIMESTAMP;

CREATE INDEX "Trip_publishRequested_idx" ON "Trip"("publishRequested");
CREATE INDEX "Trip_draft_idx" ON "Trip"("draft");

-- Set existing published trips (draft=false) with current date
UPDATE "Trip" SET "publishedAt" = "createdAt" WHERE "draft" = false;
```

**Effort:** 2 days

**Priority:** P0 (Critical)

---

### 1.3 Add Trip Participation Notes

**User Story:** US-T007 (partially)

**Backend Changes:**
```typescript
// Add to TripAttendance model
adminNotes: string (nullable)
adminNotesUpdatedAt: Date
adminNotesUpdatedBy: string (userId)
```

**API Endpoint:**
```typescript
PUT /api/trips/:tripId/attendees/:attendeeId/notes
// Only TRIP_ADMIN and SUPER_ADMIN
// Body: { notes: string }
```

**Frontend Changes:**
- Add notes field in attendance summary (admin view)
- Show edit icon next to each family
- Modal/inline edit for notes
- Show who last updated and when

**Effort:** 0.5 days

---

### 1.6 Add Trip Participation Admin Notes

**Decision:** ✅ RESOLVED - Admin-only coordination notes per trip-attendance

**User Story:** US-T007

**Implementation Requirements:**

#### Backend Changes

**Database Schema:**
```typescript
// Add to TripAttendance model
adminNotes: string | null
adminNotesUpdatedAt: DateTime | null
adminNotesUpdatedBy: string | null  // userId
```

**API Endpoint:**
```typescript
PUT /api/trips/:tripId/attendees/:attendeeId/notes
// Body: { notes: string }
// Access: TRIP_ADMIN, SUPER_ADMIN only
// Updates: adminNotes, adminNotesUpdatedAt, adminNotesUpdatedBy
```

**Business Logic:**
- Notes are per-trip-attendance (specific to family's participation in specific trip)
- Admin-only visibility (families cannot see these notes)
- Free text field (no predefined categories)
- Track who last updated and when for accountability
- Use cases: "Arriving late on Friday", "Special accessibility needs", "Confirmed by phone", "Bringing pet - approved"

#### Frontend Changes

**Attendance Summary (Admin View):**
- Add notes column/field in attendance table
- Show edit icon next to each family
- Click to open inline edit or modal
- Display existing notes with truncation ("Show more" for long notes)
- Show last updated info: "Updated by [Admin Name] on [Date]"
- Empty state: "Add note" button

**Notes Editor:**
- Text area for free-text entry
- Auto-save on blur or "Save" button
- Character limit: 500-1000 characters
- Preview of formatted text
- Clear visual indication that notes are admin-only

**Display:**
- Badge or icon if family has notes
- Quick preview on hover
- Full notes in expanded family view
- Not visible in family-facing views

#### Database Migration
```sql
ALTER TABLE "TripAttendance" ADD COLUMN "adminNotes" TEXT;
ALTER TABLE "TripAttendance" ADD COLUMN "adminNotesUpdatedAt" TIMESTAMP;
ALTER TABLE "TripAttendance" ADD COLUMN "adminNotesUpdatedBy" TEXT;

CREATE INDEX "TripAttendance_adminNotes_idx" ON "TripAttendance"("adminNotes") WHERE "adminNotes" IS NOT NULL;
```

**Effort:** 0.5 days

**Priority:** P1 (Important - helpful coordination tool)

---

### 1.6 Standardize Status Terminology

**Decision Pending:** Question #11 in questions document

**Recommended Changes:**

#### Family Status
```typescript
enum FamilyStatus {
  PENDING = 'PENDING',           // Awaiting super-admin approval
  APPROVED = 'APPROVED',         // Can sign in and participate
  INACTIVE = 'INACTIVE'          // Deactivated by super-admin
}

// Remove isActive field, use status instead
```

#### Trip Status
```typescript
// Keep existing draft: boolean field
// Add: cancelled: boolean field
// Derive computed status on frontend:
// - DRAFT: draft=true, cancelled=false
// - PUBLISHED: draft=false, cancelled=false, dates in future
// - ACTIVE: draft=false, cancelled=false, dates ongoing
// - COMPLETED: draft=false, cancelled=false, dates in past
// - CANCELLED: cancelled=true
```

**Database Migration:**
```sql
-- For families
ALTER TABLE "Family" ADD COLUMN "status" TEXT DEFAULT 'APPROVED';
UPDATE "Family" SET "status" = 'PENDING' WHERE "isActive" = false;
-- (Manual review of pending vs inactive)

-- For trips
ALTER TABLE "Trip" ADD COLUMN "cancelled" BOOLEAN DEFAULT false;
ALTER TABLE "Trip" ADD COLUMN "cancelledAt" TIMESTAMP;
ALTER TABLE "Trip" ADD COLUMN "cancelledBy" TEXT;
```

**Update All Components:**
- Replace `isActive` checks with `status` checks
- Update filters and badges
- Update API responses

**Effort:** 1 day

---

## Phase 2: Core Missing Features

**Estimated Effort:** 8-10 days  
**Priority:** P1 features that significantly improve UX

### 2.1 Implement Trip Participation Approval Workflow

**Decision:** ✅ RESOLVED - Configurable per trip, default requires approval

**Implementation Requirements:**

#### Backend Changes

**Database Schema:**
```typescript
// Add to Trip model
requireParticipationApproval: boolean (default: true)

// Add to TripAttendance model
status: enum { PENDING, APPROVED, REJECTED }
requestedAt: DateTime
respondedAt: DateTime | null
respondedBy: string | null  // userId
rejectionReason: string | null
```

**API Endpoints:**
```typescript
// Modified endpoint: Create/update attendance
POST /api/trips/:id/attendance
// Body: { familyId: string, dietaryRequirements?: string }
// If trip.requireParticipationApproval = true: create with status=PENDING
// Otherwise: create with status=APPROVED (instant join)
// Returns: TripAttendance record

// New endpoints
GET /api/trips/:id/participation-requests
// Query params: ?status=PENDING|APPROVED|REJECTED|ALL
// Returns: List of attendance requests with family details
// Access: TRIP_ADMIN, SUPER_ADMIN

PUT /api/trips/:id/participation-requests/:attendanceId/approve
// Sets: status=APPROVED, respondedAt=now, respondedBy=userId
// Access: TRIP_ADMIN, SUPER_ADMIN
// Sends notification to family

PUT /api/trips/:id/participation-requests/:attendanceId/reject
// Body: { reason?: string }
// Sets: status=REJECTED, respondedAt=now, respondedBy=userId, rejectionReason
// Access: TRIP_ADMIN, SUPER_ADMIN
// Sends notification to family with reason

// Modified: Get trip details
GET /api/trips/:id
// For non-participants on approval-required trips:
//   - Return: description, schedule, basic participant list (names + count)
//   - Hide: gear list, gear assignments, dietary requirements, contact info
// For approved participants or open enrollment:
//   - Return: Full trip details
```

**Business Logic:**
- Default `requireParticipationApproval = true` for new trips
- Trip creator can toggle during creation or edit
- Pending families see limited trip information:
  - ✅ Trip description, dates, location
  - ✅ Trip schedule/itinerary
  - ✅ Basic participant list (family names and count)
  - ❌ Gear list and assignments
  - ❌ Dietary requirements
  - ❌ Contact information
  - ❌ Cannot volunteer for gear
- Rejected families can immediately request again (no cooldown)
- All families treated equally (no conditional approval based on history)
- Approval/rejection tracked in activity log

#### Frontend Changes

**Trip Creation/Edit Form:**
- Add checkbox: "Require admin approval for participation"
- Default: checked (true)
- Tooltip: "When enabled, families must request to join and wait for your approval"
- Show in trip settings section

**Family Member View - Available Trips:**
- If `requireParticipationApproval = false`: Show "Join Trip" button
- If `requireParticipationApproval = true`: Show "Request to Join" button
- Request dialog:
  - "You're requesting to join [Trip Name]"
  - Optional: Dietary requirements text field
  - "Request to Join" submit button
  - Note: "Trip admin will review your request"

**Family Member View - Pending Request:**
- Show "Pending Approval" badge on trip card
- Trip detail page:
  - Limited information shown (description, schedule, basic participant list)
  - Banner: "Your request is pending admin approval"
  - No gear section visible
  - No detailed participant list
  - Button: "Cancel Request" (removes attendance record)

**Family Member View - Rejected Request:**
- Show "Request Rejected" message
- Display rejection reason if provided by admin
- Show "Request to Join Again" button
- No cooldown period

**Family Member View - Approved:**
- Full trip access (same as open enrollment)
- Can volunteer for gear
- Can see full participant details
- Can edit dietary requirements

**Trip Admin View:**
- New section: "Participation Requests"
- Badge showing count of pending requests
- Component: `ParticipationRequestsList`
  - Table/list view with columns:
    - Family name (clickable to profile)
    - Adults (count + names)
    - Children (count + ages)
    - Dietary requirements (if provided)
    - Request date
    - Actions: Approve / Reject buttons
  - Filter tabs: Pending, Approved, Rejected, All
  - Sort by request date (oldest first)
- Reject dialog:
  - Optional reason text field
  - "The family will see this reason"
  - Confirm button
- Success toasts: "Family approved" / "Family rejected"

**Notifications:**
- Trip admin: New participation request received
  - "[Family Name] requested to join [Trip Name]"
- Family: Request approved
  - "Your request to join [Trip Name] was approved!"
- Family: Request rejected
  - "Your request to join [Trip Name] was declined. [Reason if provided]"

#### Database Migration
```sql
-- Add to Trip table
ALTER TABLE "Trip" ADD COLUMN "requireParticipationApproval" BOOLEAN DEFAULT true;

-- Update existing trips to false (preserve current behavior)
UPDATE "Trip" SET "requireParticipationApproval" = false;

-- Add to TripAttendance table
ALTER TABLE "TripAttendance" ADD COLUMN "status" TEXT DEFAULT 'APPROVED';
ALTER TABLE "TripAttendance" ADD COLUMN "requestedAt" TIMESTAMP DEFAULT NOW();
ALTER TABLE "TripAttendance" ADD COLUMN "respondedAt" TIMESTAMP;
ALTER TABLE "TripAttendance" ADD COLUMN "respondedBy" TEXT;
ALTER TABLE "TripAttendance" ADD COLUMN "rejectionReason" TEXT;

CREATE INDEX "TripAttendance_status_idx" ON "TripAttendance"("status");

-- Update existing attendance to have requestedAt
UPDATE "TripAttendance" SET "requestedAt" = "createdAt";
```

**Effort:** 3 days

**Priority:** P1 (Important - core community management feature)

---

### 2.2 Email Verification on Registration

**User Story:** Not explicitly mentioned, but security best practice

**Backend Changes:**
```typescript
// Add to User model
emailVerified: boolean (default: false)
emailVerificationToken: string (nullable)
emailVerificationExpiry: Date (nullable)

// Create new service
emailService.ts
- sendVerificationEmail(userId, email)
- verifyEmail(token)
```

**API Endpoints:**
```typescript
POST /api/auth/verify-email
// Body: { token: string }

POST /api/auth/resend-verification
// Resend verification email
```

**Workflow:**
1. User registers → Account created with emailVerified=false
2. System sends verification email with token
3. User clicks link → Redirects to app → Verifies email
4. For OAuth users, auto-verify email (trusted provider)

**Frontend Changes:**
- Show "Please verify your email" banner for unverified users
- "Resend verification email" button
- Email verification success page
- Limit access to certain features until verified (optional)

**Effort:** 2 days

---

### 2.3 Password Reset Functionality

**User Story:** Not in stories, but essential

**Backend Changes:**
```typescript
// Add to User model
resetPasswordToken: string (nullable)
resetPasswordExpiry: Date (nullable)

// Add to emailService.ts
sendPasswordResetEmail(email, token)
```

**API Endpoints:**
```typescript
POST /api/auth/forgot-password
// Body: { email: string }
// Sends reset email

POST /api/auth/reset-password
// Body: { token: string, newPassword: string }
// Resets password if token valid
```

**Frontend Changes:**
- "Forgot Password?" link on login page
- Forgot password page with email input
- Reset password page (from email link)
- Success confirmation

**Effort:** 1.5 days

---

### 2.4 Enhanced Error Handling

**User Story:** US-X001

**Backend Changes:**
```typescript
// Standardize error responses
interface ApiError {
  success: false
  error: {
    code: string           // e.g., 'VALIDATION_ERROR', 'UNAUTHORIZED'
    message: string        // Hebrew user-facing message
    details?: object       // Field-specific errors for forms
    timestamp: string
    path: string
  }
}

// Create error middleware
errorHandler.ts
- Catches all errors
- Translates to Hebrew
- Logs appropriately
- Never exposes stack traces to client
```

**Frontend Changes:**
```typescript
// Create error handler utility
handleApiError(error) {
  // Parse error response
  // Show appropriate toast/alert
  // Log to console in dev mode
  // Track in analytics (future)
}

// Update all API calls to use error handler
// Create reusable error display components
```

**Error Messages (Hebrew):**
- Network errors: "בעיית תקשורת, אנא נסה שוב"
- Validation errors: Field-specific messages
- Auth errors: "אין לך הרשאה לבצע פעולה זו"
- Not found: "הפריט המבוקש לא נמצא"
- Server errors: "שגיאת שרת, אנא נסה שוב מאוחר יותר"

**Effort:** 1.5 days

---

### 2.5 Trip Capacity Limits

**Decision Pending:** Question #17 in questions document

**Backend Changes:**
```typescript
// Add to Trip model
maxParticipants: number (nullable) // null = unlimited
currentParticipants: number (computed)
```

**API Changes:**
```typescript
// Validation in markAttendance
if (trip.maxParticipants && currentCount >= trip.maxParticipants) {
  throw new ApiError(400, 'Trip is full')
}
```

**Frontend Changes:**
- Add "Max Participants" field in trip form (optional)
- Show "X / Y families registered" in trip list
- Show "Full" badge when capacity reached
- Prevent attendance marking when full
- Show waitlist option (Phase 3)

**Effort:** 1 day

---

## Phase 3: Enhanced Features

**Estimated Effort:** 10-12 days  
**Priority:** P2 features that improve functionality

### 3.1 Family Join Request Workflow

**Decision:** ✅ RESOLVED - Deprioritized to Phase 3, simplified design

**User Stories:** US-F002, US-F006

**Implementation Requirements (Phase 3):**

#### Backend Changes

**Database Schema:**
```typescript
// New model
model FamilyJoinRequest {
  id              String   @id @default(cuid())
  requestingUserId String
  targetFamilyId   String
  message          String?  // Optional message from requester
  status           RequestStatus @default(PENDING)
  createdAt        DateTime @default(now())
  respondedAt      DateTime?
  respondedBy      String?  // userId of adult who approved/rejected
  
  requestingUser   User   @relation("JoinRequests", fields: [requestingUserId])
  targetFamily     Family @relation(fields: [targetFamilyId])
  
  @@index([requestingUserId])
  @@index([targetFamilyId, status])
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}
```

**API Endpoints:**
```typescript
POST /api/families/join-request
// Create request to join family
// Body: { targetAdultEmail: string, message?: string }
// User must be registered but not yet in a family
// Finds family by adult email, creates request

GET /api/families/:id/join-requests
// Get pending requests for family
// Access: Adult members of that family only

PUT /api/families/join-requests/:id/approve
// Approve request, add user to family
// Access: Any adult member of target family
// Sets user's familyId, marks request as approved

PUT /api/families/join-requests/:id/reject
// Reject request
// Access: Any adult member of target family
```

**Business Logic:**
- User can only belong to one family (forever)
- User must register first, then can request to join
- Request sent to all adults in target family
- Any one adult can approve (doesn't require consensus)
- Approved user gains family membership
- New member does NOT automatically join existing trips
- Family must manually add new member to trips if desired

#### Frontend Changes

**Registration Flow:**
- Add option: "Join Existing Family" vs "Create New Family"
- Join flow: Simplified form
  - Name, email, password
  - Target adult family member's email
  - Optional message ("I'm [relation], please add me")
- After registration: "Request sent, waiting for approval"
- User cannot access app until approved

**Family Dashboard:**
- Section: "Pending Join Requests" (visible to adults only)
- Shows: Requester name, email, message, request date
- Actions: Approve / Reject buttons
- Notification badge when requests pending

**After Approval:**
- New member appears in family member list
- New member does NOT appear on existing trip attendances
- Family can manually add member to trips if needed

**Notifications:**
- All family adults: New join request received
- Requester: Request approved/rejected

**Effort:** 2.5 days

**Priority:** P2 (Phase 3 - Nice-to-have)

**Note:** For MVP, families add adults directly through family management. This requires coordination outside the app but is much simpler.

---

### 3.2 Per-Member Dietary Requirements (Enhanced)

**Note:** Basic per-member dietary requirements implemented in Phase 1. This section for future enhancements.

**Potential Enhancements:** "Select All" option
  - Shows member type (adult/child) and age
- Update attendance marker to show member selection
- Show participant count per family in admin view

**Effort:** 2 days

---

### 3.3 Per-Member Dietary Requirements

**Decision Pending:** Question #6 in questions document

**Backend Changes:**
```typescript
// Option A: Restructure (complex)
model DietaryRequirement {
  id          String @id @default(cuid())
  attendanceId String
  memberId    String
  requirement String
  
  attendance  TripAttendance @relation(fields: [attendanceId])
  member      User @relation(fields: [memberId])
}

// Option B: Keep text field with structure (simpler)
// dietaryRequirements: "Member Name: requirement, Member Name: requirement"
```

**Recommended:** Option B for MVP, Option A for Phase 3

**Frontend Changes:**
- Component: `DietaryRequirementsForm`
  - One input per participating family member
  - Auto-format to structured text
  - Parse structured text to display per-member

**Effort:** 1.5 days (Option B) or 3 days (Option A)

---

### 3.3 WhatsApp Notification Preferences

**Decision Pending:** Question #8 in questions document

**Backend Changes:**
```typescript
// Add to User model
notificationPreferences: {
  whatsappEnabled: boolean
  emailEnabled: boolean
  notifyTripUpdates: boolean
  notifyGearUpdates: boolean
  notifyReminders: boolean
  notifyApprovals: boolean
}
```

**API Endpoints:**
```typescript
GET /api/users/:id/notification-preferences
PUT /api/users/:id/notification-preferences
```

**Frontend Changes:**
- Settings page for notification preferences
- Toggle switches for each preference type
- Explanation of what each preference controls
- Note: WhatsApp still manual copy/paste (API integration Phase 4)

**Effort:** 2 days

---

### 3.4 Data Privacy Controls

**Decision Pending:** Question #9 in questions document  
**User Story:** US-X008

**Backend Changes:**
```typescript
// Add to Family model
privacySettings: {
  showProfilePhotos: boolean (default: true)
  showExactChildAges: boolean (default: true)
  showContactInfo: boolean (default: true)
}

// Update API responses to respect privacy settings
// Trip admins and super-admins always see full data
```

**Frontend Changes:**
- Privacy settings page
- Toggle switches for each privacy option
- Preview of what others will see
- Explanation of who can see what

**Effort:** 2 days

---

### 3.5 Trip Waitlist

**Requires:** Capacity limits (2.5) implemented first

**Backend Changes:**
```typescript
model TripWaitlist {
  id          String @id @default(cuid())
  tripId      String
  familyId    String
  position    Int
  joinedAt    DateTime @default(now())
  notifiedAt  DateTime?
  
  trip   Trip   @relation(fields: [tripId])
  family Family @relation(fields: [familyId])
}
```

**API Endpoints:**
```typescript
POST /api/trips/:id/waitlist
// Join waitlist when trip full

DELETE /api/trips/:id/waitlist/:familyId
// Leave waitlist

GET /api/trips/:id/waitlist
// View waitlist (TRIP_ADMIN, SUPER_ADMIN)
```

**Logic:**
- When family cancels attendance, notify next family on waitlist
- Auto-remove from waitlist after 24 hours if no response

**Effort:** 2 days

---

## Phase 4: Privacy & Compliance

**Estimated Effort:** 5-7 days  
**Priority:** P2 but required for EU/GDPR compliance

### 4.1 User-Initiated Account Deletion

**Decision Pending:** Question #10 in questions document  
**User Story:** US-X010

**Backend Changes:**
```typescript
model DeletionRequest {
  id          String @id @default(cuid())
  familyId    String
  requestedBy String (userId)
  reason      String?
  requestedAt DateTime @default(now())
  status      DeletionStatus @default(PENDING)
  reviewedBy  String? (userId)
  reviewedAt  DateTime?
  
  family Family @relation(fields: [familyId])
}

enum DeletionStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
}
```

**API Endpoints:**
```typescript
POST /api/families/:id/request-deletion
// Family member requests deletion
// Body: { reason: string }

GET /api/admin/deletion-requests
// Super-admin views pending requests

PUT /api/admin/deletion-requests/:id/approve
// Super-admin approves deletion

PUT /api/admin/deletion-requests/:id/reject
// Super-admin rejects deletion
// Body: { reason: string }

POST /api/admin/deletion-requests/:id/execute
// Super-admin executes approved deletion
// Soft delete + anonymization
```

**Deletion Process:**
1. User requests deletion
2. Super-admin reviews (check active trips, etc.)
3. Super-admin approves/rejects
4. If approved, super-admin executes:
   - Soft delete family (status = DELETED)
   - Anonymize personal data (names → "Deleted User #123")
   - Keep trip participation history for audit
   - Export data before deletion (GDPR)

**Frontend Changes:**
- "Request Account Deletion" in family settings
- Deletion request form with reason
- Super-admin dashboard: Pending deletion requests
- Confirmation dialogs with warnings

**Effort:** 3 days

---

### 4.2 Data Export (GDPR)

**User Story:** US-X009

**Backend Changes:**
```typescript
// Create export service
dataExportService.ts
- exportFamilyData(familyId): Promise<JSON>
- Includes: family info, members, trip history, gear commitments, dietary info
```

**API Endpoints:**
```typescript
POST /api/families/:id/export
// Generate data export
// Returns: { downloadUrl: string, expiresAt: Date }

GET /api/exports/:token
// Download export file (PDF or JSON)
```

**Export Contents:**
- Family information
- All family members
- Trip participation history
- Gear commitments
- Dietary requirements
- Activity log for family

**Frontend Changes:**
- "Export My Data" button in settings
- Shows export progress
- Downloads JSON/PDF file
- Expires after 7 days

**Effort:** 2 days

---

### 4.3 Activity Log Enhancement

**Current:** Basic logging exists  
**Enhancement:** More detailed and user-facing

**Backend Changes:**
```typescript
// Enhance log service
- Log more details in changes field
- Add log categories
- Add severity levels
- Add user-facing descriptions (Hebrew)
```

**Frontend Changes:**
```typescript
// Component: UserActivityLog
- Show user's own actions
- Filter by entity type, date
- Show user-friendly descriptions

// Component: FamilyActivityLog
- Show all family member actions
- Useful for families to see what happened

// Existing: AdminActivityLog (system-wide for super-admin)
```

**Effort:** 2 days

---

## Database Schema Changes

### Summary of New Models

```prisma
// New Models

model FamilyJoinRequest {
  id                String   @id @default(cuid())
  requestingUserId  String
  targetFamilyId    String
  targetAdultEmail  String
  status            RequestStatus @default(PENDING)
  message           String?
  requestedAt       DateTime @default(now())
  respondedAt       DateTime?
  respondedBy       String?
  
  requestingUser    User   @relation("JoinRequestUser", fields: [requestingUserId])
  targetFamily      Family @relation("JoinRequestFamily", fields: [targetFamilyId])
  
  @@index([targetFamilyId])
  @@index([requestingUserId])
}

model TripWaitlist {
  id          String @id @default(cuid())
  tripId      String
  familyId    String
  position    Int
  joinedAt    DateTime @default(now())
  notifiedAt  DateTime?
  
  trip   Trip   @relation(fields: [tripId])
  family Family @relation(fields: [familyId])
  
  @@unique([tripId, familyId])
  @@index([tripId, position])
}

model DeletionRequest {
  id          String   @id @default(cuid())
  familyId    String
  requestedBy String
  reason      String?
  requestedAt DateTime @default(now())
  status      DeletionStatus @default(PENDING)
  reviewedBy  String?
  reviewedAt  DateTime?
  
  family      Family @relation(fields: [familyId])
  requester   User   @relation("DeletionRequester", fields: [requestedBy])
  reviewer    User?  @relation("DeletionReviewer", fields: [reviewedBy])
  
  @@index([familyId])
  @@index([status])
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}

enum DeletionStatus {
  PENDING
  APPROVED
  REJECTED
  COMPLETED
}
```

### Modifications to Existing Models

```prisma
model Family {
  // Change
  status  FamilyStatus @default(PENDING)  // Instead of isActive boolean
  
  // Add
  privacySettings Json? @default("{\"showProfilePhotos\":true,\"showExactChildAges\":true,\"showContactInfo\":true}")
  
  // Relations
  joinRequests    FamilyJoinRequest[] @relation("JoinRequestFamily")
  waitlists       TripWaitlist[]
  deletionRequest DeletionRequest?
}

enum FamilyStatus {
  PENDING
  APPROVED
  INACTIVE
  DELETED
}

model User {
  // Add
  emailVerified           Boolean @default(false)
  emailVerificationToken  String?
  emailVerificationExpiry DateTime?
  resetPasswordToken      String?
  resetPasswordExpiry     DateTime?
  notificationPreferences Json? @default("{\"whatsappEnabled\":true,\"emailEnabled\":true,\"notifyTripUpdates\":true,\"notifyGearUpdates\":true,\"notifyReminders\":true,\"notifyApprovals\":true}")
  
  // Relations
  joinRequests            FamilyJoinRequest[] @relation("JoinRequestUser")
  deletionRequestsMade    DeletionRequest[] @relation("DeletionRequester")
  deletionRequestsReviewed DeletionRequest[] @relation("DeletionReviewer")
}

model Trip {
  // Add
  requireParticipationApproval Boolean @default(false)
  maxParticipants             Int?
  cancelled                   Boolean @default(false)
  cancelledAt                 DateTime?
  cancelledBy                 String?
  cancellationReason          String?
  publishedAt                 DateTime?
  publishedBy                 String?
  unpublishedAt               DateTime?
  lastModifiedBy              String?
  
  // Relations
  waitlist                    TripWaitlist[]
}

model TripAttendance {
  // Add
  status                 AttendanceStatus @default(APPROVED)
  requestedAt            DateTime @default(now())
  respondedAt            DateTime?
  respondedBy            String?
  rejectionReason        String?
  participatingMemberIds String[] @default([])
  adminNotes             String?
  adminNotesUpdatedAt    DateTime?
  adminNotesUpdatedBy    String?
}

enum AttendanceStatus {
  PENDING
  APPROVED
  REJECTED
}
```

### Migration Strategy

1. **Phase 1:** Critical schema changes (status fields, cancelled, notes)
2. **Phase 2:** Add approval workflow fields
3. **Phase 3:** Add new models (join requests, waitlist)
4. **Phase 4:** Add deletion and privacy fields

---

## API Endpoints Required

### New Endpoints

```typescript
// Authentication & Security
POST   /api/auth/verify-email
POST   /api/auth/resend-verification
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

// Trip Management
POST   /api/trips/:id/cancel                      // TRIP_ADMIN, SUPER_ADMIN
POST   /api/trips/:id/restore                     // SUPER_ADMIN
POST   /api/trips/:id/publish                     // SUPER_ADMIN
POST   /api/trips/:id/unpublish                   // SUPER_ADMIN

// Trip Participation
GET    /api/trips/:id/participation-requests      // TRIP_ADMIN, SUPER_ADMIN
PUT    /api/trips/:id/participation-requests/:id/approve
PUT    /api/trips/:id/participation-requests/:id/reject
PUT    /api/trips/:id/attendees/:id/notes         // TRIP_ADMIN, SUPER_ADMIN

// Family Join Requests (Phase 3)
POST   /api/families/join-request
GET    /api/families/:id/join-requests
PUT    /api/families/join-requests/:id/approve
PUT    /api/families/join-requests/:id/reject

// Waitlist (Phase 3)
POST   /api/trips/:id/waitlist
DELETE /api/trips/:id/waitlist/:familyId
GET    /api/trips/:id/waitlist

// Deletion Requests (Phase 4)
POST   /api/families/:id/request-deletion
GET    /api/admin/deletion-requests
PUT    /api/admin/deletion-requests/:id/approve
PUT    /api/admin/deletion-requests/:id/reject
POST   /api/admin/deletion-requests/:id/execute

// Data Export (Phase 4)
POST   /api/families/:id/export
GET    /api/exports/:token

// User Preferences
GET    /api/users/:id/notification-preferences
PUT    /api/users/:id/notification-preferences
GET    /api/users/:id/privacy-settings
PUT    /api/users/:id/privacy-settings
```

---

## Frontend Components Required

### New Components

```typescript
// Phase 1
TripCancelDialog            // Cancel trip with reason
TripStatusBadge            // Enhanced with cancelled status
AdminNotesEditor           // Edit notes for family attendance

// Phase 2
ParticipationRequestsList   // Admin view of pending requests
ParticipationRequestCard    // Single request with approve/reject
ParticipationStatusBadge   // Show pending/approved/rejected
EmailVerificationBanner    // Prompt user to verify email
ForgotPasswordPage         // Password reset request
ResetPasswordPage          // New password form
TripCapacityIndicator      // Show X/Y participants

// Phase 3
FamilyJoinRequestForm      // Simplified registration
PendingJoinRequestsList    // Family view of join requests
JoinRequestCard            // Single request with approve/reject
ParticipatingMembersSelector // Checkbox list for member selection
DietaryRequirementsForm    // Per-member dietary inputs
NotificationPreferences    // Settings page for notifications
PrivacySettings            // Settings page for privacy
TripWaitlistView           // Show waitlist for full trips
WaitlistJoinButton         // Join waitlist button

// Phase 4
AccountDeletionRequest     // Request deletion form
DeletionRequestsList       // Super-admin view of requests
DeletionRequestCard        // Single request review
DataExportButton           // Trigger data export
ExportDownloadPage         // Download exported data
UserActivityLog            // User's own activity history
FamilyActivityLog          // Family's activity history
```

### Modified Components

```typescript
// Update to support new features
TripForm                   // Add requireApproval, maxParticipants, cancellation
TripList                   // Filter cancelled trips, show capacity
TripDetailPage             // Show participation status, waitlist
AttendanceMarker           // Show pending status, member selection
TripAdminManager           // Show publish requests
SuperAdminPanel            // Add deletion requests tab
FamilyDashboard            // Show join requests, deletion option
FamilyRegistrationForm     // Add "join family" option
```

---

## Testing Requirements

### Unit Tests Required

```typescript
// Backend Services
familyJoinRequest.service.test.ts     // Create, approve, reject requests
tripApproval.service.test.ts          // Participation approval workflow
emailVerification.service.test.ts     // Email verification logic
passwordReset.service.test.ts         // Password reset logic
tripCancellation.service.test.ts      // Cancel and restore trips
waitlist.service.test.ts              // Waitlist management
deletion.service.test.ts              // Account deletion workflow
dataExport.service.test.ts            // Data export generation

// Frontend Components
ParticipationRequestsList.test.tsx    // Request list rendering
TripCancelDialog.test.tsx             // Cancellation dialog
EmailVerificationBanner.test.tsx      // Verification prompt
ParticipatingMembersSelector.test.tsx // Member selection
NotificationPreferences.test.tsx      // Preference toggles
```

### Integration Tests Required

```typescript
// API Integration
familyJoinRequest.integration.test.ts // Full join request flow
tripApproval.integration.test.ts      // Full approval flow
emailVerification.integration.test.ts // Email verification flow
passwordReset.integration.test.ts     // Password reset flow
waitlist.integration.test.ts          // Waitlist operation flow
deletion.integration.test.ts          // Account deletion flow
```

### E2E Tests Required

```typescript
// Critical User Flows
registration-with-verification.e2e.ts  // Registration → Email verify → Login
trip-participation-approval.e2e.ts     // Request → Admin approve → Participate
family-join-request.e2e.ts             // Join request → Approve → Join family
trip-cancellation.e2e.ts               // Create → Publish → Cancel → Notify
account-deletion.e2e.ts                // Request → Admin review → Execute
```

---

## Effort Estimation Summary

### Phase 1: Critical Fixes (P0)
- 1.1 Trip Deletion: 1 day
- 1.2 Publishing Workflow: 1.5 days
- 1.3 Participation Notes: 0.5 days
- 1.4 Status Standardization: 1 day
- **Total: 4 days**

### Phase 2: Core Features (P1)
- 2.1 Participation Approval: 3 days
- 2.2 Email Verification: 2 days
- 2.3 Password Reset: 1.5 days
- 2.4 Error Handling: 1.5 days
- 2.5 Trip Capacity: 1 day
- **Total: 9 days**

### Phase 3: Enhanced Features (P2)
- 3.1 Family Join Requests: 2.5 days
- 3.2 Per-Member Participation: 2 days
- 3.3 Per-Member Dietary: 1.5 days
- 3.4 Notification Preferences: 2 days
- 3.5 Privacy Controls: 2 days
- 3.6 Waitlist: 2 days
- **Total: 12 days**

### Phase 4: Compliance (P2)
- 4.1 Account Deletion: 3 days
- 4.2 Data Export: 2 days
- 4.3 Activity Log Enhancement: 2 days
- **Total: 7 days**

### Grand Total
**32 days** of development (excluding testing time)

**With Testing (estimated +30%):** ~42 days

---

## Dependencies & Risks

### External Dependencies
- Email service (SendGrid, AWS SES, etc.) - Required for Phase 2
- WhatsApp Business API - Future enhancement, not critical

### Technical Risks
1. **Database Migrations:** Complex schema changes may require careful migration strategy
2. **Data Integrity:** Status changes must preserve historical data
3. **Performance:** Waitlist notifications could be resource-intensive
4. **Email Deliverability:** Verification emails may be filtered as spam

### Mitigation Strategies
1. **Staged Rollout:** Deploy phases incrementally with feature flags
2. **Backup Strategy:** Full database backup before each migration
3. **Testing:** Comprehensive test coverage before production
4. **Monitoring:** Track error rates and performance metrics
5. **Rollback Plan:** Ability to revert each phase independently

---

## Next Steps

1. **Review Questions Document:** Get decisions on all open questions
2. **Prioritize Features:** Confirm P0, P1, P2 classifications
3. **Setup Development Environment:** Configure email service, testing tools
4. **Create Feature Branches:** One branch per phase for parallel work
5. **Start Phase 1:** Begin with critical fixes and clarifications
6. **Iterate:** Review and adjust plan after each phase

---

## Notes

- All estimates assume single developer, full-time work
- Testing time not included in estimates (add ~30%)
- Review and QA time not included
- Design/mockup time not included
- Documentation time not included (add ~10%)

**Total Realistic Timeline with All Overhead:**
**~8-10 weeks** for complete implementation of all phases

---

**Document Status:** Draft - Awaiting decisions from USER_STORIES_QUESTIONS.md
