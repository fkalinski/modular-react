#!/bin/bash

# Check Deployment Status Script
# Quick utility to check the status of all Vercel deployments
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

# Project list
PROJECTS=("shared-components" "shared-data" "hubs-tab" "reports-tab" "user-tab" "content-platform-shell" "files-folders" "top-level-shell")

# API helper
vercel_api() {
    local endpoint="$1"
    curl -s -X GET "https://api.vercel.com${endpoint}" \
        -H "Authorization: Bearer $VERCEL_TOKEN"
}

# Get latest deployment for project
get_latest_deployment() {
    local project_name="$1"
    local response=$(vercel_api "/v6/deployments?projectId=$project_name&limit=1")

    local url=$(echo "$response" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)
    local state=$(echo "$response" | grep -o '"readyState":"[^"]*"' | head -1 | cut -d'"' -f4)
    local created=$(echo "$response" | grep -o '"createdAt":[0-9]*' | head -1 | cut -d':' -f2)

    if [ -n "$url" ]; then
        echo "$state|https://$url|$created"
    else
        echo "NOTFOUND||"
    fi
}

# Format timestamp
format_time() {
    local timestamp="$1"
    if [ -n "$timestamp" ]; then
        local age=$(($(date +%s) - timestamp / 1000))
        if [ $age -lt 60 ]; then
            echo "${age}s ago"
        elif [ $age -lt 3600 ]; then
            echo "$((age / 60))m ago"
        elif [ $age -lt 86400 ]; then
            echo "$((age / 3600))h ago"
        else
            echo "$((age / 86400))d ago"
        fi
    else
        echo "unknown"
    fi
}

# Get status color
status_color() {
    case "$1" in
        "READY")
            echo "$GREEN"
            ;;
        "ERROR"|"CANCELED")
            echo "$RED"
            ;;
        "BUILDING"|"QUEUED"|"INITIALIZING")
            echo "$YELLOW"
            ;;
        *)
            echo "$BLUE"
            ;;
    esac
}

# Main
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  📊 Vercel Deployment Status"
echo "═══════════════════════════════════════════════════════"
echo ""

total=0
ready=0
errors=0
building=0

for project in "${PROJECTS[@]}"; do
    total=$((total + 1))
    info=$(get_latest_deployment "$project")

    IFS='|' read -r state url created <<< "$info"

    color=$(status_color "$state")

    case "$state" in
        "READY")
            ready=$((ready + 1))
            symbol="✅"
            ;;
        "ERROR")
            errors=$((errors + 1))
            symbol="❌"
            ;;
        "CANCELED")
            errors=$((errors + 1))
            symbol="🚫"
            ;;
        "BUILDING"|"QUEUED"|"INITIALIZING")
            building=$((building + 1))
            symbol="⏳"
            ;;
        "NOTFOUND")
            errors=$((errors + 1))
            symbol="❓"
            state="NOT FOUND"
            ;;
        *)
            symbol="📦"
            ;;
    esac

    age=$(format_time "$created")

    printf "${color}${symbol} %-25s ${state}${NC}\n" "$project"
    if [ -n "$url" ]; then
        printf "   ${BLUE}└─ %s${NC}\n" "$url"
        printf "   ${BLUE}   (%s)${NC}\n" "$age"
    fi
    echo ""
done

echo "═══════════════════════════════════════════════════════"
printf "  Summary: ${GREEN}$ready Ready${NC} | "
printf "${YELLOW}$building Building${NC} | "
printf "${RED}$errors Errors${NC}"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""

# Exit code based on status
if [ $errors -gt 0 ] && [ $building -eq 0 ]; then
    echo -e "${RED}⚠️  Some deployments have errors${NC}"
    exit 1
elif [ $ready -eq $total ]; then
    echo -e "${GREEN}✨ All deployments ready!${NC}"
    exit 0
else
    echo -e "${YELLOW}⏳ Deployments still in progress${NC}"
    exit 0
fi
