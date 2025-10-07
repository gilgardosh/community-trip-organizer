# Gear Management Components

A comprehensive set of React components for managing trip gear in the Community Trip Organizer app. All components support Hebrew text and RTL layout.

## Components

### GearList
Main component for displaying all gear items for a trip.

**Props:**
- `tripId: string` - The ID of the trip
- `canManage?: boolean` - Whether the user can create/edit/delete gear items (default: false)

**Features:**
- Lists all gear items for a trip
- Shows gear status indicators
- Allows trip admins to add new gear items
- Handles loading and error states

### GearItem
Individual gear item display with management options.

**Props:**
- `gearItem: GearItemType` - The gear item to display
- `canManage?: boolean` - Whether the user can edit/delete this item
- `onUpdate?: (updatedItem: GearItemType) => void` - Callback when item is updated
- `onDelete?: (deletedId: string) => void` - Callback when item is deleted

**Features:**
- Displays gear name, quantity needed, and assignments
- Shows collapsible list of families who volunteered
- Edit and delete buttons for admins
- Integrated dialogs for editing and deleting

### GearStatusIndicator
Badge showing the assignment status of a gear item.

**Props:**
- `gearItem: GearItem` - The gear item to check status for
- `showIcon?: boolean` - Whether to show status icon (default: true)

**Statuses:**
- **הוקצה במלואו** (Complete) - Green badge, all needed quantity assigned
- **הוקצה חלקית** (Partial) - Orange badge, some quantity assigned
- **לא הוקצה** (Unassigned) - Gray badge, no assignments yet

### GearCreateDialog
Dialog for creating new gear items.

**Props:**
- `tripId: string` - The trip ID to create gear for
- `open: boolean` - Whether dialog is open
- `onOpenChange: (open: boolean) => void` - Callback to control dialog state
- `onCreated: (gearItem: GearItemType) => void` - Callback when item is created

**Features:**
- Form with name and quantity fields
- Validation for required fields
- Success and error toast notifications

### GearEditDialog
Dialog for editing existing gear items.

**Props:**
- `gearItem: GearItemType` - The gear item to edit
- `open: boolean` - Whether dialog is open
- `onOpenChange: (open: boolean) => void` - Callback to control dialog state
- `onUpdated: (gearItem: GearItemType) => void` - Callback when item is updated

**Features:**
- Pre-filled form with current values
- Prevents reducing quantity below already assigned amount
- Validation and toast notifications

### GearDeleteDialog
Confirmation dialog for deleting gear items.

**Props:**
- `gearItem: GearItemType` - The gear item to delete
- `open: boolean` - Whether dialog is open
- `onOpenChange: (open: boolean) => void` - Callback to control dialog state
- `onDeleted: (id: string) => void` - Callback when item is deleted

**Features:**
- Shows warning about existing assignments
- Confirmation before deletion
- Toast notification on success

### GearVolunteerDialog
Dialog for families to volunteer for gear items.

**Props:**
- `gearItem: GearItemType` - The gear item to volunteer for
- `familyId: string` - The family volunteering
- `open: boolean` - Whether dialog is open
- `onOpenChange: (open: boolean) => void` - Callback to control dialog state
- `onUpdated: (gearItem: GearItemType) => void` - Callback when assignment is updated

**Features:**
- Shows remaining quantity available
- Allows updating existing assignments
- Option to remove assignment
- Validates quantity constraints

### GearAssignmentList
Displays list of family assignments for a gear item.

**Props:**
- `assignments: GearAssignment[]` - Array of assignments to display
- `compact?: boolean` - Whether to use compact layout (default: false)

**Features:**
- Shows family name and quantity assigned
- Responsive layout
- Empty state message

### GearSummary
Dashboard showing aggregate statistics for all trip gear.

**Props:**
- `tripId: string` - The trip ID to show summary for

**Features:**
- Total items count
- Fully/partially/unassigned items breakdown
- Overall completion percentage
- Progress bar visualization
- Quantity assigned vs needed

### FamilyGearList
Specialized view for families to see and volunteer for gear.

**Props:**
- `tripId: string` - The trip ID
- `familyId: string` - The family viewing the list

**Features:**
- Shows family's current volunteer commitments
- Lists all available gear items
- Allows volunteering/updating assignments
- Status indicators for each item
- Integrated volunteer dialog

## Usage Examples

### Basic Gear List (Family View)
```tsx
import { FamilyGearList } from '@/components/gear';

function TripGearTab() {
  const { user } = useAuth();
  
  return (
    <FamilyGearList 
      tripId="trip-123" 
      familyId={user.familyId} 
    />
  );
}
```

### Admin Gear Management
```tsx
import { GearList, GearSummary } from '@/components/gear';

function AdminGearPanel({ tripId, isAdmin }: Props) {
  return (
    <div className="space-y-4">
      <GearSummary tripId={tripId} />
      <GearList tripId={tripId} canManage={isAdmin} />
    </div>
  );
}
```

### Standalone Gear Item
```tsx
import { GearItem } from '@/components/gear';

function GearItemCard({ gearItem, canEdit }: Props) {
  return (
    <GearItem 
      gearItem={gearItem}
      canManage={canEdit}
      onUpdate={(updated) => console.log('Updated:', updated)}
      onDelete={(id) => console.log('Deleted:', id)}
    />
  );
}
```

## API Integration

All components use the following API functions from `@/lib/api`:

- `getGearItemsByTrip(tripId)` - Fetch all gear items
- `getGearSummary(tripId)` - Get aggregate statistics
- `createGearItem(data)` - Create new gear item
- `updateGearItem(id, data)` - Update gear item
- `deleteGearItem(id)` - Delete gear item
- `assignGear(gearItemId, data)` - Assign gear to family
- `removeGearAssignment(gearItemId, familyId)` - Remove assignment
- `getFamilyGearAssignments(tripId, familyId)` - Get family's assignments

## Type Definitions

All components use types from `@/types/gear`:

```typescript
interface GearItem {
  id: string;
  tripId: string;
  name: string;
  quantityNeeded: number;
  assignments: GearAssignment[];
}

interface GearAssignment {
  id: string;
  gearItemId: string;
  familyId: string;
  quantityAssigned: number;
  family: {
    id: string;
    name?: string;
    members: FamilyMember[];
  };
}
```

## Helper Functions

Available in `@/types/gear`:

- `getTotalQuantityAssigned(gearItem)` - Sum all assignments
- `getRemainingQuantity(gearItem)` - Calculate remaining needed
- `isGearItemFullyAssigned(gearItem)` - Check if fully assigned
- `getGearItemStatus(gearItem)` - Get status: 'complete' | 'partial' | 'unassigned'
- `getFamilyAssignment(gearItem, familyId)` - Get family's assignment
- `canAssignMore(gearItem)` - Check if more can be assigned

## Testing

Comprehensive test suites are available in `__tests__/gear/`:

- `GearList.test.tsx` - Main list component tests
- `GearStatusIndicator.test.tsx` - Status badge tests
- `GearCreateDialog.test.tsx` - Creation dialog tests
- `GearSummary.test.tsx` - Summary dashboard tests
- `FamilyGearList.test.tsx` - Family view tests
- `gear-helpers.test.ts` - Helper function tests

Run tests:
```bash
yarn test gear
```

## Accessibility

All components follow accessibility best practices:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- RTL layout support for Hebrew
- Semantic HTML structure

## Styling

Components use Tailwind CSS and shadcn/ui primitives:
- Responsive design (mobile-first)
- Dark mode support via theme provider
- Consistent spacing and typography
- RTL-aware layouts
