# User Stories - Questions & Conflicts

**Date:** October 18, 2025  
**Purpose:** Resolve conflicts and clarify missing requirements before implementation

---

## 🚨 Critical Conflicts Requiring Decisions

### 1. Trip Deletion Permissions ✅ RESOLVED

**Decision:** Trip admins can soft-delete trips (hide from all users except super-admins). Super-admins can restore or permanently delete.

**Details:**
- Trip admin soft-deletes → Trip hidden from all families and admins (except super-admin)
- Cancellation reason field is required
- No notifications sent to families
- All data preserved (attendance, gear, dietary info) but hidden
- Super-admin can view deleted trips, restore them, or permanently delete
- No notification when super-admin restores a trip
- Participating families cannot see deleted trips even in their history

**Priority:** P0 (Critical - resolve conflict)

**Implementation Notes:**
- Add `deleted: boolean` field to Trip model
- Add `deletedAt: DateTime` field
- Add `deletedBy: string` (userId) field  
- Add `deletionReason: string` field (required)
- Filter deleted trips from all family/trip-admin queries
- Super-admin queries include deleted trips with special indicator

---

### 2. Trip Publishing Workflow ✅ RESOLVED

**Decision:** Trip creators request publish, super-admin reviews and publishes. Super-admin can unpublish. Trip details can be edited anytime.

**Details:**
- A) Trip admins CANNOT self-publish - must request super-admin to publish
- B) Super-admin CAN unpublish published trips (moves back to draft)
- C) Trip details CAN be edited at any time (before or after publishing)
- D) Either super-admins, existing trip admins, or trip creators can assign new trip admins

**Workflow:**
1. Family member creates trip → Status: DRAFT, creator becomes trip admin
2. Trip creator requests publish → Notification sent to all super-admins
3. Super-admin reviews trip details → Can assign additional admins if needed
4. Super-admin publishes trip → Status: PUBLISHED (visible to families)
5. Trip admins can edit details anytime → Participants notified of changes
6. Super-admin can unpublish if needed → Back to DRAFT (hidden from families)

**Priority:** P0 (Critical - core workflow)

**Implementation Notes:**
- Add `publishRequested: boolean` field to Trip model
- Add `publishRequestedAt: DateTime` field
- Add `publishedAt: DateTime` field
- Add `publishedBy: string` (userId) field
- Add `unpublishedAt: DateTime` (nullable) for audit trail
- Trip admins see "Request Publish" button when in draft
- Super-admin sees "Pending Publish" section in dashboard
- Super-admin sees "Publish" and "Unpublish" buttons
- Notifications sent when trip details edited (to participants)
- Trip creator automatically assigned as trip admin on creation
- Trip admins (including creator) can assign additional trip admins

---

### 3. Trip Participation Workflow ✅ RESOLVED

**Decision:** Configurable per trip, default requires approval. Limited trip info shown until approved. No conditional approval rules.

**Details:**
- A) Approval requirement is **configurable per trip** via `requireParticipationApproval: boolean` field
- B) Default is `true` (approval required) - admins must explicitly enable open enrollment
- C) Before approval, families can only see:
  - Trip description
  - Trip schedule/itinerary
  - Basic participant list (family names and count, no details)
  - Cannot see: detailed gear list, gear assignments, dietary requirements, contact info
  - Cannot volunteer for gear until approved
  - Rejected families can request again (no cooldown, no restrictions)
- D) No conditional approval rules - all families treated equally regardless of history

**Workflow:**
1. Family views published trip → Sees limited info
2. Family clicks "Request to Join" → Enters dietary requirements (optional)
3. System creates TripAttendance with status=PENDING
4. Trip admin sees pending request in their dashboard
5. Admin reviews request → Approves or rejects (with optional reason)
6. If approved: Family gains full access (gear volunteering, full participant list)
7. If rejected: Family sees rejection message, can submit new request

**Priority:** P1 (Important - core feature for community management)

**Implementation Notes:**
- Add `requireParticipationApproval: boolean` to Trip model (default: true)
- Add `status` enum to TripAttendance: PENDING, APPROVED, REJECTED
- Add `requestedAt`, `respondedAt`, `respondedBy`, `rejectionReason` to TripAttendance
- Trip admins see "Participation Requests" section
- Families see "Pending Approval" status on their attendance
- Approval/rejection sends WhatsApp notification to family

---

## ❓ Missing Features Requiring Clarification

### 4. Family Join Request Workflow ✅ RESOLVED

**Decision:** Deprioritized to Phase 3 (not MVP). Users can only add adults directly for now.

**Details:**
- A) Feature is **NOT essential for MVP** - deprioritized to Phase 3
- B) When implemented: New member does NOT automatically join existing trips (remain separate)
- C) Users belong to **one family forever** (cannot switch or be in multiple families)
- D) **All adult family members** can approve join requests (any adult, not just one)

**MVP Alternative:**
- Families add new adults directly to their family (requires coordination outside app)
- New adults receive invitation link/code to complete registration
- Simpler flow, less complexity

**Phase 3 Implementation (Future):**
1. During registration, user can choose "Join Existing Family"
2. User provides: name, email, password, target adult email, optional message
3. System creates join request
4. All adults in target family see pending request
5. Any adult can approve or reject
6. Approved user added to family, does not auto-join trips
7. User must be manually added to trips by family

**Priority:** P2 (Nice-to-have - Phase 3)

**Implementation Notes (Future):**
- Add `FamilyJoinRequest` model with status: PENDING, APPROVED, REJECTED
- User accounts created in PENDING_FAMILY state until approved
- Requests visible to all adult family members
- Simpler than initially designed

---

---

## ❓ Missing Features Requiring Clarification

### 5. Per-Member Trip Participation ✅ RESOLVED

**Decision:** Essential for MVP - implement per-member selection with individual dietary requirements.

**Details:**
- A) **Essential for MVP** - must be implemented in Phase 1
- B) Gear assignments remain **family-level** (not affected by member selection)
- C) **Yes** - implement individual dietary requirements per participating member
- D) **Yes** - attendee count and ages affect pricing (if implemented later)
  - Trip capacity should count individual attendees, not families
  - Age-based pricing may be implemented in future

**Implementation:**
- Add `participatingMemberIds: string[]` to TripAttendance model
- Empty array = all family members attending (backward compatible)
- Populated array = only selected members attending
- Dietary requirements restructured: per-member instead of family-level
- Gear volunteering remains at family level
- Trip capacity counts total attendees (adults + children), not families
- Admin views show participant breakdown by member

**Priority:** P0 (Critical - MVP essential)

**Implementation Notes:**
- Add `DietaryRequirement` model linked to User and TripAttendance
- UI: Checkbox list for member selection when marking attendance
- Show member names, types (adult/child), and ages
- Each selected member can have individual dietary requirements
- Trip participant count = sum of selected members across all families
- Backward compatibility: existing attendance without member selection treated as "all members"

---

### 6. Per-Member Dietary Requirements ✅ RESOLVED

**Decision:** Implemented in Phase 1 (Question 5). Remaining design decisions finalized.

**Details:**
- A) **Per-trip only** - dietary requirements stored per TripAttendance/User combination
  - Simpler for MVP
  - Users re-enter for each trip (can copy from previous trips)
  - Global preferences can be added in Phase 3
- B) **Free text only** - no predefined options or suggestions
  - Simplest implementation
  - Most flexible for users
  - Auto-complete suggestions can be added later
- C) **Admin view-only** - trip admins cannot edit family dietary requirements
  - Families own their data
  - Admins can view for meal planning
  - Admin notes stored separately (US-T007)

**Privacy:**
- Dietary requirements visible ONLY to:
  - The family who entered them
  - Trip admins for that specific trip
  - Super-admins
- NOT visible to other families

**Priority:** P0 (Critical - included in Phase 1.4)

**Implementation Notes:**
- Already designed in Phase 1.4 (Per-Member Trip Participation)
- DietaryRequirement model with access control
- API endpoints filter by user role
- Frontend hides other families' dietary info

---

### 7. Family Participation Notes ✅ RESOLVED

**Decision:** Admin-only coordination notes, free text, per-trip-attendance.

**Details:**
- A) **General coordination notes** - all types (arrival times, special needs, communication log, etc.)
- B) **Admin-only** - internal coordination tool, families cannot see notes
  - Sharing capability can be added in Phase 3
- C) **Free text only** - no predefined categories or tags for MVP
  - Categories/tags can be added in Phase 3
- D) **Per-trip-attendance** - notes specific to each family's participation in each trip
  - Different trips may have different notes for same family

**Implementation:**
- Add to TripAttendance model:
  - `adminNotes: string` (nullable)
  - `adminNotesUpdatedAt: DateTime` (nullable)
  - `adminNotesUpdatedBy: string` (userId, nullable)
- API endpoint: `PUT /api/trips/:tripId/attendees/:attendeeId/notes`
- Only TRIP_ADMIN and SUPER_ADMIN can view/edit
- Shows who last updated and when
- Modal/inline edit in attendance summary

**Priority:** P1 (Important - Move to Phase 1.5)

**Implementation Notes:**
- Simple text field in admin attendance view
- Edit icon next to each family
- Show last updated timestamp and admin name
- Not visible to families (different from dietary requirements)

---

### 8. WhatsApp Notification Preferences ❌

**Current:** All messages manually generated and copied to WhatsApp
**User Story US-X004:** Users control which notifications they receive

**Questions:**
- A) Is this about in-app notifications or actual WhatsApp messages?
- B) Since WhatsApp is manual (copy/paste), how would preferences work?
- C) Should this be about email notifications instead?
- D) Do we need notification preferences for MVP?

**Recommendation:** 
- For MVP: Manual WhatsApp (current implementation is fine)
- Add email notification preferences
- Phase 2: Consider WhatsApp Business API for automated sending

---

### 9. Data Privacy Controls ❌

**User Story US-X008:** Users control data visibility

**Questions:**
- A) What specifically should be controllable?
   - Profile photos visibility?
   - Contact email/phone visibility?
   - Children's exact ages vs. age ranges?
- B) Should this be family-level or per-member settings?
- C) How does this affect trip admin's ability to contact families?

**Recommendation:** 
- MVP: All data visible to trip admins and super-admins (necessary for coordination)
- Phase 2: Add privacy controls for data visible to OTHER FAMILIES

---

### 10. User-Initiated Account Deletion ❌

**Current:** Only super-admin can delete families
**User Story US-X010:** Users can request account deletion

**Questions:**
- A) Should users self-delete immediately or request super-admin review?
- B) What happens to their trip participation history?
- C) Should we soft-delete (mark as deleted) or hard-delete?
- D) GDPR compliance: How long do we retain data after deletion?

**Recommendation:**
- Users can request deletion
- Super-admin reviews and processes (allows handling active trips)
- Soft delete with anonymization
- Historical data preserved for audit (name replaced with "Deleted User")

---

## 🔍 Technical Clarifications Needed

### 11. Family Status Flow

**Current Understanding:**
1. Family registers → PENDING status
2. Super-admin approves → APPROVED status
3. Family can be deactivated → INACTIVE status
4. Family can be reactivated → back to APPROVED

**Questions:**
- A) Is APPROVED the same as ACTIVE? (Code uses both terms)
- B) Can families sign in while PENDING? (Seems no based on spec)
- C) Should there be an email verification step before approval?

**Recommendation:** Standardize on: `PENDING → APPROVED → ACTIVE/INACTIVE`. APPROVED = can sign in, ACTIVE = currently active.

---

### 12. Trip Status Definitions

**Current Implementation:**
- `draft: boolean` field
- Frontend derives: draft, published, upcoming, active, past

**Questions:**
- A) Should we use explicit status enum? `DRAFT | PUBLISHED | ACTIVE | COMPLETED | CANCELLED`
- B) What's the difference between PUBLISHED and ACTIVE?
- C) How do we handle cancelled trips?

**Recommendation:**
- Keep `draft` boolean for simplicity
- Add `cancelled` boolean
- Derive status: draft + !cancelled = "Draft", !draft + future = "Published", etc.

---

### 13. Gear Assignment Logic

**Current:** Families volunteer for gear, admins can also assign

**Questions:**
- A) If admin assigns gear to family, does family get notified?
- B) Can family remove admin-assigned gear?
- C) What if family volunteers for more than needed?
- D) What if gear is under-assigned by cutoff date?

**Recommendation:**
- Admin assignments notify family but can be edited by family
- Prevent over-volunteering (validation)
- Admin gets warning for under-assigned gear

---

### 14. Attendance Cutoff Date Enforcement

**Current:** Cannot mark attendance after cutoff date

**Questions:**
- A) Can trip admin override cutoff for special cases?
- B) Can super-admin override cutoff?
- C) What happens if someone needs to cancel after cutoff?
- D) Should there be separate cutoffs for attendance vs. gear commitments?

**Recommendation:**
- Trip admin and super-admin can override cutoff (with warning)
- Add "emergency contact" option after cutoff
- Single cutoff date for simplicity (MVP)

---

### 15. Photo Album Link

**Current:** Single URL field for photo album

**Questions:**
- A) Should we support multiple albums? (e.g., Google Photos + iCloud)
- B) Who can edit album URL? (Only trip admin, or any participating family?)
- C) Should we validate the URL format?
- D) Should album be visible only after trip ends?

**Recommendation:**
- Single URL for MVP
- Only trip admin can set
- Basic URL validation (starts with https://)
- Visible anytime but more prominent after trip

---

## 🎯 Feature Prioritization Questions

### 16. MVP vs. Future Phases

**Question:** Which missing features are essential for MVP vs. nice-to-have?

**Please prioritize (P0=Essential, P1=Important, P2=Nice-to-have):**

- [ ] Family join request workflow (US-F002, US-F006)
- [ ] Trip participation approval workflow (US-F008, US-T004, US-T005)
- [ ] Per-member trip participation selection
- [ ] Per-member dietary requirements
- [ ] Family participation notes for admins
- [ ] WhatsApp notification preferences
- [ ] Data privacy controls
- [ ] User-initiated account deletion
- [ ] Email verification on registration
- [ ] Password reset functionality
- [ ] In-app notification system
- [ ] Multiple photo album URLs
- [ ] Gear condition reporting (post-trip)
- [ ] Trip cancellation workflow
- [ ] Guest/non-family participants

---

## 📝 Business Logic Questions

### 17. Capacity Limits

**Questions:**
- A) Should trips have maximum participant capacity?
- B) If yes, what happens when capacity is reached?
- C) Should there be a waitlist feature?

**Recommendation:** Add optional `maxParticipants` field. When reached, show "Full" status. Phase 2: Waitlist.

---

### 18. Multiple Trip Admin Coordination

**Questions:**
- A) Do co-admins see each other's actions in real-time?
- B) Can co-admins remove each other?
- C) Is there a "lead admin" concept?

**Recommendation:** 
- No lead admin (all equal)
- Co-admin can't remove others, only add
- Activity log shows who did what

---

### 19. Child Age Updates

**Questions:**
- A) Should child ages auto-increment yearly?
- B) Or manually updated by family?
- C) Show exact age or age range (e.g., "8-10")?

**Recommendation:** Manual update. Show exact age to admins, family controls visibility to others (privacy setting).

---

### 20. Trip Rescheduling

**Questions:**
- A) If trip dates change, how are families notified?
- B) Should families re-confirm attendance after date change?
- C) Can gear commitments be affected by reschedule?

**Recommendation:**
- WhatsApp notification on date change
- No re-confirmation needed (assume attendance unless family cancels)
- Gear commitments remain valid

---

## 💡 Please Provide Answers

For each numbered item (1-20), please provide:

1. **Your decision** (A, B, C, or custom)
2. **Priority** (P0, P1, P2) if applicable
3. **Any additional context** or constraints

**Format:**
```
1. Trip Deletion Permissions
   Decision: B (Cancel instead of delete)
   Priority: P0
   Notes: Need to preserve data for auditing

2. Trip Publishing Workflow
   Decision: Custom - [your description]
   ...
```

---

## Next Steps After Answers

1. I'll update the user stories based on your decisions
2. Create detailed implementation plan for gaps
3. Update database schema as needed
4. Create component/API specifications
5. Estimate effort for each missing feature
