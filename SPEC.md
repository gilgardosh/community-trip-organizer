# Neighborhood Trip Planning App — Full Developer Specification

## 1. **Overview**

A responsive web app to manage neighborhood family trips.

* Supports planning, attendance tracking, dietary requirements, shared gear, and trip schedules.
* Integrates with WhatsApp for notifications (copy/paste message generation).
* Fully in Hebrew with RTL support.
* Roles: Family (participant), Trip Admin, Super-admin.

---

## 2. **Platform & Tech Stack**

* **Frontend:** React + TypeScript
* **Backend:** Node.js + TypeScript (API server)
* **Database:** PostgreSQL
* **Hosting:** Vercel (full stack deployment)
* **Responsive design:** Works on desktop and mobile
* **Localization:** Hebrew only (RTL layout)

---

## 3. **Authentication & Accounts**

* **Login options:**

  * Google OAuth
  * Email/password fallback
  * Optionally Facebook OAuth
* **User profile:**

  * Adults: Name (required), phone/email/photo (optional)
  * Children: Name + age
* **Family accounts:** persistent, editable by members
* **Registration approval:** Super-admin validates new families
* **Logging:** Track logins and all profile/trip changes

---

## 4. **Roles & Permissions**

| Role        | Capabilities                                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| Family      | View trips, mark attendance, update family/child profiles, volunteer for gear                                        |
| Trip Admin  | Manage assigned trip: participants, gear, dietary info, schedule, packing lists; manually trigger WhatsApp reminders |
| Super-admin | Approve trips and trip admins, approve families, delete/deactivate families, view all trips and families             |

* Roles are **hardcoded**; trip admins are **trip-specific**.

---

## 5. **Entities & Relationships**

### 5.1 Family

* Fields: `id`, `name`, `adults[]`, `children[] {name, age}`, `created_at`, `updated_at`
* Linked to trips via attendance and gear assignments.

### 5.2 Trip

* Fields: `id`, `name`, `location`, `dates` (start/end), `description`, `draft` (bool), `attendance_cutoff_date`, `photo_album_link`, `created_at`, `updated_at`
* Relationships:

  * Many-to-many: `Trip ↔ Family` (attendance)
  * One-to-many: `Trip ↔ GearItem`
  * Many-to-many: `Trip ↔ Admin (Family)`

### 5.3 GearItem

* Fields: `id`, `name`, `quantity_needed`, `trip_id`, `assigned_families[] {family_id, quantity_assigned}`

### 5.4 Logs

* Track all login attempts and trip/family changes:

  * `id`, `user_id`, `entity_type`, `entity_id`, `action_type`, `timestamp`, `changes`

---

## 6. **Trip Workflow**

1. **Draft Creation:** Trip admin prepares trip in draft mode (completely hidden).
2. **Trip Publishing:** Super-admin assigns trip admins and publishes trip.
3. **Family Participation:** Families mark attendance (checkbox), input dietary info.
4. **Gear Assignment:** Families volunteer for gear; quantities tracked per family; editable until trip starts.
5. **Reminders:** Admins manually trigger WhatsApp messages for reminders, gear lists, etc.
6. **Trip Completion:** Trips remain read-only after completion.

---

## 7. **Data Handling**

* All data stored in PostgreSQL
* Families’ personal data: visible only as required (names + children ages)
* External links for photos/documents only; no file uploads
* Historical data preserved after family deletion/deactivation

---

## 8. **WhatsApp Integration**

* App **generates message text** for copying into WhatsApp.
* Supports **customizable templates**.
* Automatic triggers: attendance updates, gear updates, trip creation
* Manual triggers: reminders and trip start notifications

---

## 9. **Error Handling**

* **API:** return structured error messages with HTTP status codes:

  * 400: Validation error
  * 401: Unauthorized
  * 403: Forbidden (role-based restriction)
  * 404: Not found
  * 500: Server errors
* **Frontend:** display clear, user-friendly error messages (e.g., “Attendance cutoff has passed”).
* **Database transactions:** wrap critical operations (attendance updates, gear assignment) in transactions to prevent partial updates.

---

## 10. **Testing Plan**

### 10.1 Unit Tests

* Test React components (forms, checkboxes, dashboards)
* Test backend API endpoints for all entities and CRUD operations
* Test authentication flows (Google, email/password)

### 10.2 Integration Tests

* Trip creation and draft workflow
* Attendance marking and cutoff warnings
* Gear assignment and updates
* WhatsApp message generation

### 10.3 End-to-End Tests

* Family registration and admin approval
* Trip participation lifecycle
* Admin actions: trip management, gear assignment, reminders
* Super-admin actions: approve trips/families, delete/deactivate families

### 10.4 Logging Verification

* Confirm all logins and data changes are correctly logged

---

## 11. **Security Considerations**

* Role-based access enforced at API level
* Validate external links to prevent XSS
* Secure password storage (bcrypt/scrypt)
* HTTPS-only communication

---

## 12. **Developer Notes**

* **Database schema**: normalized with proper foreign keys for trip ↔ family ↔ gear relationships
* **State management**: React context or Redux for logged-in user, trip, and family state
* **Responsive UI**: CSS-in-JS or Tailwind with RTL support
* **Deployment:** Vercel full-stack, auto-deploy on git push

---

This specification includes:

* All **functional requirements** (trips, attendance, gear, dietary info, WhatsApp integration)
* **Architecture choices** (stack, database, hosting)
* **Data handling and logging**
* **Error handling and testing plan**
* **UI/UX considerations** (dashboards, roles, RTL)
