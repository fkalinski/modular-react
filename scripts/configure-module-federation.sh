#!/bin/bash

# Configure Module Federation Environment Variables
# This script gets current production URLs and configures env vars WITHOUT redeploying
# Use this when apps are already deployed and you just need to update configuration
# Compatible with bash 3.2+ (macOS default)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.vercel"

# Load token
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo -e "${RED}❌ Error: .env.vercel file not found${NC}"
    exit 1
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}❌ Error: VERCEL_TOKEN not set${NC}"
    exit 1
fi

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}" >&2
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" >&2
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" >&2
}

log_error() {
    echo -e "${RED}❌ $1${NC}" >&2
}

# API helper
vercel_api() {
    local method="$1"
    local endpoint="$2"
    local data="$3"

    local url="https://api.vercel.com${endpoint}"

    if [ -n "$data" ]; then
        curl -s -X "$method" "$url" \
            -H "Authorization: Bearer $VERCEL_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data"
    else
        curl -s -X "$method" "$url" \
            -H "Authorization: Bearer $VERCEL_TOKEN"
    fi
}

# Get project ID
get_project_id() {
    local project_name="$1"
    local response=$(vercel_api "GET" "/v9/projects/$project_name")

    # Extract project ID - match "id" at the top level with prj_ prefix
    local project_id=$(echo "$response" | grep -o '"id":"prj_[^"]*"' | head -1 | cut -d'"' -f4)

    echo "$project_id"
}

# Get production URL for a project
get_production_url() {
    local project_name="$1"

    log_info "Getting production URL for $project_name..."

    local response=$(vercel_api "GET" "/v6/deployments?projectId=$project_name&limit=5&target=production")

    # Try to find a READY deployment
    local urls=$(echo "$response" | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
    local states=$(echo "$response" | grep -o '"readyState":"[^"]*"' | cut -d'"' -f4)

    # Combine URLs and states
    local i=1
    while read -r url && read -r state <&3; do
        if [ "$state" = "READY" ]; then
            echo "https://$url"
            return 0
        fi
        i=$((i + 1))
    done <<< "$urls" 3<<< "$states"

    # If no READY deployment, return first URL
    local first_url=$(echo "$urls" | head -1)
    if [ -n "$first_url" ]; then
        log_warning "$project_name: No READY deployment found, using latest: https://$first_url"
        echo "https://$first_url"
    else
        log_error "$project_name: No deployments found"
        echo ""
    fi
}

# Set environment variable
set_env_variable() {
    local project_name="$1"
    local key="$2"
    local value="$3"
    local targets="$4"

    log_info "Setting $key for $project_name..."

    local project_id=$(get_project_id "$project_name")

    if [ -z "$project_id" ]; then
        log_error "Could not find project ID for $project_name"
        return 1
    fi

    local targets_json=$(echo "$targets" | sed 's/,/","/g' | sed 's/^/["/' | sed 's/$/"]/')

    local data=$(cat <<EOF
{
  "key": "$key",
  "value": "$value",
  "type": "plain",
  "target": $targets_json
}
EOF
)

    local response=$(vercel_api "POST" "/v10/projects/$project_id/env?upsert=true" "$data")

    if echo "$response" | grep -q '"created"\|"updated"'; then
        log_success "Set $key"
        return 0
    else
        log_error "Failed to set $key: $response"
        return 1
    fi
}

# Main
main() {
    echo "" >&2
    echo "═══════════════════════════════════════════════════════" >&2
    echo "  ⚙️  Configure Module Federation URLs" >&2
    echo "═══════════════════════════════════════════════════════" >&2
    echo "" >&2

    # Step 1: Get all production URLs
    log_info "Step 1: Fetching production URLs..."
    echo "" >&2

    # Store URLs in variables (bash 3.2 compatible)
    # Note: Most match directory names, except shell (not content-platform-shell)
    local URL_SHARED_COMPONENTS=$(get_production_url "shared-components")
    local URL_SHARED_DATA=$(get_production_url "shared-data")
    local URL_HUBS_TAB=$(get_production_url "hubs-tab")
    local URL_REPORTS_TAB=$(get_production_url "reports-tab")
    local URL_USER_TAB=$(get_production_url "user-tab")
    local URL_FILES_FOLDERS=$(get_production_url "files-folders")
    local URL_CONTENT_SHELL=$(get_production_url "shell")

    echo "" >&2
    log_info "Found URLs:"
    echo "  • shared-components: $URL_SHARED_COMPONENTS" >&2
    echo "  • shared-data: $URL_SHARED_DATA" >&2
    echo "  • hubs-tab: $URL_HUBS_TAB" >&2
    echo "  • reports-tab: $URL_REPORTS_TAB" >&2
    echo "  • user-tab: $URL_USER_TAB" >&2
    echo "  • files-folders: $URL_FILES_FOLDERS" >&2
    echo "  • content-platform-shell: $URL_CONTENT_SHELL" >&2
    echo "" >&2

    # Step 2: Configure content-platform-shell (Vercel project name: "shell")
    log_info "Step 2: Configuring shell (content-platform-shell)..."
    echo "" >&2

    if [ -z "$URL_CONTENT_SHELL" ]; then
        log_warning "Skipping shell configuration (no deployment found)"
        log_info "Deploy shell first: cd content-platform/shell && vercel --prod"
    else
        set_env_variable "shell" \
            "REMOTE_SHARED_COMPONENTS_URL" \
            "$URL_SHARED_COMPONENTS" \
            "production,preview"

        set_env_variable "shell" \
            "REMOTE_SHARED_DATA_URL" \
            "$URL_SHARED_DATA" \
            "production,preview"

        set_env_variable "shell" \
            "REMOTE_FILES_TAB_URL" \
            "$URL_FILES_FOLDERS" \
            "production,preview"

        set_env_variable "shell" \
            "REMOTE_HUBS_TAB_URL" \
            "$URL_HUBS_TAB" \
            "production,preview"
    fi

    echo "" >&2

    # Step 3: Configure top-level-shell
    log_info "Step 3: Configuring top-level-shell..."
    echo "" >&2

    set_env_variable "top-level-shell" \
        "REMOTE_SHARED_COMPONENTS_URL" \
        "$URL_SHARED_COMPONENTS" \
        "production,preview"

    set_env_variable "top-level-shell" \
        "REMOTE_SHARED_DATA_URL" \
        "$URL_SHARED_DATA" \
        "production,preview"

    set_env_variable "top-level-shell" \
        "REMOTE_CONTENT_SHELL_URL" \
        "$URL_CONTENT_SHELL" \
        "production,preview"

    set_env_variable "top-level-shell" \
        "REMOTE_REPORTS_TAB_URL" \
        "$URL_REPORTS_TAB" \
        "production,preview"

    set_env_variable "top-level-shell" \
        "REMOTE_USER_TAB_URL" \
        "$URL_USER_TAB" \
        "production,preview"

    echo "" >&2
    echo "═══════════════════════════════════════════════════════" >&2
    echo "  ✨ Configuration Complete!" >&2
    echo "═══════════════════════════════════════════════════════" >&2
    echo "" >&2
    log_success "Module Federation URLs configured!"
    echo "" >&2
    log_info "Next steps:"
    echo "  1. Redeploy shell apps to pick up new environment variables:" >&2
    echo "     cd content-platform/shell && vercel --prod" >&2
    echo "     cd top-level-shell && vercel --prod" >&2
    echo "" >&2
    echo "  2. Or push to GitHub to trigger auto-deployment" >&2
    echo "" >&2
}

main "$@"
