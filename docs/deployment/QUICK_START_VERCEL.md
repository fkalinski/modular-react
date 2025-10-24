# Vercel Monorepo Quick Start Guide

## ✅ What's Been Configured

All configuration files have been created for proper Turborepo monorepo deployment:

### Root Configuration
- ✅ `vercel.json` - Monorepo settings
- ✅ `.vercelignore` - Build optimization
- ✅ `turbo.json` - Updated with cache exclusions

### App Configuration (8 apps)
Each app has `vercel.json` with:
- ✅ Correct Turborepo build command: `cd ../.. && turbo run build:prod --filter=<app>`
- ✅ Output directory: `dist`
- ✅ Install command: `npm install`
- ✅ CORS headers for Module Federation

Apps configured:
1. `shared-components`
2. `shared-data`
3. `content-platform/shell`
4. `content-platform/files-folders`
5. `hubs-tab`
6. `reports-tab`
7. `user-tab`
8. `top-level-shell`

### Automation Scripts
- ✅ `deploy-vercel.sh` - Automated deployment in dependency order
- ✅ `setup-vercel-projects.sh` - Interactive setup guide

## 🚀 Deployment Steps

### Step 1: Link Projects to Vercel (Interactive - Required)

Run the setup script:

```bash
./scripts/setup-vercel-projects.sh
```

This will:
1. Link each app to Vercel
2. Guide you through setting Root Directory for each project
3. Enable Turborepo remote cache (requires interactive input)

**OR manually:**

```bash
# For each app directory
cd shared-components
vercel link
# Follow prompts, then go to Vercel Dashboard → Settings → General
# Set Root Directory: shared-components
cd ..

# Repeat for other apps
```

### Step 2: Configure Root Directories in Vercel Dashboard

For each project in [Vercel Dashboard](https://vercel.com/dashboard):

1. Go to **Settings** → **General**
2. Scroll to **Root Directory**
3. Click **Edit** and set:

| Project | Root Directory |
|---------|----------------|
| shared-components | `shared-components` |
| shared-data | `shared-data` |
| content-platform-shell | `content-platform/shell` |
| files-folders | `content-platform/files-folders` |
| hubs-tab | `hubs-tab` |
| reports-tab | `reports-tab` |
| user-tab | `user-tab` |
| top-level-shell | `top-level-shell` |

4. Click **Save**

### Step 3: Enable Turborepo Remote Cache (Optional but Recommended)

```bash
# Already authenticated ✅
npx turbo login

# Link to enable remote cache (interactive)
npx turbo link
```

Select your Vercel team when prompted. This enables cache sharing across builds.

### Step 4: Deploy All Apps

```bash
./scripts/deploy-vercel.sh
```

This will:
- Deploy all 8 apps in correct dependency order
- Capture deployment URLs
- Save URLs to `deployment-urls.txt`
- Show environment variables to configure

**Expected output:**
```
🚀 Starting Vercel Monorepo Deployment...

Phase 1: Deploying Shared Modules
📦 Deploying: shared-components
✅ Deployed: https://shared-components-xxx.vercel.app

📦 Deploying: shared-data
✅ Deployed: https://shared-data-xxx.vercel.app

Phase 2: Deploying Tab Modules
...

✅ Deployment Complete!
```

### Step 5: Configure Environment Variables

After deployment, URLs will be saved in `deployment-urls.txt`.

#### For top-level-shell

In Vercel Dashboard → top-level-shell → Settings → Environment Variables:

```bash
REMOTE_SHARED_COMPONENTS_URL=https://shared-components-xxx.vercel.app
REMOTE_SHARED_DATA_URL=https://shared-data-xxx.vercel.app
REMOTE_CONTENT_SHELL_URL=https://content-platform-shell-xxx.vercel.app
REMOTE_REPORTS_TAB_URL=https://reports-tab-xxx.vercel.app
REMOTE_USER_TAB_URL=https://user-tab-xxx.vercel.app
```

Apply to: **Production, Preview, and Development**

#### For content-platform-shell

```bash
REMOTE_SHARED_COMPONENTS_URL=https://shared-components-xxx.vercel.app
REMOTE_SHARED_DATA_URL=https://shared-data-xxx.vercel.app
REMOTE_FILES_TAB_URL=https://files-folders-xxx.vercel.app
REMOTE_HUBS_TAB_URL=https://hubs-tab-xxx.vercel.app
```

### Step 6: Redeploy with Environment Variables

After setting environment variables, redeploy:

```bash
# Redeploy specific apps
cd content-platform/shell
vercel --prod
cd ../..

cd top-level-shell
vercel --prod
cd ..
```

OR redeploy all:

```bash
./scripts/deploy-vercel.sh
```

### Step 7: Test Deployment

1. Open top-level-shell URL: `https://top-level-shell-xxx.vercel.app`
2. Check browser console for errors
3. Verify:
   - ✅ No 404 errors for `remoteEntry.js`
   - ✅ No CORS errors
   - ✅ All tabs load correctly
   - ✅ Shared components render

## 📋 Verification Checklist

Before going live:

- [ ] All 8 projects linked to Vercel
- [ ] Root Directory configured for each project
- [ ] Turborepo remote cache enabled
- [ ] All apps deployed successfully
- [ ] Environment variables configured
- [ ] Apps redeployed with env vars
- [ ] No console errors in browser
- [ ] All Module Federation remotes loading
- [ ] All tabs functioning correctly

## 🔧 Troubleshooting

### Build fails: "turbo: command not found"

Turbo should be installed at root. Verify:

```bash
npm install
```

### Build fails: "Cannot find module"

Check that Root Directory is set correctly in Vercel Dashboard.

### Module Federation: remoteEntry.js 404

1. Verify deployment succeeded: `curl https://app.vercel.app/remoteEntry.js`
2. Check `dist/` contains `remoteEntry.js`
3. Verify CORS headers in `vercel.json`

### Environment variables not working

1. Ensure vars are set for **all environments** (Production, Preview, Development)
2. Redeploy after setting vars
3. Check webpack config has `getRemoteUrl()` helper

### Cache not working

Ensure Turborepo is linked:

```bash
npx turbo link
```

Check for cache hits in build logs:
```
>>> turbo run build:prod --filter=shared-components
cache hit, replaying output...
```

## 📚 Additional Resources

- [Full Documentation](./VERCEL_MONOREPO_DEPLOYMENT.md)
- [Vercel Monorepo Docs](https://vercel.com/docs/monorepos)
- [Turborepo Guide](https://vercel.com/docs/monorepos/turborepo)

## 🎯 Quick Commands

```bash
# Setup projects (interactive)
./scripts/setup-vercel-projects.sh

# Deploy all apps
./scripts/deploy-vercel.sh

# Deploy single app
cd <app-name>
vercel --prod

# Check deployment status
vercel ls

# View build logs
vercel logs <deployment-url>

# Enable remote cache
npx turbo login
npx turbo link

# Test build locally
turbo run build:prod
```

## 📝 Notes

- **Deployment order matters**: Shared modules → Tabs → Shells
- **Environment variables**: Must be set before dependent apps can load remotes
- **Cache**: First build will be slow, subsequent builds will be fast
- **Updates**: After changing remote URLs, redeploy dependent apps

---

**Status**: Ready for deployment ✅

**Next**: Run `./scripts/setup-vercel-projects.sh` to begin
