#!/bin/bash

# Configure Vercel Project Root Directories using API
# Usage: VERCEL_TOKEN=your_token ./set-root-directories.sh

set -e

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔧 Configuring Vercel Project Root Directories"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check for token
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}❌ VERCEL_TOKEN environment variable not set${NC}"
    echo ""
    echo "Usage:"
    echo "  VERCEL_TOKEN=your_token $0"
    echo ""
    exit 1
fi

cd "$PROJECT_ROOT"

# Function to get project ID from .vercel/project.json
get_project_id() {
    local app_dir=$1
    local project_file="$app_dir/.vercel/project.json"

    if [ -f "$project_file" ]; then
        grep -o '"projectId":"[^"]*"' "$project_file" | cut -d'"' -f4
    fi
}

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
    echo -e "${BLUE}   Root Directory: ${root_dir}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    PROJECT_ID=$(get_project_id "$app_dir")

    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ No project ID found for ${app_dir}${NC}"
        echo -e "${YELLOW}   Skipping...${NC}"
        echo ""
        return 1
    fi

    echo "Project ID: $PROJECT_ID"

    # Update project settings via API
    RESPONSE=$(curl -s -X PATCH "https://api.vercel.com/v9/projects/$PROJECT_ID" \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"rootDirectory\": \"$root_dir\"}")

    # Check if successful
    if echo "$RESPONSE" | grep -q '"rootDirectory"'; then
        echo -e "${GREEN}✅ Configured successfully${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}❌ Failed to configure${NC}"
        if echo "$RESPONSE" | grep -q "error"; then
            ERROR_MSG=$(echo "$RESPONSE" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
            echo "Error: $ERROR_MSG"
        fi
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
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "  ${RED}Failed: ${FAIL_COUNT}${NC}"
fi
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${BLUE}✅ All projects configured successfully!${NC}"
    echo ""
    echo "Next step: Redeploy all apps"
    echo -e "   ${GREEN}./scripts/deploy-vercel.sh${NC}"
else
    echo -e "${YELLOW}⚠️  Some projects failed to configure.${NC}"
    echo "Check the errors above and ensure all projects are linked."
fi
