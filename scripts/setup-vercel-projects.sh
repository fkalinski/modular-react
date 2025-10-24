#!/bin/bash

# Vercel Monorepo Setup Script
# This script guides you through linking each app to Vercel as a monorepo project

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Navigate to project root (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔧 Vercel Monorepo Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Project root: $PROJECT_ROOT"
echo ""
echo "This script will help you:"
echo "1. Link each app to Vercel with proper monorepo configuration"
echo "2. Configure Root Directory for each project"
echo "3. Enable Turborepo remote cache"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Apps to configure
declare -a APPS=(
    "shared-components"
    "shared-data"
    "content-platform/shell"
    "content-platform/files-folders"
    "hubs-tab"
    "reports-tab"
    "user-tab"
    "top-level-shell"
)

echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${YELLOW}Step 1: Linking Projects${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "For each app, you'll be prompted to:"
echo "  • Choose your Vercel scope/team"
echo "  • Create a new project or link to existing"
echo "  • Set the project name"
echo ""
echo "${YELLOW}IMPORTANT: When asked 'In which directory is your code located?'${NC}"
echo "${YELLOW}Press ENTER to use the default (current directory).${NC}"
echo "${YELLOW}Vercel will automatically detect it's a monorepo.${NC}"
echo ""

read -p "Press ENTER to continue..."

for app in "${APPS[@]}"; do
    echo ""
    echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo "${BLUE}📦 Linking: ${app}${NC}"
    echo "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    cd "$app"

    # Link project
    echo "Running: vercel link"
    vercel link

    cd - > /dev/null

    echo "${GREEN}✅ Linked: ${app}${NC}"
done

echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${YELLOW}Step 2: Configure Root Directory (Manual)${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "For EACH project, go to Vercel Dashboard:"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select the project"
echo "3. Go to Settings → General"
echo "4. Set 'Root Directory' to the app path:"
echo ""
echo "   ${GREEN}shared-components${NC}                → Root Directory: ${BLUE}shared-components${NC}"
echo "   ${GREEN}shared-data${NC}                     → Root Directory: ${BLUE}shared-data${NC}"
echo "   ${GREEN}content-platform-shell${NC}          → Root Directory: ${BLUE}content-platform/shell${NC}"
echo "   ${GREEN}files-folders${NC}                   → Root Directory: ${BLUE}content-platform/files-folders${NC}"
echo "   ${GREEN}hubs-tab${NC}                        → Root Directory: ${BLUE}hubs-tab${NC}"
echo "   ${GREEN}reports-tab${NC}                     → Root Directory: ${BLUE}reports-tab${NC}"
echo "   ${GREEN}user-tab${NC}                        → Root Directory: ${BLUE}user-tab${NC}"
echo "   ${GREEN}top-level-shell${NC}                 → Root Directory: ${BLUE}top-level-shell${NC}"
echo ""
echo "5. Verify Build & Development Settings:"
echo "   • Build Command: Already configured in vercel.json"
echo "   • Output Directory: dist"
echo "   • Install Command: npm install"
echo ""

read -p "Press ENTER when all Root Directories are configured..."

echo ""
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${YELLOW}Step 3: Enable Turborepo Remote Cache${NC}"
echo "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Enabling remote cache will speed up builds significantly."
echo ""

# Login to Turbo
echo "Authenticating with Vercel..."
npx turbo login

echo ""
echo "Linking to Vercel Remote Cache..."
npx turbo link

echo ""
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}✅ Setup Complete!${NC}"
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Run deployment:"
echo "   ${GREEN}./scripts/deploy-vercel.sh${NC}"
echo ""
echo "2. After deployment, configure environment variables"
echo "   in Vercel Dashboard for Module Federation remote URLs"
echo ""
echo "3. Redeploy apps to use the new environment variables"
echo ""
echo "${GREEN}🎉 Your monorepo is ready for deployment!${NC}"
