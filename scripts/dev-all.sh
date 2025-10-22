#!/bin/bash

# Development helper script to run all modules concurrently
# Each module represents a separate "repository" in production

echo "🚀 Starting Modular React Platform (all modules)..."
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kill all background processes on exit
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install dependencies if needed
cd shared-components && npm install --silent 2>/dev/null && cd .. &
cd shared-data && npm install --silent 2>/dev/null && cd .. &
cd top-level-shell && npm install --silent 2>/dev/null && cd .. &
cd reports-tab && npm install --silent 2>/dev/null && cd .. &
cd user-tab && npm install --silent 2>/dev/null && cd .. &
cd hubs-tab && npm install --silent 2>/dev/null && cd .. &
cd content-platform/shell && npm install --silent 2>/dev/null && cd ../.. &
cd content-platform/files-folders && npm install --silent 2>/dev/null && cd ../.. &

wait

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""
echo -e "${BLUE}🏗️  Starting development servers...${NC}"
echo ""

# Start all dev servers
cd shared-components && npm run dev > /tmp/shared-components.log 2>&1 &
echo -e "${GREEN}✓${NC} Shared Components: http://localhost:3001"

sleep 2

cd shared-data && npm run dev > /tmp/shared-data.log 2>&1 &
echo -e "${GREEN}✓${NC} Shared Data: http://localhost:3002"

sleep 2

cd content-platform/shell && npm run dev > /tmp/content-shell.log 2>&1 &
echo -e "${GREEN}✓${NC} Content Shell: http://localhost:3003"

sleep 2

cd content-platform/files-folders && npm run dev > /tmp/files-tab.log 2>&1 &
echo -e "${GREEN}✓${NC} Files Tab: http://localhost:3004"

sleep 2

cd hubs-tab && npm run dev > /tmp/hubs-tab.log 2>&1 &
echo -e "${GREEN}✓${NC} Hubs Tab: http://localhost:3005"

sleep 2

cd reports-tab && npm run dev > /tmp/reports-tab.log 2>&1 &
echo -e "${GREEN}✓${NC} Reports Tab: http://localhost:3006"

sleep 2

cd user-tab && npm run dev > /tmp/user-tab.log 2>&1 &
echo -e "${GREEN}✓${NC} User Tab: http://localhost:3007"

sleep 2

cd top-level-shell && npm run dev > /tmp/top-level-shell.log 2>&1 &
echo -e "${GREEN}✓${NC} Top-Level Shell: http://localhost:3000"

echo ""
echo -e "${GREEN}🎉 All services started!${NC}"
echo ""
echo -e "${BLUE}📱 Access the platform:${NC}"
echo "   Main Application: http://localhost:3000"
echo ""
echo -e "${BLUE}📋 Logs available in /tmp/*.log${NC}"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait
