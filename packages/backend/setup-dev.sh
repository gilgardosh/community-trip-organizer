#!/bin/bash

# Community Trip Organizer - Development Setup Script
# This script sets up the development environment with Docker

set -e

echo "🚀 Setting up Community Trip Organizer Development Environment..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Navigate to backend directory
cd "$(dirname "$0")"

echo "📦 Starting PostgreSQL with Docker..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if database is healthy
if docker-compose exec -T postgres pg_isready -U user -d mydb > /dev/null 2>&1; then
    echo "✅ Database is ready!"
else
    echo "⚠️  Database is starting up, waiting a bit longer..."
    sleep 5
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please review and update if needed."
    else
        echo "❌ Error: .env.example not found. Please create .env manually."
        exit 1
    fi
fi

echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

echo "🌱 Seeding database with development data..."
yarn db:seed

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📚 Quick Reference:"
echo "   - Database: postgresql://user:password@localhost:5432/mydb"
echo "   - Prisma Studio: npx prisma studio"
echo "   - API Server: yarn dev"
echo ""
echo "🎯 Next steps:"
echo "   1. Review .env file and update if needed"
echo "   2. Start the development server: yarn dev"
echo "   3. Check SEED_DATA.md for login credentials"
echo ""
echo "🛠️  Useful commands:"
echo "   - View logs: docker-compose logs -f postgres"
echo "   - Stop database: docker-compose down"
echo "   - Reset database: yarn db:reset"
echo ""
