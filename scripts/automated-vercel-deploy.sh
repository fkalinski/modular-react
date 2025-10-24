#!/bin/bash

# Vercel Deployment Automation Script
# This script automates the entire Vercel deployment workflow:
# 1. Triggers deployments for all apps
# 2. Waits for deployments to complete
# 3. Gets deployment URLs
# 4. Configures Module Federation environment variables
# 5. Redeploys shell apps with updated URLs
#
# Compatible with bash 3.2+ (macOS default)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.vercel"
MAX_WAIT_TIME=600  # 10 minutes
CHECK_INTERVAL=30  # Check every 30 seconds

# Load Vercel token
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo -e "${RED}❌ Error: .env.vercel file not found${NC}"
    echo "Please run: echo 'VERCEL_TOKEN=your_token' > .env.vercel"
    exit 1
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}❌ Error: VERCEL_TOKEN not set${NC}"
    exit 1
fi

# Storage for deployment URLs (parallel arrays)
DEPLOYMENT_URL_NAMES=()
DEPLOYMENT_URL_VALUES=()

# Helper function: Get project directory from project name
get_project_dir() {
    local project_name="$1"
    case "$project_name" in
        "shared-components")
            echo "shared-components"
            ;;
        "shared-data")
            echo "shared-data"
            ;;
        "hubs-tab")
            echo "hubs-tab"
            ;;
        "reports-tab")
            echo "reports-tab"
            ;;
        "user-tab")
            echo "user-tab"
            ;;
        "content-platform-shell")
            echo "content-platform/shell"
            ;;
        "files-folders")
            echo "content-platform/files-folders"
            ;;
        "top-level-shell")
            echo "top-level-shell"
            ;;
        *)
            echo ""
            ;;
    esac
}

# Helper function: Get MF dependencies for a shell
get_mf_dependencies() {
    local shell_name="$1"
    case "$shell_name" in
        "top-level-shell")
            echo "REMOTE_SHARED_COMPONENTS_URL REMOTE_SHARED_DATA_URL REMOTE_CONTENT_SHELL_URL REMOTE_REPORTS_TAB_URL REMOTE_USER_TAB_URL"
            ;;
        "content-platform-shell")
            echo "REMOTE_SHARED_COMPONENTS_URL REMOTE_SHARED_DATA_URL REMOTE_FILES_TAB_URL REMOTE_HUBS_TAB_URL"
            ;;
        *)
            echo ""
            ;;
    esac
}

# Helper function: Map env var name to project name
get_project_from_env_var() {
    local env_var="$1"
    case "$env_var" in
        "REMOTE_SHARED_COMPONENTS_URL")
            echo "shared-components"
            ;;
        "REMOTE_SHARED_DATA_URL")
            echo "shared-data"
            ;;
        "REMOTE_CONTENT_SHELL_URL")
            echo "content-platform-shell"
            ;;
        "REMOTE_REPORTS_TAB_URL")
            echo "reports-tab"
            ;;
        "REMOTE_USER_TAB_URL")
            echo "user-tab"
            ;;
        "REMOTE_FILES_TAB_URL")
            echo "files-folders"
            ;;
        "REMOTE_HUBS_TAB_URL")
            echo "hubs-tab"
            ;;
        *)
            echo ""
            ;;
    esac
}

# Helper function: Store deployment URL
store_deployment_url() {
    local name="$1"
    local url="$2"
    DEPLOYMENT_URL_NAMES+=("$name")
    DEPLOYMENT_URL_VALUES+=("$url")
}

# Helper function: Get deployment URL
get_deployment_url() {
    local name="$1"
    local i
    for i in "${!DEPLOYMENT_URL_NAMES[@]}"; do
        if [ "${DEPLOYMENT_URL_NAMES[$i]}" = "$name" ]; then
            echo "${DEPLOYMENT_URL_VALUES[$i]}"
            return 0
        fi
    done
    echo ""
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to call Vercel API
vercel_api() {
    local method="$1"
    local endpoint="$2"
    local data="$3"

    local url="https://api.vercel.com${endpoint}"
    local response

    if [ -n "$data" ]; then
        response=$(curl -s -X "$method" "$url" \
            -H "Authorization: Bearer $VERCEL_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -X "$method" "$url" \
            -H "Authorization: Bearer $VERCEL_TOKEN")
    fi

    echo "$response"
}

# Function to get project ID from name
get_project_id() {
    local project_name="$1"
    local response=$(vercel_api "GET" "/v9/projects/$project_name")
    echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
}

# Function to trigger deployment
trigger_deployment() {
    local project_name="$1"
    local project_dir="$2"

    log_info "Triggering deployment for $project_name..."

    # Deploy using --cwd to avoid directory changes and force a new build
    local output=$(vercel --cwd "$PROJECT_ROOT/$project_dir" --prod --yes --force 2>&1)
    local deployment_url=$(echo "$output" | grep -E "https://.*\.vercel\.app" | tail -1 | awk '{print $NF}')

    if [ -n "$deployment_url" ]; then
        log_success "Deployment triggered: $deployment_url"
        echo "$deployment_url"
    else
        log_error "Failed to trigger deployment for $project_name"
        echo ""
    fi
}

# Function to check deployment status
check_deployment_status() {
    local deployment_url="$1"

    # Use Vercel API to get deployment by URL
    local url_without_protocol=$(echo "$deployment_url" | sed 's|https://||')
    local response=$(vercel_api "GET" "/v13/deployments/get?url=$url_without_protocol")
    local status=$(echo "$response" | grep -o '"readyState":"[^"]*"' | head -1 | cut -d'"' -f4)

    echo "$status"
}

# Function to wait for deployment
wait_for_deployment() {
    local project_name="$1"
    local deployment_url="$2"
    local start_time=$(date +%s)

    log_info "Waiting for $project_name deployment to complete..."

    while true; do
        local status=$(check_deployment_status "$deployment_url")
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))

        case "$status" in
            "READY")
                log_success "$project_name deployment ready!"
                return 0
                ;;
            "ERROR"|"CANCELED")
                log_error "$project_name deployment failed with status: $status"
                return 1
                ;;
            *)
                if [ $elapsed -gt $MAX_WAIT_TIME ]; then
                    log_error "$project_name deployment timeout after ${MAX_WAIT_TIME}s"
                    return 1
                fi
                echo -ne "\r${YELLOW}⏳ Status: $status | Elapsed: ${elapsed}s${NC}"
                sleep $CHECK_INTERVAL
                ;;
        esac
    done
    echo ""  # New line after progress
}

# Function to get production deployment URL
get_production_url() {
    local project_name="$1"

    # List deployments for the project
    local response=$(vercel_api "GET" "/v6/deployments?projectId=$project_name&limit=1&target=production")
    local url=$(echo "$response" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

    if [ -n "$url" ]; then
        echo "https://$url"
    else
        echo ""
    fi
}

# Function to set environment variable via API
set_env_variable() {
    local project_name="$1"
    local key="$2"
    local value="$3"
    local targets="$4"  # e.g., "production,preview"

    log_info "Setting $key for $project_name..."

    # Get project ID
    local project_id=$(get_project_id "$project_name")

    if [ -z "$project_id" ]; then
        log_error "Could not find project ID for $project_name"
        return 1
    fi

    # Convert comma-separated targets to JSON array
    local targets_json=$(echo "$targets" | sed 's/,/","/g' | sed 's/^/["/' | sed 's/$/"]/')

    # Create or update env var
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

    if echo "$response" | grep -q '"created"'; then
        log_success "Environment variable $key set"
        return 0
    else
        log_error "Failed to set $key: $response"
        return 1
    fi
}

# Function to configure Module Federation URLs for a shell
configure_shell_env() {
    local shell_name="$1"
    local dependencies=$(get_mf_dependencies "$shell_name")

    log_info "Configuring Module Federation URLs for $shell_name..."

    for env_var in $dependencies; do
        local remote_project=$(get_project_from_env_var "$env_var")
        local remote_url=$(get_deployment_url "$remote_project")

        if [ -n "$remote_url" ]; then
            set_env_variable "$shell_name" "$env_var" "$remote_url" "production,preview"
        else
            log_warning "No URL found for $env_var (maps to $remote_project)"
        fi
    done
}

# Main deployment workflow
main() {
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  🚀 Vercel Automated Deployment"
    echo "═══════════════════════════════════════════════════════"
    echo ""

    # Step 1: Deploy all non-shell apps first
    log_info "Step 1: Deploying foundational apps..."
    echo ""

    local foundational_apps=("shared-components" "shared-data" "hubs-tab" "reports-tab" "user-tab" "files-folders")

    # Temporary storage (parallel arrays)
    local temp_url_names=()
    local temp_url_values=()

    for app in "${foundational_apps[@]}"; do
        local project_dir=$(get_project_dir "$app")
        local url=$(trigger_deployment "$app" "$project_dir")

        if [ -n "$url" ]; then
            temp_url_names+=("$app")
            temp_url_values+=("$url")
        fi
        echo ""
    done

    # Step 2: Wait for all foundational deployments
    log_info "Step 2: Waiting for foundational apps to complete..."
    echo ""

    local all_success=true
    local i
    for i in "${!temp_url_names[@]}"; do
        local app="${temp_url_names[$i]}"
        local url="${temp_url_values[$i]}"

        if [ -n "$url" ]; then
            if ! wait_for_deployment "$app" "$url"; then
                all_success=false
            fi
        else
            log_warning "Skipping $app (no deployment URL)"
            all_success=false
        fi
    done

    if [ "$all_success" = false ]; then
        log_error "Some foundational deployments failed. Aborting."
        exit 1
    fi

    # Step 3: Get production URLs for all apps
    log_info "Step 3: Retrieving production URLs..."
    echo ""

    for app in "${foundational_apps[@]}"; do
        local prod_url=$(get_production_url "$app")
        if [ -n "$prod_url" ]; then
            store_deployment_url "$app" "$prod_url"
            log_success "$app: $prod_url"
        else
            log_error "Could not get production URL for $app"
        fi
    done
    echo ""

    # Step 4: Configure shell environment variables
    log_info "Step 4: Configuring shell apps with Module Federation URLs..."
    echo ""

    configure_shell_env "content-platform-shell"
    echo ""
    configure_shell_env "top-level-shell"
    echo ""

    # Step 5: Deploy shell apps
    log_info "Step 5: Deploying shell apps with updated configuration..."
    echo ""

    local shell_apps=("content-platform-shell" "top-level-shell")

    # Temporary storage for shell deployments
    local shell_temp_names=()
    local shell_temp_values=()

    for app in "${shell_apps[@]}"; do
        local project_dir=$(get_project_dir "$app")
        local url=$(trigger_deployment "$app" "$project_dir")

        if [ -n "$url" ]; then
            shell_temp_names+=("$app")
            shell_temp_values+=("$url")
        fi
        echo ""
    done

    # Step 6: Wait for shell deployments
    log_info "Step 6: Waiting for shell apps to complete..."
    echo ""

    for i in "${!shell_temp_names[@]}"; do
        local app="${shell_temp_names[$i]}"
        local url="${shell_temp_values[$i]}"

        if [ -n "$url" ]; then
            wait_for_deployment "$app" "$url"
        fi
    done

    # Step 7: Get final production URLs for shells
    log_info "Step 7: Retrieving final shell production URLs..."
    echo ""

    for app in "${shell_apps[@]}"; do
        local prod_url=$(get_production_url "$app")
        if [ -n "$prod_url" ]; then
            store_deployment_url "$app" "$prod_url"
            log_success "$app: $prod_url"
        fi
    done

    # Final summary
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "  ✨ Deployment Complete!"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    log_success "All apps deployed and configured!"
    echo ""
    echo "Production URLs:"
    for i in "${!DEPLOYMENT_URL_NAMES[@]}"; do
        echo "  • ${DEPLOYMENT_URL_NAMES[$i]}: ${DEPLOYMENT_URL_VALUES[$i]}"
    done
    echo ""
    log_info "Test your application at:"
    local top_level_url=$(get_deployment_url "top-level-shell")
    echo "  $top_level_url"
    echo ""
}

# Run main workflow
main "$@"
