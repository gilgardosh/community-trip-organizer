# WhatsApp Message Components

This directory contains all frontend components for managing WhatsApp messages in the Community Trip Organizer application.

## Components Overview

### 1. MessagePreview

**Purpose:** Display formatted WhatsApp message with copy-to-clipboard functionality

**Props:**

- `content: string` - The message content to display
- `title?: string` - Optional title for the preview card (default: "תצוגה מקדימה")
- `className?: string` - Additional CSS classes
- `showCopyButton?: boolean` - Whether to show copy button (default: true)

**Features:**

- Formatted message display with RTL support
- One-click copy to clipboard
- Visual feedback when copied
- Preserves message formatting (emoji, line breaks, etc.)

**Usage:**

```tsx
import { MessagePreview } from '@/components/whatsapp';

<MessagePreview
  content="🎯 טיול קיץ 2025\n📅 תאריך: 1 בדצמבר 2025"
  title="הודעת תזכורת"
  showCopyButton={true}
/>;
```

---

### 2. TemplateEditor

**Purpose:** Form for creating and editing WhatsApp message templates

**Props:**

- `initialData?: object` - Initial values for edit mode
- `mode: 'create' | 'edit'` - Editor mode
- `onSubmit: (data) => Promise<void>` - Submit handler
- `onCancel?: () => void` - Cancel handler

**Features:**

- Create/edit mode support
- Event type selection with variable hints
- Click-to-insert variable system
- Active/inactive toggle
- RTL text input
- Form validation

**Usage:**

```tsx
import { TemplateEditor } from '@/components/whatsapp';

<TemplateEditor
  mode="create"
  onSubmit={async (data) => {
    await createWhatsAppTemplate(data);
  }}
  onCancel={() => setIsOpen(false)}
/>;
```

---

### 3. ManualMessageTrigger

**Purpose:** Interface for manually triggering WhatsApp messages

**Props:**

- `tripId: string` - The trip ID
- `tripName: string` - The trip name for display

**Features:**

- Message type selector
- Dynamic fields based on message type (e.g., days until trip)
- Message generation with loading state
- Error handling
- Automatic preview after generation
- Copy to clipboard integration

**Usage:**

```tsx
import { ManualMessageTrigger } from '@/components/whatsapp';

<ManualMessageTrigger tripId="trip-123" tripName="טיול קיץ 2025" />;
```

---

### 4. MessageHistory

**Purpose:** Display history of generated WhatsApp messages for a trip

**Props:**

- `tripId: string` - The trip ID
- `tripName: string` - The trip name for display

**Features:**

- Chronological message list
- Filter by event type
- Click to view full message
- Shows trigger type (manual/automatic)
- Display sender and timestamp
- Message detail view with metadata

**Usage:**

```tsx
import { MessageHistory } from '@/components/whatsapp';

<MessageHistory tripId="trip-123" tripName="טיול קיץ 2025" />;
```

---

### 5. TemplateManagement

**Purpose:** Complete template management interface for Super Admins

**Props:**

- `canEdit?: boolean` - Whether user can create/edit/delete templates (default: false)

**Features:**

- Grid view of all templates
- Create new templates
- Edit existing templates
- Delete templates with confirmation
- Toggle active/inactive status
- Filter by event type
- Template preview
- Permission-based UI (Super Admin only can edit)

**Usage:**

```tsx
import { TemplateManagement } from '@/components/whatsapp';

// Super Admin view
<TemplateManagement canEdit={true} />

// Trip Admin view (read-only)
<TemplateManagement canEdit={false} />
```

---

### 6. AutomatedMessagePreview

**Purpose:** Preview automated messages that will be triggered on events

**Props:**

- `eventType: MessageEventType` - Type of event
- `tripName: string` - The trip name
- `previewData: Record<string, string>` - Variable values for preview
- `templateContent: string` - The template content

**Features:**

- Variable replacement preview
- Toggle show/hide preview
- Event type badge
- Info about when message will be sent
- Real-time variable substitution

**Usage:**

```tsx
import { AutomatedMessagePreview } from '@/components/whatsapp';

<AutomatedMessagePreview
  eventType="TRIP_REMINDER"
  tripName="טיול קיץ 2025"
  previewData={{
    tripName: 'טיול קיץ 2025',
    location: 'אילת',
    startDate: '1 בדצמבר 2025',
    daysUntilTrip: '7',
  }}
  templateContent="⏰ תזכורת!\n🎯 {tripName}\n📍 {location}"
/>;
```

---

## Types

### MessageEventType

```typescript
type MessageEventType =
  | 'TRIP_CREATED'
  | 'TRIP_PUBLISHED'
  | 'ATTENDANCE_UPDATE'
  | 'GEAR_ASSIGNMENT'
  | 'TRIP_REMINDER'
  | 'TRIP_START'
  | 'ATTENDANCE_CUTOFF_REMINDER'
  | 'CUSTOM';
```

### WhatsAppTemplate

```typescript
interface WhatsAppTemplate {
  id: string;
  name: string;
  eventType: MessageEventType;
  content: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### WhatsAppMessage

```typescript
interface WhatsAppMessage {
  id: string;
  tripId?: string;
  templateId?: string;
  eventType: MessageEventType;
  content: string;
  triggerType: 'MANUAL' | 'AUTOMATIC';
  generatedById: string;
  generatedBy?: { id: string; name: string };
  trip?: { id: string; name: string };
  template?: { id: string; name: string };
  createdAt: string;
}
```

---

## API Integration

All components use the API functions from `@/lib/api.ts`:

- `createWhatsAppTemplate(data)`
- `getWhatsAppTemplates(eventType?, activeOnly?)`
- `updateWhatsAppTemplate(id, data)`
- `deleteWhatsAppTemplate(id)`
- `generateTripCreatedMessage(tripId)`
- `generateTripPublishedMessage(tripId)`
- `generateAttendanceUpdateMessage(tripId)`
- `generateGearAssignmentMessage(tripId)`
- `generateTripReminderMessage(tripId, daysUntilTrip)`
- `generateTripStartMessage(tripId)`
- `generateAttendanceCutoffReminderMessage(tripId)`
- `getTripWhatsAppMessages(tripId)`

---

## RTL Support

All components support right-to-left (RTL) layout for Hebrew text:

- Text inputs have `dir="rtl"`
- Content is aligned right with `text-right`
- Flexbox layouts use RTL-aware spacing
- Icons positioned correctly for RTL

---

## Hebrew Text

All UI text is in Hebrew:

- Button labels
- Form fields
- Error messages
- Success notifications
- Placeholders
- Helper text

---

## Testing

Comprehensive test suite in `__tests__/whatsapp/whatsapp.test.tsx`:

- Component rendering
- User interactions
- API integration
- Error handling
- RTL support
- Hebrew text verification
- Clipboard functionality
- Form validation

Run tests:

```bash
npm test whatsapp.test.tsx
```

---

## Example Usage

### Complete Dashboard Example

```tsx
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ManualMessageTrigger,
  MessageHistory,
  TemplateManagement,
} from '@/components/whatsapp';

export default function TripWhatsAppPage({ tripId }: { tripId: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ניהול הודעות וואטסאפ</h1>

      <Tabs defaultValue="send" dir="rtl">
        <TabsList>
          <TabsTrigger value="send">שליחת הודעה</TabsTrigger>
          <TabsTrigger value="history">היסטוריה</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <ManualMessageTrigger tripId={tripId} tripName="טיול קיץ 2025" />
        </TabsContent>

        <TabsContent value="history">
          <MessageHistory tripId={tripId} tripName="טיול קיץ 2025" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Super Admin Template Management

```tsx
'use client';

import { TemplateManagement } from '@/components/whatsapp';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminTemplatesPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ניהול תבניות</h1>
      <TemplateManagement canEdit={isSuperAdmin} />
    </div>
  );
}
```

---

## Permissions

| Component               | Family | Trip Admin | Super Admin |
| ----------------------- | ------ | ---------- | ----------- |
| MessagePreview          | ❌     | ✅         | ✅          |
| ManualMessageTrigger    | ❌     | ✅         | ✅          |
| MessageHistory          | ❌     | ✅         | ✅          |
| TemplateManagement      | ❌     | ✅ (read)  | ✅ (full)   |
| TemplateEditor          | ❌     | ❌         | ✅          |
| AutomatedMessagePreview | ❌     | ✅         | ✅          |

---

## Styling

All components use:

- Tailwind CSS for styling
- shadcn/ui components for UI elements
- Custom RTL classes for Hebrew support
- Responsive design (mobile-first)
- Dark mode support via theme-provider

---

## Accessibility

- Semantic HTML elements
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Error announcements

---

## Future Enhancements

Potential improvements:

- Rich text editor for templates
- Template versioning
- Bulk message sending
- Message scheduling
- Analytics (open rates, etc.)
- Multi-language support
- Custom emoji picker
- Template import/export
- Message templates marketplace
