# Future Features - Community Trip Organizer

**Last Updated:** October 18, 2025  
**Purpose:** Track features deprioritized from MVP for future implementation

---

## Overview

This document lists features that have been analyzed and designed but deprioritized for the MVP release. Each feature includes implementation details and can be picked up for future development phases.

---

## Phase 3 Features (P2 Priority)

### 1. Family Join Request Workflow

**Status:** Designed, not implemented  
**User Stories:** US-F002, US-F006  
**Priority:** P2 (Nice-to-have)  
**Estimated Effort:** 2.5 days

#### Description

Allow users to request to join an existing family during registration instead of creating a new family. This enables organic family growth without requiring direct coordination outside the app.

#### Business Rules

- User can only belong to one family (forever - no switching)
- User must register first, then can request to join
- Request sent to all adults in target family
- Any one adult can approve (doesn't require consensus from all)
- Approved user gains family membership
- New member does NOT automatically join existing trips
- Family must manually add new member to trips if desired

#### Workflow

1. During registration, user chooses "Join Existing Family"
2. User provides: name, email, password, target adult email, optional message
3. System creates join request
4. All adults in target family see pending request
5. Any adult can approve or reject
6. Approved user added to family, does not auto-join trips
7. User must be manually added to trips by family

#### Database Schema

```typescript
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

#### API Endpoints

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

#### Frontend Components

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

#### Notifications

- All family adults: New join request received
- Requester: Request approved/rejected

#### MVP Alternative

For MVP, families add adults directly through family management. This requires coordination outside the app (phone call, WhatsApp, etc.) but is much simpler to implement.

---

### 2. Enhanced Dietary Requirements

**Status:** Basic per-member implementation in MVP, enhancements for future  
**Related User Stories:** US-F013  
**Priority:** P2  
**Estimated Effort:** 2 days

#### Description

Enhance the dietary requirements system with global preferences, auto-complete suggestions, and admin editing capabilities.

#### Current MVP Implementation

- Per-trip, per-member dietary requirements
- Free text input only
- Family can edit, admin can view only
- Privacy: Only visible to family and trip admins

#### Future Enhancements

**A) Global Dietary Preferences**

- Store dietary preferences on User model
- Auto-populate when joining new trips
- Example: User always has "nut allergy" - pre-fills for all trips
- Users can override per trip if needed

**B) Auto-Complete Suggestions**

- Common dietary requirements dropdown:
  - Vegetarian
  - Vegan
  - Gluten-free
  - Nut allergy
  - Dairy-free
  - Kosher
  - Halal
  - Other allergies
- Multi-select checkboxes + free text field for details
- Easier data entry and consistency
- Better for filtering/reporting

**C) Admin Editing & Notes**

- Trip admins can add notes to dietary requirements
- Admin notes visible separately from family input
- Use case: "Confirmed with family", "Special meal prepared"
- Family input remains read-only to admin
- Admin notes for coordination purposes

#### Database Schema Changes

```typescript
// Add to User model
model User {
  // ... existing fields
  defaultDietaryRequirements: string?  // Global preference
}

// Add to DietaryRequirement model
model DietaryRequirement {
  // ... existing fields
  predefinedTypes: string[]  // Array of selected common types
  adminNotes: string?        // Admin coordination notes
  adminNotesBy: string?      // Admin who added notes
  adminNotesAt: DateTime?    // When notes added
}
```

#### Implementation Priority

- Global preferences: Phase 3 (P2)
- Auto-complete: Phase 3 (P2)
- Admin notes: Phase 2 (P1) - more urgent for coordination

---

### 3. Enhanced Admin Notes & Coordination

**Status:** Basic admin notes in Phase 1, enhancements for future  
**Related User Stories:** US-T007  
**Priority:** P2  
**Estimated Effort:** 1.5 days

#### Description

Enhance the admin notes system with optional sharing, categories/tags, and rich formatting.

#### Current MVP Implementation

- Per-trip-attendance admin notes
- Free text only
- Admin-only visibility
- Track who updated and when

#### Future Enhancements

**A) Optional Note Sharing**

- Admin can choose to share specific notes with families
- Checkbox: "Share this note with family"
- Use cases:
  - Share: "Please bring sunscreen for children"
  - Keep private: "Follow up on payment status"
- Shared notes visible in family trip details
- Clear indication which notes are shared vs. private

**B) Note Categories & Tags**

- Predefined categories:
  - 🚗 Transportation/Arrival
  - ♿ Accessibility/Special Needs
  - 📞 Communication Log
  - 🐕 Pets/Animals
  - ✅ Confirmations
  - ⚠️ Issues/Concerns
  - 📝 General
- Hashtag tags: #late #accessibility #pet #confirmed #payment
- Filter/search notes by category or tag
- Color-coding by category
- Multiple categories per note

**C) Rich Text Formatting**

- Basic formatting: bold, italic, lists
- Markdown support
- Better for longer notes
- Copy/paste formatted text

**D) Note Templates**

- Common note templates:
  - "Arriving late: [time] on [day]"
  - "Special dietary accommodations: [details]"
  - "Confirmed attendance via [method] on [date]"
- Quick insert with placeholders
- Admin can create custom templates

**E) Note History & Versions**

- Track all edits to notes
- Show edit history
- Who changed what and when
- Restore previous versions

#### Database Schema Changes

```typescript
// Enhance TripAttendance notes
model TripAttendance {
  // ... existing fields
  adminNotes: string?
  adminNotesShared: boolean @default(false)  // Can family see notes?
  adminNotesCategory: string?                 // Category selection
  adminNotesTags: string[]                    // Array of tags
  adminNotesUpdatedBy: string?
  adminNotesUpdatedAt: DateTime?
}

// Optional: Separate model for note history
model AdminNoteHistory {
  id                String @id @default(cuid())
  tripAttendanceId  String
  content           String
  shared            boolean
  category          string?
  tags              string[]
  editedBy          string
  editedAt          DateTime

  tripAttendance    TripAttendance @relation(fields: [tripAttendanceId])
  @@index([tripAttendanceId])
}
```

#### Implementation Priority

- Note sharing: Phase 2 (P1) - useful for communication
- Categories/tags: Phase 3 (P2) - nice organization
- Rich text: Phase 3 (P2) - not essential
- Templates: Phase 3 (P2) - efficiency gain
- History: Phase 3 (P2) - audit trail

---

## Future Considerations

### Features to Design

The following features are mentioned in user stories but require further design and prioritization:

1. **Per-Member Trip Participation** (Question 5)
   - Allow selecting specific family members for each trip
   - Related: Per-member dietary requirements

2. **WhatsApp Business API Integration** (Question 8)
   - Automated sending instead of manual copy/paste
   - Notification preferences per user

3. **Enhanced Privacy Controls** (Question 9)
   - Control visibility of profile photos, contact info, children's ages
   - Different visibility to trip admins vs. other families

4. **User-Initiated Account Deletion** (Question 10)
   - GDPR compliance feature
   - Request deletion → Super-admin review → Soft delete + anonymization

5. **Email Verification on Registration**
   - Security best practice
   - Verify email before family can participate

6. **Password Reset Functionality**
   - Forgot password flow
   - Email-based reset token

7. **Trip Waitlist**
   - When trip reaches capacity
   - Auto-notify when spots open

8. **In-App Notification System**
   - Real-time notifications for trip changes
   - Alternative/supplement to WhatsApp

9. **Multiple Photo Album URLs**
   - Support for multiple album platforms
   - Google Photos, iCloud, etc.

10. **Gear Condition Reporting**
    - Post-trip: Report gear damage/issues
    - Track gear quality over time

11. **Guest/Non-Family Participants**
    - Allow families to bring guests
    - Guests not part of family profile

12. **Advanced Reporting & Analytics**
    - Participation trends
    - Gear usage statistics
    - Family engagement metrics

13. **Automated Child Age Updates**
    - Annual birthday reminders
    - Option to auto-increment ages

14. **Trip Templates**
    - Reuse previous trip configurations
    - Standard gear lists for trip types

15. **Multi-Language Support**
    - Currently Hebrew only
    - Add English, Arabic, etc.

---

## Implementation Guidelines

When picking up features from this document:

1. **Review Current State:** Check if related code has changed since design
2. **Update Dependencies:** Verify database schema is compatible
3. **Test Integration:** Ensure feature integrates with current system
4. **Update Documentation:** Move feature from this doc to main docs when implemented
5. **User Feedback:** Consider if requirements have evolved since initial design

---

## Notes

- All database schemas use Prisma ORM
- All API endpoints follow RESTful conventions
- All notifications use WhatsApp message generation (manual copy/paste for MVP)
- RTL (Hebrew) support required for all UI components
- Mobile-responsive design required for all features
