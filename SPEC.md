# Neighborhood Trip Planning App — Full Developer Specification

## 1. **Overview**

A responsive web app to manage neighborhood family trips.

- Supports planning, attendance tracking, dietary requirements, shared gear, and trip schedules.
- Integrates with WhatsApp for notifications (copy/paste message generation).
- Fully in Hebrew with RTL support.
- Roles: Family (participant), Trip Admin, Super-admin.

---

## 2. **Platform & Tech Stack**

- **Frontend:** React + TypeScript
- **Backend:** Node.js + TypeScript (API server)
- **Database:** PostgreSQL
- **Hosting:** Vercel (full stack deployment)
- **Responsive design:** Works on desktop and mobile
- **Localization:** Hebrew only (RTL layout)

---

## 3. **Authentication & Accounts**

- **Login options:**
  - Google OAuth
  - Email/password fallback
  - Optionally Facebook OAuth

- **User profile:**
  - Adults: Name (required), phone/email/photo (optional)
  - Children: Name + age

- **Family accounts:** persistent, editable by members
- **Registration approval:** Super-admin validates new families
- **Logging:** Track logins and all profile/trip changes

---

## 4. **Roles & Permissions**

| Role        | Capabilities                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| Family      | View trips, mark attendance, update family/child profiles, volunteer for gear                                        |
| Trip Admin  | Manage assigned trip: participants, gear, dietary info, schedule, packing lists; manually trigger WhatsApp reminders; cancel trips (soft-delete) |
| Super-admin | Approve trips and trip admins, approve families, delete/deactivate families, view all trips and families; restore cancelled trips; permanently delete trips |

- Roles are **hardcoded**; trip admins are **trip-specific**.

---

## 5. **Entities & Relationships (Updated with Children in Users)**

### 5.1 User

- **Purpose:** Represents an individual who can log in (adult) or a child in a family.
- **Fields:**
  - `id` (PK)
  - `family_id` (FK to Family)
  - `type` (`adult` or `child`)
  - `name` (required)
  - `age` (required for children, nullable for adults)
  - `email` (unique, nullable if OAuth only)
  - `oauth_provider` (e.g., Google, Facebook; nullable for email/password)
  - `password_hash` (nullable if OAuth only)
  - `profile_photo_url` (optional)
  - `created_at`
  - `updated_at`

- **Relationships:**
  - Many-to-one: belongs to a **Family**
  - One-to-many: can be **trip admin** for multiple trips (adults only)

### 5.2 Family

- **Purpose:** Represents a household of users.
- **Fields:**
  - `id` (PK)
  - `name` (optional)
  - `created_at`
  - `updated_at`

- **Relationships:**
  - One-to-many: multiple **Users** (adults and children)
  - Many-to-many: linked to **Trips** through **attendance** and **gear assignment**

### 5.3 Trip

- **Fields:**
  - `id` (PK)
  - `name`, `location`, `description`
  - `start_date`, `end_date`
  - `draft` (bool) - true = draft, false = published
  - `requireParticipationApproval` (bool) - true = admin must approve, false = open enrollment (default: true)
  - `publishRequested` (bool) - trip admin requested publish
  - `publishRequestedAt` (timestamp, nullable)
  - `publishedAt` (timestamp, nullable)
  - `publishedBy` (FK to User, nullable)
  - `unpublishedAt` (timestamp, nullable) - audit trail
  - `deleted` (bool) - soft-delete flag
  - `deletedAt` (timestamp, nullable)
  - `deletedBy` (FK to User, nullable)
  - `deletionReason` (text, nullable)
  - `lastModifiedBy` (FK to User, nullable)
  - `lastModifiedAt` (timestamp, nullable)
  - `attendance_cutoff_date`
  - `photo_album_link` (external)
  - `created_at`, `updated_at`

- **Relationships:**
  - Many-to-many: **Family ↔ Trip** (attendance via TripAttendance)
  - One-to-many: **Trip ↔ GearItem**
  - Many-to-many: **Trip ↔ Admin (User)**

### 5.3a TripAttendance (Join Table)

- **Fields:**
  - `id` (PK)
  - `trip_id` (FK to Trip)
  - `family_id` (FK to Family)
  - `status` (enum: PENDING, APPROVED, REJECTED) - approval status
  - `requestedAt` (timestamp) - when family requested to join
  - `respondedAt` (timestamp, nullable) - when admin approved/rejected
  - `respondedBy` (FK to User, nullable) - which admin responded
  - `rejectionReason` (text, nullable) - why request was rejected
  - `dietaryRequirements` (text, nullable)
  - `created_at`, `updated_at`

### 5.4 GearItem

- **Fields:**
  - `id` (PK)
  - `trip_id` (FK)
  - `name`
  - `quantity_needed`
  - `assigned_families[] {family_id, quantity_assigned}`

### 5.5 Logs

- **Fields:**
  - `id` (PK)
  - `user_id` (FK)
  - `entity_type` (e.g., Trip, Family, GearItem)
  - `entity_id`
  - `action_type` (create, update, delete, login)
  - `timestamp`
  - `changes` (JSON of changed fields)

**Notes:**

- Each child is now a **User record** with `type = child` and `age` field.
- Adults are `type = adult` and can log in; children cannot log in.
- Trip attendance and gear assignments remain **linked to the Family**.
- Trip admins are **Users of type adult**.

---

## 6. **Trip Workflow**

1. **Draft Creation:** Family member creates trip in draft mode (completely hidden from other families); creator becomes trip admin; sets approval requirement (default: required).
2. **Publish Request:** Trip admin requests publishing when ready; super-admins receive notification.
3. **Trip Publishing:** Super-admin reviews trip, optionally assigns additional admins, then publishes trip (makes visible to families).
4. **Trip Editing:** Trip admins can edit trip details at any time; participants are notified of changes to published trips.
5. **Family Participation:** 
   - If approval required: Family requests to join → sees limited info → admin approves/rejects → if approved, gains full access
   - If open enrollment: Family marks attendance directly (checkbox) → immediate full access
6. **Gear Assignment:** Approved families volunteer for gear; quantities tracked per family; editable until trip starts.
7. **Reminders:** Admins manually trigger WhatsApp messages for reminders, gear lists, etc.
8. **Trip Completion:** Trips remain read-only after completion.
9. **Trip Cancellation:** Trip admins can cancel trips (soft-delete with required reason); cancelled trips are hidden from families but data is preserved; super-admins can restore or permanently delete cancelled trips.
10. **Unpublishing:** Super-admins can unpublish trips (moves back to draft); participating families are notified.

---

## 7. **Data Handling**

- All data stored in PostgreSQL
- Families’ personal data: visible only as required (names + children ages)
- External links for photos/documents only; no file uploads
- Historical data preserved after family deletion/deactivation

---

## 8. **WhatsApp Integration**

- App **generates message text** for copying into WhatsApp.
- Supports **customizable templates**.
- Automatic triggers: attendance updates, gear updates, trip creation
- Manual triggers: reminders and trip start notifications

---

## 9. **Error Handling**

- **API:** return structured error messages with HTTP status codes:
  - 400: Validation error
  - 401: Unauthorized
  - 403: Forbidden (role-based restriction)
  - 404: Not found
  - 500: Server errors

- **Frontend:** display clear, user-friendly error messages (e.g., “Attendance cutoff has passed”).
- **Database transactions:** wrap critical operations (attendance updates, gear assignment) in transactions to prevent partial updates.

---

## 10. **Testing Plan**

### 10.1 Unit Tests

- Test React components (forms, checkboxes, dashboards)
- Test backend API endpoints for all entities and CRUD operations
- Test authentication flows (Google, email/password)

### 10.2 Integration Tests

- Trip creation and draft workflow
- Attendance marking and cutoff warnings
- Gear assignment and updates
- WhatsApp message generation

### 10.3 End-to-End Tests

- Family registration and admin approval
- Trip participation lifecycle
- Admin actions: trip management, gear assignment, reminders
- Super-admin actions: approve trips/families, delete/deactivate families

### 10.4 Logging Verification

- Confirm all logins and data changes are correctly logged

---

## 11. **Security Considerations**

- Role-based access enforced at API level
- Validate external links to prevent XSS
- Secure password storage (bcrypt/scrypt)
- HTTPS-only communication

---

## 12. **Developer Notes**

- **Database schema**: normalized with proper foreign keys for trip ↔ family ↔ gear relationships
- **State management**: React context or Redux for logged-in user, trip, and family state
- **Responsive UI**: CSS-in-JS or Tailwind with RTL support
- **Deployment:** Vercel full-stack, auto-deploy on git push

---

This specification includes:

- All **functional requirements** (trips, attendance, gear, dietary info, WhatsApp integration)
- **Architecture choices** (stack, database, hosting)
- **Data handling and logging**
- **Error handling and testing plan**
- **UI/UX considerations** (dashboards, roles, RTL)
