#!/bin/bash

# Configure Vercel Project Root Directories using Vercel API
# This script sets the Root Directory for each project to enable proper monorepo builds

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔧 Configuring Vercel Project Settings"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Please install it first.${NC}"
    exit 1
fi

cd "$PROJECT_ROOT"

# Function to get project ID from .vercel/project.json
get_project_id() {
    local app_dir=$1
    local project_file="$app_dir/.vercel/project.json"

    if [ -f "$project_file" ]; then
        cat "$project_file" | grep -o '"projectId":"[^"]*"' | cut -d'"' -f4
    fi
}

# Function to get org ID
get_org_id() {
    local app_dir=$1
    local project_file="$app_dir/.vercel/project.json"

    if [ -f "$project_file" ]; then
        cat "$project_file" | grep -o '"orgId":"[^"]*"' | cut -d'"' -f4
    fi
}

# Get token
echo -e "${YELLOW}Getting Vercel token...${NC}"
VERCEL_TOKEN=$(vercel whoami --token 2>&1 | grep -o 'token: .*' | cut -d' ' -f2)

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}No cached token found. Please authenticate...${NC}"
    vercel login
    VERCEL_TOKEN=$(vercel whoami --token 2>&1 | grep -o 'token: .*' | cut -d' ' -f2)
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}❌ Failed to get Vercel token. Please run: vercel login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token obtained${NC}"
echo ""

# Define projects with their root directories
declare -a PROJECTS=(
    "shared-components:shared-components"
    "shared-data:shared-data"
    "content-platform/shell:content-platform/shell"
    "content-platform/files-folders:content-platform/files-folders"
    "hubs-tab:hubs-tab"
    "reports-tab:reports-tab"
    "user-tab:user-tab"
    "top-level-shell:top-level-shell"
)

configure_project() {
    local app_dir=$1
    local root_dir=$2

    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📦 Configuring: ${app_dir}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    PROJECT_ID=$(get_project_id "$app_dir")

    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ No project ID found for ${app_dir}${NC}"
        echo -e "${YELLOW}   Run: cd ${app_dir} && vercel link${NC}"
        return 1
    fi

    echo "Project ID: $PROJECT_ID"
    echo "Root Directory: $root_dir"

    # Update project settings via API
    echo "Updating settings..."

    RESPONSE=$(curl -s -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID" \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"rootDirectory\": \"$root_dir\"
        }")

    if echo "$RESPONSE" | grep -q "\"rootDirectory\""; then
        echo -e "${GREEN}✅ Configured successfully${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ Failed to configure${NC}"
        echo "Response: $RESPONSE"
        echo ""
        return 1
    fi
}

# Configure each project
SUCCESS_COUNT=0
FAIL_COUNT=0

for project in "${PROJECTS[@]}"; do
    IFS=':' read -r app_dir root_dir <<< "$project"

    if configure_project "$app_dir" "$root_dir"; then
        ((SUCCESS_COUNT++))
    else
        ((FAIL_COUNT++))
    fi
done

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Configuration Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Results:"
echo -e "  ${GREEN}Success: ${SUCCESS_COUNT}${NC}"
echo -e "  ${RED}Failed: ${FAIL_COUNT}${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Redeploy all apps:"
    echo -e "   ${GREEN}./scripts/deploy-vercel.sh${NC}"
    echo ""
    echo "2. Check deployment status:"
    echo "   vercel ls"
else
    echo -e "${YELLOW}⚠️  Some projects failed to configure.${NC}"
    echo "Please link them manually:"
    echo "  cd <app-dir>"
    echo "  vercel link"
    echo ""
    echo "Then run this script again."
fi
