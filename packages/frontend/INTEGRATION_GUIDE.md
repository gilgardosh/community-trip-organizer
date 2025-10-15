# Application Integration Guide

## Overview

This guide documents the complete integration of all components in the Community Trip Organizer application. All previously built components now work together seamlessly through a unified architecture.

## Architecture

### Provider Hierarchy

The application uses a layered provider structure to manage global state and functionality:

```tsx
<ErrorBoundary>
  <AuthProvider>
    <NotificationProvider>
      <AppProvider>
        <MainNav />
        {children}
      </AppProvider>
    </NotificationProvider>
  </AuthProvider>
</ErrorBoundary>
```

### Core Contexts

#### 1. **AuthContext** (`/contexts/AuthContext.tsx`)

Manages user authentication state and operations.

**Features:**

- User login/logout
- OAuth integration (Google, Facebook)
- Token management
- Family association
- Auto-refresh on token expiry

**Usage:**

```tsx
const { user, family, isAuthenticated, login, logout } = useAuth();
```

#### 2. **NotificationContext** (`/contexts/NotificationContext.tsx`)

Provides a unified notification system using toast messages.

**Features:**

- Success, error, warning, and info notifications
- Loading states
- Auto-dismiss with configurable duration
- Global notification management

**Usage:**

```tsx
const { showSuccess, showError, showWarning, showInfo } = useNotification();

// Example
showSuccess('הפעולה בוצעה בהצלחה');
showError('אירעה שגיאה');
```

#### 3. **AppContext** (`/contexts/AppContext.tsx`)

Manages application-wide state and refresh triggers.

**Features:**

- Selected trip/family state
- Refresh triggers for data synchronization
- Cross-component communication

**Usage:**

```tsx
const { selectedTrip, setSelectedTrip, refreshTrips, refreshAll } = useApp();
```

## Navigation System

### MainNav Component (`/components/layout/MainNav.tsx`)

Role-based navigation that adapts to user permissions.

**Features:**

- Desktop and mobile responsive
- Role-specific menu items
- User profile dropdown
- Quick access to key features

**Roles and Navigation:**

- **FAMILY**: Home, My Family, Trips
- **TRIP_ADMIN**: All of above + Trip Management, Gear, WhatsApp
- **SUPER_ADMIN**: All of above + Family Management, Activity Log, Admin Panel

## Route Protection

### ProtectedRoute Component (`/components/auth/ProtectedRoute.tsx`)

Ensures proper access control and redirects.

**Features:**

- Authentication verification
- Role-based access control
- Automatic redirects based on user role
- Loading states during authentication check

**Usage:**

```tsx
<ProtectedRoute allowedRoles={['TRIP_ADMIN', 'SUPER_ADMIN']}>
  <AdminComponent />
</ProtectedRoute>
```

## Data Management

### Custom Hooks

#### useData (`/hooks/use-data.ts`)

Advanced data fetching with auto-refresh and caching.

**Features:**

- Automatic data fetching
- Configurable auto-refresh intervals
- Error handling
- Loading states
- Success/error notifications

**Usage:**

```tsx
const { data, isLoading, error, refresh } = useData(() => getTrips(), {
  autoRefresh: true,
  refreshInterval: 60000, // 60 seconds
  showErrorToast: true,
});
```

#### useMutation (`/hooks/use-data.ts`)

Handle data mutations with proper state management.

**Usage:**

```tsx
const { mutate, isLoading } = useMutation((data) => createTrip(data), {
  showSuccessToast: true,
  successMessage: 'טיול נוצר בהצלחה',
  onSuccess: () => refreshTrips(),
});
```

## Dashboard Components

### Family Dashboard (`/components/dashboard/FamilyDashboard.tsx`)

Main dashboard for family users showing:

- Upcoming trips
- Family members
- Participation history
- Gear commitments

### Trip Admin Dashboard (`/components/dashboard/TripAdminDashboard.tsx`)

Admin dashboard showing:

- Managed trips
- Participant statistics
- Gear assignments
- WhatsApp message history
- Quick actions

## Loading States

### Loading Components (`/components/layout/LoadingStates.tsx`)

Reusable loading components for better UX:

- `LoadingCard`: Card skeleton
- `LoadingTable`: Table skeleton
- `LoadingList`: List skeleton
- `LoadingSpinner`: Spinner component
- `LoadingPage`: Full page skeleton
- `LoadingDashboard`: Dashboard skeleton

**Usage:**

```tsx
if (isLoading) {
  return <LoadingDashboard />;
}
```

## Error Handling

### ErrorBoundary (`/components/layout/ErrorBoundary.tsx`)

Global error catching and graceful degradation.

**Features:**

- Catches React component errors
- User-friendly error messages
- Reset functionality
- Development mode error details

**Usage:**

```tsx
<ErrorBoundary onError={(error) => console.error(error)}>
  <App />
</ErrorBoundary>
```

## Integration Patterns

### 1. **Component to Component Communication**

Use AppContext for cross-component state:

```tsx
// Component A
const { setSelectedTrip } = useApp();
setSelectedTrip(trip);

// Component B
const { selectedTrip } = useApp();
// Use selectedTrip
```

### 2. **Data Refresh Synchronization**

Trigger refreshes across the application:

```tsx
const { refreshTrips, refreshGear } = useApp();

// After updating a trip
await updateTrip(id, data);
refreshTrips();
refreshGear(); // Refresh related gear
```

### 3. **Error Notification**

Consistent error handling:

```tsx
const { showError } = useNotification();

try {
  await someOperation();
} catch (error) {
  showError(error.message || 'אירעה שגיאה');
}
```

### 4. **Loading States**

Show loading indicators during async operations:

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await submitData();
    showSuccess('נשמר בהצלחה');
  } finally {
    setIsLoading(false);
  }
};
```

## Testing

Integration tests verify that all components work together:

### Test Files

- `__tests__/integration/context-integration.test.tsx`
- `__tests__/integration/navigation-flow.test.tsx`
- `__tests__/integration/complete-flow.test.tsx`

### Running Tests

```bash
cd packages/frontend
yarn test
```

## Best Practices

### 1. **Always Use Contexts**

Access shared state through contexts rather than prop drilling:

```tsx
// Good
const { user } = useAuth();

// Avoid
<Component user={user} family={family} notifications={...} />
```

### 2. **Handle Errors Gracefully**

Always provide user feedback:

```tsx
try {
  await operation();
  showSuccess('הצלחה');
} catch (error) {
  showError('שגיאה: ' + error.message);
}
```

### 3. **Use Loading States**

Provide visual feedback during async operations:

```tsx
if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
return <Content data={data} />;
```

### 4. **Refresh Data Appropriately**

Use refresh triggers to keep data synchronized:

```tsx
useEffect(() => {
  refresh();
}, [refreshTriggers.trips]);
```

### 5. **Protect Routes**

Always wrap protected pages with ProtectedRoute:

```tsx
<ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
  <AdminPage />
</ProtectedRoute>
```

## File Structure

```
packages/frontend/
├── contexts/
│   ├── AuthContext.tsx          # Authentication state
│   ├── NotificationContext.tsx  # Notifications
│   └── AppContext.tsx           # App-wide state
├── components/
│   ├── layout/
│   │   ├── MainNav.tsx          # Navigation
│   │   ├── LoadingStates.tsx   # Loading components
│   │   └── ErrorBoundary.tsx   # Error handling
│   ├── dashboard/
│   │   ├── FamilyDashboard.tsx
│   │   └── TripAdminDashboard.tsx
│   └── auth/
│       └── ProtectedRoute.tsx  # Route protection
├── hooks/
│   └── use-data.ts             # Data fetching hooks
└── app/
    └── layout.tsx              # Root layout with providers
```

## API Integration

All API calls go through centralized functions in `/lib/api.ts`:

```tsx
import { getTrips, createTrip, updateTrip } from '@/lib/api';

// Fetch data
const trips = await getTrips();

// Create
const newTrip = await createTrip(data);

// Update
const updated = await updateTrip(id, data);
```

## Deployment Checklist

- [x] All contexts properly configured
- [x] Navigation works for all roles
- [x] Error boundaries in place
- [x] Loading states implemented
- [x] Protected routes configured
- [x] Data refresh mechanisms working
- [x] Integration tests passing
- [x] Notifications system functional

## Troubleshooting

### Issue: Context not available

**Solution**: Ensure component is wrapped in the provider:

```tsx
<AuthProvider>
  <YourComponent />
</AuthProvider>
```

### Issue: Navigation not updating

**Solution**: Check that MainNav is inside AuthProvider:

```tsx
<AuthProvider>
  <MainNav />
  {children}
</AuthProvider>
```

### Issue: Data not refreshing

**Solution**: Use refresh triggers:

```tsx
const { refreshTrips } = useApp();
// After update
refreshTrips();
```

## Next Steps

1. Add performance monitoring
2. Implement offline support
3. Add analytics tracking
4. Enhance error logging
5. Add user activity tracking

## Support

For questions or issues, refer to:

- Main specification: `/SPEC.md`
- API reference: `/TRIP_API_REFERENCE.md`
- Component documentation in individual files
