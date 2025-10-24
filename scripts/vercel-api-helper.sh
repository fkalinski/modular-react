#!/bin/bash

# Vercel API Helper Script
# Provides reusable functions for Vercel API operations
# Compatible with bash 3.2+ (macOS default)

set -e

# Load environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.vercel"

if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo "Error: VERCEL_TOKEN not set"
    exit 1
fi

# API base URL
API_BASE="https://api.vercel.com"

# Generic API call function
api_call() {
    local method="$1"
    local endpoint="$2"
    local data="$3"

    local url="${API_BASE}${endpoint}"

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

# Get project details
get_project() {
    local project_name="$1"
    api_call "GET" "/v9/projects/$project_name"
}

# List deployments
list_deployments() {
    local project_name="$1"
    local limit="${2:-10}"
    local target="${3:-}"  # production, preview, or empty for all

    local endpoint="/v6/deployments?projectId=$project_name&limit=$limit"
    if [ -n "$target" ]; then
        endpoint="${endpoint}&target=$target"
    fi

    api_call "GET" "$endpoint"
}

# Get deployment by ID
get_deployment() {
    local deployment_id="$1"
    api_call "GET" "/v13/deployments/$deployment_id"
}

# Get deployment logs
get_deployment_logs() {
    local deployment_id="$1"
    api_call "GET" "/v2/deployments/$deployment_id/events"
}

# List environment variables
list_env_vars() {
    local project_id="$1"
    api_call "GET" "/v10/projects/$project_id/env"
}

# Create or update environment variable
set_env_var() {
    local project_id="$1"
    local key="$2"
    local value="$3"
    local targets="$4"  # Comma-separated: production,preview,development
    local type="${5:-plain}"  # plain, encrypted, secret

    # Convert targets to JSON array
    local targets_json=$(echo "$targets" | sed 's/,/","/g' | sed 's/^/["/' | sed 's/$/"]/')

    local data=$(cat <<EOF
{
  "key": "$key",
  "value": "$value",
  "type": "$type",
  "target": $targets_json
}
EOF
)

    api_call "POST" "/v10/projects/$project_id/env?upsert=true" "$data"
}

# Delete environment variable
delete_env_var() {
    local project_id="$1"
    local env_id="$2"
    api_call "DELETE" "/v10/projects/$project_id/env/$env_id"
}

# Redeploy existing deployment
redeploy() {
    local deployment_id="$1"
    local target="${2:-production}"

    local data=$(cat <<EOF
{
  "deploymentId": "$deployment_id",
  "target": "$target"
}
EOF
)

    api_call "POST" "/v13/deployments" "$data"
}

# Cancel deployment
cancel_deployment() {
    local deployment_id="$1"
    api_call "PATCH" "/v12/deployments/$deployment_id/cancel"
}

# Promote deployment to production
promote_deployment() {
    local deployment_id="$1"
    api_call "POST" "/v13/deployments/$deployment_id/promote"
}

# Get project domains
get_domains() {
    local project_id="$1"
    api_call "GET" "/v9/projects/$project_id/domains"
}

# Pretty print JSON (requires jq)
pretty() {
    if command -v jq &> /dev/null; then
        jq .
    else
        cat
    fi
}

# CLI interface
case "${1:-}" in
    "project")
        get_project "$2" | pretty
        ;;
    "deployments")
        list_deployments "$2" "${3:-10}" "${4:-}" | pretty
        ;;
    "deployment")
        get_deployment "$2" | pretty
        ;;
    "logs")
        get_deployment_logs "$2" | pretty
        ;;
    "env-list")
        list_env_vars "$2" | pretty
        ;;
    "env-set")
        set_env_var "$2" "$3" "$4" "$5" "${6:-plain}"
        ;;
    "env-delete")
        delete_env_var "$2" "$3"
        ;;
    "redeploy")
        redeploy "$2" "${3:-production}" | pretty
        ;;
    "cancel")
        cancel_deployment "$2"
        ;;
    "promote")
        promote_deployment "$2" | pretty
        ;;
    "domains")
        get_domains "$2" | pretty
        ;;
    *)
        echo "Vercel API Helper"
        echo ""
        echo "Usage:"
        echo "  $0 project <project-name>"
        echo "  $0 deployments <project-name> [limit] [target]"
        echo "  $0 deployment <deployment-id>"
        echo "  $0 logs <deployment-id>"
        echo "  $0 env-list <project-id>"
        echo "  $0 env-set <project-id> <key> <value> <targets> [type]"
        echo "  $0 env-delete <project-id> <env-id>"
        echo "  $0 redeploy <deployment-id> [target]"
        echo "  $0 cancel <deployment-id>"
        echo "  $0 promote <deployment-id>"
        echo "  $0 domains <project-id>"
        echo ""
        echo "Examples:"
        echo "  $0 project top-level-shell"
        echo "  $0 deployments top-level-shell 5 production"
        echo "  $0 env-set prj_abc123 API_URL https://api.com production,preview"
        exit 1
        ;;
esac
