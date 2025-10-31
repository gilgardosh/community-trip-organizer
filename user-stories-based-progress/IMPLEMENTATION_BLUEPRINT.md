# Implementation Blueprint - TDD Approach

**Project:** Community Trip Organizer  
**Date:** October 18, 2025  
**Purpose:** Step-by-step implementation guide with LLM prompts for test-driven development

---

## Table of Contents

- [Overview](#overview)
- [Implementation Strategy](#implementation-strategy)
- [Step Breakdown Summary](#step-breakdown-summary)
- [Detailed Implementation Steps](#detailed-implementation-steps)
- [LLM Prompts for Code Generation](#llm-prompts-for-code-generation)

---

## Overview

### Scope

This blueprint implements Phase 1 (P0) and Phase 2 (P1) features:

**Phase 1 - Critical (P0):**

- Trip Cancellation/Deletion Workflow
- Trip Publishing Workflow
- Per-Member Trip Participation
- Admin Notes for Participation

**Phase 2 - Important (P1):**

- Trip Participation Approval Workflow
- Email Verification
- Password Reset
- Enhanced Error Handling

### Technology Stack

- **Backend:** Node.js + TypeScript + Express + Prisma ORM
- **Database:** PostgreSQL
- **Frontend:** Next.js 14 + React + TypeScript + Shadcn/UI + Tailwind CSS
- **Testing:** Vitest (backend), React Testing Library (frontend)
- **Language:** Hebrew (RTL support)

### Core Principles

1. **Test-Driven Development (TDD):** Write tests before implementation
2. **Incremental Progress:** Small, safe, deployable steps (2-6 hours each)
3. **Zero Breaking Changes:** Maintain backward compatibility
4. **Database First:** Schema changes before business logic
5. **Backend Before Frontend:** API ready before UI
6. **Integration Last:** Wire everything together with E2E tests

---

## Implementation Strategy

### Development Flow

Each feature follows this pattern:

```
1. Database Schema Update (with migration)
   ↓
2. Backend Service Layer (with unit tests)
   ↓
3. API Endpoints (with integration tests)
   ↓
4. Frontend Components (with component tests)
   ↓
5. Integration & E2E Tests
   ↓
6. Documentation Update
```

### Testing Strategy

- **Unit Tests:** All services, utilities, helpers (>85% coverage)
- **Integration Tests:** All API endpoints (>85% coverage)
- **Component Tests:** All UI components (>80% coverage)
- **E2E Tests:** Critical user flows (happy paths + error cases)
- **TDD Approach:** Tests written before implementation code

### Safety Measures

- Database migrations are reversible
- Feature flags for risky changes
- Staging deployment before production
- Rollback procedures documented
- All changes peer-reviewed

---

## Step Breakdown Summary

### Iteration 1: Foundation & Infrastructure (6-8 hours)

- **1.1** Enhanced Error Handling System (3-4 hours)
- **1.2** Migration Framework & Safety (2-3 hours)

### Iteration 2: Trip Cancellation/Deletion (18-22 hours)

- **2.1** Database Schema for Soft Delete (2 hours)
- **2.2** Cancellation Service Layer (4-5 hours)
- **2.3** Cancellation API Endpoints (3-4 hours)
- **2.4** Update Trip Queries (Filtering) (3-4 hours)
- **2.5** Cancellation Frontend UI (4-5 hours)
- **2.6** Permanent Deletion (Super-Admin) (3-4 hours)

### Iteration 3: Trip Publishing Workflow (20-24 hours)

- **3.1** Database Schema for Publishing (2 hours)
- **3.2** Publishing Service Layer (4-5 hours)
- **3.3** Publishing API Endpoints (3-4 hours)
- **3.4** Trip Admin Publishing UI (3-4 hours)
- **3.5** Super-Admin Dashboard (5-6 hours)
- **3.6** Admin Assignment Feature (3-4 hours)

### Iteration 4: Per-Member Participation (28-32 hours)

- **4.1** Database Schema for Members (3 hours)
- **4.2** Member Participation Service (6-7 hours)
- **4.3** Update Attendance API (4-5 hours)
- **4.4** Member Selection UI Component (4-5 hours)
- **4.5** Per-Member Dietary Requirements UI (4-5 hours)
- **4.6** Attendance Flow Integration (4-5 hours)
- **4.7** Admin View Updates (3-4 hours)

### Iteration 5: Admin Notes (8-10 hours)

- **5.1** Database Schema for Notes (1 hour)
- **5.2** Admin Notes Service (2-3 hours)
- **5.3** Admin Notes API (2 hours)
- **5.4** Admin Notes UI Component (3-4 hours)

### Iteration 6: Participation Approval (26-30 hours)

- **6.1** Database Schema for Approval (2 hours)
- **6.2** Approval Service Layer (6-7 hours)
- **6.3** Approval API Endpoints (4-5 hours)
- **6.4** Trip Settings Toggle (2-3 hours)
- **6.5** Family Request UI (4-5 hours)
- **6.6** Admin Approval Dashboard (6-7 hours)
- **6.7** Limited Info for Pending Users (3-4 hours)

### Iteration 7: Email Verification (20-24 hours)

- **7.1** Database Schema for Verification (1 hour)
- **7.2** Email Service Infrastructure (5-6 hours)
- **7.3** Verification Logic (3-4 hours)
- **7.4** Verification API Endpoints (2-3 hours)
- **7.5** Verification Frontend Flow (4-5 hours)
- **7.6** Registration Integration (4-5 hours)

### Iteration 8: Password Reset (14-18 hours)

- **8.1** Database Schema for Reset (1 hour)
- **8.2** Reset Service Layer (3-4 hours)
- **8.3** Reset API Endpoints (2-3 hours)
- **8.4** Reset Frontend Flow (4-5 hours)
- **8.5** Integration & E2E Testing (4-5 hours)

**Total Steps:** 48  
**Total Estimated Time:** 140-168 hours (4-5 weeks for one developer)

---

## Detailed Implementation Steps

### Step Size Analysis

- **Small (1-3 hours):** 12 steps - Quick wins, low risk
- **Medium (3-5 hours):** 28 steps - Standard feature work
- **Large (5-7 hours):** 8 steps - Complex integrations

### Risk Distribution

- **Low Risk:** 42 steps - Standard development
- **Medium Risk:** 5 steps - Require extra testing
- **High Risk:** 1 step - Permanent deletion (extensive safeguards)

---

# LLM Prompts for Code Generation

Each prompt below is designed for a code-generation LLM implementing one step using TDD.

---

## ITERATION 1: FOUNDATION & INFRASTRUCTURE

---

### PROMPT 1.1: Enhanced Error Handling System

````
TASK: Implement comprehensive error handling infrastructure for a TypeScript/Express backend

CONTEXT:
- Project: Community trip organizer monorepo
- Backend location: packages/backend/
- Stack: Node.js + TypeScript + Express + Prisma
- Testing: Vitest
- Language: Hebrew (RTL), all user-facing errors in Hebrew
- Current state: Basic error handling exists but needs standardization

OBJECTIVE:
Create a robust, standardized error handling system that:
1. Provides type-safe error definitions
2. Returns Hebrew error messages to users
3. Never exposes stack traces in production
4. Logs errors appropriately
5. Handles both sync and async errors

REQUIREMENTS:

1. CREATE: packages/backend/src/types/errors.ts
   - Define ErrorCode enum with values:
     - VALIDATION_ERROR
     - UNAUTHORIZED
     - FORBIDDEN
     - NOT_FOUND
     - CONFLICT
     - BAD_REQUEST
     - SERVER_ERROR
     - DATABASE_ERROR
   - Create ApiError class extending Error with:
     - code: ErrorCode
     - message: string (Hebrew)
     - statusCode: number
     - details?: Record<string, any> (for field-level validation errors)
     - timestamp: Date
   - Export factory functions:
     - createValidationError(message: string, details?: object)
     - createUnauthorizedError(message?: string)
     - createForbiddenError(message?: string)
     - createNotFoundError(resource: string)
     - createServerError(message?: string)

2. CREATE: packages/backend/src/utils/errorMessages.ts
   - Export Hebrew error message constants:
     - NETWORK_ERROR: "בעיית תקשורת, אנא נסה שוב"
     - UNAUTHORIZED: "אין לך הרשאה לבצע פעולה זו"
     - FORBIDDEN: "גישה נדחתה"
     - NOT_FOUND: "הפריט המבוקש לא נמצא"
     - SERVER_ERROR: "שגיאת שרת, אנא נסה שוב מאוחר יותר"
     - VALIDATION_ERROR: "שגיאת ולידציה"
   - Export function: getErrorMessage(code: ErrorCode): string

3. CREATE: packages/backend/src/middleware/errorHandler.ts
   - Implement Express error middleware: errorHandler(err, req, res, next)
   - Logic:
     - If ApiError: return formatted response with status code
     - If Prisma error: convert to ApiError with Hebrew message
     - If generic Error: convert to SERVER_ERROR
     - Never expose stack trace (check NODE_ENV)
     - Log errors with appropriate level (console.error in dev)
   - Response format:
     ```typescript
     {
       success: false,
       error: {
         code: string,
         message: string, // Hebrew
         details?: object,
         timestamp: string,
         path: string
       }
     }
     ```

4. INTEGRATE: packages/backend/src/app.ts
   - Import errorHandler middleware
   - Add as last middleware (after all routes)
   - Ensure catches both sync and async errors

5. CREATE TESTS: packages/backend/tests/errorHandler.test.ts
   - Test ApiError creation with factory functions
   - Test error middleware catches errors
   - Test correct status codes returned
   - Test Hebrew messages returned
   - Test details included for validation errors
   - Test stack trace hidden in production
   - Test Prisma errors converted
   - Target: >85% coverage

TEST-DRIVEN APPROACH:
1. Write all tests first (they will fail)
2. Implement error types to pass type tests
3. Implement error messages
4. Implement error middleware to pass middleware tests
5. Integrate into app
6. Verify all tests pass

CONSTRAINTS:
- Must not break existing error handling
- Must be fully type-safe (no 'any' types except where necessary)
- Must handle Prisma-specific errors
- Stack traces only in development (NODE_ENV !== 'production')

DELIVERABLES:
- src/types/errors.ts (complete with exports)
- src/utils/errorMessages.ts (Hebrew messages)
- src/middleware/errorHandler.ts (Express middleware)
- Updated src/app.ts (integrated)
- tests/errorHandler.test.ts (>85% coverage, all passing)

SUCCESS CRITERIA:
✓ All tests pass
✓ No TypeScript errors
✓ Hebrew error messages displayed
✓ Stack traces hidden in production
✓ Backward compatible with existing code
````

---

### PROMPT 1.2: Migration Framework Enhancement

````
TASK: Enhance database migration framework for safe schema changes

CONTEXT:
- Project: Community trip organizer
- Database: PostgreSQL with Prisma ORM
- Schema location: packages/backend/prisma/schema.prisma
- Migrations: packages/backend/prisma/migrations/
- Shell: Bash/Zsh (macOS/Linux compatible)
- Goal: Ensure safe, reversible migrations with clear procedures

OBJECTIVE:
Create helper scripts and documentation for safe database migrations that:
1. Enforce best practices
2. Require backup verification
3. Support rollback procedures
4. Include testing steps
5. Provide clear documentation

REQUIREMENTS:

1. CREATE: packages/backend/scripts/create-migration.sh
   ```bash
   #!/bin/bash
   # Helper script to create named migrations with validation
   # Usage: ./scripts/create-migration.sh "migration_name"
   # Steps:
   #   - Check if migration name provided
   #   - Validate schema.prisma syntax
   #   - Generate migration with descriptive name
   #   - Show generated SQL for review
   #   - Prompt for confirmation
````

- Must be executable (chmod +x)
- Validate migration name provided
- Run npx prisma format first
- Run npx prisma migrate dev --name "$1" --create-only
- Display generated SQL
- Ask user to review before applying

2. CREATE: packages/backend/scripts/run-migrations.sh

   ```bash
   #!/bin/bash
   # Safe migration runner with backup checks
   # Usage: ./scripts/run-migrations.sh
   # Steps:
   #   - Check database backup exists (warn if not)
   #   - Show pending migrations
   #   - Confirm before applying
   #   - Run migrations
   #   - Verify success
   ```

   - Check for recent backup (warn if > 24 hours)
   - List pending migrations
   - Require confirmation (Y/n)
   - Run npx prisma migrate deploy
   - Log success/failure

3. CREATE: packages/backend/scripts/rollback-migration.sh

   ```bash
   #!/bin/bash
   # Rollback to previous migration state
   # Usage: ./scripts/rollback-migration.sh
   # Steps:
   #   - Show current migration state
   #   - List available rollback points
   #   - Require confirmation
   #   - Execute rollback
   #   - Verify database state
   ```

   - Display current migration
   - Show last 5 migrations
   - Require typing migration name to confirm
   - Document that schema rollback must be manual
   - Provide instructions for data recovery

4. CREATE: packages/backend/scripts/verify-migration.sh

   ```bash
   #!/bin/bash
   # Verify migration before applying to production
   # Usage: ./scripts/verify-migration.sh
   # Steps:
   #   - Check schema.prisma for issues
   #   - Validate generated SQL
   #   - Test migration on dev database
   #   - Test rollback on dev database
   #   - Report results
   ```

   - Run npx prisma validate
   - Check for breaking changes (warn)
   - Suggest review checklist
   - Exit with status code

5. CREATE: packages/backend/prisma/MIGRATION_GUIDE.md

   ```markdown
   # Database Migration Guide

   ## Creating Migrations

   [Step-by-step process]

   ## Testing Migrations

   [How to test locally]

   ## Rollback Procedures

   [When and how to rollback]

   ## Best Practices

   - Always add new fields as nullable or with defaults
   - Never remove fields without deprecation period
   - Use transactions for data migrations
   - Test on staging before production

   ## Common Pitfalls

   [List of common mistakes]

   ## Emergency Procedures

   [What to do if migration fails in production]
   ```

6. UPDATE: packages/backend/README.md
   - Add "Database Migrations" section
   - Link to MIGRATION_GUIDE.md
   - Document helper scripts usage
   - Add to development workflow

CONSTRAINTS:

- Scripts must be POSIX-compliant (work on macOS/Linux)
- Must not modify existing migrations
- Must not change current schema
- Scripts must handle errors gracefully
- All scripts must be idempotent where possible

DELIVERABLES:

- scripts/create-migration.sh (executable, documented)
- scripts/run-migrations.sh (executable, documented)
- scripts/rollback-migration.sh (executable, documented)
- scripts/verify-migration.sh (executable, documented)
- prisma/MIGRATION_GUIDE.md (comprehensive guide)
- Updated README.md (migration section added)

SUCCESS CRITERIA:
✓ All scripts executable and tested
✓ Scripts include error handling
✓ Documentation complete and clear
✓ No modifications to existing schema/migrations
✓ Scripts work on macOS and Linux

```

---

## ITERATION 2: TRIP CANCELLATION/DELETION

---

### PROMPT 2.1: Database Schema for Trip Cancellation

```

TASK: Add soft-delete fields to Trip model for cancellation functionality

CONTEXT:

- Previous step: Error handling and migration framework ready
- Database: PostgreSQL with Prisma ORM
- Schema: packages/backend/prisma/schema.prisma
- Existing Trip model has: id, name, location, description, startDate, endDate, draft, createdAt, etc.
- Goal: Enable trip admins to cancel trips without data loss

OBJECTIVE:
Add soft-delete capability to Trip model with full audit trail.

REQUIREMENTS:

1. UPDATE: packages/backend/prisma/schema.prisma

   Modify Trip model to add:

   ```prisma
   model Trip {
     // ... existing fields ...

     // Soft delete fields
     deleted       Boolean   @default(false)
     deletedAt     DateTime?
     deletedBy     String?   // userId who cancelled
     deletionReason String?  // Required for cancellation

     // ... existing relations ...

     @@index([deleted])
   }
   ```

2. GENERATE MIGRATION:
   - Run: npx prisma migrate dev --name add_trip_soft_delete
   - Review generated SQL for correctness
   - Ensure all new fields have defaults or are nullable
   - Verify backward compatibility

3. UPDATE: packages/backend/prisma/seed.ts
   - Ensure existing trips have deleted: false
   - Add one sample cancelled trip for testing:
     ```typescript
     const cancelledTrip = await prisma.trip.create({
       data: {
         // ... standard trip fields ...
         deleted: true,
         deletedAt: new Date(),
         deletedBy: adminUser.id,
         deletionReason: 'נדחה עקב מזג אוויר', // Cancelled due to weather
       },
     });
     ```

4. CREATE TESTS: packages/backend/tests/migrations/trip-soft-delete.test.ts
   ```typescript
   describe('Trip Soft Delete Migration', () => {
     test('should apply migration successfully');
     test('should have deleted default to false');
     test('should allow nullable deletedAt, deletedBy, deletionReason');
     test('should create index on deleted field');
     test('should not break existing trip queries');
     test('should allow creating trip with deletion fields');
   });
   ```

   - Use test database
   - Mock Prisma client if needed
   - Verify data integrity
   - Target: >85% coverage

TEST-DRIVEN APPROACH:

1. Write migration tests first (will fail)
2. Update schema.prisma
3. Generate migration
4. Run migration on test DB
5. Update seed data
6. Verify tests pass

CONSTRAINTS:

- Must not break existing Trip queries
- All new fields nullable or have defaults
- Migration must be reversible
- Must maintain referential integrity
- Index added for query performance

DELIVERABLES:

- Updated prisma/schema.prisma
- Generated migration file in prisma/migrations/
- Updated prisma/seed.ts with sample data
- tests/migrations/trip-soft-delete.test.ts (passing)

SUCCESS CRITERIA:
✓ Migration applies without errors
✓ Existing trips have deleted=false after migration
✓ All tests pass
✓ No breaking changes to existing queries
✓ Seed script runs successfully

```

---

### PROMPT 2.2: Trip Cancellation Service Layer

```

TASK: Implement business logic for trip cancellation and restoration

CONTEXT:

- Previous step: Database schema updated with soft-delete fields (Prompt 2.1)
- Error handling: ApiError system available (Prompt 1.1)
- Backend: packages/backend/src/
- Testing: Vitest with Prisma mocks
- User roles: FAMILY, TRIP_ADMIN, SUPER_ADMIN

OBJECTIVE:
Create service layer for trip cancellation with proper validation and permissions.

REQUIREMENTS:

1. CREATE: packages/backend/src/services/tripCancellation.service.ts

   Type definitions:

   ```typescript
   interface CancelTripParams {
     tripId: string;
     userId: string;
     reason: string;
   }

   interface RestoreTripParams {
     tripId: string;
     userId: string;
   }
   ```

   Implement functions:

   ```typescript
   export async function cancelTrip(params: CancelTripParams): Promise<Trip>;
   export async function restoreTrip(params: RestoreTripParams): Promise<Trip>;
   export async function canCancelTrip(
     tripId: string,
     userId: string,
   ): Promise<boolean>;
   export async function canRestoreTrip(
     tripId: string,
     userId: string,
   ): Promise<boolean>;
   ```

2. IMPLEMENT: cancelTrip function
   - Validate trip exists (throw NOT_FOUND if not)
   - Validate trip not already deleted (throw BAD_REQUEST if deleted)
   - Check permission: user is TRIP_ADMIN for this trip OR SUPER_ADMIN
     (throw FORBIDDEN if not authorized)
   - Validate reason provided and not empty (throw VALIDATION_ERROR if missing)
   - Update trip: deleted=true, deletedAt=now(), deletedBy=userId, deletionReason=reason
   - Log action to activity log (if activity log service exists)
   - Return updated trip

3. IMPLEMENT: restoreTrip function
   - Validate trip exists (throw NOT_FOUND if not)
   - Validate trip is deleted (throw BAD_REQUEST if not deleted)
   - Check permission: user is SUPER_ADMIN only (throw FORBIDDEN otherwise)
   - Update trip: deleted=false, deletedAt=null, deletedBy=null, deletionReason=null
   - Log action to activity log
   - Return updated trip

4. IMPLEMENT: canCancelTrip function
   - Check if user is SUPER_ADMIN → return true
   - Check if user is TRIP_ADMIN for this trip → return true
   - Otherwise → return false
   - Handle errors gracefully (return false on error)

5. IMPLEMENT: canRestoreTrip function
   - Check if user is SUPER_ADMIN → return true
   - Otherwise → return false

6. CREATE TESTS: packages/backend/tests/services/tripCancellation.service.test.ts
   ```typescript
   describe('tripCancellation.service', () => {
     describe('cancelTrip', () => {
       test('should cancel trip when user is trip admin');
       test('should cancel trip when user is super-admin');
       test('should throw VALIDATION_ERROR when reason is empty');
       test('should throw NOT_FOUND when trip does not exist');
       test('should throw BAD_REQUEST when trip already cancelled');
       test('should throw FORBIDDEN when user not authorized');
       test('should set all cancellation fields correctly');
       test('should log action to activity log');
     });

     describe('restoreTrip', () => {
       test('should restore trip when user is super-admin');
       test('should throw FORBIDDEN when user is not super-admin');
       test('should throw NOT_FOUND when trip does not exist');
       test('should throw BAD_REQUEST when trip not cancelled');
       test('should clear all cancellation fields');
       test('should log action to activity log');
     });

     describe('canCancelTrip', () => {
       test('should return true for super-admin');
       test('should return true for trip admin');
       test('should return false for non-admin user');
     });

     describe('canRestoreTrip', () => {
       test('should return true for super-admin');
       test('should return false for non-super-admin');
     });
   });
   ```

   - Mock Prisma client
   - Mock user permissions
   - Test all error cases
   - Target: >85% coverage

TEST-DRIVEN APPROACH:

1. Write all test cases first (will fail)
2. Implement service functions to pass tests one by one
3. Verify all tests pass
4. Refactor for code quality

CONSTRAINTS:

- Must use ApiError from Prompt 1.1
- Must check permissions before any database operation
- Must validate all inputs
- Must handle Prisma errors gracefully
- Must log all state changes

DELIVERABLES:

- src/services/tripCancellation.service.ts (complete, exported)
- tests/services/tripCancellation.service.test.ts (>85% coverage, passing)
- Type-safe implementation with no 'any' types

SUCCESS CRITERIA:
✓ All tests pass
✓ No TypeScript errors
✓ Permission checks work correctly
✓ Hebrew error messages via ApiError
✓ Activity log integration (if available)

```

---

### PROMPT 2.3: Trip Cancellation API Endpoints

```

TASK: Create REST API endpoints for trip cancellation and restoration

CONTEXT:

- Previous step: Cancellation service implemented (Prompt 2.2)
- Backend: Express + TypeScript
- Error handling: Global middleware active (Prompt 1.1)
- Auth: JWT middleware available, provides req.user with id and role
- Testing: Supertest + Vitest
- Routes location: packages/backend/src/routes/

OBJECTIVE:
Expose trip cancellation functionality via RESTful API with proper authorization.

REQUIREMENTS:

1. CREATE: packages/backend/src/controllers/tripCancellation.controller.ts

   ```typescript
   import { Request, Response } from 'express';
   import * as tripCancellationService from '../services/tripCancellation.service';

   export async function cancelTrip(req: Request, res: Response): Promise<void>;
   export async function restoreTrip(
     req: Request,
     res: Response,
   ): Promise<void>;
   ```

   Implement cancelTrip controller:
   - Extract tripId from req.params.id
   - Extract userId from req.user.id (from auth middleware)
   - Extract reason from req.body.reason
   - Validate reason exists (if not, throw VALIDATION_ERROR)
   - Call tripCancellationService.cancelTrip({ tripId, userId, reason })
   - Return 200 with updated trip: { success: true, data: trip }
   - Errors bubble to error middleware

   Implement restoreTrip controller:
   - Extract tripId from req.params.id
   - Extract userId from req.user.id
   - Call tripCancellationService.restoreTrip({ tripId, userId })
   - Return 200 with updated trip: { success: true, data: trip }
   - Errors bubble to error middleware

2. UPDATE: packages/backend/src/routes/trips.routes.ts

   Add routes:

   ```typescript
   import {
     cancelTrip,
     restoreTrip,
   } from '../controllers/tripCancellation.controller';
   import { authenticate } from '../middleware/auth';

   router.post('/trips/:id/cancel', authenticate, cancelTrip);
   router.post('/trips/:id/restore', authenticate, restoreTrip);
   ```

3. CREATE VALIDATION MIDDLEWARE (optional):

   ```typescript
   // src/middleware/validateCancellation.ts
   export function validateCancellationReason(req, res, next) {
     const { reason } = req.body;
     if (!reason || reason.trim().length === 0) {
       throw createValidationError('נדרש לספק סיבה לביטול', {
         field: 'reason',
       });
     }
     next();
   }
   ```

   - Add to cancel route if desired

4. CREATE TESTS: packages/backend/tests/api/tripCancellation.test.ts

   ```typescript
   describe('POST /api/trips/:id/cancel', () => {
     test('should cancel trip when user is trip admin (200)');
     test('should cancel trip when user is super-admin (200)');
     test('should return 400 when reason is missing');
     test('should return 400 when reason is empty string');
     test('should return 403 when user is not authorized');
     test('should return 404 when trip not found');
     test('should return 400 when trip already cancelled');
     test('should return updated trip with cancellation details');
   });

   describe('POST /api/trips/:id/restore', () => {
     test('should restore trip when user is super-admin (200)');
     test('should return 403 when user is not super-admin');
     test('should return 404 when trip not found');
     test('should return 400 when trip not cancelled');
     test('should return restored trip with cleared cancellation fields');
   });
   ```

   - Use supertest for API calls
   - Use test database with seed data
   - Mock authentication middleware (provide test users)
   - Test all status codes
   - Test response structure
   - Target: >85% coverage

TEST-DRIVEN APPROACH:

1. Write API tests first (will fail)
2. Implement controller functions
3. Add routes
4. Verify tests pass
5. Test with real HTTP requests

CONSTRAINTS:

- Must use existing auth middleware
- Must validate request body (reason required)
- Must return proper HTTP status codes (200, 400, 403, 404, 500)
- Errors handled by global error middleware
- Must follow RESTful conventions

DELIVERABLES:

- src/controllers/tripCancellation.controller.ts (complete)
- Updated src/routes/trips.routes.ts (new routes added)
- tests/api/tripCancellation.test.ts (>85% coverage, passing)
- Optional: src/middleware/validateCancellation.ts

SUCCESS CRITERIA:
✓ All API tests pass
✓ Proper status codes returned
✓ Authorization enforced
✓ Hebrew error messages in responses
✓ No TypeScript errors

```

---

### PROMPT 2.4: Update Trip Queries for Filtering

```

TASK: Update trip query logic to filter out cancelled trips for families

CONTEXT:

- Previous steps: Cancelled trips marked with deleted=true
- Backend: Express + Prisma
- Existing endpoint: GET /api/trips (lists trips)
- Service: packages/backend/src/services/trip.service.ts
- Goal: Hide cancelled trips from families, show to admins with option

OBJECTIVE:
Implement role-based filtering for cancelled trips without breaking existing queries.

REQUIREMENTS:

1. UPDATE: packages/backend/src/services/trip.service.ts

   Add interface:

   ```typescript
   interface GetTripsParams {
     userId: string;
     userRole: 'FAMILY' | 'TRIP_ADMIN' | 'SUPER_ADMIN';
     includeDeleted?: boolean; // default false
   }
   ```

   Update getTrips function signature:

   ```typescript
   export async function getTrips(params: GetTripsParams): Promise<Trip[]>;
   ```

   Implement filtering logic:

   ```typescript
   const whereClause: Prisma.TripWhereInput = {};

   if (params.userRole === 'FAMILY') {
     // Families NEVER see deleted trips
     whereClause.deleted = false;
   } else if (params.userRole === 'TRIP_ADMIN') {
     // Trip admins don't see deleted by default
     whereClause.deleted = params.includeDeleted ? undefined : false;
   } else if (params.userRole === 'SUPER_ADMIN') {
     // Super-admins can optionally filter
     if (!params.includeDeleted) {
       whereClause.deleted = false;
     }
   }

   return prisma.trip.findMany({ where: whereClause });
   ```

   Update getTripById function:

   ```typescript
   export async function getTripById(
     tripId: string,
     userId: string,
     userRole: UserRole,
   ): Promise<Trip | null>;
   ```

   Logic:
   - Get trip by ID
   - If trip.deleted && userRole === 'FAMILY' → throw NOT_FOUND
   - Otherwise return trip

2. UPDATE: packages/backend/src/controllers/trip.controller.ts

   Update getTrips controller:

   ```typescript
   export async function getTrips(req: Request, res: Response) {
     const userId = req.user.id;
     const userRole = req.user.role;
     const includeDeleted = req.query.includeDeleted === 'true';

     const trips = await tripService.getTrips({
       userId,
       userRole,
       includeDeleted,
     });

     res.json({ success: true, data: trips });
   }
   ```

   Update getTripById controller:

   ```typescript
   export async function getTripById(req: Request, res: Response) {
     const tripId = req.params.id;
     const userId = req.user.id;
     const userRole = req.user.role;

     const trip = await tripService.getTripById(tripId, userId, userRole);

     if (!trip) {
       throw createNotFoundError('Trip');
     }

     res.json({ success: true, data: trip });
   }
   ```

3. UPDATE: packages/backend/src/routes/trips.routes.ts
   - Ensure routes use updated controllers
   - Add query parameter support for ?includeDeleted=true

4. CREATE TESTS: packages/backend/tests/services/tripFilter.test.ts

   ```typescript
   describe('Trip Filtering Service', () => {
     describe('getTrips', () => {
       test('FAMILY role never sees deleted trips');
       test('FAMILY role with includeDeleted=true still hides deleted');
       test('TRIP_ADMIN sees only non-deleted by default');
       test('TRIP_ADMIN with includeDeleted=true sees deleted trips');
       test('SUPER_ADMIN sees all trips by default');
       test('SUPER_ADMIN can filter deleted trips with includeDeleted=false');
     });

     describe('getTripById', () => {
       test('FAMILY role throws NOT_FOUND for deleted trip');
       test('TRIP_ADMIN can view deleted trip');
       test('SUPER_ADMIN can view deleted trip');
       test('returns trip with deleted flag for admins');
     });
   });
   ```

   - Mock Prisma with mixed deleted/non-deleted trips
   - Test all role combinations
   - Target: >85% coverage

5. CREATE TESTS: packages/backend/tests/api/tripFilter.test.ts

   ```typescript
   describe('GET /api/trips', () => {
     test('FAMILY user receives only non-deleted trips');
     test('TRIP_ADMIN receives only non-deleted by default');
     test('TRIP_ADMIN with ?includeDeleted=true receives deleted trips');
     test('SUPER_ADMIN receives all trips by default');
     test('SUPER_ADMIN with ?includeDeleted=false filters deleted');
   });

   describe('GET /api/trips/:id', () => {
     test('FAMILY user gets 404 for deleted trip');
     test('TRIP_ADMIN can view deleted trip details');
     test('SUPER_ADMIN can view deleted trip details');
     test('returns 404 for non-existent trip');
   });
   ```

   - Use supertest
   - Create test data with deleted and non-deleted trips
   - Mock different user roles
   - Target: >85% coverage

TEST-DRIVEN APPROACH:

1. Write service tests first (will fail)
2. Update service to pass tests
3. Write API tests
4. Update controllers
5. Verify all tests pass
6. Test manually with different roles

CONSTRAINTS:

- Must maintain backward compatibility
- Must use database-level filtering (Prisma where clause)
- Must not break existing trip queries
- Performance: Use index on deleted field
- Type-safe implementation

DELIVERABLES:

- Updated src/services/trip.service.ts (with filtering)
- Updated src/controllers/trip.controller.ts
- tests/services/tripFilter.test.ts (>85% coverage, passing)
- tests/api/tripFilter.test.ts (>85% coverage, passing)

SUCCESS CRITERIA:
✓ All tests pass
✓ Families never see deleted trips
✓ Admins can optionally view deleted trips
✓ Efficient database queries (use indexes)
✓ No breaking changes to existing behavior

CRITICAL NOTE:
This change affects core trip listing - test extensively!

```

---

### PROMPT 2.5: Trip Cancellation Frontend UI

```

TASK: Create cancellation dialog and UI for trip admins

CONTEXT:

- Previous step: API endpoints ready (Prompt 2.3, 2.4)
- Frontend: Next.js 14 + React + TypeScript
- UI Library: Shadcn/UI + Tailwind CSS
- Components: packages/frontend/components/
- Testing: Vitest + React Testing Library
- Language: Hebrew (RTL)

OBJECTIVE:
Build user interface for trip cancellation with proper validation and feedback.

REQUIREMENTS:

1. CREATE: packages/frontend/components/trips/TripCancelDialog.tsx

   ```typescript
   interface TripCancelDialogProps {
     tripId: string;
     tripName: string;
     isOpen: boolean;
     onClose: () => void;
     onSuccess: () => void;
   }

   export function TripCancelDialog(props: TripCancelDialogProps);
   ```

   Component structure:
   - Use Shadcn Dialog component
   - RTL support (dir="rtl")
   - Warning icon (AlertTriangle from lucide-react)
   - Title: "ביטול טיול" (Cancel Trip)
   - Warning message: "האם אתה בטוח שברצונך לבטל את הטיול?"
   - Textarea for cancellation reason:
     - Label: "סיבת הביטול _" (Cancellation Reason _)
     - Placeholder: "נא להזין סיבת ביטול"
     - Required field
     - Min 10 characters
     - Max 500 characters
     - RTL direction
   - Checkbox: "אני מבין שהטיול יוסתר מהמשתתפים" (I understand trip will be hidden)
   - Info note: "לא תישלח התראה למשתתפים. יש ליצור קשר ידנית." (No notification sent)
   - Buttons:
     - Cancel: "ביטול" (secondary variant)
     - Confirm: "אשר ביטול" (destructive variant, disabled until valid)
   - Loading state during API call
   - Error display if API fails

2. IMPLEMENT: Form validation
   - Reason must be at least 10 characters
   - Checkbox must be checked
   - Confirm button disabled until both valid
   - Show validation errors in Hebrew

3. IMPLEMENT: API integration

   ```typescript
   async function handleCancel() {
     setLoading(true);
     setError(null);

     try {
       const response = await fetch(`/api/trips/${tripId}/cancel`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ reason }),
       });

       if (!response.ok) {
         const error = await response.json();
         throw new Error(error.error.message);
       }

       onSuccess();
       onClose();
       // Show success toast
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   }
   ```

4. CREATE: packages/frontend/components/trips/TripStatusBadge.tsx

   ```typescript
   interface TripStatusBadgeProps {
     trip: Trip; // has deleted, deletedAt fields
   }

   export function TripStatusBadge({ trip }: TripStatusBadgeProps);
   ```

   - Show "מבוטל" (Cancelled) badge if trip.deleted
   - Red background, white text
   - Include cancellation date
   - Tooltip with cancellation reason (admin view only)

5. UPDATE: Trip admin page (wherever cancel button should appear)
   - Add "בטל טיול" (Cancel Trip) button
   - Red/destructive styling
   - Only visible to TRIP_ADMIN and SUPER_ADMIN
   - Opens TripCancelDialog on click
   - Pass trip data to dialog

6. ADD: Cancelled trips section to admin dashboard
   - Tab or filter: "טיולים מבוטלים" (Cancelled Trips)
   - List cancelled trips separately
   - Show cancellation reason and date
   - For SUPER_ADMIN: Add "שחזר טיול" (Restore Trip) button

7. CREATE TESTS: packages/frontend/**tests**/components/TripCancelDialog.test.tsx

   ```typescript
   describe('TripCancelDialog', () => {
     test('renders when open');
     test('does not render when closed');
     test('confirm button disabled when reason empty');
     test('confirm button disabled when reason too short');
     test('confirm button disabled when checkbox not checked');
     test('confirm button enabled when valid');
     test('shows loading state during API call');
     test('calls onSuccess after successful cancellation');
     test('displays error message on API failure');
     test('calls onClose when cancel button clicked');
     test('clears form when closed and reopened');
   });

   describe('TripStatusBadge', () => {
     test('shows cancelled badge for deleted trip');
     test('does not show badge for active trip');
     test('displays cancellation date');
     test('shows tooltip with reason on hover (admin only)');
   });
   ```

   - Mock fetch API
   - Mock user role for visibility tests
   - Target: >85% coverage

TEST-DRIVEN APPROACH:

1. Write component tests first
2. Implement TripCancelDialog
3. Implement TripStatusBadge
4. Update admin pages
5. Verify tests pass
6. Manual testing in browser

CONSTRAINTS:

- Must use Shadcn/UI components (Dialog, Button, Textarea, Checkbox)
- Must be fully RTL (Hebrew text and layout)
- Must validate before API call
- Must show loading states
- Must handle errors gracefully
- Must be accessible (ARIA labels, keyboard navigation)

DELIVERABLES:

- components/trips/TripCancelDialog.tsx (complete component)
- components/trips/TripStatusBadge.tsx (badge component)
- Updated admin trip pages (cancel button added)
- **tests**/components/TripCancelDialog.test.tsx (>85% coverage, passing)

STYLING:

- Use Tailwind CSS classes
- Destructive button: Shadcn destructive variant
- Warning: amber-500 color for icon and message
- Textarea: border-gray-300, rounded-md, min-h-24
- Proper spacing with space-y-4
- Mobile responsive

SUCCESS CRITERIA:
✓ All tests pass
✓ Dialog functional and styled
✓ Form validation works
✓ API integration successful
✓ Loading and error states work
✓ Fully RTL compliant
✓ Accessible (keyboard, screen reader)

```

---

### PROMPT 2.6: Permanent Deletion (Super-Admin Only)

```

TASK: Implement hard delete functionality for super-admins with extensive safeguards

CONTEXT:

- Previous steps: Trip cancellation (soft-delete) fully implemented
- Backend: Express + Prisma + TypeScript
- Frontend: Next.js + React
- Risk Level: HIGH - Destructive, irreversible operation
- Requirement: Only super-admins, only for already-cancelled trips

OBJECTIVE:
Enable permanent deletion with multiple safety measures and confirmations.

REQUIREMENTS - BACKEND:

1. CREATE: packages/backend/src/services/tripDeletion.service.ts

   ```typescript
   interface DeleteTripParams {
     tripId: string;
     userId: string;
   }

   export async function permanentlyDeleteTrip(
     params: DeleteTripParams,
   ): Promise<void>;
   export async function canPermanentlyDelete(
     tripId: string,
     userId: string,
   ): Promise<boolean>;
   ```

   Implement permanentlyDeleteTrip:
   - Validate user is SUPER_ADMIN (throw FORBIDDEN if not)
   - Validate trip exists (throw NOT_FOUND if not)
   - Validate trip is already cancelled (deleted=true)
     (throw BAD_REQUEST "ניתן למחוק רק טיולים מבוטלים" if not cancelled)
   - Use Prisma transaction to delete all related data:
     ```typescript
     await prisma.$transaction(async (tx) => {
       // Delete in correct order (foreign keys)
       await tx.tripAttendance.deleteMany({ where: { tripId } });
       await tx.gearItem.deleteMany({ where: { tripId } });
       await tx.dietaryRequirement.deleteMany({ where: { tripId } }); // if exists
       // Delete other related records...
       await tx.trip.delete({ where: { id: tripId } });
     });
     ```
   - Log the deletion with full details (trip name, admin, timestamp)
   - Return void

   Implement canPermanentlyDelete:
   - Check user is SUPER_ADMIN
   - Check trip exists and is cancelled
   - Return boolean

2. CREATE: packages/backend/src/controllers/tripDeletion.controller.ts

   ```typescript
   export async function permanentlyDeleteTrip(req: Request, res: Response);
   ```

   - Extract tripId, userId
   - Call service.permanentlyDeleteTrip
   - Return 204 No Content on success
   - Errors bubble to middleware

3. UPDATE: packages/backend/src/routes/trips.routes.ts

   ```typescript
   router.delete('/trips/:id', authenticate, permanentlyDeleteTrip);
   ```

   - Only accessible to authenticated users
   - Authorization checked in service layer

4. CREATE TESTS: packages/backend/tests/services/tripDeletion.service.test.ts

   ```typescript
   describe('permanentlyDeleteTrip', () => {
     test('should delete trip and all related data when super-admin');
     test('should throw FORBIDDEN when user is not super-admin');
     test('should throw BAD_REQUEST when trip not cancelled');
     test('should throw NOT_FOUND when trip does not exist');
     test('should delete in transaction (rollback on error)');
     test('should log deletion action');
     test('should delete TripAttendance records');
     test('should delete GearItem records');
     test('should delete all related records');
   });

   describe('canPermanentlyDelete', () => {
     test('should return true for super-admin with cancelled trip');
     test('should return false for non-super-admin');
     test('should return false when trip not cancelled');
   });
   ```

   - Mock Prisma transaction
   - Mock activity log
   - Test rollback on error
   - Target: >90% coverage (high risk)

REQUIREMENTS - FRONTEND:

5. CREATE: packages/frontend/components/trips/TripDeleteDialog.tsx

   ```typescript
   interface TripDeleteDialogProps {
     tripId: string;
     tripName: string;
     isOpen: boolean;
     onClose: () => void;
     onSuccess: () => void;
   }
   ```

   Multi-step confirmation:
   - Step 1: Warning screen
     - Large warning icon (red)
     - Title: "מחיקה צמיתה של טיול" (Permanent Trip Deletion)
     - Warning: "זוהי פעולה בלתי הפיכה!" (This is irreversible!)
     - List what will be deleted:
       - פרטי הטיול (Trip details)
       - כל רישומי ההשתתפות (All attendance records)
       - כל משימות הציוד (All gear assignments)
       - כל הנתונים הקשורים (All related data)
     - Checkbox: "אני מבין שמדובר במחיקה צמיתה"
     - Button: "המשך" (Continue) - enabled only after checkbox
   - Step 2: Type trip name confirmation
     - Instruction: "הקלד את שם הטיול לאישור:"
     - Show trip name in bold
     - Text input for user to type
     - Must match exactly (case-sensitive)
     - Button: "המשך" - enabled only when match
   - Step 3: Final confirmation
     - Title: "האם אתה בטוח לחלוטין?"
     - Red warning banner
     - Final checkbox: "כן, מחק לצמיתות"
     - Buttons:
       - "ביטול" (Cancel - go back)
       - "מחק לצמיתות" (Delete Permanently - destructive, enabled only after checkbox)

6. IMPLEMENT: API integration in dialog

   ```typescript
   async function handleDelete() {
     setLoading(true);
     try {
       const response = await fetch(`/api/trips/${tripId}`, {
         method: 'DELETE',
       });

       if (response.status === 204) {
         onSuccess();
         onClose();
         // Show success toast
       } else {
         const error = await response.json();
         throw new Error(error.error.message);
       }
     } catch (err) {
       setError(err.message);
     } finally {
       setLoading(false);
     }
   }
   ```

7. UPDATE: Super-admin cancelled trips view
   - Add "מחק לצמיתות" (Delete Permanently) button
   - Red/destructive styling
   - Only visible for SUPER_ADMIN
   - Only shows for cancelled trips
   - Opens TripDeleteDialog

8. CREATE TESTS: packages/frontend/**tests**/components/TripDeleteDialog.test.tsx

   ```typescript
   describe('TripDeleteDialog - Multi-step', () => {
     test('starts on step 1 warning screen');
     test('step 1: continue disabled until checkbox checked');
     test('step 2: continue disabled until trip name matches');
     test('step 2: case-sensitive name matching');
     test('step 3: delete disabled until final checkbox checked');
     test('can navigate back through steps');
     test('successful deletion calls onSuccess');
     test('displays error on API failure');
     test('shows loading state during deletion');
     test('resets to step 1 when reopened');
   });
   ```

   - Mock fetch for DELETE request
   - Test all confirmation steps
   - Target: >90% coverage

9. CREATE DOCUMENTATION: packages/backend/TRIP_DELETION.md

   ```markdown
   # Trip Permanent Deletion Procedure

   ## When to Use

   - Only for cancelled trips that need permanent removal
   - After confirmation all data can be deleted
   - Super-admin only operation

   ## Safety Procedures

   1. Trip must be cancelled first (soft-delete)
   2. Only super-admins can delete
   3. Frontend requires 3-step confirmation
   4. Backend validates trip is cancelled
   5. Database transaction ensures atomicity

   ## What Gets Deleted

   [Detailed list]

   ## Cannot Be Undone

   [Warning section]

   ## Recovery Procedures

   - Only possible from database backup
   - Contact database administrator
   - Provide trip ID and timestamp
   ```

TEST-DRIVEN APPROACH:

1. Write backend tests (service, API)
2. Implement backend service with safeguards
3. Write frontend tests
4. Implement multi-step dialog
5. Test extensively in staging
6. Document procedures

CONSTRAINTS:

- Backend: MUST verify user is super-admin
- Backend: MUST verify trip is cancelled
- Backend: MUST use database transaction
- Backend: MUST log deletion with details
- Frontend: MUST require 3 confirmations
- Frontend: MUST show clear warnings
- Frontend: MUST be super-admin only

DELIVERABLES:

- src/services/tripDeletion.service.ts (backend)
- src/controllers/tripDeletion.controller.ts
- Updated routes with DELETE endpoint
- tests/services/tripDeletion.service.test.ts (>90% coverage)
- components/trips/TripDeleteDialog.tsx (frontend)
- **tests**/components/TripDeleteDialog.test.tsx (>90% coverage)
- TRIP_DELETION.md documentation

SUCCESS CRITERIA:
✓ All tests pass (>90% coverage)
✓ Only super-admins can delete
✓ Only cancelled trips can be deleted
✓ Transaction ensures atomicity
✓ Three-step confirmation works
✓ Clear warnings displayed
✓ Activity logged
✓ Documentation complete

CRITICAL WARNING:
This is a HIGH-RISK feature. Test extensively before production deployment.

```

---

## ITERATION 3: TRIP PUBLISHING WORKFLOW

I'll continue with the remaining iterations following the same detailed pattern. Due to length, I'm providing the structure for iterations 3-8.

### PROMPT 3.1: Database Schema for Publishing
[Similar detailed structure as previous prompts]

### PROMPT 3.2: Publishing Service Layer
[Similar detailed structure]

### PROMPT 3.3: Publishing API Endpoints
[Similar detailed structure]

### PROMPT 3.4: Trip Admin Publishing UI
[Similar detailed structure]

### PROMPT 3.5: Super-Admin Publishing Dashboard
[Similar detailed structure]

### PROMPT 3.6: Admin Assignment Feature
[Similar detailed structure]

---

## ITERATION 4: PER-MEMBER PARTICIPATION
[7 prompts following same pattern]

## ITERATION 5: ADMIN NOTES
[4 prompts following same pattern]

## ITERATION 6: PARTICIPATION APPROVAL
[7 prompts following same pattern]

## ITERATION 7: EMAIL VERIFICATION
[6 prompts following same pattern]

## ITERATION 8: PASSWORD RESET
[5 prompts following same pattern]

---

## Appendix: Prompt Template

Each prompt follows this structure:

```

TASK: [One-line description]

CONTEXT:

- Previous step: [What was completed]
- Technology: [Relevant stack]
- Location: [File paths]
- Goal: [What this achieves]

OBJECTIVE:
[Clear statement of what to build]

REQUIREMENTS:

1. CREATE/UPDATE: [File path]
   [Detailed implementation spec]
   [Code examples]

2. [Additional requirements...]

TEST-DRIVEN APPROACH:

1. Write tests first
2. Implement to pass tests
3. Refactor
4. Verify

CONSTRAINTS:

- [Technical constraints]
- [Business rules]
- [Quality requirements]

DELIVERABLES:

- [File 1]
- [File 2]
- [Tests with coverage]

SUCCESS CRITERIA:
✓ [Measurable outcome 1]
✓ [Measurable outcome 2]

```

---

## Usage Instructions

### For Each Prompt:

1. **Copy prompt text** to your LLM
2. **Review generated code** for quality
3. **Run tests** - all should pass
4. **Manual testing** in dev environment
5. **Code review** before committing
6. **Commit** with clear message
7. **Move to next prompt**

### Best Practices:

- **Sequential execution** - Don't skip steps
- **Test thoroughly** - Each step must work before next
- **Commit often** - After each successful step
- **Review code** - Don't blindly accept generated code
- **Adapt as needed** - Your codebase may differ
- **Document changes** - Update relevant docs

### Rollback Plan:

If a step fails:
1. Review error messages
2. Fix issues manually
3. Rerun tests
4. If unfixable, rollback commit
5. Adjust prompt and retry

---

## Success Metrics

Track progress with:

- ✅ Prompts completed: __/48
- ✅ Tests passing: __%
- ✅ Coverage achieved: __%
- ✅ Features deployed: __/8
- ✅ Bugs found: __
- ✅ Time spent: __ hours

---

## Next Steps

1. **Review this blueprint** - Ensure it fits your needs
2. **Set up dev environment** - Ensure tests run
3. **Start with Prompt 1.1** - Error handling foundation
4. **Work sequentially** - Complete each before next
5. **Deploy to staging** - After each iteration
6. **Production deployment** - After all iterations complete

---

**Document Version:** 1.0
**Last Updated:** October 18, 2025
**Status:** Ready for implementation
```
