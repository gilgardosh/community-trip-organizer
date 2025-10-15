# WhatsApp Message Generation System

## Overview

The WhatsApp message generation system allows trip administrators to generate formatted messages for copy/paste into WhatsApp groups. The system supports both automatic triggers (on events) and manual generation.

## Features

- **Template-based messaging**: Create and manage reusable message templates
- **Dynamic content insertion**: Replace variables with actual trip/family/gear data
- **Event-driven messages**: Different message types for different events
- **Manual triggers**: Admins can manually generate messages at any time
- **Message history**: Track all generated messages per trip
- **Logging**: All message generation events are logged for audit
- **Hebrew support**: All default templates are in Hebrew with proper RTL formatting

## Message Event Types

1. **TRIP_CREATED**: When a new trip is created
2. **TRIP_PUBLISHED**: When a trip is published (made visible to families)
3. **ATTENDANCE_UPDATE**: When families update their attendance
4. **GEAR_ASSIGNMENT**: When gear is assigned to families
5. **TRIP_REMINDER**: Reminder messages before trip starts
6. **TRIP_START**: Message on the day the trip starts
7. **ATTENDANCE_CUTOFF_REMINDER**: Reminder before attendance cutoff date
8. **CUSTOM**: Custom messages for any purpose

## API Endpoints

### Template Management

#### Create Template (Super Admin Only)

```http
POST /api/whatsapp/templates
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Trip Created - Hebrew",
  "eventType": "TRIP_CREATED",
  "content": "טיול חדש: {tripName} ב{location}\nתאריכים: {startDate} - {endDate}",
  "description": "Template for trip creation"
}
```

#### Get All Templates

```http
GET /api/whatsapp/templates?eventType=TRIP_CREATED&activeOnly=true
Authorization: Bearer {token}
```

#### Get Template by ID

```http
GET /api/whatsapp/templates/{id}
Authorization: Bearer {token}
```

#### Update Template (Super Admin Only)

```http
PUT /api/whatsapp/templates/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Updated content with {variables}",
  "isActive": true
}
```

#### Delete Template (Super Admin Only)

```http
DELETE /api/whatsapp/templates/{id}
Authorization: Bearer {token}
```

### Message Generation

#### Generate Message from Template

```http
POST /api/whatsapp/generate
Authorization: Bearer {token}
Content-Type: application/json

{
  "templateId": "template-id",
  "tripId": "trip-id",
  "variables": {
    "customVar1": "value1",
    "customVar2": "value2"
  },
  "triggerType": "MANUAL"
}
```

#### Generate Trip Created Message

```http
POST /api/whatsapp/trip/{tripId}/created
Authorization: Bearer {token}
Content-Type: application/json

{
  "triggerType": "MANUAL"
}
```

**Variables populated:**

- `tripName`: Trip name
- `location`: Trip location
- `startDate`: Formatted start date
- `endDate`: Formatted end date
- `description`: Trip description
- `admins`: Comma-separated admin names

#### Generate Trip Published Message (Super Admin Only)

```http
POST /api/whatsapp/trip/{tripId}/published
Authorization: Bearer {token}
Content-Type: application/json

{
  "triggerType": "MANUAL"
}
```

**Variables populated:**

- `tripName`: Trip name
- `location`: Trip location
- `startDate`: Formatted start date
- `endDate`: Formatted end date
- `cutoffDate`: Attendance cutoff date
- `admins`: Comma-separated admin names

#### Generate Attendance Update Message

```http
POST /api/whatsapp/trip/{tripId}/attendance
Authorization: Bearer {token}
Content-Type: application/json

{
  "triggerType": "MANUAL"
}
```

**Variables populated:**

- `tripName`: Trip name
- `attendeeCount`: Number of attending families
- `attendeeList`: Formatted list of attending families

#### Generate Gear Assignment Message

```http
POST /api/whatsapp/trip/{tripId}/gear
Authorization: Bearer {token}
Content-Type: application/json

{
  "triggerType": "MANUAL"
}
```

**Variables populated:**

- `tripName`: Trip name
- `gearList`: Formatted list of gear items with assignments

#### Generate Trip Reminder Message

```http
POST /api/whatsapp/trip/{tripId}/reminder
Authorization: Bearer {token}
Content-Type: application/json

{
  "daysUntilTrip": 7,
  "triggerType": "MANUAL"
}
```

**Variables populated:**

- `tripName`: Trip name
- `location`: Trip location
- `startDate`: Formatted start date
- `daysUntilTrip`: Number of days until trip

#### Generate Trip Start Message

```http
POST /api/whatsapp/trip/{tripId}/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "triggerType": "MANUAL"
}
```

**Variables populated:**

- `tripName`: Trip name
- `location`: Trip location
- `schedule`: First day's schedule formatted

#### Generate Attendance Cutoff Reminder

```http
POST /api/whatsapp/trip/{tripId}/cutoff-reminder
Authorization: Bearer {token}
Content-Type: application/json

{
  "triggerType": "MANUAL"
}
```

**Variables populated:**

- `tripName`: Trip name
- `cutoffDate`: Formatted cutoff date
- `daysUntilCutoff`: Days until cutoff

### Message History

#### Get Trip Message History

```http
GET /api/whatsapp/trip/{tripId}/messages
Authorization: Bearer {token}
```

#### Get All Messages (Super Admin Only)

```http
GET /api/whatsapp/messages?eventType=TRIP_CREATED
Authorization: Bearer {token}
```

## Response Format

All message generation endpoints return:

```json
{
  "content": "Generated message text with all variables replaced",
  "messageId": "unique-message-id"
}
```

## Variable System

Templates use curly braces `{variableName}` for dynamic content insertion.

### Example Template

```
טיול חדש: {tripName}
מיקום: {location}
תאריכים: {startDate} - {endDate}
```

### After Generation

```
טיול חדש: טיול קיץ 2025
מיקום: אילת
תאריכים: 1 בדצמבר 2025 - 3 בדצמבר 2025
```

## Default Templates

The system includes 8 default Hebrew templates:

1. **Trip Created** - New trip announcement
2. **Trip Published** - Trip publication notification
3. **Attendance Update** - Current attendee list
4. **Gear Assignment** - Gear distribution list
5. **Trip Reminder** - Pre-trip reminder
6. **Trip Start** - Day-of trip message
7. **Attendance Cutoff Reminder** - Deadline reminder
8. **Custom Message** - Flexible custom template

All templates are in Hebrew and include proper emoji formatting for better readability in WhatsApp.

## Permissions

- **SUPER_ADMIN**: Full access to all features
- **TRIP_ADMIN**: Can generate messages for trips they manage, view templates
- **FAMILY**: No access to WhatsApp features

## Logging

All message generation events are logged with:

- User ID who generated the message
- Action type: `MESSAGE_GENERATED`
- Entity type: `WhatsAppMessage`
- Entity ID: Generated message ID
- Changes: Template info, event type, trigger type, trip ID

## Usage Flow

1. **Super Admin** creates/manages templates (one-time setup)
2. **Trip Admin** generates messages for their trips
3. System populates template variables with real data
4. Admin receives formatted message text
5. Admin copies message to WhatsApp
6. Message generation is logged for audit

## Testing

Run tests with:

```bash
npm test whatsapp.test.ts
```

Tests cover:

- Template CRUD operations
- Message generation for all event types
- Variable replacement
- Permissions and authorization
- Message history
- Logging functionality

## Future Enhancements

Potential future additions:

- Automatic message sending via WhatsApp Business API
- Message scheduling
- Message templates with conditional content
- Multi-language support
- Message preview before generation
- Bulk message generation for multiple trips
