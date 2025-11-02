# Prisma Optimization for Vercel Serverless

## Overview

Prisma in serverless environments requires special handling to prevent connection exhaustion and optimize performance.

## Key Optimizations Implemented

### 1. Singleton Pattern for PrismaClient

**File**: `src/utils/db.ts`

```typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
```

**Why**: Prevents creating multiple PrismaClient instances per function invocation.

**Benefits**:
- ✅ Reuses connections when function is "warm"
- ✅ Prevents connection pool exhaustion
- ✅ Better performance on subsequent requests
- ✅ Reduced cold start time

### 2. Database Connection String

**Required format**:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"
```

**Critical parameters**:
- `pgbouncer=true` - Uses connection pooling
- `connection_limit=1` - Limits connections per Prisma Client instance

**Why**: 
- Serverless functions are stateless and short-lived
- Each function can potentially create its own connection
- Without pooling, you'll hit database connection limits quickly

### 3. Connection Pooling Architecture

```
Serverless Function → Prisma Client → PgBouncer → PostgreSQL
```

**PgBouncer benefits**:
- Multiplexes connections
- Reduces connection overhead
- Handles connection lifecycle
- Prevents "too many connections" errors

## Environment Setup

### Development
```bash
# .env.development
DATABASE_URL="postgresql://user:pass@localhost:5432/dev"
```

### Production (Vercel)
```bash
# Vercel Environment Variables
DATABASE_URL="postgresql://user:pass@host:5432/prod?pgbouncer=true&connection_limit=1"
```

## Database Provider Options

### Option 1: Vercel Postgres (Recommended)
- Built-in connection pooling
- Optimized for serverless
- Automatic PgBouncer configuration
- Direct integration with Vercel

**Setup**:
1. Vercel Dashboard → Storage → Create Database → Postgres
2. Copy connection string (already includes pooling)
3. Set as `DATABASE_URL` environment variable

### Option 2: Supabase
- Free tier available
- Built-in connection pooling
- Good performance

**Setup**:
1. Create Supabase project
2. Get connection string from Settings → Database
3. Use the "Connection Pooling" URL (port 6543)
4. Format: `postgresql://...:[PASSWORD]@...supabase.co:6543/postgres?pgbouncer=true`

### Option 3: Railway
- Affordable pricing
- Good performance
- Easy setup

**Setup**:
1. Create Railway project
2. Add PostgreSQL service
3. Use connection string with `?connection_limit=1`

### Option 4: External PostgreSQL + PgBouncer
- Most control
- Requires manual PgBouncer setup
- Good for custom requirements

## Performance Best Practices

### 1. Minimize Database Queries
```typescript
// ❌ Bad - Multiple queries
const user = await prisma.user.findUnique({ where: { id } });
const family = await prisma.family.findUnique({ where: { id: user.familyId } });

// ✅ Good - Single query with include
const user = await prisma.user.findUnique({
  where: { id },
  include: { family: true }
});
```

### 2. Use Select to Limit Fields
```typescript
// ❌ Bad - Fetches all fields
const users = await prisma.user.findMany();

// ✅ Good - Only needed fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true }
});
```

### 3. Implement Caching
```typescript
import { responseCache } from '../middleware/cache.js';

// Cache frequently accessed data
router.get('/trips', responseCache.middleware(300), async (req, res) => {
  const trips = await prisma.trip.findMany();
  res.json(trips);
});
```

### 4. Use Indexes
```prisma
model User {
  id    String @id @default(cuid())
  email String @unique  // ✅ Indexed
  name  String
  
  @@index([familyId])   // ✅ Index for foreign keys
}
```

## Cold Start Optimization

### 1. Prisma Binary Targets
**File**: `prisma/schema.prisma`

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}
```

**Why**: Ensures correct Prisma binary for Vercel's runtime environment.

### 2. Generate During Build
**File**: `vercel.json`

```json
{
  "buildCommand": "prisma generate && tsc"
}
```

**Why**: Pre-generates Prisma Client during build, not at runtime.

### 3. Exclude Unnecessary Files
**File**: `.vercelignore`

```
prisma/migrations/
tests/
*.test.ts
```

**Why**: Smaller deployment = faster cold starts.

## Monitoring

### Connection Pool Monitoring
```typescript
// Add to health check
router.get('/health', async (req, res) => {
  const metrics = await prisma.$metrics.json();
  res.json({ 
    database: 'connected',
    connections: metrics
  });
});
```

### Query Performance
```typescript
// Enable query logging in development
new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});
```

## Common Issues & Solutions

### Issue: "Too many connections"
**Solution**:
- Ensure `connection_limit=1` in DATABASE_URL
- Use connection pooling (PgBouncer)
- Implement singleton pattern for PrismaClient

### Issue: Slow cold starts
**Solution**:
- Pre-generate Prisma Client during build
- Use correct binary targets
- Minimize dependencies
- Keep Prisma schema optimized

### Issue: Timeout errors
**Solution**:
- Optimize database queries
- Add appropriate indexes
- Use `select` to limit fields
- Implement caching
- Increase `maxDuration` in vercel.json (up to 10s Hobby, 60s Pro)

### Issue: Connection not closed
**Solution**:
- Don't call `prisma.$disconnect()` in serverless functions
- Vercel handles cleanup automatically
- Only use disconnect in local development

## Testing Locally

### Test Connection Pooling
```bash
# From packages/backend
DATABASE_URL="your-url?connection_limit=1" yarn dev

# Make multiple concurrent requests
for i in {1..10}; do
  curl http://localhost:3001/api/health &
done
```

### Monitor Connections
```sql
-- In your PostgreSQL database
SELECT count(*) FROM pg_stat_activity;
```

## Migration to Production

### 1. Run Migrations
```bash
DATABASE_URL="production-url" yarn workspace backend exec prisma migrate deploy
```

### 2. Verify Connection
```bash
curl https://your-backend.vercel.app/api/health
```

### 3. Monitor Performance
- Check Vercel function logs
- Monitor database connections
- Watch for timeout errors

## Checklist

- [ ] DATABASE_URL includes `?connection_limit=1`
- [ ] Using connection pooling (PgBouncer or provider built-in)
- [ ] Singleton pattern for PrismaClient (`src/utils/db.ts`)
- [ ] Prisma Client generated during build
- [ ] Binary targets configured for Vercel
- [ ] Indexes added for frequently queried fields
- [ ] Queries optimized (select, include)
- [ ] Caching implemented for static data
- [ ] Health check verifies database connection
- [ ] Monitoring set up for connection pool

## Resources

- [Prisma Serverless Guide](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#serverless-environments)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [PgBouncer Documentation](https://www.pgbouncer.org/)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooling)

---

**These optimizations ensure your Prisma setup is production-ready for Vercel serverless! 🚀**
