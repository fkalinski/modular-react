# Vercel Deployment Fix Guide

## Problem Summary

All Vercel deployments are failing due to incorrect **Root Directory** configuration in Vercel project settings. The current configuration causes:

1. **Doubled paths**: Root Directory is set to paths like `shared-components/shared-components` (doesn't exist)
2. **Build failures**: Turborepo cannot find the monorepo root `package.json`
3. **Dependency errors**: Workspace dependencies (`@modular-platform/*`) fail to resolve

### Example Errors

```
Error: The provided path "~/dev/fkalinski/modular-react/shared-components/shared-components" does not exist
Error: Unable to read package.json: failed to open file `/vercel/package.json`
Error: npm error 404 '@modular-platform/shared-components@*' is not in this registry
```

---

## Solution Overview

**Fix the configuration in two steps:**

1. ✅ **COMPLETED**: Update all `vercel.json` files (removed `cd ..` commands, updated output paths)
2. ⚠️ **TODO**: Update Vercel project Root Directory settings to `.` (monorepo root)

---

## Step 1: Verify vercel.json Updates (COMPLETED)

All 8 `vercel.json` files have been updated:

### Changes Made

| Project | Old buildCommand | New buildCommand | Old outputDirectory | New outputDirectory |
|---------|-----------------|------------------|---------------------|---------------------|
| shared-components | `cd .. && turbo ...` | `turbo ...` | `dist` | `shared-components/dist` |
| shared-data | `cd .. && turbo ...` | `turbo ...` | `dist` | `shared-data/dist` |
| hubs-tab | `cd .. && turbo ...` | `turbo ...` | `dist` | `hubs-tab/dist` |
| reports-tab | `cd .. && turbo ...` | `turbo ...` | `dist` | `reports-tab/dist` |
| user-tab | `cd .. && turbo ...` | `turbo ...` | `dist` | `user-tab/dist` |
| files-folders | `cd ../.. && turbo ...` | `turbo ...` | `dist` | `content-platform/files-folders/dist` |
| content-platform-shell | `cd ../.. && turbo ...` | `turbo ...` | `dist` | `content-platform/shell/dist` |
| top-level-shell | `cd .. && turbo ...` | `turbo ...` | `dist` | `top-level-shell/dist` |

### What This Fixes

- **Removes `cd ..` navigation**: Build commands now assume they start at the monorepo root
- **Updates output paths**: Output directories now include the full path from root (e.g., `shared-components/dist`)
- **Preserves all other settings**: CORS headers, rewrites, dev commands remain unchanged

---

## Step 2: Update Vercel Root Directory Settings (REQUIRED)

### Why This Is Needed

Vercel needs to know where to run the build commands. Currently, each project is configured to build from its subdirectory, but the monorepo requires building from the root directory.

**Important**: The Root Directory field must be **completely empty** (blank) to use the repository root. Do not enter ".", "./", or any other value - just leave it empty.

### Manual Update via Dashboard

For **each of the 8 projects**, follow these steps:

1. Open the project settings page:
   ```
   shared-components: https://vercel.com/fkalinskis-projects/shared-components/settings
   shared-data: https://vercel.com/fkalinskis-projects/shared-data/settings
   hubs-tab: https://vercel.com/fkalinskis-projects/hubs-tab/settings
   reports-tab: https://vercel.com/fkalinskis-projects/reports-tab/settings
   user-tab: https://vercel.com/fkalinskis-projects/user-tab/settings
   files-folders: https://vercel.com/fkalinskis-projects/files-folders/settings
   shell: https://vercel.com/fkalinskis-projects/shell/settings
   top-level-shell: https://vercel.com/fkalinskis-projects/top-level-shell/settings
   ```

2. Navigate to: **Settings** → **General** → **Root Directory**

3. **CLEAR the Root Directory field** - leave it completely **EMPTY** (blank)
   - Click in the field and delete any existing value
   - Do NOT enter ".", "./", or any other value
   - An empty Root Directory tells Vercel to use the repository root
   - This is the correct way to specify the monorepo root

4. Click **Save**

5. Repeat for all 8 projects

### Automated Helper Script

Run this script to open all settings pages in your browser:

```bash
./scripts/fix-vercel-root-directory.sh
```

The script will:
- Verify Vercel CLI is installed
- List all projects that need updating
- Open all settings pages in your browser
- Provide instructions for manual updates

### Alternative: Vercel API (Advanced)

If you prefer automation via API:

```bash
export VERCEL_TOKEN='your-vercel-token-here'

# For each project:
curl -X PATCH \
  'https://api.vercel.com/v9/projects/PROJECT_NAME' \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"rootDirectory": null}'
```

Replace `PROJECT_NAME` with: `shared-components`, `shared-data`, `hubs-tab`, `reports-tab`, `user-tab`, `files-folders`, `shell`, `top-level-shell`

Get your token at: https://vercel.com/account/tokens

---

## Step 3: Deploy All Projects

After updating the Root Directory settings, deploy in dependency order:

### Quick Deploy (Automated)

```bash
./scripts/deploy-after-fix.sh
```

This script will:
1. Deploy foundation modules (shared-components, shared-data)
2. Deploy tab modules (hubs-tab, reports-tab, user-tab, files-folders)
3. Capture production URLs
4. Prompt you to set environment variables for shells
5. Deploy shell applications (content-platform-shell, top-level-shell)
6. Display all production URLs

### Manual Deploy (Step-by-Step)

If you prefer manual control:

#### Phase 1: Foundation Modules

```bash
cd /Users/fkalinski/dev/fkalinski/modular-react/shared-components
vercel --prod --yes

cd /Users/fkalinski/dev/fkalinski/modular-react/shared-data
vercel --prod --yes
```

#### Phase 2: Tab Modules

```bash
cd /Users/fkalinski/dev/fkalinski/modular-react/hubs-tab
vercel --prod --yes

cd /Users/fkalinski/dev/fkalinski/modular-react/reports-tab
vercel --prod --yes

cd /Users/fkalinski/dev/fkalinski/modular-react/user-tab
vercel --prod --yes

cd /Users/fkalinski/dev/fkalinski/modular-react/content-platform/files-folders
vercel --prod --yes
```

#### Phase 3: Get Production URLs

```bash
cd /Users/fkalinski/dev/fkalinski/modular-react

# List deployments to get URLs
vercel ls --prod --scope fkalinskis-projects
```

Record the production URLs for each project.

#### Phase 4: Configure Environment Variables

Set these environment variables in the Vercel Dashboard:

**For content-platform-shell:**
- Go to: https://vercel.com/fkalinskis-projects/shell/settings/environment-variables
- Add:
  ```
  REMOTE_SHARED_COMPONENTS_URL=https://shared-components-xxx.vercel.app
  REMOTE_SHARED_DATA_URL=https://shared-data-xxx.vercel.app
  REMOTE_FILES_TAB_URL=https://files-folders-xxx.vercel.app
  REMOTE_HUBS_TAB_URL=https://hubs-xxx.vercel.app
  ```
- Environment: Production
- Click "Save"

**For top-level-shell:**
- Go to: https://vercel.com/fkalinskis-projects/top-level-shell/settings/environment-variables
- Add:
  ```
  REMOTE_SHARED_COMPONENTS_URL=https://shared-components-xxx.vercel.app
  REMOTE_SHARED_DATA_URL=https://shared-data-xxx.vercel.app
  REMOTE_CONTENT_SHELL_URL=https://shell-xxx.vercel.app
  REMOTE_REPORTS_TAB_URL=https://reports-xxx.vercel.app
  REMOTE_USER_TAB_URL=https://user-xxx.vercel.app
  ```
- Environment: Production
- Click "Save"

#### Phase 5: Deploy Shells

```bash
cd /Users/fkalinski/dev/fkalinski/modular-react/content-platform/shell
vercel --prod --yes

cd /Users/fkalinski/dev/fkalinski/modular-react/top-level-shell
vercel --prod --yes
```

---

## Verification

After deployment, verify everything works:

### 1. Check Deployment Status

Visit each project in Vercel Dashboard:
- Ensure all deployments show "Ready" status
- Check build logs for any errors

### 2. Test Production URLs

Visit each deployment URL and verify:
- Page loads without errors
- Check browser console for errors
- Verify `remoteEntry.js` is accessible at each URL

Example:
```bash
curl -I https://shared-components-xxx.vercel.app/remoteEntry.js
# Should return: HTTP/2 200
```

### 3. Test Module Federation

Visit the top-level-shell URL:
- Open browser developer console
- Check for Module Federation errors
- Verify tabs load correctly
- Check that components from shared-components render

---

## Troubleshooting

### Build Still Fails with "package.json not found"

**Cause**: Root Directory not updated in Vercel settings

**Solution**:
- Double-check that Root Directory is set to `.` (single dot)
- Clear Vercel cache: Add `--force` flag to deployment
- Verify you saved the settings in Vercel Dashboard

### "npm error 404" for workspace dependencies

**Cause**: Build is still isolated from monorepo

**Solution**:
- Ensure Root Directory is `.` not a subdirectory
- Check that `npm install` runs from the monorepo root
- Verify `package.json` in root has the workspace defined

### Module Federation "Shared module is not available"

**Cause**: Runtime URLs are incorrect or modules didn't deploy

**Solution**:
- Verify all deployments completed successfully
- Check environment variables are set correctly
- Ensure URLs are production URLs, not preview URLs
- Test that `remoteEntry.js` is accessible at each URL

### Turborepo cache issues

**Solution**: Force clean build
```bash
turbo run build:prod --force --no-cache
```

---

## Expected Results

After completing all steps:

- ✅ All 8 projects deploy successfully
- ✅ Each project has valid `remoteEntry.js` file
- ✅ Production URLs are accessible
- ✅ Shell applications load remote modules correctly
- ✅ No 404 errors for workspace dependencies
- ✅ No Turborepo "package.json not found" errors
- ✅ Module Federation works end-to-end

---

## Summary of Changes

### Files Modified

1. `shared-components/vercel.json` - Updated buildCommand and outputDirectory
2. `shared-data/vercel.json` - Updated buildCommand and outputDirectory
3. `hubs-tab/vercel.json` - Updated buildCommand and outputDirectory
4. `reports-tab/vercel.json` - Updated buildCommand and outputDirectory
5. `user-tab/vercel.json` - Updated buildCommand and outputDirectory
6. `content-platform/files-folders/vercel.json` - Updated buildCommand and outputDirectory
7. `content-platform/shell/vercel.json` - Updated buildCommand and outputDirectory
8. `top-level-shell/vercel.json` - Updated buildCommand and outputDirectory

### Files Created

1. `scripts/fix-vercel-root-directory.sh` - Helper script to open settings pages
2. `scripts/deploy-after-fix.sh` - Automated deployment script
3. `DEPLOYMENT-FIX-GUIDE.md` - This guide

### Manual Steps Required

1. Update Root Directory to `.` for all 8 projects in Vercel Dashboard
2. Set environment variables for shell applications
3. Deploy all projects in correct order

---

## Next Steps

1. Run: `./scripts/fix-vercel-root-directory.sh`
2. Update Root Directory for all 8 projects
3. Run: `./scripts/deploy-after-fix.sh`
4. Verify deployments
5. Test the application

---

## Questions?

If you encounter issues not covered in this guide:

1. Check Vercel deployment logs for specific errors
2. Verify git repository is up to date
3. Ensure local builds work: `npm run build:prod`
4. Check Module Federation webpack configs

---

*Last Updated: 2025-10-24*
