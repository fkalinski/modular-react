# Vercel Deployment Automation

This document describes the automated Vercel deployment system for the Modular React platform.

## Overview

The automation system handles the complete Vercel deployment workflow:

1. ✅ Deploys all foundational apps (shared components, remotes)
2. ⏳ Waits for deployments to complete with timeout protection
3. 🌐 Retrieves production URLs
4. ⚙️ Configures Module Federation environment variables
5. 🚀 Redeploys shell apps with updated Module Federation URLs
6. ✨ Verifies final deployment status

## Scripts

### 1. `automated-vercel-deploy.sh` - Full Deployment Automation

**Purpose**: Complete end-to-end deployment automation

**Usage**:
```bash
./scripts/automated-vercel-deploy.sh
```

**What it does**:
- Deploys all 8 apps in the correct order
- Waits for foundational apps to be ready (max 10 minutes per app)
- Retrieves production URLs for all apps
- Configures Module Federation environment variables via API
- Redeploys shell apps with updated configuration
- Provides detailed progress output with status indicators

**Configuration**:
- Projects and their directories are defined in `PROJECTS` associative array
- Module Federation mappings in `MF_DEPENDENCIES` and `MF_URL_MAPPINGS`
- Timeout: 10 minutes per deployment
- Check interval: 30 seconds

**Exit codes**:
- `0`: All deployments successful
- `1`: One or more deployments failed

### 2. `vercel-api-helper.sh` - Vercel API Wrapper

**Purpose**: Reusable CLI tool for Vercel API operations

**Usage**:
```bash
# Get project details
./scripts/vercel-api-helper.sh project <project-name>

# List deployments
./scripts/vercel-api-helper.sh deployments <project-name> [limit] [target]

# Get deployment info
./scripts/vercel-api-helper.sh deployment <deployment-id>

# View deployment logs
./scripts/vercel-api-helper.sh logs <deployment-id>

# List environment variables
./scripts/vercel-api-helper.sh env-list <project-id>

# Set environment variable
./scripts/vercel-api-helper.sh env-set <project-id> <key> <value> <targets> [type]

# Delete environment variable
./scripts/vercel-api-helper.sh env-delete <project-id> <env-id>

# Redeploy
./scripts/vercel-api-helper.sh redeploy <deployment-id> [target]

# Cancel deployment
./scripts/vercel-api-helper.sh cancel <deployment-id>

# Promote to production
./scripts/vercel-api-helper.sh promote <deployment-id>

# Get project domains
./scripts/vercel-api-helper.sh domains <project-id>
```

**Examples**:
```bash
# View top-level-shell project
./scripts/vercel-api-helper.sh project top-level-shell

# Get last 5 production deployments
./scripts/vercel-api-helper.sh deployments top-level-shell 5 production

# Set environment variable
./scripts/vercel-api-helper.sh env-set prj_abc123 REMOTE_SHARED_COMPONENTS_URL https://shared-components.vercel.app production,preview
```

### 3. `check-deployment-status.sh` - Status Monitor

**Purpose**: Quick status check for all deployments

**Usage**:
```bash
./scripts/check-deployment-status.sh
```

**Output**:
```
═══════════════════════════════════════════════════════
  📊 Vercel Deployment Status
═══════════════════════════════════════════════════════

✅ shared-components        READY
   └─ https://shared-components-abc123.vercel.app
      (5m ago)

❌ shared-data             ERROR
   └─ https://shared-data-xyz789.vercel.app
      (2m ago)

⏳ hubs-tab                BUILDING
   └─ https://hubs-7s0a3bzsz.vercel.app
      (30s ago)

═══════════════════════════════════════════════════════
  Summary: 5 Ready | 2 Building | 1 Errors
═══════════════════════════════════════════════════════
```

**Exit codes**:
- `0`: All ready or some building
- `1`: Errors detected and no builds in progress

## Setup

### 1. Vercel Token

Ensure your Vercel API token is configured:

```bash
# Should already exist from previous setup
cat .env.vercel
# Output: VERCEL_TOKEN=your_token_here
```

### 2. Install Dependencies

```bash
# Ensure Vercel CLI is installed
npm install -g vercel@latest

# Optional: Install jq for pretty JSON output
brew install jq  # macOS
# or
apt-get install jq  # Linux
```

### 3. Make Scripts Executable

```bash
chmod +x scripts/automated-vercel-deploy.sh
chmod +x scripts/vercel-api-helper.sh
chmod +x scripts/check-deployment-status.sh
```

## Workflow

### Full Automated Deployment

```bash
# Run complete automation
./scripts/automated-vercel-deploy.sh
```

This will:
1. Deploy foundational apps (shared-components, shared-data, tabs)
2. Wait for all to be ready
3. Get production URLs
4. Configure Module Federation URLs for shells
5. Deploy shell apps
6. Verify everything is working

**Duration**: ~15-25 minutes for all 8 apps

### Monitor During Deployment

```bash
# In another terminal, watch status
watch -n 30 ./scripts/check-deployment-status.sh
```

### Manual Environment Variable Updates

```bash
# Get project ID
PROJECT_ID=$(./scripts/vercel-api-helper.sh project top-level-shell | jq -r '.id')

# Set environment variable
./scripts/vercel-api-helper.sh env-set $PROJECT_ID \
  REMOTE_SHARED_COMPONENTS_URL \
  https://shared-components-abc123.vercel.app \
  production,preview
```

### Troubleshooting Failed Deployment

```bash
# Check status
./scripts/check-deployment-status.sh

# Get deployment logs
DEPLOYMENT_ID="dpl_abc123xyz"
./scripts/vercel-api-helper.sh logs $DEPLOYMENT_ID

# Or use Vercel CLI
vercel logs https://your-deployment-url.vercel.app
```

## Architecture

### Project Structure

```
modular-react/
├── shared-components/     → shared-components
├── shared-data/          → shared-data
├── hubs-tab/             → hubs-tab
├── reports-tab/          → reports-tab
├── user-tab/             → user-tab
├── content-platform/
│   ├── shell/           → content-platform-shell
│   └── files-folders/   → files-folders
├── top-level-shell/     → top-level-shell
└── scripts/
    ├── automated-vercel-deploy.sh
    ├── vercel-api-helper.sh
    └── check-deployment-status.sh
```

### Module Federation Dependencies

**top-level-shell** depends on:
- `REMOTE_SHARED_COMPONENTS_URL` → shared-components
- `REMOTE_SHARED_DATA_URL` → shared-data
- `REMOTE_CONTENT_SHELL_URL` → content-platform-shell
- `REMOTE_REPORTS_TAB_URL` → reports-tab
- `REMOTE_USER_TAB_URL` → user-tab

**content-platform-shell** depends on:
- `REMOTE_SHARED_COMPONENTS_URL` → shared-components
- `REMOTE_SHARED_DATA_URL` → shared-data
- `REMOTE_FILES_TAB_URL` → files-folders
- `REMOTE_HUBS_TAB_URL` → hubs-tab

### Deployment Order

1. **Phase 1**: Foundational apps (parallel)
   - shared-components
   - shared-data
   - hubs-tab
   - reports-tab
   - user-tab
   - files-folders

2. **Phase 2**: Configure environment variables

3. **Phase 3**: Shell apps (parallel)
   - content-platform-shell
   - top-level-shell

## API Reference

### Vercel REST API Endpoints Used

- `GET /v9/projects/{projectId}` - Get project details
- `GET /v6/deployments` - List deployments
- `GET /v13/deployments/{id}` - Get deployment status
- `POST /v10/projects/{projectId}/env?upsert=true` - Set environment variable
- `GET /v10/projects/{projectId}/env` - List environment variables
- `POST /v13/deployments` - Create deployment

### Authentication

All API calls use Bearer token authentication:
```bash
Authorization: Bearer $VERCEL_TOKEN
```

## Environment Variables

### Required (in .env.vercel)

- `VERCEL_TOKEN` - Vercel API token with full access

### Generated (by automation)

These are set automatically by the automation script:

**For top-level-shell:**
- `REMOTE_SHARED_COMPONENTS_URL`
- `REMOTE_SHARED_DATA_URL`
- `REMOTE_CONTENT_SHELL_URL`
- `REMOTE_REPORTS_TAB_URL`
- `REMOTE_USER_TAB_URL`

**For content-platform-shell:**
- `REMOTE_SHARED_COMPONENTS_URL`
- `REMOTE_SHARED_DATA_URL`
- `REMOTE_FILES_TAB_URL`
- `REMOTE_HUBS_TAB_URL`

## Common Tasks

### Redeploy Everything

```bash
./scripts/automated-vercel-deploy.sh
```

### Update Single Environment Variable

```bash
# Get project ID
PROJECT_ID=$(./scripts/vercel-api-helper.sh project top-level-shell | jq -r '.id')

# Update variable
./scripts/vercel-api-helper.sh env-set $PROJECT_ID \
  REMOTE_SHARED_COMPONENTS_URL \
  https://new-url.vercel.app \
  production,preview

# Redeploy shell
cd top-level-shell
vercel --prod
```

### Check Current Configuration

```bash
# Get project ID
PROJECT_ID=$(./scripts/vercel-api-helper.sh project top-level-shell | jq -r '.id')

# List all environment variables
./scripts/vercel-api-helper.sh env-list $PROJECT_ID | jq '.envs[] | {key: .key, value: .value}'
```

### View Recent Deployments

```bash
./scripts/vercel-api-helper.sh deployments top-level-shell 10
```

## Troubleshooting

### Deployment Fails

1. **Check logs**:
   ```bash
   vercel logs https://your-deployment-url.vercel.app
   ```

2. **Verify build command**:
   ```bash
   ./scripts/vercel-api-helper.sh project your-project-name | jq '.buildCommand'
   ```

3. **Check environment variables**:
   ```bash
   PROJECT_ID=$(./scripts/vercel-api-helper.sh project your-project-name | jq -r '.id')
   ./scripts/vercel-api-helper.sh env-list $PROJECT_ID
   ```

### Environment Variables Not Updating

Environment variables require a new deployment to take effect:

```bash
cd your-project
vercel --prod
```

### Timeout Issues

If deployments consistently timeout, increase `MAX_WAIT_TIME` in `automated-vercel-deploy.sh`:

```bash
MAX_WAIT_TIME=900  # 15 minutes instead of 10
```

### Module Federation Errors

1. **Verify all remotes are deployed**:
   ```bash
   ./scripts/check-deployment-status.sh
   ```

2. **Check environment variables are set**:
   ```bash
   PROJECT_ID=$(./scripts/vercel-api-helper.sh project top-level-shell | jq -r '.id')
   ./scripts/vercel-api-helper.sh env-list $PROJECT_ID | grep REMOTE_
   ```

3. **Verify URLs are accessible**:
   ```bash
   curl -I https://shared-components-abc123.vercel.app/remoteEntry.js
   ```

## CI/CD Integration

**Note:** If you already have Vercel's GitHub integration enabled (auto-deploy on push), you **don't need** GitHub Actions for deployments. The Vercel integration handles this automatically.

### When to Use Manual Automation

Use the automation scripts (`./scripts/automated-vercel-deploy.sh`) for:

1. **Initial Setup** - First time deploying all apps and configuring Module Federation
2. **Environment Variable Updates** - When remote URLs change
3. **Recovery** - When deployments fail and you need to redeploy everything
4. **Manual Orchestration** - When you need to control deployment order

### Vercel GitHub Integration (Recommended)

For normal development workflow:
```
git push → Vercel auto-deploys each app → Module Federation picks up changes
```

This is simpler and already configured in your Vercel projects.

## Best Practices

1. **Always run full automation** after configuration changes
2. **Monitor deployments** using status checker
3. **Keep environment variables in sync** between preview and production
4. **Use version tags** in deployment URLs when possible
5. **Test Module Federation** after each deployment
6. **Keep logs** of successful deployments for rollback reference

## Support

For issues:
1. Check deployment logs: `vercel logs <url>`
2. Verify configuration: `./scripts/vercel-api-helper.sh project <name>`
3. Check this documentation
4. Review Vercel dashboard for detailed error messages

## Next Steps

- [ ] Implement deployment previews for PRs
- [ ] Add smoke tests after deployment
