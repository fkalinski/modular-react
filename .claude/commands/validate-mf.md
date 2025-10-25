---
description: Validate all Module Federation configurations, check shared dependencies, and ensure proper remote/host setup.
---

# Validate Module Federation

Perform a comprehensive validation of all Module Federation configurations across the platform.

## Context
This platform uses Module Federation 2.0 with multiple remotes and hosts:

**Shared Libraries:**
- shared-components (port 3001)
- shared-data (port 3002)

**Shells:**
- top-level-shell (port 3000) - main host
- content-platform/shell (port 3003) - content host

**Remotes:**
- content-platform/files-folders (port 3004)
- hubs-tab (port 3005)
- reports-tab (port 3006)
- user-tab (port 3007)

## Task
Please delegate this to the **module-federation-architect** subagent to:

1. **Validate all webpack configs:**
   - Check ModuleFederationPlugin configuration
   - Verify remote URLs match port allocation
   - Ensure proper exposes/remotes setup
   - Validate shared dependencies

2. **Check critical patterns:**
   - React has `singleton: true` in all modules
   - Bootstrap pattern is used in all hosts
   - publicPath is correctly configured
   - Remote URLs use environment variables

3. **Test runtime loading:**
   - All remoteEntry.js files are accessible
   - No "Module not found" errors
   - React singleton is enforced (single instance)
   - No console errors related to federation

4. **Generate report:**
   - List any issues found
   - Severity level for each issue
   - Recommended fixes
   - Configuration examples

## Validation Commands
The architect can use:
```bash
# Check ports
lsof -i :3000-3007

# Test remoteEntry.js accessibility
curl http://localhost:3001/remoteEntry.js

# Check for common issues
grep -r "singleton" */webpack.config.js
```

## Success Criteria
- All webpack configs are valid
- Remote URLs are correct for all environments
- Shared dependencies properly configured
- Bootstrap pattern present in all hosts
- No Module Federation runtime errors

Coordinate with **playwright** MCP to visually validate if needed, and reference **module-federation-types** skill for type-related issues.
