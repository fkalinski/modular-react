## Vercel Deployment with Stable URLs

**Implementation Date:** 2025-10-24
**Status:** ✅ Implemented

This document describes the Vercel deployment strategy with stable URL patterns for semantic versioning support.

---

## Table of Contents

1. [Overview](#overview)
2. [URL Structure](#url-structure)
3. [Deployment Methods](#deployment-methods)
4. [GitHub Actions Workflows](#github-actions-workflows)
5. [Manual Deployment](#manual-deployment)
6. [Version Management](#version-management)
7. [Configuration](#configuration)
8. [Testing Deployments](#testing-deployments)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### What This Provides

**Stable URL Pattern with Semantic Versioning:**

```
Specific Version (immutable):
https://shared-components-v1-5-0.vercel.app/remoteEntry.js

Major Version Alias (auto-updates):
https://shared-components-v1.vercel.app/remoteEntry.js
  ↓ automatically points to latest 1.x version

Production Alias (stable):
https://shared-components.vercel.app/remoteEntry.js
```

### Benefits

✅ **Minor/Patch Updates Without Host Rebuild**
- Host apps use major version URL (v1/)
- Deploy new minor/patch version (1.5.0 → 1.5.1)
- Major version alias auto-updates
- Host apps automatically get new version on next user session

✅ **Breaking Changes with Migration Period**
- Deploy v2.0.0 alongside v1.x
- Both versions available simultaneously
- Host apps opt-in to v2 when ready
- Gradual migration path

✅ **Easy Rollback**
- Update major version alias to point to previous version
- Instant rollback without rebuild

✅ **Canary Deployments**
- Deploy canary version to specific URL
- Route subset of users via cookies
- Monitor before promoting to major version alias

---

## URL Structure

### Pattern

```
https://<package>-v<version>.vercel.app/
         │          │
         │          └─ Version (dots replaced with dashes)
         └─ Package name (kebab-case)
```

### Examples

**Shared Components:**
```
Specific: https://shared-components-v1-5-0.vercel.app/remoteEntry.js
Major:    https://shared-components-v1.vercel.app/remoteEntry.js
Prod:     https://shared-components.vercel.app/remoteEntry.js
```

**Shared Data:**
```
Specific: https://shared-data-v2-0-0.vercel.app/remoteEntry.js
Major:    https://shared-data-v2.vercel.app/remoteEntry.js
Prod:     https://shared-data.vercel.app/remoteEntry.js
```

### Version Mapping

| Semantic Version | Specific URL | Major Alias | What Changes |
|-----------------|--------------|-------------|--------------|
| 1.5.0 → 1.5.1 | v1-5-1 | v1 → v1-5-1 | Patch: Auto-update |
| 1.5.0 → 1.6.0 | v1-6-0 | v1 → v1-6-0 | Minor: Auto-update |
| 1.5.0 → 2.0.0 | v2-0-0 | v2 (new) | Major: Manual migration |

---

## Deployment Methods

### Method 1: Automated (GitHub Actions) ⭐ Recommended

**Trigger:** Push to `main` branch

```bash
# Make changes to shared-components
git add shared-components/
git commit -m "feat: add new Button variant"
git push origin main
```

GitHub Actions automatically:
1. Detects changes in `shared-components/`
2. Builds the package
3. Deploys to Vercel
4. Creates version aliases
5. Posts deployment summary

**Workflow files:**
- `.github/workflows/deploy-shared-components.yml`
- `.github/workflows/deploy-shared-data.yml`

---

### Method 2: Manual Version Bump (GitHub Actions)

**For intentional version bumps:**

1. Go to GitHub Actions → "Deploy Shared Components"
2. Click "Run workflow"
3. Select:
   - **Version type:** patch, minor, or major
   - **Deploy:** true
4. Click "Run workflow"

This will:
1. Bump package version
2. Build and deploy
3. Create version aliases
4. Commit version bump back to repo

---

### Method 3: Local Deployment (Scripts)

**Step 1: Bump version**
```bash
# Show current version
./scripts/version-manager.sh current shared-components

# Preview next version
./scripts/version-manager.sh next shared-components patch

# Bump version (will prompt for confirmation)
./scripts/version-manager.sh bump shared-components patch
```

**Step 2: Deploy**
```bash
# Deploy with version management
./scripts/deploy-remote.sh shared-components 1.5.1

# This creates:
# - https://shared-components-v1-5-1.vercel.app/
# - Updates https://shared-components-v1.vercel.app/
```

**Step 3: Commit**
```bash
git add shared-components/package.json
git commit -m "chore: bump shared-components to v1.5.1"
git push
```

---

## GitHub Actions Workflows

### Configuration Required

**Vercel Tokens (Secrets):**
```
VERCEL_TOKEN             - Vercel authentication token
VERCEL_ORG_ID           - Your Vercel organization ID
VERCEL_PROJECT_ID_SHARED_COMPONENTS  - Project ID for shared-components
VERCEL_PROJECT_ID_SHARED_DATA        - Project ID for shared-data
```

**How to get these:**

1. **VERCEL_TOKEN:**
   ```bash
   vercel login
   # Go to https://vercel.com/account/tokens
   # Create new token
   ```

2. **VERCEL_ORG_ID:**
   ```bash
   vercel whoami
   # Copy "Team ID" or "User ID"
   ```

3. **Project IDs:**
   ```bash
   cd shared-components
   vercel link
   # Copy from .vercel/project.json
   ```

**Add to GitHub:**
- Go to repository → Settings → Secrets and variables → Actions
- Add each secret

### Workflow Triggers

**Automatic (on push):**
```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'shared-components/**'
```

Changes to `shared-components/` trigger automatic deployment.

**Manual (workflow_dispatch):**
- Go to Actions → Select workflow → Run workflow
- Choose version bump type (patch/minor/major)
- Optionally skip deployment

### Deployment Output

GitHub Actions provides:
- Build logs
- Deployment URLs
- Test commands
- Summary with URLs and testing instructions

---

## Manual Deployment

### Prerequisites

```bash
# Install Vercel CLI
npm install -g vercel@latest

# Login
vercel login
```

### Quick Deployment

```bash
# Navigate to package
cd shared-components

# Deploy to production
vercel deploy --prod

# Create aliases
vercel alias set [deployment-url] shared-components-v1-5-0.vercel.app
vercel alias set [deployment-url] shared-components-v1.vercel.app
```

### Using Deployment Script

```bash
# All-in-one: build, deploy, create aliases
./scripts/deploy-remote.sh shared-components 1.5.0

# Interactive prompts guide you through:
# - Confirms package and version
# - Builds the package
# - Deploys to Vercel
# - Creates version aliases
# - Optionally updates production alias
# - Shows testing commands
```

---

## Version Management

### Version Manager Script

**Show all package versions:**
```bash
./scripts/version-manager.sh all
```

**Show current version:**
```bash
./scripts/version-manager.sh current shared-components
```

**Preview next version:**
```bash
./scripts/version-manager.sh next shared-components patch
# Shows: 1.5.0 → 1.5.1
```

**Bump version:**
```bash
./scripts/version-manager.sh bump shared-components patch
# Prompts for confirmation
# Updates package.json
# Shows next steps
```

### Semantic Versioning Rules

**Patch (1.5.0 → 1.5.1):**
- Bug fixes
- Small improvements
- No breaking changes
- No new features
- **Deploy:** Automatic via major version alias

**Minor (1.5.0 → 1.6.0):**
- New features
- Enhancements
- Backwards compatible
- **Deploy:** Automatic via major version alias

**Major (1.5.0 → 2.0.0):**
- Breaking changes
- API changes
- Requires code changes in consumers
- **Deploy:** New major version alias (v2)
- **Migration:** Host apps update when ready

---

## Configuration

### Environment-Specific URLs

Update default URLs in `shared-data/src/utils/loadDynamicRemote.ts`:

```typescript
function getDefaultRemoteURLs(): DefaultRemoteURLs {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return {
      // Use major version aliases (recommended)
      shared_components: 'https://shared-components-v1.vercel.app/remoteEntry.js',
      shared_data: 'https://shared-data-v1.vercel.app/remoteEntry.js',
      // ... other remotes
    };
  }

  return {
    // Local development
    shared_components: 'http://localhost:3001/remoteEntry.js',
    // ... other remotes
  };
}
```

### Vercel Project Configuration

**vercel.json** (optional, per package):

```json
{
  "version": 2,
  "name": "shared-components",
  "buildCommand": "npm run build:prod",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Testing Deployments

### Before Promoting to Major Version

**Step 1: Deploy specific version**
```bash
./scripts/deploy-remote.sh shared-components 1.6.0
# Creates: https://shared-components-v1-6-0.vercel.app/
# Does NOT update v1 alias yet
```

**Step 2: Test specific version**
```javascript
// In browser console
mf.override('shared_components', 'https://shared-components-v1-6-0.vercel.app/remoteEntry.js')
location.reload()
```

**Step 3: Test with URL parameter**
```
http://localhost:3000/?remote_shared_components=https://shared-components-v1-6-0.vercel.app/remoteEntry.js
```

**Step 4: Canary test (5% of users)**
```javascript
// Backend sets cookie for 5% of users
if (isInCanary(userId)) {
  response.cookie('mf_shared_components',
    'https://shared-components-v1-6-0.vercel.app/remoteEntry.js',
    { httpOnly: true, secure: true }
  );
}
```

**Step 5: Monitor metrics**
- Error rates
- Performance
- User feedback

**Step 6: Promote to major version**
```bash
# Update major version alias
vercel alias set [deployment-url] shared-components-v1.vercel.app
```

Now all users using `v1` alias get the new version.

### Verification

**Check alias points to correct deployment:**
```bash
curl -I https://shared-components-v1.vercel.app/remoteEntry.js
# Look for x-vercel-id header
```

**Test in app:**
```javascript
// Should show override message with correct URL
mf.listOverrides()
```

---

## Troubleshooting

### Issue: Deployment fails with "Project not found"

**Cause:** Missing or incorrect project ID

**Solution:**
```bash
cd shared-components
vercel link
# Follow prompts to link to Vercel project
# Copy project ID from .vercel/project.json
# Add to GitHub secrets
```

### Issue: Alias creation fails

**Cause:** Insufficient permissions

**Solution:**
- Verify VERCEL_TOKEN has correct scope
- Check team permissions in Vercel dashboard
- Recreate token with full permissions

### Issue: Major version alias not updating

**Cause:** Alias set to different deployment

**Solution:**
```bash
# Check current alias
vercel alias ls shared-components-v1.vercel.app

# Force update
vercel alias set [new-deployment-url] shared-components-v1.vercel.app --yes
```

### Issue: CORS errors in production

**Cause:** Missing CORS headers

**Solution:**
Add `vercel.json` with CORS headers (see Configuration section)

### Issue: Cache not invalidating

**Cause:** Vercel edge cache

**Solution:**
```bash
# Add cache-control headers to force revalidation
# Or use unique URLs for each version (already implemented)
```

---

## Rollback Procedure

### Quick Rollback

**If new version has issues:**

```bash
# Option 1: Point major alias to previous version
vercel alias set https://shared-components-v1-5-0.vercel.app shared-components-v1.vercel.app

# Option 2: Use deployment script with old version
./scripts/deploy-remote.sh shared-components 1.5.0
```

### Gradual Rollback

**Route some users back to old version:**

```javascript
// Backend sets cookie to override
if (hasIssues(userId)) {
  response.cookie('mf_shared_components',
    'https://shared-components-v1-5-0.vercel.app/remoteEntry.js'
  );
}
```

---

## Best Practices

### 1. Use Major Version Aliases in Production

**Recommended:**
```typescript
shared_components: 'https://shared-components-v1.vercel.app/remoteEntry.js'
```

**Why:** Automatic updates for minor/patch versions

**Not Recommended:**
```typescript
shared_components: 'https://shared-components-v1-5-0.vercel.app/remoteEntry.js'
```

**Why:** Pinned to specific version, requires rebuild to update

### 2. Test Before Promoting

Always test specific version URL before updating major alias:
1. Deploy to specific URL
2. Test via URL parameter or cookie
3. Monitor metrics
4. Update major alias

### 3. Semantic Versioning Discipline

- **Patch:** Bug fixes only
- **Minor:** New features, backwards compatible
- **Major:** Breaking changes

### 4. Document Breaking Changes

For major versions, document:
- What changed
- Migration guide
- Deprecation timeline

### 5. Monitor Deployments

Track:
- Deployment success rate
- Load times
- Error rates
- Version distribution

---

## Next Steps

**Immediate:**
1. Configure GitHub secrets (VERCEL_TOKEN, project IDs)
2. Test deployment script locally
3. Deploy first version with script

**Short-term:**
1. Set up monitoring for remote load failures
2. Create deployment dashboard
3. Document version upgrade process for team

**Long-term:**
1. Automate canary deployments
2. Add performance monitoring
3. Implement automatic rollback on errors

---

## Related Documentation

- [FEDERATION_STRATEGY_IMPLEMENTATION.md](../architecture/FEDERATION_STRATEGY_IMPLEMENTATION.md) - Federation strategy overview
- [FEDERATION_QUICK_START.md](../architecture/FEDERATION_QUICK_START.md) - Quick start guide
- [STATIC_VS_RUNTIME_FEDERATION.md](../architecture/STATIC_VS_RUNTIME_FEDERATION.md) - Detailed analysis

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-24
