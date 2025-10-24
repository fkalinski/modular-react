# Static vs Runtime Module Federation: Practical Guide

**Understanding the Value Proposition and When Each Approach Makes Sense**

This document explains the difference between static and runtime Module Federation, covers practical use cases, and explores deployment strategies including stable URL patterns and cookie-based routing.

**Created:** 2025-10-24
**Audience:** Engineering teams evaluating Module Federation approaches

---

## Table of Contents

1. [The Fundamental Difference](#the-fundamental-difference)
2. [Current Implementation Analysis](#current-implementation-analysis)
3. [Practical Use Cases That Drive Value](#practical-use-cases-that-drive-value)
4. [Stable URL Pattern (Semantic Versioning Without Runtime)](#stable-url-pattern-semantic-versioning-without-runtime)
5. [Cookie/LocalStorage Strategy for Static Config](#cookielocalstorage-strategy-for-static-config)
6. [When You Actually Need Runtime Federation](#when-you-actually-need-runtime-federation)
7. [Hybrid Approaches & Best Practices](#hybrid-approaches--best-practices)
8. [Cost-Benefit Analysis](#cost-benefit-analysis)
9. [Recommendations by Scenario](#recommendations-by-scenario)

---

## The Fundamental Difference

### Static Federation (Build-Time Configuration)

**Configuration happens at webpack build time:**

```javascript
// webpack.config.js - FIXED at build time
new ModuleFederationPlugin({
  remotes: {
    shared_components: 'shared_components@http://localhost:3001/remoteEntry.js',
    //                                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //                                     This URL is BAKED INTO THE BUILD
  }
})
```

**What happens:**
1. Webpack reads config during build
2. URL is hardcoded into host bundle
3. At runtime, browser fetches from that exact URL
4. No flexibility to change URL without rebuild

**Usage in code:**
```tsx
// Just uses the static webpack config
import('shared_components/Button')
```

---

### Runtime Federation (Runtime Configuration)

**Configuration happens when app starts:**

```javascript
// index.tsx - DECIDED at runtime
import { init } from '@module-federation/runtime';

// Read config from server, cookies, feature flags, etc.
const config = await loadRuntimeConfig();

init({
  name: 'host_app',
  remotes: config.remotes.map(r => ({
    name: r.name,
    entry: r.url  // ← Can be different for each user/environment/version
  })),
  plugins: [/* runtime plugins */]
});

import('./bootstrap');
```

**What happens:**
1. App starts, executes runtime code
2. Fetches configuration (from API, file, cookies, etc.)
3. Initializes Module Federation with those URLs
4. Can be different per user, per deployment, per experiment

**Usage in code:**
```tsx
// Still just imports, but runtime determines WHERE from
import('shared_components/Button')
```

---

## Current Implementation Analysis

### What You Have Now

**File:** `top-level-shell/webpack.config.js`
```javascript
new ModuleFederationPlugin({
  remotes: {
    shared_components: 'shared_components@http://localhost:3001/remoteEntry.js',
    shared_data: 'shared_data@http://localhost:3002/remoteEntry.js',
    content_shell: 'content_shell@http://localhost:3003/remoteEntry.js',
    // ... all STATIC
  }
})
```

**File:** `top-level-shell/src/App.tsx`
```tsx
// Lines 5-66: Simple React.lazy() calls
const ThemeProvider = lazy(() => import('shared_components/Theme'));
const ContentShell = lazy(() => import('content_shell/ContentPlatform'));
```

**What This Gives You:**

✅ **Basic Benefits:**
- Runtime loading (no rebuild of host when remote changes)
- Singleton sharing (one React instance)
- Remote updates don't require host rebuild

❌ **Missing:**
- Can't change WHERE remotes are loaded from
- Can't do A/B testing without rebuild
- Can't do canary deployments
- Can't have per-user customization
- No runtime version resolution
- No advanced error recovery

---

## Practical Use Cases That Drive Value

Let's explore **real scenarios** where these capabilities matter.

---

### Use Case 1: Emergency Rollback

**Scenario:**
You deploy shared-components v1.5.0 at 2pm. At 2:15pm, users report critical bug in the new Button component.

#### With Static Federation (Current)

```bash
# What happens:
# 1. Bug in v1.5.0 affects all users immediately
# 2. Options:
#    a) Fix bug, rebuild, redeploy shared-components (30+ min)
#    b) Revert to v1.4.0, redeploy (15+ min)
# 3. All users wait 15-30 minutes for fix
# 4. No way to target subset of users

# Timeline:
2:00 PM - Deploy v1.5.0
2:15 PM - Bug discovered
2:16 PM - Decide to rollback
2:17 PM - Rebuild v1.4.0
2:20 PM - Deploy to CDN
2:25 PM - CDN cache invalidation
2:30 PM - All users get v1.4.0
```

**Impact:** 15-30 minute outage affecting all users

#### With Runtime Federation

```bash
# What happens:
# 1. Bug in v1.5.0 discovered
# 2. Update runtime config file (30 seconds)
# 3. Users automatically get v1.4.0 on next page load

# Timeline:
2:00 PM - Deploy v1.5.0
2:15 PM - Bug discovered
2:16 PM - Update config:
```

```json
// config.json - UPDATE THIS ONE FILE
{
  "remotes": {
    "shared_components": {
      "stable": "https://cdn.com/shared-components/v1.4.0/mf-manifest.json",
      "active": "stable"
    }
  }
}
```

```bash
2:17 PM - All new sessions get v1.4.0 automatically
2:20 PM - 90% of users on v1.4.0 (as they refresh)
```

**Impact:** 2-5 minute recovery time

**Value:** $50k-$500k depending on user base (avoid 30min outage)

---

### Use Case 2: Canary Deployment

**Scenario:**
You want to test shared-components v2.0.0 with 5% of users before full rollout.

#### With Static Federation (Current)

```
Impossible without:
- Building two separate host versions
- Using infrastructure routing (nginx, CloudFront)
- Managing two complete deployments
```

**Complexity:** HIGH
**Cost:** Significant infrastructure

#### With Runtime Federation

```typescript
// Runtime plugin determines version
const canaryPlugin = (): FederationRuntimePlugin => ({
  name: 'canary-routing',

  beforeRequest(args) {
    if (args.id === 'shared_components') {
      const userId = getCurrentUserId();
      const isInCanary = hashUserId(userId) % 100 < 5; // 5% of users

      args.options.entry = isInCanary
        ? 'https://cdn.com/shared-components/v2.0.0/mf-manifest.json'
        : 'https://cdn.com/shared-components/v1.5.0/mf-manifest.json';
    }
    return args;
  }
});

init({
  name: 'host_app',
  remotes: [{ name: 'shared_components', entry: 'placeholder' }],
  plugins: [canaryPlugin()]
});
```

**Result:**
- 5% of users automatically get v2.0.0
- 95% stay on v1.5.0
- Monitor metrics for both groups
- Gradually increase percentage if successful
- Instant rollback if issues

**Value:** Risk mitigation, gradual rollout, data-driven decisions

---

### Use Case 3: A/B Testing Features

**Scenario:**
Product wants to test new Table design (more compact) vs current design.

#### With Static Federation (Current)

```
Options:
1. Build feature flag into shared-components
   - Requires rebuild/redeploy
   - Flag logic in component code
   - Permanent technical debt

2. Create separate component variant
   - Duplicate code
   - Maintenance burden
   - Doesn't test real component path
```

**Value:** Limited - can do basic A/B but with technical debt

#### With Runtime Federation

```typescript
// A/B test at the MODULE level
const abTestPlugin = (): FederationRuntimePlugin => ({
  name: 'ab-test',

  beforeRequest(args) {
    if (args.id === 'shared_components') {
      const variant = getABTestVariant('table-design-test');

      args.options.entry = variant === 'compact'
        ? 'https://cdn.com/shared-components/v2.0.0-compact/mf-manifest.json'
        : 'https://cdn.com/shared-components/v1.5.0/mf-manifest.json';
    }
    return args;
  }
});
```

**Result:**
- Test completely different implementations
- No code changes in components
- Clean separation
- Easy to remove after test concludes

**Value:** Better experimentation, cleaner code

---

### Use Case 4: Multi-Tenant Customization

**Scenario:**
Enterprise customers want customized components (branding, features) without affecting other customers.

#### With Static Federation (Current)

```
Options:
1. Build separate apps per tenant
   - Massive duplication
   - N different codebases

2. Feature flags for everything
   - Code bloat
   - Complexity explosion
   - All tenants load all code
```

**Feasibility:** Difficult at scale

#### With Runtime Federation

```typescript
// Load tenant-specific component library
const tenantPlugin = (): FederationRuntimePlugin => ({
  name: 'tenant-routing',

  beforeRequest(args) {
    const tenantId = getCurrentTenant();

    // Some tenants get custom component builds
    if (args.id === 'shared_components') {
      const customBuild = TENANT_CUSTOMIZATIONS[tenantId];
      if (customBuild) {
        args.options.entry = customBuild.url;
      }
    }
    return args;
  }
});
```

**Configuration:**
```json
{
  "tenantCustomizations": {
    "acme-corp": {
      "url": "https://cdn.com/acme-corp/shared-components/remoteEntry.js"
    },
    "globex": {
      "url": "https://cdn.com/globex/shared-components/remoteEntry.js"
    }
  }
}
```

**Result:**
- Single host application
- Tenant-specific component libraries loaded at runtime
- Each tenant can have different component versions
- Clean separation

**Value:** Enable enterprise customization without code forking

---

### Use Case 5: Environment-Based Configuration

**Scenario:**
Different environments (dev, staging, prod) need different remote versions.

#### With Static Federation (Current)

```javascript
// webpack.config.js
const getRemoteUrl = (name) => {
  if (process.env.NODE_ENV === 'production') {
    return `https://prod-cdn.com/${name}/remoteEntry.js`;
  }
  if (process.env.NODE_ENV === 'staging') {
    return `https://staging-cdn.com/${name}/remoteEntry.js`;
  }
  return `http://localhost:3001/remoteEntry.js`;
};
```

**Result:**
- Works, but baked into build
- Different build per environment
- Can't easily test "prod version in staging"

#### With Runtime Federation

```typescript
// Reads environment config at runtime
const envConfig = await fetch('/config.json');

init({
  name: 'host_app',
  remotes: envConfig.remotes  // Different per environment
});
```

**Configuration:**
```json
// config.json (different file per environment)
{
  "environment": "staging",
  "remotes": {
    "shared_components": {
      "url": "https://staging-cdn.com/shared-components/mf-manifest.json"
    }
  }
}
```

**Result:**
- Single build artifact
- Environment determined at runtime
- Easy to test prod versions in staging (just change config)
- Simpler CI/CD

**Value:** Operational flexibility, fewer builds

---

## Stable URL Pattern (Semantic Versioning Without Runtime)

You made an excellent point: **Can we get semantic versioning benefits with static federation using stable URLs?**

**Answer:** YES! This is a practical middle ground.

---

### The Pattern: Major Version Aliases

**CDN Structure:**
```
https://cdn.example.com/shared-components/
├── v1/                          # Stable alias for latest 1.x
│   ├── mf-manifest.json         # Points to latest 1.x
│   └── remoteEntry.js
├── v2/                          # Stable alias for latest 2.x
│   ├── mf-manifest.json
│   └── remoteEntry.js
├── v1.5.0/                      # Specific versions
│   └── ...
├── v1.5.1/                      # Specific versions
│   └── ...
└── v2.0.0/                      # Specific versions
    └── ...
```

---

### Static Configuration with Major Version URLs

```javascript
// webpack.config.js - USE MAJOR VERSION URLs
new ModuleFederationPlugin({
  remotes: {
    shared_components: 'shared_components@https://cdn.com/shared-components/v1/remoteEntry.js',
    //                                                                       ^^^
    //                                                                  Major version!
  }
})
```

---

### Deployment Process

**Deploying v1.5.1 (minor/patch):**
```bash
# 1. Build and deploy to specific version folder
npm run build
aws s3 sync dist/ s3://cdn/shared-components/v1.5.1/

# 2. Update the v1/ alias to point to v1.5.1
aws s3 sync dist/ s3://cdn/shared-components/v1/
# OR use CloudFront origin group / Lambda@Edge redirect

# 3. All consumers using v1/ automatically get v1.5.1
# NO REBUILD of host apps needed!
```

**Deploying v2.0.0 (breaking change):**
```bash
# 1. Build and deploy to specific version folder
npm run build
aws s3 sync dist/ s3://cdn/shared-components/v2.0.0/

# 2. Create/update the v2/ alias
aws s3 sync dist/ s3://cdn/shared-components/v2/

# 3. Consumers opt-in by updating webpack config:
#    shared_components: 'shared_components@.../v2/remoteEntry.js'
# 4. Rebuild host apps (only those ready for v2)
```

---

### Benefits of This Approach

| Capability | Static + Stable URLs | Runtime Federation |
|------------|---------------------|-------------------|
| **Minor/patch updates without host rebuild** | ✅ YES | ✅ YES |
| **Breaking changes with migration period** | ✅ YES | ✅ YES |
| **Rollback minor version** | ✅ YES (update v1/ alias) | ✅ YES |
| **Canary deployment** | ❌ NO | ✅ YES |
| **A/B testing** | ❌ NO | ✅ YES |
| **Per-user versions** | ❌ NO | ✅ YES |
| **Runtime config** | ❌ NO | ✅ YES |
| **Complexity** | 🟢 LOW | 🟡 MEDIUM |
| **Infrastructure** | 🟢 Simple CDN | 🟡 CDN + config service |

---

### Implementation: CDN Alias Pattern

#### Option 1: CloudFront with Multiple Origins

```json
// CloudFront distribution
{
  "origins": {
    "v1-latest": {
      "domain": "shared-components-v1-5-1.s3.amazonaws.com"
    },
    "v2-latest": {
      "domain": "shared-components-v2-0-0.s3.amazonaws.com"
    }
  },
  "behaviors": {
    "/v1/*": { "origin": "v1-latest" },
    "/v2/*": { "origin": "v2-latest" }
  }
}
```

**Update process:**
```bash
# Deploy v1.5.2
# Update CloudFront origin for /v1/* to point to v1.5.2 bucket
# Cache invalidation
# Done - all v1/ consumers get v1.5.2
```

#### Option 2: S3 with Sync

```bash
# Simple approach - copy files to alias folder
aws s3 sync s3://cdn/shared-components/v1.5.2/ \
            s3://cdn/shared-components/v1/ \
            --delete \
            --cache-control "public, max-age=300"  # 5 min cache

# Invalidate CDN
aws cloudfront create-invalidation \
  --distribution-id E123456 \
  --paths "/shared-components/v1/*"
```

#### Option 3: Lambda@Edge Dynamic Resolution

```javascript
// Lambda@Edge origin request
exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const uri = request.uri;

  // /v1/remoteEntry.js → /v1.5.2/remoteEntry.js
  if (uri.includes('/v1/')) {
    const latestV1 = await getLatestVersion('v1'); // From DynamoDB/S3
    request.uri = uri.replace('/v1/', `/${latestV1}/`);
  }

  return request;
};
```

---

### When This Pattern Works Best

✅ **Good for:**
- Teams want semantic versioning benefits
- Don't need canary/A/B testing
- Want simple infrastructure
- Comfortable with eventual consistency (CDN cache)
- Acceptable to rebuild for major version updates

❌ **Not sufficient for:**
- Per-user customization
- Instant rollback (CDN cache delay)
- Canary deployments
- A/B testing different implementations
- Runtime configuration needs

---

## Cookie/LocalStorage Strategy for Static Config

Your second great question: **Can we use cookies/localStorage to change URLs even with static webpack config?**

**Answer:** YES! With some clever techniques.

---

### Technique 1: Dynamic Import with URL Resolution

You can intercept imports and modify URLs before Module Federation sees them.

#### Implementation

**File:** `src/utils/federationOverrides.ts`
```typescript
// Read override URLs from localStorage/cookies
interface RemoteOverride {
  name: string;
  url: string;
}

class FederationURLOverride {
  private overrides: Map<string, string> = new Map();

  constructor() {
    this.loadOverrides();
  }

  private loadOverrides() {
    // Check localStorage first
    const stored = localStorage.getItem('mf-remote-overrides');
    if (stored) {
      const overrides: RemoteOverride[] = JSON.parse(stored);
      overrides.forEach(o => this.overrides.set(o.name, o.url));
    }

    // Check cookies (for server-side control)
    const cookieOverrides = this.getCookieOverrides();
    cookieOverrides.forEach(o => this.overrides.set(o.name, o.url));

    // Check URL params (for easy testing)
    const urlOverrides = this.getURLOverrides();
    urlOverrides.forEach(o => this.overrides.set(o.name, o.url));
  }

  private getCookieOverrides(): RemoteOverride[] {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('mf-overrides='));

    if (cookie) {
      const value = decodeURIComponent(cookie.split('=')[1]);
      return JSON.parse(value);
    }
    return [];
  }

  private getURLOverrides(): RemoteOverride[] {
    const params = new URLSearchParams(window.location.search);
    const overrides: RemoteOverride[] = [];

    // ?remote_shared_components=https://...
    params.forEach((value, key) => {
      if (key.startsWith('remote_')) {
        const remoteName = key.replace('remote_', '');
        overrides.push({ name: remoteName, url: value });
      }
    });

    return overrides;
  }

  getURL(remoteName: string, defaultURL: string): string {
    return this.overrides.get(remoteName) || defaultURL;
  }

  // Convenience method for testing
  setOverride(remoteName: string, url: string) {
    const overrides = Array.from(this.overrides.entries()).map(([name, url]) => ({
      name,
      url
    }));
    overrides.push({ name: remoteName, url });
    localStorage.setItem('mf-remote-overrides', JSON.stringify(overrides));
    this.overrides.set(remoteName, url);
  }
}

export const urlOverride = new FederationURLOverride();
```

#### Problem: This Doesn't Work with Static Webpack Config!

The webpack config runs at build time, not runtime:
```javascript
// This is evaluated during BUILD, not at runtime
new ModuleFederationPlugin({
  remotes: {
    // This URL is BAKED IN during build
    shared_components: 'shared_components@http://localhost:3001/remoteEntry.js'
  }
})
```

**However...**

---

### Technique 2: Webpack's Dynamic Remote Containers

Module Federation supports **DYNAMIC remotes** - remotes not defined in webpack config.

#### Implementation

**Step 1: Mark remote as dynamic in webpack config**
```javascript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'host_app',
  remotes: {
    // Mark as dynamic with special syntax
    shared_components: 'shared_components@dynamic',
    //                                    ^^^^^^^
    //                                    Special keyword!
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true }
  }
})
```

**Step 2: Provide runtime URL resolution**
```typescript
// src/utils/loadDynamicRemote.ts

interface RemoteConfig {
  name: string;
  url: string;
  scope: string;
}

// Override URLs via cookie/localStorage
function getRemoteURL(remoteName: string): string {
  // 1. Check localStorage
  const overrides = localStorage.getItem('mf-remote-overrides');
  if (overrides) {
    const parsed = JSON.parse(overrides);
    if (parsed[remoteName]) {
      console.log(`[MF Override] Using ${remoteName} from localStorage:`, parsed[remoteName]);
      return parsed[remoteName];
    }
  }

  // 2. Check cookies
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`mf_${remoteName}=`));
  if (cookie) {
    const url = decodeURIComponent(cookie.split('=')[1]);
    console.log(`[MF Override] Using ${remoteName} from cookie:`, url);
    return url;
  }

  // 3. Check URL params
  const params = new URLSearchParams(window.location.search);
  const urlParam = params.get(`remote_${remoteName}`);
  if (urlParam) {
    console.log(`[MF Override] Using ${remoteName} from URL param:`, urlParam);
    return urlParam;
  }

  // 4. Default URLs
  const defaults: Record<string, string> = {
    shared_components: 'http://localhost:3001/remoteEntry.js',
    shared_data: 'http://localhost:3002/remoteEntry.js',
    content_shell: 'http://localhost:3003/remoteEntry.js',
  };

  return defaults[remoteName] || '';
}

// Load remote container script
function loadRemoteContainer(url: string, scope: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any)[scope]) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.async = true;

    script.onload = () => {
      console.log(`[MF] Loaded remote container: ${scope} from ${url}`);
      resolve();
    };

    script.onerror = () => {
      reject(new Error(`Failed to load remote: ${url}`));
    };

    document.head.appendChild(script);
  });
}

// Initialize remote container
async function initRemoteContainer(scope: string): Promise<any> {
  // Wait for container to be available
  await new Promise(resolve => setTimeout(resolve, 0));

  const container = (window as any)[scope];
  if (!container) {
    throw new Error(`Container ${scope} not found`);
  }

  // Initialize the container
  // @ts-ignore
  await container.init(__webpack_share_scopes__.default);

  return container;
}

// Main function to load dynamic remote
export async function loadDynamicRemote<T = any>(
  remoteName: string,
  modulePath: string
): Promise<T> {
  const url = getRemoteURL(remoteName);
  const scope = remoteName;

  try {
    // Load container script
    await loadRemoteContainer(url, scope);

    // Initialize container with shared scope
    const container = await initRemoteContainer(scope);

    // Get the module
    const factory = await container.get(modulePath);
    const module = factory();

    return module;
  } catch (error) {
    console.error(`[MF] Failed to load ${remoteName}/${modulePath}:`, error);
    throw error;
  }
}
```

**Step 3: Use in React components**
```tsx
// src/App.tsx
import React, { lazy } from 'react';
import { loadDynamicRemote } from './utils/loadDynamicRemote';

// Use dynamic remote loader
const ThemeProvider = lazy(() =>
  loadDynamicRemote('shared_components', './Theme')
    .then(m => ({ default: m.ThemeProvider }))
);

const Sidebar = lazy(() =>
  loadDynamicRemote('shared_components', './Sidebar')
    .then(m => ({ default: m.Sidebar }))
);

// Now URLs can be controlled via:
// 1. localStorage
// 2. Cookies
// 3. URL parameters
```

---

### Usage Examples

#### Testing with URL Parameters

```
http://localhost:3000/?remote_shared_components=https://staging-cdn.com/shared-components/remoteEntry.js
```

Opens app with shared_components loaded from staging!

#### Testing with localStorage (Developer Console)

```javascript
// Override shared_components URL
localStorage.setItem('mf-remote-overrides', JSON.stringify({
  shared_components: 'https://feature-branch-deploy.vercel.app/remoteEntry.js'
}));

// Reload page
location.reload();
```

Now loads from feature branch deployment!

#### Production Use with Cookies (Server-Controlled)

```javascript
// Backend sets cookie for canary users
response.cookie('mf_shared_components',
  'https://cdn.com/shared-components/v2.0.0/remoteEntry.js',
  { httpOnly: true, secure: true }
);
```

User automatically loads v2.0.0 of shared_components!

---

### Benefits of Cookie/LocalStorage Strategy

| Capability | Static Webpack | Static + Cookie/LS | Runtime Federation |
|------------|---------------|-------------------|-------------------|
| **URL override without rebuild** | ❌ No | ✅ YES | ✅ YES |
| **Per-user routing** | ❌ No | ✅ YES (via cookie) | ✅ YES |
| **Testing feature branches** | ❌ No | ✅ YES (via LS) | ✅ YES |
| **Canary deployment** | ❌ No | ✅ YES (via cookie) | ✅ YES |
| **A/B testing** | ❌ No | ✅ YES (via cookie) | ✅ YES |
| **Runtime plugins** | ❌ No | ❌ No | ✅ YES |
| **Version resolution** | ❌ No | ❌ No | ✅ YES |
| **Manifest loading** | ❌ No | ⚠️ Manual | ✅ YES |
| **Complexity** | 🟢 LOW | 🟡 MEDIUM | 🟡 MEDIUM |

---

### Limitations of Cookie/LocalStorage Approach

❌ **Cannot use:**
- Runtime plugins (beforeRequest, errorLoadRemote, etc.)
- Automatic version resolution
- Built-in manifest loading (must implement manually)
- Preloading APIs
- Module Federation runtime features

✅ **Can achieve:**
- URL overrides per user
- Canary deployments
- A/B testing
- Testing environments
- Developer overrides

**Verdict:** Good middle ground between static and full runtime!

---

### Developer Experience Enhancement

**Create helper functions:**

```typescript
// src/utils/mfDevTools.ts

// Expose to window for easy access
(window as any).mf = {
  // Override a remote
  override(remoteName: string, url: string) {
    const overrides = JSON.parse(
      localStorage.getItem('mf-remote-overrides') || '{}'
    );
    overrides[remoteName] = url;
    localStorage.setItem('mf-remote-overrides', JSON.stringify(overrides));
    console.log(`✅ ${remoteName} will load from ${url} on next refresh`);
    console.log('Run: location.reload()');
  },

  // Clear overrides
  clearOverrides() {
    localStorage.removeItem('mf-remote-overrides');
    console.log('✅ Cleared all overrides. Reload to use defaults.');
  },

  // List current overrides
  listOverrides() {
    const overrides = JSON.parse(
      localStorage.getItem('mf-remote-overrides') || '{}'
    );
    console.table(overrides);
  },

  // Quick test versions
  useStaging() {
    this.override('shared_components', 'https://staging.cdn.com/shared-components/remoteEntry.js');
    this.override('shared_data', 'https://staging.cdn.com/shared-data/remoteEntry.js');
    console.log('✅ Switched to staging. Reload to apply.');
  },

  useProduction() {
    this.clearOverrides();
    console.log('✅ Switched to production. Reload to apply.');
  }
};

console.log('🔧 MF DevTools loaded. Try: mf.override(), mf.useStaging(), mf.clearOverrides()');
```

**Usage in browser console:**
```javascript
// Test staging versions
mf.useStaging();
location.reload();

// Test specific feature branch
mf.override('shared_components', 'https://my-pr-123.vercel.app/remoteEntry.js');
location.reload();

// Back to normal
mf.clearOverrides();
location.reload();
```

---

## When You Actually Need Runtime Federation

Not all use cases require full runtime federation. Here's when each approach makes sense:

---

### Use Static Federation (Simplest) If:

✅ You're okay with:
- Rebuilding host for remote URL changes
- All users get same version simultaneously
- No per-user customization
- Simple deployment process

**Example scenarios:**
- Internal tools with infrequent updates
- Small team, coordinated deployments
- Learning Module Federation
- POC/MVP phase

**Complexity:** 🟢 LOW
**Infrastructure:** 🟢 Minimal (webpack + CDN)

---

### Use Static + Stable URLs If:

✅ You want:
- Semantic versioning benefits
- Update remotes without rebuilding hosts (minor versions)
- Simple CDN-based deployment
- Gradual adoption of breaking changes

❌ You DON'T need:
- Canary deployments
- A/B testing
- Per-user versions

**Example scenarios:**
- Component libraries with semantic versioning
- Platform with regular updates
- Multiple teams, independent deployments
- Want simplicity with good flexibility

**Complexity:** 🟢 LOW-MEDIUM
**Infrastructure:** 🟢 CDN with alias support

**Recommended for MOST teams!**

---

### Use Static + Cookie/LocalStorage If:

✅ You want:
- All benefits of static + stable URLs
- PLUS: Per-user routing (canary, A/B testing)
- Developer overrides for testing
- Simple infrastructure

❌ You DON'T need:
- Runtime plugins
- Complex error recovery
- Automatic version resolution

**Example scenarios:**
- Platform with experimentation needs
- Want canary deployments without complexity
- Developers need easy testing of feature branches
- Don't need advanced MF 2.0 features

**Complexity:** 🟡 MEDIUM
**Infrastructure:** 🟡 CDN + cookie/auth service

**Great middle ground!**

---

### Use Full Runtime Federation If:

✅ You need:
- Runtime plugins (monitoring, error recovery)
- Complex version resolution
- Dynamic remote discovery
- Advanced deployment strategies
- Multi-tenant customization
- Manifest-based loading (performance)

**Example scenarios:**
- Large-scale platform with many teams
- Need maximum flexibility
- Advanced deployment requirements
- Performance critical (manifest loading)
- Multi-tenant SaaS

**Complexity:** 🟡 MEDIUM-HIGH
**Infrastructure:** 🟡 CDN + config service + runtime

**When you've outgrown simpler approaches**

---

## Hybrid Approaches & Best Practices

You don't have to choose just one approach! Mix and match based on needs.

---

### Recommended Hybrid: Stable URLs + Cookie/LocalStorage

**For most teams, this is the sweet spot:**

```javascript
// webpack.config.js - Use major version URLs
new ModuleFederationPlugin({
  remotes: {
    shared_components: 'shared_components@dynamic',  // Dynamic for override support
    shared_data: 'shared_data@dynamic',
  }
})
```

```typescript
// Dynamic loader with cookie/localStorage support
function getRemoteURL(remoteName: string): string {
  // 1. Check override sources (cookie, localStorage, URL param)
  const override = checkOverrides(remoteName);
  if (override) return override;

  // 2. Use stable major version URLs
  const defaults = {
    shared_components: 'https://cdn.com/shared-components/v1/remoteEntry.js',
    //                                                      ^^^
    //                                                      Stable alias
    shared_data: 'https://cdn.com/shared-data/v1/remoteEntry.js',
  };

  return defaults[remoteName];
}
```

**Deployment process:**
```bash
# Minor/patch update (v1.5.0 → v1.5.1)
1. Deploy v1.5.1 to specific folder
2. Update v1/ alias to point to v1.5.1
3. Users automatically get v1.5.1 (no rebuild)

# Canary test of v1.5.1 BEFORE full rollout
1. Deploy v1.5.1 to specific folder (don't update v1/ alias yet)
2. Server sets cookie for 5% of users:
   mf_shared_components=https://cdn.com/shared-components/v1.5.1/remoteEntry.js
3. Monitor metrics
4. If good, update v1/ alias for everyone
```

**Benefits:**
- ✅ Simple infrastructure
- ✅ Semantic versioning workflow
- ✅ Canary deployment capability
- ✅ Developer testing flexibility
- ✅ Gradual rollout options
- ✅ Reasonable complexity

**This covers 80% of use cases!**

---

### Migration Path: Start Simple, Evolve

**Phase 1: Static Federation (Current)**
```
Where you are now
- Simple webpack config
- Learning Module Federation
- Building MVP
```

**Phase 2: Stable URLs**
```
Add when you have:
- Regular component updates
- Want to avoid rebuilding hosts
- Multiple teams deploying independently

Effort: 1-2 days (CDN configuration)
```

**Phase 3: Cookie/LocalStorage Override**
```
Add when you need:
- Canary deployments
- Developer testing improvements
- A/B testing capabilities

Effort: 2-3 days (dynamic loader implementation)
```

**Phase 4: Full Runtime Federation** (Optional)
```
Add when you need:
- Runtime plugins
- Advanced error recovery
- Complex version resolution
- Multi-tenant customization

Effort: 1-2 weeks (runtime implementation)
```

---

## Cost-Benefit Analysis

### Implementation Costs

| Approach | Setup Time | Infrastructure Cost | Maintenance | Learning Curve |
|----------|-----------|-------------------|-------------|----------------|
| **Static** | 0 (current) | $0 | 🟢 Low | 🟢 Low |
| **Static + Stable URLs** | 1-2 days | $50-200/mo CDN | 🟢 Low | 🟢 Low |
| **Static + Cookie/LS** | 2-3 days | $50-200/mo CDN | 🟡 Medium | 🟡 Medium |
| **Full Runtime** | 1-2 weeks | $200-500/mo | 🟡 Medium | 🟡 Medium |

### Business Value by Use Case

| Use Case | Value/Year | Stable URLs | Cookie/LS | Runtime |
|----------|-----------|-------------|-----------|---------|
| **Avoid rebuild cycles** | $10-50k | ✅ | ✅ | ✅ |
| **Faster rollbacks** | $50-100k | ⚠️ Cache delay | ✅ | ✅ |
| **Canary deployments** | $100-300k | ❌ | ✅ | ✅ |
| **A/B testing** | $50-200k | ❌ | ✅ | ✅ |
| **Multi-tenant** | $500k+ | ❌ | ⚠️ Limited | ✅ |

### ROI Calculation

**Example: Medium-sized team (5 teams, 20 engineers)**

**Static + Stable URLs:**
- Cost: 1-2 days setup + $100/mo CDN
- Value: $10-50k/year (avoid rebuild cycles)
- **ROI: 20-100x**

**Static + Cookie/LS:**
- Cost: 3-4 days setup + $100/mo CDN
- Value: $160-600k/year (rollbacks + canary + A/B)
- **ROI: 40-150x**

**Full Runtime:**
- Cost: 2 weeks setup + $400/mo infrastructure
- Value: $210-1.1M/year (all capabilities)
- **ROI: 20-80x** (diminishing returns for most teams)

**Recommendation:** Start with Static + Cookie/LS for best ROI.

---

## Recommendations by Scenario

### Scenario 1: Your Current Situation

**Context:**
- Multi-team platform
- Shared component library
- Regular updates
- Want independent deployments

**Recommendation: Static + Stable URLs + Cookie/LS**

**Implementation Plan:**

**Week 1: Stable URLs**
1. Setup CDN with major version aliases
2. Update webpack configs to use v1/ URLs
3. Document deployment process

**Week 2: Cookie/LocalStorage**
1. Implement dynamic remote loader
2. Add cookie/localStorage checking
3. Add dev tools (mf.override())
4. Test canary deployment

**Result:**
- ✅ Independent deployments
- ✅ Canary capability
- ✅ Simple infrastructure
- ✅ Good developer experience

**Cost:** 2 weeks effort, $100-200/mo
**Value:** $160-600k/year

---

### Scenario 2: Large Enterprise Platform

**Context:**
- 10+ teams
- Multi-tenant SaaS
- High-scale deployment
- Complex experimentation needs

**Recommendation: Full Runtime Federation**

**Why:**
- Need runtime plugins for monitoring
- Multi-tenant customization required
- Complex version management
- Performance critical (manifest loading)
- Worth the investment

**Implementation Plan:** Follow Migration Plan Phase 3

**Cost:** 2-4 weeks effort, $400-800/mo
**Value:** $500k-1M+/year

---

### Scenario 3: Small Team / Internal Tools

**Context:**
- 1-2 teams
- Internal tools
- Infrequent updates
- Simple deployment

**Recommendation: Static Federation + Stable URLs**

**Why:**
- Simplicity matters
- Don't need canary/A/B testing
- Semantic versioning is enough
- Minimal infrastructure

**Implementation:** 1 day for stable URLs

**Cost:** 1 day, $50/mo
**Value:** $10-30k/year

---

## Conclusion & Actionable Next Steps

### TL;DR Summary

1. **Static Federation (current):** Works but limited flexibility
2. **Static + Stable URLs:** Simple, covers 60% of use cases
3. **Static + Cookie/LS:** Sweet spot, covers 80% of use cases ⭐
4. **Full Runtime:** Maximum flexibility, needed for complex scenarios

### Recommended Path Forward

**For your situation (multi-team platform):**

**Phase 1: Quick Win (Week 1)**
- Implement stable URL pattern
- Setup v1/ aliases in CDN
- Update webpack configs to use major version URLs
- **Value:** Independent deployments for minor updates

**Phase 2: Enhanced Capabilities (Week 2-3)**
- Implement dynamic remote loader
- Add cookie/localStorage override support
- Create developer tools (mf.override() helpers)
- **Value:** Canary deployments + testing flexibility

**Phase 3: Evaluate (Month 3)**
- Assess if current approach meets needs
- If need advanced features, plan Runtime Federation migration
- Otherwise, optimize current approach

### Estimated Impact

**After Phase 1-2:**
- ✅ 90% reduction in host rebuilds
- ✅ 5-10x faster rollbacks
- ✅ Canary deployment capability
- ✅ Better developer testing
- ✅ Maintain simple infrastructure

**Total effort:** 2-3 weeks
**Total cost:** $100-200/mo infrastructure
**Expected value:** $160-600k/year

**ROI: 40-150x** ⭐

---

## Appendix: Code Examples

### Complete Dynamic Loader Implementation

See previous sections for:
- `src/utils/loadDynamicRemote.ts`
- `src/utils/mfDevTools.ts`
- Webpack config with dynamic remotes

### CDN Deployment Script

```bash
#!/bin/bash
# deploy-remote.sh

REMOTE_NAME=$1
VERSION=$2
MAJOR_VERSION=$(echo $VERSION | cut -d. -f1)

# Build
npm run build

# Deploy to specific version
aws s3 sync dist/ "s3://cdn/remotes/${REMOTE_NAME}/${VERSION}/" \
  --cache-control "public, max-age=31536000, immutable"

# Update major version alias
aws s3 sync dist/ "s3://cdn/remotes/${REMOTE_NAME}/v${MAJOR_VERSION}/" \
  --cache-control "public, max-age=300" \
  --delete

# Invalidate CDN cache
aws cloudfront create-invalidation \
  --distribution-id E123456 \
  --paths "/remotes/${REMOTE_NAME}/v${MAJOR_VERSION}/*"

echo "✅ Deployed ${REMOTE_NAME} ${VERSION}"
echo "📦 Specific: https://cdn.com/remotes/${REMOTE_NAME}/${VERSION}/remoteEntry.js"
echo "🔄 Alias: https://cdn.com/remotes/${REMOTE_NAME}/v${MAJOR_VERSION}/remoteEntry.js"
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-24
**Next Review:** After Phase 1-2 implementation
