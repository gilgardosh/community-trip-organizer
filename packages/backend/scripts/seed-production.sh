#!/bin/bash

# Production Database Seeding Script
# Seeds the database with initial data for production

set -e  # Exit on error

echo "🌱 Production Database Seeding"
echo "=============================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Show database connection (masked)
DB_HOST=$(echo $DATABASE_URL | sed -E 's/.*@([^:]+).*/\1/')
echo "📍 Target database: $DB_HOST"

# Confirm seeding in production
if [ "$NODE_ENV" = "production" ]; then
  echo "⚠️  You are about to seed the PRODUCTION database"
  echo "⚠️  This will create initial data (super-admin, etc.)"
  read -p "Are you sure you want to continue? (yes/no): " -r
  if [ "$REPLY" != "yes" ]; then
    echo "Seeding cancelled"
    exit 0
  fi
fi

# Run seed script
echo "🌱 Seeding database..."
tsx prisma/seed.ts

echo "✅ Seeding completed successfully!"
