# Deployment Quick Reference

**Quick commands for deploying federated remotes to Vercel**

---

## Daily Commands

### Check Current Versions

```bash
# All packages
./scripts/version-manager.sh all

# Specific package
./scripts/version-manager.sh current shared-components
```

### Bump Version

```bash
# Patch (1.5.0 → 1.5.1) - Bug fixes
./scripts/version-manager.sh bump shared-components patch

# Minor (1.5.0 → 1.6.0) - New features
./scripts/version-manager.sh bump shared-components minor

# Major (1.5.0 → 2.0.0) - Breaking changes
./scripts/version-manager.sh bump shared-components major
```

### Deploy

```bash
# Deploy with version management (recommended)
./scripts/deploy-remote.sh shared-components 1.5.1

# Or let GitHub Actions handle it (push to main)
git add shared-components/
git commit -m "feat: add new feature"
git push origin main
```

---

## Testing Commands

### Test Specific Version

**URL Parameter (quickest):**
```
http://localhost:3000/?remote_shared_components=https://shared-components-v1-5-1.vercel.app/remoteEntry.js
```

**Browser Console:**
```javascript
mf.override('shared_components', 'https://shared-components-v1-5-1.vercel.app/remoteEntry.js')
location.reload()
```

### Test Before Promoting

```bash
# 1. Deploy to specific URL (don't update aliases)
vercel deploy --prod
# Note the deployment URL

# 2. Test it
mf.override('shared_components', 'https://[deployment-url]/remoteEntry.js')
location.reload()

# 3. If good, create aliases
vercel alias set [deployment-url] shared-components-v1-5-1.vercel.app
vercel alias set [deployment-url] shared-components-v1.vercel.app
```

---

## URL Patterns

### Structure

```
Specific: https://shared-components-v1-5-0.vercel.app/remoteEntry.js
Major:    https://shared-components-v1.vercel.app/remoteEntry.js
```

### All Packages

| Package | Major v1 | Major v2 |
|---------|----------|----------|
| shared-components | `shared-components-v1.vercel.app` | `shared-components-v2.vercel.app` |
| shared-data | `shared-data-v1.vercel.app` | `shared-data-v2.vercel.app` |
| content-shell | `content-shell-v1.vercel.app` | `content-shell-v2.vercel.app` |
| files-folders | `files-folders-v1.vercel.app` | `files-folders-v2.vercel.app` |
| hubs-tab | `hubs-tab-v1.vercel.app` | `hubs-tab-v2.vercel.app` |

---

## GitHub Actions

### Trigger Manual Deployment

1. Go to GitHub Actions
2. Select workflow (e.g., "Deploy Shared Components")
3. Click "Run workflow"
4. Choose version type (patch/minor/major)
5. Click "Run workflow"

### Check Deployment Status

- GitHub Actions tab → Latest workflow run
- Check logs and summary

---

## Rollback

### Quick Rollback

```bash
# Point major alias back to previous version
vercel alias set https://shared-components-v1-5-0.vercel.app shared-components-v1.vercel.app
```

### Cookie-Based Rollback (Gradual)

```javascript
// Backend routes affected users to old version
response.cookie('mf_shared_components',
  'https://shared-components-v1-5-0.vercel.app/remoteEntry.js'
);
```

---

## Troubleshooting

### "Command not found: vercel"

```bash
npm install -g vercel@latest
```

### "Project not found"

```bash
cd shared-components
vercel link
# Follow prompts
```

### "Unauthorized"

```bash
vercel login
# Re-authenticate
```

### Deployment URL not in output

```bash
# Check Vercel dashboard
vercel ls
```

---

## Configuration Checklist

### First-Time Setup

- [ ] Install Vercel CLI: `npm install -g vercel@latest`
- [ ] Login: `vercel login`
- [ ] Link projects: `cd shared-components && vercel link`
- [ ] Set GitHub secrets (VERCEL_TOKEN, project IDs)
- [ ] Test deployment script locally
- [ ] Test GitHub Actions workflow

### For Each Package

- [ ] Create Vercel project
- [ ] Link to repo: `vercel link`
- [ ] Get project ID from `.vercel/project.json`
- [ ] Add project ID to GitHub secrets
- [ ] Test deployment

---

## Common Workflows

### Workflow 1: Bug Fix

```bash
# 1. Make changes
cd shared-components
# ... fix bug ...

# 2. Bump patch version
cd ..
./scripts/version-manager.sh bump shared-components patch

# 3. Deploy
./scripts/deploy-remote.sh shared-components 1.5.1

# 4. Commit
git add shared-components/
git commit -m "fix: resolve button styling issue"
git push
```

### Workflow 2: New Feature

```bash
# 1. Make changes
cd shared-components
# ... add feature ...

# 2. Bump minor version
cd ..
./scripts/version-manager.sh bump shared-components minor

# 3. Deploy and test first
./scripts/deploy-remote.sh shared-components 1.6.0

# 4. Test before promoting
mf.override('shared_components', 'https://shared-components-v1-6-0.vercel.app/remoteEntry.js')
# Test...

# 5. Promote (already done by script)
# Major alias automatically updated

# 6. Commit
git add shared-components/
git commit -m "feat: add dropdown variant to Button"
git push
```

### Workflow 3: Breaking Change

```bash
# 1. Make breaking changes
cd shared-components
# ... breaking changes ...

# 2. Bump major version
cd ..
./scripts/version-manager.sh bump shared-components major

# 3. Deploy to new major version
./scripts/deploy-remote.sh shared-components 2.0.0
# Creates v2 alias (v1 still exists)

# 4. Update consumers gradually
# Host apps update when ready:
# shared_components: 'https://shared-components-v2.vercel.app/remoteEntry.js'

# 5. Document migration
# Write migration guide

# 6. Commit
git add shared-components/
git commit -m "feat!: redesign Button API (BREAKING CHANGE)"
git push
```

---

## Deployment Checklist

### Before Deploying

- [ ] Run tests locally: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Bump version appropriately
- [ ] Update CHANGELOG if major

### After Deploying

- [ ] Verify deployment URL works
- [ ] Test in dev environment
- [ ] Check console for errors
- [ ] Monitor error rates
- [ ] Update documentation if needed

---

## Emergency Procedures

### Production is Broken

**Option 1: Quick rollback (2 minutes)**
```bash
# Point alias back to last known good version
vercel alias set https://shared-components-v1-5-0.vercel.app shared-components-v1.vercel.app
```

**Option 2: Cookie override (5 minutes)**
```javascript
// Backend immediately routes all users to old version
response.cookie('mf_shared_components',
  'https://shared-components-v1-5-0.vercel.app/remoteEntry.js'
);
```

**Option 3: Hotfix (15-30 minutes)**
```bash
# Fix bug, bump patch, deploy
```

### Deployment Failed

```bash
# Check logs
vercel logs [deployment-id]

# Redeploy
vercel deploy --prod --force
```

---

## Monitoring

### Check Deployment Health

```bash
# List recent deployments
vercel ls

# Check specific deployment
vercel inspect [deployment-url]

# View logs
vercel logs [deployment-url]
```

### Check Alias

```bash
# See what version alias points to
vercel alias ls shared-components-v1.vercel.app

# Test URL
curl -I https://shared-components-v1.vercel.app/remoteEntry.js
```

---

## Resources

- **Full Documentation:** `docs/deployment/VERCEL_DEPLOYMENT_WITH_STABLE_URLS.md`
- **Federation Guide:** `docs/architecture/FEDERATION_STRATEGY_IMPLEMENTATION.md`
- **Quick Start:** `docs/architecture/FEDERATION_QUICK_START.md`
- **Vercel CLI:** https://vercel.com/docs/cli
- **GitHub Actions:** `.github/workflows/`

---

**Quick Help:**
```bash
# Show all commands
./scripts/version-manager.sh
./scripts/deploy-remote.sh

# Check this guide
cat docs/deployment/DEPLOYMENT_QUICK_REFERENCE.md
```
