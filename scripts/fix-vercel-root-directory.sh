#!/bin/bash

# Fix Vercel Root Directory Settings
# This script updates the Root Directory setting for all Vercel projects to use the monorepo root

set -e

PROJECT_ROOT="/Users/fkalinski/dev/fkalinski/modular-react"

echo "========================================="
echo "Vercel Root Directory Fix Script"
echo "========================================="
echo ""
echo "This script will update the Root Directory setting for all 8 Vercel projects."
echo "Each project needs to have Root Directory LEFT EMPTY (blank) to use the monorepo root"
echo "instead of their subdirectory path."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI is not installed."
    echo "   Install it with: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI is installed"
echo ""

# List of projects (compatible with Bash 3.2+)
PROJECTS=(
    "shared-components:https://vercel.com/fkalinskis-projects/shared-components/settings"
    "shared-data:https://vercel.com/fkalinskis-projects/shared-data/settings"
    "hubs-tab:https://vercel.com/fkalinskis-projects/hubs-tab/settings"
    "reports-tab:https://vercel.com/fkalinskis-projects/reports-tab/settings"
    "user-tab:https://vercel.com/fkalinskis-projects/user-tab/settings"
    "files-folders:https://vercel.com/fkalinskis-projects/files-folders/settings"
    "shell:https://vercel.com/fkalinskis-projects/shell/settings"
    "top-level-shell:https://vercel.com/fkalinskis-projects/top-level-shell/settings"
)

echo "Projects to update:"
echo "-------------------"
for entry in "${PROJECTS[@]}"; do
    project="${entry%%:*}"
    echo "  • $project"
done
echo ""

echo "⚠️  MANUAL STEPS REQUIRED:"
echo ""
echo "Unfortunately, the Vercel CLI does not support updating the Root Directory setting"
echo "via command line. You need to update each project manually via the Vercel Dashboard."
echo ""
echo "For EACH project listed below, follow these steps:"
echo ""
echo "1. Click the settings URL"
echo "2. Navigate to: Settings → General → Root Directory"
echo "3. CLEAR/DELETE the Root Directory field (leave it completely EMPTY/BLANK)"
echo "   An empty Root Directory tells Vercel to use the repository root"
echo "4. Click 'Save'"
echo ""
echo "========================================="
echo "Projects to Update:"
echo "========================================="
echo ""

for entry in "${PROJECTS[@]}"; do
    project="${entry%%:*}"
    url="${entry#*:}"
    echo "Project: $project"
    echo "URL: $url"
    echo ""
done

echo "========================================="
echo "Alternative: Use Vercel API"
echo "========================================="
echo ""
echo "If you prefer to use the Vercel API, here's an example curl command:"
echo ""
echo "export VERCEL_TOKEN='your-vercel-token-here'"
echo ""
echo "# Example for shared-components:"
echo "curl -X PATCH \\"
echo "  'https://api.vercel.com/v9/projects/shared-components' \\"
echo "  -H 'Authorization: Bearer \$VERCEL_TOKEN' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"rootDirectory\": null}'"
echo ""
echo "Repeat for each project, replacing 'shared-components' with the project name."
echo ""
echo "To get your Vercel token:"
echo "1. Go to: https://vercel.com/account/tokens"
echo "2. Create a new token with appropriate permissions"
echo ""

read -p "Press Enter to open all project settings pages in your browser..."

# Open all settings pages in browser
for entry in "${PROJECTS[@]}"; do
    project="${entry%%:*}"
    url="${entry#*:}"
    echo "Opening: $project..."
    open "$url"
    sleep 1  # Small delay to avoid overwhelming the browser
done

echo ""
echo "✅ All project settings pages have been opened in your browser."
echo ""
echo "After updating all Root Directory settings, run:"
echo "  ./scripts/deploy-all-vercel.sh"
echo ""
