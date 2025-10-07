# Development Seed Data - Quick Reference

## Running the Seed Script

From the **backend** directory:

```bash
cd packages/backend
yarn db:seed
```

## Quick Login Credentials

**Password for all users:** `password123`

### Test Accounts by Role

| Role | Email | Purpose |
|------|-------|---------|
| **Super Admin** | admin@example.com | Full system access - manage all trips and families |
| **Trip Admin** | john.johnson@example.com | Manages Summer Camp 2025 |
| **Trip Admin** | michael.smith@example.com | Manages Winter Retreat 2026 |
| **Trip Admin** | carlos.garcia@example.com | Manages Beach Getaway 2025 (draft) |
| **Regular User** | david.chen@example.com | Standard family member access |
| **Regular User** | jane.johnson@example.com | Family member of trip admin |
| **Pending** | robert.wilson@example.com | Family pending approval |
| **Inactive** | thomas.brown@example.com | Inactive family member |

## What's Seeded

### Users & Families
- **1 Super Admin** (Sarah Admin)
- **3 Trip Admins** (one for each trip)
- **6 Families** with a total of 19 users
  - 4 families: APPROVED & ACTIVE
  - 1 family: PENDING approval
  - 1 family: APPROVED but INACTIVE

### Trips
1. **Summer Camp 2025** (Active, July 15-20, 2025)
   - 4 families attending
   - Full gear list and assignments
   
2. **Winter Retreat 2026** (Active, Jan 10-15, 2026)
   - 3 families attending
   - Ski and snowboard equipment
   
3. **Beach Getaway 2025** (Draft, Aug 20-25, 2025)
   - 2 families attending
   - Still in planning phase

### Gear Items
- **Summer Camp:** Tents, Sleeping Bags, Camp Stoves, Coolers
- **Winter Retreat:** Ski Equipment, Snowboards
- All items have family assignments showing who's bringing what

## Testing Scenarios

The seed data enables testing:

✅ **Authentication flows** - Multiple user types and roles  
✅ **Trip administration** - Each trip has an admin  
✅ **Family management** - Various family statuses  
✅ **Gear coordination** - Complete gear assignment workflow  
✅ **Trip attendance** - Multiple families on multiple trips  
✅ **Permissions** - Different access levels by role  
✅ **Draft vs Published** - Both trip states available  
✅ **Approval workflow** - Pending family status  

## Complete Documentation

For full details, see:
- [Backend Seed Data Documentation](./packages/backend/prisma/SEED_DATA.md)
- [Backend README](./packages/backend/README.md)

## Viewing the Data

Open Prisma Studio to browse the seeded data:

```bash
cd packages/backend
npx prisma studio
```

This opens a web interface at http://localhost:5555 where you can view and edit all database records.
