# Artifactory + Vercel Deployment Strategy

## Overview

This guide explains how to deploy federated modules to Vercel while using company Artifactory for shared packages like `@content-platform/tab-contract`.

## Architecture

```
┌─────────────────────────────────────┐
│  Development (Local)                │
│  Uses workspace dependencies        │
│  No publishing needed               │
└─────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  1. Publish tab-contract            │
│     to Artifactory                  │
└─────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Configure Vercel                │
│     to use Artifactory registry     │
└─────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. Deploy federated modules        │
│     (can find @content-platform/*   │
│      in Artifactory)                │
└─────────────────────────────────────┘
```

## Step-by-Step Workflow

### 1. Publish `@content-platform/tab-contract` to Artifactory

First, build and publish the tab contract package:

```bash
cd content-platform/tab-contract

# Build TypeScript to dist/
npm run build

# Publish to Artifactory
npm publish --registry https://your-company.jfrog.io/artifactory/api/npm/npm-local/
```

**Or use the convenience script:**

```bash
cd content-platform/tab-contract
npm run publish:artifactory
```

**Update the script in package.json with your actual Artifactory URL.**

### 2. Configure .npmrc for Dependent Modules

Each module that depends on `@content-platform/tab-contract` needs an `.npmrc` file:

**File**: `content-platform/files-folders/.npmrc`

```ini
# Point to your Artifactory registry
@content-platform:registry=https://your-company.jfrog.io/artifactory/api/npm/npm-local/

# Authentication (uses environment variable)
//your-company.jfrog.io/artifactory/api/npm/npm-local/:_auth=${NPM_TOKEN}
//your-company.jfrog.io/artifactory/api/npm/npm-local/:always-auth=true
```

**Important:** `.npmrc` is already created in each module, just uncomment and configure.

### 3. Set Vercel Environment Variables

In each Vercel project that needs to access Artifactory, add:

**Environment Variable:**
- **Name**: `NPM_TOKEN`
- **Value**: Your Artifactory auth token (base64 encoded `username:password`)

**How to generate the token:**

```bash
echo -n "your-username:your-password" | base64
```

Or use Artifactory API token:

```bash
echo -n "your-username:your-api-token" | base64
```

**Set in Vercel:**
1. Go to Project Settings
2. Environment Variables
3. Add `NPM_TOKEN` with your base64 value
4. Set for: Production, Preview, Development

### 4. Deploy to Vercel

Now deploy modules in order:

```bash
# 1. Deploy shared-components (no workspace dependencies)
cd shared-components
vercel --prod

# 2. Deploy shared-data (no workspace dependencies)
cd ../shared-data
vercel --prod

# 3. Deploy files-folders (has tab-contract dependency)
cd ../content-platform/files-folders
vercel --prod  # ✅ Will find @content-platform/tab-contract in Artifactory

# 4. Continue with other modules...
```

## Configuration Files

### tab-contract/package.json

```json
{
  "name": "@content-platform/tab-contract",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build",
    "publish:artifactory": "npm publish --registry https://your-company.jfrog.io/artifactory/api/npm/npm-local/"
  },
  "files": ["dist", "src", "README.md"]
}
```

### files-folders/.npmrc

```ini
@content-platform:registry=https://your-company.jfrog.io/artifactory/api/npm/npm-local/
//your-company.jfrog.io/artifactory/api/npm/npm-local/:_auth=${NPM_TOKEN}
//your-company.jfrog.io/artifactory/api/npm/npm-local/:always-auth=true
```

### files-folders/package.json

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@content-platform/tab-contract": "1.0.0"  // ← Will install from Artifactory
  }
}
```

## Version Management

### Updating tab-contract

When you make changes to the tab contract:

```bash
cd content-platform/tab-contract

# 1. Update version in package.json
npm version patch  # or minor, or major

# 2. Build
npm run build

# 3. Publish to Artifactory
npm run publish:artifactory

# 4. Update dependent modules' package.json
cd ../files-folders
# Update @content-platform/tab-contract version to match

# 5. Redeploy dependent modules
vercel --prod
```

### Semantic Versioning

Follow semver for tab-contract:

- **Patch** (1.0.0 → 1.0.1): Bug fixes, no API changes
- **Minor** (1.0.0 → 1.1.0): New optional features, backward compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

## Alternative: Use npm Public Registry

If you don't need privacy, you can publish to npm:

```bash
cd content-platform/tab-contract

# Login to npm (one time)
npm login

# Publish (make it public)
npm publish --access public
```

Then update `.npmrc` in dependent modules:

```ini
# Just use default npm registry
registry=https://registry.npmjs.org/
```

No `NPM_TOKEN` needed for public packages.

## Alternative: Git Dependencies

For temporary/testing, you can use git dependencies:

**files-folders/package.json:**

```json
{
  "dependencies": {
    "@content-platform/tab-contract": "github:yourcompany/modular-react#main:content-platform/tab-contract"
  }
}
```

**Pros:**
- No need for Artifactory
- Always uses latest from git

**Cons:**
- Slower installs
- No version pinning
- Requires public repo or git credentials

## Local Development (No Publishing)

For local development, you DON'T need to publish anything:

```bash
# Just use workspace dependencies
npm install  # from root

# Start dev servers
cd content-platform/files-folders
npm run dev  # ✅ Uses local ../tab-contract via workspace
```

The workspace dependency resolution handles everything locally.

## CI/CD Pipeline

Recommended pipeline for production:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

jobs:
  publish-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Publish tab-contract to Artifactory
        run: |
          cd content-platform/tab-contract
          npm run build
          npm publish --registry ${{ secrets.ARTIFACTORY_URL }}
        env:
          NPM_TOKEN: ${{ secrets.ARTIFACTORY_TOKEN }}

  deploy-modules:
    needs: publish-contracts
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        run: |
          # Deploy each module
          cd shared-components && vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
          cd ../shared-data && vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
          # ... etc
```

## Troubleshooting

### Error: `@content-platform/tab-contract` not found

**Cause:** Artifactory not configured or token invalid.

**Solution:**
1. Verify package is published to Artifactory
2. Check `.npmrc` configuration
3. Verify `NPM_TOKEN` in Vercel environment variables
4. Test locally: `npm install --registry https://your-artifactory-url`

### Error: 401 Unauthorized

**Cause:** Invalid or expired authentication token.

**Solution:**
1. Regenerate auth token
2. Update `NPM_TOKEN` in Vercel
3. Redeploy

### Works locally but fails on Vercel

**Cause:** Local uses workspace, Vercel uses registry.

**Solution:**
1. Ensure tab-contract is published to Artifactory
2. Verify `.npmrc` is committed to git
3. Check Vercel has `NPM_TOKEN` environment variable

## Summary

**Development (Local):**
- ✅ Use workspace dependencies
- ✅ No publishing needed
- ✅ Instant changes

**Production (Vercel):**
1. ✅ Publish `@content-platform/tab-contract` to Artifactory
2. ✅ Configure `.npmrc` in dependent modules
3. ✅ Set `NPM_TOKEN` in Vercel
4. ✅ Deploy modules

**Best Practice:**
- Keep tab-contract versioned
- Publish on changes
- Pin versions in dependent modules
- Document breaking changes

This approach keeps your types centralized and reusable while working seamlessly with both local development and Vercel deployment! 🚀
