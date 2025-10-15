# Setup Instructions for WhatsApp Message System

## Prerequisites

- PostgreSQL database running
- Node.js and npm installed

## Step-by-Step Setup

### 1. Generate Prisma Client

After updating the schema, regenerate the Prisma client:

```bash
cd packages/backend
npx prisma generate
```

This will:

- Generate TypeScript types for the new models (WhatsAppMessageTemplate, WhatsAppMessage)
- Add the new enums (MessageEventType, MessageTriggerType)
- Update ActionType enum with MESSAGE_GENERATED

### 2. Run Database Migration

Apply the schema changes to your database:

```bash
npx prisma migrate dev
```

This will:

- Create the `WhatsAppMessageTemplate` table
- Create the `WhatsAppMessage` table
- Add the new enums
- Update the ActionType enum

### 3. Seed Default Templates

Populate the database with default Hebrew templates:

```bash
npm run db:seed
```

This will create:

- 8 default message templates in Hebrew
- All other seed data (families, trips, etc.)

### 4. Verify Installation

Run the tests to ensure everything works:

```bash
npm test whatsapp.test.ts
```

### 5. Start the Server

```bash
npm run dev
```

The WhatsApp endpoints will be available at `/api/whatsapp/*`

## Troubleshooting

### TypeScript Errors About Missing Types

**Problem:** `Module '"@prisma/client"' has no exported member 'MessageEventType'`

**Solution:** Run `npx prisma generate` to regenerate the Prisma client

### Database Connection Errors

**Problem:** `Can't reach database server`

**Solution:**

1. Ensure PostgreSQL is running
2. Check your `.env` file has correct `DATABASE_URL`
3. Start database with `docker-compose up -d` (if using Docker)

### Migration Errors

**Problem:** Migration already exists or conflicts

**Solution:**

1. Check existing migrations in `prisma/migrations/`
2. If needed, reset database: `npx prisma migrate reset` (WARNING: destroys data)
3. Or manually apply: `npx prisma db push`

### Seed Errors

**Problem:** Seed fails with "Property does not exist"

**Solution:** Ensure Prisma client is regenerated with `npx prisma generate`

## Verification Checklist

After setup, verify:

- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Server starts successfully
- [ ] Can create a template via API
- [ ] Can generate a message via API
- [ ] Messages appear in database

## Quick Test

Test the system with curl:

```bash
# 1. Login as super admin
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}' \
  | jq -r '.token')

# 2. List templates
curl http://localhost:3000/api/whatsapp/templates \
  -H "Authorization: Bearer $TOKEN"

# 3. Generate a message (replace TRIP_ID)
curl -X POST http://localhost:3000/api/whatsapp/trip/TRIP_ID/created \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"triggerType":"MANUAL"}'
```

## Environment Variables

Ensure your `.env` file includes:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
CLIENT_URL="http://localhost:3001"
```

## Production Deployment

For production:

1. Run migrations: `npx prisma migrate deploy`
2. Don't use seed in production (or customize for prod data)
3. Set proper environment variables
4. Ensure database backups are configured
5. Review and customize templates for your community

## Support

For issues or questions:

- Check the main README.md
- Review WHATSAPP_MESSAGES.md for API documentation
- Check WHATSAPP_QUICKSTART.md for usage examples
- Review test files for example usage
