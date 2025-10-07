# Family Management System

## Overview

The Family Management System provides comprehensive functionality for managing families, family members, and their relationships within the community trip organizer application. All components are built with Hebrew language support and RTL (Right-to-Left) layout.

## Features

### 1. Family Registration
- **Component**: `FamilyRegistrationForm`
- **Purpose**: Allow new families to register with the system
- **Features**:
  - Add multiple adults (at least one required)
  - Add children with age tracking (optional)
  - Password hashing for security
  - Email validation
  - Hebrew form labels and error messages
  - RTL layout support

### 2. Family Profile Management
- **Components**: `FamilyProfileView`, `FamilyProfileEdit`
- **Purpose**: View and edit family information
- **Features**:
  - Display family name and status
  - Show member count breakdown (adults/children)
  - Edit family name
  - View creation date
  - Status badges (Approved/Pending)

### 3. Adults Management
- **Component**: `AdultsManagement`
- **Purpose**: Manage adult family members
- **Features**:
  - Add new adults with email and password
  - Edit adult information (name, email, photo)
  - Remove adults (with minimum 1 adult validation)
  - Display member roles
  - Profile photo support

### 4. Children Management
- **Component**: `ChildrenManagement`
- **Purpose**: Manage child family members with age tracking
- **Features**:
  - Add children with name and age (0-18)
  - Edit child information
  - Remove children
  - Age-based categorization badges (תינוק/ילד/נער)
  - Automatic age calculation display

### 5. Family Dashboard
- **Component**: `FamilyDashboard`
- **Purpose**: Centralized dashboard for family members
- **Features**:
  - Tabbed interface (Overview/Adults/Children)
  - Quick statistics display
  - Status alerts (pending approval, approved, inactive)
  - Integrated profile editing
  - Member management

### 6. Family Approval Interface (Super Admin)
- **Component**: `FamilyApprovalInterface`
- **Purpose**: Allow super-admins to manage family registrations
- **Features**:
  - Approve pending families
  - Deactivate/Reactivate families
  - Delete families permanently
  - Grouped by status (Pending/Approved/Inactive)
  - Confirmation dialogs for actions
  - Detailed family information display

### 7. Family Listing (Admin)
- **Component**: `FamilyListing`
- **Purpose**: Browse and filter all families
- **Features**:
  - Search by family name or member name/email
  - Filter by status (Pending/Approved)
  - Filter by active status
  - Sortable table display
  - Quick statistics cards
  - View family details

## API Integration

All components use the centralized API client (`lib/api.ts`) with the following endpoints:

### Family Endpoints
- `POST /api/families` - Create family
- `GET /api/families` - Get all families (with filters)
- `GET /api/families/:id` - Get family by ID
- `PUT /api/families/:id` - Update family
- `POST /api/families/:id/approve` - Approve family
- `POST /api/families/:id/deactivate` - Deactivate family
- `POST /api/families/:id/reactivate` - Reactivate family
- `DELETE /api/families/:id` - Delete family

### Member Endpoints
- `GET /api/families/:id/members` - Get all members
- `GET /api/families/:id/adults` - Get adult members
- `GET /api/families/:id/children` - Get child members
- `POST /api/families/:id/members` - Add member
- `PUT /api/families/:id/members/:memberId` - Update member
- `DELETE /api/families/:id/members/:memberId` - Remove member

## Data Models

### Family
```typescript
interface Family {
  id: string
  name?: string
  status: 'PENDING' | 'APPROVED'
  isActive: boolean
  createdAt: string
  updatedAt: string
  members: FamilyMember[]
}
```

### FamilyMember
```typescript
interface FamilyMember {
  id: string
  familyId: string
  type: 'ADULT' | 'CHILD'
  name: string
  age?: number
  email: string
  profilePhotoUrl?: string
  role: 'FAMILY' | 'TRIP_ADMIN' | 'SUPER_ADMIN'
  createdAt: string
  updatedAt: string
}
```

## Validation Schemas

All forms use Zod validation with Hebrew error messages:

- `createFamilySchema` - Family registration validation
- `updateFamilySchema` - Family update validation
- `addMemberSchema` - Add member validation
- `updateMemberSchema` - Update member validation
- `adultSchema` - Adult-specific validation
- `childSchema` - Child-specific validation

## RTL and Hebrew Support

All components include:
- `dir="rtl"` attribute on main containers
- Hebrew text for all labels, buttons, and messages
- Right-aligned layouts
- Proper icon placement for RTL
- Hebrew date formatting using `date-fns` with Hebrew locale

## Usage Examples

### Registering a New Family

```tsx
import { FamilyRegistrationForm } from '@/components/family'

function RegisterPage() {
  return <FamilyRegistrationForm />
}
```

### Viewing Family Dashboard

```tsx
import { FamilyDashboard } from '@/components/family'

function FamilyPage({ familyId }: { familyId: string }) {
  return <FamilyDashboard familyId={familyId} />
}
```

### Super Admin Approval Interface

```tsx
import { FamilyApprovalInterface } from '@/components/family'

function AdminPage() {
  const [families, setFamilies] = useState<Family[]>([])
  
  useEffect(() => {
    loadFamilies()
  }, [])
  
  return (
    <FamilyApprovalInterface 
      families={families} 
      onUpdate={loadFamilies} 
    />
  )
}
```

### Family Listing with Filters

```tsx
import { FamilyListing } from '@/components/family'

function FamiliesPage() {
  return <FamilyListing />
}
```

## Testing

Comprehensive test coverage is provided in:
- `__tests__/family/family.test.ts` - Validation schema tests
- `__tests__/family/family-api.test.ts` - API client tests

Run tests with:
```bash
npm test family
```

## Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt before being sent to the API
2. **Authentication**: All API calls use JWT tokens from the auth context
3. **Authorization**: Role-based access control:
   - `FAMILY` - Can only manage their own family
   - `TRIP_ADMIN` - Can view all families
   - `SUPER_ADMIN` - Can approve/deactivate/delete families
4. **Validation**: Client-side and server-side validation for all inputs
5. **Email Uniqueness**: Server validates email uniqueness

## Accessibility

- Semantic HTML structure
- Proper ARIA labels
- Keyboard navigation support
- Focus management in dialogs
- Screen reader friendly text

## Dependencies

- `react` - UI framework
- `next` - Framework
- `zod` - Schema validation
- `bcryptjs` - Password hashing
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `@radix-ui` - UI primitives (via shadcn/ui)

## Future Enhancements

- [ ] Family photo upload
- [ ] Family history/timeline
- [ ] Email notifications on approval
- [ ] Batch approval for admins
- [ ] Export family list to CSV/Excel
- [ ] Advanced search with multiple criteria
- [ ] Family merge functionality
- [ ] Audit log for family changes
