#!/bin/bash

# Database Restore Script
# Restores database from backup file

set -e  # Exit on error

echo "🔄 Database Restore Script"
echo "=========================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "❌ Error: No backup file specified"
  echo "Usage: ./restore-database.sh <backup-file>"
  echo ""
  echo "Available backups:"
  ls -lh ./backups/backup_*.sql.gz 2>/dev/null || echo "No backups found"
  exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Show backup info
echo "📁 Backup file: $BACKUP_FILE"
echo "📦 File size: $(du -h "$BACKUP_FILE" | cut -f1)"
echo ""

# Warning for production
if [ "$NODE_ENV" = "production" ]; then
  echo "⚠️  WARNING: You are about to restore to PRODUCTION!"
  echo "⚠️  This will OVERWRITE all current data!"
  echo ""
  read -p "Type 'RESTORE' to continue: " -r
  if [ "$REPLY" != "RESTORE" ]; then
    echo "Restore cancelled"
    exit 0
  fi
fi

# Extract database name
DB_NAME=$(echo $DATABASE_URL | sed -E 's/.*\/([^?]+).*/\1/')
echo "📊 Target database: $DB_NAME"

# Create backup of current state before restore
echo ""
echo "📸 Creating backup of current state..."
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CURRENT_BACKUP="./backups/pre_restore_${TIMESTAMP}.sql.gz"
pg_dump "$DATABASE_URL" | gzip > "$CURRENT_BACKUP"
echo "✅ Current state backed up to: $CURRENT_BACKUP"

# Decompress if needed
RESTORE_FILE="$BACKUP_FILE"
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo ""
  echo "🗜️  Decompressing backup..."
  RESTORE_FILE="${BACKUP_FILE%.gz}"
  gunzip -c "$BACKUP_FILE" > "$RESTORE_FILE"
  TEMP_FILE="$RESTORE_FILE"
fi

# Restore database
echo ""
echo "🔄 Restoring database..."
if psql "$DATABASE_URL" < "$RESTORE_FILE"; then
  echo "✅ Database restored successfully!"
else
  echo "❌ Restore failed!"
  echo "⚠️  Your data has been backed up to: $CURRENT_BACKUP"
  exit 1
fi

# Cleanup temporary file
if [ -n "$TEMP_FILE" ]; then
  rm -f "$TEMP_FILE"
fi

# Run migrations to ensure schema is up to date
echo ""
echo "🔄 Running migrations..."
npx prisma migrate deploy

echo ""
echo "✅ Restore completed successfully!"
echo "📸 Previous state saved to: $CURRENT_BACKUP"
