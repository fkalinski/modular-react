# Vercel Root Directory Configuration

## Problem

All deployments are failing because the Root Directory is not set for each project. Vercel is trying to build from the repository root instead of the app-specific directories.

## Solution

Configure the Root Directory for each project in Vercel Dashboard:

### Steps

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. For EACH project below, do the following:
   - Click on the project name
   - Go to **Settings** → **General**
   - Scroll down to **Root Directory**
   - Click **Edit**
   - Enter the Root Directory value from the table below
   - Click **Save**

### Root Directory Configuration

| Project Name | Root Directory Setting |
|--------------|----------------------|
| `shared-components` | `shared-components` |
| `shared-data` | `shared-data` |
| `shell` (or `content-platform-shell`) | `content-platform/shell` |
| `files-folders` | `content-platform/files-folders` |
| `hubs-tab` | `hubs-tab` |
| `reports-tab` | `reports-tab` |
| `user-tab` | `user-tab` |
| `top-level-shell` | `top-level-shell` |

### Verify Build Settings

While you're in Settings → General, verify these are correct:

- **Build Command**: Should be auto-detected from `vercel.json`
  - Example: `cd ../.. && turbo run build:prod --filter=@modular-platform/shared-components`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Framework Preset**: Other

## After Configuration

Once all Root Directories are set:

```bash
# Redeploy all apps
./scripts/deploy-vercel.sh
```

## Quick Check

After redeploying, verify builds are successful:

```bash
vercel ls --prod --cwd shared-components
```

Should show `● Ready` instead of `● Error`.

---

**Why This Is Required:**

Vercel needs to know which subdirectory to use as the "root" for building each app in your monorepo. Without this setting, it tries to build from the repository root where there's no valid build configuration for the individual apps.
