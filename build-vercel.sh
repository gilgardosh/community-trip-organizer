#!/bin/bash

# Vercel Build Script
# This script runs during the Vercel build process

set -e  # Exit on error

echo "🚀 Starting Vercel build..."

# Install dependencies
echo "📦 Installing dependencies..."
yarn install --immutable

# Build backend
echo "🔨 Building backend..."
cd packages/backend
yarn build
cd ../..

# Run database migrations (if DATABASE_URL is set)
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️  Running database migrations..."
  cd packages/backend
  npx prisma migrate deploy
  cd ../..
else
  echo "⚠️  DATABASE_URL not set, skipping migrations"
fi

# Build frontend
echo "🎨 Building frontend..."
cd packages/frontend
yarn build
cd ../..

echo "✅ Build completed successfully!"
