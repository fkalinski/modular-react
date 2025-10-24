---
name: dev-workflow
description: Guide for development workflows in the modular React platform, including starting/stopping services, using development scripts, and common development tasks.
---

# Development Workflow

This skill helps you work with the development environment for the modular React platform using Module Federation 2.0.

## When to Use This Skill

Use this skill when you need to:
- Start or stop development services
- Run the complete platform locally
- Use development helper scripts
- Troubleshoot development environment issues
- Understand the service architecture and ports

## Development Scripts

### Main Development Script: `dev-all.sh`

Located at: `scripts/dev-all.sh`

This is the primary script for managing all development services:

```bash
# Start all services
./scripts/dev-all.sh start

# Stop all services
./scripts/dev-all.sh stop

# Restart all services
./scripts/dev-all.sh restart

# Check service status
./scripts/dev-all.sh status
```

**What it does:**
- Manages 8 services concurrently (shared modules, tabs, shells)
- Tracks PIDs in `/tmp/modular-react.pids`
- Logs to `/tmp/*.log` files
- Handles port conflicts automatically

### Services and Ports

| Service | Port | Directory | Purpose |
|---------|------|-----------|---------|
| shared-components | 3001 | shared-components/ | Component library (federated) |
| shared-data | 3002 | shared-data/ | Redux + GraphQL (federated) |
| content-shell | 3003 | content-platform/shell/ | Content platform shell |
| files-tab | 3004 | content-platform/files-folders/ | Files & Folders tab |
| hubs-tab | 3005 | hubs-tab/ | Hubs tab |
| reports-tab | 3006 | reports-tab/ | Reports tab |
| user-tab | 3007 | user-tab/ | User tab |
| top-level-shell | 3000 | top-level-shell/ | **Main app entry point** |

## Common Development Tasks

### Starting Development

**Option 1: Use the helper script (recommended)**
```bash
cd /Users/fkalinski/dev/fkalinski/modular-react
./scripts/dev-all.sh start
```

Then access the main app at: http://localhost:3000

**Option 2: Use npm workspaces**
```bash
npm run dev
```

**Option 3: Start services individually**
```bash
# Terminal 1: Shared components
cd shared-components && npm run dev

# Terminal 2: Shared data
cd shared-data && npm run dev

# Terminal 3: Top-level shell (main app)
cd top-level-shell && npm run dev
```

### Stopping Development

```bash
./scripts/dev-all.sh stop
```

This will:
- Stop all tracked processes
- Kill any orphaned processes on known ports
- Clean up PID files

### Checking Service Status

```bash
./scripts/dev-all.sh status
```

Shows:
- Running services with PIDs and ports
- Dead services (PID file exists but process stopped)
- Orphaned processes (using ports but not tracked)

### Restarting After Changes

For most code changes, webpack hot reload will update automatically.

To fully restart:
```bash
./scripts/dev-all.sh restart
```

## Development Guidelines

### Module Federation Development Flow

1. **Always start shared modules first** (shared-components, shared-data)
2. **Then start dependent modules** (tabs, shells)
3. **Access via top-level shell** (http://localhost:3000) for full integration

### Making Changes

**To shared components:**
- Changes auto-reload in all dependent modules
- No rebuild needed for consumers
- Test at http://localhost:3001 standalone

**To a specific tab:**
- Changes only affect that tab
- Test standalone (e.g., http://localhost:3004 for files-tab)
- Test integrated (http://localhost:3000)

**To shell applications:**
- Changes affect routing and tab loading
- Verify all tabs still load correctly

### Log Files

All service logs are in `/tmp/`:
```bash
# View logs for specific service
tail -f /tmp/shared-components.log
tail -f /tmp/top-level-shell.log

# View all logs
tail -f /tmp/*.log
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using a port
lsof -ti:3000

# Kill process on port (script does this automatically)
./scripts/dev-all.sh stop
```

### Service Not Starting

1. Check logs: `tail -f /tmp/[service-name].log`
2. Verify dependencies: `cd [service-dir] && npm install`
3. Check port availability: `lsof -ti:[port]`
4. Restart: `./scripts/dev-all.sh restart`

### Module Federation Errors

**"Module not found" or "remoteEntry.js 404":**
- Ensure the remote service is running
- Check the correct port in webpack.config.js
- Verify in browser network tab

**"Shared module conflict":**
- Check React versions match across modules
- Ensure `singleton: true` in webpack shared config
- Clear node_modules and reinstall

### Changes Not Appearing

1. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
2. Check webpack dev server recompiled: look for "Compiled successfully" in logs
3. Restart the specific service
4. Clear browser cache

## Package.json Scripts

From the root directory (uses Turbo):

```bash
# Run dev for all workspaces
npm run dev

# Build all workspaces
npm run build

# Build production bundles
npm run build:prod

# Run linting
npm run lint

# Type checking
npm run typecheck

# Clean all build artifacts
npm run clean
```

## Best Practices

1. **Always use the dev-all.sh script** for managing services - it handles cleanup properly
2. **Check service status** before assuming something is broken
3. **Monitor logs** when debugging issues
4. **Start shared modules first** when running individually
5. **Test both standalone and integrated** when making changes to federated modules
6. **Use status command** to verify all services are running before starting work

## Quick Reference

```bash
# Start everything
./scripts/dev-all.sh start

# Check everything is running
./scripts/dev-all.sh status

# View logs
tail -f /tmp/*.log

# Stop everything
./scripts/dev-all.sh stop

# Main app
open http://localhost:3000

# Individual services
open http://localhost:3001  # Components showcase
open http://localhost:3002  # Data layer demo
open http://localhost:3003  # Content platform
```

## Related Skills

- **npm-workspace**: For managing workspace dependencies and npm commands
- **vercel-deployment**: For deploying to production
- **module-federation-types**: For handling TypeScript types across federated modules

## References

- Development script: `scripts/dev-all.sh`
- Usage guide: `USAGE_GUIDE.md`
- Architecture: `docs/architecture/MODULAR_PLATFORM_DESIGN.md`
- Package configuration: `package.json`
