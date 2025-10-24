# Module Federation Deployment Guide

## Overview

This guide explains how to deploy the modular React platform to Vercel (or other static hosting CDNs like Netlify, Cloudflare Pages, etc.).

## Architecture

Each federated module is deployed as a **separate static site** with its own URL:

```
┌─────────────────────────────────────────────────────────────┐
│                    CDN Architecture                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  shared-components.vercel.app  ← Base components            │
│  shared-data.vercel.app        ← Redux store                │
│  content-platform.vercel.app   ← Content shell              │
│  files-tab.vercel.app          ← Files plugin               │
│  hubs-tab.vercel.app           ← Hubs plugin                │
│  reports-tab.vercel.app        ← Reports plugin             │
│  user-tab.vercel.app           ← User plugin                │
│                                                              │
│  modular-platform.vercel.app   ← Main app (loads all above) │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### How It Works

1. **Build Phase**: Each module is built with webpack into static files:
   - `remoteEntry.js` - Module Federation entry point
   - Chunked JavaScript bundles
   - HTML entry file
   - Static assets

2. **Runtime**: The main app (top-level-shell) loads remote modules dynamically:
   ```javascript
   // At runtime, webpack fetches:
   https://shared-components.vercel.app/remoteEntry.js
   https://files-tab.vercel.app/remoteEntry.js
   // ... etc
   ```

3. **CORS**: All modules include CORS headers to allow cross-origin loading

## Setup Instructions

### 1. Create Vercel Projects

For each module, create a separate Vercel project:

#### Via Vercel CLI (Recommended):

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Create projects for each module
cd shared-components && vercel --prod
cd ../shared-data && vercel --prod
cd ../content-platform/shell && vercel --prod
cd ../content-platform/files-folders && vercel --prod
cd ../hubs-tab && vercel --prod
cd ../reports-tab && vercel --prod
cd ../user-tab && vercel --prod
cd ../top-level-shell && vercel --prod
```

#### Via Vercel Dashboard:

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Create separate projects for each folder:
   - `shared-components`
   - `shared-data`
   - `content-platform/shell`
   - `content-platform/files-folders`
   - `hubs-tab`
   - `reports-tab`
   - `user-tab`
   - `top-level-shell`

### 2. Configure Project Settings

For each project in Vercel dashboard:

**Build Settings:**
- Framework Preset: `Other`
- Build Command: `npm run build:prod`
- Output Directory: `dist`
- Install Command: `npm install`
- Root Directory: (set to the module folder)

**Example for shared-components:**
- Root Directory: `shared-components`
- Build Command: `npm run build`
- Output Directory: `dist`

**Example for top-level-shell:**
- Root Directory: `top-level-shell`
- Build Command: `npm run build:prod`
- Output Directory: `dist`

### 3. Set Environment Variables

In each project that **consumes** remote modules, add environment variables:

**For top-level-shell:**
```
REMOTE_SHARED_COMPONENTS_URL=https://your-shared-components.vercel.app
REMOTE_SHARED_DATA_URL=https://your-shared-data.vercel.app
REMOTE_CONTENT_SHELL_URL=https://your-content-platform.vercel.app
REMOTE_REPORTS_TAB_URL=https://your-reports-tab.vercel.app
REMOTE_USER_TAB_URL=https://your-user-tab.vercel.app
```

**For content-platform/shell:**
```
REMOTE_SHARED_COMPONENTS_URL=https://your-shared-components.vercel.app
REMOTE_SHARED_DATA_URL=https://your-shared-data.vercel.app
REMOTE_FILES_TAB_URL=https://your-files-tab.vercel.app
REMOTE_HUBS_TAB_URL=https://your-hubs-tab.vercel.app
```

### 4. Setup GitHub Actions (Automated CI/CD)

#### Required GitHub Secrets:

Go to your GitHub repo → Settings → Secrets → Actions, and add:

```
VERCEL_TOKEN                          # From https://vercel.com/account/tokens
VERCEL_ORG_ID                        # From Vercel project settings
VERCEL_SHELL_PROJECT_ID              # For top-level-shell
VERCEL_SHARED_COMPONENTS_PROJECT_ID  # For shared-components
VERCEL_SHARED_DATA_PROJECT_ID        # For shared-data
VERCEL_CONTENT_PLATFORM_PROJECT_ID   # For content-platform/shell
VERCEL_FILES_TAB_PROJECT_ID          # For files-folders
VERCEL_HUBS_TAB_PROJECT_ID           # For hubs-tab
VERCEL_REPORTS_TAB_PROJECT_ID        # For reports-tab
VERCEL_USER_TAB_PROJECT_ID           # For user-tab
```

**How to find Project IDs:**
1. Go to Vercel project settings
2. Look for "Project ID" in the General tab
3. Or run `vercel project ls` in each folder

#### Workflow:

The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
1. ✅ Deploy shared-components first (base dependency)
2. ✅ Deploy shared-data next
3. ✅ Deploy content-platform and all tabs (in parallel)
4. ✅ Deploy top-level-shell last (depends on everything)

### 5. Deployment Order

**Critical**: Always deploy in this order:

1. **shared-components** (everything depends on this)
2. **shared-data** (platform state management)
3. **Tabs** (files, hubs, reports, user) - can deploy in parallel
4. **content-platform/shell** (after tabs)
5. **top-level-shell** (after everything) - this is your main app

## Manual Deployment

### Deploy All Modules:

```bash
# 1. Shared Components
cd shared-components
npm run build
vercel --prod

# 2. Shared Data
cd ../shared-data
npm run build
vercel --prod

# 3. Content Platform
cd ../content-platform/shell
npm run build:prod
vercel --prod

# 4. Files Tab
cd ../files-folders
npm run build:prod
vercel --prod

# 5. Hubs Tab
cd ../../hubs-tab
npm run build:prod
vercel --prod

# 6. Reports Tab
cd ../reports-tab
npm run build:prod
vercel --prod

# 7. User Tab
cd ../user-tab
npm run build:prod
vercel --prod

# 8. Top-Level Shell (main app)
cd ../top-level-shell
REMOTE_SHARED_COMPONENTS_URL=https://your-shared-components.vercel.app \
REMOTE_SHARED_DATA_URL=https://your-shared-data.vercel.app \
REMOTE_CONTENT_SHELL_URL=https://your-content-platform.vercel.app \
npm run build:prod
vercel --prod
```

## Alternative: Netlify Deployment

Netlify works similarly to Vercel:

### Setup:

1. Create separate sites for each module
2. Configure build settings:
   - Build command: `npm run build:prod`
   - Publish directory: `dist`
   - Base directory: (module folder)

3. Add environment variables in Netlify dashboard

### netlify.toml example:

```toml
[build]
  command = "npm run build:prod"
  publish = "dist"

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

## Troubleshooting

### Issue: "Failed to load remote entry"

**Cause**: Wrong remote URL or CORS issue

**Fix**:
1. Check environment variables are set correctly
2. Verify the remote module is actually deployed
3. Check browser console for exact URL being loaded
4. Verify CORS headers are present

### Issue: "Shared module version mismatch"

**Cause**: Different React versions across modules

**Fix**:
1. Ensure all modules use the same React version
2. Check `shared` config in webpack has `singleton: true`
3. Rebuild all modules after updating dependencies

### Issue: "Module not found"

**Cause**: Module exposed name doesn't match import

**Fix**:
1. Check `exposes` in webpack config matches import path
2. Verify `remotes` configuration has correct module name
3. Clear build cache: `rm -rf dist node_modules/.cache`

### Issue: "Build succeeds but app is blank"

**Cause**: Usually a runtime error or wrong publicPath

**Fix**:
1. Check browser console for errors
2. Verify `output.publicPath` is set correctly
3. Check Network tab to see if bundles are loading
4. Ensure all remote modules are accessible

## Monitoring

### Check Deployment Status:

```bash
# View deployments
vercel list

# View logs
vercel logs <deployment-url>
```

### Test Remote Loading:

Open browser console on your deployed main app:
```javascript
// Check if remotes are loaded
console.log(__webpack_module_cache__)

// Test loading a remote module
import('shared_components/Button').then(console.log)
```

## Production Checklist

- [ ] All modules deployed to CDN
- [ ] Environment variables configured
- [ ] CORS headers enabled on all modules
- [ ] Remote URLs updated in webpack configs
- [ ] GitHub Actions secrets configured
- [ ] Test all tabs load correctly
- [ ] Test search functionality
- [ ] Test file selection/actions
- [ ] Check browser console for errors
- [ ] Verify Network tab shows all bundles loading
- [ ] Test on multiple browsers

## Cost Optimization

### Vercel Free Tier:
- 100 GB bandwidth/month
- 6,000 build minutes/month
- Good for development/demos

### Production Tips:
1. **Enable caching**: Vercel/Netlify cache static assets automatically
2. **Code splitting**: Already implemented via Module Federation
3. **Lazy loading**: Already implemented for tabs
4. **Bundle size**: Monitor with `webpack-bundle-analyzer`

## Next Steps

1. Set up production domains (e.g., `app.yourcompany.com`)
2. Add monitoring (Sentry, LogRocket)
3. Set up staging environments
4. Implement feature flags
5. Add analytics (Google Analytics, Mixpanel)
6. Set up error tracking

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Module Federation Docs](https://module-federation.io/)
- [Webpack 5 Module Federation](https://webpack.js.org/concepts/module-federation/)
- [Netlify Documentation](https://docs.netlify.com/)
