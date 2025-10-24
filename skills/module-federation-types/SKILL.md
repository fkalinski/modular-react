---
name: module-federation-types
description: Guide for handling TypeScript types in Module Federation, including type generation, sharing types across federated modules, and troubleshooting type-related issues.
---

# Module Federation Types

This skill helps you work with TypeScript types in Module Federation 2.0, including type generation, sharing, and troubleshooting.

## When to Use This Skill

Use this skill when you need to:
- Generate TypeScript types for federated modules
- Share types across remote modules
- Understand Module Federation type strategies
- Troubleshoot type errors in federated code
- Configure webpack for type generation
- Handle type synchronization issues

## Understanding Types in Module Federation

Module Federation loads modules at **runtime**, not at build time. This creates challenges for TypeScript:

### The Challenge

```typescript
// Consumer wants to import from remote:
import { Button } from 'shared_components/Button';
//                      ^^^^^^^^^^^^^^^^^^
// TypeScript has no idea what this is at compile time!
```

### The Solutions

1. **Manual type definitions** - Create `.d.ts` files manually
2. **Type generation** - Auto-generate types from exposed modules
3. **Shared contracts** - Define interfaces in shared packages
4. **Type stubs** - Minimal type declarations for federated modules

## Type Generation with DTS Plugin

### Configuration

In webpack.config.js, Module Federation plugin can generate types:

```javascript
new ModuleFederationPlugin({
  name: 'shared_components',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button',
    './Table': './src/components/Table',
  },
  dts: {
    generateTypes: true, // Generate .d.ts files
    outDir: './dist/@types',
  }
})
```

### Disabling Type Generation

**For Vercel deployment**, disable type generation to avoid build issues:

```javascript
new ModuleFederationPlugin({
  name: 'shared_components',
  // ... other config
  dts: false, // ✅ Recommended for production builds
})
```

**Why disable?**
- Type generation can be slow
- May cause EPIPE errors in CI/CD
- Not needed at runtime (only for development)
- Types can be versioned separately

## Type Sharing Strategies

### Strategy 1: Inlined Types (Current Approach)

Each module contains its own type definitions:

**Example: Tab Contract**

Instead of:
```typescript
// ❌ External dependency
import type { TabPlugin } from '@content-platform/tab-contract';
```

Use:
```typescript
// ✅ Inlined types
// In files-folders/src/types.ts
export interface TabPlugin {
  config: TabConfig;
  component: React.ComponentType<TabProps>;
  // ... rest of interface
}
```

**Advantages:**
- No external dependencies
- Works in any environment
- Self-contained modules
- Simple deployment

**Disadvantages:**
- Type duplication
- Manual synchronization needed
- No single source of truth

### Strategy 2: Shared Type Package

Create a shared types package published to npm/Artifactory:

```bash
# Package: @platform/types
npm install @platform/types

# In consumer:
import type { TabPlugin } from '@platform/types';
```

**Advantages:**
- Single source of truth
- Versioned types
- IDE autocomplete works perfectly

**Disadvantages:**
- Requires publishing to registry
- Deploy dependency
- Version management overhead

### Strategy 3: Type Stubs

Minimal type declarations for federated remotes:

```typescript
// In consumer's types/remotes.d.ts
declare module 'shared_components/Button' {
  const Button: React.ComponentType<ButtonProps>;
  export default Button;
}

declare module 'shared_components/Table' {
  const Table: React.ComponentType<TableProps>;
  export default Table;
}
```

**Advantages:**
- No external dependencies
- Works immediately
- Good for simple imports

**Disadvantages:**
- Manual maintenance
- Prone to drift
- No prop validation

## Webpack Configuration for Types

### Exposed Module Types

When exposing modules, ensure TypeScript can find types:

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
}
```

### Consumer Module Types

When consuming remotes, add type declarations:

```typescript
// In consumer's src/types/remotes.d.ts
declare module 'shared_components/Button' {
  export { Button } from '@shared/components';
}
```

Or use path aliases:

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "shared_components/*": ["./types/shared-components/*"]
    }
  }
}
```

## Common Type Patterns

### Pattern 1: Shared Interface

Define interfaces that both provider and consumer use:

```typescript
// In shared types or inlined
export interface TabConfig {
  id: string;
  name: string;
  version: string;
}

export interface TabPlugin {
  config: TabConfig;
  component: React.ComponentType<TabProps>;
}

// Provider implements
const plugin: TabPlugin = {
  config: { id: 'files', name: 'Files', version: '1.0.0' },
  component: FilesTabComponent,
};

// Consumer uses
import type { TabPlugin } from './types';
const tab = await import('files_tab/Plugin') as TabPlugin;
```

### Pattern 2: Generic Props

Use generic types for flexible component props:

```typescript
// In shared-components
export interface TableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}

export function Table<T>(props: TableProps<T>) {
  // Implementation
}

// Consumer uses with specific type
import { Table } from 'shared_components/Table';

interface FileItem {
  id: string;
  name: string;
}

<Table<FileItem> data={files} columns={columns} />
```

### Pattern 3: Type-Safe Context

Share context types across federated boundaries:

```typescript
// Inlined or shared
export interface PlatformContext {
  filters: FilterState;
  selection: SelectionState;
  dispatch: (action: Action) => void;
}

// Provider
const context: PlatformContext = { /* ... */ };

// Consumer
import type { PlatformContext } from './types';
const context = useContext<PlatformContext>(PlatformContext);
```

## Type Generation Scripts

### Generating Types for Exposed Modules

```bash
# If using DTS plugin
npm run build

# Types generated to dist/@types/
```

### Manual Type Generation

```bash
# Generate types with TypeScript compiler
npx tsc --declaration --emitDeclarationOnly --outDir dist/@types
```

### Copying Types to Consumers

```bash
# Copy generated types to consumer
cp -r shared-components/dist/@types/* top-level-shell/src/types/shared-components/
```

## Troubleshooting Type Issues

### Issue 1: "Cannot find module 'remote/Module'"

**Cause:** TypeScript doesn't know about federated remote

**Solution:** Add type stub:

```typescript
// In consumer's src/types/remotes.d.ts
declare module 'shared_components/Button' {
  import React from 'react';

  export interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
  }

  export const Button: React.FC<ButtonProps>;
}
```

### Issue 2: "Type 'unknown' is not assignable..."

**Cause:** Dynamic import loses type information

**Solution:** Use type assertion:

```typescript
// ❌ Type is unknown
const Button = await import('shared_components/Button');

// ✅ Type assertion
import type { ButtonComponent } from './types';
const { Button } = await import('shared_components/Button') as {
  Button: ButtonComponent
};
```

### Issue 3: "Module has no exported member"

**Cause:** Type definition doesn't match runtime export

**Solution:** Verify export in source:

```typescript
// In shared-components/src/Button.tsx
export const Button: React.FC<ButtonProps> = (props) => { /* ... */ };
//     ^^^^ Make sure it's exported

// Update type stub to match
declare module 'shared_components/Button' {
  export const Button: React.FC<ButtonProps>;
}
```

### Issue 4: Types Out of Sync

**Cause:** Remote module updated but types not regenerated

**Solution:**
```bash
# Rebuild remote to regenerate types
cd shared-components
npm run build

# Copy updated types to consumer (if using manual approach)
# Or update type package version
```

### Issue 5: DTS Plugin Build Errors

**Symptoms:**
```
Error: write EPIPE
Unable to compile federated types
```

**Solution:** Disable DTS plugin:

```javascript
// webpack.config.js
new ModuleFederationPlugin({
  // ...
  dts: false, // Disable type generation
})
```

## Development Workflow

### Adding Types for New Exposed Module

1. **Create the module:**
   ```typescript
   // shared-components/src/NewComponent.tsx
   export interface NewComponentProps { /* ... */ }
   export const NewComponent: React.FC<NewComponentProps> = (props) => { /* ... */ };
   ```

2. **Expose in webpack:**
   ```javascript
   exposes: {
     './NewComponent': './src/NewComponent',
   }
   ```

3. **Add type stub in consumer:**
   ```typescript
   // consumer/src/types/remotes.d.ts
   declare module 'shared_components/NewComponent' {
     export type { NewComponentProps } from '@shared/components';
     export { NewComponent } from '@shared/components';
   }
   ```

### Updating Types

1. **Update source component**
2. **Rebuild provider:** `cd shared-components && npm run build`
3. **Update type stubs in consumers**
4. **Rebuild consumers:** `npm run build`

## Best Practices

1. **Use inlined types for contracts** - No external dependencies
2. **Disable DTS plugin for production** - Faster builds, fewer errors
3. **Create manual type stubs** - Better control, less fragile
4. **Keep types in sync manually** - Use shared types file or copy definitions
5. **Document type contracts** - Clear interfaces for federated modules
6. **Version types with code** - Types match runtime behavior
7. **Test type safety** - Use TypeScript strict mode

## TypeScript Configuration

### Recommended tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "paths": {
      "shared_components/*": ["./src/types/shared-components/*"]
    }
  }
}
```

## Quick Reference

```bash
# Check TypeScript errors
npm run typecheck

# Build with type generation (if enabled)
npm run build

# Generate types manually
npx tsc --declaration --emitDeclarationOnly --outDir dist/@types

# Check specific module types
cd shared-components && npm run typecheck

# Verify types in dist
ls -la shared-components/dist/@types/
```

## Common Type Stubs Template

```typescript
// src/types/remotes.d.ts

// Shared Components Remote
declare module 'shared_components/Button' {
  export const Button: React.FC<ButtonProps>;
  export interface ButtonProps { /* ... */ }
}

declare module 'shared_components/Table' {
  export const Table: React.FC<TableProps>;
  export interface TableProps<T = any> { /* ... */ }
}

// Tab Plugin Remote
declare module 'files_tab/Plugin' {
  import type { TabPlugin } from './types';
  const plugin: TabPlugin;
  export default plugin;
}

// Shared Data Remote
declare module 'shared_data/store' {
  export const store: Store;
  export type { Store, StoreState };
}
```

## Related Skills

- **dev-workflow**: For building and running federated modules
- **npm-workspace**: For managing TypeScript dependencies
- **add-federated-tab**: For creating new federated tabs with proper types
- **add-shared-component**: For adding typed components to shared library

## References

- Module Federation Types: `docs/types/MODULE_FEDERATION_TYPES_SOLUTION.md`
- DTS Plugin Investigation: `docs/types/DTS_PLUGIN_INVESTIGATION.md`
- Cross-repo Types: `docs/types/CROSS_REPO_TYPES_IMPLEMENTATION.md`
- TypeScript Docs: https://www.typescriptlang.org/docs/handbook/modules.html
- Module Federation Docs: https://module-federation.io/
