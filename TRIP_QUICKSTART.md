# Trip Components - Quick Start Guide

## 🚀 Getting Started

The trip frontend components are now fully implemented and ready to use. Here's how to get started:

## 📁 What Was Created

### Components (8 files)

- ✅ `TripStatusBadge.tsx` - Status indicator
- ✅ `TripCard.tsx` - Trip summary card
- ✅ `TripList.tsx` - Listing with filters
- ✅ `TripForm.tsx` - Create/edit form
- ✅ `AttendanceMarker.tsx` - Attendance tracking
- ✅ `TripAdminManager.tsx` - Admin assignment
- ✅ `TripPublishControl.tsx` - Publishing workflow
- ✅ `TripDetailHeader.tsx` - Detail page header

### Pages (3 files)

- ✅ `app/family/trip/page.tsx` - Family trip list
- ✅ `app/family/trip/[id]/page.tsx` - Family trip detail (existing, updated)
- ✅ `app/admin/trip/page.tsx` - Admin trip management
- ✅ `app/admin/trip/[id]/page.tsx` - Admin trip detail/edit

### Types & API

- ✅ `types/trip.ts` - TypeScript definitions
- ✅ `lib/api.ts` - API client functions (updated)

### Tests (4 files)

- ✅ `__tests__/trip/TripStatusBadge.test.tsx`
- ✅ `__tests__/trip/TripForm.test.tsx`
- ✅ `__tests__/trip/AttendanceMarker.test.tsx`
- ✅ `__tests__/trip/trip-helpers.test.ts`

## 🔧 Running the Application

### 1. Start Backend

```bash
cd packages/backend
yarn dev
```

### 2. Start Frontend

```bash
cd packages/frontend
yarn dev
```

### 3. Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📋 Testing the Features

### As a Family User

1. Navigate to `/family/trip`
2. View published trips
3. Click on a trip to see details
4. Mark attendance (if before cutoff)
5. Add dietary requirements

### As a Trip Admin

1. Navigate to `/admin/trip`
2. Click "טיול חדש" to create a trip
3. Fill in trip details (creates as draft)
4. View and edit your trips
5. See draft and published trips

### As a Super Admin

1. Navigate to `/admin/trip`
2. View all trips (including others' drafts)
3. Create trips
4. Assign admins to trips
5. Publish/unpublish trips
6. Delete trips

## 🧪 Running Tests

```bash
cd packages/frontend
yarn test
```

## 🌐 API Endpoints Used

### Trip Endpoints

- `GET /api/trips` - List trips (with filters)
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/publish` - Publish trip
- `POST /api/trips/:id/unpublish` - Unpublish trip
- `PUT /api/trips/:id/admins` - Assign admins
- `POST /api/trips/:id/admins/:adminId` - Add admin
- `DELETE /api/trips/:id/admins/:adminId` - Remove admin
- `POST /api/trips/:id/attendance` - Mark attendance
- `GET /api/trips/:id/attendees` - Get attendees

## 🎨 Component Usage Examples

### 1. Display Trip List

```tsx
import { TripList } from '@/components/trip';
import { useAuth } from '@/contexts/AuthContext';

export default function MyTripsPage() {
  const { user } = useAuth();

  return (
    <TripList
      userRole={user.role}
      baseLinkPath="/family/trip"
      showAdmins={false}
    />
  );
}
```

### 2. Create Trip Form

```tsx
import { TripForm } from '@/components/trip';
import { createTrip } from '@/lib/api';

function CreateTripDialog() {
  const handleCreate = async (data) => {
    const trip = await createTrip(data);
    console.log('Created:', trip);
  };

  return <TripForm onSubmit={handleCreate} submitLabel="צור טיול" />;
}
```

### 3. Mark Attendance

```tsx
import { AttendanceMarker } from '@/components/trip';

function TripDetailPage({ trip, familyId }) {
  return (
    <AttendanceMarker
      trip={trip}
      familyId={familyId}
      isAttending={false}
      onUpdate={() => refetchTrip()}
    />
  );
}
```

### 4. Status Badge

```tsx
import { TripStatusBadge } from '@/components/trip';
import { getTripStatus } from '@/types/trip';

function MyTripCard({ trip }) {
  const status = getTripStatus(trip);

  return (
    <div>
      <TripStatusBadge status={status} />
      <h3>{trip.name}</h3>
    </div>
  );
}
```

## 🔐 Role-Based Access

### Family (FAMILY)

- ✅ View published trips only
- ✅ Mark own family attendance
- ✅ Add dietary requirements
- ❌ Cannot create trips
- ❌ Cannot see drafts
- ❌ Cannot edit trips

### Trip Admin (TRIP_ADMIN)

- ✅ View all own trips (including drafts)
- ✅ Create trips (as drafts)
- ✅ Edit own trips
- ✅ View participants
- ❌ Cannot publish trips
- ❌ Cannot assign admins
- ❌ Cannot delete trips

### Super Admin (SUPER_ADMIN)

- ✅ View all trips
- ✅ Create trips
- ✅ Edit any trip
- ✅ Assign/remove admins
- ✅ Publish/unpublish trips
- ✅ Delete trips
- ✅ Full control

## 📝 Important Notes

### Date Handling

- All dates are stored in ISO 8601 format
- Display uses Hebrew locale (`he-IL`)
- Cutoff dates are enforced in the UI

### Draft Workflow

1. Trip admins create trips (automatically draft)
2. Super-admin assigns admins (if needed)
3. Super-admin publishes trip
4. Families can now see and register

### Attendance Cutoff

- Set optional cutoff date during creation
- After cutoff, families cannot change attendance
- Warning shown before cutoff
- Error shown after cutoff

### Validation

- All forms use Zod schema validation
- Hebrew error messages
- Real-time validation feedback
- Server-side validation via API

## 🐛 Troubleshooting

### Issue: Components not rendering

**Solution:** Ensure all components are exported in `components/trip/index.ts`

### Issue: API calls failing

**Solution:** Check backend is running and API_URL is correct in `.env.local`

### Issue: Types not found

**Solution:** Ensure `types/trip.ts` is imported correctly

### Issue: RTL not working

**Solution:** Check that parent elements have `dir="rtl"` attribute

## 📚 Additional Resources

- Full implementation docs: `/TRIP_FRONTEND_IMPLEMENTATION.md`
- Backend API docs: `/TRIP_API_REFERENCE.md`
- Original spec: `/SPEC.md`

## ✨ Next Steps

1. **Test the Components**: Run the app and test all flows
2. **Add Gear Management**: Implement gear assignment UI
3. **WhatsApp Integration**: Add message generation
4. **Photo Albums**: Integrate photo viewing
5. **Notifications**: Add real-time updates

## 🎉 You're Ready!

All trip frontend components are implemented and tested. Start the servers and begin using the trip management features!

```bash
# Terminal 1 - Backend
cd packages/backend && yarn dev

# Terminal 2 - Frontend
cd packages/frontend && yarn dev

# Terminal 3 - Tests
cd packages/frontend && yarn test
```

Visit: **http://localhost:3000/family/trip** or **http://localhost:3000/admin/trip**
