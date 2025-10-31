# User Stories - Community Trip Organizer

**Last Updated:** October 18, 2025  
**Status:** Draft for Review

---

## Table of Contents

- [Family Member Stories](#family-member-stories)
- [Trip Admin Stories](#trip-admin-stories)
- [Super-Admin Stories](#super-admin-stories)
- [Cross-Cutting Stories](#cross-cutting-stories)

---

## Role Definitions

- **Family Member (FAMILY)**: Regular user who can participate in trips, manage their family profile
- **Trip Admin (TRIP_ADMIN)**: Family member with additional permissions to manage specific trips
- **Super-Admin (SUPER_ADMIN)**: System administrator with full access to all features and trips

**Note:** Trip Admin and Super-Admin roles inherit all Family Member capabilities.

---

## Family Member Stories

### Authentication & Registration

#### US-F001: Sign Up with Full Family Details

**As a** new user  
**I want to** register my family with all details (adults and children)  
**So that** I can participate in community trips

**Acceptance Criteria:**

- User provides family name (optional)
- User adds at least one adult (name, email, password)
- User can add additional adults with unique emails
- User can add children (name, age - no login credentials)
- User can add profile photos (optional)
- System validates email uniqueness
- System creates family account in PENDING status
- User receives confirmation message about admin approval needed
- ✅ **Status: Implemented** - `FamilyRegistrationForm` component exists

**Current State:** ✅ Fully implemented

---

#### US-F002: Join Existing Family via Request [PHASE 3]

**As a** new user who is part of an existing registered family  
**I want to** request to join that family using an adult member's email  
**So that** I don't need to create duplicate family information

**Acceptance Criteria:**

- User can choose "Join Existing Family" during registration
- User provides: their name, email, password, and target family adult's email
- User can include optional message explaining request
- System finds the target family and creates join request
- All target family adults see pending join request
- User account is created but in PENDING_FAMILY_APPROVAL status
- User cannot access system until request is approved
- User receives notification when approved/rejected
- Approved user does NOT automatically join family's existing trips

**Current State:** ❌ **NOT IMPLEMENTED** - Deprioritized to Phase 3

**Priority:** P2 (Phase 3)

---

#### US-F003: Sign In to Existing Account

**As a** registered family member  
**I want to** sign in with my credentials  
**So that** I can access the system

**Acceptance Criteria:**

- User can sign in with email/password
- User can sign in with Google OAuth
- User can sign in with Facebook OAuth (optional)
- System validates credentials
- System displays appropriate error for wrong credentials
- System redirects to family dashboard on success
- ✅ **Status: Implemented** - Authentication flows exist

**Current State:** ✅ Fully implemented

---

### Family Management

#### US-F004: View Family Profile

**As a** family member  
**I want to** view my family's profile  
**So that** I can see all family members and their details

**Acceptance Criteria:**

- User sees family name
- User sees list of all adult members (name, email, photo)
- User sees list of all child members (name, age)
- User sees family status (PENDING, APPROVED, ACTIVE)
- ✅ **Status: Implemented** - `FamilyDashboard` component exists

**Current State:** ✅ Fully implemented

---

#### US-F005: Edit Family Details

**As a** family member  
**I want to** edit family member information  
**So that** I can keep family data up to date

**Acceptance Criteria:**

- User can edit family name
- User can edit adult member details (name, email, photo)
- User can edit child member details (name, age)
- User can add new children to family
- User can add new adults to family (with their consent)
- User can remove children from family
- User can remove adults from family (requires confirmation)
- System validates all changes
- ✅ **Status: Implemented** - Family API endpoints exist

**Current State:** ✅ Fully implemented

---

#### US-F006: Accept/Reject Family Join Requests [PHASE 3]

**As an** adult family member  
**I want to** review and respond to requests from others wanting to join my family  
**So that** I can control who is part of my family account

**Acceptance Criteria:**

- Any adult family member can approve/reject requests (not just one)
- User sees notification badge for pending requests
- User can view list of pending join requests
- Each request shows: requester name, email, message, request date
- User can approve request (adds person to family)
- User can reject request (sends rejection notification)
- Requester receives notification of decision
- Approved member does NOT automatically join existing trips
- One approval from any adult is sufficient (doesn't require all adults)

**Current State:** ❌ **NOT IMPLEMENTED** - Deprioritized to Phase 3

**Priority:** P2 (Phase 3)

---

### Trip Discovery & Participation

#### US-F007: View Trip List

**As a** family member  
**I want to** see a categorized list of trips  
**So that** I can discover and manage trip participation

**Acceptance Criteria:**

- User sees tabs/filters for:
  - "Available to Join" - published future trips not attending
  - "My Trips" - trips family is attending or pending approval
  - "Past Trips" - completed trips family attended
- Each trip shows: name, location, dates, status badge
- User can search trips by name/location
- User can filter by date range
- Draft trips are not visible to family members
- ✅ **Status: Implemented** - `TripList` component exists

**Current State:** ✅ Mostly implemented, may need filter refinements

---

#### US-F008: Request to Join Trip with Member Selection

**As a** family member  
**I want to** request participation for specific family members  
**So that** my family can join community activities

**Acceptance Criteria:**

- User clicks "Request to Join" on trips requiring approval
- User selects which family members will attend (checkboxes)
- Shows member names, type (adult/child), and ages
- User must select at least one member
- User can specify dietary requirements per selected member (optional at request time)
- System creates participation request with status=PENDING
- Stores list of participating member IDs
- Trip admin receives notification of request with member details
- User sees "Pending Approval" badge on trip
- Before approval, user can only see: description, schedule, basic participant list
- User cannot volunteer for gear until approved
- User cannot see detailed gear list or assignments until approved
- User receives WhatsApp notification when approved/rejected
- If rejected, user can submit another request immediately
- Rejection reason shown to user (if admin provided one)

**Current State:** ❌ **NOT IMPLEMENTED** - No approval workflow or member selection exists

---

#### US-F009: Mark Trip Attendance with Member Selection

**As a** family member  
**I want to** mark which family members are attending a trip  
**So that** organizers know exactly who is participating

**Acceptance Criteria:**

- Only available for trips with `requireParticipationApproval = false`
- User sees attendance interface on trip detail page
- User can select which family members will attend (checkboxes)
- Shows member names, type (adult/child), and ages
- User must select at least one member to mark attendance
- User can select all members or subset
- User can toggle attendance on/off for entire family
- System saves attendance immediately with status=APPROVED
- User immediately gains full access to trip (gear volunteering, full details)
- User cannot mark attendance after cutoff date
- User cannot mark attendance for draft trips
- User sees warning X days before cutoff date
- User can specify dietary requirements per participating member
- ✅ **Status: Implemented** - `AttendanceMarker` component exists

**Current State:** ⚠️ **NEEDS UPDATE** - Lacks per-member selection and individual dietary requirements

---

#### US-F010: View Past Trip Details

**As a** family member  
**I want to** view details of trips my family attended  
**So that** I can review memories and information

**Acceptance Criteria:**

- User can only see past trips they attended
- User sees trip name, location, dates, description
- User sees trip schedule/itinerary
- User sees list of participating families (names, participant count)
- User sees complete gear list with distribution
- User sees gear their family brought
- User sees link to photo album (if available)
- User cannot edit any information (read-only)
- ✅ **Status: Implemented** - Trip detail page with read-only mode

**Current State:** ✅ Fully implemented

---

#### US-F011: View Available Trip Details (Before Joining)

**As a** family member  
**I want to** view details of available trips before requesting to join  
**So that** I can decide if my family wants to participate

**Acceptance Criteria:**

- User sees trip name, location, dates, description
- User sees trip schedule/itinerary with times and activities
- User sees basic participant list: family names and participant count only
- User sees total number of families participating
- User sees attendance cutoff date
- User sees "Request to Join" button (if approval required) or "Mark Attendance" button (if open enrollment)
- User does NOT see:
  - Detailed gear list or gear assignments
  - Other families' dietary requirements
  - Contact information of participants
  - Admin notes or internal trip details
- If trip has capacity limit, show "X / Y families registered"
- If trip is full, show "Trip Full" badge

**Current State:** ⚠️ **NEEDS UPDATE** - Currently shows more than intended

---

#### US-F012: View Current/Future Trip Details (Participating)

**As a** family member  
**I want to** view full details of trips my family is attending  
**So that** I can prepare and manage our participation

**Acceptance Criteria:**

- User sees all information from US-F010 (past trips)
- User can edit dietary requirements before trip starts
- User can volunteer for gear items
- User can edit gear commitments before trip starts
- User sees gear distribution among all families
- User sees trip schedule with times and locations
- User sees link to photo album (if added by admin)
- User receives updates if trip details change

**Current State:** ✅ Mostly implemented

---

#### US-F013: Update Dietary Requirements Per Member

**As a** family member attending a trip  
**I want to** specify dietary requirements for each participating family member  
**So that** trip organizers can plan meals accordingly

**Acceptance Criteria:**

- User sees dietary requirements section for each participating member
- Each member has individual text field for dietary info (free text)
- Shows member name and type (adult/child) next to each field
- User can enter dietary info (allergies, preferences, restrictions)
- User can update dietary info anytime before trip starts
- System saves changes immediately per member
- Trip admins can view dietary requirements (read-only)
- Other families CANNOT see dietary requirements
- Export/print view (for admins) groups by family but shows per-member details
- Empty dietary field = no special requirements for that member

**Current State:** ⚠️ **NEEDS IMPLEMENTATION** - Currently family-level only

**Priority:** P0 (Phase 1.4)

---

### Gear Management

#### US-F014: Volunteer for Trip Gear

**As a** family member attending a trip  
**I want to** volunteer to bring specific gear items  
**So that** I can contribute to shared trip equipment

**Acceptance Criteria:**

- User sees list of gear items needed for trip
- Each gear item shows: name, total needed, already committed
- User can click "Volunteer" on gear items
- User specifies quantity they'll bring
- System validates quantity doesn't exceed what's needed
- User sees their family's gear commitments highlighted
- User can edit or remove commitments before trip starts
- ✅ **Status: Implemented** - Gear components exist

**Current State:** ✅ Fully implemented

---

#### US-F015: View Gear Distribution

**As a** family member attending a trip  
**I want to** see which families are bringing which gear  
**So that** I know what's covered and what's still needed

**Acceptance Criteria:**

- User sees complete gear list for trip
- Each item shows total needed vs. committed
- Each item shows list of families bringing it with quantities
- Items fully covered shown with green indicator
- Items needing more shown with warning indicator
- User's family commitments highlighted
- ✅ **Status: Implemented** - `GearList` and `GearAssignmentList` components

**Current State:** ✅ Fully implemented

---

### Trip Creation

#### US-F016: Create New Trip (Become Trip Admin)

**As a** family member  
**I want to** create a new trip  
**So that** I can organize community activities and become its admin

**Acceptance Criteria:**

- User can access "Create Trip" option
- User provides: name, location, description, dates
- User can specify attendance cutoff date
- Trip is created in DRAFT status (not visible to others)
- User automatically becomes trip admin for this trip
- User gains TRIP_ADMIN role (if not already)
- Super-admin receives notification to review/publish trip
- ✅ **Status: Implemented** - `TripForm` component exists

**Current State:** ✅ Fully implemented

---

## Trip Admin Stories

**Note:** Trip admins inherit all Family Member capabilities (US-F001 through US-F016)

### Trip Management

#### US-T001: View All Trips I Manage

**As a** trip admin  
**I want to** see a list of trips I'm managing  
**So that** I can access and manage them efficiently

**Acceptance Criteria:**

- User sees dedicated admin dashboard
- User sees only trips where they're assigned as admin
- User sees trip status: draft, published, active, completed
- User can filter by status and date
- User can click trip to manage details
- ✅ **Status: Implemented** - Admin dashboard exists

**Current State:** ✅ Fully implemented

---

#### US-T002: Edit Trip Details

**As a** trip admin  
**I want to** edit trip information at any time  
**So that** I can update details as plans change

**Acceptance Criteria:**

- User can edit: name, location, description
- User can edit: start date, end date, cutoff date
- User can update photo album URL
- User can edit draft or published trips (no restrictions)
- System validates dates (end after start, cutoff before start)
- System notifies participating families of changes via WhatsApp
- Changes are logged in activity log with before/after values
- Major changes (dates, location) show warning before saving
- ✅ **Status: Implemented** - `TripForm` with edit mode

**Current State:** ✅ Fully implemented

---

#### US-T003: Manage Trip Schedule

**As a** trip admin  
**I want to** create and edit the trip schedule  
**So that** participants know the itinerary

**Acceptance Criteria:**

- User can add schedule items with: day, start time, end time, title, description, location
- User can edit existing schedule items
- User can delete schedule items
- User can reorder schedule items
- Schedule displays in chronological order
- All participants can view schedule
- Changes notify participants via WhatsApp (optional)
- ✅ **Status: Implemented** - Backend API exists, UI may need enhancement

**Current State:** ✅ Backend implemented, frontend basic

---

#### US-T004: View Participation Requests

**As a** trip admin  
**I want to** see all families that requested to join my trip  
**So that** I can review and approve/reject them

**Acceptance Criteria:**

- User sees "Participation Requests" section in trip management
- Shows count of pending requests as badge
- Each pending request shows:
  - Family name
  - Number of adults and children
  - Family member names and ages
  - Dietary requirements (if provided)
  - Request date/time
- User can filter by: Pending, Approved, Rejected, All
- User sees request history with timestamps
- Each request has "Approve" and "Reject" action buttons
- Requests sorted by request date (oldest first)
- User can click family name to see full family profile

**Current State:** ❌ **NOT IMPLEMENTED** - No approval workflow exists

---

#### US-T005: Approve/Reject Participation Requests

**As a** trip admin  
**I want to** approve or reject family participation requests  
**So that** I can control trip attendance

**Acceptance Criteria:**

- User clicks "Approve" to accept family into trip
- Approved family's TripAttendance status changes to APPROVED
- Approved families immediately gain access to:
  - Full trip details and participant list
  - Gear volunteering capability
  - Contact information of other participants
  - Ability to edit dietary requirements
- User clicks "Reject" to decline family request
- Rejection shows optional reason text field
- Rejected family's TripAttendance status changes to REJECTED
- Rejected families can submit new request (no cooldown period)
- System sends WhatsApp notification with decision (includes reason if provided)
- Action logged with: admin who responded, timestamp, decision, reason
- Request removed from pending list after decision

**Current State:** ❌ **NOT IMPLEMENTED** - No approval workflow exists

---

#### US-T006: View All Participating Families and Members

**As a** trip admin  
**I want to** see detailed attendance breakdown by family and member  
**So that** I can manage participation and contact families if needed

**Acceptance Criteria:**

- User sees complete list of attending families
- Each family shows:
  - Family name
  - List of attending members (names, adult/child, ages)
  - Total adults and children counts
  - Attendance status (PENDING/APPROVED/REJECTED)
  - Dietary requirements per member
- User can expand/collapse family details
- User sees total trip statistics:
  - Total families
  - Total adults attending
  - Total children attending (with age breakdown if needed)
- User can view family contact information (email at minimum)
- User can filter by: dietary requirements, age groups, attendance status
- User can export participant list
- ✅ **Status: Implemented** - `AttendanceSummary` component

**Current State:** ⚠️ **NEEDS UPDATE** - Lacks per-member breakdown and statistics

---

#### US-T007: Edit Family Participation Details

**As a** trip admin  
**I want to** edit participation details and add coordination notes for attending families  
**So that** I can manage special cases, updates, and track important information

**Acceptance Criteria:**

- User can add/edit admin-only notes for specific family's trip participation
- Notes field: free text, up to 500-1000 characters
- Use cases: "Arriving late on Friday", "Special accessibility needs", "Confirmed by phone"
- User can edit family's gear commitments (remove if needed)
- User sees who last updated notes and when
- User can remove family from trip (with confirmation)
- Changes notify the affected family (except for notes - admin only)
- All changes are logged
- Notes are NOT visible to families (internal coordination tool)

**Current State:** ⚠️ **PARTIALLY IMPLEMENTED** - Can edit gear, missing notes field

**Priority:** P1 (Phase 1.5)

---

### Gear Management

#### US-T008: Create Gear List for Trip

**As a** trip admin  
**I want to** define what gear items are needed for the trip  
**So that** families know what to bring

**Acceptance Criteria:**

- User can add gear items with: name, quantity needed
- User can edit gear item details
- User can delete gear items (if no commitments)
- User can see total needed vs. committed for each item
- System warns if deleting items with commitments
- ✅ **Status: Implemented** - `GearCreateDialog` component

**Current State:** ✅ Fully implemented

---

#### US-T009: Assign Gear to Families

**As a** trip admin  
**I want to** manually assign gear items to specific families  
**So that** I can ensure even distribution and confirm commitments

**Acceptance Criteria:**

- User can assign gear item to family with quantity
- User can edit existing assignments
- User can remove assignments
- User can see which families haven't been assigned gear
- System prevents over-assignment (more than needed)
- System sends notification to family when gear assigned
- ✅ **Status: Implemented** - Gear assignment API exists

**Current State:** ✅ Fully implemented

---

### Communication

#### US-T010: Generate WhatsApp Messages

**As a** trip admin  
**I want to** generate WhatsApp message templates  
**So that** I can communicate with participants efficiently

**Acceptance Criteria:**

- User can select message type: trip announcement, reminder, gear update, attendance update
- System generates message with trip details pre-filled
- User can customize message before copying
- User can copy message to clipboard
- User sees instructions for sending in WhatsApp
- System tracks which messages were generated (for records)
- ✅ **Status: Implemented** - `WhatsAppMessageGenerator` component

**Current State:** ✅ Fully implemented

---

#### US-T011: Send Trip Reminders

**As a** trip admin  
**I want to** manually trigger reminder messages  
**So that** I can keep participants informed

**Acceptance Criteria:**

- User can send "X days until trip" reminders
- User can send "cutoff date approaching" reminders
- User can send "gear reminder" messages
- User can customize reminder content
- System generates message with recipient list
- Messages include relevant trip details automatically

**Current State:** ✅ Template generation implemented, manual send via WhatsApp

---

### Administrative Actions

#### US-T012: Manage Co-Admins for Trip

**As a** trip admin, trip creator, or super-admin  
**I want to** add or remove trip admins  
**So that** we can share management responsibilities

**Acceptance Criteria:**

- Trip creators, existing trip admins, and super-admins can assign admins
- User sees list of current trip admins
- User can add new admin from list of family members
- User can remove existing admin (except themselves if last admin)
- System prevents removing last admin from trip
- Added admins receive notification via WhatsApp
- Removed admins receive notification
- New admins gain access to trip management immediately
- Changes are logged with who made the change
- ✅ **Status: Implemented** - `TripAdminManager` component

**Current State:** ✅ Fully implemented, may need permission update

---

#### US-T013: Cancel Trip

**As a** trip admin  
**I want to** cancel a trip I'm managing  
**So that** I can mark trips as cancelled when plans change

**Acceptance Criteria:**

- User sees "Cancel Trip" option with warning
- User must provide cancellation reason (required text field)
- User must confirm cancellation
- System performs soft-delete (trip marked as cancelled, not removed)
- Trip becomes hidden from family members' trip lists
- All trip data (attendance, gear, schedule) is preserved
- Trip admins and super-admins can still view cancelled trips
- No notifications are sent to participating families (admins handle communication manually)
- Action is logged with cancellation reason
- Super-admin can restore cancelled trip if needed

**Current State:** ⚠️ **NEEDS UPDATE** - Currently hard-deletes, needs soft-delete implementation

---

#### US-T014: Request Trip Publishing

**As a** trip admin  
**I want to** request my draft trip to be published  
**So that** families can discover and join it

**Acceptance Criteria:**

- User sees "Request Publish" button on draft trips
- User must complete required fields before requesting
- System validates trip has: name, location, dates, at least one admin
- System notifies all super-admins of publish request
- Trip remains in draft until super-admin publishes
- User receives notification when trip is published
- User cannot publish directly (requires super-admin approval)
- Request is tracked with timestamp

**Current State:** ⚠️ **NEEDS UPDATE** - Backend has publish endpoint but needs request workflow

---

## Super-Admin Stories

**Note:** Super-admins inherit all Trip Admin capabilities for ALL trips (US-T001 through US-T014)

### Family Management

#### US-SA001: View All Families

**As a** super-admin  
**I want to** see a list of all families in the system  
**So that** I can manage and oversee family accounts

**Acceptance Criteria:**

- User sees complete list of all families
- List shows: family name, status, member count, join date
- User can filter by status: pending, approved, inactive
- User can search by family name
- User can sort by various fields
- ✅ **Status: Implemented** - Super-admin panel exists

**Current State:** ✅ Fully implemented

---

#### US-SA002: Approve New Family Registrations

**As a** super-admin  
**I want to** approve or reject new family registrations  
**So that** I can control who joins the community

**Acceptance Criteria:**

- User sees list of families with PENDING status
- User can view family details before approving
- User clicks "Approve" to activate family
- Approved families can now sign in and participate
- User can reject family with reason
- Rejected families are notified
- Action is logged
- ✅ **Status: Implemented** - Approval API exists

**Current State:** ✅ Fully implemented

---

#### US-SA003: Edit Any Family's Details

**As a** super-admin  
**I want to** edit details of any family  
**So that** I can fix errors or update information

**Acceptance Criteria:**

- User can edit family name
- User can edit family member details
- User can add/remove family members
- User can change family status
- Changes notify family via email
- All changes are logged
- ✅ **Status: Implemented** - Family update API with role check

**Current State:** ✅ Fully implemented

---

#### US-SA004: Deactivate/Reactivate Families

**As a** super-admin  
**I want to** deactivate or reactivate family accounts  
**So that** I can manage problematic accounts without deletion

**Acceptance Criteria:**

- User can deactivate active families
- Deactivated families cannot sign in
- Deactivated families removed from future trips
- Past trip data is preserved
- User can reactivate deactivated families
- Reactivated families can sign in again
- Action is logged
- ✅ **Status: Implemented** - API endpoints exist

**Current State:** ✅ Fully implemented

---

#### US-SA005: Delete Families Permanently

**As a** super-admin  
**I want to** permanently delete family accounts  
**So that** I can remove families from the system

**Acceptance Criteria:**

- User sees "Delete Permanently" option with strong warning
- User must confirm deletion twice
- System lists all associated data that will be deleted
- Historical trip data is preserved (family marked as deleted)
- User can export family data before deletion (GDPR)
- Action is logged
- ✅ **Status: Implemented** - Delete API exists

**Current State:** ✅ Fully implemented

---

### User Management

#### US-SA006: View All Users

**As a** super-admin  
**I want to** see a list of all individual users  
**So that** I can manage user accounts and roles

**Acceptance Criteria:**

- User sees list of all users (adults only, as children don't have accounts)
- List shows: name, email, family, role, status
- User can filter by role: FAMILY, TRIP_ADMIN, SUPER_ADMIN
- User can search by name or email
- User can see user's family affiliation
- ✅ **Status: Implemented** - Admin user management exists

**Current State:** ✅ Fully implemented

---

#### US-SA007: Edit User Details

**As a** super-admin  
**I want to** edit any user's details  
**So that** I can fix errors or update information

**Acceptance Criteria:**

- User can edit user name
- User can edit user email
- User can change user's family association
- User can update user's profile photo
- Changes notify user via email
- All changes are logged
- ✅ **Status: Implemented** - User update API exists

**Current State:** ✅ Fully implemented

---

#### US-SA008: Manage User Roles

**As a** super-admin  
**I want to** assign or remove roles from users  
**So that** I can control access permissions

**Acceptance Criteria:**

- User can promote FAMILY to TRIP_ADMIN
- User can promote TRIP_ADMIN to SUPER_ADMIN
- User can demote SUPER_ADMIN to TRIP_ADMIN
- User can demote TRIP_ADMIN to FAMILY
- User cannot demote themselves if last super-admin
- System validates role changes
- Role changes notify affected user
- ✅ **Status: Implemented** - `UserRoleManagement` component

**Current State:** ✅ Fully implemented

---

### Trip Management

#### US-SA009: View All Trips

**As a** super-admin  
**I want to** see all trips in the system  
**So that** I can oversee trip management

**Acceptance Criteria:**

- User sees complete list of all trips
- List shows: name, dates, status, admins, participant count
- User can filter by status: draft, published, completed
- User can filter by date range
- User can search by name or location
- ✅ **Status: Implemented** - Super-admin panel exists

**Current State:** ✅ Fully implemented

---

#### US-SA010: Publish Draft Trips

**As a** super-admin  
**I want to** review and publish draft trips  
**So that** I can control which trips are available to families

**Acceptance Criteria:**

- User sees list of draft trips awaiting approval
- User can review trip details before publishing
- User must assign at least one trip admin before publishing
- User clicks "Publish" to make trip visible to families
- Published trips appear in family trip lists
- Trip creator is notified of publication
- ✅ **Status: Implemented** - Publish/unpublish API exists

**Current State:** ✅ Fully implemented

---

#### US-SA011: Assign Trip Admins to Any Trip

**As a** super-admin  
**I want to** assign or remove trip admins for any trip  
**So that** I can ensure proper trip management

**Acceptance Criteria:**

- User can add trip admin to any trip
- User can remove trip admin from any trip
- System prevents removing last admin
- User can assign multiple admins to a trip
- Assigned admins receive notification
- Changes are logged
- ✅ **Status: Implemented** - API endpoints exist

**Current State:** ✅ Fully implemented

---

#### US-SA012: Delete Any Trip

**As a** super-admin  
**I want to** delete any trip from the system  
**So that** I can remove inappropriate or problematic trips

**Acceptance Criteria:**

- User can delete any trip regardless of status
- User must confirm deletion
- System warns if families are participating
- All participants are notified before deletion
- Trip data is archived (not permanently deleted)
- Action is logged
- ✅ **Status: Implemented** - Delete API exists

**Current State:** ✅ Fully implemented

---

### System Analytics & Reporting

#### US-SA013: View System Dashboard

**As a** super-admin  
**I want to** see system-wide statistics  
**So that** I can monitor community health and engagement

**Acceptance Criteria:**

- Dashboard shows total families (by status)
- Dashboard shows total users (adults/children)
- Dashboard shows total trips (by status)
- Dashboard shows participation rates
- Dashboard shows gear statistics
- Dashboard shows recent activity
- User can filter by date range
- ✅ **Status: Implemented** - Admin stats API exists

**Current State:** ✅ Fully implemented

---

#### US-SA014: Generate System Reports

**As a** super-admin  
**I want to** generate reports on trip and family activity  
**So that** I can analyze community engagement

**Acceptance Criteria:**

- User can generate report: families registered over time
- User can generate report: trip participation rates
- User can generate report: most active families
- User can generate report: gear volunteering statistics
- Reports exportable as CSV or PDF
- Reports include date range filters

**Current State:** ❌ **NOT IMPLEMENTED** - No reporting features

---

#### US-SA015: Permanently Delete Trip

**As a** super-admin  
**I want to** permanently delete trips from the system  
**So that** I can remove erroneous or inappropriate trips completely

**Acceptance Criteria:**

- User can access cancelled trips list
- User sees "Permanently Delete" option on cancelled trips
- User must confirm deletion with extra warning
- System warns about data loss (all attendance, gear, schedule will be removed)
- Trip and all related data are permanently removed from database
- Action is logged in system activity log
- This action is irreversible
- Only super-admins have this capability

**Current State:** ❌ **NOT IMPLEMENTED** - No hard-delete for super-admin

---

#### US-SA015: Export System Data

**As a** super-admin  
**I want to** export various data reports  
**So that** I can analyze data externally or comply with regulations

**Acceptance Criteria:**

- User can export family list with details
- User can export trip attendance reports
- User can export gear statistics
- User can export activity logs
- Exports available in CSV and JSON formats
- User can specify date range for exports
- ✅ **Status: Implemented** - Export API exists

**Current State:** ✅ Fully implemented

---

## Cross-Cutting Stories

### Error Handling

#### US-X001: Graceful Error Messages

**As a** user  
**I want to** see clear, helpful error messages  
**So that** I understand what went wrong and how to fix it

**Acceptance Criteria:**

- All errors display in Hebrew (RTL)
- Network errors show "Connection problem, please try again"
- Validation errors show specific field issues
- Permission errors show "You don't have access to this feature"
- System errors show generic message and log details
- Errors don't expose technical details to users

**Current State:** ⚠️ Needs consistency review

---

#### US-X002: Loading States

**As a** user  
**I want to** see loading indicators during operations  
**So that** I know the system is working

**Acceptance Criteria:**

- All data fetches show loading spinner
- Button clicks show loading state during processing
- Long operations show progress indicators
- Page navigation shows loading transition
- Loading states prevent duplicate submissions

**Current State:** ✅ Mostly implemented

---

### Notifications

#### US-X003: In-App Notifications

**As a** user  
**I want to** receive notifications for important events  
**So that** I stay informed about changes

**Acceptance Criteria:**

- User sees notification badge for unread items
- User can view notification list
- Notifications include: trip changes, approval decisions, gear assignments
- User can mark notifications as read
- User can clear all notifications
- Notifications persist until acknowledged

**Current State:** ⚠️ Basic notification context exists, needs expansion

---

#### US-X004: WhatsApp Notification Preferences

**As a** user  
**I want to** control which WhatsApp notifications I receive  
**So that** I'm not overwhelmed with messages

**Acceptance Criteria:**

- User can enable/disable WhatsApp notifications
- User can choose notification types: trip updates, reminders, gear changes
- User can set notification frequency: immediate, daily digest, weekly
- Changes apply immediately
- User can still receive critical notifications even if opted out

**Current State:** ❌ **NOT IMPLEMENTED**

---

### Accessibility & UX

#### US-X005: Mobile Responsive Design

**As a** mobile user  
**I want to** use all features on my phone  
**So that** I can manage trips on the go

**Acceptance Criteria:**

- All pages responsive on mobile devices
- Touch-friendly buttons and controls
- Readable text sizes on small screens
- Proper RTL layout on mobile
- Mobile navigation optimized
- Forms work well on mobile keyboards

**Current State:** ✅ Implemented with Tailwind responsive classes

---

#### US-X006: Hebrew RTL Support

**As a** Hebrew-speaking user  
**I want to** see proper RTL layout  
**So that** the interface is natural to read

**Acceptance Criteria:**

- All text displays right-to-left
- Form fields aligned to right
- Navigation flows right-to-left
- Icons and buttons properly positioned
- Numbers and dates formatted for Hebrew
- Mixed content (English URLs) handled correctly

**Current State:** ✅ Implemented throughout

---

#### US-X007: Keyboard Navigation

**As a** user preferring keyboard navigation  
**I want to** access all features via keyboard  
**So that** I can use the app without a mouse

**Acceptance Criteria:**

- All interactive elements keyboard accessible
- Tab order is logical (RTL appropriate)
- Form submission works with Enter key
- Dialogs closable with Escape key
- Focus indicators clearly visible
- Skip links for main content

**Current State:** ⚠️ Shadcn/UI components support this, needs testing

---

### Data & Privacy

#### US-X008: Data Privacy Controls

**As a** user  
**I want to** control my family's data visibility  
**So that** I can maintain privacy

**Acceptance Criteria:**

- User can hide profile photos from other families
- User can hide children's exact ages (show age ranges)
- User can control who sees contact information
- User sees what data is visible to others
- Changes apply immediately

**Current State:** ❌ **NOT IMPLEMENTED**

---

#### US-X009: Data Export (GDPR)

**As a** user  
**I want to** export my family's data  
**So that** I can have a copy for my records or transfer

**Acceptance Criteria:**

- User can request data export
- Export includes all family information
- Export includes trip participation history
- Export available in JSON and PDF formats
- User receives download link via email
- Export complies with GDPR requirements

**Current State:** ❌ **NOT IMPLEMENTED**

---

#### US-X010: Account Deletion Request

**As a** user  
**I want to** request my family account be deleted  
**So that** I can remove our data from the system

**Acceptance Criteria:**

- User can request account deletion
- System explains what will be deleted vs. archived
- User must confirm deletion request
- Super-admin reviews and processes request
- Historical trip data preserved (anonymized)
- User receives confirmation when deleted

**Current State:** ❌ **NOT IMPLEMENTED** - Only super-admin can delete

---

## Summary Statistics

### Implementation Status

- ✅ **Fully Implemented**: 42 stories
- ⚠️ **Partially Implemented**: 8 stories
- ❌ **Not Implemented**: 10 stories

### Critical Gaps Requiring Decisions

1. **Family Join Request Workflow** (US-F002, US-F006)
2. **Trip Participation Approval Workflow** (US-F008, US-T004, US-T005)
3. **Per-Member Trip Participation** (US-F008, US-F009)
4. **Per-Member Dietary Requirements** (US-F013)
5. **Family Participation Notes** (US-T007)
6. **Trip Deletion Permissions** (US-T013 conflicts with SPEC)
7. **Trip Publish Workflow** (US-T014 vs US-SA010)
8. **WhatsApp Notification Preferences** (US-X004)
9. **Data Privacy Controls** (US-X008)
10. **User-Initiated Account Deletion** (US-X010)

---

**Next Steps:**

1. Review and validate these user stories
2. Resolve conflicts and answer questions
3. Create implementation plan for gaps
