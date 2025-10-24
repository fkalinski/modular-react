#!/bin/bash

###############################################################################
# Deploy Remote with Version Management
#
# This script deploys a federated remote to Vercel with semantic versioning
# support. It creates both a specific version URL and updates the major
# version alias.
#
# Usage:
#   ./scripts/deploy-remote.sh <package-name> <version>
#
# Examples:
#   ./scripts/deploy-remote.sh shared-components 1.5.0
#   ./scripts/deploy-remote.sh shared-data 2.0.0
#
# What it does:
#   1. Deploys to: https://<package>-v<version>.vercel.app/
#   2. Creates alias: https://<package>-v<major>.vercel.app/
#   3. Updates production alias if appropriate
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
PACKAGE_NAME=$1
VERSION=$2

if [ -z "$PACKAGE_NAME" ] || [ -z "$VERSION" ]; then
  echo -e "${RED}Error: Missing arguments${NC}"
  echo "Usage: $0 <package-name> <version>"
  echo "Example: $0 shared-components 1.5.0"
  exit 1
fi

# Validate version format (semver: X.Y.Z)
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo -e "${RED}Error: Invalid version format${NC}"
  echo "Version must be in format X.Y.Z (e.g., 1.5.0)"
  exit 1
fi

# Extract major version
MAJOR_VERSION=$(echo $VERSION | cut -d. -f1)

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Deploying ${PACKAGE_NAME} v${VERSION}${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

# Determine package directory
case "$PACKAGE_NAME" in
  "shared-components")
    PACKAGE_DIR="shared-components"
    ;;
  "shared-data")
    PACKAGE_DIR="shared-data"
    ;;
  "content-shell")
    PACKAGE_DIR="content-platform/shell"
    ;;
  "files-folders")
    PACKAGE_DIR="content-platform/files-folders"
    ;;
  "hubs-tab")
    PACKAGE_DIR="hubs-tab"
    ;;
  "reports-tab")
    PACKAGE_DIR="reports-tab"
    ;;
  "user-tab")
    PACKAGE_DIR="user-tab"
    ;;
  "top-level-shell")
    PACKAGE_DIR="top-level-shell"
    ;;
  *)
    echo -e "${RED}Error: Unknown package: $PACKAGE_NAME${NC}"
    echo "Valid packages: shared-components, shared-data, content-shell, files-folders, hubs-tab, reports-tab, user-tab, top-level-shell"
    exit 1
    ;;
esac

# Check if directory exists
if [ ! -d "$PACKAGE_DIR" ]; then
  echo -e "${RED}Error: Package directory not found: $PACKAGE_DIR${NC}"
  exit 1
fi

cd "$PACKAGE_DIR"

echo -e "${YELLOW}📦 Building ${PACKAGE_NAME}...${NC}"
npm run build:prod || npm run build

echo ""
echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"

# Deploy with specific version URL
SPECIFIC_VERSION_URL="${PACKAGE_NAME}-v${VERSION//./-}"
echo -e "   Deploying to: ${BLUE}https://${SPECIFIC_VERSION_URL}.vercel.app${NC}"

vercel deploy --prod \
  --name="${PACKAGE_NAME}" \
  --yes \
  --meta "version=${VERSION}" \
  --meta "major_version=v${MAJOR_VERSION}" \
  > deployment-output.txt 2>&1

DEPLOYMENT_URL=$(cat deployment-output.txt | grep -E "https://.*vercel.app" | head -1 | tr -d '[:space:]')

if [ -z "$DEPLOYMENT_URL" ]; then
  echo -e "${RED}Error: Failed to get deployment URL${NC}"
  cat deployment-output.txt
  rm deployment-output.txt
  exit 1
fi

echo -e "${GREEN}✓ Deployed to: ${DEPLOYMENT_URL}${NC}"

# Create alias for specific version
echo ""
echo -e "${YELLOW}🔗 Creating version alias...${NC}"
echo -e "   Alias: ${BLUE}https://${SPECIFIC_VERSION_URL}.vercel.app${NC}"

vercel alias set "$DEPLOYMENT_URL" "${SPECIFIC_VERSION_URL}.vercel.app" --yes

echo -e "${GREEN}✓ Version alias created${NC}"

# Create/update major version alias
echo ""
echo -e "${YELLOW}🔗 Updating major version alias...${NC}"
MAJOR_VERSION_URL="${PACKAGE_NAME}-v${MAJOR_VERSION}"
echo -e "   Alias: ${BLUE}https://${MAJOR_VERSION_URL}.vercel.app${NC}"

vercel alias set "$DEPLOYMENT_URL" "${MAJOR_VERSION_URL}.vercel.app" --yes

echo -e "${GREEN}✓ Major version alias updated${NC}"

# For stable production alias (only for stable releases)
if [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.0$ ]] && [[ ! "$VERSION" =~ alpha|beta|rc ]]; then
  echo ""
  echo -e "${YELLOW}🔗 Updating production alias...${NC}"
  PROD_ALIAS="${PACKAGE_NAME}.vercel.app"
  echo -e "   Alias: ${BLUE}https://${PROD_ALIAS}${NC}"

  # Ask for confirmation before updating production
  read -p "Update production alias? (y/N) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel alias set "$DEPLOYMENT_URL" "${PROD_ALIAS}" --yes
    echo -e "${GREEN}✓ Production alias updated${NC}"
  else
    echo -e "${YELLOW}⊘ Production alias not updated${NC}"
  fi
fi

# Cleanup
rm deployment-output.txt

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Deployment Complete!                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}URLs:${NC}"
echo -e "  Specific version: ${BLUE}https://${SPECIFIC_VERSION_URL}.vercel.app${NC}"
echo -e "  Major version:    ${BLUE}https://${MAJOR_VERSION_URL}.vercel.app${NC}"
echo ""
echo -e "${BLUE}Usage in app:${NC}"
echo -e "  # Use major version (recommended)"
echo -e "  ${GREEN}https://${MAJOR_VERSION_URL}.vercel.app/remoteEntry.js${NC}"
echo ""
echo -e "  # Or specific version (pinned)"
echo -e "  ${GREEN}https://${SPECIFIC_VERSION_URL}.vercel.app/remoteEntry.js${NC}"
echo ""
echo -e "${BLUE}Testing:${NC}"
echo -e "  # Test via URL parameter"
echo -e "  ${GREEN}http://localhost:3000/?remote_${PACKAGE_NAME//-/_}=https://${SPECIFIC_VERSION_URL}.vercel.app/remoteEntry.js${NC}"
echo ""
echo -e "  # Test via console"
echo -e "  ${GREEN}mf.override('${PACKAGE_NAME//-/_}', 'https://${SPECIFIC_VERSION_URL}.vercel.app/remoteEntry.js')${NC}"
echo ""

cd - > /dev/null
