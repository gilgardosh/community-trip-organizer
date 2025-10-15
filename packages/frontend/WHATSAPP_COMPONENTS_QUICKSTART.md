# WhatsApp Components - Quick Start Guide

## Overview

The WhatsApp message system allows trip admins to generate and send formatted messages to WhatsApp groups. This guide shows how to integrate the components into your app.

---

## Quick Setup

### 1. Import Components

```tsx
import {
  MessagePreview,
  ManualMessageTrigger,
  MessageHistory,
  TemplateManagement,
} from '@/components/whatsapp';
```

### 2. Basic Usage - Trip Admin Panel

Add WhatsApp messaging to a trip detail page:

```tsx
'use client';

import { ManualMessageTrigger, MessageHistory } from '@/components/whatsapp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TripMessagingPage({
  params,
}: {
  params: { id: string };
}) {
  const tripId = params.id;
  const tripName = 'טיול קיץ 2025'; // Get from your trip data

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">הודעות וואטסאפ</h1>

      <Tabs defaultValue="send" dir="rtl">
        <TabsList>
          <TabsTrigger value="send">שליחה</TabsTrigger>
          <TabsTrigger value="history">היסטוריה</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-6">
          <ManualMessageTrigger tripId={tripId} tripName={tripName} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <MessageHistory tripId={tripId} tripName={tripName} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 3. Super Admin - Template Management

```tsx
'use client';

import { TemplateManagement } from '@/components/whatsapp';

export default function AdminTemplatesPage() {
  return (
    <div className="container mx-auto p-6">
      <TemplateManagement canEdit={true} />
    </div>
  );
}
```

---

## Common Scenarios

### Scenario 1: Send Trip Reminder

1. Navigate to trip messaging page
2. Select "תזכורת לטיול" from message type dropdown
3. Enter number of days until trip (e.g., 7)
4. Click "צור הודעה"
5. Click "העתק" to copy message
6. Paste in WhatsApp group

### Scenario 2: Send Attendance Update

1. Go to trip messaging page
2. Select "עדכון נוכחות"
3. Click "צור הודעה"
4. System generates list of attending families
5. Copy and paste to WhatsApp

### Scenario 3: Send Gear Assignment List

1. Navigate to trip messaging
2. Select "הקצאת ציוד"
3. Click "צור הודעה"
4. System generates gear list with family assignments
5. Copy and paste to WhatsApp

### Scenario 4: Create Custom Template

**Super Admin Only**

1. Go to template management page
2. Click "תבנית חדשה"
3. Enter template name and select event type
4. Write template content with variables
5. Click on variable badges to insert them
6. Save template

---

## Variable System

Templates use `{variableName}` syntax for dynamic content.

### Available Variables by Event Type

**TRIP_CREATED**

- `{tripName}` - שם הטיול
- `{location}` - מיקום
- `{startDate}` - תאריך התחלה
- `{endDate}` - תאריך סיום
- `{description}` - תיאור
- `{admins}` - מנהלים

**TRIP_REMINDER**

- `{tripName}` - שם הטיול
- `{location}` - מיקום
- `{startDate}` - תאריך התחלה
- `{daysUntilTrip}` - ימים עד הטיול

**ATTENDANCE_UPDATE**

- `{tripName}` - שם הטיול
- `{attendeeCount}` - מספר משתתפים
- `{attendeeList}` - רשימת משתתפים

**GEAR_ASSIGNMENT**

- `{tripName}` - שם הטיול
- `{gearList}` - רשימת ציוד

### Example Template

```
⏰ תזכורת לטיול!

🎯 {tripName}
📍 מיקום: {location}
📅 תאריך יציאה: {startDate}

⌛ נותרו {daysUntilTrip} ימים!

נא לוודא שיש לכם את כל הציוד הנדרש.
נתראה בטיול! 🎉
```

---

## Integration with Trip Pages

### Add WhatsApp Tab to Trip Detail Page

```tsx
// app/admin/trips/[id]/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ManualMessageTrigger, MessageHistory } from '@/components/whatsapp';

export default function TripDetailPage({ params }: { params: { id: string } }) {
  // ... your existing trip logic

  return (
    <div>
      <Tabs defaultValue="details" dir="rtl">
        <TabsList>
          <TabsTrigger value="details">פרטים</TabsTrigger>
          <TabsTrigger value="attendees">משתתפים</TabsTrigger>
          <TabsTrigger value="gear">ציוד</TabsTrigger>
          <TabsTrigger value="whatsapp">וואטסאפ</TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp">
          <div className="space-y-6">
            <ManualMessageTrigger tripId={params.id} tripName={trip.name} />
            <MessageHistory tripId={params.id} tripName={trip.name} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Quick Message Button

Add a quick action button to generate reminder:

```tsx
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ManualMessageTrigger } from '@/components/whatsapp';

export function QuickWhatsAppButton({
  tripId,
  tripName,
}: {
  tripId: string;
  tripName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline">
        <MessageSquare className="ml-2 h-4 w-4" />
        שלח וואטסאפ
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>שלח הודעת וואטסאפ</DialogTitle>
          </DialogHeader>
          <ManualMessageTrigger tripId={tripId} tripName={tripName} />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## Permissions

Check user permissions before showing components:

```tsx
import { useAuth } from '@/contexts/AuthContext';

export default function WhatsAppSection({ tripId }: { tripId: string }) {
  const { user } = useAuth();

  // Check if user is trip admin or super admin
  const canSendMessages =
    user?.role === 'TRIP_ADMIN' || user?.role === 'SUPER_ADMIN';

  if (!canSendMessages) {
    return <div>אין הרשאה</div>;
  }

  return <ManualMessageTrigger tripId={tripId} tripName="..." />;
}
```

---

## API Requirements

Ensure backend API is running and accessible:

```bash
# Backend should be running on
http://localhost:3001

# Required endpoints:
POST /api/whatsapp/trip/:tripId/reminder
POST /api/whatsapp/trip/:tripId/attendance
POST /api/whatsapp/trip/:tripId/gear
GET  /api/whatsapp/trip/:tripId/messages
GET  /api/whatsapp/templates
POST /api/whatsapp/templates (Super Admin)
```

---

## Styling & Theme

Components use your app's theme configuration:

```tsx
// Ensure ThemeProvider wraps your app
import { ThemeProvider } from '@/components/theme-provider';

<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>;
```

---

## Error Handling

Components include built-in error handling with toast notifications:

```tsx
// Errors are automatically shown via useToast()
// Example: API failure shows error toast
// Example: Clipboard failure shows error toast
```

---

## Testing

Run component tests:

```bash
npm test whatsapp.test.tsx
```

---

## Troubleshooting

### Message not copying to clipboard

**Problem:** Copy button doesn't work

**Solutions:**

1. Ensure HTTPS (clipboard API requires secure context)
2. Check browser permissions
3. Try different browser

### Template variables not replacing

**Problem:** Variables like `{tripName}` not being replaced

**Solutions:**

1. Verify trip has all required data
2. Check template uses correct variable names
3. Ensure backend API is returning populated data

### Templates not loading

**Problem:** Template list is empty or fails to load

**Solutions:**

1. Check backend API is running
2. Verify user has correct permissions
3. Run database seed to create default templates:
   ```bash
   cd packages/backend
   npm run db:seed
   ```

### Permission denied errors

**Problem:** 403 Forbidden errors

**Solutions:**

1. Verify user is logged in
2. Check user has TRIP_ADMIN or SUPER_ADMIN role
3. For trip-specific actions, verify user is admin of that trip

---

## Best Practices

1. **Always test messages** before sending to WhatsApp group
2. **Use emoji** to make messages more readable
3. **Keep messages concise** - WhatsApp works best with shorter messages
4. **Create templates** for frequently sent messages
5. **Check message history** before sending duplicates
6. **Preview variables** to ensure correct data is showing

---

## Next Steps

1. ✅ Set up basic message sending
2. ✅ Create custom templates
3. ✅ Test all message types
4. ⬜ Set up automated triggers (future feature)
5. ⬜ Configure message scheduling (future feature)

---

## Support

For issues or questions:

- Check component README: `/components/whatsapp/README.md`
- Review backend documentation: `/packages/backend/WHATSAPP_QUICKSTART.md`
- Run tests to verify setup: `npm test whatsapp.test.tsx`
