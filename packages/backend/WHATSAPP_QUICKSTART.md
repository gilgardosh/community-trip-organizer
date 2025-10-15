# WhatsApp Message System - Quick Reference

## Quick Start

### 1. Setup

The system is ready to use after running:

```bash
npm run db:seed
```

This creates 8 default Hebrew message templates.

### 2. Generate a Message (Trip Admin)

**Example: Generate trip reminder**

```bash
curl -X POST http://localhost:3000/api/whatsapp/trip/{tripId}/reminder \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"daysUntilTrip": 7}'
```

**Response:**

```json
{
  "content": "⏰ תזכורת טיול!\n\n🎯 טיול קיץ 2025 באילת\n\n📅 תאריך יציאה:\n1 בדצמבר 2025\n\n⌛ נותרו 7 ימים!",
  "messageId": "msg-xyz"
}
```

### 3. Copy & Paste

Copy the `content` field and paste it directly into your WhatsApp group.

## Common Scenarios

### Scenario 1: New Trip Published

```http
POST /api/whatsapp/trip/{tripId}/published
```

Use when: Super admin publishes a trip

### Scenario 2: Attendance Update

```http
POST /api/whatsapp/trip/{tripId}/attendance
```

Use when: You want to share current attendee list

### Scenario 3: Gear Assignment

```http
POST /api/whatsapp/trip/{tripId}/gear
```

Use when: Families have volunteered for gear

### Scenario 4: Pre-Trip Reminder

```http
POST /api/whatsapp/trip/{tripId}/reminder
Body: {"daysUntilTrip": 3}
```

Use when: 3 days before trip starts

### Scenario 5: Trip Starts Today

```http
POST /api/whatsapp/trip/{tripId}/start
```

Use when: Trip day arrives

## Template Variables Reference

| Event Type                 | Available Variables                                         |
| -------------------------- | ----------------------------------------------------------- |
| TRIP_CREATED               | tripName, location, startDate, endDate, description, admins |
| TRIP_PUBLISHED             | tripName, location, startDate, endDate, cutoffDate, admins  |
| ATTENDANCE_UPDATE          | tripName, attendeeCount, attendeeList                       |
| GEAR_ASSIGNMENT            | tripName, gearList                                          |
| TRIP_REMINDER              | tripName, location, startDate, daysUntilTrip                |
| TRIP_START                 | tripName, location, schedule                                |
| ATTENDANCE_CUTOFF_REMINDER | tripName, cutoffDate, daysUntilCutoff                       |
| CUSTOM                     | Any custom variables                                        |

## Tips

1. **Check message history before generating**

   ```http
   GET /api/whatsapp/trip/{tripId}/messages
   ```

2. **Preview variables** - Use GET endpoints to see current trip data

3. **Custom messages** - Use the CUSTOM template with your own variables

4. **Multiple reminders** - Generate reminders at different intervals (7 days, 3 days, 1 day)

## Permissions

| Role        | Can Do                            |
| ----------- | --------------------------------- |
| SUPER_ADMIN | Everything                        |
| TRIP_ADMIN  | Generate messages for their trips |
| FAMILY      | Nothing (no access)               |

## Troubleshooting

**Problem:** "Template not found"

- **Solution:** Check if template is active: `GET /api/whatsapp/templates`

**Problem:** "Trip not found"

- **Solution:** Verify trip ID and that you have access to it

**Problem:** "Variables not replaced"

- **Solution:** Ensure trip has the required data (dates, attendees, etc.)

**Problem:** "Forbidden (403)"

- **Solution:** Check you're a trip admin for this trip

## Example Integration

```typescript
// Frontend component example
async function sendTripReminder(tripId: string, days: number) {
  const response = await fetch(`/api/whatsapp/trip/${tripId}/reminder`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ daysUntilTrip: days }),
  });

  const { content } = await response.json();

  // Copy to clipboard
  navigator.clipboard.writeText(content);

  // Show success message
  alert('Message copied to clipboard! Paste it in WhatsApp.');
}
```

## Default Template Names

1. `Trip Created - Hebrew`
2. `Trip Published - Hebrew`
3. `Attendance Update - Hebrew`
4. `Gear Assignment - Hebrew`
5. `Trip Reminder - Hebrew`
6. `Trip Start - Hebrew`
7. `Attendance Cutoff Reminder - Hebrew`
8. `Custom Message - Hebrew`
