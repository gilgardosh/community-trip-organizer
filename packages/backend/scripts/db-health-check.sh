#!/bin/bash

# Database Health Check Script
# Verifies database connectivity and status

set -e  # Exit on error

echo "🏥 Database Health Check"
echo "======================="

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "🔍 Checking database connection..."

# Try to connect and run a simple query
if npx prisma db execute --url "$DATABASE_URL" --stdin <<EOF
SELECT 1 as health_check;
EOF
then
  echo "✅ Database connection: OK"
else
  echo "❌ Database connection: FAILED"
  exit 1
fi

# Check migration status
echo ""
echo "🔍 Checking migration status..."
if npx prisma migrate status; then
  echo "✅ Migration status: OK"
else
  echo "⚠️  Warning: Pending migrations detected"
fi

# Get database version
echo ""
echo "📊 Database information:"
npx prisma db execute --url "$DATABASE_URL" --stdin <<EOF
SELECT version();
EOF

echo ""
echo "✅ Health check completed!"
