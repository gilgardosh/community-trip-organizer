# Backend Deployment Verification Checklist

## Before Deploying

### 1. Vercel Project Settings
- [ ] Root Directory is set to `packages/backend`
- [ ] Framework Preset shows "Other" (auto-detected)
- [ ] Build Command: Uses default (Vercel auto-detects)
- [ ] Output Directory: Not needed (serverless functions)

### 2. Environment Variables
Set these in Vercel Dashboard → Project → Settings → Environment Variables:

- [ ] `DATABASE_URL` (with `?connection_limit=1`)
- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRES_IN`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_CALLBACK_URL`
- [ ] `NODE_ENV=production`
- [ ] `CLIENT_URL`
- [ ] `ALLOWED_ORIGINS`

### 3. Database Setup
- [ ] PostgreSQL database is provisioned
- [ ] Connection pooling is enabled (PgBouncer)
- [ ] Database URL includes `?connection_limit=1`
- [ ] Migrations are ready to run

### 4. File Structure
- [ ] `api/index.ts` exists and exports Express app
- [ ] `vercel.json` has `rewrites` configuration
- [ ] `.vercelignore` excludes unnecessary files
- [ ] `tsconfig.json` includes `api/**/*` in compilation

## After Deploying

### 1. Verify Deployment
```bash
# Get your deployment URL from Vercel dashboard
export BACKEND_URL="https://your-backend.vercel.app"

# Test health endpoint
curl $BACKEND_URL/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Test detailed health
curl $BACKEND_URL/api/health/detailed
# Expected: {"status":"ok","database":"connected",...}
```

### 2. Check Function Logs
- [ ] No errors in Vercel function logs
- [ ] Cold start time < 3 seconds
- [ ] Subsequent requests < 500ms
- [ ] Database connections are closing properly

### 3. Run Database Migrations
```bash
# From your local machine
DATABASE_URL="your-production-database-url" \
  yarn workspace backend exec prisma migrate deploy
```

### 4. Seed Initial Data (Optional)
```bash
DATABASE_URL="your-production-database-url" \
  yarn workspace backend run db:seed
```

### 5. Test API Endpoints
```bash
# Replace with your actual backend URL
export BACKEND_URL="https://your-backend.vercel.app"

# Health check
curl $BACKEND_URL/api/health

# Metrics (if public)
curl $BACKEND_URL/api/metrics

# Auth endpoints (should require authentication)
curl $BACKEND_URL/api/protected
# Expected: 401 Unauthorized
```

### 6. Update Frontend
- [ ] Set `NEXT_PUBLIC_API_URL` in frontend Vercel project to backend URL
- [ ] Redeploy frontend to pick up new API URL
- [ ] Test OAuth flow from frontend

## Troubleshooting

### Issue: Requests hang/timeout
**Check:**
1. `api/index.ts` exists and exports app: `export default app;`
2. No `app.listen()` calls in the codebase
3. `DATABASE_URL` includes `?connection_limit=1`
4. Function logs in Vercel dashboard for errors

### Issue: 404 for all routes
**Check:**
1. Root Directory in Vercel is `packages/backend`
2. `vercel.json` has correct `rewrites` configuration
3. Routes are defined correctly in Express app

### Issue: Database connection errors
**Check:**
1. `DATABASE_URL` environment variable is set in Vercel
2. Database allows connections from Vercel IPs
3. Connection string includes `?pgbouncer=true&connection_limit=1`
4. Prisma client is generated during build

### Issue: Module not found errors
**Check:**
1. All imports use `.js` extensions (ESM requirement)
2. `package.json` has `"type": "module"`
3. All dependencies are listed in `package.json`
4. Run `yarn build` locally to verify compilation

## Performance Benchmarks

### Expected Response Times
- Health endpoint: < 200ms (warm) / < 2s (cold)
- Database queries: < 500ms
- Authentication: < 300ms
- Complex queries: < 1s

### Cold Start Optimization
- First request: ~1-2 seconds (normal)
- Subsequent requests: < 500ms
- Keep functions warm with periodic health checks

## Security Verification

- [ ] OAuth callback URLs match deployed backend URL
- [ ] CORS origins are restricted to frontend domain
- [ ] JWT secret is unique and not in git
- [ ] Database credentials are secure
- [ ] HTTPS is enforced (automatic on Vercel)
- [ ] Rate limiting is active
- [ ] Security headers are enabled

## Success Criteria

✅ All endpoints respond correctly
✅ Database connections work
✅ OAuth flow completes successfully
✅ No errors in function logs
✅ Response times meet benchmarks
✅ Frontend can communicate with backend

## Next Steps

After successful deployment:
1. Monitor function logs for 24 hours
2. Set up alerting for errors
3. Configure custom domain (optional)
4. Enable Vercel Analytics
5. Document API endpoints
6. Set up automated backups
