#!/bin/bash

# Production Database Migration Script
# This script runs database migrations in production environments

set -e  # Exit on error

echo "🗄️  Production Database Migration"
echo "=================================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Show database connection (masked)
DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:]+).*/\1/')
echo "📍 Target database: $DB_HOST"

# Confirm migration in production
if [ "$NODE_ENV" = "production" ]; then
  echo "⚠️  You are about to run migrations in PRODUCTION"
  read -p "Are you sure you want to continue? (yes/no): " -r
  if [ "$REPLY" != "yes" ]; then
    echo "Migration cancelled"
    exit 0
  fi
fi

# Run migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

echo "✅ Migration completed successfully!"

# Show migration status
echo ""
echo "📊 Current migration status:"
npx prisma migrate status
