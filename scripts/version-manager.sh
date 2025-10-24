#!/bin/bash

###############################################################################
# Version Manager for Module Federation Remotes
#
# Helper script to manage semantic versioning for federated modules
#
# Usage:
#   ./scripts/version-manager.sh <command> <package-name> [version-type]
#
# Commands:
#   current <package>       - Show current version
#   bump <package> <type>   - Bump version (major|minor|patch)
#   next <package> <type>   - Show what next version would be
#
# Examples:
#   ./scripts/version-manager.sh current shared-components
#   ./scripts/version-manager.sh bump shared-components patch
#   ./scripts/version-manager.sh next shared-data minor
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

COMMAND=$1
PACKAGE_NAME=$2
VERSION_TYPE=$3

# Map package name to directory
get_package_dir() {
  case "$1" in
    "shared-components") echo "shared-components" ;;
    "shared-data") echo "shared-data" ;;
    "content-shell") echo "content-platform/shell" ;;
    "files-folders") echo "content-platform/files-folders" ;;
    "hubs-tab") echo "hubs-tab" ;;
    "reports-tab") echo "reports-tab" ;;
    "user-tab") echo "user-tab" ;;
    "top-level-shell") echo "top-level-shell" ;;
    *)
      echo -e "${RED}Unknown package: $1${NC}" >&2
      return 1
      ;;
  esac
}

# Get current version from package.json
get_current_version() {
  local package_dir=$(get_package_dir "$1")
  if [ ! -f "$package_dir/package.json" ]; then
    echo -e "${RED}Error: package.json not found in $package_dir${NC}" >&2
    return 1
  fi

  # Use node to parse JSON
  node -e "console.log(require('./$package_dir/package.json').version)"
}

# Calculate next version
get_next_version() {
  local current=$1
  local bump_type=$2

  IFS='.' read -ra VERSION_PARTS <<< "$current"
  local major=${VERSION_PARTS[0]}
  local minor=${VERSION_PARTS[1]}
  local patch=${VERSION_PARTS[2]}

  case "$bump_type" in
    "major")
      echo "$((major + 1)).0.0"
      ;;
    "minor")
      echo "${major}.$((minor + 1)).0"
      ;;
    "patch")
      echo "${major}.${minor}.$((patch + 1))"
      ;;
    *)
      echo -e "${RED}Invalid bump type: $bump_type${NC}" >&2
      echo "Valid types: major, minor, patch" >&2
      return 1
      ;;
  esac
}

# Update version in package.json
update_version() {
  local package_dir=$(get_package_dir "$1")
  local new_version=$2

  # Use npm version to update (handles package.json and git tagging)
  cd "$package_dir"
  npm version "$new_version" --no-git-tag-version --allow-same-version=false
  cd - > /dev/null

  echo -e "${GREEN}✓ Updated $package_dir/package.json to v$new_version${NC}"
}

# Main command handling
case "$COMMAND" in
  "current")
    if [ -z "$PACKAGE_NAME" ]; then
      echo -e "${RED}Error: Package name required${NC}"
      exit 1
    fi

    version=$(get_current_version "$PACKAGE_NAME")
    echo -e "${BLUE}Current version of ${PACKAGE_NAME}:${NC} ${GREEN}${version}${NC}"
    ;;

  "next")
    if [ -z "$PACKAGE_NAME" ] || [ -z "$VERSION_TYPE" ]; then
      echo -e "${RED}Error: Package name and version type required${NC}"
      echo "Usage: $0 next <package> <major|minor|patch>"
      exit 1
    fi

    current=$(get_current_version "$PACKAGE_NAME")
    next=$(get_next_version "$current" "$VERSION_TYPE")

    echo -e "${BLUE}Current:${NC} ${current}"
    echo -e "${BLUE}Next ($VERSION_TYPE):${NC} ${GREEN}${next}${NC}"
    ;;

  "bump")
    if [ -z "$PACKAGE_NAME" ] || [ -z "$VERSION_TYPE" ]; then
      echo -e "${RED}Error: Package name and version type required${NC}"
      echo "Usage: $0 bump <package> <major|minor|patch>"
      exit 1
    fi

    current=$(get_current_version "$PACKAGE_NAME")
    next=$(get_next_version "$current" "$VERSION_TYPE")

    echo -e "${YELLOW}Bumping ${PACKAGE_NAME} version:${NC}"
    echo -e "  ${BLUE}${current}${NC} → ${GREEN}${next}${NC}"
    echo ""

    read -p "Continue? (y/N) " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
      update_version "$PACKAGE_NAME" "$next"
      echo ""
      echo -e "${GREEN}✓ Version bumped to ${next}${NC}"
      echo ""
      echo -e "${YELLOW}Next steps:${NC}"
      echo "  1. Review changes: git diff"
      echo "  2. Commit: git add . && git commit -m \"chore: bump $PACKAGE_NAME to v$next\""
      echo "  3. Deploy: ./scripts/deploy-remote.sh $PACKAGE_NAME $next"
    else
      echo -e "${YELLOW}Cancelled${NC}"
    fi
    ;;

  "all")
    # Show all package versions
    echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Package Versions                              ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
    echo ""

    packages=(
      "shared-components"
      "shared-data"
      "content-shell"
      "files-folders"
      "hubs-tab"
      "reports-tab"
      "user-tab"
      "top-level-shell"
    )

    for pkg in "${packages[@]}"; do
      version=$(get_current_version "$pkg" 2>/dev/null || echo "N/A")
      printf "  %-20s ${GREEN}%s${NC}\n" "$pkg" "$version"
    done
    echo ""
    ;;

  *)
    echo -e "${RED}Error: Unknown command: $COMMAND${NC}"
    echo ""
    echo "Usage: $0 <command> <package-name> [version-type]"
    echo ""
    echo "Commands:"
    echo "  current <package>       - Show current version"
    echo "  bump <package> <type>   - Bump version (major|minor|patch)"
    echo "  next <package> <type>   - Show what next version would be"
    echo "  all                     - Show all package versions"
    echo ""
    echo "Examples:"
    echo "  $0 current shared-components"
    echo "  $0 bump shared-components patch"
    echo "  $0 next shared-data minor"
    echo "  $0 all"
    exit 1
    ;;
esac
