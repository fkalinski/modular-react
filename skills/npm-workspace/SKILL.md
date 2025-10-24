---
name: npm-workspace
description: Guide for managing npm workspaces and using Turbo commands for the modular React platform, including build, dev, lint, and typecheck operations.
---

# NPM Workspace Management

This skill helps you work with the npm workspace structure and Turbo monorepo commands for the modular React platform.

## When to Use This Skill

Use this skill when you need to:
- Run commands across all workspaces
- Build all or specific modules
- Manage workspace dependencies
- Use Turbo for parallel execution
- Understand the workspace structure
- Add or update dependencies

## Workspace Structure

The repository uses **npm workspaces** with **Turbo** for task orchestration.

### Root package.json

Located at: `/Users/fkalinski/dev/fkalinski/modular-react/package.json`

Defines workspaces:

```json
{
  "workspaces": [
    "shared-components",
    "shared-data",
    "content-platform/shell",
    "content-platform/files-folders",
    "content-platform/tab-contract",
    "hubs-tab",
    "reports-tab",
    "user-tab",
    "top-level-shell",
    "graphql-server",
    "contract-tests",
    "platform-context",
    "shared-state",
    "content-platform-data"
  ]
}
```

### Workspace Categories

**Shared Libraries** (Foundation):
- `shared-components` - UI component library
- `shared-data` - Redux store + GraphQL client

**Tab Modules** (Plugins):
- `content-platform/files-folders` - Files tab
- `hubs-tab` - Hubs tab
- `reports-tab` - Reports tab
- `user-tab` - User tab

**Shell Applications** (Hosts):
- `content-platform/shell` - Content platform shell
- `top-level-shell` - Main application shell

**Contracts & Types**:
- `content-platform/tab-contract` - Tab plugin interface

**Supporting Modules**:
- `graphql-server` - Mock GraphQL server
- `contract-tests` - Contract testing
- `platform-context` - Shared context
- `shared-state` - State management utilities
- `content-platform-data` - Data layer

## Turbo Commands

### Build Commands

```bash
# Build all workspaces in dependency order
npm run build

# Build for production (optimized)
npm run build:prod

# Individual workspace (from root)
npm run build --workspace=shared-components
```

**What happens:**
- Turbo analyzes dependency graph
- Builds workspaces in correct order
- Caches build artifacts
- Runs in parallel where possible

### Development Commands

```bash
# Start dev servers for all workspaces
npm run dev

# Start specific workspace
npm run dev --workspace=top-level-shell
```

**Note:** For Module Federation, prefer `./scripts/dev-all.sh` as it properly manages ports and services.

### Quality Commands

```bash
# Run linting across all workspaces
npm run lint

# Run type checking
npm run typecheck

# Clean all build artifacts
npm run clean
```

## Managing Dependencies

### Installing Dependencies

**For a specific workspace:**

```bash
# Option 1: From root
npm install react --workspace=shared-components

# Option 2: From workspace directory
cd shared-components
npm install react
```

**For all workspaces:**

```bash
# From root - installs all dependencies
npm install
```

### Adding Workspace Dependencies

When one workspace depends on another:

```json
// In dependent workspace's package.json
{
  "dependencies": {
    "@shared/components": "workspace:*"
  }
}
```

**Important:** For Module Federation, dependencies are loaded at runtime via `remoteEntry.js`, not via npm. The workspace dependency is only for local development and TypeScript types.

### Updating Dependencies

```bash
# Update a specific dependency
npm update react --workspace=shared-components

# Update all dependencies in a workspace
cd shared-components
npm update
```

## Turbo Configuration

Located at: `turbo.json` (if exists) or inferred from package.json scripts.

Turbo optimizes:
- **Parallel execution**: Runs independent tasks simultaneously
- **Dependency ordering**: Respects workspace dependencies
- **Caching**: Reuses previous build outputs
- **Incremental builds**: Only rebuilds changed workspaces

## Common Workflows

### Building Everything

```bash
# From project root
cd /Users/fkalinski/dev/fkalinski/modular-react

# Clean previous builds
npm run clean

# Build all workspaces
npm run build
```

**Build order (automatic via Turbo):**
1. Shared libraries (shared-components, shared-data)
2. Tabs and contracts
3. Shells (content-platform/shell, top-level-shell)

### Building Specific Modules

```bash
# Build just shared components
npm run build --workspace=shared-components

# Build multiple workspaces
npm run build --workspace=shared-components --workspace=shared-data
```

### Running Dev for Specific Modules

```bash
# Start just the top-level shell
npm run dev --workspace=top-level-shell

# Note: This won't start dependencies!
# For full setup, use ./scripts/dev-all.sh
```

### Linting and Type Checking

```bash
# Lint everything
npm run lint

# Lint specific workspace
npm run lint --workspace=top-level-shell

# Type check everything
npm run typecheck

# Type check specific workspace
npm run typecheck --workspace=shared-components
```

### Cleaning Build Artifacts

```bash
# Clean all workspaces
npm run clean

# Clean specific workspace
npm run clean --workspace=shared-components

# Or manually
cd shared-components && rm -rf dist
```

## Workspace Scripts

Each workspace has its own scripts in its `package.json`:

### Typical Workspace Scripts

```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "build:prod": "NODE_ENV=production webpack --mode production",
    "clean": "rm -rf dist",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  }
}
```

### Running Workspace Scripts

```bash
# From workspace directory
cd shared-components
npm run dev

# From root (using --workspace)
npm run dev --workspace=shared-components

# Run script in all workspaces
npm run build --workspaces
```

## Troubleshooting

### "Cannot find module" Errors

**Cause:** Dependency not installed or workspace link broken

**Solution:**
```bash
# From root, reinstall everything
rm -rf node_modules package-lock.json
npm install
```

### "No such file or directory" in Workspace

**Cause:** Workspace not properly linked

**Solution:**
```bash
# Verify workspace exists in root package.json
cat package.json | grep workspaces

# Reinstall
npm install
```

### Build Fails in One Workspace

**Solution:**
```bash
# Build just that workspace with verbose output
npm run build --workspace=shared-components --verbose

# Check its dependencies are built first
cd shared-components
npm run build
```

### Turbo Cache Issues

**Solution:**
```bash
# Clear Turbo cache
rm -rf .turbo

# Force rebuild without cache
npm run build -- --force
```

## Best Practices

1. **Always run `npm install` from root** - ensures workspace links are correct
2. **Build shared libraries first** when building selectively
3. **Use Turbo commands from root** for parallel execution benefits
4. **Use workspace-specific commands** for focused work
5. **Clean before production builds** to avoid stale artifacts
6. **Commit package-lock.json** to ensure consistent dependencies

## Module Federation Considerations

### Workspace Dependencies vs Runtime Dependencies

In Module Federation, modules are loaded at runtime:

```javascript
// webpack.config.js
remotes: {
  shared_components: 'shared_components@http://localhost:3001/remoteEntry.js'
}
```

**Not via npm:**
```javascript
// ❌ This is NOT how federated modules work
import { Button } from 'shared-components';
```

**Workspace dependencies are only for:**
- TypeScript types
- Local development
- Shared contracts/interfaces

### Building for Federation

Each workspace must:
1. Build its own bundle with webpack
2. Expose modules via ModuleFederationPlugin
3. Generate `remoteEntry.js` in `dist/`
4. Be independently deployable

## Package.json Reference

### Root Scripts

```json
{
  "scripts": {
    "build": "turbo run build",
    "build:prod": "turbo run build:prod",
    "dev": "turbo run dev --parallel",
    "clean": "turbo run clean",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  }
}
```

### Workspace Script Pattern

Each workspace follows this pattern:

```json
{
  "scripts": {
    "dev": "webpack serve --port [UNIQUE_PORT]",
    "build": "webpack --mode production",
    "build:prod": "NODE_ENV=production webpack",
    "clean": "rm -rf dist",
    "lint": "eslint src",
    "typecheck": "tsc --noEmit"
  }
}
```

## Quick Commands Reference

```bash
# From root directory
cd /Users/fkalinski/dev/fkalinski/modular-react

# Install all dependencies
npm install

# Build everything
npm run build

# Build production
npm run build:prod

# Development (prefer dev-all.sh script)
npm run dev

# Linting
npm run lint

# Type checking
npm run typecheck

# Clean all
npm run clean

# Specific workspace
npm run build --workspace=shared-components
npm run dev --workspace=top-level-shell
npm install lodash --workspace=shared-components
```

## Related Skills

- **dev-workflow**: For development environment and scripts
- **vercel-deployment**: For production deployment
- **module-federation-types**: For TypeScript types in federated modules

## References

- Root package.json: `package.json`
- Turbo configuration: `turbo.json`
- npm workspaces docs: https://docs.npmjs.com/cli/using-npm/workspaces
- Turbo docs: https://turbo.build/repo/docs
