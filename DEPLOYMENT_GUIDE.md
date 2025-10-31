# 🚀 Deployment Guide - Community Trip Organizer

## Overview

This guide provides comprehensive instructions for deploying the Community Trip Organizer application to production on Vercel.

### Monorepo Structure

This project is organized as a Yarn workspace monorepo with two packages:

```
community-trip-organizer/
├── packages/
│   ├── frontend/        # Next.js frontend application
│   └── backend/         # Express.js backend API with Prisma
├── package.json         # Root workspace configuration
├── vercel.json          # Vercel deployment configuration
└── build-vercel.sh      # Custom build script for Vercel
```

**Key Points:**
- Both frontend and backend are deployed to Vercel
- Frontend runs as a Next.js application
- Backend runs as Vercel serverless functions
- Shared dependencies are hoisted to the root
- Database migrations are managed via Prisma in the backend package

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Vercel account (free or pro)
- [ ] PostgreSQL database (Vercel Postgres, Supabase, or other)
- [ ] Google OAuth credentials
- [ ] GitHub account with repository access
- [ ] Node.js 20+ installed locally

---

## Environment Setup

### 1. Create Environment Variables

#### Production Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

**Backend Variables:**
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?pgbouncer=true&connection_limit=1"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
GOOGLE_CALLBACK_URL="https://your-domain.vercel.app/api/auth/google/callback"

# Facebook OAuth (optional)
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-secret"
FACEBOOK_CALLBACK_URL="https://your-domain.vercel.app/api/auth/facebook/callback"

# Server Configuration
NODE_ENV="production"
PORT="3001"
CLIENT_URL="https://your-domain.vercel.app"
ALLOWED_ORIGINS="https://your-domain.vercel.app"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"

# Logging
LOG_LEVEL="info"

# Feature Flags
ENABLE_REGISTRATION="true"
ENABLE_FACEBOOK_AUTH="false"

# Frontend Public Variables
NEXT_PUBLIC_API_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
```

**Important Notes:**
- All `NEXT_PUBLIC_*` variables are exposed to the browser
- Backend variables are only accessible in API routes and serverless functions
- Ensure DATABASE_URL includes connection pooling parameters for Vercel serverless
- Both packages share the same environment variables in Vercel

### 2. Configure OAuth Providers

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs:
     - `https://your-domain.vercel.app/api/auth/google/callback`
     - `http://localhost:3001/api/auth/google/callback` (for development)

#### Facebook OAuth Setup (Optional)

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs:
   - `https://your-domain.vercel.app/api/auth/facebook/callback`

---

## Database Setup

### Option 1: Vercel Postgres

1. In Vercel Dashboard, go to Storage → Create Database
2. Select Postgres
3. Copy the connection string
4. Run migrations:

```bash
# From project root
DATABASE_URL="your-connection-string" yarn db:migrate

# Or manually from backend
cd packages/backend
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

### Option 2: External PostgreSQL (Supabase, Railway, etc.)

1. Create a PostgreSQL database instance
2. Get the connection string (ensure it includes connection pooling parameters for serverless)
3. Update `DATABASE_URL` environment variable in Vercel
4. Run migrations:

```bash
# From project root
DATABASE_URL="your-connection-string" yarn db:migrate

# Or manually from backend
cd packages/backend
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

### Seed Initial Data

```bash
# From project root
DATABASE_URL="your-connection-string" yarn db:seed

# Or from backend directory
cd packages/backend
DATABASE_URL="your-connection-string" tsx prisma/seed.ts
```

This creates:
- Super admin user (check console output for credentials)
- Sample trips (optional)

---

## Vercel Deployment

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Production deployment setup"
   git push origin main
   ```

2. **Import in Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - **Critical:** Set **Root Directory** to empty (leave blank) - do NOT set it to `packages/backend` or `packages/frontend`
   - **Important:** Vercel will auto-detect "Next.js" as the framework (not "Other") because the `vercel.json` specifies `"framework": "nextjs"`
   - The build settings are pre-configured in `vercel.json`:
     - Build Command: `yarn workspace backend run build && yarn workspace frontend run build`
     - Output Directory: `packages/frontend/.next`
     - Install Command: `yarn install`
   - You don't need to manually configure these unless you want to override

3. **Add Environment Variables**:
   - In project settings, add all environment variables listed above
   - Ensure to set them for "Production" environment

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy

**Note:** The project includes a `vercel.json` configuration that:
- Sets the framework to Next.js for proper auto-detection
- Configures the monorepo build command to build both packages
- Uses modern Vercel configuration (no legacy `builds` or `routes`)
- Enables Yarn 4.x via Corepack

**Backend Deployment Strategy:**
This project uses a **hybrid approach**:
- The **frontend** (Next.js) is deployed as the main Vercel project
- The **backend** (Express API) should be deployed separately to its own Vercel project OR integrated into Next.js API routes
- For separate backend deployment, create a second Vercel project pointing to `packages/backend`
- Update `NEXT_PUBLIC_API_URL` to point to your deployed backend URL

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production (from project root)
vercel --prod
```

**Vercel Configuration (`vercel.json`):**

The project uses a modern `vercel.json` configuration:
- Framework is set to `"nextjs"` for proper detection
- Build command builds both backend and frontend workspaces
- No legacy `builds` or `routes` properties (deprecated)
- Uses Corepack for Yarn 4.x compatibility

**Important Notes:**
- The `builds` property is **deprecated** and conflicts with `functions`
- Modern Vercel deployments use `framework`, `buildCommand`, and `outputDirectory` instead
- For monorepos, use workspace commands in `buildCommand`

---

## Post-Deployment Configuration

### 1. Verify Deployment

Check these endpoints:

```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Detailed health check
curl https://your-domain.vercel.app/api/health/detailed
```

### 2. Database Migrations

Ensure migrations are applied:

```bash
# From project root
DATABASE_URL="your-production-db" yarn db:migrate

# Or from backend directory
cd packages/backend
DATABASE_URL="your-production-db" npx prisma migrate deploy
```

### 3. Create Super Admin

If not seeded, create manually:

```bash
# From project root
DATABASE_URL="your-production-db" yarn db:seed

# Or from backend directory
cd packages/backend
DATABASE_URL="your-production-db" tsx prisma/seed.ts
```

### 4. Configure Custom Domain (Optional)

1. In Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update environment variables with new domain

---

## Monitoring and Maintenance

### Health Checks

Monitor application health:

- **Basic Health**: `https://your-domain.vercel.app/api/health`
- **Detailed Health**: `https://your-domain.vercel.app/api/health/detailed`
- **Metrics**: `https://your-domain.vercel.app/api/metrics`

### Vercel Analytics

Vercel Analytics is automatically enabled. View in dashboard:
- Real-time visitors
- Page views
- Performance metrics

### Database Backups

Automated backups run daily via GitHub Actions. Manual backup:

```bash
cd packages/backend
./scripts/backup-database.sh
```

### Logs

View logs in:
- Vercel Dashboard → Project → Logs
- Vercel CLI: `vercel logs`

### Build Verification

Test the build locally before deploying:

```bash
# From project root
yarn install
yarn build

# Verify backend build
ls -la packages/backend/dist

# Verify frontend build  
ls -la packages/frontend/.next
```

---

## Troubleshooting

### Monorepo-Specific Issues

**Issue**: Build fails with "The file .../packages/backend/packages/frontend/.next/routes-manifest.json couldn't be found"
**Solution**:
- This indicates the Root Directory is incorrectly set to `packages/backend` in Vercel dashboard
- Go to Vercel Project Settings → General → Root Directory
- **Set it to empty** (leave blank) - the root should be the repository root
- Alternatively, if root is already correct, check if `output: 'standalone'` is set in `next.config.mjs`
- Remove `output: 'standalone'` from Next.js config - Vercel handles optimization automatically
- Redeploy the project

**Issue**: Yarn workspace not found or dependency resolution errors
**Solution**:
```bash
# Clear all node_modules and reinstall
rm -rf node_modules packages/*/node_modules
yarn install

# Ensure you're using correct Yarn version
yarn --version  # Should be 4.x
```

**Issue**: Build fails with "Cannot find module" from workspace
**Solution**:
- Ensure `postinstall` script in root package.json runs Prisma generate
- Check that shared dependencies are properly hoisted
- Verify workspace references in package.json files

**Issue**: Prisma client import errors
**Solution**:
```bash
# Regenerate Prisma client
yarn workspace backend exec prisma generate

# Or from backend directory
cd packages/backend
npx prisma generate
```

### Build Failures

**Issue**: "The `functions` property cannot be used in conjunction with the `builds` property"
**Solution**: 
- This occurs when using legacy `builds` property with modern `functions` property
- Solution: Remove the `builds` property from `vercel.json`
- Use modern configuration: `framework`, `buildCommand`, `outputDirectory`
- Current `vercel.json` has been updated to use only modern properties

**Issue**: Framework Preset shows "Other" instead of "Next.js"
**Solution**:
- Ensure `"framework": "nextjs"` is set in `vercel.json`
- Remove any `builds` property (it overrides framework detection)
- Vercel will auto-detect Next.js when the config is correct

**Issue**: Build fails with "Module not found"
**Solution**: 
```bash
# Clear Vercel cache
vercel --force

# Ensure all dependencies are in package.json (from root)
yarn install

# Test build locally
yarn build
```

**Issue**: Prisma client not generated
**Solution**: 
- Ensure `postinstall` script runs: `yarn workspace backend exec prisma generate`
- Add to vercel.json build env if needed
- Check that DATABASE_URL is set during build

**Issue**: TypeScript errors during build
**Solution**: 
- Check `packages/frontend/next.config.mjs`
- Ensure `typescript.ignoreBuildErrors` is set for initial deployment
- Fix TypeScript errors incrementally
- Run `yarn lint` to catch errors before deployment

### Database Connection Issues

**Issue**: "Cannot connect to database"
**Solution**:
- Verify `DATABASE_URL` is set correctly
- Check database is accessible from Vercel IPs
- Use connection pooling (PgBouncer) for serverless

**Issue**: "Too many connections"
**Solution**:
- Add `?connection_limit=1` to DATABASE_URL
- Use Prisma connection pooling
- Consider using PgBouncer

### OAuth Issues

**Issue**: "Redirect URI mismatch"
**Solution**:
- Update OAuth provider redirect URIs
- Ensure HTTPS is used in production
- Check callback URLs match exactly

### Performance Issues

**Issue**: Slow API responses
**Solution**:
- Check database query performance
- Review Vercel function logs
- Enable API response caching
- Optimize database indexes

---

## Security Checklist

- [ ] All environment variables are set in Vercel (not in code)
- [ ] JWT_SECRET is strong and unique
- [ ] OAuth credentials are production-ready
- [ ] HTTPS is enforced
- [ ] Rate limiting is enabled
- [ ] CORS is configured correctly
- [ ] Security headers are active
- [ ] Database backups are configured

---

## Rollback Procedure

If deployment fails:

1. **In Vercel Dashboard**:
   - Go to Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Via Git**:
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## Support

For issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review Vercel logs
3. Check GitHub Issues
4. Contact development team

---

## Next Steps

After successful deployment:

1. ✅ Test all features thoroughly
2. ✅ Configure monitoring alerts
3. ✅ Set up database backups
4. ✅ Review security settings
5. ✅ Train administrators
6. ✅ Create user documentation
7. ✅ Plan maintenance windows

---

**Deployment Date**: _________________  
**Deployed By**: _________________  
**Version**: 1.0.0
