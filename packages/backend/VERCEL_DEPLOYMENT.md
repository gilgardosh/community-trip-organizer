# Backend Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

This backend uses **Vercel Serverless Functions** architecture. Follow these steps for deployment:

### Prerequisites
- Vercel account
- PostgreSQL database (with connection pooling)
- Environment variables ready

### Deployment Steps

1. **Create New Vercel Project for Backend**
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your Git repository
   - **IMPORTANT**: Set **Root Directory** to `packages/backend`
   - Framework Preset: Other (Vercel auto-detects serverless functions)

2. **Configure Environment Variables**
   
   Add these in Vercel Dashboard → Settings → Environment Variables:

   ```bash
   # Database (MUST include connection pooling for serverless)
   DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=1"
   
   # JWT
   JWT_SECRET="your-secret-min-32-chars"
   JWT_EXPIRES_IN="7d"
   
   # OAuth
   GOOGLE_CLIENT_ID="your-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-secret"
   GOOGLE_CALLBACK_URL="https://your-backend.vercel.app/api/auth/google/callback"
   
   # Server Config
   NODE_ENV="production"
   CLIENT_URL="https://your-frontend.vercel.app"
   ALLOWED_ORIGINS="https://your-frontend.vercel.app"
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - Your API will be available at: `https://your-backend.vercel.app/api/*`

4. **Run Database Migrations**
   ```bash
   # From your local machine
   DATABASE_URL="your-production-url" yarn workspace backend exec prisma migrate deploy
   ```

5. **Seed Initial Data (Optional)**
   ```bash
   DATABASE_URL="your-production-url" yarn workspace backend run db:seed
   ```

## 📁 Project Structure

```
packages/backend/
├── api/
│   └── index.mjs         # ⭐ Serverless function entry point (imports compiled code)
├── src/
│   ├── app.ts            # Express app configuration
│   ├── index.ts          # Local development server (NOT used in Vercel)
│   ├── routes/           # API routes
│   ├── controllers/      # Route handlers
│   └── ...
├── dist/                 # ← Compiled TypeScript output
│   ├── api/              # (ignored - not deployed)
│   └── src/              # ✅ Deployed compiled code
├── vercel.json           # Vercel serverless configuration
└── tsconfig.json         # TypeScript config
```

**Important**: The `api/` folder contains ONLY `index.mjs` (JavaScript). TypeScript files in `api/` will cause conflicts.

## 🔧 How Serverless Works

### Traditional Server (Local Development)
```typescript
// src/index.ts (NOT used in Vercel)
import app from './app.js';
app.listen(3001); // ❌ Doesn't work on Vercel
```

### Serverless Function (Vercel Production)
```javascript
// api/index.mjs (used in Vercel)
import app from '../dist/src/app.js';
export default app; // ✅ Vercel converts this to serverless function
```

**Build Process**:
1. Vercel runs: `prisma generate && yarn build`
2. TypeScript compiles `src/` → `dist/src/`
3. Vercel bundles `api/index.mjs` (which imports from `dist/`)
4. Serverless function is deployed

### Key Differences
- ❌ No `app.listen()` - Vercel handles server lifecycle
- ❌ No persistent connections - stateless functions
- ✅ Auto-scaling - handles any traffic volume
- ✅ Cold starts - first request ~1-2s, subsequent requests fast
- ✅ Pay-per-use - only charged for actual requests

## 🌐 API Routes

All routes in `src/routes/index.ts` are prefixed with `/api`:

- Health: `https://your-backend.vercel.app/api/health`
- Auth: `https://your-backend.vercel.app/api/auth/*`
- Trips: `https://your-backend.vercel.app/api/trips/*`
- Families: `https://your-backend.vercel.app/api/families/*`

## 🔍 Debugging

### Check Deployment Status
```bash
# Install Vercel CLI
npm i -g vercel

# View logs
vercel logs <deployment-url>
```

### Common Issues

**1. Requests hang/timeout**
- Check `api/index.ts` exists and exports app correctly
- Verify database connection string includes `?connection_limit=1`
- Check Vercel function logs for errors

**2. 404 for all routes**
- Verify `vercel.json` has `rewrites` configuration
- Check Root Directory is `packages/backend`
- Ensure routes are prefixed correctly in Express

**3. Module not found errors**
- All imports must use `.js` extensions (ESM requirement)
- Run `yarn build` locally to verify TypeScript compilation
- Check that all dependencies are in `package.json`

**4. Environment variables not working**
- Variables must be set in Vercel Dashboard
- Redeploy after adding new variables
- Use `process.env.VAR_NAME` (not `import.meta.env`)

## 📊 Performance Optimization

### Database Connection Pooling
CRITICAL for serverless:
```
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"
```

### Function Configuration
In `vercel.json`:
```json
{
  "functions": {
    "api/index.ts": {
      "memory": 1024,      // MB of RAM
      "maxDuration": 10    // Max 10s on Hobby, 60s on Pro
    }
  }
}
```

### Cold Start Mitigation
- Keep dependencies minimal
- Use warming service (periodic health checks)
- Upgrade to Vercel Pro for better performance

## 🔐 Security Checklist

- [ ] `DATABASE_URL` includes connection pooling
- [ ] `JWT_SECRET` is strong (32+ characters)
- [ ] OAuth credentials are production-ready
- [ ] `ALLOWED_ORIGINS` restricts CORS properly
- [ ] All sensitive env vars are in Vercel (not in code)
- [ ] HTTPS is enforced (automatic on Vercel)

## 📚 Additional Resources

- [Vercel Serverless Functions Docs](https://vercel.com/docs/functions/serverless-functions)
- [Prisma Best Practices for Serverless](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#serverless-environments)
- [Express on Vercel](https://vercel.com/guides/using-express-with-vercel)

## 🆘 Need Help?

1. Check Vercel function logs: `vercel logs`
2. Test health endpoint: `curl https://your-backend.vercel.app/api/health`
3. Review main [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md)
4. Open an issue on GitHub
