# Implementation TODO Checklist

**Project:** Community Trip Organizer  
**Date Started:** October 18, 2025  
**Last Updated:** October 18, 2025  
**Status:** Not Started

---

## Progress Overview

### Overall Progress
- [ ] **Iteration 1:** Foundation & Infrastructure (0/2 steps)
- [ ] **Iteration 2:** Trip Cancellation/Deletion (0/6 steps)
- [ ] **Iteration 3:** Trip Publishing Workflow (0/6 steps)
- [ ] **Iteration 4:** Per-Member Participation (0/7 steps)
- [ ] **Iteration 5:** Admin Notes (0/4 steps)
- [ ] **Iteration 6:** Participation Approval (0/7 steps)
- [ ] **Iteration 7:** Email Verification (0/6 steps)
- [ ] **Iteration 8:** Password Reset (0/5 steps)

**Total:** 0/48 steps completed (0%)

### Time Tracking
- **Estimated Total:** 140-168 hours
- **Time Spent:** ___ hours
- **Remaining:** ___ hours

---

## ITERATION 1: FOUNDATION & INFRASTRUCTURE

**Goal:** Establish error handling and migration framework  
**Estimated:** 6-8 hours  
**Actual:** ___ hours  
**Status:** ⬜ Not Started

### Step 1.1: Enhanced Error Handling System
**Estimated:** 3-4 hours | **Actual:** ___ hours

#### Backend Tasks
- [ ] Create `packages/backend/src/types/errors.ts`
  - [ ] Define `ErrorCode` enum (VALIDATION_ERROR, UNAUTHORIZED, etc.)
  - [ ] Create `ApiError` class extending Error
  - [ ] Export factory functions (createValidationError, createUnauthorizedError, etc.)
- [ ] Create `packages/backend/src/utils/errorMessages.ts`
  - [ ] Define Hebrew error message constants
  - [ ] Export `getErrorMessage(code)` function
- [ ] Create `packages/backend/src/middleware/errorHandler.ts`
  - [ ] Implement Express error middleware
  - [ ] Handle ApiError instances
  - [ ] Convert Prisma errors to ApiError
  - [ ] Hide stack traces in production
  - [ ] Return standardized JSON error response
- [ ] Update `packages/backend/src/app.ts`
  - [ ] Import errorHandler middleware
  - [ ] Add as last middleware (after all routes)

#### Testing
- [ ] Create `packages/backend/tests/errorHandler.test.ts`
  - [ ] Test ApiError creation with factory functions
  - [ ] Test error middleware catches errors
  - [ ] Test correct status codes returned
  - [ ] Test Hebrew messages returned
  - [ ] Test details included for validation errors
  - [ ] Test stack trace hidden in production
  - [ ] Test Prisma errors converted
  - [ ] Achieve >85% coverage
- [ ] Run tests: `cd packages/backend && yarn test errorHandler`
- [ ] Fix any failing tests

#### Verification
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Hebrew error messages display correctly
- [ ] Stack traces hidden when NODE_ENV=production
- [ ] No breaking changes to existing code

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat: add comprehensive error handling system"
- [ ] Step marked complete: **Date:** ___

---

### Step 1.2: Migration Framework Enhancement
**Estimated:** 2-3 hours | **Actual:** ___ hours

#### Script Creation
- [ ] Create `packages/backend/scripts/create-migration.sh`
  - [ ] Add shebang and make executable
  - [ ] Validate migration name provided
  - [ ] Run `npx prisma format`
  - [ ] Run `npx prisma migrate dev --create-only`
  - [ ] Display generated SQL
  - [ ] Prompt for review confirmation
- [ ] Create `packages/backend/scripts/run-migrations.sh`
  - [ ] Check for recent backup (warn if >24 hours)
  - [ ] List pending migrations
  - [ ] Require confirmation
  - [ ] Run `npx prisma migrate deploy`
  - [ ] Log success/failure
- [ ] Create `packages/backend/scripts/rollback-migration.sh`
  - [ ] Display current migration state
  - [ ] Show last 5 migrations
  - [ ] Require typing migration name to confirm
  - [ ] Provide rollback instructions
  - [ ] Document manual schema changes needed
- [ ] Create `packages/backend/scripts/verify-migration.sh`
  - [ ] Run `npx prisma validate`
  - [ ] Check for breaking changes
  - [ ] Suggest review checklist
  - [ ] Exit with appropriate status code

#### Documentation
- [ ] Create `packages/backend/prisma/MIGRATION_GUIDE.md`
  - [ ] Creating Migrations section
  - [ ] Testing Migrations section
  - [ ] Rollback Procedures section
  - [ ] Best Practices section
  - [ ] Common Pitfalls section
  - [ ] Emergency Procedures section
- [ ] Update `packages/backend/README.md`
  - [ ] Add "Database Migrations" section
  - [ ] Link to MIGRATION_GUIDE.md
  - [ ] Document helper scripts usage
  - [ ] Add to development workflow

#### Testing
- [ ] Test each script manually
  - [ ] create-migration.sh with valid name
  - [ ] run-migrations.sh with pending migrations
  - [ ] verify-migration.sh validation
  - [ ] rollback-migration.sh instructions
- [ ] Make all scripts executable: `chmod +x packages/backend/scripts/*.sh`
- [ ] Test on macOS and/or Linux

#### Verification
- [ ] All scripts executable and working
- [ ] Scripts include error handling
- [ ] Documentation complete and clear
- [ ] No modifications to existing schema/migrations
- [ ] Scripts work on target OS

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat: enhance database migration framework"
- [ ] Step marked complete: **Date:** ___

---

## ITERATION 2: TRIP CANCELLATION/DELETION

**Goal:** Implement soft-delete and hard-delete for trips  
**Estimated:** 18-22 hours  
**Actual:** ___ hours  
**Status:** ⬜ Not Started

### Step 2.1: Database Schema for Trip Cancellation
**Estimated:** 2 hours | **Actual:** ___ hours

#### Schema Changes
- [ ] Update `packages/backend/prisma/schema.prisma`
  - [ ] Add `deleted: Boolean @default(false)` to Trip model
  - [ ] Add `deletedAt: DateTime?` to Trip model
  - [ ] Add `deletedBy: String?` to Trip model
  - [ ] Add `deletionReason: String?` to Trip model
  - [ ] Add `@@index([deleted])` to Trip model

#### Migration
- [ ] Generate migration: `npx prisma migrate dev --name add_trip_soft_delete`
- [ ] Review generated SQL
- [ ] Verify backward compatibility
- [ ] Test migration applies successfully

#### Seed Data
- [ ] Update `packages/backend/prisma/seed.ts`
  - [ ] Ensure existing trips have `deleted: false`
  - [ ] Add one sample cancelled trip for testing
- [ ] Run seed: `npx prisma db seed`
- [ ] Verify seed data

#### Testing
- [ ] Create `packages/backend/tests/migrations/trip-soft-delete.test.ts`
  - [ ] Test migration applies successfully
  - [ ] Test existing trips have deleted=false
  - [ ] Test new fields are nullable/have defaults
  - [ ] Test can create trip with new fields
  - [ ] Test index exists on deleted field
  - [ ] Achieve >85% coverage
- [ ] Run tests: `yarn test trip-soft-delete`

#### Verification
- [ ] Migration applies without errors
- [ ] Existing trips have deleted=false
- [ ] All tests passing
- [ ] No breaking changes
- [ ] Seed script runs successfully

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat(db): add soft-delete fields to Trip model"
- [ ] Step marked complete: **Date:** ___

---

### Step 2.2: Trip Cancellation Service Layer
**Estimated:** 4-5 hours | **Actual:** ___ hours

#### Service Implementation
- [ ] Create `packages/backend/src/services/tripCancellation.service.ts`
  - [ ] Define `CancelTripParams` and `RestoreTripParams` interfaces
  - [ ] Implement `cancelTrip(params)` function
    - [ ] Validate trip exists
    - [ ] Validate not already deleted
    - [ ] Check user permissions (TRIP_ADMIN or SUPER_ADMIN)
    - [ ] Validate reason provided and not empty
    - [ ] Update trip with deletion fields
    - [ ] Log action to activity log
    - [ ] Return updated trip
  - [ ] Implement `restoreTrip(params)` function
    - [ ] Validate trip exists
    - [ ] Validate trip is deleted
    - [ ] Check user is SUPER_ADMIN
    - [ ] Clear deletion fields
    - [ ] Log action to activity log
    - [ ] Return updated trip
  - [ ] Implement `canCancelTrip(tripId, userId)` function
  - [ ] Implement `canRestoreTrip(tripId, userId)` function

#### Testing
- [ ] Create `packages/backend/tests/services/tripCancellation.service.test.ts`
  - [ ] Test cancelTrip by trip admin (success)
  - [ ] Test cancelTrip by super-admin (success)
  - [ ] Test cancelTrip without reason (error)
  - [ ] Test cancelTrip already cancelled trip (error)
  - [ ] Test cancelTrip unauthorized user (error)
  - [ ] Test cancelTrip non-existent trip (error)
  - [ ] Test restoreTrip by super-admin (success)
  - [ ] Test restoreTrip by non-super-admin (error)
  - [ ] Test restoreTrip non-cancelled trip (error)
  - [ ] Test canCancelTrip permission checks
  - [ ] Test canRestoreTrip permission checks
  - [ ] Achieve >85% coverage
- [ ] Run tests: `yarn test tripCancellation.service`

#### Verification
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Uses ApiError from Step 1.1
- [ ] Permission checks work correctly
- [ ] Activity log integration (if available)

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat(service): add trip cancellation service layer"
- [ ] Step marked complete: **Date:** ___

---

### Step 2.3: Trip Cancellation API Endpoints
**Estimated:** 3-4 hours | **Actual:** ___ hours

#### Controller Implementation
- [ ] Create `packages/backend/src/controllers/tripCancellation.controller.ts`
  - [ ] Implement `cancelTrip(req, res)` controller
    - [ ] Extract tripId, userId, reason
    - [ ] Validate reason exists
    - [ ] Call service.cancelTrip
    - [ ] Return 200 with updated trip
  - [ ] Implement `restoreTrip(req, res)` controller
    - [ ] Extract tripId, userId
    - [ ] Call service.restoreTrip
    - [ ] Return 200 with updated trip

#### Routes
- [ ] Update `packages/backend/src/routes/trips.routes.ts`
  - [ ] Add `POST /trips/:id/cancel` route
  - [ ] Add `POST /trips/:id/restore` route
  - [ ] Apply authenticate middleware
  - [ ] Import and use controllers

#### Optional: Validation Middleware
- [ ] Create `packages/backend/src/middleware/validateCancellation.ts` (optional)
  - [ ] Implement reason validation middleware
  - [ ] Add to cancel route

#### Testing
- [ ] Create `packages/backend/tests/api/tripCancellation.test.ts`
  - [ ] Test POST /trips/:id/cancel as trip admin (200)
  - [ ] Test POST /trips/:id/cancel as super-admin (200)
  - [ ] Test POST /trips/:id/cancel without reason (400)
  - [ ] Test POST /trips/:id/cancel empty reason (400)
  - [ ] Test POST /trips/:id/cancel unauthorized (403)
  - [ ] Test POST /trips/:id/cancel not found (404)
  - [ ] Test POST /trips/:id/cancel already cancelled (400)
  - [ ] Test POST /trips/:id/restore as super-admin (200)
  - [ ] Test POST /trips/:id/restore as non-super-admin (403)
  - [ ] Test POST /trips/:id/restore not found (404)
  - [ ] Test POST /trips/:id/restore not cancelled (400)
  - [ ] Achieve >85% coverage
- [ ] Run tests: `yarn test tripCancellation`

#### Verification
- [ ] All API tests passing
- [ ] Proper HTTP status codes
- [ ] Authorization enforced
- [ ] Hebrew error messages in responses
- [ ] No TypeScript errors

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat(api): add trip cancellation endpoints"
- [ ] Step marked complete: **Date:** ___

---

### Step 2.4: Update Trip Queries for Filtering
**Estimated:** 3-4 hours | **Actual:** ___ hours

#### Service Updates
- [ ] Update `packages/backend/src/services/trip.service.ts`
  - [ ] Define `GetTripsParams` interface with userId, userRole, includeDeleted
  - [ ] Update `getTrips(params)` function signature
  - [ ] Implement role-based filtering logic
    - [ ] FAMILY: Always filter deleted=false
    - [ ] TRIP_ADMIN: Filter by default, optional includeDeleted
    - [ ] SUPER_ADMIN: Optional includeDeleted
  - [ ] Update `getTripById(tripId, userId, userRole)` function
    - [ ] Return 404 for families viewing deleted trips
    - [ ] Allow admins to view deleted trips

#### Controller Updates
- [ ] Update `packages/backend/src/controllers/trip.controller.ts`
  - [ ] Update `getTrips` controller to use new params
  - [ ] Extract includeDeleted from query params
  - [ ] Pass userRole from req.user
  - [ ] Update `getTripById` controller to use new signature

#### Route Updates
- [ ] Update `packages/backend/src/routes/trips.routes.ts`
  - [ ] Ensure routes support ?includeDeleted=true query param

#### Testing - Service
- [ ] Create `packages/backend/tests/services/tripFilter.test.ts`
  - [ ] Test FAMILY never sees deleted trips
  - [ ] Test FAMILY with includeDeleted=true still hides deleted
  - [ ] Test TRIP_ADMIN sees only non-deleted by default
  - [ ] Test TRIP_ADMIN with includeDeleted=true sees deleted
  - [ ] Test SUPER_ADMIN sees all trips by default
  - [ ] Test SUPER_ADMIN can filter with includeDeleted=false
  - [ ] Test getTripById for FAMILY with deleted trip (404)
  - [ ] Test getTripById for admin with deleted trip (200)
  - [ ] Achieve >85% coverage
- [ ] Run tests: `yarn test tripFilter`

#### Testing - API
- [ ] Create `packages/backend/tests/api/tripFilter.test.ts`
  - [ ] Test GET /trips as FAMILY (no deleted)
  - [ ] Test GET /trips as TRIP_ADMIN (no deleted by default)
  - [ ] Test GET /trips?includeDeleted=true as TRIP_ADMIN
  - [ ] Test GET /trips as SUPER_ADMIN
  - [ ] Test GET /trips/:id for deleted trip as FAMILY (404)
  - [ ] Test GET /trips/:id for deleted trip as admin (200)
  - [ ] Achieve >85% coverage
- [ ] Run tests: `yarn test api/tripFilter`

#### Verification
- [ ] All tests passing
- [ ] Families never see deleted trips
- [ ] Admins can optionally view deleted trips
- [ ] Efficient database queries (uses indexes)
- [ ] No breaking changes to existing behavior

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat: add role-based filtering for deleted trips"
- [ ] Step marked complete: **Date:** ___

---

### Step 2.5: Trip Cancellation Frontend UI
**Estimated:** 4-5 hours | **Actual:** ___ hours

#### Component - Cancel Dialog
- [ ] Create `packages/frontend/components/trips/TripCancelDialog.tsx`
  - [ ] Define `TripCancelDialogProps` interface
  - [ ] Use Shadcn Dialog component
  - [ ] Add RTL support (dir="rtl")
  - [ ] Add warning icon
  - [ ] Add title: "ביטול טיול"
  - [ ] Add warning message
  - [ ] Add Textarea for reason (required, min 10 chars, max 500)
  - [ ] Add checkbox: "אני מבין שהטיול יוסתר"
  - [ ] Add info note about no notifications
  - [ ] Add Cancel button (secondary)
  - [ ] Add Confirm button (destructive, disabled until valid)
  - [ ] Implement form validation
  - [ ] Implement API integration (POST /api/trips/:id/cancel)
  - [ ] Handle loading state
  - [ ] Handle error display

#### Component - Status Badge
- [ ] Create `packages/frontend/components/trips/TripStatusBadge.tsx`
  - [ ] Define `TripStatusBadgeProps` interface
  - [ ] Show "מבוטל" badge if trip.deleted
  - [ ] Red background, white text
  - [ ] Include cancellation date
  - [ ] Add tooltip with reason (admin only)

#### Integration - Admin Pages
- [ ] Add cancel button to trip admin page
  - [ ] "בטל טיול" button
  - [ ] Red/destructive styling
  - [ ] Only visible to TRIP_ADMIN and SUPER_ADMIN
  - [ ] Opens TripCancelDialog
  - [ ] Pass trip data to dialog

#### Dashboard Updates
- [ ] Add cancelled trips section to admin dashboard
  - [ ] Tab/filter: "טיולים מבוטלים"
  - [ ] List cancelled trips
  - [ ] Show cancellation reason and date
  - [ ] For SUPER_ADMIN: Add "שחזר טיול" (Restore) button

#### Testing
- [ ] Create `packages/frontend/__tests__/components/TripCancelDialog.test.tsx`
  - [ ] Test renders when open
  - [ ] Test does not render when closed
  - [ ] Test confirm disabled when reason empty
  - [ ] Test confirm disabled when reason too short
  - [ ] Test confirm disabled when checkbox not checked
  - [ ] Test confirm enabled when valid
  - [ ] Test loading state during API call
  - [ ] Test calls onSuccess after successful cancellation
  - [ ] Test displays error on API failure
  - [ ] Test calls onClose when cancel clicked
  - [ ] Test form clears when closed and reopened
  - [ ] Achieve >85% coverage
- [ ] Create tests for TripStatusBadge
  - [ ] Test shows cancelled badge for deleted trip
  - [ ] Test does not show badge for active trip
  - [ ] Test displays cancellation date
  - [ ] Test tooltip with reason (admin only)
- [ ] Run tests: `yarn test TripCancelDialog`

#### Verification
- [ ] All tests passing
- [ ] Dialog functional and styled
- [ ] Form validation works
- [ ] API integration successful
- [ ] Loading and error states work
- [ ] Fully RTL compliant
- [ ] Accessible (keyboard, screen reader)

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): add trip cancellation dialog and status badge"
- [ ] Step marked complete: **Date:** ___

---

### Step 2.6: Permanent Deletion (Super-Admin Only)
**Estimated:** 3-4 hours | **Actual:** ___ hours

#### Backend - Service
- [ ] Create `packages/backend/src/services/tripDeletion.service.ts`
  - [ ] Define `DeleteTripParams` interface
  - [ ] Implement `permanentlyDeleteTrip(params)` function
    - [ ] Validate user is SUPER_ADMIN
    - [ ] Validate trip exists
    - [ ] Validate trip is already cancelled
    - [ ] Use Prisma transaction to delete all related data
    - [ ] Delete TripAttendance, GearItem, DietaryRequirement
    - [ ] Delete Trip
    - [ ] Log deletion with full details
    - [ ] Return void
  - [ ] Implement `canPermanentlyDelete(tripId, userId)` function

#### Backend - Controller & Routes
- [ ] Create `packages/backend/src/controllers/tripDeletion.controller.ts`
  - [ ] Implement `permanentlyDeleteTrip(req, res)` controller
  - [ ] Return 204 No Content on success
- [ ] Update `packages/backend/src/routes/trips.routes.ts`
  - [ ] Add `DELETE /trips/:id` route
  - [ ] Apply authenticate middleware

#### Backend - Testing
- [ ] Create `packages/backend/tests/services/tripDeletion.service.test.ts`
  - [ ] Test successful deletion by super-admin
  - [ ] Test FORBIDDEN when not super-admin
  - [ ] Test BAD_REQUEST when trip not cancelled
  - [ ] Test NOT_FOUND when trip doesn't exist
  - [ ] Test transaction rollback on error
  - [ ] Test logs deletion action
  - [ ] Test deletes all related records
  - [ ] Achieve >90% coverage
- [ ] Run tests: `yarn test tripDeletion`

#### Frontend - Delete Dialog
- [ ] Create `packages/frontend/components/trips/TripDeleteDialog.tsx`
  - [ ] Define `TripDeleteDialogProps` interface
  - [ ] Implement Step 1: Warning screen
    - [ ] Large warning icon (red)
    - [ ] Title: "מחיקה צמיתה של טיול"
    - [ ] Warning: "זוהי פעולה בלתי הפיכה!"
    - [ ] List what will be deleted
    - [ ] Checkbox: "אני מבין שמדובר במחיקה צמיתה"
    - [ ] Continue button (enabled after checkbox)
  - [ ] Implement Step 2: Type trip name
    - [ ] Instruction to type trip name
    - [ ] Show trip name in bold
    - [ ] Text input (must match exactly)
    - [ ] Continue button (enabled when match)
  - [ ] Implement Step 3: Final confirmation
    - [ ] Title: "האם אתה בטוח לחלוטין?"
    - [ ] Red warning banner
    - [ ] Final checkbox: "כן, מחק לצמיתות"
    - [ ] Cancel button
    - [ ] Delete button (destructive, enabled after checkbox)
  - [ ] Implement API integration (DELETE /api/trips/:id)
  - [ ] Handle loading state
  - [ ] Handle errors

#### Frontend - Integration
- [ ] Update super-admin cancelled trips view
  - [ ] Add "מחק לצמיתות" button
  - [ ] Red/destructive styling
  - [ ] Only for SUPER_ADMIN
  - [ ] Only for cancelled trips
  - [ ] Opens TripDeleteDialog

#### Frontend - Testing
- [ ] Create `packages/frontend/__tests__/components/TripDeleteDialog.test.tsx`
  - [ ] Test starts on step 1
  - [ ] Test step 1: continue disabled until checkbox
  - [ ] Test step 2: continue disabled until name matches
  - [ ] Test step 2: case-sensitive matching
  - [ ] Test step 3: delete disabled until checkbox
  - [ ] Test can navigate back through steps
  - [ ] Test successful deletion calls onSuccess
  - [ ] Test error display on API failure
  - [ ] Test loading state during deletion
  - [ ] Test resets to step 1 when reopened
  - [ ] Achieve >90% coverage
- [ ] Run tests: `yarn test TripDeleteDialog`

#### Documentation
- [ ] Create `packages/backend/TRIP_DELETION.md`
  - [ ] When to Use section
  - [ ] Safety Procedures section
  - [ ] What Gets Deleted section
  - [ ] Cannot Be Undone warning
  - [ ] Recovery Procedures section

#### Verification
- [ ] All tests pass (>90% coverage)
- [ ] Only super-admins can delete
- [ ] Only cancelled trips can be deleted
- [ ] Transaction ensures atomicity
- [ ] Three-step confirmation works
- [ ] Clear warnings displayed
- [ ] Activity logged
- [ ] Documentation complete

#### Completion
- [ ] Code reviewed (extra scrutiny - HIGH RISK)
- [ ] Tested in staging environment
- [ ] Committed with message: "feat: add permanent deletion for super-admins (high-risk)"
- [ ] Step marked complete: **Date:** ___

---

## ITERATION 3: TRIP PUBLISHING WORKFLOW

**Goal:** Implement request-based publishing system  
**Estimated:** 20-24 hours  
**Actual:** ___ hours  
**Status:** ⬜ Not Started

### Step 3.1: Database Schema for Publishing
**Estimated:** 2 hours | **Actual:** ___ hours

#### Schema Changes
- [ ] Update `packages/backend/prisma/schema.prisma`
  - [ ] Add `publishRequested: Boolean @default(false)` to Trip
  - [ ] Add `publishRequestedAt: DateTime?` to Trip
  - [ ] Add `publishedAt: DateTime?` to Trip
  - [ ] Add `publishedBy: String?` to Trip
  - [ ] Add `unpublishedAt: DateTime?` to Trip
  - [ ] Add `lastModifiedBy: String?` to Trip
  - [ ] Add `lastModifiedAt: DateTime?` to Trip
  - [ ] Add `@@index([publishRequested])` to Trip
  - [ ] Add `@@index([draft])` to Trip

#### Migration & Data Update
- [ ] Generate migration: `npx prisma migrate dev --name add_trip_publishing_workflow`
- [ ] Update migration to set publishedAt for existing published trips
- [ ] Review SQL carefully
- [ ] Test migration applies

#### Seed Data
- [ ] Update `packages/backend/prisma/seed.ts`
  - [ ] Add published trips with publishedAt
  - [ ] Add draft trip requesting publish
  - [ ] Add draft trip not yet requesting
- [ ] Run seed: `npx prisma db seed`

#### Testing
- [ ] Create `packages/backend/tests/migrations/trip-publishing.test.ts`
  - [ ] Test migration applies successfully
  - [ ] Test existing published trips have publishedAt
  - [ ] Test new fields have proper defaults
  - [ ] Test indexes created
  - [ ] Test can query by publishRequested efficiently
  - [ ] Achieve >85% coverage
- [ ] Run tests: `yarn test trip-publishing`

#### Verification
- [ ] Migration applies without errors
- [ ] Existing trips updated correctly
- [ ] All tests passing
- [ ] Documentation of field purposes

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat(db): add publishing workflow fields to Trip"
- [ ] Step marked complete: **Date:** ___

---

### Step 3.2: Publishing Service Layer
**Estimated:** 4-5 hours | **Actual:** ___ hours

#### Service Implementation
- [ ] Create `packages/backend/src/services/tripPublishing.service.ts`
  - [ ] Define interfaces (RequestPublishParams, PublishTripParams, etc.)
  - [ ] Implement `requestPublish(params)` function
  - [ ] Implement `publishTrip(params)` function
  - [ ] Implement `unpublishTrip(params)` function
  - [ ] Implement `getPendingPublishRequests()` function

#### Testing
- [ ] Create `packages/backend/tests/services/tripPublishing.service.test.ts`
  - [ ] Test all functions with various scenarios
  - [ ] Test permission checks
  - [ ] Test validation logic
  - [ ] Test notification creation
  - [ ] Achieve >85% coverage
- [ ] Run tests: `yarn test tripPublishing.service`

#### Verification
- [ ] All tests passing
- [ ] Permissions enforced
- [ ] Notifications sent
- [ ] Activity logged

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat(service): add trip publishing service layer"
- [ ] Step marked complete: **Date:** ___

---

### Step 3.3: Publishing API Endpoints
**Estimated:** 3-4 hours | **Actual:** ___ hours

#### Implementation
- [ ] Create `packages/backend/src/controllers/tripPublishing.controller.ts`
- [ ] Update `packages/backend/src/routes/trips.routes.ts` with new routes
- [ ] Create `packages/backend/tests/api/tripPublishing.test.ts`
- [ ] Run tests: `yarn test api/tripPublishing`

#### Verification
- [ ] All API tests passing
- [ ] Authorization enforced
- [ ] Hebrew error messages

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat(api): add trip publishing endpoints"
- [ ] Step marked complete: **Date:** ___

---

### Step 3.4: Trip Admin Publishing UI
**Estimated:** 3-4 hours | **Actual:** ___ hours

#### Implementation
- [ ] Update `packages/frontend/components/trips/TripForm.tsx`
- [ ] Add publish request button and badges
- [ ] Add validation before allowing publish request
- [ ] Create `packages/frontend/__tests__/components/TripPublishRequest.test.tsx`
- [ ] Run tests: `yarn test TripPublishRequest`

#### Verification
- [ ] Tests passing
- [ ] Validation works
- [ ] UI properly styled (RTL)

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): add request publish button for trip admins"
- [ ] Step marked complete: **Date:** ___

---

### Step 3.5: Super-Admin Publishing Dashboard
**Estimated:** 5-6 hours | **Actual:** ___ hours

#### Implementation
- [ ] Create `packages/frontend/components/admin/PendingPublishRequests.tsx`
- [ ] Update super-admin dashboard
- [ ] Add publish/unpublish actions
- [ ] Show publish history
- [ ] Create `packages/frontend/__tests__/components/PendingPublishRequests.test.tsx`
- [ ] Run tests: `yarn test PendingPublishRequests`

#### Verification
- [ ] Tests passing
- [ ] Super-admin only
- [ ] Fully functional

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): add super-admin publishing dashboard"
- [ ] Step marked complete: **Date:** ___

---

### Step 3.6: Admin Assignment Feature
**Estimated:** 3-4 hours | **Actual:** ___ hours

#### Implementation
- [ ] Create admin assignment service
- [ ] Add API endpoint
- [ ] Create UI component
- [ ] Write tests

#### Verification
- [ ] Tests passing
- [ ] Permissions work correctly

#### Completion
- [ ] Code reviewed
- [ ] Committed with message: "feat: add trip admin assignment feature"
- [ ] Step marked complete: **Date:** ___

---

## ITERATION 4: PER-MEMBER PARTICIPATION

**Goal:** Enable individual family member selection for trips  
**Estimated:** 28-32 hours  
**Actual:** ___ hours  
**Status:** ⬜ Not Started

### Step 4.1: Database Schema for Per-Member Participation
**Estimated:** 3 hours | **Actual:** ___ hours

- [ ] Update Prisma schema
- [ ] Add `participatingMemberIds` to TripAttendance
- [ ] Create `DietaryRequirement` model
- [ ] Generate migration
- [ ] Update seed data
- [ ] Create and run tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(db): add per-member participation schema"
- [ ] Step marked complete: **Date:** ___

---

### Step 4.2: Member Participation Service Layer
**Estimated:** 6-7 hours | **Actual:** ___ hours

- [ ] Create service
- [ ] Implement member selection validation
- [ ] Implement dietary requirements CRUD
- [ ] Add privacy controls
- [ ] Write comprehensive tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(service): add member participation service"
- [ ] Step marked complete: **Date:** ___

---

### Step 4.3: Update Attendance API for Member Selection
**Estimated:** 4-5 hours | **Actual:** ___ hours

- [ ] Update attendance endpoint
- [ ] Add dietary requirements endpoints
- [ ] Ensure backward compatibility
- [ ] Write integration tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(api): update attendance API for member selection"
- [ ] Step marked complete: **Date:** ___

---

### Step 4.4: Member Selection UI Component
**Estimated:** 4-5 hours | **Actual:** ___ hours

- [ ] Create `MemberSelectionForm` component
- [ ] Add checkbox list with member details
- [ ] Add validation (at least one member)
- [ ] Write component tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): add member selection component"
- [ ] Step marked complete: **Date:** ___

---

### Step 4.5: Per-Member Dietary Requirements UI
**Estimated:** 4-5 hours | **Actual:** ___ hours

- [ ] Create `PerMemberDietaryRequirements` component
- [ ] Add text input per selected member
- [ ] Implement auto-save
- [ ] Write component tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): add per-member dietary requirements"
- [ ] Step marked complete: **Date:** ___

---

### Step 4.6: Attendance Flow Integration
**Estimated:** 4-5 hours | **Actual:** ___ hours

- [ ] Update `AttendanceMarker` component
- [ ] Add member selection step
- [ ] Add dietary requirements step
- [ ] Test complete flow
- [ ] Write E2E tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): integrate member selection into attendance flow"
- [ ] Step marked complete: **Date:** ___

---

### Step 4.7: Admin View for Member Participation
**Estimated:** 3-4 hours | **Actual:** ___ hours

- [ ] Update attendance summary component
- [ ] Show per-member details
- [ ] Add statistics (total adults/children)
- [ ] Add export functionality
- [ ] Write component tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): update admin views for member participation"
- [ ] Step marked complete: **Date:** ___

---

## ITERATION 5: ADMIN NOTES

**Goal:** Add coordination notes for trip admins  
**Estimated:** 8-10 hours  
**Actual:** ___ hours  
**Status:** ⬜ Not Started

### Step 5.1: Database Schema for Admin Notes
**Estimated:** 1 hour | **Actual:** ___ hours

- [ ] Add admin notes fields to TripAttendance
- [ ] Generate migration
- [ ] Test migration
- [ ] Code reviewed
- [ ] Committed with message: "feat(db): add admin notes to TripAttendance"
- [ ] Step marked complete: **Date:** ___

---

### Step 5.2: Admin Notes Service Layer
**Estimated:** 2-3 hours | **Actual:** ___ hours

- [ ] Create notes service
- [ ] Implement update logic
- [ ] Add authorization checks
- [ ] Write tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(service): add admin notes service"
- [ ] Step marked complete: **Date:** ___

---

### Step 5.3: Admin Notes API Endpoint
**Estimated:** 2 hours | **Actual:** ___ hours

- [ ] Add PUT endpoint for notes
- [ ] Add authorization
- [ ] Write integration tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(api): add admin notes endpoint"
- [ ] Step marked complete: **Date:** ___

---

### Step 5.4: Admin Notes UI Component
**Estimated:** 3-4 hours | **Actual:** ___ hours

- [ ] Create `AdminNotesEditor` component
- [ ] Add to attendance summary
- [ ] Show last updated info
- [ ] Write component tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): add admin notes editor"
- [ ] Step marked complete: **Date:** ___

---

## ITERATION 6: PARTICIPATION APPROVAL

**Goal:** Implement configurable approval workflow  
**Estimated:** 26-30 hours  
**Actual:** ___ hours  
**Status:** ⬜ Not Started

### Step 6.1: Database Schema for Approval
**Estimated:** 2 hours | **Actual:** ___ hours

- [ ] Add status enum to TripAttendance
- [ ] Add approval flag to Trip model
- [ ] Generate migration
- [ ] Test migration
- [ ] Code reviewed
- [ ] Committed with message: "feat(db): add participation approval schema"
- [ ] Step marked complete: **Date:** ___

---

### Step 6.2: Approval Service Layer
**Estimated:** 6-7 hours | **Actual:** ___ hours

- [ ] Create approval service
- [ ] Implement request creation logic
- [ ] Implement approve/reject logic
- [ ] Add access control
- [ ] Write comprehensive tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(service): add participation approval service"
- [ ] Step marked complete: **Date:** ___

---

### Step 6.3: Approval API Endpoints
**Estimated:** 4-5 hours | **Actual:** ___ hours

- [ ] Update attendance endpoint
- [ ] Add GET requests endpoint
- [ ] Add approve/reject endpoints
- [ ] Write integration tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(api): add participation approval endpoints"
- [ ] Step marked complete: **Date:** ___

---

### Step 6.4: Trip Settings for Approval Toggle
**Estimated:** 2-3 hours | **Actual:** ___ hours

- [ ] Add toggle to trip form
- [ ] Update trip creation/edit
- [ ] Write component tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): add approval requirement toggle"
- [ ] Step marked complete: **Date:** ___

---

### Step 6.5: Family Request to Join UI
**Estimated:** 4-5 hours | **Actual:** ___ hours

- [ ] Update attendance marker for requests
- [ ] Add pending state UI
- [ ] Add rejection handling
- [ ] Write component tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): add family request to join UI"
- [ ] Step marked complete: **Date:** ___

---

### Step 6.6: Admin Approval Dashboard
**Estimated:** 6-7 hours | **Actual:** ___ hours

- [ ] Create `ParticipationRequestsList` component
- [ ] Add approve/reject actions
- [ ] Add filtering
- [ ] Write component tests
- [ ] Write E2E tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): add admin approval dashboard"
- [ ] Step marked complete: **Date:** ___

---

### Step 6.7: Limited Info for Pending Users
**Estimated:** 3-4 hours | **Actual:** ___ hours

- [ ] Update trip detail API endpoint
- [ ] Filter data based on status
- [ ] Update frontend trip views
- [ ] Test access control thoroughly
- [ ] Code reviewed
- [ ] Committed with message: "feat: limit trip info for pending approval users"
- [ ] Step marked complete: **Date:** ___

---

## ITERATION 7: EMAIL VERIFICATION

**Goal:** Add email verification for new users  
**Estimated:** 20-24 hours  
**Actual:** ___ hours  
**Status:** ⬜ Not Started

### Step 7.1: Database Schema for Email Verification
**Estimated:** 1 hour | **Actual:** ___ hours

- [ ] Add verification fields to User model
- [ ] Generate migration
- [ ] Test migration
- [ ] Code reviewed
- [ ] Committed with message: "feat(db): add email verification fields"
- [ ] Step marked complete: **Date:** ___

---

### Step 7.2: Email Service Infrastructure
**Estimated:** 5-6 hours | **Actual:** ___ hours

- [ ] Set up email provider (SendGrid/AWS SES)
- [ ] Create email service
- [ ] Implement email templates
- [ ] Add configuration
- [ ] Write tests (with mocks)
- [ ] Code reviewed
- [ ] Committed with message: "feat(service): add email service infrastructure"
- [ ] Step marked complete: **Date:** ___

---

### Step 7.3: Email Verification Logic
**Estimated:** 3-4 hours | **Actual:** ___ hours

- [ ] Create verification service
- [ ] Implement token generation
- [ ] Implement token verification
- [ ] Add expiry logic
- [ ] Write tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(service): add email verification logic"
- [ ] Step marked complete: **Date:** ___

---

### Step 7.4: Email Verification API Endpoints
**Estimated:** 2-3 hours | **Actual:** ___ hours

- [ ] Add POST /auth/verify-email endpoint
- [ ] Add POST /auth/resend-verification endpoint
- [ ] Write integration tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(api): add email verification endpoints"
- [ ] Step marked complete: **Date:** ___

---

### Step 7.5: Email Verification Frontend Flow
**Estimated:** 4-5 hours | **Actual:** ___ hours

- [ ] Create verification banner
- [ ] Create verification success page
- [ ] Add resend button
- [ ] Write component tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): add email verification UI"
- [ ] Step marked complete: **Date:** ___

---

### Step 7.6: Registration Integration
**Estimated:** 4-5 hours | **Actual:** ___ hours

- [ ] Update registration flow
- [ ] Send verification email on signup
- [ ] Handle OAuth auto-verification
- [ ] Test complete flow
- [ ] Write E2E tests
- [ ] Code reviewed
- [ ] Committed with message: "feat: integrate email verification into registration"
- [ ] Step marked complete: **Date:** ___

---

## ITERATION 8: PASSWORD RESET

**Goal:** Enable self-service password reset  
**Estimated:** 14-18 hours  
**Actual:** ___ hours  
**Status:** ⬜ Not Started

### Step 8.1: Database Schema for Password Reset
**Estimated:** 1 hour | **Actual:** ___ hours

- [ ] Add reset token fields to User model
- [ ] Generate migration
- [ ] Test migration
- [ ] Code reviewed
- [ ] Committed with message: "feat(db): add password reset fields"
- [ ] Step marked complete: **Date:** ___

---

### Step 8.2: Password Reset Service Layer
**Estimated:** 3-4 hours | **Actual:** ___ hours

- [ ] Create password reset service
- [ ] Implement token generation
- [ ] Implement password update
- [ ] Add validation
- [ ] Write tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(service): add password reset service"
- [ ] Step marked complete: **Date:** ___

---

### Step 8.3: Password Reset API Endpoints
**Estimated:** 2-3 hours | **Actual:** ___ hours

- [ ] Add POST /auth/forgot-password endpoint
- [ ] Add POST /auth/reset-password endpoint
- [ ] Write integration tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(api): add password reset endpoints"
- [ ] Step marked complete: **Date:** ___

---

### Step 8.4: Password Reset Frontend Flow
**Estimated:** 4-5 hours | **Actual:** ___ hours

- [ ] Create forgot password page
- [ ] Create reset password page
- [ ] Add success/error states
- [ ] Write component tests
- [ ] Code reviewed
- [ ] Committed with message: "feat(ui): add password reset UI"
- [ ] Step marked complete: **Date:** ___

---

### Step 8.5: Integration & E2E Testing
**Estimated:** 4-5 hours | **Actual:** ___ hours

- [ ] Write E2E tests
- [ ] Test email delivery
- [ ] Test token expiry
- [ ] Test edge cases
- [ ] Create documentation
- [ ] Code reviewed
- [ ] Committed with message: "test: add E2E tests for password reset"
- [ ] Step marked complete: **Date:** ___

---

## FINAL CHECKLIST

### Pre-Production
- [ ] All 48 steps completed
- [ ] All tests passing (backend + frontend)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code coverage >85% (>90% for high-risk features)
- [ ] All documentation updated
- [ ] README.md updated with new features
- [ ] CHANGELOG.md created/updated

### Testing
- [ ] Manual testing in dev environment
- [ ] Staging deployment successful
- [ ] Staging testing complete
- [ ] Performance testing done
- [ ] Security review completed
- [ ] Accessibility testing done

### Database
- [ ] All migrations tested
- [ ] Migration rollback procedures tested
- [ ] Database backup before production deployment
- [ ] Migration plan documented

### Documentation
- [ ] User manual updated
- [ ] API documentation updated
- [ ] Admin guides created
- [ ] Deployment guide updated

### Deployment
- [ ] Production deployment plan ready
- [ ] Rollback plan documented
- [ ] Monitoring and alerting configured
- [ ] Team trained on new features
- [ ] Communication plan for users

---

## Notes & Issues

### Blockers
_Document any blockers here_

### Issues Encountered
_Document issues and resolutions_

### Deviations from Plan
_Document any changes to the original plan_

---

**Last Updated:** October 18, 2025  
**Completed By:** ___  
**Total Time:** ___ hours
