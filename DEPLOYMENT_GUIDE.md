# 🚀 Deployment Guide - Community Trip Organizer

## Overview

This guide provides comprehensive instructions for deploying the Community Trip Organizer application to production on Vercel.

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
cd packages/backend
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

### Option 2: External PostgreSQL (Supabase, Railway, etc.)

1. Create a PostgreSQL database instance
2. Get the connection string
3. Update `DATABASE_URL` environment variable
4. Run migrations:

```bash
cd packages/backend
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

### Seed Initial Data

```bash
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
   - Configure:
     - Framework Preset: Next.js
     - Root Directory: `packages/frontend`
     - Build Command: `cd ../.. && yarn install && yarn build`
     - Output Directory: `.next`

3. **Add Environment Variables**:
   - In project settings, add all environment variables listed above
   - Ensure to set them for "Production" environment

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

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
# From local machine
cd packages/backend
DATABASE_URL="your-production-db" npx prisma migrate deploy
```

### 3. Create Super Admin

If not seeded, create manually:

```bash
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

---

## Troubleshooting

### Build Failures

**Issue**: Build fails with "Module not found"
**Solution**: 
```bash
# Clear Vercel cache
vercel --force

# Ensure all dependencies are in package.json
yarn install
```

**Issue**: TypeScript errors during build
**Solution**: 
- Check `packages/frontend/next.config.mjs`
- Ensure `typescript.ignoreBuildErrors` is set for initial deployment
- Fix TypeScript errors incrementally

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
