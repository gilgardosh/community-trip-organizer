#!/bin/bash

# Backend Deployment Test Script
# Tests the backend build and serverless function setup

set -e

echo "🔍 Testing Backend Deployment Setup..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}❌ Error: Must run from packages/backend directory${NC}"
  exit 1
fi

# Test 1: Verify api/index.ts exists
echo "Test 1: Checking serverless function entry point..."
if [ -f "api/index.ts" ]; then
  echo -e "${GREEN}✅ api/index.ts exists${NC}"
else
  echo -e "${RED}❌ api/index.ts not found${NC}"
  exit 1
fi

# Test 2: Verify vercel.json configuration
echo "Test 2: Checking vercel.json configuration..."
if [ -f "vercel.json" ]; then
  if grep -q '"rewrites"' vercel.json; then
    echo -e "${GREEN}✅ vercel.json has rewrites configuration${NC}"
  else
    echo -e "${YELLOW}⚠️  vercel.json missing rewrites configuration${NC}"
  fi
else
  echo -e "${RED}❌ vercel.json not found${NC}"
  exit 1
fi

# Test 3: Build the project
echo "Test 3: Building TypeScript project..."
if yarn build > /dev/null 2>&1; then
  echo -e "${GREEN}✅ TypeScript compilation successful${NC}"
else
  echo -e "${RED}❌ TypeScript compilation failed${NC}"
  echo "Run 'yarn build' to see detailed errors"
  exit 1
fi

# Test 4: Verify compiled serverless function
echo "Test 4: Checking compiled serverless function..."
if [ -f "dist/api/index.js" ]; then
  if grep -q "export default app" dist/api/index.js; then
    echo -e "${GREEN}✅ Serverless function exports app correctly${NC}"
  else
    echo -e "${RED}❌ Serverless function missing 'export default app'${NC}"
    exit 1
  fi
else
  echo -e "${RED}❌ dist/api/index.js not found after build${NC}"
  exit 1
fi

# Test 5: Check for app.listen() calls (shouldn't exist in serverless)
echo "Test 5: Checking for incompatible app.listen() calls..."
if grep -r "app.listen" src/ --exclude="*.test.ts" 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Warning: Found app.listen() calls in src/${NC}"
  echo -e "${YELLOW}   This is OK for local dev (src/index.ts) but ensure it's not used in production${NC}"
else
  echo -e "${GREEN}✅ No app.listen() calls found in src/${NC}"
fi

# Test 6: Verify Prisma client generation
echo "Test 6: Checking Prisma client..."
if [ -d "node_modules/@prisma/client" ]; then
  echo -e "${GREEN}✅ Prisma client is generated${NC}"
else
  echo -e "${YELLOW}⚠️  Prisma client not found, run: yarn prisma generate${NC}"
fi

# Test 7: Check for .vercelignore
echo "Test 7: Checking .vercelignore..."
if [ -f ".vercelignore" ]; then
  echo -e "${GREEN}✅ .vercelignore exists${NC}"
else
  echo -e "${YELLOW}⚠️  .vercelignore not found (optional but recommended)${NC}"
fi

# Test 8: Verify package.json type
echo "Test 8: Checking package.json module type..."
if grep -q '"type": "module"' package.json; then
  echo -e "${GREEN}✅ package.json has type: module${NC}"
else
  echo -e "${RED}❌ package.json missing 'type': 'module'${NC}"
  exit 1
fi

# Summary
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All deployment checks passed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "1. Commit and push changes to Git"
echo "2. Create a new Vercel project"
echo "3. Set Root Directory to: packages/backend"
echo "4. Add environment variables in Vercel dashboard"
echo "5. Deploy!"
echo ""
echo "📚 See VERCEL_DEPLOYMENT.md for detailed instructions"
echo "📋 Use DEPLOYMENT_CHECKLIST.md to verify deployment"
