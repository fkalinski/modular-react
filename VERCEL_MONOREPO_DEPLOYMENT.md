# Vercel Monorepo Deployment Guide

## Overview

This project is a **Turborepo monorepo** with Module Federation architecture. This guide explains how to properly deploy it to Vercel as a monorepo (not as individual projects).

## Architecture

```
modular-react/ (monorepo root)
├── shared-components/      → Vercel Project
├── shared-data/           → Vercel Project
├── content-platform/
│   ├── shell/            → Vercel Project
│   └── files-folders/    → Vercel Project
├── hubs-tab/             → Vercel Project
├── reports-tab/          → Vercel Project
├── user-tab/             → Vercel Project
└── top-level-shell/      → Vercel Project (main entry)
```

## Current Problems

### ❌ Incorrect Setup
Each app was deployed individually with:
- Individual `.vercel/project.json` files in each subdirectory
- Build command: `npm run build:prod` (runs only local build)
- Install command: `npm install` (runs in subdirectory, missing root deps)
- No Turborepo integration
- No remote caching
- No monorepo awareness

### ✅ Correct Setup (Turborepo Monorepo)
All apps should be configured as:
- **Single monorepo** linked with `vercel link --repo`
- Build command: `cd ../.. && turbo run build:prod --filter=<app-name>`
- Install command: `npm install` (from monorepo root)
- Turborepo remote cache enabled
- Proper dependency order handling

## Vercel Monorepo Configuration

### 1. Root `vercel.json`

Create at monorepo root:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "github": {
    "silent": false
  }
}
```

### 2. Root `.vercelignore`

Optimize builds by ignoring unnecessary files:

```
# Dependencies
node_modules/

# Build outputs (except what's needed)
**/dist/
**/.next/
**/.vercel/

# Except the app being deployed
!dist/

# Development
**/.turbo/
**/coverage/

# Documentation
*.md
!README.md

# Images
*.png
*.jpg
*.jpeg
*.gif

# Tests
**/__tests__/
**/e2e-tests/
```

### 3. Update `turbo.json`

Ensure cache exclusions are correct:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build:prod": {
      "dependsOn": ["^build:prod"],
      "outputs": [
        "dist/**",
        "@mf-types/**",
        ".mf/**",
        "!.next/cache/**"
      ]
    }
  }
}
```

## Per-App Vercel Project Settings

Each app needs these settings in Vercel dashboard or via `vercel.json`:

### Shared Components

```json
{
  "buildCommand": "cd ../.. && turbo run build:prod --filter=@modular-platform/shared-components",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null
}
```

**Root Directory**: `shared-components`

### Shared Data

```json
{
  "buildCommand": "cd ../.. && turbo run build:prod --filter=@modular-platform/shared-data",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null
}
```

**Root Directory**: `shared-data`

### Content Platform Shell

```json
{
  "buildCommand": "cd ../.. && turbo run build:prod --filter=@content-platform/shell",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null
}
```

**Root Directory**: `content-platform/shell`

### Files & Folders Tab

```json
{
  "buildCommand": "cd ../.. && turbo run build:prod --filter=@content-platform/files-folders",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null
}
```

**Root Directory**: `content-platform/files-folders`

### Hubs Tab

```json
{
  "buildCommand": "cd ../.. && turbo run build:prod --filter=hubs-tab",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null
}
```

**Root Directory**: `hubs-tab`

### Reports Tab

```json
{
  "buildCommand": "cd ../.. && turbo run build:prod --filter=@modular-platform/reports-tab",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null
}
```

**Root Directory**: `reports-tab`

### User Tab

```json
{
  "buildCommand": "cd ../.. && turbo run build:prod --filter=@modular-platform/user-tab",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null
}
```

**Root Directory**: `user-tab`

### Top Level Shell

```json
{
  "buildCommand": "cd ../.. && turbo run build:prod --filter=@modular-platform/top-level-shell",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null
}
```

**Root Directory**: `top-level-shell`

## Deployment Process

### Step 1: Link Monorepo

From the monorepo root:

```bash
# Link as monorepo (only do this once)
vercel link --repo
```

This will:
- Detect all apps in the monorepo
- Create/link Vercel projects for each
- Set up proper build configuration

### Step 2: Enable Turborepo Remote Cache

```bash
# Authenticate with Vercel
npx turbo login

# Link to Vercel Remote Cache
npx turbo link
```

Select your team and enable remote caching.

### Step 3: Configure Each App

For each app that needs deployment, configure in Vercel dashboard:

1. Go to **Project Settings** → **General**
2. Set **Root Directory** (e.g., `shared-components`)
3. Go to **Build & Development Settings**:
   - **Build Command**: `cd ../.. && turbo run build:prod --filter=<package-name>`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 4: Set Environment Variables

Configure Module Federation remote URLs:

#### Top Level Shell Environment Variables

```bash
REMOTE_SHARED_COMPONENTS_URL=https://shared-components.vercel.app
REMOTE_SHARED_DATA_URL=https://shared-data.vercel.app
REMOTE_CONTENT_SHELL_URL=https://content-platform-shell.vercel.app
REMOTE_REPORTS_TAB_URL=https://reports-tab.vercel.app
REMOTE_USER_TAB_URL=https://user-tab.vercel.app
```

#### Content Platform Shell Environment Variables

```bash
REMOTE_SHARED_COMPONENTS_URL=https://shared-components.vercel.app
REMOTE_SHARED_DATA_URL=https://shared-data.vercel.app
REMOTE_FILES_TAB_URL=https://files-folders.vercel.app
REMOTE_HUBS_TAB_URL=https://hubs-tab.vercel.app
```

### Step 5: Use Related Projects

In each app's `vercel.json`, reference dependencies:

```json
{
  "relatedProjects": [
    "prj_shared_components_id",
    "prj_shared_data_id"
  ]
}
```

This makes remote URLs available as environment variables automatically.

## Automated Deployment Script

The deployment script is located at `scripts/deploy-vercel.sh`.

It deploys all apps in dependency order:
1. Shared modules (shared-components, shared-data)
2. Tab modules (files-folders, hubs-tab, reports-tab, user-tab)
3. Shell applications (content-platform-shell, top-level-shell)

Run it from the project root:

```bash
./scripts/deploy-vercel.sh
```

The script will:
- Deploy each app to Vercel production
- Capture deployment URLs
- Save URLs to `deployment-urls.txt`
- Display environment variables to configure

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/deploy-vercel.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Deploy to Vercel
        run: |
          # Deploy each app
          cd shared-components && vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --yes && cd ..
          cd shared-data && vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --yes && cd ..
          cd content-platform/files-folders && vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --yes && cd ../..
          cd hubs-tab && vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --yes && cd ..
          cd reports-tab && vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --yes && cd ..
          cd user-tab && vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --yes && cd ..
          cd content-platform/shell && vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --yes && cd ../..
          cd top-level-shell && vercel --prod --token=${{ secrets.VERCEL_TOKEN }} --yes && cd ..
```

## Build Command Explained

### Why `cd ../..`?

```bash
cd ../.. && turbo run build:prod --filter=@modular-platform/shared-components
```

1. **Vercel starts in app directory** (e.g., `shared-components/`)
2. **`cd ../..`** navigates to monorepo root
3. **`turbo run build:prod --filter=...`** uses Turbo to:
   - Build dependencies first (if needed)
   - Use remote cache
   - Build only what changed

### Alternative: Use `--cwd`

```bash
turbo run build:prod --filter=@modular-platform/shared-components --cwd=../..
```

This is cleaner but requires Turbo 1.10+.

## Turborepo Remote Cache Benefits

Once configured, Vercel deployments will:

1. **Skip unchanged builds** - If a module hasn't changed, use cached build
2. **Share cache across deployments** - Different apps can reuse builds
3. **Faster CI/CD** - Significantly reduced build times
4. **Consistent builds** - Same input = same output

## Troubleshooting

### Build fails: "Cannot find module"

**Problem**: Install command running in subdirectory

**Solution**: Ensure Install Command is `npm install` (not in subdirectory)

### Build fails: "turbo: command not found"

**Problem**: Turbo not installed

**Solution**: Add to root `package.json`:
```json
{
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

### Remote URL not found

**Problem**: Module Federation can't load remote

**Solution**:
1. Check environment variables are set in Vercel
2. Verify remote URL is accessible: `curl https://remote.vercel.app/remoteEntry.js`
3. Check CORS headers in remote's `vercel.json`

### Cache not working

**Problem**: Turborepo remote cache not enabled

**Solution**:
```bash
npx turbo login
npx turbo link
```

Then set `TURBO_TOKEN` and `TURBO_TEAM` in Vercel environment variables.

## Deployment Checklist

Before first deployment:

- [ ] Root `vercel.json` created
- [ ] Root `.vercelignore` created
- [ ] `turbo.json` excludes `.next/cache`
- [ ] Monorepo linked: `vercel link --repo`
- [ ] Turborepo remote cache enabled
- [ ] Each app has correct Root Directory set
- [ ] Each app has correct Build Command with Turbo filter
- [ ] Install Command is `npm install` (not in subdirectory)
- [ ] Environment variables configured for Module Federation URLs

During deployment:

- [ ] Deploy in dependency order (shared → tabs → shells)
- [ ] Verify each build succeeds
- [ ] Check build logs for cache hits
- [ ] Test each deployed URL

After deployment:

- [ ] All apps accessible
- [ ] No 404 errors for remoteEntry.js
- [ ] No CORS errors
- [ ] Module Federation loading correctly
- [ ] All tabs rendering

## Best Practices

1. **Always deploy dependencies first** - Shared modules before apps that use them
2. **Use environment variables** - Don't hardcode URLs in webpack configs
3. **Enable remote cache** - Significantly speeds up builds
4. **Monitor build times** - Should see cache hits after first deploy
5. **Use `relatedProjects`** - Automatic environment variable injection
6. **Test locally with production URLs** - Set env vars to test before deploy
7. **Deploy from main branch** - Keep production stable

## Commands Reference

```bash
# Link monorepo
vercel link --repo

# Deploy specific app
cd app-name
vercel --prod

# Deploy all apps (from root)
./scripts/deploy-vercel.sh

# Check deployment status
vercel ls

# View logs
vercel logs <deployment-url>

# Enable Turborepo remote cache
npx turbo login
npx turbo link

# Test build locally with cache
turbo run build:prod

# Clear local cache
turbo prune
```

## Additional Resources

- [Vercel Monorepo Documentation](https://vercel.com/docs/monorepos)
- [Turborepo with Vercel](https://vercel.com/docs/monorepos/turborepo)
- [Module Federation Guide](https://module-federation.io/)
- [Vercel Build Configuration](https://vercel.com/docs/projects/project-configuration)

## Project-Specific URLs

Update these after deployment:

```bash
# Production URLs (update after deployment)
SHARED_COMPONENTS=https://shared-components-xxx.vercel.app
SHARED_DATA=https://shared-data-xxx.vercel.app
FILES_FOLDERS=https://files-folders-xxx.vercel.app
HUBS_TAB=https://hubs-tab-xxx.vercel.app
REPORTS_TAB=https://reports-tab-xxx.vercel.app
USER_TAB=https://user-tab-xxx.vercel.app
CONTENT_SHELL=https://content-platform-shell-xxx.vercel.app
TOP_LEVEL_SHELL=https://top-level-shell-xxx.vercel.app
```

---

**Status**: Ready for monorepo deployment configuration
**Last Updated**: 2025-10-24
