#!/bin/bash

# Vercel Monorepo Deployment Script
# Deploys all apps in dependency order with proper Turborepo integration
# Compatible with Bash 3.x (macOS default)

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# Navigate to project root (parent of scripts directory)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Starting Vercel Monorepo Deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel@latest
fi

# Temporary file to store deployment URLs
URLS_FILE=$(mktemp)
trap "rm -f $URLS_FILE" EXIT

deploy_app() {
    local app_path=$1
    local app_name=$2

    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📦 Deploying: ${app_name}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    cd "$app_path"

    # Deploy to production and capture URL
    DEPLOYMENT_URL=$(vercel --prod --yes 2>&1 | tee /dev/tty | grep -o 'https://[^ ]*' | tail -1)

    if [ -n "$DEPLOYMENT_URL" ]; then
        echo "${app_name}=${DEPLOYMENT_URL}" >> "$URLS_FILE"
        echo -e "${GREEN}✅ Deployed: ${DEPLOYMENT_URL}${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Could not extract deployment URL${NC}"
    fi

    cd - > /dev/null
}

echo -e "${BLUE}Phase 1: Deploying Shared Modules${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Shared Components (no dependencies)
deploy_app "shared-components" "shared-components"

# 2. Shared Data (no dependencies)
deploy_app "shared-data" "shared-data"

echo ""
echo -e "${BLUE}Phase 2: Deploying Tab Modules${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 3. Files & Folders Tab (depends on shared modules)
deploy_app "content-platform/files-folders" "files-folders"

# 4. Hubs Tab (depends on shared modules)
deploy_app "hubs-tab" "hubs-tab"

# 5. Reports Tab (depends on shared modules)
deploy_app "reports-tab" "reports-tab"

# 6. User Tab (depends on shared modules)
deploy_app "user-tab" "user-tab"

echo ""
echo -e "${BLUE}Phase 3: Deploying Shell Applications${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 7. Content Platform Shell (depends on tabs)
deploy_app "content-platform/shell" "content-platform-shell"

# 8. Top Level Shell (depends on everything)
deploy_app "top-level-shell" "top-level-shell"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Print deployment URLs summary
echo -e "${BLUE}📋 Deployment URLs Summary:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "$URLS_FILE" ] && [ -s "$URLS_FILE" ]; then
    while IFS='=' read -r app_name url; do
        if [ -n "$app_name" ] && [ -n "$url" ]; then
            echo -e "${GREEN}${app_name}:${NC}"
            echo "  ${url}"
            echo ""
        fi
    done < "$URLS_FILE"
fi

# Save URLs to permanent file
echo "💾 Saving deployment URLs to deployment-urls.txt..."
{
    echo "# Vercel Deployment URLs"
    echo "# Generated: $(date)"
    echo ""
    cat "$URLS_FILE"
} > deployment-urls.txt

echo -e "${GREEN}✅ URLs saved to deployment-urls.txt${NC}"
echo ""

# Helper function to get URL for an app
get_url() {
    local app_name=$1
    grep "^${app_name}=" "$URLS_FILE" 2>/dev/null | cut -d'=' -f2
}

# Print environment variables template
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "1. Update Module Federation remote URLs in webpack configs"
echo "2. OR set these environment variables in Vercel for each app:"
echo ""
echo "   For top-level-shell:"

SHARED_COMP_URL=$(get_url "shared-components")
SHARED_DATA_URL=$(get_url "shared-data")
CONTENT_SHELL_URL=$(get_url "content-platform-shell")
REPORTS_TAB_URL=$(get_url "reports-tab")
USER_TAB_URL=$(get_url "user-tab")
FILES_TAB_URL=$(get_url "files-folders")
HUBS_TAB_URL=$(get_url "hubs-tab")

[ -n "$SHARED_COMP_URL" ] && echo "   REMOTE_SHARED_COMPONENTS_URL=${SHARED_COMP_URL}"
[ -n "$SHARED_DATA_URL" ] && echo "   REMOTE_SHARED_DATA_URL=${SHARED_DATA_URL}"
[ -n "$CONTENT_SHELL_URL" ] && echo "   REMOTE_CONTENT_SHELL_URL=${CONTENT_SHELL_URL}"
[ -n "$REPORTS_TAB_URL" ] && echo "   REMOTE_REPORTS_TAB_URL=${REPORTS_TAB_URL}"
[ -n "$USER_TAB_URL" ] && echo "   REMOTE_USER_TAB_URL=${USER_TAB_URL}"

echo ""
echo "   For content-platform-shell:"
[ -n "$SHARED_COMP_URL" ] && echo "   REMOTE_SHARED_COMPONENTS_URL=${SHARED_COMP_URL}"
[ -n "$SHARED_DATA_URL" ] && echo "   REMOTE_SHARED_DATA_URL=${SHARED_DATA_URL}"
[ -n "$FILES_TAB_URL" ] && echo "   REMOTE_FILES_TAB_URL=${FILES_TAB_URL}"
[ -n "$HUBS_TAB_URL" ] && echo "   REMOTE_HUBS_TAB_URL=${HUBS_TAB_URL}"

echo ""
echo "3. Redeploy apps after setting environment variables"
echo "4. Test all apps and verify Module Federation is working"
echo ""
echo -e "${GREEN}🎉 Happy deploying!${NC}"
