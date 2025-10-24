---
name: vercel-deployment
description: Complete guide for deploying the modular React platform to Vercel, including deployment order, environment variable configuration, and automated deployment scripts.
---

# Vercel Deployment

This skill guides you through deploying the modular React Module Federation platform to Vercel, ensuring proper deployment order and configuration.

## When to Use This Skill

Use this skill when you need to:
- Deploy modules to Vercel for the first time
- Update existing Vercel deployments
- Configure Module Federation remote URLs
- Troubleshoot deployment issues
- Set up environment variables for production

## Critical: Deployment Order

Module Federation requires dependencies to be deployed before their consumers. **Always follow this exact order:**

### Phase 1: Shared Modules (Foundation)
```bash
# 1. Shared Components
cd shared-components
vercel --prod

# 2. Shared Data
cd ../shared-data
vercel --prod
```

### Phase 2: Tab Modules
```bash
# 3. Files & Folders Tab
cd content-platform/files-folders
vercel --prod

# 4. Hubs Tab
cd ../../hubs-tab
vercel --prod

# 5. Reports Tab
cd ../reports-tab
vercel --prod

# 6. User Tab
cd ../user-tab
vercel --prod
```

### Phase 3: Shell Applications
```bash
# 7. Content Platform Shell
cd content-platform/shell
vercel --prod

# 8. Top-Level Shell (LAST - depends on everything)
cd ../../top-level-shell
vercel --prod
```

## Automated Deployment Scripts

### Using deploy-vercel.sh

Located at: `scripts/deploy-vercel.sh`

This script automates the deployment process:

```bash
cd /Users/fkalinski/dev/fkalinski/modular-react
./scripts/deploy-vercel.sh
```

**What it does:**
- Deploys all modules in correct dependency order
- Captures deployment URLs automatically
- Saves URLs to `deployment-urls.txt`
- Prints environment variable template
- Provides next steps guidance

### Using configure-module-federation.sh

Located at: `scripts/configure-module-federation.sh`

This script configures environment variables without redeploying:

```bash
# Requires .env.vercel file with VERCEL_TOKEN
./scripts/configure-module-federation.sh
```

**What it does:**
- Fetches current production URLs via Vercel API
- Sets environment variables for shell applications
- Configures both production and preview environments
- No redeployment needed (set vars only)

**After running, redeploy shells to use new URLs:**
```bash
cd content-platform/shell && vercel --prod
cd ../../top-level-shell && vercel --prod
```

## Manual Deployment Process

### First-Time Setup

For each module, use these settings:

```bash
? Set up and deploy? yes
? Which scope? fkalinski's projects
? Link to existing project? no
? Project name? [use directory name]
? Code directory? ./
? Want to modify settings? no
```

**Project names should match directory names:**
- `shared-components`
- `shared-data`
- `files-folders` (not content-platform-files-folders)
- `hubs-tab`
- `reports-tab`
- `user-tab`
- `shell` (for content-platform/shell)
- `top-level-shell`

### Capturing Deployment URLs

After each deployment, save the production URL:

```bash
# Vercel outputs:
✅ Production: https://shared-components-abc123.vercel.app

# Save to your list:
SHARED_COMPONENTS_URL=https://shared-components-abc123.vercel.app
```

## Environment Variable Configuration

### Option 1: Using Vercel Dashboard

For **top-level-shell** project, set these environment variables:

```
REMOTE_SHARED_COMPONENTS_URL=https://shared-components-xxx.vercel.app
REMOTE_SHARED_DATA_URL=https://shared-data-xxx.vercel.app
REMOTE_CONTENT_SHELL_URL=https://shell-xxx.vercel.app
REMOTE_REPORTS_TAB_URL=https://reports-tab-xxx.vercel.app
REMOTE_USER_TAB_URL=https://user-tab-xxx.vercel.app
```

For **shell** (content-platform/shell) project, set:

```
REMOTE_SHARED_COMPONENTS_URL=https://shared-components-xxx.vercel.app
REMOTE_SHARED_DATA_URL=https://shared-data-xxx.vercel.app
REMOTE_FILES_TAB_URL=https://files-folders-xxx.vercel.app
REMOTE_HUBS_TAB_URL=https://hubs-tab-xxx.vercel.app
```

**Important:** Set for both "Production" and "Preview" environments.

### Option 2: Using configure-module-federation.sh Script

**Prerequisite:** Create `.env.vercel` file:

```bash
# .env.vercel
VERCEL_TOKEN=your_vercel_token_here
```

Get token from: https://vercel.com/account/tokens

**Run configuration:**
```bash
./scripts/configure-module-federation.sh
```

**Then redeploy shells:**
```bash
cd content-platform/shell && vercel --prod
cd ../../top-level-shell && vercel --prod
```

### How Environment Variables Work

Webpack configs use the `getRemoteUrl()` helper:

```javascript
const getRemoteUrl = (name, defaultUrl) => {
  const envVar = `REMOTE_${name.toUpperCase()}_URL`;
  return process.env[envVar] || defaultUrl;
};
```

This reads `REMOTE_*_URL` environment variables at build time.

## Vercel Project Settings

### Build Configuration

Each module has a `vercel.json` with:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": null
}
```

### CORS Headers

Shared modules expose CORS headers:

```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      {"key": "Access-Control-Allow-Origin", "value": "*"}
    ]
  }]
}
```

This allows cross-origin loading of federated modules.

## Testing Deployments

### 1. Verify remoteEntry.js

Each deployed module should have a `remoteEntry.js` file:

```bash
curl https://shared-components-xxx.vercel.app/remoteEntry.js
# Should return JavaScript, not 404
```

### 2. Check Top-Level Shell

Open your top-level shell URL and check browser console:

```
https://top-level-shell-xxx.vercel.app
```

Look for:
- ✅ No `remoteEntry.js` 404 errors
- ✅ No CORS errors
- ✅ All tabs load correctly
- ✅ Module Federation working

### 3. Inspect Module Federation Runtime

In browser console:

```javascript
// Shows loaded federated modules
window.__FEDERATION__
```

## Common Issues & Solutions

### Issue 1: remoteEntry.js 404

**Symptoms:**
```
GET https://module.vercel.app/remoteEntry.js 404
```

**Solutions:**
1. Verify build completed successfully in Vercel logs
2. Check `outputDirectory: "dist"` in vercel.json
3. Ensure webpack generates remoteEntry.js (check webpack.config.js)
4. Rebuild and redeploy

### Issue 2: CORS Errors

**Symptoms:**
```
Access to script has been blocked by CORS policy
```

**Solution:**
Add to module's `vercel.json`:

```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      {"key": "Access-Control-Allow-Origin", "value": "*"}
    ]
  }]
}
```

### Issue 3: Wrong Deployment Order

**Symptoms:**
- Shell can't find remotes
- Circular dependency errors

**Solution:**
Redeploy in correct order (shared → tabs → shells).

### Issue 4: Environment Variables Not Applied

**Symptoms:**
- Still loading localhost URLs in production
- 404 on remote modules

**Solution:**
1. Verify environment variables are set in Vercel dashboard
2. Check they apply to "Production" environment
3. **Redeploy** the consuming module (env vars applied at build time)

### Issue 5: Module Version Conflicts

**Symptoms:**
```
Unsatisfied version 18.2.0 of shared singleton module react
```

**Solution:**
Ensure all modules have compatible dependency versions in package.json. Use `strictVersion: false` in webpack shared config.

## Deployment Checklist

### Before Deployment

- [ ] All modules build successfully locally (`npm run build`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] All `vercel.json` files exist
- [ ] Webpack configs have `dts: false` (if using Module Federation types)

### During Deployment

- [ ] Deploy shared-components first
- [ ] Deploy shared-data second
- [ ] Deploy all tabs (files, hubs, reports, user)
- [ ] Deploy content-platform/shell
- [ ] Deploy top-level-shell last
- [ ] Save all deployment URLs

### After Deployment

- [ ] All remoteEntry.js files accessible
- [ ] Environment variables configured in Vercel
- [ ] Shells redeployed to use new env vars
- [ ] Browser console shows no 404s or CORS errors
- [ ] All tabs load and function correctly
- [ ] Module Federation runtime working (`window.__FEDERATION__`)

## Automated Deployment Workflow

```bash
# Complete automated workflow:

# 1. Deploy all modules in order
./scripts/deploy-vercel.sh

# 2. Configure environment variables
./scripts/configure-module-federation.sh

# 3. Redeploy shells to apply new env vars
cd content-platform/shell && vercel --prod
cd ../../top-level-shell && vercel --prod

# 4. Test in browser
open https://top-level-shell-xxx.vercel.app
```

## Quick Commands Reference

```bash
# Deploy single module
cd [module-dir] && vercel --prod

# Check deployment logs
vercel logs [deployment-url]

# List deployments for a project
vercel ls

# Get deployment info
vercel inspect [deployment-url]

# Set environment variable (via CLI)
vercel env add REMOTE_SHARED_COMPONENTS_URL production

# Automated full deployment
./scripts/deploy-vercel.sh

# Configure Module Federation URLs
./scripts/configure-module-federation.sh
```

## Production URL Tracking

Keep a record of your production URLs in `deployment-urls.txt`:

```bash
# Auto-generated by deploy-vercel.sh
shared-components=https://shared-components-xxx.vercel.app
shared-data=https://shared-data-xxx.vercel.app
files-folders=https://files-folders-xxx.vercel.app
hubs-tab=https://hubs-tab-xxx.vercel.app
reports-tab=https://reports-tab-xxx.vercel.app
user-tab=https://user-tab-xxx.vercel.app
shell=https://shell-xxx.vercel.app
top-level-shell=https://top-level-shell-xxx.vercel.app
```

## Related Skills

- **dev-workflow**: For local development setup
- **npm-workspace**: For build and workspace management
- **module-federation-types**: For handling types in federated modules

## References

- Deployment script: `scripts/deploy-vercel.sh`
- Configuration script: `scripts/configure-module-federation.sh`
- Deployment guide: `docs/deployment/VERCEL_DEPLOYMENT_GUIDE.md`
- Quick start: `docs/deployment/QUICK_START_DEPLOYMENT.md`
- Vercel CLI docs: https://vercel.com/docs/cli
