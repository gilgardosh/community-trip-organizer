# Trip API Quick Reference

## Base URL

```
/api/trips
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### 1. Create Trip

**POST** `/api/trips`

**Access:** TRIP_ADMIN, SUPER_ADMIN

**Request Body:**

```json
{
  "name": "Summer Camp 2024",
  "location": "Lake Tahoe",
  "description": "Annual summer camping trip",
  "startDate": "2024-07-15T00:00:00Z",
  "endDate": "2024-07-20T00:00:00Z",
  "attendanceCutoffDate": "2024-07-01T00:00:00Z",
  "photoAlbumLink": "https://photos.example.com/album/123"
}
```

**Response:** Trip object with status 201

**Notes:**

- Trip is created in draft mode by default
- All dates are ISO 8601 format
- Only `name`, `location`, `startDate`, and `endDate` are required

---

### 2. Get All Trips

**GET** `/api/trips`

**Access:** All authenticated users

**Query Parameters:**

- `draft` (boolean): Filter by draft status
- `startDateFrom` (ISO date): Filter trips starting from this date
- `startDateTo` (ISO date): Filter trips starting before this date
- `includePast` (boolean): Include past trips (default: false)

**Response:** Array of trip objects

**Role-based filtering:**

- FAMILY: Only published trips
- TRIP_ADMIN: Only trips they manage
- SUPER_ADMIN: All trips

---

### 3. Get Trip by ID

**GET** `/api/trips/:id`

**Access:** All authenticated users (with restrictions)

**Response:** Trip object with full details

**Notes:**

- Draft trips only visible to admins and super-admins
- TRIP_ADMIN can only view trips they manage

---

### 4. Update Trip

**PUT** `/api/trips/:id`

**Access:** Trip admins of this trip, SUPER_ADMIN

**Request Body:** (all fields optional)

```json
{
  "name": "Updated Trip Name",
  "location": "New Location",
  "description": "Updated description",
  "startDate": "2024-07-16T00:00:00Z",
  "endDate": "2024-07-21T00:00:00Z",
  "attendanceCutoffDate": "2024-07-02T00:00:00Z",
  "photoAlbumLink": "https://photos.example.com/album/456"
}
```

**Response:** Updated trip object

**Notes:**

- Cannot update past trips (except SUPER_ADMIN)
- End date must be after start date
- Attendance cutoff must be before start date

---

### 5. Publish Trip

**POST** `/api/trips/:id/publish`

**Access:** SUPER_ADMIN only

**Response:** Published trip object

**Notes:**

- Trip must have at least one admin before publishing
- Published trips become visible to all users

---

### 6. Unpublish Trip

**POST** `/api/trips/:id/unpublish`

**Access:** SUPER_ADMIN only

**Response:** Unpublished trip object (back to draft)

---

### 7. Assign Admins (Replace All)

**PUT** `/api/trips/:id/admins`

**Access:** SUPER_ADMIN only

**Request Body:**

```json
{
  "adminIds": ["user-id-1", "user-id-2"]
}
```

**Response:** Trip with updated admins

**Notes:**

- Replaces all existing admins
- At least one admin required

---

### 8. Add Admin

**POST** `/api/trips/:id/admins/:adminId`

**Access:** SUPER_ADMIN only

**Response:** Trip with updated admins

**Notes:**

- Adds a single admin without affecting others
- Admin must be an adult user

---

### 9. Remove Admin

**DELETE** `/api/trips/:id/admins/:adminId`

**Access:** SUPER_ADMIN only

**Response:** Trip with updated admins

**Notes:**

- Cannot remove last admin from published trip
- Can remove admins from draft trips freely

---

### 10. Mark Attendance

**POST** `/api/trips/:id/attendance`

**Access:**

- FAMILY: Own family only
- TRIP_ADMIN: Any family in their trips
- SUPER_ADMIN: Any family

**Request Body:**

```json
{
  "familyId": "family-id-123",
  "attending": true
}
```

**Response:** Trip with updated attendees

**Notes:**

- Cannot mark attendance for draft trips
- Cannot mark after attendance cutoff date
- Only approved, active families can attend
- Set `attending: false` to remove attendance

---

### 11. Get Trip Attendees

**GET** `/api/trips/:id/attendees`

**Access:** All authenticated users (based on role)

**Response:** Array of attendance records with family details

---

### 12. Delete Trip

**DELETE** `/api/trips/:id`

**Access:** SUPER_ADMIN only

**Response:** Success message

**Notes:**

- Permanently deletes the trip
- Cascade deletes all related data (attendees, gear items, etc.)

---

## Response Format

### Success Response

```json
{
  "id": "trip-id-123",
  "name": "Summer Camp 2024",
  "location": "Lake Tahoe",
  "description": "Annual summer camping trip",
  "startDate": "2024-07-15T00:00:00Z",
  "endDate": "2024-07-20T00:00:00Z",
  "draft": false,
  "attendanceCutoffDate": "2024-07-01T00:00:00Z",
  "photoAlbumLink": "https://photos.example.com/album/123",
  "createdAt": "2024-06-01T10:00:00Z",
  "updatedAt": "2024-06-15T14:30:00Z",
  "admins": [
    {
      "id": "user-id-1",
      "name": "John Admin",
      "email": "john@example.com",
      "role": "TRIP_ADMIN"
    }
  ],
  "attendees": [
    {
      "tripId": "trip-id-123",
      "familyId": "family-id-456",
      "family": {
        "id": "family-id-456",
        "name": "Smith Family",
        "members": [
          {
            "id": "user-id-2",
            "type": "ADULT",
            "name": "Jane Smith",
            "age": null
          },
          {
            "id": "user-id-3",
            "type": "CHILD",
            "name": "Tommy Smith",
            "age": 8
          }
        ]
      }
    }
  ],
  "gearItems": []
}
```

### Error Response

```json
{
  "message": "Error description",
  "statusCode": 400
}
```

## Common HTTP Status Codes

- **200 OK**: Successful GET, PUT, DELETE
- **201 Created**: Successful POST (create)
- **400 Bad Request**: Validation error or business logic violation
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions for the operation
- **404 Not Found**: Trip or related resource not found
- **500 Internal Server Error**: Server-side error

## Example Usage

### Create and Publish a Trip

```bash
# 1. Create draft trip (as TRIP_ADMIN)
curl -X POST http://localhost:3000/api/trips \
  -H "Authorization: Bearer <trip-admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weekend Hike",
    "location": "Mountain Trail",
    "startDate": "2024-08-10T08:00:00Z",
    "endDate": "2024-08-11T18:00:00Z",
    "attendanceCutoffDate": "2024-08-05T23:59:59Z"
  }'

# 2. Assign admins (as SUPER_ADMIN)
curl -X PUT http://localhost:3000/api/trips/<trip-id>/admins \
  -H "Authorization: Bearer <super-admin-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "adminIds": ["user-id-1", "user-id-2"]
  }'

# 3. Publish trip (as SUPER_ADMIN)
curl -X POST http://localhost:3000/api/trips/<trip-id>/publish \
  -H "Authorization: Bearer <super-admin-token>"

# 4. Mark attendance (as FAMILY user)
curl -X POST http://localhost:3000/api/trips/<trip-id>/attendance \
  -H "Authorization: Bearer <family-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "familyId": "<family-id>",
    "attending": true
  }'
```

## Business Rules

1. **Trip Dates**
   - End date must be after start date
   - Attendance cutoff must be before start date
   - Past trips cannot be updated (except by SUPER_ADMIN)

2. **Draft vs Published**
   - New trips are created in draft mode
   - Draft trips are hidden from FAMILY users
   - Only SUPER_ADMIN can publish/unpublish

3. **Admin Requirements**
   - Published trips must have at least one admin
   - Only adults can be trip admins
   - Cannot remove last admin from published trip

4. **Attendance**
   - Cannot mark attendance for draft trips
   - Cannot mark after cutoff date
   - Only approved, active families can attend
   - FAMILY users can only mark own family attendance
   - TRIP_ADMIN can mark any family in their managed trips

5. **Permissions**
   - TRIP_ADMIN can only manage trips they're assigned to
   - Only SUPER_ADMIN can delete trips
   - Only SUPER_ADMIN can manage trip admins
