# Module Federation 2.0 - Migration Plan

**Phased Implementation Roadmap for Comprehensive Modernization**

This document provides a detailed, actionable plan for migrating the modular-react project to Module Federation 2.0 best practices.

**Project:** modular-react
**Timeline:** 4 sprints (8-10 weeks)
**Plan Created:** 2025-10-24

---

## Table of Contents

1. [Migration Overview](#migration-overview)
2. [Phase 1: Foundation & Stability](#phase-1-foundation--stability)
3. [Phase 2: Type Safety & Developer Experience](#phase-2-type-safety--developer-experience)
4. [Phase 3: Performance & Modern Patterns](#phase-3-performance--modern-patterns)
5. [Phase 4: Multi-Team Resilience](#phase-4-multi-team-resilience)
6. [Testing Strategy](#testing-strategy)
7. [Rollback Procedures](#rollback-procedures)
8. [Success Metrics](#success-metrics)

---

## Migration Overview

### Goals

1. **Stability:** Zero remote loading failures crash the app
2. **Type Safety:** Automatic type distribution without manual scripts
3. **Performance:** 30-50% faster remote loading
4. **Resilience:** Automatic retry and graceful degradation
5. **Multi-Team:** Independent deployments without coordination

### Approach

- **Phased migration:** 4 sprints, each independently deployable
- **Backward compatible:** Can roll back any phase
- **Test-driven:** Comprehensive testing at each phase
- **Low risk:** Start with low-impact changes, build up

### Timeline

| Phase | Duration | Risk | Value |
|-------|----------|------|-------|
| Phase 1 | 3-5 days | 🟢 LOW | 🔴 CRITICAL |
| Phase 2 | 1-2 weeks | 🟡 MEDIUM | 🟡 HIGH |
| Phase 3 | 1-2 weeks | 🟡 MEDIUM | 🟡 HIGH |
| Phase 4 | 1-2 weeks | 🟡 MEDIUM | 🟢 MEDIUM |

**Total:** 8-10 weeks for comprehensive modernization

---

## Phase 1: Foundation & Stability

**Duration:** 3-5 days (Sprint 1, Week 1)
**Risk Level:** 🟢 LOW
**Impact:** 🔴 CRITICAL - Fixes production-blocking issues

### Objectives

1. Upgrade to latest Module Federation packages
2. Add error boundaries to prevent crashes
3. Enable eager loading in hosts
4. Update React to stable version
5. Add retry logic for remote loading
6. Add sub-path sharing

### Prerequisites

- [x] Git branch: `feature/mf-phase-1-stability`
- [x] Backup current working state
- [x] All tests passing
- [x] No uncommitted changes

---

### Task 1.1: Upgrade Package Versions

**Priority:** 🔴 CRITICAL
**Estimated Time:** 30 minutes
**Risk:** 🟢 LOW (packages are backward compatible)

#### 1.1.1: Upgrade @module-federation/enhanced

**Files to modify:**
- `shared-components/package.json`
- `shared-data/package.json`
- `content-platform/shell/package.json`
- `top-level-shell/package.json`
- `hubs-tab/package.json`
- `reports-tab/package.json`
- `content-platform/files-folders/package.json`
- `user-tab/package.json`

**Change:**
```json
{
  "devDependencies": {
    "@module-federation/enhanced": "0.2.0"  // ← FROM
    "@module-federation/enhanced": "^0.17.1"  // ← TO
  }
}
```

**Commands:**
```bash
# Root directory
cd /Users/fkalinski/dev/fkalinski/modular-react

# Update all packages at once
npm install @module-federation/enhanced@^0.17.1 \
  --workspace=shared-components \
  --workspace=shared-data \
  --workspace=content-platform/shell \
  --workspace=top-level-shell \
  --workspace=hubs-tab \
  --workspace=reports-tab \
  --workspace=content-platform/files-folders \
  --workspace=user-tab
```

#### 1.1.2: Update React to 18.3.1

**All package.json files with React:**

**Change:**
```json
{
  "dependencies": {
    "react": "^18.0.0",  // ← FROM
    "react-dom": "^18.0.0",  // ← FROM
    "react": "18.3.1",  // ← TO (exact version)
    "react-dom": "18.3.1"  // ← TO (exact version)
  }
}
```

**Why exact version?** Ensures all modules use identical React version (singleton).

**Commands:**
```bash
# Update React everywhere
npm install react@18.3.1 react-dom@18.3.1 \
  --workspace=shared-components \
  --workspace=shared-data \
  --workspace=content-platform/shell \
  --workspace=top-level-shell \
  --workspace=hubs-tab \
  --workspace=reports-tab \
  --workspace=content-platform/files-folders \
  --workspace=user-tab
```

#### 1.1.3: Install Dependencies

```bash
# Install all
npm install

# Verify versions
npm list react react-dom @module-federation/enhanced
```

**Testing:**
```bash
# Should still build
npm run build --workspace=shared-components

# Should still run
./scripts/dev-all.sh start

# Verify in browser: http://localhost:3000
# All remotes should still load
```

**Expected Result:** ✅ Everything works exactly as before, just with updated packages

**Rollback:** `git checkout package.json package-lock.json && npm install`

---

### Task 1.2: Add Error Boundaries

**Priority:** 🔴 CRITICAL
**Estimated Time:** 2 hours
**Risk:** 🟢 LOW (additive change)

#### 1.2.1: Create ErrorBoundary Component

**File:** `shared-components/src/components/ErrorBoundary.tsx` (NEW)

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  remoteName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', {
      error,
      errorInfo,
      remoteName: this.props.remoteName,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // TODO Phase 4: Send to error tracking service
    // trackError(error, errorInfo, this.props.remoteName);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback(this.state.error, this.reset);
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #ff4444',
          borderRadius: '8px',
          backgroundColor: '#fff5f5',
        }}>
          <h2 style={{ color: '#cc0000', margin: '0 0 10px 0' }}>
            Component Unavailable
          </h2>
          {this.props.remoteName && (
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
              Remote: {this.props.remoteName}
            </p>
          )}
          <details style={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '5px' }}>
              Error details
            </summary>
            <code style={{
              display: 'block',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              fontSize: '12px',
            }}>
              {this.state.error.toString()}
              {'\n\n'}
              {this.state.error.stack}
            </code>
          </details>
          <button
            onClick={this.reset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### 1.2.2: Export from shared-components

**File:** `shared-components/webpack.config.js`

**Add to exposes:**
```javascript
exposes: {
  './Button': './src/components/Button',
  './Input': './src/components/Input',
  // ... existing exports
  './ErrorBoundary': './src/components/ErrorBoundary',  // ← ADD THIS
},
```

**File:** `shared-components/src/demo.tsx` (optional - test standalone)

Add demo of error boundary to verify it works.

#### 1.2.3: Use in top-level-shell

**File:** `top-level-shell/src/bootstrap.tsx`

**Current:**
```tsx
const ContentPlatform = lazy(() =>
  import('content_shell/ContentPlatform').then(m => {
    const { ContentPlatform } = m as unknown as Record<string, React.ComponentType<any>>;
    return { default: ContentPlatform };
  })
);

// Later in render:
<Suspense fallback={<div>Loading...</div>}>
  <ContentPlatform />
</Suspense>
```

**Update to:**
```tsx
import { lazy, Suspense, useState } from 'react';

// Import error boundary
const ErrorBoundary = lazy(() =>
  import('shared_components/ErrorBoundary').then(m => ({
    default: m.default
  }))
);

const ContentPlatform = lazy(() =>
  import('content_shell/ContentPlatform').then(m => {
    const { ContentPlatform } = m as unknown as Record<string, React.ComponentType<any>>;
    return { default: ContentPlatform };
  })
);

// In render:
function App() {
  const [contentKey, setContentKey] = useState(0);

  return (
    <Suspense fallback={<div>Loading error boundary...</div>}>
      <ErrorBoundary
        remoteName="content_shell"
        onReset={() => setContentKey(k => k + 1)}
      >
        <Suspense fallback={<div>Loading content platform...</div>}>
          <ContentPlatform key={contentKey} />
        </Suspense>
      </ErrorBoundary>
    </Suspense>
  );
}
```

**Pattern:** Wrap EVERY federated component with ErrorBoundary + Suspense

#### 1.2.4: Apply to all federated components

**Files to update:**
- `top-level-shell/src/bootstrap.tsx` - Wrap ContentPlatform, ReportsTab, UserTab
- `content-platform/shell/src/bootstrap.tsx` - Wrap FilesTab, HubsTab

**Template:**
```tsx
<ErrorBoundary remoteName="remote_name" onReset={() => setKey(k => k + 1)}>
  <Suspense fallback={<div>Loading {remoteName}...</div>}>
    <RemoteComponent key={componentKey} />
  </Suspense>
</ErrorBoundary>
```

**Testing:**
```bash
# Start all services
./scripts/dev-all.sh start

# Test error handling
# 1. Stop one remote: ./scripts/dev-all.sh stop hubs-tab
# 2. Navigate to that section in browser
# 3. Should see error boundary fallback (not white screen)
# 4. Restart: ./scripts/dev-all.sh start hubs-tab
# 5. Click "Try Again" - should recover
```

**Expected Result:** ✅ Graceful error messages instead of crashes

---

### Task 1.3: Enable Eager Loading in Hosts

**Priority:** 🔴 CRITICAL
**Estimated Time:** 20 minutes
**Risk:** 🟢 LOW

#### 1.3.1: Update top-level-shell

**File:** `top-level-shell/webpack.config.js`

**Current (lines 69-74):**
```javascript
shared: {
  react: {
    singleton: true,
    requiredVersion: '^18.3.1',
    strictVersion: false,
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '^18.3.1',
    strictVersion: false,
  },
  '@reduxjs/toolkit': {
    singleton: true,
    requiredVersion: '^2.0.0',
    strictVersion: false,
  },
  'react-redux': {
    singleton: true,
    requiredVersion: '^9.0.0',
    strictVersion: false,
  },
}
```

**Update to:**
```javascript
shared: {
  react: {
    singleton: true,
    eager: true,  // ← ADD THIS (host)
    requiredVersion: '^18.3.1',
    strictVersion: false,
  },
  'react-dom': {
    singleton: true,
    eager: true,  // ← ADD THIS (host)
    requiredVersion: '^18.3.1',
    strictVersion: false,
  },
  // Also add sub-path sharing
  'react/': {  // ← ADD THIS
    singleton: true,
    eager: true,
    requiredVersion: '^18.3.1',
  },
  'react-dom/': {  // ← ADD THIS
    singleton: true,
    eager: true,
    requiredVersion: '^18.3.1',
  },
  '@reduxjs/toolkit': {
    singleton: true,
    eager: true,  // ← ADD THIS (host)
    requiredVersion: '^2.0.0',
    strictVersion: false,
  },
  'react-redux': {
    singleton: true,
    eager: true,  // ← ADD THIS (host)
    requiredVersion: '^9.0.0',
    strictVersion: false,
  },
}
```

#### 1.3.2: Update content-platform/shell (middle layer)

**File:** `content-platform/shell/webpack.config.js`

**Important:** This is a MIDDLE layer (both provider and consumer)

```javascript
shared: {
  react: {
    singleton: true,
    eager: false,  // ← ADD THIS (not top-level host)
    requiredVersion: '^18.3.1',
    strictVersion: false,
  },
  'react-dom': {
    singleton: true,
    eager: false,  // ← ADD THIS
    requiredVersion: '^18.3.1',
    strictVersion: false,
  },
  'react/': {  // ← ADD THIS
    singleton: true,
    eager: false,
    requiredVersion: '^18.3.1',
  },
  'react-dom/': {  // ← ADD THIS
    singleton: true,
    eager: false,
    requiredVersion: '^18.3.1',
  },
  '@reduxjs/toolkit': {
    singleton: true,
    eager: false,  // ← ADD THIS
    requiredVersion: '^2.0.0',
    strictVersion: false,
  },
  'react-redux': {
    singleton: true,
    eager: false,  // ← ADD THIS
    requiredVersion: '^9.0.0',
    strictVersion: false,
  },
}
```

#### 1.3.3: Update all remotes

**Files:**
- `shared-components/webpack.config.js`
- `shared-data/webpack.config.js`
- `hubs-tab/webpack.config.js`
- `reports-tab/webpack.config.js`
- `content-platform/files-folders/webpack.config.js`
- `user-tab/webpack.config.js`

**Pattern:**
```javascript
shared: {
  react: {
    singleton: true,
    eager: false,  // ← Explicit false for remotes
    requiredVersion: '^18.3.1',
    strictVersion: false,
  },
  'react-dom': {
    singleton: true,
    eager: false,
    requiredVersion: '^18.3.1',
    strictVersion: false,
  },
  // Add sub-paths
  'react/': {
    singleton: true,
    eager: false,
    requiredVersion: '^18.3.1',
  },
  'react-dom/': {
    singleton: true,
    eager: false,
    requiredVersion: '^18.3.1',
  },
}
```

**Testing:**
```bash
# Clean build all
npm run clean
npm run build

# Start dev
./scripts/dev-all.sh start

# Should see no "Shared module not available" errors
# Check browser console - no warnings
```

**Expected Result:** ✅ No initialization race conditions

---

### Task 1.4: Add Retry Logic

**Priority:** 🔴 HIGH
**Estimated Time:** 1 hour
**Risk:** 🟢 LOW

#### 1.4.1: Create Retry Utility

**File:** `shared-components/src/utils/loadRemoteWithRetry.ts` (NEW)

```typescript
interface RetryOptions {
  maxRetries?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function loadRemoteWithRetry<T>(
  importFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await importFn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;

        console.warn(
          `[loadRemoteWithRetry] Failed to load remote (attempt ${attempt + 1}/${maxRetries}). ` +
          `Retrying in ${waitTime}ms...`,
          error
        );

        onRetry?.(attempt + 1, lastError);

        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  console.error(
    `[loadRemoteWithRetry] Failed to load remote after ${maxRetries} attempts:`,
    lastError!
  );

  throw lastError!;
}

// Re-export for convenience
export default loadRemoteWithRetry;
```

#### 1.4.2: Export from shared-components

**File:** `shared-components/webpack.config.js`

```javascript
exposes: {
  // ... existing
  './utils/loadRemoteWithRetry': './src/utils/loadRemoteWithRetry',  // ← ADD
},
```

#### 1.4.3: Use in top-level-shell

**File:** `top-level-shell/src/bootstrap.tsx`

```tsx
import { lazy, Suspense } from 'react';

// Import retry utility
const { loadRemoteWithRetry } = await import('shared_components/utils/loadRemoteWithRetry');

// Use with lazy loading
const ContentPlatform = lazy(() =>
  loadRemoteWithRetry(
    () => import('content_shell/ContentPlatform').then(m => {
      const { ContentPlatform } = m as unknown as Record<string, React.ComponentType<any>>;
      return { default: ContentPlatform };
    }),
    {
      maxRetries: 3,
      delay: 1000,
      backoff: true,
      onRetry: (attempt, error) => {
        console.log(`Retrying content_shell (attempt ${attempt}):`, error.message);
      },
    }
  )
);
```

**Apply to all lazy-loaded remotes**

**Testing:**
```bash
# Start all
./scripts/dev-all.sh start

# Test retry logic
# 1. Use browser DevTools -> Network tab
# 2. Block remoteEntry.js for a remote
# 3. Navigate to that remote
# 4. Should see retry attempts in console
# 5. Unblock after 2-3 seconds
# 6. Should successfully load after retry
```

**Expected Result:** ✅ Transient network errors recover automatically

---

### Task 1.5: Change Share Strategy

**Priority:** 🟡 LOW
**Estimated Time:** 10 minutes
**Risk:** 🟢 LOW

**All webpack.config.js files:**

**Change:**
```javascript
shareStrategy: 'version-first',  // ← FROM
shareStrategy: 'loaded-first',   // ← TO
```

**Files:**
- All webpack.config.js files

**Why:** More predictable behavior, matches examples

**Testing:** Existing tests should pass

---

### Task 1.6: Add uniqueName

**Priority:** 🟡 MEDIUM
**Estimated Time:** 10 minutes
**Risk:** 🟢 LOW

**All webpack.config.js files:**

**Add to output config:**
```javascript
output: {
  publicPath: 'auto',
  uniqueName: 'module_name',  // ← ADD (use MF name)
  // ...
}
```

**Examples:**
- top-level-shell: `uniqueName: 'top_level_shell'`
- content-platform/shell: `uniqueName: 'content_shell'`
- shared-components: `uniqueName: 'shared_components'`

**Testing:** Build should work as before

---

### Phase 1 Testing Checklist

**Before Committing:**

- [ ] All packages upgraded successfully
- [ ] `npm install` completes without errors
- [ ] All modules build: `npm run build`
- [ ] Dev server starts: `./scripts/dev-all.sh start`
- [ ] All remotes load in browser
- [ ] Error boundaries show fallback (test by stopping a remote)
- [ ] Error boundaries recover (test "Try Again" button)
- [ ] No console errors about shared modules
- [ ] Retry logic works (test with network throttling)
- [ ] Type checking passes: `npm run typecheck`
- [ ] Unit tests pass (if any)

**Manual Testing:**
1. Navigate to all routes
2. Verify all components load
3. Stop one remote, verify error boundary
4. Restart remote, verify recovery
5. Test with slow 3G network throttling

---

### Phase 1 Commit & Deploy

```bash
# Stage changes
git add .

# Commit
git commit -m "Phase 1: Foundation & Stability

- Upgrade @module-federation/enhanced to 0.17.1
- Update React to 18.3.1 for stability
- Add error boundaries to all federated components
- Enable eager loading in host applications
- Add retry logic with exponential backoff
- Add sub-path sharing for react/ and react-dom/
- Change share strategy to loaded-first
- Add uniqueName to all outputs

This phase establishes production-ready error handling and
prevents remote loading failures from crashing the application.

Tested:
- ✅ All remotes load successfully
- ✅ Error boundaries prevent crashes
- ✅ Retry logic recovers from transient failures
- ✅ No shared module errors
- ✅ All existing functionality works"

# Push
git push origin feature/mf-phase-1-stability

# Create PR
gh pr create --title "Phase 1: MF Foundation & Stability" \
  --body "See MIGRATION_PLAN.md Phase 1 for details"
```

---

### Phase 1 Rollback Plan

**If issues arise:**

```bash
# Revert the commit
git revert HEAD

# Or reset to previous state
git reset --hard origin/main

# Reinstall old packages
npm install
```

**Verification after rollback:**
- All services start
- All functionality works
- No errors in console

---

## Phase 2: Type Safety & Developer Experience

**Duration:** 1-2 weeks (Sprint 1-2)
**Risk Level:** 🟡 MEDIUM
**Impact:** 🟡 HIGH - Improves developer productivity

### Objectives

1. Migrate to built-in DTS plugin (remove custom scripts)
2. Add API type generation
3. Implement automatic type consumption
4. Improve development hot reload
5. Add type validation in CI

---

### Task 2.1: Enhance DTS Plugin Configuration

**Priority:** 🟡 HIGH
**Estimated Time:** 2 hours
**Risk:** 🟡 MEDIUM (changing existing type system)

#### 2.1.1: Update Remote Configurations

**Files:**
- `shared-components/webpack.config.js`
- `shared-data/webpack.config.js`
- `hubs-tab/webpack.config.js`
- `reports-tab/webpack.config.js`
- `content-platform/files-folders/webpack.config.js`

**Current:**
```javascript
dts: {
  tsConfigPath: path.resolve(__dirname, './tsconfig.json'),
  generateTypes: true
}
```

**Update to:**
```javascript
dts: {
  tsConfigPath: path.resolve(__dirname, './tsconfig.json'),
  generateTypes: true,
  generateAPITypes: true,  // ← ADD: Generate runtime API types
  typesFolder: '@mf-types',  // ← Explicit (default)
  compilerOptions: {
    declaration: true,
    emitDeclarationOnly: true,
    isolatedModules: false,
  }
}
```

#### 2.1.2: Update Host Configurations

**Files:**
- `top-level-shell/webpack.config.js`
- `content-platform/shell/webpack.config.js`

**Current:**
```javascript
// No dts config
```

**Add:**
```javascript
dts: {
  consumeTypes: true,  // ← ADD: Auto-consume remote types
  typesFolder: '@mf-types',
}
```

**This enables automatic type fetching from remotes!**

---

### Task 2.2: Remove Custom Type Scripts

**Priority:** 🟡 MEDIUM
**Estimated Time:** 1 hour
**Risk:** 🟡 MEDIUM

#### 2.2.1: Remove scripts

**Files to DELETE:**
- `shared-components/scripts/package-types.js`
- `shared-data/scripts/package-types.js`
- `top-level-shell/scripts/fetch-types.js`
- `content-platform/shell/scripts/fetch-types.js`

#### 2.2.2: Update package.json scripts

**All package.json files:**

**Remove:**
```json
{
  "scripts": {
    "build:types": "tsc --emitDeclarationOnly --declaration --declarationDir dist/types",
    "package:types": "node scripts/package-types.js",
    "fetch:types": "node scripts/fetch-types.js",
    "prebuild": "npm run fetch:types"
  }
}
```

**Replace with:**
```json
{
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack serve --mode development"
  }
}
```

**Types are now automatic via DTS plugin!**

#### 2.2.3: Update .gitignore

**Verify @mf-types is ignored:**

```gitignore
# Module Federation types (generated)
@mf-types/
node_modules/.federation/
```

#### 2.2.4: Clean up generated type files

```bash
# Remove old generated types
rm -rf shared-components/@mf-types
rm -rf shared-components/dist/@mf-types.zip
rm -rf shared-data/@mf-types
rm -rf shared-data/dist/@mf-types.zip
rm -rf top-level-shell/@mf-types
rm -rf content-platform/shell/@mf-types

# Remove old type declaration files
rm -f top-level-shell/src/shared-components-types.d.ts
rm -f content-platform/shell/src/shared-components-types.d.ts
```

---

### Task 2.3: Test New Type System

**Testing Steps:**

1. **Clean build all remotes:**
```bash
npm run build --workspace=shared-components
npm run build --workspace=shared-data
```

2. **Verify types generated:**
```bash
# Should exist
ls shared-components/dist/@mf-types/
ls shared-data/dist/@mf-types/
```

3. **Build hosts:**
```bash
npm run build --workspace=top-level-shell
npm run build --workspace=content-platform/shell
```

4. **Verify types consumed:**
```bash
# Should have pulled types from remotes
ls top-level-shell/@mf-types/shared_components/
ls top-level-shell/@mf-types/shared_data/
```

5. **TypeScript checking:**
```bash
# Should pass without errors
npm run typecheck --workspace=top-level-shell
npm run typecheck --workspace=content-platform/shell
```

6. **IDE verification:**
- Open `top-level-shell/src/bootstrap.tsx`
- Import should have types: `import Button from 'shared_components/Button'`
- Should see autocomplete and type hints
- Should see prop types when using `<Button />`

**Expected Result:** ✅ Types work automatically, no manual scripts needed

---

### Task 2.4: Improve Hot Reload Configuration

**Priority:** 🟢 LOW
**Estimated Time:** 30 minutes
**Risk:** 🟢 LOW

**All webpack.config.js with devServer:**

**Add/update:**
```javascript
devServer: {
  port: 3000,  // respective port
  hot: true,
  liveReload: true,  // ← ADD
  historyApiFallback: true,

  // Improve HMR
  client: {
    overlay: {
      errors: true,
      warnings: false,  // Less noise
    },
    progress: true,
  },

  // CORS (already exists, verify)
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
  },
}
```

---

### Task 2.5: Add Type Validation in CI

**Priority:** 🟢 LOW
**Estimated Time:** 30 minutes
**Risk:** 🟢 LOW

**File:** `.github/workflows/ci.yml` (NEW or UPDATE)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  type-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build remotes (for type generation)
        run: |
          npm run build --workspace=shared-components
          npm run build --workspace=shared-data

      - name: Type check all packages
        run: npm run typecheck

      - name: Lint
        run: npm run lint
```

---

### Phase 2 Testing Checklist

- [ ] DTS plugin generates types in remotes
- [ ] Hosts automatically consume types
- [ ] No type errors in IDE
- [ ] Autocomplete works for remote imports
- [ ] TypeScript checking passes
- [ ] Old type scripts deleted
- [ ] package.json scripts simplified
- [ ] Hot reload works faster
- [ ] CI pipeline validates types

---

### Phase 2 Commit & Deploy

```bash
git add .

git commit -m "Phase 2: Type Safety & Developer Experience

- Migrate to built-in DTS plugin with API types
- Enable automatic type consumption in hosts
- Remove custom type generation scripts
- Simplify build scripts (types now automatic)
- Improve hot reload configuration
- Add type validation to CI pipeline

Benefits:
- ✅ Automatic type distribution
- ✅ No manual script maintenance
- ✅ Faster development workflow
- ✅ Better IDE support
- ✅ Type safety validated in CI"

git push origin feature/mf-phase-2-types
```

---

## Phase 3: Performance & Modern Patterns

**Duration:** 1-2 weeks (Sprint 2-3)
**Risk Level:** 🟡 MEDIUM
**Impact:** 🟡 HIGH - Significant performance improvement

### Objectives

1. Migrate to manifest-based loading
2. Implement runtime plugin system
3. Add preloading for critical remotes
4. Optimize bundle sizes
5. Consider Rspack for faster builds

---

### Task 3.1: Enable Manifest Generation

**Priority:** 🟡 HIGH
**Estimated Time:** 1 hour
**Risk:** 🟡 MEDIUM

#### 3.1.1: Update Remote Configurations

**All remote webpack.config.js:**

**Add to ModuleFederationPlugin:**
```javascript
new ModuleFederationPlugin({
  name: 'shared_components',
  filename: 'remoteEntry.js',

  // ADD manifest configuration
  manifest: {
    fileName: 'mf-manifest.json',
    getPublicPath: () => 'auto',
  },

  exposes: { /* ... */ },
  shared: { /* ... */ },
})
```

**Files:**
- `shared-components/webpack.config.js`
- `shared-data/webpack.config.js`
- `content-platform/shell/webpack.config.js`
- `hubs-tab/webpack.config.js`
- `reports-tab/webpack.config.js`
- `content-platform/files-folders/webpack.config.js`
- `user-tab/webpack.config.js`

#### 3.1.2: Update Host Remote URLs

**Files:**
- `top-level-shell/webpack.config.js`
- `content-platform/shell/webpack.config.js`

**Change:**
```javascript
// BEFORE
remotes: {
  shared_components: 'shared_components@http://localhost:3001/remoteEntry.js',
  shared_data: 'shared_data@http://localhost:3002/remoteEntry.js',
}

// AFTER
remotes: {
  shared_components: 'shared_components@http://localhost:3001/mf-manifest.json',
  shared_data: 'shared_data@http://localhost:3002/mf-manifest.json',
}
```

**Update all remote references to use mf-manifest.json**

#### 3.1.3: Update Environment Variables

**If using env vars for remote URLs:**

```env
# BEFORE
REMOTE_SHARED_COMPONENTS_URL=https://cdn.com/shared-components/remoteEntry.js

# AFTER
REMOTE_SHARED_COMPONENTS_URL=https://cdn.com/shared-components/mf-manifest.json
```

#### 3.1.4: Test Manifest Loading

```bash
# Build remotes
npm run build --workspace=shared-components

# Check manifest was generated
cat shared-components/dist/mf-manifest.json

# Should see JSON with metadata:
# {
#   "name": "shared_components",
#   "version": "1.0.0",
#   "metaData": { ... },
#   "remoteEntry": { ... },
#   "exposes": { ... }
# }
```

```bash
# Start dev
./scripts/dev-all.sh start

# Verify manifest endpoint
curl http://localhost:3001/mf-manifest.json

# Should return JSON (not 404)
```

```bash
# Test in browser
# Open Network tab
# Navigate to use a remote
# Should see mf-manifest.json loaded (small ~3KB)
# Not remoteEntry.js
```

**Performance Measurement:**

**Before (remoteEntry.js):**
- Initial load: ~30-40KB
- Parse time: ~50-80ms

**After (mf-manifest.json):**
- Initial load: ~3-5KB (10x smaller!)
- Parse time: ~5-10ms (5-8x faster!)

**Expected Result:** ✅ 30-50% faster remote loading

---

### Task 3.2: Implement Runtime Plugin System

**Priority:** 🟡 HIGH
**Estimated Time:** 3 hours
**Risk:** 🟡 MEDIUM

#### 3.2.1: Install Runtime Package

```bash
npm install @module-federation/runtime \
  --workspace=top-level-shell \
  --workspace=content-platform/shell
```

#### 3.2.2: Create Runtime Plugin

**File:** `top-level-shell/src/plugins/federationPlugin.ts` (NEW)

```typescript
import type { FederationRuntimePlugin } from '@module-federation/runtime/types';

interface PluginOptions {
  onError?: (error: Error, context: any) => void;
  enableRetry?: boolean;
  maxRetries?: number;
}

export function createFederationPlugin(options: PluginOptions = {}): FederationRuntimePlugin {
  const {
    onError,
    enableRetry = true,
    maxRetries = 3,
  } = options;

  return {
    name: 'custom-federation-plugin',

    beforeInit(args) {
      console.log('[Federation] Initializing:', args);
      return args;
    },

    beforeRequest(args) {
      console.log('[Federation] Loading remote:', args.id);
      return args;
    },

    afterResolve(args) {
      console.log('[Federation] Resolved:', args.id);
      return args;
    },

    onLoad(args) {
      console.log('[Federation] Loaded:', args.id);
      return args;
    },

    errorLoadRemote(args) {
      console.error('[Federation] Failed to load remote:', args.id, args.error);

      // Track error
      onError?.(args.error, { id: args.id, from: args.from });

      // Could return fallback module here
      // For now, let error propagate to ErrorBoundary
      throw args.error;
    },

    // Could implement retry logic here
    // async loadEntry(args) {
    //   if (enableRetry) {
    //     return retryLoadEntry(args, maxRetries);
    //   }
    //   return args;
    // },
  };
}
```

#### 3.2.3: Modify index.tsx to Use Runtime Init

**File:** `top-level-shell/src/index.tsx`

**Current:**
```tsx
import('./bootstrap');
```

**Update to:**
```tsx
import { init } from '@module-federation/runtime';
import { createFederationPlugin } from './plugins/federationPlugin';

// Get remote URLs
function getRemoteUrl(name: string, defaultUrl: string): string {
  const envVar = `REMOTE_${name.toUpperCase()}_URL`;
  return process.env[envVar] || defaultUrl;
}

// Initialize runtime
init({
  name: 'top_level_shell',
  remotes: [
    {
      name: 'shared_components',
      entry: getRemoteUrl('shared_components', 'http://localhost:3001/mf-manifest.json'),
    },
    {
      name: 'shared_data',
      entry: getRemoteUrl('shared_data', 'http://localhost:3002/mf-manifest.json'),
    },
    {
      name: 'content_shell',
      entry: getRemoteUrl('content_shell', 'http://localhost:3003/mf-manifest.json'),
    },
    {
      name: 'reports_tab',
      entry: getRemoteUrl('reports_tab', 'http://localhost:3006/mf-manifest.json'),
    },
    {
      name: 'user_tab',
      entry: getRemoteUrl('user_tab', 'http://localhost:3007/mf-manifest.json'),
    },
  ],
  plugins: [
    createFederationPlugin({
      onError: (error, context) => {
        console.error('Federation error:', error, context);
        // TODO Phase 4: Send to monitoring service
      },
      enableRetry: true,
      maxRetries: 3,
    }),
  ],
});

// Now load bootstrap
import('./bootstrap');
```

**Benefits:**
- ✅ Centralized remote configuration
- ✅ Runtime URL resolution
- ✅ Centralized error handling
- ✅ Easy to add A/B testing
- ✅ Easy to add monitoring

#### 3.2.4: Update Webpack Config

**File:** `top-level-shell/webpack.config.js`

**Option 1: Keep static remotes (backward compatible)**
```javascript
remotes: {
  // Keep these for type resolution
  shared_components: 'shared_components@http://localhost:3001/mf-manifest.json',
  // ...
}
```

**Option 2: Use runtime-only remotes**
```javascript
// Remove static remotes if using runtime init exclusively
remotes: {},

// Add runtime plugin config
new ModuleFederationPlugin({
  name: 'top_level_shell',
  filename: 'remoteEntry.js',
  remotes: {},  // Empty - runtime provides
  runtimePlugins: [path.join(__dirname, './src/plugins/federationPlugin.ts')],
  // ...
})
```

**Recommendation:** Keep static remotes for now (better TypeScript support)

---

### Task 3.3: Add Preloading

**Priority:** 🟡 MEDIUM
**Estimated Time:** 1 hour
**Risk:** 🟢 LOW

#### 3.3.1: Preload on App Mount

**File:** `top-level-shell/src/bootstrap.tsx`

```tsx
import { useEffect } from 'react';
import { preloadRemote } from '@module-federation/runtime';

function App() {
  useEffect(() => {
    // Preload critical remotes
    preloadRemote([
      {
        nameOrAlias: 'shared_components',
        resourceCategory: 'all',
      },
      {
        nameOrAlias: 'shared_data',
        resourceCategory: 'all',
      },
    ]).then(() => {
      console.log('[Preload] Critical remotes loaded');
    });
  }, []);

  return <YourApp />;
}
```

#### 3.3.2: Route-Based Preloading

**File:** `top-level-shell/src/App.tsx` (or wherever routing is)

```tsx
import { useLocation, useNavigate } from 'react-router-dom';
import { preloadRemote } from '@module-federation/runtime';

function Navigation() {
  const navigate = useNavigate();

  const handleNavigateWithPreload = (path: string, remote: string) => {
    // Start preloading
    preloadRemote([{ nameOrAlias: remote, resourceCategory: 'all' }]);

    // Navigate after slight delay (allows preload to start)
    setTimeout(() => navigate(path), 50);
  };

  return (
    <nav>
      <button onClick={() => handleNavigateWithPreload('/content', 'content_shell')}>
        Content
      </button>
      <button onClick={() => handleNavigateWithPreload('/reports', 'reports_tab')}>
        Reports
      </button>
    </nav>
  );
}
```

**Performance Impact:** 20-30% perceived performance improvement

---

### Task 3.4: Bundle Optimization

**Priority:** 🟢 LOW
**Estimated Time:** 1 hour
**Risk:** 🟢 LOW

#### 3.4.1: Analyze Current Bundles

```bash
# Install analyzer
npm install --save-dev webpack-bundle-analyzer

# Add to webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  plugins: [
    process.env.ANALYZE && new BundleAnalyzerPlugin(),
  ].filter(Boolean),
}

# Run analysis
ANALYZE=true npm run build --workspace=top-level-shell
```

#### 3.4.2: Optimize Shared Config

**Review and remove unnecessary sharing:**

```javascript
shared: {
  // Keep these (necessary)
  react: { singleton: true, eager: true },
  'react-dom': { singleton: true, eager: true },
  '@reduxjs/toolkit': { singleton: true, eager: true },
  'react-redux': { singleton: true, eager: true },

  // Consider removing these (let each bundle include)
  // 'lodash': {},  // If not version-critical
  // 'date-fns': {},  // If used rarely
}
```

**Rule:** Only share what MUST be shared (frameworks, state, theme)

---

### Task 3.5: Consider Rspack Migration

**Priority:** 🟢 LOW
**Estimated Time:** 2-4 hours per module
**Risk:** 🟡 MEDIUM

**Benefits:**
- 10x faster dev server startup
- 5x faster builds
- Same API as Webpack

**Approach:** Migrate one module at a time

#### 3.5.1: Install Rspack (optional pilot)

```bash
# Pick one module to test (e.g., shared-components)
npm install --save-dev @rspack/core @rspack/cli \
  --workspace=shared-components
```

#### 3.5.2: Create rspack.config.js

**File:** `shared-components/rspack.config.js` (NEW)

```javascript
// Copy from webpack.config.js, minimal changes needed
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');
// ... rest of config nearly identical
```

#### 3.5.3: Update package.json

```json
{
  "scripts": {
    "dev": "rspack serve",
    "build": "rspack build",
    "legacy:dev": "webpack serve",  // Keep as fallback
    "legacy:build": "webpack build"
  }
}
```

#### 3.5.4: Test Performance

```bash
# Measure webpack
time npm run legacy:build

# Measure rspack
time npm run build

# Should see 3-5x speedup
```

**Recommendation:** Start with non-critical module (shared-components), validate, then expand

---

### Phase 3 Testing Checklist

- [ ] Manifest files generated in all remotes
- [ ] Manifests loadable via HTTP
- [ ] All remotes load using manifest URLs
- [ ] Performance improved (measure with DevTools)
- [ ] Runtime plugin logging works
- [ ] Preloading improves perceived performance
- [ ] Bundle sizes acceptable
- [ ] Rspack builds (if attempted) work correctly

---

### Phase 3 Commit & Deploy

```bash
git add .

git commit -m "Phase 3: Performance & Modern Patterns

- Migrate to manifest-based loading (30-50% faster)
- Implement runtime plugin system for centralized control
- Add preloading for critical remotes
- Optimize bundle sizes via selective sharing
- (Optional) Add Rspack for faster builds

Performance improvements:
- ✅ Remote loading 30-50% faster (manifest vs remoteEntry)
- ✅ Perceived performance 20-30% better (preloading)
- ✅ Dev builds 5-10x faster (if using Rspack)

Measured improvements:
- Initial manifest load: 3-5KB (was 30-40KB)
- Parse time: 5-10ms (was 50-80ms)"

git push origin feature/mf-phase-3-performance
```

---

## Phase 4: Multi-Team Resilience

**Duration:** 1-2 weeks (Sprint 3-4)
**Risk Level:** 🟡 MEDIUM
**Impact:** 🟢 MEDIUM - Operational excellence

### Objectives

1. Implement health checks for remotes
2. Add monitoring and error tracking
3. Create deployment validation system
4. Add blue/green deployment support
5. Document operational procedures

---

### Task 4.1: Remote Health Checks

**Priority:** 🟡 MEDIUM
**Estimated Time:** 2 hours
**Risk:** 🟢 LOW

#### 4.1.1: Create Health Check Utility

**File:** `shared-components/src/utils/remoteHealthCheck.ts` (NEW)

```typescript
export interface RemoteHealth {
  name: string;
  url: string;
  available: boolean;
  latency?: number;
  error?: string;
  timestamp: number;
}

export async function checkRemoteHealth(
  remoteName: string,
  remoteUrl: string,
  timeout: number = 5000
): Promise<RemoteHealth> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(remoteUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const latency = Date.now() - startTime;

    return {
      name: remoteName,
      url: remoteUrl,
      available: response.ok,
      latency,
      error: response.ok ? undefined : `HTTP ${response.status}`,
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      name: remoteName,
      url: remoteUrl,
      available: false,
      error: (error as Error).message,
      timestamp: Date.now(),
    };
  }
}

export async function checkAllRemotes(
  remotes: Record<string, string>
): Promise<RemoteHealth[]> {
  const checks = Object.entries(remotes).map(([name, url]) =>
    checkRemoteHealth(name, url)
  );

  return Promise.all(checks);
}
```

#### 4.1.2: Export from shared-components

```javascript
// webpack.config.js
exposes: {
  './utils/remoteHealthCheck': './src/utils/remoteHealthCheck',
}
```

#### 4.1.3: Add Health Dashboard

**File:** `top-level-shell/src/components/HealthDashboard.tsx` (NEW)

```tsx
import React, { useEffect, useState } from 'react';

// Will import from shared_components after building
interface RemoteHealth {
  name: string;
  url: string;
  available: boolean;
  latency?: number;
  error?: string;
}

function HealthDashboard() {
  const [health, setHealth] = useState<RemoteHealth[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const { checkAllRemotes } = await import('shared_components/utils/remoteHealthCheck');

        const remotes = {
          shared_components: 'http://localhost:3001/mf-manifest.json',
          shared_data: 'http://localhost:3002/mf-manifest.json',
          content_shell: 'http://localhost:3003/mf-manifest.json',
          reports_tab: 'http://localhost:3006/mf-manifest.json',
        };

        const results = await checkAllRemotes(remotes);
        setHealth(results);
      } catch (error) {
        console.error('Health check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();

    // Refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Checking remote health...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Remote Service Health</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '8px' }}>Service</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Latency</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Error</th>
          </tr>
        </thead>
        <tbody>
          {health.map(remote => (
            <tr key={remote.name} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{remote.name}</td>
              <td style={{ padding: '8px' }}>
                {remote.available ? (
                  <span style={{ color: 'green' }}>✅ Available</span>
                ) : (
                  <span style={{ color: 'red' }}>❌ Unavailable</span>
                )}
              </td>
              <td style={{ padding: '8px' }}>
                {remote.latency ? `${remote.latency}ms` : 'N/A'}
              </td>
              <td style={{ padding: '8px', color: '#999' }}>
                {remote.error || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HealthDashboard;
```

**Usage:**
Add route `/health` to view dashboard in development

---

### Task 4.2: Error Tracking Integration

**Priority:** 🟡 MEDIUM
**Estimated Time:** 2 hours
**Risk:** 🟢 LOW

#### 4.2.1: Install Sentry (or similar)

```bash
npm install @sentry/react --workspace=top-level-shell
```

#### 4.2.2: Initialize Sentry

**File:** `top-level-shell/src/monitoring/sentry.ts` (NEW)

```typescript
import * as Sentry from '@sentry/react';

export function initializeSentry() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Sentry] Skipping in development');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.BrowserTracing(),
    ],
    tracesSampleRate: 1.0,

    // Module Federation specific
    beforeSend(event, hint) {
      // Tag MF errors
      if (hint.originalException?.toString().includes('ChunkLoadError')) {
        event.tags = {
          ...event.tags,
          'module-federation': 'chunk-load-error',
        };
      }

      return event;
    },
  });
}

export function trackRemoteError(
  remoteName: string,
  error: Error,
  context: any
) {
  Sentry.captureException(error, {
    tags: {
      'module-federation': 'remote-load-error',
      'remote-name': remoteName,
    },
    contexts: {
      'module-federation': context,
    },
  });
}
```

#### 4.2.3: Integrate with ErrorBoundary

**File:** `shared-components/src/components/ErrorBoundary.tsx`

**Update componentDidCatch:**
```tsx
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error('[ErrorBoundary] Caught error:', error);

  // Call optional error handler
  this.props.onError?.(error, errorInfo);

  // Send to Sentry
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      tags: {
        'error-boundary': true,
        'remote-name': this.props.remoteName,
      },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }
}
```

#### 4.2.4: Integrate with Runtime Plugin

**File:** `top-level-shell/src/plugins/federationPlugin.ts`

**Update errorLoadRemote:**
```typescript
errorLoadRemote(args) {
  console.error('[Federation] Failed to load remote:', args);

  // Track in Sentry
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(args.error, {
      tags: {
        'module-federation': 'runtime-load-error',
        'remote-id': args.id,
      },
      contexts: {
        federation: {
          id: args.id,
          from: args.from,
          origin: args.origin,
        },
      },
    });
  }

  onError?.(args.error, { id: args.id, from: args.from });

  throw args.error;
}
```

---

### Task 4.3: Deployment Validation

**Priority:** 🟡 MEDIUM
**Estimated Time:** 3 hours
**Risk:** 🟡 MEDIUM

#### 4.3.1: Create Deployment Validator Script

**File:** `scripts/validate-deployment.js` (NEW)

```javascript
#!/usr/bin/env node

const fetch = require('node-fetch');

const REMOTES = [
  { name: 'shared-components', url: 'http://localhost:3001/mf-manifest.json' },
  { name: 'shared-data', url: 'http://localhost:3002/mf-manifest.json' },
  { name: 'content-shell', url: 'http://localhost:3003/mf-manifest.json' },
  { name: 'hubs-tab', url: 'http://localhost:3005/mf-manifest.json' },
  { name: 'reports-tab', url: 'http://localhost:3006/mf-manifest.json' },
];

async function validateRemote(remote) {
  try {
    const response = await fetch(remote.url, { method: 'HEAD', timeout: 5000 });

    if (!response.ok) {
      return {
        ...remote,
        valid: false,
        error: `HTTP ${response.status}`,
      };
    }

    // Fetch manifest and validate structure
    const manifestResponse = await fetch(remote.url);
    const manifest = await manifestResponse.json();

    if (!manifest.name || !manifest.remoteEntry || !manifest.exposes) {
      return {
        ...remote,
        valid: false,
        error: 'Invalid manifest structure',
      };
    }

    return {
      ...remote,
      valid: true,
      version: manifest.version,
      exposes: Object.keys(manifest.exposes).length,
    };
  } catch (error) {
    return {
      ...remote,
      valid: false,
      error: error.message,
    };
  }
}

async function validateDeployment() {
  console.log('🔍 Validating deployment...\n');

  const results = await Promise.all(REMOTES.map(validateRemote));

  let allValid = true;

  results.forEach(result => {
    const status = result.valid ? '✅' : '❌';
    console.log(`${status} ${result.name}`);

    if (result.valid) {
      console.log(`   Version: ${result.version}`);
      console.log(`   Exposes: ${result.exposes} modules`);
    } else {
      console.log(`   Error: ${result.error}`);
      allValid = false;
    }

    console.log();
  });

  if (!allValid) {
    console.error('❌ Deployment validation FAILED');
    process.exit(1);
  }

  console.log('✅ Deployment validation PASSED');
}

validateDeployment();
```

```bash
chmod +x scripts/validate-deployment.js
```

#### 4.3.2: Add to CI Pipeline

**File:** `.github/workflows/ci.yml`

**Add job:**
```yaml
validate-deployment:
  runs-on: ubuntu-latest
  needs: [build]

  steps:
    - uses: actions/checkout@v3

    - name: Setup Node
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm ci

    - name: Build all modules
      run: npm run build

    - name: Start services
      run: ./scripts/dev-all.sh start &

    - name: Wait for services
      run: sleep 10

    - name: Validate deployment
      run: node scripts/validate-deployment.js

    - name: Stop services
      run: ./scripts/dev-all.sh stop
```

---

### Task 4.4: Blue/Green Deployment Support

**Priority:** 🟢 LOW
**Estimated Time:** 2 hours
**Risk:** 🟢 LOW

#### 4.4.1: Create Runtime Config File

**File:** `top-level-shell/public/env-config.json` (NEW)

```json
{
  "environment": "production",
  "version": "1.0.0",
  "remotes": {
    "shared_components": {
      "stable": "https://cdn.com/shared-components/v1.0.0/mf-manifest.json",
      "canary": "https://cdn.com/shared-components/v1.1.0-beta/mf-manifest.json",
      "active": "stable"
    },
    "shared_data": {
      "stable": "https://cdn.com/shared-data/v1.0.0/mf-manifest.json",
      "canary": "https://cdn.com/shared-data/v1.1.0-beta/mf-manifest.json",
      "active": "stable"
    }
  }
}
```

#### 4.4.2: Load Config at Runtime

**File:** `top-level-shell/src/index.tsx`

**Update:**
```tsx
import { init } from '@module-federation/runtime';

async function loadConfig() {
  try {
    const response = await fetch('/env-config.json');
    const config = await response.json();

    const remotes = Object.entries(config.remotes).map(([name, remote]: [string, any]) => ({
      name,
      entry: remote[remote.active],  // Use active version (stable/canary)
    }));

    init({
      name: 'top_level_shell',
      remotes,
      plugins: [/* ... */],
    });

    import('./bootstrap');
  } catch (error) {
    console.error('Failed to load config:', error);
    // Fallback to hardcoded remotes
    import('./bootstrap');
  }
}

loadConfig();
```

**Benefits:**
- ✅ Switch versions without rebuilding
- ✅ Canary deployments
- ✅ A/B testing
- ✅ Quick rollback (change config file)

---

### Task 4.5: Operational Documentation

**Priority:** 🟡 MEDIUM
**Estimated Time:** 2 hours
**Risk:** 🟢 LOW

#### 4.5.1: Create Runbook

**File:** `docs/RUNBOOK.md` (NEW)

```markdown
# Module Federation Operations Runbook

## Health Monitoring

### Check Remote Health
```bash
# Visit health dashboard
http://localhost:3000/health
```

### Check Logs
```bash
# Host logs
docker logs top-level-shell

# Remote logs
docker logs shared-components
```

## Deployment Procedures

### Deploy Single Remote
```bash
# Build
npm run build --workspace=shared-components

# Validate
node scripts/validate-deployment.js

# Deploy to CDN
./scripts/deploy.sh shared-components v1.2.3
```

### Rollback
```bash
# Update env-config.json
vi top-level-shell/public/env-config.json

# Change active version
{
  "shared_components": {
    "active": "v1.2.2"  // ← Previous version
  }
}

# Clear CDN cache (if needed)
```

## Troubleshooting

### Remote Not Loading

1. Check health dashboard
2. Verify manifest URL: `curl https://cdn.com/remote/mf-manifest.json`
3. Check browser console for errors
4. Check Sentry for error details

### Type Errors

1. Rebuild remote: `npm run build --workspace=remote-name`
2. Types regenerate automatically
3. Restart host dev server

### Performance Issues

1. Check bundle sizes: `ANALYZE=true npm run build`
2. Check network tab (manifest vs remoteEntry)
3. Check if preloading is working
```

---

### Phase 4 Testing Checklist

- [ ] Health check endpoint works
- [ ] Health dashboard displays status
- [ ] Sentry captures errors
- [ ] Error tracking includes MF context
- [ ] Deployment validation script works
- [ ] CI validates deployments
- [ ] Runtime config loading works
- [ ] Blue/green switching works
- [ ] Runbook documented

---

### Phase 4 Commit & Deploy

```bash
git add .

git commit -m "Phase 4: Multi-Team Resilience

- Add remote health check system
- Integrate Sentry for error tracking
- Create deployment validation script
- Add blue/green deployment support
- Document operational procedures

Operational improvements:
- ✅ Health dashboard for monitoring
- ✅ Automatic error tracking
- ✅ Deployment validation in CI
- ✅ Support for canary deployments
- ✅ Quick rollback capability"

git push origin feature/mf-phase-4-operations
```

---

## Testing Strategy

### Unit Testing

**Test Error Boundary:**
```tsx
// ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function ThrowError() {
  throw new Error('Test error');
}

test('catches errors and shows fallback', () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
});
```

### Integration Testing

**Test Remote Loading:**
```typescript
// remoteLoading.test.ts
import { loadRemoteWithRetry } from './loadRemoteWithRetry';

test('retries on failure', async () => {
  let attempts = 0;

  const mockImport = () => {
    attempts++;
    if (attempts < 3) {
      return Promise.reject(new Error('Network error'));
    }
    return Promise.resolve({ default: () => 'Component' });
  };

  const result = await loadRemoteWithRetry(mockImport, { maxRetries: 3 });

  expect(attempts).toBe(3);
  expect(result.default()).toBe('Component');
});
```

### E2E Testing

**Test Full Flow:**
```typescript
// e2e/module-federation.spec.ts
import { test, expect } from '@playwright/test';

test('loads all remotes successfully', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Wait for host to load
  await expect(page.locator('h1')).toContainText('App');

  // Navigate to content platform
  await page.click('text=Content');
  await expect(page.locator('[data-testid="content-platform"]')).toBeVisible();

  // Navigate to reports
  await page.click('text=Reports');
  await expect(page.locator('[data-testid="reports"]')).toBeVisible();
});

test('handles remote failure gracefully', async ({ page }) => {
  // Mock remote failure
  await page.route('**/mf-manifest.json', route => {
    if (route.request().url().includes('reports')) {
      route.abort();
    } else {
      route.continue();
    }
  });

  await page.goto('http://localhost:3000');

  // Navigate to reports (will fail)
  await page.click('text=Reports');

  // Should show error boundary, not crash
  await expect(page.locator('text=Component Unavailable')).toBeVisible();

  // Try again button should work
  await page.click('text=Try Again');
});
```

---

## Rollback Procedures

### Phase 1 Rollback

```bash
# If critical issues arise after Phase 1 deployment

# 1. Revert the merge commit
git revert <merge-commit-sha>

# 2. Or create a revert PR
gh pr create --base main --head revert/phase-1 \
  --title "Revert Phase 1" \
  --body "Rolling back due to issues"

# 3. Deploy revert
git push origin revert/phase-1

# 4. Verify old functionality restored
./scripts/dev-all.sh start
# Test in browser
```

### Phase 2 Rollback

```bash
# Type system issues

# 1. Restore old type scripts
git checkout main -- */scripts/*-types.js
git checkout main -- */package.json  # Restore old scripts

# 2. Reinstall
npm install

# 3. Build with old type system
npm run build:types
npm run package:types
```

### Phase 3 Rollback

```bash
# Manifest loading issues

# Quick fix: Switch back to remoteEntry.js
# Edit webpack configs
remotes: {
  shared_components: 'shared_components@.../remoteEntry.js'  // Not manifest
}

# Rebuild hosts
npm run build --workspace=top-level-shell

# Or full revert
git revert <phase-3-commit>
```

### Emergency Rollback (Production)

```bash
# If production is down

# 1. Update env-config.json to previous versions
vi public/env-config.json
# Change all "active" to previous stable versions

# 2. Clear CDN cache
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"

# 3. Monitor recovery
# Check health dashboard
# Check error rates in Sentry

# 4. Notify team
# Slack/email notification
```

---

## Success Metrics

### Phase 1 Success Criteria

- [ ] Zero white screens of death
- [ ] Error boundaries catch 100% of remote failures
- [ ] No "shared module" errors in console
- [ ] Retry logic recovers from >90% of transient failures
- [ ] All existing functionality works

### Phase 2 Success Criteria

- [ ] Type generation fully automatic
- [ ] Zero manual type script maintenance
- [ ] IDE autocomplete works for all remote imports
- [ ] TypeScript checking passes in CI
- [ ] Build time improvement (types faster)

### Phase 3 Success Criteria

- [ ] Remote loading 30-50% faster (measured)
- [ ] Initial manifest load <5KB (vs >30KB remoteEntry)
- [ ] Parse time <10ms (vs >50ms)
- [ ] Preloading reduces perceived load time by 20-30%
- [ ] Bundle sizes optimized

### Phase 4 Success Criteria

- [ ] Health dashboard shows real-time status
- [ ] Error tracking captures 100% of MF errors
- [ ] Deployment validation prevents broken deployments
- [ ] Blue/green switching works without rebuild
- [ ] Mean time to recovery <5 minutes

### Overall Success Metrics

**Stability:**
- Uptime: 99.9%+
- Error rate: <0.1%
- Remote load success rate: >99%

**Performance:**
- Initial load: <2s
- Remote load: <500ms
- Time to interactive: <3s

**Developer Experience:**
- Build time: <30s per module
- Hot reload: <2s
- Type resolution: instant

**Operations:**
- Deployment frequency: Multiple per day
- Rollback time: <5 minutes
- Mean time to detection: <1 minute

---

## Post-Migration Actions

### 1. Monitor for 2 Weeks

- Check error rates daily
- Monitor performance metrics
- Watch for edge cases
- Collect developer feedback

### 2. Update Team Documentation

- Update README with new patterns
- Update CONTRIBUTING.md
- Create video walkthrough
- Update onboarding docs

### 3. Share Learnings

- Write blog post about migration
- Present to team
- Document lessons learned
- Update this guide based on experience

### 4. Plan Future Improvements

- Consider additional optimizations
- Evaluate new MF features
- Plan for scale (more teams/modules)
- Continuous improvement

---

## Appendix

### Useful Commands

```bash
# Check all remotes health
node scripts/validate-deployment.js

# Analyze bundle size
ANALYZE=true npm run build --workspace=<name>

# Test error boundaries
# Stop a remote and navigate to it
./scripts/dev-all.sh stop hubs-tab

# Check type generation
ls -la shared-components/dist/@mf-types/

# Monitor remote loading
# Open DevTools Network tab, filter "mf-manifest"

# Clear all generated artifacts
npm run clean
rm -rf */@mf-types
rm -rf node_modules/.federation
```

### Quick Reference

| Task | Command |
|------|---------|
| Start all | `./scripts/dev-all.sh start` |
| Stop all | `./scripts/dev-all.sh stop` |
| Build all | `npm run build` |
| Type check | `npm run typecheck` |
| Validate deployment | `node scripts/validate-deployment.js` |
| Health dashboard | `http://localhost:3000/health` |
| Bundle analysis | `ANALYZE=true npm run build` |

---

## Conclusion

This migration plan provides a comprehensive, phased approach to modernizing your Module Federation implementation. Each phase is independently valuable and can be deployed to production, allowing for gradual adoption with minimal risk.

**Timeline Summary:**
- Phase 1: 3-5 days - **CRITICAL stability fixes**
- Phase 2: 1-2 weeks - Type safety improvements
- Phase 3: 1-2 weeks - Performance optimizations
- Phase 4: 1-2 weeks - Operational excellence

**Total:** 8-10 weeks for complete modernization

**Key Success Factors:**
1. Start with Phase 1 (critical stability)
2. Test thoroughly at each phase
3. Deploy each phase independently
4. Monitor metrics after each deployment
5. Collect feedback and iterate

With this plan, your Module Federation system will be production-ready, performant, and maintainable for a multi-team environment.

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-24
**Maintained By:** Platform Team
**Next Review:** After Phase 1 completion
