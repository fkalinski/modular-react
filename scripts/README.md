# Deployment Scripts

Scripts for managing and deploying federated remotes to Vercel with semantic versioning.

---

## Available Scripts

### 1. deploy-remote.sh

**Deploy a federated remote with version management**

```bash
./scripts/deploy-remote.sh <package-name> <version>
```

**Features:**
- Builds the package
- Deploys to Vercel with production flag
- Creates specific version alias (e.g., `v1-5-0`)
- Creates/updates major version alias (e.g., `v1`)
- Optionally updates production alias
- Provides testing commands

**Examples:**
```bash
# Deploy shared-components v1.5.0
./scripts/deploy-remote.sh shared-components 1.5.0

# Deploy shared-data v2.0.0
./scripts/deploy-remote.sh shared-data 2.0.0
```

**What it does:**
```
1. Validates inputs
2. Navigates to package directory
3. Runs build:prod
4. Deploys to Vercel
5. Creates version-specific alias:
   https://shared-components-v1-5-0.vercel.app/

6. Updates major version alias:
   https://shared-components-v1.vercel.app/ → v1-5-0

7. (Optional) Updates production alias:
   https://shared-components.vercel.app/ → v1-5-0

8. Shows testing commands
```

**Output:**
```
╔════════════════════════════════════════════════╗
║  Deployment Complete!                          ║
╚════════════════════════════════════════════════╝

URLs:
  Specific version: https://shared-components-v1-5-0.vercel.app
  Major version:    https://shared-components-v1.vercel.app

Usage in app:
  # Use major version (recommended)
  https://shared-components-v1.vercel.app/remoteEntry.js

Testing:
  # Test via console
  mf.override('shared_components', 'https://shared-components-v1-5-0.vercel.app/remoteEntry.js')
```

---

### 2. version-manager.sh

**Manage semantic versions for federated modules**

```bash
./scripts/version-manager.sh <command> <package-name> [version-type]
```

**Commands:**

**Show current version:**
```bash
./scripts/version-manager.sh current shared-components
# Output: Current version of shared-components: 1.5.0
```

**Preview next version:**
```bash
./scripts/version-manager.sh next shared-components patch
# Output:
# Current: 1.5.0
# Next (patch): 1.5.1
```

**Bump version:**
```bash
./scripts/version-manager.sh bump shared-components patch
# Prompts for confirmation
# Updates package.json
# Shows next steps
```

**Show all versions:**
```bash
./scripts/version-manager.sh all
# Output:
# ╔════════════════════════════════════════════════╗
# ║  Package Versions                              ║
# ╚════════════════════════════════════════════════╝
#
#   shared-components    1.5.0
#   shared-data          1.0.0
#   content-shell        1.2.0
#   ...
```

**Version Types:**
- `patch` - Bug fixes (1.5.0 → 1.5.1)
- `minor` - New features (1.5.0 → 1.6.0)
- `major` - Breaking changes (1.5.0 → 2.0.0)

**Full workflow example:**
```bash
# 1. Check current version
./scripts/version-manager.sh current shared-components

# 2. Preview what next version would be
./scripts/version-manager.sh next shared-components patch

# 3. Bump version (interactive)
./scripts/version-manager.sh bump shared-components patch

# 4. Deploy
./scripts/deploy-remote.sh shared-components 1.5.1

# 5. Commit
git add shared-components/package.json
git commit -m "chore: bump shared-components to v1.5.1"
git push
```

---

## Supported Packages

| Package Name | Directory | Default Port |
|-------------|-----------|-------------|
| `shared-components` | `shared-components/` | 3001 |
| `shared-data` | `shared-data/` | 3002 |
| `content-shell` | `content-platform/shell/` | 3003 |
| `files-folders` | `content-platform/files-folders/` | 3004 |
| `hubs-tab` | `hubs-tab/` | 3005 |
| `reports-tab` | `reports-tab/` | 3006 |
| `user-tab` | `user-tab/` | 3007 |
| `top-level-shell` | `top-level-shell/` | 3000 |

---

## Prerequisites

### 1. Install Vercel CLI

```bash
npm install -g vercel@latest
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Projects

```bash
cd shared-components
vercel link
# Follow prompts to link to Vercel project
```

Do this for each package you want to deploy.

---

## Common Workflows

### Workflow 1: Deploy Bug Fix

```bash
# 1. Make changes
cd shared-components
# ... fix bug ...

# 2. Bump patch version
cd ..
./scripts/version-manager.sh bump shared-components patch
# Outputs: 1.5.0 → 1.5.1

# 3. Deploy
./scripts/deploy-remote.sh shared-components 1.5.1

# 4. Commit
git add shared-components/
git commit -m "fix: resolve button styling issue"
git push
```

### Workflow 2: Deploy New Feature

```bash
# 1. Bump minor version
./scripts/version-manager.sh bump shared-components minor
# Outputs: 1.5.0 → 1.6.0

# 2. Deploy
./scripts/deploy-remote.sh shared-components 1.6.0

# 3. Test before promoting
mf.override('shared_components', 'https://shared-components-v1-6-0.vercel.app/remoteEntry.js')
# Test...

# 4. Commit
git add shared-components/
git commit -m "feat: add dropdown variant to Button"
git push
```

### Workflow 3: Deploy Breaking Change

```bash
# 1. Bump major version
./scripts/version-manager.sh bump shared-components major
# Outputs: 1.5.0 → 2.0.0

# 2. Deploy (creates new v2 alias)
./scripts/deploy-remote.sh shared-components 2.0.0
# v1 alias unchanged, v2 alias created

# 3. Update consumers gradually
# Host apps update when ready

# 4. Commit
git add shared-components/
git commit -m "feat!: redesign Button API (BREAKING CHANGE)"
git push
```

---

## Troubleshooting

### Script Permission Denied

```bash
chmod +x scripts/*.sh
```

### Vercel Command Not Found

```bash
npm install -g vercel@latest
```

### Deployment Fails

```bash
# Check if logged in
vercel whoami

# Re-login if needed
vercel login

# Check project is linked
cd shared-components
vercel link
```

### Version Bump Fails

```bash
# Check package.json exists
ls -la shared-components/package.json

# Check version format
cat shared-components/package.json | grep version
```

---

## Environment Variables

Scripts respect these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `VERCEL_TOKEN` | Vercel auth token | (from CLI) |
| `VERCEL_ORG_ID` | Vercel organization ID | (from project) |
| `VERCEL_PROJECT_ID` | Vercel project ID | (from project) |

Set these for CI/CD automation (GitHub Actions already configured).

---

## Integration with GitHub Actions

These scripts are used by GitHub Actions workflows:

- `.github/workflows/deploy-shared-components.yml`
- `.github/workflows/deploy-shared-data.yml`

Workflows automatically:
1. Detect changes in package
2. Build package
3. Deploy to Vercel (using Vercel CLI, similar to scripts)
4. Create version aliases
5. Post deployment summary

**Manual trigger:**
- Go to Actions → Select workflow → Run workflow
- Choose version type
- Automatic deployment

---

## Best Practices

### 1. Always Bump Version Before Deploying

```bash
# Good
./scripts/version-manager.sh bump shared-components patch
./scripts/deploy-remote.sh shared-components 1.5.1

# Bad - version mismatch
# (Don't deploy version that doesn't match package.json)
```

### 2. Test Before Promoting

```bash
# Deploy to specific URL first
./scripts/deploy-remote.sh shared-components 1.6.0

# Test it
mf.override('shared_components', 'https://shared-components-v1-6-0.vercel.app/remoteEntry.js')

# If good, major alias is already updated
# If issues, rollback major alias to previous version
```

### 3. Follow Semantic Versioning

- **Patch (x.x.X):** Bug fixes only
- **Minor (x.X.x):** New features, backwards compatible
- **Major (X.x.x):** Breaking changes

### 4. Commit Version Bumps

```bash
git add package.json
git commit -m "chore: bump version to v1.5.1"
git push
```

### 5. Document Breaking Changes

For major versions, create migration guide in `docs/migration/`.

---

## Quick Reference

```bash
# Show all versions
./scripts/version-manager.sh all

# Bump patch and deploy
./scripts/version-manager.sh bump shared-components patch
./scripts/deploy-remote.sh shared-components $(cat shared-components/package.json | grep version | cut -d'"' -f4)

# Check deployment
vercel ls

# Rollback
vercel alias set https://shared-components-v1-5-0.vercel.app shared-components-v1.vercel.app
```

---

## Related Documentation

- **Full Deployment Guide:** `docs/deployment/VERCEL_DEPLOYMENT_WITH_STABLE_URLS.md`
- **Quick Reference:** `docs/deployment/DEPLOYMENT_QUICK_REFERENCE.md`
- **Federation Strategy:** `docs/architecture/FEDERATION_STRATEGY_IMPLEMENTATION.md`

---

## Support

For issues with scripts:
1. Check script has execute permissions: `ls -la scripts/`
2. Verify Vercel CLI installed: `vercel --version`
3. Check you're logged in: `vercel whoami`
4. Review logs in script output
5. Check full documentation

---

**Last Updated:** 2025-10-24
