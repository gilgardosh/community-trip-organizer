#!/bin/bash

# Test Database Setup Script
# This script starts the test database and runs migrations

set -e

echo "🚀 Starting test database..."

# Start the test database
docker-compose -f docker-compose.test.yml up -d

echo "⏳ Waiting for database to be ready..."
sleep 3

# Run migrations
echo "🔄 Running migrations..."
npx dotenv -e .env.test -- npx prisma migrate deploy

echo "✅ Test database is ready!"
echo ""
echo "To run tests, use: npm test"
echo "To stop the test database, use: docker-compose -f docker-compose.test.yml down"
