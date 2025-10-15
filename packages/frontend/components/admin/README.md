# Admin Components Documentation

## Overview

The admin components provide comprehensive management functionality for the super-admin dashboard. All components are designed with Hebrew RTL support and follow the system's design patterns.

## Components

### 1. UserRoleManagement

**Path:** `/components/admin/UserRoleManagement.tsx`

**Purpose:** Manage user roles and permissions across the system.

**Features:**

- Display all users with their current roles
- Search and filter users
- Update user roles (FAMILY, TRIP_ADMIN, SUPER_ADMIN)
- Role badge visualization
- Confirmation dialogs for role changes

**Usage:**

```tsx
import { UserRoleManagement } from '@/components/admin';

<UserRoleManagement />;
```

**API Dependencies:**

- `getAllUsers()` - Fetches all users
- `updateUserRole(userId, data)` - Updates a user's role

---

### 2. FamilyApprovalWorkflow

**Path:** `/components/admin/FamilyApprovalWorkflow.tsx`

**Purpose:** Approve or reject pending family registrations.

**Features:**

- Display pending families
- Individual and bulk approval
- Family rejection
- Member count display
- Date-based sorting

**Usage:**

```tsx
import { FamilyApprovalWorkflow } from '@/components/admin';

<FamilyApprovalWorkflow />;
```

**API Dependencies:**

- `getPendingFamilies()` - Fetches pending families
- `adminApproveFamily(familyId)` - Approves a single family
- `bulkApproveFamilies(data)` - Approves multiple families
- `adminDeactivateFamily(familyId)` - Rejects a family

---

### 3. TripAdminAssignment

**Path:** `/components/admin/TripAdminAssignment.tsx`

**Purpose:** Assign and manage trip administrators for specific trips.

**Features:**

- Display current trip admins
- Multi-select admin assignment
- Remove admins from trips
- Filter eligible users (adults with TRIP_ADMIN or SUPER_ADMIN role)

**Usage:**

```tsx
import { TripAdminAssignment } from '@/components/admin';

<TripAdminAssignment trip={tripData} onUpdate={handleTripUpdate} />;
```

**Props:**

- `trip: Trip` - The trip object
- `onUpdate: () => void` - Callback when admins are updated

**API Dependencies:**

- `getAllUsers()` - Fetches all users
- `adminAssignTripAdmins(tripId, adminIds)` - Assigns multiple admins
- `adminRemoveTripAdmin(tripId, adminId)` - Removes an admin

---

### 4. ActivityLogsViewer

**Path:** `/components/admin/ActivityLogsViewer.tsx`

**Purpose:** View and filter system activity logs.

**Features:**

- Display all system activities
- Filter by entity type (TRIP, FAMILY, USER, etc.)
- Filter by action type (CREATE, UPDATE, DELETE, etc.)
- Search by user or entity ID
- Formatted timestamps

**Usage:**

```tsx
import { ActivityLogsViewer } from '@/components/admin';

<ActivityLogsViewer />;
```

**API Dependencies:**

- `getActivityLogs(filters)` - Fetches activity logs with optional filters

---

### 5. FamilyDeactivationControls

**Path:** `/components/admin/FamilyDeactivationControls.tsx`

**Purpose:** Control family activation status and permanent deletion.

**Features:**

- View family status
- Deactivate/reactivate families
- Permanent family deletion
- Confirmation dialogs with warnings
- Status badges

**Usage:**

```tsx
import { FamilyDeactivationControls } from '@/components/admin';

<FamilyDeactivationControls
  family={familyData}
  onUpdate={handleFamilyUpdate}
/>;
```

**Props:**

- `family: Family` - The family object
- `onUpdate: () => void` - Callback when family is updated

**API Dependencies:**

- `adminDeactivateFamily(familyId)` - Deactivates a family
- `adminReactivateFamily(familyId)` - Reactivates a family
- `adminDeleteFamily(familyId)` - Permanently deletes a family

---

### 6. SystemReporting

**Path:** `/components/admin/SystemReporting.tsx`

**Purpose:** Display comprehensive system statistics and reports.

**Features:**

- Overview metrics cards
- Family statistics with growth charts
- Trip statistics with monthly breakdown
- Average calculations
- Visual data representations

**Usage:**

```tsx
import { SystemReporting } from '@/components/admin';

<SystemReporting />;
```

**API Dependencies:**

- `getDashboardMetrics()` - Fetches dashboard metrics
- `getSystemSummary()` - Fetches system summary
- `getTripStats()` - Fetches trip statistics
- `getFamilyStats()` - Fetches family statistics

---

### 7. DataExport

**Path:** `/components/admin/DataExport.tsx`

**Purpose:** Export system data for backup or analysis.

**Features:**

- Select data type (all, families, trips, users, logs)
- Choose format (JSON, CSV)
- Download generated files
- Export summary preview
- Security warnings

**Usage:**

```tsx
import { DataExport } from '@/components/admin';

<DataExport />;
```

**API Dependencies:**

- `exportData(request)` - Generates and returns export data

---

## Common Patterns

### Hebrew RTL Support

All components support Hebrew RTL layout:

- Text alignment is right-to-left
- Icons are positioned to the left of text
- Dialogs and modals are RTL-aware
- Date formatting uses Hebrew locale

### Loading States

All components implement loading states:

```tsx
{loading ? (
  <Loader2 className="h-6 w-6 animate-spin" />
) : (
  // Component content
)}
```

### Error Handling

Components use the toast system for error notifications:

```tsx
const { toast } = useToast();

toast({
  title: 'שגיאה',
  description: 'הודעת שגיאה',
  variant: 'destructive',
});
```

### Confirmation Dialogs

Critical actions use confirmation dialogs:

```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>כותרת אישור</DialogTitle>
      <DialogDescription>הודעת אישור מפורטת</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">ביטול</Button>
      <Button onClick={handleConfirm}>אישור</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Testing

All components have comprehensive test coverage in `/__tests__/admin/`:

- `UserRoleManagement.test.tsx`
- `FamilyApprovalWorkflow.test.tsx`
- `ActivityLogsViewer.test.tsx`
- `DataExport.test.tsx`
- `SystemReporting.test.tsx`

Run tests:

```bash
npm test __tests__/admin
```

## Integration

The enhanced super-admin dashboard integrates all components:

**Path:** `/app/super-admin/enhanced/page.tsx`

Access at: `/super-admin/enhanced`

## API Backend Integration

All components connect to the admin API endpoints:

**Base URL:** `/api/admin`

**Endpoints:**

- `GET /users` - Get all users
- `POST /users/:userId/role` - Update user role
- `GET /families/pending` - Get pending families
- `POST /families/bulk-approve` - Bulk approve families
- `POST /families/:familyId/approve` - Approve family
- `POST /families/:familyId/deactivate` - Deactivate family
- `POST /families/:familyId/reactivate` - Reactivate family
- `DELETE /families/:familyId` - Delete family
- `POST /trips/:tripId/admins` - Assign trip admins
- `DELETE /trips/:tripId/admins/:adminId` - Remove trip admin
- `GET /logs` - Get activity logs
- `GET /metrics` - Get dashboard metrics
- `GET /summary` - Get system summary
- `GET /stats/trips` - Get trip statistics
- `GET /stats/families` - Get family statistics
- `POST /export` - Export data

## Security

- All components require SUPER_ADMIN role
- Wrapped in ProtectedRoute component
- API calls include authentication headers
- Sensitive data warnings displayed
- Confirmation for destructive actions

## Future Enhancements

Potential improvements:

- Real-time updates using WebSockets
- Advanced filtering and sorting
- Custom report generation
- Scheduled data exports
- Email notifications for critical events
- Audit trail with detailed change tracking
