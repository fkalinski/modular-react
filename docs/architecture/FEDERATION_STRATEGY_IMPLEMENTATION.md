# Module Federation Strategy Implementation

**Implementation Date:** 2025-10-24
**Strategy:** Static + Stable URLs + Cookie/LocalStorage (Enhanced Module Federation 2.0)
**Status:** ✅ Implemented

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Decision](#architecture-decision)
3. [Implementation Details](#implementation-details)
4. [Usage Guide](#usage-guide)
5. [Developer Tools](#developer-tools)
6. [Testing Different Versions](#testing-different-versions)
7. [Deployment Strategy](#deployment-strategy)
8. [Benefits](#benefits)
9. [Migration from Static Configuration](#migration-from-static-configuration)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This document describes the implementation of the **Static + Cookie/LocalStorage + Dynamic Remotes** Module Federation strategy, which provides the "sweet spot" between simplicity and flexibility.

### What We Implemented

- ✅ **Module Federation 2.0 Enhanced** - Already in use, leveraging advanced features
- ✅ **Dynamic Remote Loader** - Runtime URL resolution with override support
- ✅ **Cookie/LocalStorage Override System** - Enable per-user routing without rebuild
- ✅ **Developer Tools** - Console tools for easy testing
- ✅ **URL Parameter Support** - Quick testing via URL params
- ✅ **Graceful Fallbacks** - Error handling and fallback mechanisms

### What We Did NOT Implement (Intentionally)

- ❌ **Full Runtime Federation** - Avoided complexity of runtime plugins
- ❌ **Runtime Plugin System** - Not needed for our use cases
- ❌ **Dynamic Remote Discovery** - Static configuration is sufficient
- ❌ **Complex Version Resolution** - Semantic versioning via stable URLs is enough

---

## Architecture Decision

Based on analysis of **STATIC_VS_RUNTIME_FEDERATION.md** and **MODULAR_PLATFORM_DESIGN.md**, we chose the **Static + Cookie/LocalStorage** approach because:

### Why This Approach?

| Capability | Our Implementation | Full Runtime | Static Only |
|------------|-------------------|--------------|-------------|
| **URL override without rebuild** | ✅ YES | ✅ YES | ❌ No |
| **Per-user routing (canary/A/B)** | ✅ YES (via cookie) | ✅ YES | ❌ No |
| **Testing feature branches** | ✅ YES (via localStorage) | ✅ YES | ❌ No |
| **Developer testing** | ✅ YES (via URL params) | ✅ YES | ❌ No |
| **Runtime plugins** | ❌ No | ✅ YES | ❌ No |
| **Complexity** | 🟡 MEDIUM | 🔴 HIGH | 🟢 LOW |
| **Infrastructure** | 🟢 Simple CDN | 🟡 CDN + Config Service | 🟢 Simple CDN |

### ROI Analysis

- **Implementation Cost:** 2-3 days
- **Infrastructure Cost:** $100-200/month (CDN)
- **Expected Value:** $160-600k/year
- **ROI:** 40-150x ⭐

**This covers 80% of use cases while maintaining reasonable complexity.**

---

## Implementation Details

### 1. Dynamic Remote Loader

**Location:** `/shared-data/src/utils/loadDynamicRemote.ts`

**Features:**
- Runtime URL resolution with priority system:
  1. URL parameters (highest priority)
  2. Cookies (server-controlled)
  3. LocalStorage (developer overrides)
  4. Default URLs (environment-based)
- Proper error handling
- Script loading and caching
- Shared dependency management

**Example:**
```typescript
import { loadDynamicRemote } from 'shared_data';

// Load a component
const Button = lazy(() =>
  loadDynamicRemote('shared_components', './Button')
    .then(m => ({ default: m.Button }))
);
```

### 2. Developer Tools

**Location:** `/shared-data/src/utils/mfDevTools.ts`

**Features:**
- Console-accessible tools for testing
- Environment switching (local/staging/production)
- PR testing support
- Override management

**Auto-loaded in development mode** via browser console as `window.mf`

### 3. Webpack Configuration

**Updated configurations:**
- `/top-level-shell/webpack.config.js`
- `/content-platform/shell/webpack.config.js`

**Changes:**
```javascript
// BEFORE (static URLs)
remotes: {
  shared_components: 'shared_components@http://localhost:3001/remoteEntry.js',
}

// AFTER (dynamic resolution)
remotes: {
  shared_components: 'shared_components@dynamic',
}
```

### 4. Application Updates

**Updated:** `/top-level-shell/src/App.tsx`

**Changes:**
- All remote imports now use `loadDynamicRemote()`
- Dev tools auto-initialized in development
- Graceful fallback to direct imports if dynamic loader fails

---

## Usage Guide

### For End Users (Production)

In production, remotes load from default URLs automatically. No action needed.

### For Product/Growth Teams (A/B Testing & Canary)

#### Canary Deployment Example

Deploy new version but don't make it default yet:

```bash
# 1. Deploy v1.5.1 to specific URL
npm run build
deploy to https://shared-components-v1.5.1.vercel.app/

# 2. Server sets cookie for 5% of users
Set-Cookie: mf_shared_components=https://shared-components-v1.5.1.vercel.app/remoteEntry.js;
  HttpOnly; Secure; SameSite=Strict
```

Those 5% of users now get v1.5.1, others stay on stable version.

#### A/B Testing Example

Test two different versions:

```javascript
// Backend determines variant
const variant = getABTestVariant(userId, 'new-table-design');

if (variant === 'treatment') {
  response.cookie('mf_shared_components',
    'https://shared-components-new-table.vercel.app/remoteEntry.js',
    { httpOnly: true, secure: true }
  );
}
```

### For Developers (Testing)

#### Method 1: URL Parameters (Quickest)

```
http://localhost:3000/?remote_shared_components=https://my-pr-123.vercel.app/remoteEntry.js
```

Instantly test a PR deployment without any configuration.

#### Method 2: Browser Console

Open browser console:

```javascript
// Override a remote
mf.override('shared_components', 'https://my-pr-123.vercel.app/remoteEntry.js')
location.reload()

// Test a PR
mf.testPR('shared_components', 123)
location.reload()

// Switch to staging
mf.useStaging()
location.reload()

// Back to local
mf.useLocal()
location.reload()

// List all overrides
mf.listOverrides()

// Clear all overrides
mf.clearOverrides()
location.reload()
```

#### Method 3: LocalStorage (Persistent)

```javascript
localStorage.setItem('mf-remote-overrides', JSON.stringify({
  shared_components: 'https://feature-branch.vercel.app/remoteEntry.js',
  shared_data: 'https://staging-data.vercel.app/remoteEntry.js'
}));
location.reload();
```

---

## Developer Tools

### Available Commands

When in development mode, these commands are available in the browser console:

| Command | Description | Example |
|---------|-------------|---------|
| `mf.listOverrides()` | Show all active overrides | `mf.listOverrides()` |
| `mf.override(name, url)` | Override a remote URL | `mf.override('shared_components', 'https://...')` |
| `mf.clearOverride(name)` | Clear specific override | `mf.clearOverride('shared_components')` |
| `mf.clearOverrides()` | Clear all overrides | `mf.clearOverrides()` |
| `mf.useStaging()` | Switch to staging environment | `mf.useStaging()` |
| `mf.useProduction()` | Switch to production environment | `mf.useProduction()` |
| `mf.useLocal()` | Switch to local development | `mf.useLocal()` |
| `mf.testPR(name, pr)` | Test a PR deployment | `mf.testPR('shared_components', 123)` |
| `mf.showCurrentURLs()` | Show current configuration | `mf.showCurrentURLs()` |

### Console Output

The dev tools provide colorful, formatted console output:

```
🔧 Module Federation DevTools Loaded

Available commands:
  mf.listOverrides()     - Show all active overrides
  mf.override()          - Override a remote URL
  mf.clearOverrides()    - Clear all overrides
  mf.useStaging()        - Switch to staging environment
  mf.useProduction()     - Switch to production environment
  mf.useLocal()          - Switch to local development
  mf.testPR()            - Test a PR deployment
  mf.showCurrentURLs()   - Show current configuration

Examples:
  mf.override('shared_components', 'https://my-pr.vercel.app/remoteEntry.js')
  mf.testPR('shared_components', 123)
  mf.useStaging()
```

---

## Testing Different Versions

### Scenario 1: Testing Your PR Before Merge

You have a PR #456 for shared-components deployed to Vercel preview:

**Option A: URL Parameter**
```
http://localhost:3000/?remote_shared_components=https://shared-components-pr-456.vercel.app/remoteEntry.js
```

**Option B: Console**
```javascript
mf.testPR('shared_components', 456)
location.reload()
```

**Option C: LocalStorage**
```javascript
mf.override('shared_components', 'https://shared-components-pr-456.vercel.app/remoteEntry.js')
location.reload()
```

### Scenario 2: Testing Staging Before Production Deploy

Before promoting to production, test with staging versions:

```javascript
mf.useStaging()
location.reload()
```

This sets all remotes to staging URLs:
- `shared_components` → `https://staging-shared-components.vercel.app/remoteEntry.js`
- `shared_data` → `https://staging-shared-data.vercel.app/remoteEntry.js`
- etc.

### Scenario 3: Debugging Production Issue Locally

Reproduce production issue by loading production remotes locally:

```javascript
mf.useProduction()
location.reload()
```

Now your local app loads production versions of all remotes.

### Scenario 4: Mixed Environment Testing

Test one component from staging, rest from local:

```javascript
mf.override('shared_components', 'https://staging-shared-components.vercel.app/remoteEntry.js')
// Other remotes stay local
location.reload()
```

---

## Deployment Strategy

### Current Setup

```
Development (localhost):
  shared_components: http://localhost:3001/remoteEntry.js
  shared_data: http://localhost:3002/remoteEntry.js
  content_shell: http://localhost:3003/remoteEntry.js

Production (Vercel):
  shared_components: https://shared-components.vercel.app/remoteEntry.js
  shared_data: https://shared-data.vercel.app/remoteEntry.js
  content_shell: https://content-platform-shell.vercel.app/remoteEntry.js
```

### Future: Stable URL Pattern (Recommended Enhancement)

For semantic versioning support, consider implementing stable URL aliases:

```
Production with Version Aliases:
  shared_components: https://cdn.example.com/shared-components/v1/remoteEntry.js
                     ↓ points to latest 1.x
  actual version:    https://cdn.example.com/shared-components/v1.5.3/remoteEntry.js
```

**Benefits:**
- Minor/patch updates don't require host rebuild
- Breaking changes (v2) deployed alongside v1
- Gradual migration path for major versions

**See:** `STATIC_VS_RUNTIME_FEDERATION.md` section "Stable URL Pattern" for implementation details.

---

## Benefits

### 1. Independent Deployment ✅

Teams can deploy shared components without coordinating host rebuilds:

```bash
# Shared components team deploys v1.5.0
cd shared-components
npm run build:prod
npm run deploy

# No rebuild needed for top-level-shell, content-shell, etc.
# They automatically get v1.5.0 on next user session
```

### 2. Easy Testing ✅

Developers can test any version instantly:

```javascript
// Test PR before merge
mf.testPR('shared_components', 123)

// Test staging before production
mf.useStaging()

// Debug with production versions
mf.useProduction()
```

### 3. Canary Deployments ✅

Product team can test with 5% of users:

```javascript
// Backend sets cookie for canary users
if (isInCanary(userId)) {
  response.cookie('mf_shared_components',
    'https://shared-components-v2.vercel.app/remoteEntry.js'
  );
}
```

### 4. A/B Testing ✅

Run experiments at the module level:

```javascript
// Test new table design
if (getABVariant(userId, 'table-redesign') === 'treatment') {
  response.cookie('mf_shared_components',
    'https://shared-components-new-table.vercel.app/remoteEntry.js'
  );
}
```

### 5. Emergency Rollback ✅

Quick rollback via cookie/override:

```javascript
// Immediate rollback for affected users
response.cookie('mf_shared_components',
  'https://shared-components-v1.4.0.vercel.app/remoteEntry.js'
);
```

### 6. Simple Infrastructure ✅

No complex runtime configuration service needed:
- Static CDN (Vercel)
- Cookie/LocalStorage (built-in)
- No additional backend services

---

## Migration from Static Configuration

If you have existing code using direct imports:

### Before
```typescript
const Button = lazy(() =>
  import('shared_components/Button')
    .then(m => ({ default: m.Button }))
);
```

### After
```typescript
import { loadDynamicRemote } from 'shared_data';

const Button = lazy(() =>
  loadDynamicRemote('shared_components', './Button')
    .then(m => ({ default: m.Button }))
);
```

### Migration Checklist

- [x] Update webpack configs to use `@dynamic` remotes
- [x] Update all `import('remote/module')` to use `loadDynamicRemote()`
- [x] Add error handling and fallbacks
- [x] Test with URL parameters
- [x] Test with localStorage overrides
- [x] Document for team

---

## Troubleshooting

### Issue: "Failed to load remote"

**Symptoms:** Console error `Failed to load remote: https://...`

**Causes:**
1. Remote URL is incorrect or not accessible
2. Network connectivity issue
3. CORS policy blocking the request

**Solutions:**
```javascript
// Check what URL is being used
mf.showCurrentURLs()

// Clear all overrides and use defaults
mf.clearOverrides()
location.reload()

// Try URL directly in browser to verify it's accessible
```

### Issue: "Container not found after loading script"

**Symptoms:** Remote script loads but container not initialized

**Causes:**
1. Remote was built with different Module Federation config
2. Remote name mismatch between consumer and producer

**Solutions:**
1. Verify remote's webpack config has correct `name` field
2. Check remote is actually exposing the expected modules
3. Verify shared dependencies are compatible

### Issue: Overrides not taking effect

**Symptoms:** Changed override but old version still loads

**Causes:**
1. Forgot to reload page
2. Browser cache
3. Multiple overrides with conflicting priority

**Solutions:**
```javascript
// List all active overrides to see priority
mf.listOverrides()

// Clear all and set fresh
mf.clearOverrides()
mf.override('shared_components', 'https://new-url.vercel.app/remoteEntry.js')
location.reload()

// Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
```

### Issue: Dev tools not available

**Symptoms:** `mf` is undefined in console

**Causes:**
1. Not in development mode
2. shared_data failed to load
3. Script loaded before dev tools initialized

**Solutions:**
```javascript
// Check environment
console.log(process.env.NODE_ENV)

// Manually initialize
import('shared_data').then(m => {
  window.mf = m.mfDevTools;
  console.log('Dev tools loaded');
});
```

### Issue: TypeError in production

**Symptoms:** Works in dev but errors in production

**Causes:**
1. Environment variable not set in production
2. URL format different between environments

**Solutions:**
1. Check Vercel environment variables
2. Verify production URLs are correct in `getDefaultRemoteURLs()`
3. Add more defensive error handling

---

## Next Steps

### Recommended Enhancements (Future)

1. **Stable URL Pattern (Week 1-2)**
   - Setup CDN with version aliases
   - Enable semantic versioning workflow
   - **Value:** Independent deployments for minor updates

2. **Monitoring & Analytics (Week 3-4)**
   - Track module load times
   - Monitor version usage
   - Alert on load failures
   - **Value:** Operational visibility

3. **Automated Testing (Week 5-6)**
   - E2E tests with different remote versions
   - Canary deployment automation
   - **Value:** Confidence in deployments

4. **Performance Optimization (Ongoing)**
   - Preloading strategies
   - Bundle size monitoring
   - Lazy loading optimization
   - **Value:** Better user experience

### Not Recommended (Unless Needed)

- ❌ Full Runtime Federation - Current approach covers 80% of use cases
- ❌ Runtime Plugin System - Adds complexity without clear value
- ❌ Dynamic Remote Discovery - Static config is sufficient

---

## Related Documentation

- [STATIC_VS_RUNTIME_FEDERATION.md](./STATIC_VS_RUNTIME_FEDERATION.md) - Detailed analysis and comparison
- [MODULAR_PLATFORM_DESIGN.md](./MODULAR_PLATFORM_DESIGN.md) - Overall architecture vision
- [Module Federation 2.0 Docs](https://module-federation.io/) - Official documentation

---

## Support

For questions or issues:

1. Check this documentation first
2. Check troubleshooting section
3. Review related docs
4. Ask in team chat
5. Open issue if bug found

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-24
**Next Review:** After production deployment
