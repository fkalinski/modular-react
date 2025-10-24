#!/bin/bash

# Deploy All Vercel Projects After Configuration Fix
# This script deploys all projects in the correct order after fixing the Root Directory settings

set -e

PROJECT_ROOT="/Users/fkalinski/dev/fkalinski/modular-react"

echo "========================================="
echo "Vercel Deployment Script"
echo "========================================="
echo ""
echo "This script will deploy all 8 projects in dependency order."
echo ""

# Verify we're in the project root
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

cd "$PROJECT_ROOT"

echo "✅ In project root: $PROJECT_ROOT"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Error: Vercel CLI is not installed."
    echo "   Install it with: npm install -g vercel"
    exit 1
fi

echo "✅ Vercel CLI is installed"
echo ""

echo "⚠️  IMPORTANT: Before running this script, ensure you have:"
echo "   1. Cleared all 8 Vercel project Root Directory settings (left them EMPTY/BLANK)"
echo "   2. Saved the changes in the Vercel Dashboard"
echo ""
read -p "Have you completed these steps? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Please complete the Root Directory updates first"
    echo "   Run: ./scripts/fix-vercel-root-directory.sh"
    exit 1
fi

echo ""
echo "========================================="
echo "Phase 1: Deploy Foundation Modules"
echo "========================================="
echo ""

echo "📦 Deploying shared-components..."
cd "$PROJECT_ROOT/shared-components"
vercel --prod --yes || {
    echo "❌ shared-components deployment failed!"
    exit 1
}
echo "✅ shared-components deployed"
echo ""

echo "📦 Deploying shared-data..."
cd "$PROJECT_ROOT/shared-data"
vercel --prod --yes || {
    echo "❌ shared-data deployment failed!"
    exit 1
}
echo "✅ shared-data deployed"
echo ""

echo "========================================="
echo "Phase 2: Deploy Tab Modules"
echo "========================================="
echo ""

echo "📦 Deploying hubs-tab..."
cd "$PROJECT_ROOT/hubs-tab"
vercel --prod --yes || {
    echo "❌ hubs-tab deployment failed!"
    exit 1
}
echo "✅ hubs-tab deployed"
echo ""

echo "📦 Deploying reports-tab..."
cd "$PROJECT_ROOT/reports-tab"
vercel --prod --yes || {
    echo "❌ reports-tab deployment failed!"
    exit 1
}
echo "✅ reports-tab deployed"
echo ""

echo "📦 Deploying user-tab..."
cd "$PROJECT_ROOT/user-tab"
vercel --prod --yes || {
    echo "❌ user-tab deployment failed!"
    exit 1
}
echo "✅ user-tab deployed"
echo ""

echo "📦 Deploying files-folders..."
cd "$PROJECT_ROOT/content-platform/files-folders"
vercel --prod --yes || {
    echo "❌ files-folders deployment failed!"
    exit 1
}
echo "✅ files-folders deployed"
echo ""

echo "========================================="
echo "Phase 3: Capture Production URLs"
echo "========================================="
echo ""

cd "$PROJECT_ROOT"

echo "Fetching deployment URLs..."
SHARED_COMPONENTS_URL=$(cd shared-components && vercel ls --prod 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "URL_NOT_FOUND")
SHARED_DATA_URL=$(cd shared-data && vercel ls --prod 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "URL_NOT_FOUND")
HUBS_TAB_URL=$(cd hubs-tab && vercel ls --prod 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "URL_NOT_FOUND")
REPORTS_TAB_URL=$(cd reports-tab && vercel ls --prod 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "URL_NOT_FOUND")
USER_TAB_URL=$(cd user-tab && vercel ls --prod 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "URL_NOT_FOUND")
FILES_FOLDERS_URL=$(cd content-platform/files-folders && vercel ls --prod 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "URL_NOT_FOUND")

echo ""
echo "Production URLs:"
echo "----------------"
echo "shared-components: $SHARED_COMPONENTS_URL"
echo "shared-data: $SHARED_DATA_URL"
echo "hubs-tab: $HUBS_TAB_URL"
echo "reports-tab: $REPORTS_TAB_URL"
echo "user-tab: $USER_TAB_URL"
echo "files-folders: $FILES_FOLDERS_URL"
echo ""

# Save URLs to file
cat > "$PROJECT_ROOT/production-urls.txt" <<EOF
# Production Deployment URLs
# Generated: $(date)

SHARED_COMPONENTS_URL=$SHARED_COMPONENTS_URL
SHARED_DATA_URL=$SHARED_DATA_URL
HUBS_TAB_URL=$HUBS_TAB_URL
REPORTS_TAB_URL=$REPORTS_TAB_URL
USER_TAB_URL=$USER_TAB_URL
FILES_FOLDERS_URL=$FILES_FOLDERS_URL
EOF

echo "✅ URLs saved to production-urls.txt"
echo ""

echo "========================================="
echo "Phase 4: Configure Shell Environment Variables"
echo "========================================="
echo ""

echo "⚠️  MANUAL STEP REQUIRED:"
echo ""
echo "You need to set environment variables in the Vercel Dashboard for shell projects:"
echo ""
echo "For content-platform-shell:"
echo "  https://vercel.com/fkalinskis-projects/shell/settings/environment-variables"
echo ""
echo "  Add these environment variables:"
echo "    REMOTE_SHARED_COMPONENTS_URL=$SHARED_COMPONENTS_URL"
echo "    REMOTE_SHARED_DATA_URL=$SHARED_DATA_URL"
echo "    REMOTE_FILES_TAB_URL=$FILES_FOLDERS_URL"
echo "    REMOTE_HUBS_TAB_URL=$HUBS_TAB_URL"
echo ""
echo "For top-level-shell:"
echo "  https://vercel.com/fkalinskis-projects/top-level-shell/settings/environment-variables"
echo ""
echo "  Add these environment variables:"
echo "    REMOTE_SHARED_COMPONENTS_URL=$SHARED_COMPONENTS_URL"
echo "    REMOTE_SHARED_DATA_URL=$SHARED_DATA_URL"
echo "    REMOTE_CONTENT_SHELL_URL=(content-platform-shell URL - to be deployed)"
echo "    REMOTE_REPORTS_TAB_URL=$REPORTS_TAB_URL"
echo "    REMOTE_USER_TAB_URL=$USER_TAB_URL"
echo ""

read -p "Press Enter after you've configured the environment variables..."

echo ""
echo "========================================="
echo "Phase 5: Deploy Shell Applications"
echo "========================================="
echo ""

echo "📦 Deploying content-platform-shell..."
cd "$PROJECT_ROOT/content-platform/shell"
vercel --prod --yes || {
    echo "❌ content-platform-shell deployment failed!"
    exit 1
}
echo "✅ content-platform-shell deployed"
echo ""

# Get content-platform-shell URL for top-level-shell
CONTENT_SHELL_URL=$(vercel ls --prod 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "URL_NOT_FOUND")
echo "Content Platform Shell URL: $CONTENT_SHELL_URL"
echo ""

echo "⚠️  Update top-level-shell environment variables with:"
echo "    REMOTE_CONTENT_SHELL_URL=$CONTENT_SHELL_URL"
echo ""
read -p "Press Enter after updating..."

echo "📦 Deploying top-level-shell..."
cd "$PROJECT_ROOT/top-level-shell"
vercel --prod --yes || {
    echo "❌ top-level-shell deployment failed!"
    exit 1
}
echo "✅ top-level-shell deployed"
echo ""

# Get top-level-shell URL
TOP_LEVEL_SHELL_URL=$(vercel ls --prod 2>/dev/null | grep -o 'https://[^ ]*' | head -1 || echo "URL_NOT_FOUND")

echo ""
echo "========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "========================================="
echo ""
echo "All applications have been deployed successfully!"
echo ""
echo "Production URLs:"
echo "----------------"
echo "Top-Level Shell (Main App): $TOP_LEVEL_SHELL_URL"
echo "Content Platform Shell: $CONTENT_SHELL_URL"
echo ""
echo "Shared Modules:"
echo "  - Shared Components: $SHARED_COMPONENTS_URL"
echo "  - Shared Data: $SHARED_DATA_URL"
echo ""
echo "Tabs:"
echo "  - Hubs Tab: $HUBS_TAB_URL"
echo "  - Reports Tab: $REPORTS_TAB_URL"
echo "  - User Tab: $USER_TAB_URL"
echo "  - Files/Folders: $FILES_FOLDERS_URL"
echo ""
echo "Next steps:"
echo "  1. Visit $TOP_LEVEL_SHELL_URL to verify the application works"
echo "  2. Check browser console for any Module Federation errors"
echo "  3. Verify all tabs load correctly"
echo ""
