# Quick Start: Deploy to Vercel in 5 Minutes

## Prerequisites
- GitHub repository
- Vercel account (free tier works)

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

## Step 2: Deploy Each Module (One Command Each)

Run these commands in order:

```bash
# 1. Shared Components (foundation)
cd shared-components && vercel --prod && cd ..

# 2. Shared Data
cd shared-data && vercel --prod && cd ..

# 3. Files Tab
cd content-platform/files-folders && vercel --prod && cd ../..

# 4. Hubs Tab
cd hubs-tab && vercel --prod && cd ..

# 5. Reports Tab
cd reports-tab && vercel --prod && cd ..

# 6. User Tab
cd user-tab && vercel --prod && cd ..

# 7. Content Platform
cd content-platform/shell && vercel --prod && cd ../..

# 8. Main App (update URLs first!)
cd top-level-shell && vercel --prod && cd ..
```

## Step 3: Note Your URLs

After each deployment, Vercel will give you a URL like:
```
https://shared-components-abc123.vercel.app
```

**Save these URLs!** You'll need them for step 4.

## Step 4: Update Environment Variables

### For top-level-shell:

1. Go to https://vercel.com/dashboard
2. Find your "top-level-shell" project
3. Go to Settings → Environment Variables
4. Add these (use YOUR actual URLs):

```
REMOTE_SHARED_COMPONENTS_URL = https://your-shared-components.vercel.app
REMOTE_SHARED_DATA_URL = https://your-shared-data.vercel.app
REMOTE_CONTENT_SHELL_URL = https://your-content-platform.vercel.app
REMOTE_REPORTS_TAB_URL = https://your-reports-tab.vercel.app
REMOTE_USER_TAB_URL = https://your-user-tab.vercel.app
```

### For content-platform/shell:

Go to content-platform-shell project in Vercel, add:

```
REMOTE_SHARED_COMPONENTS_URL = https://your-shared-components.vercel.app
REMOTE_SHARED_DATA_URL = https://your-shared-data.vercel.app
REMOTE_FILES_TAB_URL = https://your-files-tab.vercel.app
REMOTE_HUBS_TAB_URL = https://your-hubs-tab.vercel.app
```

## Step 5: Redeploy Main Apps

After setting environment variables:

```bash
# Redeploy content platform
cd content-platform/shell && vercel --prod && cd ../..

# Redeploy main app
cd top-level-shell && vercel --prod && cd ..
```

## Step 6: Test It!

Open your main app URL in a browser:
```
https://your-top-level-shell.vercel.app
```

You should see:
- ✅ Dark sidebar navigation
- ✅ Top bar with search
- ✅ Content, Reports, User tabs working
- ✅ Files tab with folder tree and table

## Optional: Setup GitHub Auto-Deploy

### Get Required IDs:

```bash
# In each folder, run:
vercel project ls
```

Copy the Project IDs you see.

### Add GitHub Secrets:

Go to your GitHub repo → Settings → Secrets → Actions

Add these secrets:
- `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - From Vercel project settings
- `VERCEL_SHELL_PROJECT_ID` - From step above
- `VERCEL_SHARED_COMPONENTS_PROJECT_ID` - From step above
- `VERCEL_SHARED_DATA_PROJECT_ID` - From step above
- (... etc for each module)

### Enable Workflow:

Push the `.github/workflows/deploy.yml` file to your repo.

Now every push to `main` will auto-deploy everything!

## Troubleshooting

### "Failed to load remote entry"

Your environment variables are wrong. Double-check:
1. URLs in Vercel dashboard match actual deployment URLs
2. No trailing slashes in URLs
3. Redeploy after changing env vars

### "Blank page"

1. Open browser console (F12)
2. Look for errors
3. Check Network tab - are all JavaScript files loading?
4. Verify CORS headers (should see `Access-Control-Allow-Origin: *`)

### "Module not found"

1. Clear browser cache
2. Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Check all modules are actually deployed

## Architecture Overview

```
You deployed 8 separate static sites:

┌──────────────────────────────────────────┐
│  shared-components.vercel.app            │  ← Base components
│  shared-data.vercel.app                  │  ← Redux store
│  files-tab.vercel.app                    │  ← Files plugin
│  hubs-tab.vercel.app                     │  ← Hubs plugin
│  reports-tab.vercel.app                  │  ← Reports plugin
│  user-tab.vercel.app                     │  ← User plugin
│  content-platform-shell.vercel.app       │  ← Content container
│  top-level-shell.vercel.app              │  ← Main app (YOUR URL)
└──────────────────────────────────────────┘
```

At runtime, the main app loads JavaScript from all the other sites!

## Next Steps

1. **Custom Domain**: Point your domain to the main app
2. **Monitoring**: Add Sentry or LogRocket
3. **Analytics**: Add Google Analytics
4. **Staging**: Create preview deployments for testing

## Costs

Vercel free tier includes:
- 100 GB bandwidth/month
- 6,000 build minutes/month
- Perfect for demos and small projects!

For production scale, consider Vercel Pro ($20/month).

---

**Need help?** See full [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
