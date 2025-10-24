# Module Federation 2.0 Best Practices

**Comprehensive Reference Guide for Building Stable, Productive Multi-Team Environments**

Based on extensive research of:
- [module-federation/module-federation-examples](https://github.com/module-federation/module-federation-examples)
- [module-federation/core/apps](https://github.com/module-federation/core/tree/main/apps)
- Production implementations and patterns

**Last Updated:** 2025-10-24

---

## Table of Contents

1. [Introduction & Core Concepts](#1-introduction--core-concepts)
2. [React Integration Patterns](#2-react-integration-patterns)
3. [Runtime Loading & Configuration](#3-runtime-loading--configuration)
4. [Dependency Management](#4-dependency-management)
5. [TypeScript Integration](#5-typescript-integration)
6. [Webpack/Rspack Configuration](#6-webpackrspack-configuration)
7. [Error Handling & Resilience](#7-error-handling--resilience)
8. [Multi-Team Architecture Patterns](#8-multi-team-architecture-patterns)
9. [Performance Optimization](#9-performance-optimization)
10. [Build System & Scripts](#10-build-system--scripts)
11. [Production Deployment](#11-production-deployment)
12. [Testing Strategies](#12-testing-strategies)
13. [Common Pitfalls & Solutions](#13-common-pitfalls--solutions)

---

## 1. Introduction & Core Concepts

### What is Module Federation 2.0?

Module Federation is a Webpack 5+ feature (and Rspack) that enables multiple independently built and deployed JavaScript applications to share code at runtime. Version 2.0 introduces enhanced tooling, better type safety, and improved developer experience.

### Key Terminology

- **Host/Consumer**: Application that imports remote modules
- **Remote/Provider**: Application that exposes modules for consumption
- **Shell**: Top-level host application (often both consumer and provider)
- **Shared Dependencies**: Libraries shared between host and remotes (React, Redux, etc.)
- **Remote Entry**: Entry point file for a remote module (`remoteEntry.js` or `mf-manifest.json`)
- **Bootstrap**: Async initialization pattern for Module Federation apps

### Architecture Principles

1. **Async Boundaries**: All federation boundaries must be asynchronous
2. **Singleton Sharing**: Framework libraries (React, Redux) should be singletons
3. **Independent Deployability**: Each module can be built and deployed independently
4. **Type Safety**: TypeScript types should be distributed and consumed
5. **Graceful Degradation**: Apps should handle remote failures elegantly

---

## 2. React Integration Patterns

### 2.1 Bootstrap Pattern (Critical)

**The bootstrap pattern is THE most important pattern in Module Federation.** It ensures shared dependencies are initialized before your application code runs.

#### The Pattern

**File: `src/index.tsx`**
```tsx
// Async import creates the necessary boundary
import('./bootstrap');
```

**File: `src/bootstrap.tsx`**
```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### Why This Matters

Without the bootstrap pattern:
```
❌ Error: Shared module is not available for eager consumption
❌ Error: Cannot read property 'useState' of undefined
❌ Multiple React instances loaded
```

With the bootstrap pattern:
```
✅ Module Federation runtime initializes first
✅ Shared dependencies (React, Redux) load as singletons
✅ Application code runs with properly initialized environment
```

#### Reference Implementation

From `module-federation-examples/comprehensive-demo-react18/app-01/`:
```tsx
// src/index.jsx
import('./bootstrap');

// src/bootstrap.jsx
import App from './components/App';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './components/ErrorBoundary';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

**Reference:** `/Users/fkalinski/dev/poc/mf/module-federation-examples/comprehensive-demo-react18/app-01/src/index.jsx`

---

### 2.2 React 18 Best Practices

#### Use createRoot (Not Legacy ReactDOM.render)

```tsx
// ✅ CORRECT - React 18 Concurrent Mode
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root')!;
const root = createRoot(container);
root.render(<App />);

// ❌ AVOID - Legacy API
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));
```

#### Version Requirements

```json
{
  "dependencies": {
    "react": "18.3.1",           // Use exact version for consistency
    "react-dom": "18.3.1"
  }
}
```

**Why 18.3.1?**
- Concurrent rendering support
- Automatic batching for better performance
- Improved Suspense behavior
- Better error boundary support

---

### 2.3 Lazy Loading with React.lazy

#### Basic Pattern

```tsx
import React, { lazy, Suspense } from 'react';

// Lazy load a remote component
const RemoteButton = lazy(() => import('remote_app/Button'));

function App() {
  return (
    <Suspense fallback={<div>Loading Button...</div>}>
      <RemoteButton />
    </Suspense>
  );
}
```

#### Advanced Pattern with Error Handling

```tsx
import React, { lazy, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';

const RemoteComponent = lazy(() =>
  import('remote_app/Component')
    .catch(err => {
      console.error('Failed to load remote component:', err);
      // Return a fallback component
      return { default: () => <div>Component unavailable</div> };
    })
);

function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <RemoteComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

#### Type-Safe Dynamic Imports

```tsx
// Type assertion pattern for Module Federation
const RemoteModule = lazy(() =>
  import('remote_app/Module').then(m => {
    const { Component } = m as unknown as {
      Component: React.ComponentType<Props>
    };
    return { default: Component };
  })
);
```

**Reference:** `/Users/fkalinski/dev/poc/mf/core/apps/react-ts-host/src/app/App.tsx`

---

### 2.4 Error Boundaries (Critical for Production)

#### Basic Error Boundary

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('Error caught by boundary:', error, errorInfo);

    // Report to error tracking service
    // reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '20px', border: '1px solid red' }}>
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
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

#### Usage Pattern

```tsx
// Wrap ALL federated modules with error boundaries
<ErrorBoundary fallback={<RemoteUnavailable />}>
  <Suspense fallback={<Loading />}>
    <RemoteComponent />
  </Suspense>
</ErrorBoundary>
```

**Reference:** `/Users/fkalinski/dev/poc/mf/module-federation-examples/error-boundary/app1/src/App.js`

---

### 2.5 Dynamic Remote Loading

#### useDynamicRemote Hook Pattern

```tsx
import { useState, useEffect } from 'react';

interface RemoteConfig {
  url: string;
  scope: string;
  module: string;
}

export function useDynamicRemote<T = any>({ url, scope, module }: RemoteConfig) {
  const [component, setComponent] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        // Load the remote entry
        await loadRemoteEntry(url, scope);

        // Get the container
        const container = (window as any)[scope];

        // Initialize the container
        await container.init(__webpack_share_scopes__.default);

        // Get the module
        const factory = await container.get(module);
        const Module = factory();

        setComponent(Module);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadComponent();
  }, [url, scope, module]);

  return { component, error, loading };
}

function loadRemoteEntry(url: string, scope: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any)[scope]) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
```

**Reference:** `/Users/fkalinski/dev/poc/mf/core/apps/react-ts-host/src/app/useDynamicRemote.tsx`

---

## 3. Runtime Loading & Configuration

### 3.1 Manifest vs RemoteEntry

Module Federation 2.0 supports two loading mechanisms:

#### Traditional RemoteEntry.js

```javascript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'my_app',
  filename: 'remoteEntry.js',  // Default
  exposes: {
    './Component': './src/Component'
  }
})

// Usage in host
remotes: {
  my_app: 'my_app@http://localhost:3001/remoteEntry.js'
}
```

**Characteristics:**
- ✅ Traditional, well-understood
- ✅ Works everywhere
- ❌ Larger initial bundle
- ❌ Less metadata

#### Manifest-based Loading (Recommended)

```javascript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'my_app',
  filename: 'remoteEntry.js',
  manifest: {
    fileName: 'mf-manifest.json',
    getPublicPath: () => 'auto'
  },
  exposes: {
    './Component': './src/Component'
  }
})

// Usage in host
remotes: {
  my_app: 'my_app@http://localhost:3001/mf-manifest.json'
}
```

**Characteristics:**
- ✅ Smaller initial bundle (JSON metadata)
- ✅ Rich metadata for introspection
- ✅ Better for dynamic discovery
- ✅ Supports version information
- ⚠️ Requires @module-federation/enhanced 0.6.0+

**Manifest Example:**
```json
{
  "name": "my_app",
  "version": "1.0.0",
  "metaData": {
    "name": "my_app",
    "publicPath": "http://localhost:3001/",
    "buildInfo": {
      "buildVersion": "1.0.0"
    }
  },
  "remoteEntry": {
    "name": "remoteEntry.js",
    "type": "global"
  },
  "exposes": {
    "./Component": {
      "id": "./src/Component.tsx",
      "name": "Component",
      "assets": {
        "js": ["__federation_expose_Component.js"]
      }
    }
  }
}
```

**Reference:** `/Users/fkalinski/dev/poc/mf/core/apps/manifest-demo/webpack-host/webpack.config.js`

---

### 3.2 Runtime Plugin Pattern

The `@module-federation/runtime` package provides advanced runtime control.

#### Installation

```bash
npm install @module-federation/runtime
```

#### Basic Init Pattern

```tsx
// src/index.tsx
import { init } from '@module-federation/runtime';

init({
  name: 'host_app',
  remotes: [
    {
      name: 'remote_app',
      alias: 'myRemote',  // Optional: use different name in code
      entry: 'http://localhost:3002/mf-manifest.json',
    },
  ],
});

// Now import bootstrap
import('./bootstrap');
```

#### Advanced Runtime Plugin

```typescript
// src/runtimePlugin.ts
import type { FederationRuntimePlugin } from '@module-federation/runtime/types';

const customPlugin = (): FederationRuntimePlugin => ({
  name: 'custom-plugin',

  // Before runtime initialization
  beforeInit(args) {
    console.log('Federation runtime initializing:', args);
    return args;
  },

  // Intercept remote requests
  beforeRequest(args) {
    console.log('Loading remote:', args.id);

    // Can modify URL dynamically
    if (args.id === 'remote_app') {
      args.options.entry = getRemoteUrl(); // Dynamic URL
    }

    return args;
  },

  // After module resolution
  afterResolve(args) {
    console.log('Resolved module:', args);
    return args;
  },

  // On module load
  onLoad(args) {
    console.log('Module loaded:', args);
    return args;
  },

  // Handle load errors
  errorLoadRemote(args) {
    console.error('Failed to load remote:', args);

    // Return fallback module
    return {
      default: () => '<div>Remote unavailable</div>',
    };
  },

  // Custom shared module loading
  async loadShare(args) {
    const { pkgName, shareInfo, shared } = args;

    // Custom logic for loading shared dependencies
    return shared[pkgName];
  },
});

export default customPlugin;
```

#### Using Runtime Plugins

```tsx
// src/index.tsx
import { init } from '@module-federation/runtime';
import customPlugin from './runtimePlugin';

init({
  name: 'host_app',
  remotes: [
    {
      name: 'remote_app',
      entry: 'http://localhost:3002/mf-manifest.json',
    },
  ],
  plugins: [customPlugin()],
});

import('./bootstrap');
```

**Benefits:**
- Dynamic remote URL resolution
- Centralized error handling
- A/B testing remote versions
- Environment-based configuration
- Custom caching strategies

**Reference:** `/Users/fkalinski/dev/poc/mf/core/apps/runtime-demo/3005-runtime-host/src/runtimePlugin.ts`

---

### 3.3 LoadRemote and PreloadRemote APIs

#### loadRemote - Dynamic Module Loading

```tsx
import { loadRemote } from '@module-federation/runtime';
import React, { useEffect, useState } from 'react';

function DynamicComponent() {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    loadRemote<{ default: React.ComponentType }>('remote_app/Button')
      .then(module => {
        setComponent(() => module.default);
      })
      .catch(err => {
        console.error('Failed to load remote:', err);
      });
  }, []);

  if (!Component) return <div>Loading...</div>;
  return <Component />;
}
```

#### preloadRemote - Performance Optimization

```tsx
import { preloadRemote } from '@module-federation/runtime';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Preload critical remotes on app mount
    preloadRemote([
      {
        nameOrAlias: 'remote_app',
        resourceCategory: 'all', // 'all' | 'sync' | 'async'
      },
      {
        nameOrAlias: 'another_remote',
        resourceCategory: 'sync', // Only preload synchronous modules
      },
    ]).then(() => {
      console.log('Remotes preloaded');
    });
  }, []);

  return <div>App content</div>;
}
```

**Resource Categories:**
- `all`: Preload everything
- `sync`: Only synchronous chunks
- `async`: Only async chunks

**When to Use:**
- Preload on route change before navigation
- Preload on hover (predictive preloading)
- Preload critical remotes on app initialization
- Preload in service worker for offline support

**Reference:** `/Users/fkalinski/dev/poc/mf/core/apps/manifest-demo/webpack-host/src/Preload.tsx`

---

### 3.4 Environment-Based Remote URLs

#### Pattern for Dynamic URLs

```javascript
// webpack.config.js
function getRemoteEntry(name, port) {
  const { NODE_ENV } = process.env;
  const remoteUrlEnv = `REMOTE_${name.toUpperCase()}_URL`;

  if (process.env[remoteUrlEnv]) {
    return process.env[remoteUrlEnv];
  }

  if (NODE_ENV === 'production') {
    return `https://${name}.yourcdn.com/remoteEntry.js`;
  }

  return `http://localhost:${port}/remoteEntry.js`;
}

new ModuleFederationPlugin({
  remotes: {
    remote_app: `remote_app@${getRemoteEntry('remote_app', 3002)}`,
    another_app: `another_app@${getRemoteEntry('another_app', 3003)}`,
  },
})
```

#### Runtime Configuration File

**public/env-config.json:**
```json
{
  "remotes": {
    "remote_app": "https://remote-app-prod.yourcdn.com/remoteEntry.js",
    "another_app": "https://another-app-staging.yourcdn.com/remoteEntry.js"
  }
}
```

**Loading configuration at runtime:**
```tsx
// src/index.tsx
import { init } from '@module-federation/runtime';

async function loadConfig() {
  const response = await fetch('/env-config.json');
  const config = await response.json();

  init({
    name: 'host_app',
    remotes: Object.entries(config.remotes).map(([name, entry]) => ({
      name,
      entry: entry as string,
    })),
  });

  import('./bootstrap');
}

loadConfig().catch(console.error);
```

**Benefits:**
- Change remote URLs without rebuilding
- A/B testing different versions
- Canary deployments
- Blue/green deployments
- Environment-specific configuration

**Reference:** `/Users/fkalinski/dev/poc/mf/module-federation-examples/advanced-api/dynamic-remotes-runtime-environment-variables/`

---

## 4. Dependency Management

### 4.1 Singleton Pattern (Critical)

#### The Problem Without Singletons

```javascript
// ❌ BAD: No singleton configuration
shared: {
  react: {},
  'react-dom': {},
}
```

**Result:**
- Multiple React instances loaded
- Context doesn't work across boundaries
- Hooks fail with "Invalid hook call" errors
- Larger bundle sizes
- Runtime errors

#### The Solution: Singleton Sharing

```javascript
// ✅ GOOD: Singleton configuration
shared: {
  react: {
    singleton: true,
    requiredVersion: '^18.3.1',
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '^18.3.1',
  },
}
```

**Result:**
- ✅ Only ONE React instance across all remotes
- ✅ Context works seamlessly
- ✅ Hooks work correctly
- ✅ Smaller total bundle size

---

### 4.2 Share Strategy: loaded-first vs version-first

#### loaded-first (Recommended for Most Cases)

```javascript
new ModuleFederationPlugin({
  shareStrategy: 'loaded-first',
  shared: {
    react: { singleton: true, requiredVersion: '^18.3.1' },
  },
})
```

**Behavior:**
- First loaded version wins
- More predictable for users
- Host version takes precedence
- Simpler mental model

**Use When:**
- You control all remotes
- Versions are compatible
- Predictability is important

#### version-first (Semantic Versioning)

```javascript
new ModuleFederationPlugin({
  shareStrategy: 'version-first',
  shared: {
    react: { singleton: true, requiredVersion: '^18.3.1' },
  },
})
```

**Behavior:**
- Highest compatible version wins
- Follows semver rules
- Can override host version
- More complex resolution

**Use When:**
- Multiple teams with different versions
- Need latest compatible version
- Remotes may have newer versions

**Reference:** `/Users/fkalinski/dev/poc/mf/core/apps/runtime-demo/3005-runtime-host/webpack.config.js`

---

### 4.3 Eager Loading in Hosts

#### The Problem: Race Conditions

```javascript
// ❌ PROBLEMATIC: No eager loading
shared: {
  react: { singleton: true },
  'react-dom': { singleton: true },
}
```

**Can cause:**
- "Shared module not available for eager consumption"
- Race conditions between host and remote initialization
- Unpredictable load order

#### The Solution: Eager in Hosts

```javascript
// ✅ HOST CONFIGURATION
shared: {
  react: {
    singleton: true,
    eager: true,  // Load immediately in host
    requiredVersion: '^18.3.1',
  },
  'react-dom': {
    singleton: true,
    eager: true,  // Load immediately in host
    requiredVersion: '^18.3.1',
  },
}

// ✅ REMOTE CONFIGURATION (no eager)
shared: {
  react: {
    singleton: true,
    eager: false,  // or omit - will use host's version
    requiredVersion: '^18.3.1',
  },
  'react-dom': {
    singleton: true,
    eager: false,
    requiredVersion: '^18.3.1',
  },
}
```

**Rule of Thumb:**
- **Hosts:** `eager: true` for framework libraries
- **Remotes:** `eager: false` or omit (use host's version)

**Reference:** `/Users/fkalinski/dev/poc/mf/module-federation-examples/native-federation-tests-typescript-plugins/host/webpack.config.js`

---

### 4.4 StrictVersion Configuration

#### Strict Version Matching

```javascript
shared: {
  react: {
    singleton: true,
    strictVersion: true,  // Enforce exact version match
    requiredVersion: '18.3.1',  // No caret - exact version
  },
}
```

**Use When:**
- Breaking changes between versions
- Need guaranteed compatibility
- Single team controls all modules

#### Flexible Version Matching (Recommended)

```javascript
shared: {
  react: {
    singleton: true,
    strictVersion: false,  // Allow compatible versions
    requiredVersion: '^18.3.1',  // Semver range
  },
}
```

**Use When:**
- Multi-team environment
- Independent deployment cycles
- Backward-compatible versions

---

### 4.5 Sub-path Sharing

```javascript
shared: {
  // Main package
  'react': {
    singleton: true,
    requiredVersion: '^18.3.1',
  },
  // Also share sub-paths
  'react/': {
    singleton: true,
    requiredVersion: '^18.3.1',
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '^18.3.1',
  },
  'react-dom/': {
    singleton: true,
    requiredVersion: '^18.3.1',
  },
}
```

**Why This Matters:**
- Handles imports like `react/jsx-runtime`
- Prevents version mismatches on internals
- Required for React 18 JSX transform
- Prevents duplicate React code

**Reference:** `/Users/fkalinski/dev/poc/mf/core/apps/runtime-demo/3005-runtime-host/webpack.config.js`

---

### 4.6 Library-Specific Sharing Strategies

#### State Management Libraries (Redux, Zustand, etc.)

```javascript
shared: {
  '@reduxjs/toolkit': {
    singleton: true,  // MUST be singleton for shared state
    requiredVersion: '^2.0.0',
    eager: true,  // In host
  },
  'react-redux': {
    singleton: true,  // MUST be singleton
    requiredVersion: '^9.0.0',
    eager: true,  // In host
  },
}
```

#### UI Libraries (Material-UI, Ant Design, etc.)

```javascript
shared: {
  '@mui/material': {
    singleton: true,  // Theme sharing
    requiredVersion: '^5.14.0',
  },
  '@mui/icons-material': {
    singleton: true,
    requiredVersion: '^5.14.0',
  },
  'antd': {
    singleton: true,  // Theme and config sharing
    requiredVersion: '^5.0.0',
  },
}
```

#### GraphQL/Apollo

```javascript
shared: {
  '@apollo/client': {
    singleton: true,  // Share client instance
    requiredVersion: '^3.8.0',
  },
  'graphql': {
    singleton: true,  // Must match Apollo's peer dep
    requiredVersion: '^16.8.0',
  },
}
```

#### Routing Libraries

```javascript
shared: {
  'react-router-dom': {
    singleton: true,  // Share router state
    requiredVersion: '^6.20.0',
  },
}
```

---

### 4.7 Avoiding Over-Sharing

#### Don't Share Everything

```javascript
// ❌ BAD: Sharing too much
shared: {
  ...dependencies,  // Shares EVERYTHING from package.json
}

// ✅ GOOD: Selective sharing
shared: {
  react: { singleton: true },
  'react-dom': { singleton: true },
  '@reduxjs/toolkit': { singleton: true },
  'react-redux': { singleton: true },
  // Only share what needs to be shared
}
```

**Guidelines:**
- Share framework libraries (React, Vue, Angular)
- Share state management (Redux, MobX)
- Share UI libraries (if using same theme)
- Share routing (if coordinating navigation)
- DON'T share utility libraries (lodash, date-fns) unless necessary
- DON'T share business logic libraries (let each app bundle its own)

---

## 5. TypeScript Integration

### 5.1 Built-in DTS Plugin (Recommended Approach)

The `@module-federation/dts-plugin` provides automatic type generation and distribution.

#### Installation

```bash
npm install --save-dev @module-federation/dts-plugin
```

#### Remote Configuration (Type Producer)

```javascript
// webpack.config.js
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

new ModuleFederationPlugin({
  name: 'remote_app',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button',
    './Input': './src/components/Input',
  },
  shared: ['react', 'react-dom'],

  // DTS Plugin Configuration
  dts: {
    // Generate type definitions
    generateTypes: true,

    // Path to tsconfig
    tsConfigPath: './tsconfig.json',

    // Generate API types (runtime type info)
    generateAPITypes: true,

    // Additional options
    typesFolder: '@mf-types',  // Output folder (default)
    compilerOptions: {
      // Override tsconfig options if needed
      declaration: true,
      emitDeclarationOnly: true,
    },
  },
})
```

#### Host Configuration (Type Consumer)

```javascript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'host_app',
  remotes: {
    remote_app: 'remote_app@http://localhost:3002/remoteEntry.js',
  },
  shared: ['react', 'react-dom'],

  // DTS Plugin Configuration
  dts: {
    // Consume types from remotes
    consumeTypes: true,

    // Optional: specify type fetch behavior
    typesFolder: '@mf-types',
  },
})
```

#### TSConfig for Type Resolution

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,

    // Critical for Module Federation types
    "paths": {
      "*": ["./@mf-types/*"]
    },

    // Include generated types
    "typeRoots": ["./node_modules/@types", "./@mf-types"]
  },
  "include": [
    "src/**/*",
    "@mf-types/**/*"  // Include generated types
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

#### Generated Type Structure

After build, types are generated in `@mf-types` folder:

```
@mf-types/
└── remote_app/
    ├── index.d.ts
    ├── compiled-types/
    │   ├── Button.d.ts
    │   └── Input.d.ts
    └── apis.json  (if generateAPITypes: true)
```

**index.d.ts:**
```typescript
declare module 'remote_app/Button' {
  export interface ButtonProps {
    label: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
  }

  const Button: React.FC<ButtonProps>;
  export default Button;
}

declare module 'remote_app/Input' {
  export interface InputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }

  const Input: React.FC<InputProps>;
  export default Input;
}
```

#### Using Types in Host

```tsx
// TypeScript knows about these types automatically!
import Button from 'remote_app/Button';  // ✅ Typed
import Input from 'remote_app/Input';    // ✅ Typed

function App() {
  return (
    <div>
      {/* Full type checking and autocomplete */}
      <Button
        label="Click me"
        variant="primary"
        // onClick is optional but typed
        onClick={() => console.log('clicked')}
      />

      <Input
        value="test"
        onChange={(val) => console.log(val)}
        placeholder="Enter text"
      />
    </div>
  );
}
```

**Reference:** `/Users/fkalinski/dev/poc/mf/core/apps/react-ts-remote/webpack.config.js`

---

### 5.2 Type Distribution via CDN

For production environments, types should be hosted alongside the remote entry.

#### Build-time Type Packaging

```javascript
// scripts/package-types.js
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function packageTypes() {
  const typesDir = path.join(__dirname, '../@mf-types');
  const outputPath = path.join(__dirname, '../dist/@mf-types.zip');

  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(output);
  archive.directory(typesDir, '@mf-types');
  await archive.finalize();

  console.log('Types packaged:', outputPath);
}

packageTypes();
```

#### Package.json Scripts

```json
{
  "scripts": {
    "build": "webpack --mode production && npm run build:types",
    "build:types": "tsc --emitDeclarationOnly",
    "package:types": "node scripts/package-types.js",
    "build:prod": "npm run build && npm run package:types"
  }
}
```

#### CDN Structure

```
https://cdn.example.com/remote-app/v1.2.3/
├── remoteEntry.js
├── main.js
├── vendor.js
└── @mf-types.zip  ← Types package
```

#### Runtime Type Fetching (Host)

The DTS plugin can automatically fetch types from CDN:

```javascript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'host_app',
  remotes: {
    remote_app: 'remote_app@https://cdn.example.com/remote-app/v1.2.3/remoteEntry.js',
  },
  dts: {
    consumeTypes: true,
    // Plugin automatically looks for @mf-types.zip alongside remoteEntry.js
  },
})
```

---

### 5.3 Handling Type Assertion for Dynamic Imports

#### Pattern for Dynamic Remote Imports

```tsx
// Type assertion pattern
const RemoteComponent = React.lazy(() =>
  import('remote_app/Component').then(m => {
    const { Component } = m as unknown as {
      Component: React.ComponentType<ComponentProps>;
    };
    return { default: Component };
  })
);
```

**Why `as unknown as`?**
- Module Federation uses dynamic webpack imports
- TypeScript can't fully resolve types at compile time
- The `as unknown as` cast explicitly tells TypeScript the type
- It's a necessary pattern for federated modules

#### Typed Wrapper Utility

```typescript
// utils/loadRemote.ts
export function loadRemoteComponent<P = any>(
  modulePath: string
): Promise<React.ComponentType<P>> {
  return import(modulePath).then(m => {
    const module = m as any;
    return module.default || module;
  });
}

// Usage
const RemoteButton = React.lazy(() =>
  loadRemoteComponent<ButtonProps>('remote_app/Button')
);
```

---

### 5.4 Module Ambient Declarations

For modules without generated types, create ambient declarations:

```typescript
// src/types/remote-modules.d.ts
declare module 'remote_app/*' {
  const component: React.ComponentType<any>;
  export default component;
}

// Or more specific
declare module 'remote_app/Button' {
  export interface ButtonProps {
    label: string;
    onClick?: () => void;
  }

  const Button: React.FC<ButtonProps>;
  export default Button;
}
```

---

## 6. Webpack/Rspack Configuration

### 6.1 Plugin Selection: Enhanced vs Standard

#### @module-federation/enhanced (Recommended)

```javascript
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      // Enhanced features available
      dts: true,  // Type generation
      manifest: true,  // Manifest generation
      dataPrefetch: true,  // Data prefetching
      runtimePlugins: ['./runtimePlugin.ts'],  // Runtime plugins

      // Standard MF config
      name: 'my_app',
      filename: 'remoteEntry.js',
      exposes: {},
      remotes: {},
      shared: {},
    }),
  ],
};
```

**Enhanced Features:**
- ✅ Automatic type generation (DTS)
- ✅ Manifest generation
- ✅ Runtime plugins support
- ✅ Better error messages
- ✅ Development mode optimizations
- ✅ Better HMR support

#### Standard ModuleFederationPlugin

```javascript
const { ModuleFederationPlugin } = require('webpack').container;

// Only basic MF features
```

**When to Use Standard:**
- Webpack <5.90
- No TypeScript requirements
- Simple use case
- Existing legacy setup

---

### 6.2 Host Configuration Pattern

```javascript
// webpack.config.js (HOST APPLICATION)
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './src/index',  // Points to bootstrap import
  mode: isDevelopment ? 'development' : 'production',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    publicPath: 'auto',  // Critical for dynamic paths
    clean: true,  // Clean dist on each build
    uniqueName: 'host_app',  // Prevent global collisions
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  module: {
    rules: [
      // JavaScript/TypeScript
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [
                isDevelopment && 'react-refresh/babel',
              ].filter(Boolean),
            },
          },
        ],
      },

      // Important for Module Federation
      {
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
        },
      },

      // CSS
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'host_app',
      filename: 'remoteEntry.js',

      remotes: {
        remote_app: `remote_app@${getRemoteUrl('remote_app', 3002)}`,
        another_app: `another_app@${getRemoteUrl('another_app', 3003)}`,
      },

      shared: {
        react: {
          singleton: true,
          eager: true,  // Critical in host
          requiredVersion: '^18.3.1',
          strictVersion: false,
        },
        'react-dom': {
          singleton: true,
          eager: true,  // Critical in host
          requiredVersion: '^18.3.1',
          strictVersion: false,
        },
        'react/': {
          singleton: true,
          eager: true,
          requiredVersion: '^18.3.1',
        },
        'react-dom/': {
          singleton: true,
          eager: true,
          requiredVersion: '^18.3.1',
        },
        '@reduxjs/toolkit': {
          singleton: true,
          eager: true,
          requiredVersion: '^2.0.0',
        },
        'react-redux': {
          singleton: true,
          eager: true,
          requiredVersion: '^9.0.0',
        },
      },

      shareStrategy: 'loaded-first',

      dts: {
        consumeTypes: true,
      },
    }),

    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),

    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),

  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,

    // Critical for CORS
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
  },

  // Prevent watching generated types
  watchOptions: {
    ignored: ['**/node_modules/**', '**/@mf-types/**', '**/dist/**'],
  },

  optimization: {
    runtimeChunk: false,  // Important for MF
    minimize: !isDevelopment,
  },

  // Important for Rspack compatibility
  experiments: {
    outputModule: false,
  },
};

function getRemoteUrl(name, defaultPort) {
  const envVar = `REMOTE_${name.toUpperCase()}_URL`;
  if (process.env[envVar]) {
    return process.env[envVar];
  }

  if (isDevelopment) {
    return `http://localhost:${defaultPort}/remoteEntry.js`;
  }

  return `https://${name}.yourcdn.com/remoteEntry.js`;
}
```

**Reference:** `/Users/fkalinski/dev/poc/mf/module-federation-examples/comprehensive-demo-react18/app-01/webpack.config.js`

---

### 6.3 Remote Configuration Pattern

```javascript
// webpack.config.js (REMOTE APPLICATION)
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  entry: './src/index',  // Points to bootstrap import
  mode: isDevelopment ? 'development' : 'production',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: 'auto',  // Critical
    uniqueName: 'remote_app',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: { fullySpecified: false },
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      name: 'remote_app',
      filename: 'remoteEntry.js',

      // What this remote exposes
      exposes: {
        './Button': './src/components/Button',
        './Input': './src/components/Input',
        './utils': './src/utils',
      },

      // Can also consume other remotes
      remotes: {
        shared_lib: 'shared_lib@http://localhost:3001/remoteEntry.js',
      },

      shared: {
        react: {
          singleton: true,
          eager: false,  // NOT eager in remotes
          requiredVersion: '^18.3.1',
          strictVersion: false,
        },
        'react-dom': {
          singleton: true,
          eager: false,
          requiredVersion: '^18.3.1',
          strictVersion: false,
        },
        'react/': {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
        'react-dom/': {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
      },

      shareStrategy: 'loaded-first',

      dts: {
        generateTypes: true,
        generateAPITypes: true,
        tsConfigPath: './tsconfig.json',
      },

      manifest: {
        fileName: 'mf-manifest.json',
        getPublicPath: () => 'auto',
      },
    }),

    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],

  devServer: {
    port: 3002,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  watchOptions: {
    ignored: ['**/node_modules/**', '**/@mf-types/**'],
  },
};
```

---

### 6.4 Rspack Configuration

Rspack is 10x faster than Webpack with nearly identical API.

```javascript
// rspack.config.js
const rspack = require('@rspack/core');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');
const ReactRefreshPlugin = require('@rspack/plugin-react-refresh');

module.exports = {
  entry: './src/index',
  mode: 'development',

  output: {
    publicPath: 'auto',
    uniqueName: 'my_app',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              transform: { react: { runtime: 'automatic', refresh: true } },
            },
          },
        },
      },
    ],
  },

  plugins: [
    new ModuleFederationPlugin({
      // Same configuration as Webpack
      name: 'my_app',
      filename: 'remoteEntry.js',
      exposes: {},
      remotes: {},
      shared: {},
    }),

    new rspack.HtmlRspackPlugin({
      template: './public/index.html',
    }),

    new ReactRefreshPlugin(),
  ],

  devServer: {
    port: 3000,
    hot: true,
  },
};
```

**Package.json:**
```json
{
  "scripts": {
    "dev": "rspack serve",
    "build": "rspack build",
    "legacy:dev": "webpack serve",
    "legacy:build": "webpack build"
  },
  "devDependencies": {
    "@rspack/cli": "^1.4.0",
    "@rspack/core": "^1.4.0",
    "@module-federation/enhanced": "^0.17.0",
    "webpack": "^5.90.0",
    "webpack-cli": "^5.1.4"
  }
}
```

**Benefits:**
- 10x faster dev server startup
- 5x faster builds
- Lower memory usage
- Hot reload nearly instant
- Compatible with Webpack configs (easy migration)

**Reference:** `/Users/fkalinski/dev/poc/mf/module-federation-examples/comprehensive-demo-react18/app-01/package.json`

---

### 6.5 Critical Configuration Options

#### publicPath: 'auto' (Essential)

```javascript
output: {
  publicPath: 'auto',  // Detects path automatically
}
```

**Why:**
- Works in different environments (dev, staging, prod)
- Handles CDN deployments
- No hardcoded paths
- Essential for module federation

#### cache: false in Development

```javascript
cache: process.env.NODE_ENV === 'development' ? false : {
  type: 'filesystem',
  buildDependencies: {
    config: [__filename],
  },
},
```

**Why:**
- MF needs fresh module resolutions
- Cached modules can cause stale imports
- File system cache OK for production

#### uniqueName

```javascript
output: {
  uniqueName: 'my_app',  // Prevents global name collisions
}
```

**Why:**
- Multiple apps on same page
- Prevents webpack runtime collisions
- Required for nested remotes

#### CORS Headers (Development)

```javascript
devServer: {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
  },
}
```

**Why:**
- Remotes load from different origins
- Prevents CORS errors in development
- Production handles via CDN/proxy

---

## 7. Error Handling & Resilience

### 7.1 Comprehensive Error Boundary Pattern

```tsx
// ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report to error tracking service
    this.props.onError?.(error, errorInfo);

    // Could send to Sentry, DataDog, etc.
    if (typeof window !== 'undefined' && (window as any).trackError) {
      (window as any).trackError({
        error: error.toString(),
        errorInfo,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
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
            Something went wrong
          </h2>
          <details style={{ whiteSpace: 'pre-wrap', marginBottom: '10px' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '5px' }}>
              Error details
            </summary>
            <code style={{
              display: 'block',
              padding: '10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
            }}>
              {this.state.error.toString()}
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

---

### 7.2 Retry Logic for Remote Loading

```tsx
// utils/loadRemoteWithRetry.ts
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
          `Failed to load remote (attempt ${attempt + 1}/${maxRetries}). ` +
          `Retrying in ${waitTime}ms...`,
          error
        );

        onRetry?.(attempt + 1, lastError);

        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError!;
}
```

#### Usage with React.lazy

```tsx
const RemoteComponent = React.lazy(() =>
  loadRemoteWithRetry(
    () => import('remote_app/Component'),
    {
      maxRetries: 3,
      delay: 1000,
      backoff: true,
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt}:`, error.message);
      },
    }
  )
);
```

---

### 7.3 Health Check Pattern

```tsx
// utils/remoteHealthCheck.ts
interface RemoteHealth {
  name: string;
  url: string;
  available: boolean;
  latency?: number;
  error?: string;
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
    };
  } catch (error) {
    return {
      name: remoteName,
      url: remoteUrl,
      available: false,
      error: (error as Error).message,
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

#### Usage in App

```tsx
import { checkAllRemotes } from './utils/remoteHealthCheck';
import { useEffect, useState } from 'react';

function App() {
  const [remoteHealth, setRemoteHealth] = useState<RemoteHealth[]>([]);

  useEffect(() => {
    const remotes = {
      remote_app: 'http://localhost:3002/remoteEntry.js',
      another_app: 'http://localhost:3003/remoteEntry.js',
    };

    checkAllRemotes(remotes).then(health => {
      setRemoteHealth(health);

      const unavailable = health.filter(h => !h.available);
      if (unavailable.length > 0) {
        console.warn('Some remotes are unavailable:', unavailable);
      }
    });
  }, []);

  return (
    <div>
      <h1>App Status</h1>
      {remoteHealth.map(remote => (
        <div key={remote.name}>
          {remote.name}: {remote.available ? '✅' : '❌'}
          {remote.latency && ` (${remote.latency}ms)`}
          {remote.error && ` - ${remote.error}`}
        </div>
      ))}
    </div>
  );
}
```

---

### 7.4 Fallback Component Pattern

```tsx
// RemoteFallback.tsx
import React from 'react';

interface Props {
  remoteName: string;
  moduleName: string;
  error?: Error;
  onRetry?: () => void;
}

export function RemoteFallback({ remoteName, moduleName, error, onRetry }: Props) {
  return (
    <div style={{
      padding: '16px',
      margin: '16px 0',
      border: '1px dashed #ccc',
      borderRadius: '4px',
      backgroundColor: '#f9f9f9',
    }}>
      <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>
        Component Unavailable
      </h3>
      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#888' }}>
        {remoteName}/{moduleName}
      </p>
      {error && (
        <details style={{ fontSize: '12px', color: '#999' }}>
          <summary>Error details</summary>
          <pre style={{
            margin: '8px 0 0 0',
            padding: '8px',
            backgroundColor: '#f0f0f0',
            overflow: 'auto',
          }}>
            {error.message}
          </pre>
        </details>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: '8px',
            padding: '6px 12px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
```

#### Usage

```tsx
function App() {
  const [key, setKey] = useState(0);

  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <RemoteFallback
          remoteName="remote_app"
          moduleName="Component"
          error={error}
          onRetry={() => {
            reset();
            setKey(k => k + 1);  // Force remount
          }}
        />
      )}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <RemoteComponent key={key} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

### 7.5 Runtime Plugin for Error Handling

```typescript
// plugins/errorHandlingPlugin.ts
import type { FederationRuntimePlugin } from '@module-federation/runtime/types';

interface ErrorTracker {
  trackError: (error: Error, context: any) => void;
}

export function createErrorHandlingPlugin(
  errorTracker?: ErrorTracker
): FederationRuntimePlugin {
  return {
    name: 'error-handling-plugin',

    errorLoadRemote({ id, error, from, origin }) {
      console.error(`Failed to load remote "${id}":`, error);

      // Track error
      errorTracker?.trackError(error, { id, from, origin });

      // Return fallback module
      return {
        default: () => '<div>Module unavailable</div>',
      };
    },

    async beforeRequest(args) {
      const { id, options } = args;

      // Check if remote is healthy before loading
      try {
        const response = await fetch(options.entry, { method: 'HEAD' });
        if (!response.ok) {
          console.warn(`Remote "${id}" returned ${response.status}`);
        }
      } catch (error) {
        console.error(`Remote "${id}" is unreachable:`, error);
      }

      return args;
    },
  };
}
```

#### Usage

```tsx
// src/index.tsx
import { init } from '@module-federation/runtime';
import { createErrorHandlingPlugin } from './plugins/errorHandlingPlugin';

init({
  name: 'host_app',
  remotes: [
    {
      name: 'remote_app',
      entry: 'http://localhost:3002/mf-manifest.json',
    },
  ],
  plugins: [
    createErrorHandlingPlugin({
      trackError: (error, context) => {
        // Send to error tracking service
        console.log('Error tracked:', error, context);
      },
    }),
  ],
});

import('./bootstrap');
```

---

## 8. Multi-Team Architecture Patterns

### 8.1 Nested Remotes Pattern

A remote can also consume other remotes, enabling hierarchical team structures.

#### Team Structure Example

```
┌─────────────────┐
│  Top Shell      │  (Infra Team)
│  Port 3000      │
└────────┬────────┘
         │
    ┌────┴─────────────────┐
    │                      │
┌───▼────────┐    ┌───────▼──┐
│ Platform   │    │ Reports  │  (Feature Teams)
│ Shell      │    │ Tab      │
│ Port 3003  │    │ Port 3006│
└────┬───────┘    └──────────┘
     │
  ┌──┴──────────┐
  │             │
┌─▼──────┐  ┌──▼──────┐
│ Files  │  │ Hubs    │  (Sub-teams)
│ Tab    │  │ Tab     │
│ Port   │  │ Port    │
│ 3004   │  │ 3005    │
└────────┘  └─────────┘
```

#### Platform Shell Configuration (Middle Layer)

```javascript
// content-platform/shell/webpack.config.js
new ModuleFederationPlugin({
  name: 'platform_shell',
  filename: 'remoteEntry.js',

  // Exposes itself to top shell
  exposes: {
    './PlatformShell': './src/App',
  },

  // Consumes sub-modules
  remotes: {
    files_tab: 'files_tab@http://localhost:3004/remoteEntry.js',
    hubs_tab: 'hubs_tab@http://localhost:3005/remoteEntry.js',
  },

  shared: {
    react: { singleton: true, eager: false },  // NOT eager (not root)
    'react-dom': { singleton: true, eager: false },
  },
})
```

#### Benefits

- **Team Independence:** Each team owns their domain
- **Scalability:** Add new sub-teams without changing parent
- **Isolation:** Teams can develop independently
- **Reusability:** Platform Shell can be used by multiple top shells

**Reference:** `/Users/fkalinski/dev/poc/mf/core/apps/react-ts-nested-remote/webpack.config.js`

---

### 8.2 Shared Components Library Pattern

```javascript
// shared-components/webpack.config.js
new ModuleFederationPlugin({
  name: 'shared_components',
  filename: 'remoteEntry.js',

  // Expose granular components
  exposes: {
    './Button': './src/components/Button',
    './Input': './src/components/Input',
    './Table': './src/components/Table',
    './Theme': './src/theme/ThemeProvider',
    './hooks': './src/hooks',
    './utils': './src/utils',
  },

  // Don't consume other remotes (leaf node)
  remotes: {},

  shared: {
    react: { singleton: true, eager: false },
    'react-dom': { singleton: true, eager: false },
  },

  dts: {
    generateTypes: true,
    generateAPITypes: true,
  },
})
```

#### Consuming in Feature Teams

```tsx
// feature-team/src/App.tsx
import { Button } from 'shared_components/Button';
import { Input } from 'shared_components/Input';
import { ThemeProvider } from 'shared_components/Theme';

function App() {
  return (
    <ThemeProvider>
      <Button>Click me</Button>
      <Input placeholder="Type here" />
    </ThemeProvider>
  );
}
```

---

### 8.3 Shared State/Context Pattern

```javascript
// shared-state/webpack.config.js
new ModuleFederationPlugin({
  name: 'shared_state',
  filename: 'remoteEntry.js',

  exposes: {
    './store': './src/store',  // Redux store
    './context': './src/context',  // React Context
    './api': './src/api',  // API client
  },

  shared: {
    react: { singleton: true, eager: false },
    'react-dom': { singleton: true, eager: false },
    '@reduxjs/toolkit': { singleton: true, eager: false },
    'react-redux': { singleton: true, eager: false },
    '@apollo/client': { singleton: true, eager: false },
  },
})
```

#### Store Setup (Provider)

```tsx
// shared-state/src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import appReducer from './slices/appSlice';

export function createStore() {
  return configureStore({
    reducer: {
      user: userReducer,
      app: appReducer,
    },
  });
}

export type RootState = ReturnType<ReturnType<typeof createStore>['getState']>;
export type AppDispatch = ReturnType<typeof createStore>['dispatch'];
```

#### Using in Host

```tsx
// host/src/bootstrap.tsx
import { createStore } from 'shared_state/store';
import { Provider } from 'react-redux';

async function bootstrap() {
  const store = createStore();

  const root = createRoot(document.getElementById('root')!);
  root.render(
    <Provider store={store}>
      <App />
    </Provider>
  );
}

bootstrap();
```

#### Using in Remotes

```tsx
// remote/src/Component.tsx
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from 'shared_state/store';

function RemoteComponent() {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();

  return <div>User: {user.name}</div>;
}
```

---

### 8.4 Version Compatibility Strategy

#### Flexible Version Ranges

```javascript
shared: {
  react: {
    singleton: true,
    requiredVersion: '^18.0.0',  // Allow 18.x.x
    strictVersion: false,
  },
}
```

**Allows:**
- Team A uses React 18.2.0
- Team B uses React 18.3.1
- Both work together (loaded-first strategy uses Team A's version)

#### Strict Version for Breaking Changes

```javascript
shared: {
  '@company/core-lib': {
    singleton: true,
    requiredVersion: '3.2.1',  // Exact version
    strictVersion: true,  // Enforce exact match
  },
}
```

**Use When:**
- Internal library with breaking changes
- API contracts must match exactly
- Type safety requires exact version

#### Version Mismatch Handling

```javascript
shared: {
  'lodash': {
    singleton: false,  // Allow multiple versions
    requiredVersion: false,  // No version check
  },
}
```

**Use When:**
- Utility libraries without global state
- No version incompatibility risks
- Teams need different versions

---

### 8.5 Independent Deployment Strategy

#### Blue/Green Deployment Pattern

```javascript
// Runtime configuration for canary/blue-green
const remoteConfig = {
  production: {
    stable: 'https://remote-v1.cdn.com/remoteEntry.js',
    canary: 'https://remote-v2.cdn.com/remoteEntry.js',
  },
};

// A/B test or feature flag determines which version
const version = featureFlags.useCanary ? 'canary' : 'stable';

init({
  name: 'host',
  remotes: [
    {
      name: 'remote_app',
      entry: remoteConfig.production[version],
    },
  ],
});
```

#### Version Pinning in Host

```javascript
// Host controls which version of remote to use
new ModuleFederationPlugin({
  remotes: {
    // Pin to specific version
    remote_app: 'remote_app@https://cdn.com/remote-app/v1.2.3/remoteEntry.js',

    // Or use latest
    another_app: 'another_app@https://cdn.com/another-app/latest/remoteEntry.js',
  },
})
```

#### Deployment Independence

Each team can deploy independently as long as:

1. **Contracts are stable:** Exposed API doesn't change
2. **Types are published:** New types available before deployment
3. **Backward compatible:** New version works with old consumers
4. **Rollback plan:** Can quickly revert if issues arise

---

### 8.6 Team Ownership Matrix

| Team | Module | Port | Exposes | Consumes | Deploy Frequency |
|------|--------|------|---------|----------|------------------|
| **Platform** | top-shell | 3000 | - | All | Weekly |
| **Platform** | shared-components | 3001 | 15 components | - | Daily |
| **Platform** | shared-state | 3002 | Store, API | - | As needed |
| **Content** | content-shell | 3003 | ContentPlatform | shared-* | Weekly |
| **Content** | files-tab | 3004 | FilesPlugin | shared-* | Daily |
| **Content** | hubs-tab | 3005 | HubsPlugin | shared-* | Daily |
| **Analytics** | reports-tab | 3006 | ReportsApp | shared-* | Weekly |
| **Identity** | user-tab | 3007 | UserProfile | shared-* | As needed |

**Key Principles:**
- **Platform Team:** Owns infrastructure and shared libraries
- **Feature Teams:** Own domain-specific functionality
- **Deploy Independence:** Each team deploys on their own schedule
- **API Stability:** Shared libraries maintain backward compatibility

---

## 9. Performance Optimization

### 9.1 Manifest-Based Loading

Manifest loading is faster than traditional remoteEntry.js.

#### Benefits

```
Traditional remoteEntry.js:
├─ Download remoteEntry.js (20-50KB)
├─ Execute JavaScript
├─ Parse module definitions
└─ Start loading actual modules

Manifest-based (mf-manifest.json):
├─ Download manifest (2-5KB)  ← Much smaller
├─ Parse JSON (faster than JS)
└─ Start loading actual modules
```

**Performance Improvement:** 30-50% faster initial load

#### Configuration

```javascript
new ModuleFederationPlugin({
  name: 'my_app',
  filename: 'remoteEntry.js',
  manifest: {
    fileName: 'mf-manifest.json',
    getPublicPath: () => 'auto',
  },
})
```

**Reference:** `/Users/fkalinski/dev/poc/mf/core/apps/manifest-demo/webpack-host/webpack.config.js`

---

### 9.2 Preloading Critical Remotes

```tsx
import { preloadRemote } from '@module-federation/runtime';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Preload on app mount (non-blocking)
    preloadRemote([
      { nameOrAlias: 'critical_remote', resourceCategory: 'all' },
    ]);
  }, []);

  return <YourApp />;
}
```

#### Route-Based Preloading

```tsx
import { useNavigate, useLocation } from 'react-router-dom';
import { preloadRemote } from '@module-federation/runtime';

function Navigation() {
  const navigate = useNavigate();

  const handleNavigate = (path: string, remote: string) => {
    // Preload before navigation
    preloadRemote([{ nameOrAlias: remote, resourceCategory: 'all' }]);

    // Small delay allows preload to start
    setTimeout(() => navigate(path), 100);
  };

  return (
    <nav>
      <button onClick={() => handleNavigate('/reports', 'reports_remote')}>
        Reports
      </button>
    </nav>
  );
}
```

#### Hover-Based Preloading (Predictive)

```tsx
function NavigationLink({ to, remote, children }) {
  const handleMouseEnter = () => {
    preloadRemote([{ nameOrAlias: remote, resourceCategory: 'all' }]);
  };

  return (
    <Link to={to} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}
```

---

### 9.3 Code Splitting Within Remotes

```tsx
// remote/src/HeavyComponent.tsx
import { lazy } from 'react';

// Split heavy dependencies
const Chart = lazy(() => import('./Chart'));  // Heavy charting library
const Editor = lazy(() => import('./Editor'));  // Heavy editor library

export function HeavyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading chart...</div>}>
        <Chart />
      </Suspense>

      <Suspense fallback={<div>Loading editor...</div>}>
        <Editor />
      </Suspense>
    </div>
  );
}
```

**Benefits:**
- Smaller initial remote bundle
- Faster first paint
- Load heavy dependencies on demand

---

### 9.4 Shared Dependency Optimization

#### Bundle Analysis

```json
{
  "scripts": {
    "analyze": "webpack-bundle-analyzer dist/stats.json"
  }
}
```

```javascript
// webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

plugins: [
  process.env.ANALYZE && new BundleAnalyzerPlugin(),
].filter(Boolean),
```

#### Optimize Shared Config

```javascript
shared: {
  // Share only what's necessary
  react: { singleton: true, eager: true },
  'react-dom': { singleton: true, eager: true },

  // Don't share utilities (let each bundle)
  // lodash: {},  // Remove this

  // Share UI libraries if using same theme
  '@mui/material': { singleton: true },

  // Don't share if versions differ significantly
  // 'some-lib': {},  // Remove if incompatible versions
}
```

---

### 9.5 Caching Strategies

#### Long-Term Caching

```javascript
output: {
  filename: '[name].[contenthash].js',
  chunkFilename: '[name].[contenthash].chunk.js',
}
```

#### Immutable Remote Entries

```javascript
// For production, use versioned URLs
remotes: {
  remote_app: 'remote_app@https://cdn.com/remote-app/v1.2.3/remoteEntry.js',
}
```

**Benefits:**
- CDN can cache aggressively
- No cache invalidation needed
- Rollback by changing version
- A/B testing different versions

#### Service Worker Caching

```javascript
// sw.js
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache remote entries aggressively
  if (url.pathname.includes('remoteEntry.js')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open('mf-remotes').then(cache => {
            cache.put(event.request, clone);
          });
          return response;
        });
      })
    );
  }
});
```

---

## 10. Build System & Scripts

### 10.1 Recommended Package.json Scripts

#### Host Application

```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "build:dev": "webpack --mode development",
    "analyze": "ANALYZE=true npm run build",
    "clean": "rimraf dist @mf-types",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "jest",
    "test:e2e": "playwright test"
  }
}
```

#### Remote Application

```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "npm run build:app && npm run build:types",
    "build:app": "webpack --mode production",
    "build:types": "tsc --emitDeclarationOnly --declaration --declarationDir dist/types",
    "build:prod": "npm run build && npm run package:types",
    "package:types": "node scripts/package-types.js",
    "serve": "serve dist -p 3002",
    "clean": "rimraf dist @mf-types node_modules/.federation"
  }
}
```

---

### 10.2 Development Orchestration

#### Using Turborepo (Recommended)

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "build:types": {
      "outputs": ["dist/types/**", "@mf-types/**"]
    }
  }
}
```

```json
// package.json (root)
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "clean": "turbo run clean"
  }
}
```

#### Using Concurrently

```json
{
  "scripts": {
    "dev:shared-components": "cd shared-components && npm run dev",
    "dev:shared-data": "cd shared-data && npm run dev",
    "dev:content-shell": "cd content-platform/shell && npm run dev",
    "dev:top-shell": "cd top-level-shell && npm run dev",
    "dev": "concurrently npm:dev:*"
  }
}
```

#### Custom Shell Script

```bash
#!/bin/bash
# scripts/dev-all.sh

services=(
  "shared-components:3001"
  "shared-data:3002"
  "content-shell:3003"
  "files-tab:3004"
  "hubs-tab:3005"
  "reports-tab:3006"
  "user-tab:3007"
  "top-shell:3000"
)

for service in "${services[@]}"; do
  IFS=':' read -r name port <<< "$service"
  echo "Starting $name on port $port..."
  (cd "$name" && npm run dev) &
  sleep 2  # Stagger startup
done

wait
```

**Reference:** `/Users/fkalinski/dev/fkalinski/modular-react/scripts/dev-all.sh`

---

### 10.3 Type Generation Pipeline

#### Step 1: Generate Types (Remote)

```bash
npm run build:types
# Output: dist/types/**/*.d.ts
```

#### Step 2: Package Types (Remote)

```javascript
// scripts/package-types.js
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const typesDir = path.join(__dirname, '../@mf-types');
const outputPath = path.join(__dirname, '../dist/@mf-types.zip');

const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', { zlib: { level: 9 } });

archive.pipe(output);
archive.directory(typesDir, '@mf-types');
archive.finalize();
```

#### Step 3: Fetch Types (Host)

```javascript
// scripts/fetch-types.js
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');

async function fetchTypes() {
  const remotes = [
    { name: 'shared_components', path: '../shared-components/dist/@mf-types.zip' },
    { name: 'shared_data', path: '../shared-data/dist/@mf-types.zip' },
  ];

  for (const remote of remotes) {
    const zipPath = path.resolve(__dirname, remote.path);
    const outputDir = path.join(__dirname, '../@mf-types');

    if (fs.existsSync(zipPath)) {
      await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: outputDir }))
        .promise();

      console.log(`Extracted types for ${remote.name}`);
    }
  }
}

fetchTypes();
```

#### Step 4: Pre-build Hook

```json
{
  "scripts": {
    "prebuild": "npm run fetch:types",
    "build": "webpack --mode production"
  }
}
```

---

## 11. Production Deployment

### 11.1 Environment Configuration

#### Development

```javascript
// webpack.config.js
const isDevelopment = process.env.NODE_ENV !== 'production';

remotes: {
  remote_app: `remote_app@${
    isDevelopment
      ? 'http://localhost:3002/remoteEntry.js'
      : process.env.REMOTE_APP_URL || 'https://remote-app.cdn.com/remoteEntry.js'
  }`,
}
```

#### Staging

```env
# .env.staging
REMOTE_APP_URL=https://remote-app-staging.cdn.com/remoteEntry.js
REMOTE_ANOTHER_URL=https://another-app-staging.cdn.com/remoteEntry.js
```

#### Production

```env
# .env.production
REMOTE_APP_URL=https://remote-app.cdn.com/v1.2.3/remoteEntry.js
REMOTE_ANOTHER_URL=https://another-app.cdn.com/v2.1.0/remoteEntry.js
```

---

### 11.2 CDN Deployment Strategy

#### Versioned URLs (Recommended)

```
https://cdn.example.com/
├── remote-app/
│   ├── v1.2.3/
│   │   ├── remoteEntry.js
│   │   ├── main.js
│   │   ├── vendor.js
│   │   └── @mf-types.zip
│   ├── v1.2.2/  (previous version)
│   └── latest/  (symlink to v1.2.3)
└── another-app/
    └── ...
```

**Benefits:**
- Immutable URLs (aggressive caching)
- Easy rollback (change version in host)
- A/B testing (different versions simultaneously)
- Blue/green deployments

#### Deployment Script

```bash
#!/bin/bash
# deploy.sh

VERSION=$(node -p "require('./package.json').version")
APP_NAME=$(node -p "require('./package.json').name")
CDN_PATH="s3://cdn-bucket/${APP_NAME}/${VERSION}/"

# Build
npm run build:prod

# Upload to CDN
aws s3 sync dist/ "${CDN_PATH}" \
  --cache-control "public, max-age=31536000, immutable"

# Update "latest" symlink
aws s3 sync dist/ "s3://cdn-bucket/${APP_NAME}/latest/" \
  --cache-control "public, max-age=300"

echo "Deployed ${APP_NAME} v${VERSION} to ${CDN_PATH}"
```

---

### 11.3 Health Checks & Monitoring

#### Health Check Endpoint

```javascript
// server.js (if using custom server)
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    remoteEntry: '/remoteEntry.js',
  };

  res.json(health);
});
```

#### Remote Monitoring

```tsx
// utils/monitoring.ts
export function trackRemoteLoad(remoteName: string, success: boolean, duration: number) {
  // Send to monitoring service (DataDog, New Relic, etc.)
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track('Remote Load', {
      remoteName,
      success,
      duration,
      timestamp: Date.now(),
    });
  }
}

// Usage in runtime plugin
const monitoringPlugin = (): FederationRuntimePlugin => ({
  name: 'monitoring-plugin',

  beforeRequest(args) {
    const startTime = Date.now();
    (args as any).__startTime = startTime;
    return args;
  },

  onLoad(args) {
    const duration = Date.now() - (args as any).__startTime;
    trackRemoteLoad(args.id, true, duration);
    return args;
  },

  errorLoadRemote(args) {
    const duration = Date.now() - (args as any).__startTime;
    trackRemoteLoad(args.id, false, duration);
    throw args.error;
  },
});
```

---

### 11.4 Error Tracking

#### Sentry Integration

```tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});

// Error boundary with Sentry
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        'module-federation': 'true',
      },
    });
  }
}
```

---

## 12. Testing Strategies

### 12.1 Unit Testing Remotes

```tsx
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button label="Click" onClick={handleClick} />);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

### 12.2 Integration Testing with Mocked Remotes

```tsx
// App.test.tsx
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the remote module
jest.mock('remote_app/Button', () => ({
  default: ({ label }: { label: string }) => <button>{label}</button>,
}));

describe('App with remote', () => {
  it('renders with mocked remote', () => {
    render(<App />);
    expect(screen.getByText('Remote Button')).toBeInTheDocument();
  });
});
```

---

### 12.3 E2E Testing with Playwright

```typescript
// e2e/federation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Module Federation', () => {
  test('loads host and remotes', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for host to load
    await expect(page.locator('h1')).toContainText('Host App');

    // Navigate to remote route
    await page.click('text=Remote Tab');

    // Wait for remote to load
    await expect(page.locator('[data-testid="remote-component"]')).toBeVisible();
  });

  test('handles remote loading errors', async ({ page }) => {
    // Mock network to simulate remote failure
    await page.route('**/remoteEntry.js', route => route.abort());

    await page.goto('http://localhost:3000/remote');

    // Should show error boundary
    await expect(page.locator('text=Something went wrong')).toBeVisible();
  });
});
```

---

## 13. Common Pitfalls & Solutions

### 13.1 "Shared module is not available for eager consumption"

**Cause:** Missing bootstrap pattern or incorrect eager configuration

**Solution:**
```tsx
// ✅ CORRECT
// src/index.tsx
import('./bootstrap');

// src/bootstrap.tsx
// ... your React app
```

```javascript
// Host webpack.config.js
shared: {
  react: { singleton: true, eager: true },  // ← eager: true in host
}

// Remote webpack.config.js
shared: {
  react: { singleton: true, eager: false },  // ← NOT eager in remote
}
```

---

### 13.2 Multiple React Instances

**Symptom:** "Invalid hook call" errors

**Cause:** React not configured as singleton

**Solution:**
```javascript
shared: {
  react: { singleton: true },  // ← CRITICAL
  'react-dom': { singleton: true },  // ← CRITICAL
  'react/': { singleton: true },  // ← Also share sub-paths
  'react-dom/': { singleton: true },
}
```

---

### 13.3 CORS Errors in Development

**Symptom:** "Access-Control-Allow-Origin" errors

**Solution:**
```javascript
devServer: {
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
}
```

---

### 13.4 Type Not Found

**Symptom:** TypeScript can't find remote module types

**Solution:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "*": ["./@mf-types/*"]  // ← Type resolution
    }
  },
  "include": [
    "src/**/*",
    "@mf-types/**/*"  // ← Include generated types
  ]
}
```

---

### 13.5 Infinite Rebuild Loop

**Symptom:** Webpack rebuilds continuously

**Solution:**
```javascript
watchOptions: {
  ignored: [
    '**/node_modules/**',
    '**/@mf-types/**',  // ← Ignore generated types
    '**/dist/**',
  ],
}
```

---

## Conclusion

This comprehensive guide covers all aspects of building a production-ready Module Federation 2.0 system for multi-team environments. Key takeaways:

1. **Always use the bootstrap pattern** - Non-negotiable for MF
2. **Configure singletons correctly** - Framework libraries must be singletons
3. **Use eager: true in hosts only** - Prevents race conditions
4. **Implement error boundaries** - Graceful degradation is critical
5. **Use @module-federation/enhanced** - Better DX and features
6. **Manifest over remoteEntry** - Better performance
7. **Type distribution is essential** - Teams need type safety
8. **Test resilience, not just happy paths** - Remotes can fail
9. **Monitor in production** - Track loading performance and errors
10. **Version carefully** - Independent deployments require discipline

With these patterns, your multi-team Module Federation architecture will be stable, performant, and maintainable.

---

## References

- [Module Federation Examples](https://github.com/module-federation/module-federation-examples)
- [Module Federation Core](https://github.com/module-federation/core)
- [@module-federation/enhanced Documentation](https://module-federation.io/)
- Research based on:
  - `/Users/fkalinski/dev/poc/mf/module-federation-examples/`
  - `/Users/fkalinski/dev/poc/mf/core/apps/`
  - `/Users/fkalinski/dev/fkalinski/modular-react/`

**Document Version:** 1.0.0
**Last Updated:** 2025-10-24
