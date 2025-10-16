#!/bin/bash

# Database Backup Script
# Creates compressed backup of PostgreSQL database

set -e  # Exit on error

echo "🗄️  Database Backup Script"
echo "========================="

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.sql"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Extract database name for logging
DB_NAME=$(echo $DATABASE_URL | sed -E 's/.*\/([^?]+).*/\1/')
echo "📊 Database: $DB_NAME"
echo "📁 Backup directory: $BACKUP_DIR"
echo "⏰ Timestamp: $TIMESTAMP"

# Create backup
echo ""
echo "🔄 Creating backup..."
if pg_dump "$DATABASE_URL" > "$BACKUP_FILE"; then
  echo "✅ Backup created: $BACKUP_FILE"
else
  echo "❌ Backup failed!"
  exit 1
fi

# Compress backup
echo ""
echo "🗜️  Compressing backup..."
if gzip "$BACKUP_FILE"; then
  echo "✅ Backup compressed: ${BACKUP_FILE}.gz"
  BACKUP_FILE="${BACKUP_FILE}.gz"
else
  echo "⚠️  Compression failed, keeping uncompressed backup"
fi

# Calculate backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "📦 Backup size: $BACKUP_SIZE"

# Clean old backups
echo ""
echo "🧹 Cleaning old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "✅ Cleanup completed"

# List recent backups
echo ""
echo "📋 Recent backups:"
ls -lh "$BACKUP_DIR"/backup_*.sql.gz | tail -5

echo ""
echo "✅ Backup completed successfully!"
echo "📁 Backup file: $BACKUP_FILE"

# Optional: Upload to cloud storage
if [ -n "$S3_BUCKET" ]; then
  echo ""
  echo "☁️  Uploading to S3..."
  aws s3 cp "$BACKUP_FILE" "s3://${S3_BUCKET}/backups/"
  echo "✅ Uploaded to S3"
fi
