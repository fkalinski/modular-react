#!/bin/bash

# Get Production Deployment URLs
# Run this after deployments are complete

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking Vercel Production Deployments${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Define apps
APPS=(
    "shared-components"
    "shared-data"
    "hubs-tab"
    "reports-tab"
    "user-tab"
    "top-level-shell"
)

NESTED_APPS=(
    "content-platform/shell:content-platform-shell"
    "content-platform/files-folders:files-folders"
)

# Temporary file for URLs
URLS_FILE=$(mktemp)
trap "rm -f $URLS_FILE" EXIT

check_deployment() {
    local app_dir=$1
    local app_name=$2

    echo -e "${BLUE}📦 ${app_name}${NC}"

    OUTPUT=$(vercel ls --prod --cwd "$app_dir" 2>&1)

    # Get the latest ready deployment
    READY_URL=$(echo "$OUTPUT" | grep "● Ready" | head -1 | awk '{print $2}')

    if [ -n "$READY_URL" ]; then
        echo -e "  ${GREEN}✅ Ready: ${READY_URL}${NC}"
        echo "${app_name}=${READY_URL}" >> "$URLS_FILE"
        return 0
    fi

    # Check if building
    BUILDING=$(echo "$OUTPUT" | grep "● Building" | head -1)
    if [ -n "$BUILDING" ]; then
        echo -e "  ${YELLOW}🔄 Building...${NC}"
        return 1
    fi

    # Check for errors
    ERROR_URL=$(echo "$OUTPUT" | grep "● Error" | head -1 | awk '{print $2}')
    if [ -n "$ERROR_URL" ]; then
        echo -e "  ${RED}❌ Error: ${ERROR_URL}${NC}"
        echo -e "  ${YELLOW}Check logs: vercel logs ${ERROR_URL}${NC}"
        return 1
    fi

    echo -e "  ${YELLOW}⏳ No deployment found${NC}"
    return 1
}

# Check all apps
READY_COUNT=0
TOTAL_COUNT=0

for app in "${APPS[@]}"; do
    ((TOTAL_COUNT++))
    if check_deployment "$app" "$app"; then
        ((READY_COUNT++))
    fi
    echo ""
done

for app_info in "${NESTED_APPS[@]}"; do
    IFS=':' read -r app_dir app_name <<< "$app_info"
    ((TOTAL_COUNT++))
    if check_deployment "$app_dir" "$app_name"; then
        ((READY_COUNT++))
    fi
    echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}Status: ${GREEN}${READY_COUNT}${NC}/${TOTAL_COUNT} deployments ready${NC}"
echo ""

if [ $READY_COUNT -eq $TOTAL_COUNT ]; then
    echo -e "${GREEN}✅ All deployments are ready!${NC}"
    echo ""

    # Save to file
    echo "💾 Saving URLs to deployment-urls.txt..."
    {
        echo "# Vercel Production Deployment URLs"
        echo "# Generated: $(date)"
        echo ""
        cat "$URLS_FILE"
    } > deployment-urls.txt

    echo -e "${GREEN}✅ URLs saved to deployment-urls.txt${NC}"
    echo ""

    # Show environment variables
    echo -e "${BLUE}📝 Environment Variables for Module Federation:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "For top-level-shell:"
    grep "shared-components=" "$URLS_FILE" | sed 's/shared-components=/REMOTE_SHARED_COMPONENTS_URL=/'
    grep "shared-data=" "$URLS_FILE" | sed 's/shared-data=/REMOTE_SHARED_DATA_URL=/'
    grep "content-platform-shell=" "$URLS_FILE" | sed 's/content-platform-shell=/REMOTE_CONTENT_SHELL_URL=/'
    grep "reports-tab=" "$URLS_FILE" | sed 's/reports-tab=/REMOTE_REPORTS_TAB_URL=/'
    grep "user-tab=" "$URLS_FILE" | sed 's/user-tab=/REMOTE_USER_TAB_URL=/'
    echo ""
    echo "For content-platform-shell:"
    grep "shared-components=" "$URLS_FILE" | sed 's/shared-components=/REMOTE_SHARED_COMPONENTS_URL=/'
    grep "shared-data=" "$URLS_FILE" | sed 's/shared-data=/REMOTE_SHARED_DATA_URL=/'
    grep "files-folders=" "$URLS_FILE" | sed 's/files-folders=/REMOTE_FILES_TAB_URL=/'
    grep "hubs-tab=" "$URLS_FILE" | sed 's/hubs-tab=/REMOTE_HUBS_TAB_URL=/'
else
    echo -e "${YELLOW}⏳ Waiting for deployments to complete...${NC}"
    echo ""
    echo "Run this script again in a few minutes:"
    echo -e "  ${GREEN}./scripts/get-deployment-urls.sh${NC}"
fi
