# 🔄 Disaster Recovery Plan

## Overview

This document outlines the procedures for recovering from various disaster scenarios in the Community Trip Organizer application.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Backup Procedures](#backup-procedures)
3. [Recovery Scenarios](#recovery-scenarios)
4. [Rollback Procedures](#rollback-procedures)
5. [Contact Information](#contact-information)

---

## Quick Reference

### Emergency Contacts

| Role            | Name | Contact | Availability   |
| --------------- | ---- | ------- | -------------- |
| Lead Developer  | TBD  | TBD     | 24/7           |
| Database Admin  | TBD  | TBD     | Business hours |
| DevOps          | TBD  | TBD     | 24/7           |
| Project Manager | TBD  | TBD     | Business hours |

### Critical Resources

- **Production URL**: `https://your-domain.vercel.app`
- **Database**: Vercel Postgres / External provider
- **Backup Location**: GitHub Actions Artifacts / S3 Bucket
- **Documentation**: GitHub Repository
- **Monitoring**: Vercel Dashboard

---

## Backup Procedures

### Automated Backups

Automated backups run **daily at 2:00 AM UTC** via GitHub Actions.

**Retention Policy**:

- Daily backups: 30 days
- Weekly backups: 90 days
- Monthly backups: 1 year

**Backup Contents**:

- ✅ Complete database dump
- ✅ Schema migrations
- ✅ Application configuration
- ❌ User-uploaded files (external links only)

### Manual Backup

#### Create Manual Backup

```bash
cd packages/backend
DATABASE_URL="your-production-url" ./scripts/backup-database.sh
```

**Output**: Compressed SQL file in `./backups/` directory

#### Verify Backup

```bash
# List recent backups
ls -lh ./backups/

# Check backup integrity
gunzip -t ./backups/backup_20251016_120000.sql.gz
```

### Download Backup from GitHub Actions

1. Go to GitHub Repository → Actions → Backup workflow
2. Select latest successful run
3. Download artifacts
4. Extract backup file

---

## Recovery Scenarios

### Scenario 1: Database Corruption

**Symptoms**:

- Database connection errors
- Data integrity violations
- Query failures

**Recovery Steps**:

1. **Identify Issue**:

   ```bash
   cd packages/backend
   npm run db:health:check
   ```

2. **Stop Application** (if needed):
   - In Vercel Dashboard: Disable deployment

3. **Restore from Backup**:

   ```bash
   # Download latest backup
   # Run restore script
   DATABASE_URL="your-production-url" \
   ./scripts/restore-database.sh ./backups/latest-backup.sql.gz
   ```

4. **Verify Recovery**:

   ```bash
   npm run db:health:check
   npx prisma migrate status
   ```

5. **Re-enable Application**:
   - Redeploy in Vercel Dashboard

**Expected Downtime**: 15-30 minutes

---

### Scenario 2: Deployment Failure

**Symptoms**:

- Build errors in Vercel
- Application not accessible
- 500 errors

**Recovery Steps**:

1. **Identify Failed Deployment**:
   - Check Vercel Dashboard → Deployments
   - Review error logs

2. **Rollback to Previous Version**:

   ```bash
   # Method 1: Via Vercel Dashboard
   # - Find last successful deployment
   # - Click "Promote to Production"

   # Method 2: Via Git
   git revert HEAD
   git push origin main
   ```

3. **Verify Application**:
   ```bash
   curl https://your-domain.vercel.app/api/health
   ```

**Expected Downtime**: 5-10 minutes

---

### Scenario 3: Data Loss

**Symptoms**:

- Missing records
- Deleted data
- User reports data loss

**Recovery Steps**:

1. **Determine Scope**:
   - Identify what data was lost
   - Determine timeframe

2. **Locate Backup**:

   ```bash
   # Find backup before data loss
   ls -lh ./backups/ | grep "202510"
   ```

3. **Extract Specific Data**:

   ```bash
   # Restore to temporary database
   createdb temp_recovery

   # Load backup
   gunzip -c backup.sql.gz | psql temp_recovery

   # Export specific data
   psql temp_recovery -c "COPY (SELECT * FROM trips WHERE ...) TO '/tmp/recovery.csv' CSV HEADER"
   ```

4. **Import to Production**:

   ```bash
   # Import recovered data
   psql "$DATABASE_URL" -c "\COPY trips FROM '/tmp/recovery.csv' CSV HEADER"
   ```

5. **Verify Data**:
   - Check affected records
   - Verify data integrity

**Expected Downtime**: 1-2 hours

---

### Scenario 4: Complete System Failure

**Symptoms**:

- Vercel platform unavailable
- Database unreachable
- Multiple component failures

**Recovery Steps**:

1. **Assess Damage**:
   - Check Vercel status page
   - Check database provider status
   - Identify affected components

2. **Communicate Outage**:
   - Post status update
   - Notify stakeholders
   - Set expectations

3. **Restore from Backup**:

   a. **Setup New Database**:

   ```bash
   # Create new database instance
   # Update DATABASE_URL
   ```

   b. **Restore Data**:

   ```bash
   DATABASE_URL="new-database-url" \
   ./scripts/restore-database.sh ./backups/latest.sql.gz
   ```

   c. **Redeploy Application**:

   ```bash
   # Update environment variables
   # Redeploy on Vercel
   vercel --prod
   ```

4. **Verify All Systems**:
   - Database connectivity
   - API endpoints
   - Authentication
   - Key features

**Expected Downtime**: 2-4 hours

---

### Scenario 5: Security Breach

**Symptoms**:

- Unauthorized access
- Data breach
- Compromised credentials

**Immediate Actions**:

1. **Isolate System**:
   - Disable public access
   - Revoke API keys
   - Reset admin passwords

2. **Assess Breach**:
   - Review access logs
   - Identify compromised data
   - Determine breach scope

3. **Secure System**:

   ```bash
   # Rotate all secrets
   # Update JWT_SECRET
   # Regenerate OAuth credentials
   # Update database passwords
   ```

4. **Restore Clean State**:
   - Restore from backup before breach
   - Apply security patches
   - Update all credentials

5. **Notify Users**:
   - Inform affected users
   - Force password resets
   - Provide guidance

6. **Document Incident**:
   - Create incident report
   - Document timeline
   - Implement preventive measures

**Expected Downtime**: 4-8 hours

---

## Rollback Procedures

### Application Rollback

**Vercel Deployment Rollback**:

1. Go to Vercel Dashboard → Project → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

**Git-based Rollback**:

```bash
# Revert last commit
git revert HEAD
git push origin main

# Revert multiple commits
git revert HEAD~3..HEAD
git push origin main

# Hard reset (use with caution!)
git reset --hard <commit-hash>
git push --force origin main
```

### Database Rollback

**Schema Rollback**:

```bash
cd packages/backend

# View migration history
npx prisma migrate status

# Rollback last migration (NOT RECOMMENDED IN PRODUCTION)
# Instead, create new migration that reverses changes
npx prisma migrate dev --create-only
# Edit migration file to reverse changes
npx prisma migrate deploy
```

**Data Rollback**:

```bash
# Restore from backup
DATABASE_URL="your-url" \
./scripts/restore-database.sh ./backups/before-change.sql.gz
```

---

## Testing Recovery Procedures

### Quarterly Disaster Recovery Drill

**Schedule**: First Monday of each quarter

**Procedure**:

1. **Setup Test Environment**:
   - Create test database
   - Deploy to staging

2. **Simulate Failure**:
   - Choose random scenario
   - Execute failure

3. **Execute Recovery**:
   - Follow recovery procedures
   - Document time taken
   - Note issues

4. **Review and Improve**:
   - Update documentation
   - Fix identified issues
   - Train team

---

## Backup Verification

### Monthly Backup Test

```bash
# Restore to test database
createdb backup_test

# Load latest backup
gunzip -c ./backups/latest.sql.gz | psql backup_test

# Run integrity checks
psql backup_test -c "SELECT COUNT(*) FROM users;"
psql backup_test -c "SELECT COUNT(*) FROM trips;"

# Cleanup
dropdb backup_test
```

---

## Recovery Checklist

### Pre-Recovery

- [ ] Identify root cause
- [ ] Notify stakeholders
- [ ] Create backup of current state
- [ ] Prepare rollback plan
- [ ] Document start time

### During Recovery

- [ ] Follow documented procedures
- [ ] Log all actions taken
- [ ] Verify each step
- [ ] Communicate progress
- [ ] Monitor system status

### Post-Recovery

- [ ] Verify all systems operational
- [ ] Test key functionality
- [ ] Check data integrity
- [ ] Update monitoring
- [ ] Notify stakeholders
- [ ] Document lessons learned

---

## Prevention

### Regular Maintenance

- **Daily**: Automated backups
- **Weekly**: Backup verification
- **Monthly**: Security updates
- **Quarterly**: Disaster recovery drill
- **Annually**: Full security audit

### Monitoring

- Set up alerts for:
  - Database connection failures
  - High error rates
  - Unusual access patterns
  - Low disk space
  - Slow queries

---

## Additional Resources

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [User Manual](./USER_MANUAL.md)
- [API Documentation](./TRIP_API_REFERENCE.md)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Next Review**: January 2026
