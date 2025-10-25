---
description: Deploy modules to Vercel with proper environment variables and correct deployment order.
---

# Deploy to Vercel

Deploy all modules (or specific modules) to Vercel with proper configuration.

## Context
This platform requires specific deployment order because shells depend on remotes:

**Critical Deployment Order:**
1. Shared libraries (shared-components, shared-data)
2. Tab remotes (files, hubs, reports, user)
3. Shells last (content-shell, top-level-shell)

**Deployment Tools:**
- Automated script: `./scripts/vercel-deploy-all.sh`
- Manual deployment: `vercel --prod`
- GitHub Actions: `.github/workflows/deploy.yml`

## Task
Please delegate this to the **deployment-specialist** subagent to:

1. **Pre-deployment checks:**
   - All builds pass locally
   - Tests are passing
   - Module Federation configs validated
   - Environment variables prepared

2. **Execute deployment:**
   - Deploy in correct order
   - Set environment variables for each module
   - Verify each deployment succeeds
   - Note deployment URLs

3. **Post-deployment validation:**
   - All remoteEntry.js files accessible
   - Production app loads without errors
   - All tabs/remotes work correctly
   - React singleton enforced
   - No console errors

4. **Documentation:**
   - Record deployment URLs
   - Update environment variable docs
   - Note any issues encountered

## Deployment Options

**Option A: Deploy all modules**
```bash
./scripts/vercel-deploy-all.sh production
```

**Option B: Deploy specific module**
```bash
cd <module-directory>
vercel --prod
```

**Option C: Deploy via GitHub Actions**
(Requires GitHub secrets configured)

## Environment Variables Required

Each shell needs:
```
REACT_APP_SHARED_COMPONENTS_URL
REACT_APP_SHARED_DATA_URL
REACT_APP_<REMOTE>_TAB_URL
```

## Success Criteria
- All modules deployed successfully
- Production URLs documented
- Environment variables configured
- Production app works correctly
- No Module Federation errors
- React singleton enforced

Use **validate-mf** command before deploying to catch issues early. Reference **vercel-deployment** skill for detailed deployment procedures.
