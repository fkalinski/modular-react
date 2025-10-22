# Vercel Deployment Guide

## ✅ Issue Fixed

The **DTS plugin error** has been resolved! All webpack configs now have `dts: false` to prevent TypeScript type generation failures in Vercel's CI/CD environment.

## Deployment Choices - Verified Correct ✅

Your setup choices for **shared-components** were perfect:

```bash
✅ Set up and deploy "~/dev/fkalinski/modular-react/shared-components"? yes
✅ Which scope? fkalinski's projects
✅ Link to existing project? no
✅ Project name? shared-components
✅ Code directory? ./
✅ Want to modify settings? no
```

The **shared-data** deployment will now work with the same settings after the webpack fix.

## Deployment Order (CRITICAL)

Deploy in this **exact order** to ensure remote URLs are available:

### 1️⃣ Deploy Shared Modules First

```bash
# 1. Shared Components (deployed ✅)
cd shared-components
vercel --prod

# 2. Shared Data
cd ../shared-data
vercel --prod
```

### 2️⃣ Deploy Content Platform Tabs

```bash
# 3. Files & Folders Tab
cd ../content-platform/files-folders
vercel --prod

# 4. Hubs Tab (if using separate deployment)
cd ../../hubs-tab
vercel --prod
```

### 3️⃣ Deploy Content Platform Shell

```bash
# 5. Content Platform Shell (loads Files + Hubs tabs)
cd ../content-platform/shell
vercel --prod
```

### 4️⃣ Deploy Top-Level Tabs

```bash
# 6. Reports Tab
cd ../../reports-tab
vercel --prod

# 7. User Tab
cd ../user-tab
vercel --prod
```

### 5️⃣ Deploy Top-Level Shell (LAST)

```bash
# 8. Top-Level Shell (loads everything)
cd ../top-level-shell
vercel --prod
```

## Project Settings for Each Module

Use these **exact settings** for all modules:

### Standard Settings (Most Modules)

```
? Which scope? fkalinski's projects
? Link to existing project? no
? Project name? [module-name]
? Code directory? ./
? Want to modify settings? no
```

### Expected Output Directory

Vercel will auto-detect from `vercel.json` or use defaults:

| Module | Output Directory |
|--------|------------------|
| shared-components | `dist` (from vercel.json) |
| shared-data | `dist` |
| top-level-shell | `dist` |
| content-platform/shell | `dist` |
| files-folders | `dist` |
| hubs-tab | `dist` |
| reports-tab | `dist` |
| user-tab | `dist` |

## Updating Remote URLs

After deploying each module, **update the production URLs** in dependent webpack configs:

### Example: After deploying shared-components

Production URL: `https://shared-components-abc123.vercel.app`

Update in **ALL** webpack configs that import it:

```javascript
// top-level-shell/webpack.config.js
shared_components: isProduction
  ? 'shared_components@https://shared-components-abc123.vercel.app/remoteEntry.js'
  : 'shared_components@http://localhost:3001/remoteEntry.js',
```

### Full URL Update Checklist

After deployment, update these URLs:

1. **shared-components** URL → Update in:
   - `top-level-shell/webpack.config.js`
   - `content-platform/shell/webpack.config.js`
   - `content-platform/files-folders/webpack.config.js`
   - `hubs-tab/webpack.config.js`
   - `reports-tab/webpack.config.js`
   - `user-tab/webpack.config.js`

2. **shared-data** URL → Update in:
   - `top-level-shell/webpack.config.js`
   - `content-platform/shell/webpack.config.js`

3. **content-shell** (Content Platform Shell) URL → Update in:
   - `top-level-shell/webpack.config.js`

4. **files-tab**, **hubs-tab** URLs → Update in:
   - `content-platform/shell/webpack.config.js`

5. **reports-tab**, **user-tab** URLs → Update in:
   - `top-level-shell/webpack.config.js`

## Environment Variables (Alternative Approach)

Instead of hardcoding URLs, use environment variables in Vercel:

### 1. Set Environment Variables in Vercel Dashboard

For **top-level-shell** project, add:

```
REMOTE_SHARED_COMPONENTS_URL=https://shared-components-abc123.vercel.app
REMOTE_SHARED_DATA_URL=https://shared-data-xyz789.vercel.app
REMOTE_CONTENT_SHELL_URL=https://content-shell-def456.vercel.app
REMOTE_REPORTS_TAB_URL=https://reports-tab-ghi789.vercel.app
REMOTE_USER_TAB_URL=https://user-tab-jkl012.vercel.app
```

### 2. Webpack Already Supports This

The `getRemoteUrl()` helper in webpack configs already reads from environment:

```javascript
const getRemoteUrl = (name, defaultUrl) => {
  const envVar = `REMOTE_${name.toUpperCase()}_URL`;
  return process.env[envVar] || defaultUrl;
};
```

## Vercel Project Settings

### Build Settings

Vercel auto-detects these from `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### Framework Preset

- **Framework**: None (custom webpack setup)
- **Node Version**: 20.x (default)

### CORS Headers

Already configured in `vercel.json` for modules that need it:

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

## Testing the Deployment

### 1. Check Individual Modules

After each deployment, verify the module loads:

```
https://shared-components-abc123.vercel.app/remoteEntry.js
```

Should return JavaScript (not 404).

### 2. Check Dependencies

Open browser console at your top-level shell URL:

```
https://top-level-shell.vercel.app
```

Look for:
- ✅ No `remoteEntry.js` 404 errors
- ✅ No CORS errors
- ✅ Tabs load correctly
- ✅ Shared components render

### 3. Verify Module Federation

In console, check:

```javascript
// Should show all loaded remotes
window.__FEDERATION__
```

## Common Issues & Solutions

### Issue 1: DTS Plugin Error ✅ FIXED

**Error:**
```
Unable to compile federated types
Error: write EPIPE
```

**Solution:** ✅ Already fixed! All webpack configs now have `dts: false`.

### Issue 1.5: Workspace Package Dependencies ✅ FIXED

**Error:**
```
npm error 404 '@content-platform/tab-contract@1.0.0' is not in this registry
```

**Cause:** Federated modules had dependencies on local workspace packages that don't exist in npm registry.

**Solution:** ✅ Already fixed! Tab contract types are now inlined in each module:
- `content-platform/files-folders/src/types.ts` - Contains all tab contract interfaces
- Import changed from `'@tab-contract'` to `'./types'`
- Removed workspace dependency from package.json
- Each module is now completely self-contained

### Issue 2: remoteEntry.js 404

**Error:**
```
GET https://module.vercel.app/remoteEntry.js 404
```

**Solution:**
1. Verify build output includes `remoteEntry.js`
2. Check `publicPath` in webpack config
3. Ensure output directory is `dist`
4. Rebuild and redeploy

### Issue 3: CORS Error

**Error:**
```
Access to script at '...' has been blocked by CORS policy
```

**Solution:**
Add to `vercel.json`:

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

### Issue 4: Shared Dependencies Version Mismatch

**Error:**
```
Unsatisfied version 18.2.0 of shared singleton module react
```

**Solution:**
Make sure `requiredVersion` in webpack configs allows flexibility:

```javascript
shared: {
  react: {
    singleton: true,
    requiredVersion: packageJson.dependencies.react,
    strictVersion: false, // ← Important!
  }
}
```

### Issue 5: Wrong Deployment Order

**Error:**
```
Shell can't find remotes
```

**Solution:**
Follow deployment order:
1. Shared modules (shared-components, shared-data)
2. Tab modules (files-folders, hubs-tab, reports-tab, user-tab)
3. Platform shells (content-platform/shell, top-level-shell)

## Deployment Checklist

Before deploying:

- [ ] All webpack configs have `dts: false` ✅
- [ ] All `vercel.json` files are present
- [ ] Build command is `npm run build`
- [ ] Output directory is `dist`
- [ ] CORS headers configured for shared modules

During deployment:

- [ ] Deploy shared-components first ✅
- [ ] Deploy shared-data second
- [ ] Deploy tabs (files, hubs, reports, user)
- [ ] Deploy content-platform/shell
- [ ] Deploy top-level-shell last

After deployment:

- [ ] Save all production URLs
- [ ] Update webpack configs with real URLs OR
- [ ] Set environment variables in Vercel
- [ ] Redeploy dependent modules
- [ ] Test in browser
- [ ] Check browser console for errors
- [ ] Verify all tabs load

## Quick Redeploy

If you need to redeploy after URL updates:

```bash
# From root of project
cd shared-components && vercel --prod && \
cd ../shared-data && vercel --prod && \
cd ../content-platform/files-folders && vercel --prod && \
cd ../../hubs-tab && vercel --prod && \
cd ../content-platform/shell && vercel --prod && \
cd ../../reports-tab && vercel --prod && \
cd ../user-tab && vercel --prod && \
cd ../top-level-shell && vercel --prod
```

## Production URLs Template

Keep track of your deployed URLs:

```bash
# Shared Modules
SHARED_COMPONENTS_URL=https://shared-components-???.vercel.app
SHARED_DATA_URL=https://shared-data-???.vercel.app

# Content Platform
CONTENT_SHELL_URL=https://content-shell-???.vercel.app
FILES_TAB_URL=https://files-folders-???.vercel.app
HUBS_TAB_URL=https://hubs-tab-???.vercel.app

# Top-Level Tabs
REPORTS_TAB_URL=https://reports-tab-???.vercel.app
USER_TAB_URL=https://user-tab-???.vercel.app

# Main Shell
TOP_LEVEL_SHELL_URL=https://top-level-shell-???.vercel.app
```

## Next Steps

1. ✅ **DTS fix committed** - All modules can now build in Vercel
2. **Redeploy shared-data** with fixed webpack config:
   ```bash
   cd shared-data
   vercel --prod
   ```
3. **Continue deployment** following the order above
4. **Update remote URLs** in webpack configs or use environment variables
5. **Test thoroughly** in browser

## Need Help?

If you encounter issues:

1. Check Vercel build logs: `vercel logs <deployment-url>`
2. Verify webpack config has `dts: false`
3. Check CORS headers in `vercel.json`
4. Ensure deployment order was correct
5. Verify all remote URLs are accessible

---

**Status:** ✅ Ready to deploy! The DTS plugin issue has been fixed in all webpack configs.
