# Module Federation Type Distribution System

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Implementation Guide](#implementation-guide)
3. [Type Patterns & Best Practices](#type-patterns--best-practices)
4. [Automation Strategy](#automation-strategy)
5. [Troubleshooting](#troubleshooting)
6. [Known Limitations](#known-limitations)

## Architecture Overview

### Producer-Consumer Model

The type distribution system follows a **producer-consumer model** where:

- **Producers** (e.g., `shared-components`, `shared-data`) generate and package TypeScript definitions
- **Consumers** (e.g., `content-platform/shell`, `top-level-shell`) fetch and use these definitions
- Types are distributed alongside the federated modules (via CDN or file system)

```
┌──────────────────┐         ┌────────────────────┐
│    Producer      │         │     Consumer       │
│  (shared-data)   │         │ (content-platform) │
├──────────────────┤         ├────────────────────┤
│                  │         │                    │
│ 1. Build code    │         │ 1. Fetch types     │
│ 2. Generate .d.ts│────────▶│    from producer   │
│ 3. Package types │ @mf-    │ 2. Merge into      │
│ 4. Zip & upload  │ types   │    local types     │
│                  │ .zip    │ 3. TypeScript      │
│                  │         │    IntelliSense ✓  │
└──────────────────┘         └────────────────────┘
```

### Build-Time Type Generation

Types are generated at **build time** using TypeScript's compiler:
- `tsc --emitDeclarationOnly --declaration` generates `.d.ts` files
- These are packaged into `@mf-types/index.d.ts`
- Zipped for distribution: `@mf-types.zip`

### Runtime Module Federation

At runtime, Module Federation:
- Loads JavaScript bundles dynamically
- Uses the type definitions for development/compile-time checking
- Types don't affect runtime behavior (they're stripped during transpilation)

## Implementation Guide

### For Producers (Federated Module Exporters)

#### Step 1: Add Type Generation Script

Create `scripts/package-types.js`:

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TYPES_DIR = path.join(__dirname, '../src');  // or '../dist/types'
const OUTPUT_DIR = path.join(__dirname, '../dist/@mf-types');
const OUTPUT_ZIP = path.join(__dirname, '../dist/@mf-types.zip');

// Match your webpack.config.js exposes
const EXPOSES = {
  './store': './src/store',
  './context': './src/context',
  // ... other exposed modules
};

function getModuleName(exposeName) {
  // Convert './store' to 'shared_data/store'
  return `shared_data${exposeName.replace('./', '/')}`;
}

function createModuleDeclaration(exposeName, sourcePath) {
  const typeFile = path.join(TYPES_DIR, sourcePath.replace('./src/', '') + '.d.ts');

  if (!fs.existsSync(typeFile)) {
    console.warn(`⚠️  Type file not found: ${typeFile}`);
    return null;
  }

  const typeContent = fs.readFileSync(typeFile, 'utf-8');
  const moduleName = getModuleName(exposeName);

  return `declare module '${moduleName}' {\n${typeContent}\n}\n`;
}

function main() {
  // Clean and create output directory
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Generate module declarations
  let indexContent = '// Module Federation Type Declarations\n\n';

  Object.entries(EXPOSES).forEach(([exposeName, sourcePath]) => {
    const declaration = createModuleDeclaration(exposeName, sourcePath);
    if (declaration) {
      indexContent += declaration + '\n';
      console.log(`✅ ${getModuleName(exposeName)}`);
    }
  });

  // Write and zip
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.d.ts'), indexContent);
  process.chdir(path.join(__dirname, '../dist'));
  execSync(`zip -r @mf-types.zip @mf-types`, { stdio: 'inherit' });

  console.log('✨ Types ready for CDN deployment!');
}

main();
```

#### Step 2: Update package.json

```json
{
  "scripts": {
    "build:types": "tsc --emitDeclarationOnly --declaration --declarationDir dist/types",
    "package:types": "node scripts/package-types.js",
    "build:prod": "webpack --mode production && npm run build:types && npm run package:types"
  }
}
```

#### Step 3: Build and Verify

```bash
npm run build:prod

# Verify output:
ls -la dist/@mf-types/
# Should contain: index.d.ts

ls -la dist/@mf-types.zip
# Ready for CDN upload
```

### For Consumers (Federated Module Importers)

#### Step 1: Create Type Fetching Script

Create `scripts/fetch-types.js`:

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Map remote names to local paths or CDN URLs
const REMOTES = {
  shared_components: '../shared-components/dist/@mf-types.zip',
  shared_data: '../shared-data/dist/@mf-types.zip',
  // In production, use CDN URLs:
  // shared_components: 'https://cdn.example.com/shared-components/@mf-types.zip',
};

const OUTPUT_DIR = path.join(__dirname, '../@mf-types');
const TYPES_FILE = path.join(__dirname, '../src/federated-types.d.ts');

function fetchAndExtract(remoteName, source) {
  const tempZip = path.join(OUTPUT_DIR, `${remoteName}.zip`);

  if (source.startsWith('http')) {
    // CDN fetch
    execSync(`curl -L -o ${tempZip} ${source}`, { stdio: 'inherit' });
  } else {
    // Local copy
    fs.copyFileSync(path.resolve(__dirname, source), tempZip);
  }

  // Extract
  execSync(`unzip -o ${tempZip} -d ${OUTPUT_DIR}`, { stdio: 'pipe' });
  fs.unlinkSync(tempZip);
}

function mergeTypeFiles() {
  const typesPath = path.join(OUTPUT_DIR, '@mf-types/index.d.ts');
  if (!fs.existsSync(typesPath)) return '';

  return fs.readFileSync(typesPath, 'utf-8');
}

function main() {
  // Clean output
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Fetch all remotes
  let mergedTypes = '// Federated Module Type Declarations\n\n';

  Object.entries(REMOTES).forEach(([name, source]) => {
    console.log(`📥 Fetching ${name}...`);
    fetchAndExtract(name, source);
    mergedTypes += mergeTypeFiles();
    console.log(`✅ ${name}`);
  });

  // Write merged types
  fs.writeFileSync(TYPES_FILE, mergedTypes);
  console.log(`\n✨ Types fetched and merged: ${TYPES_FILE}`);
}

main();
```

#### Step 2: Update package.json

```json
{
  "scripts": {
    "fetch:types": "node scripts/fetch-types.js",
    "prebuild": "npm run fetch:types",
    "prebuild:prod": "npm run fetch:types"
  }
}
```

#### Step 3: Add to tsconfig.json

```json
{
  "compilerOptions": {
    "types": ["./src/federated-types.d.ts"]
  }
}
```

## Type Patterns & Best Practices

### Pattern 1: Lazy Component Loading

When importing React components from federated modules:

```typescript
import { lazy } from 'react';

// ✅ Correct: Type-safe lazy loading
const Button = lazy(() =>
  import('shared_components/Button').then(m => ({ default: m.Button }))
);

// Use as normal:
<Button variant="primary">Click me</Button>
```

### Pattern 2: Dynamic Action Imports (Redux)

Due to TypeScript re-export limitations in Module Federation:

```typescript
// ❌ Avoid: Static imports may not resolve types correctly
import { setSearchText } from 'shared_data/store';

// ✅ Correct: Dynamic import avoids type resolution issues
const handleSearch = async () => {
  const { setSearchText } = await import('shared_data/store');
  dispatch(setSearchText(query));
};
```

### Pattern 3: Type Widening for Dynamic Modules

When TypeScript cannot infer types from dynamic imports:

```typescript
// Context: Module Federation loads components dynamically
// TypeScript's compile-time view is limited

const PlatformContextProvider = lazy(() =>
  import('shared_data/context').then(m => {
    // Type widening through unknown is necessary here:
    // 1. We're widening types (safe direction)
    // 2. Producer validates types at build time
    // 3. Runtime contract is guaranteed by Module Federation
    const { PlatformContextProvider } = m as unknown as Record<string, React.ComponentType<{ children: React.ReactNode }>>;
    return { default: PlatformContextProvider };
  })
);
```

### Pattern 4: Documented Internal APIs

When using intentionally private APIs for diagnostics:

```typescript
// Define the internal structure
interface ReactInternals {
  ReactCurrentDispatcher: unknown;
  ReactCurrentOwner: unknown;
  [key: string]: unknown;
}

// Document why this is acceptable
const reactInternals = (React as typeof React & {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ReactInternals;
}).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
```

### Avoiding `as any`

**Rule**: Never use `as any` in production code. Instead:

1. **For known types**: Define proper interfaces
2. **For dynamic imports**: Use `as unknown as T` with documentation
3. **For complex generics**: Accept TypeScript limitations and document

## Automation Strategy

### CI/CD Integration

#### Producer Pipeline

```yaml
# .github/workflows/build-producer.yml
name: Build & Deploy Producer

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build and generate types
        run: npm run build:prod

      - name: Upload to CDN
        run: |
          # Upload dist/remoteEntry.js
          aws s3 cp dist/remoteEntry.js s3://cdn/shared-components/

          # Upload dist/@mf-types.zip
          aws s3 cp dist/@mf-types.zip s3://cdn/shared-components/
```

#### Consumer Pipeline

```yaml
# .github/workflows/build-consumer.yml
name: Build Consumer

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Fetch types from producers
        run: npm run fetch:types
        env:
          # Point to CDN in production
          REMOTE_URL_SHARED_COMPONENTS: https://cdn.example.com/shared-components/@mf-types.zip

      - name: Type check
        run: npm run type-check

      - name: Build
        run: npm run build:prod
```

### Version Management

#### Semantic Versioning for Types

```javascript
// package-types.js enhancement
const version = require('../package.json').version;

// Include version in type declarations
const header = `/**
 * Module Federation Types
 * Version: ${version}
 * Generated: ${new Date().toISOString()}
 */\n\n`;

fs.writeFileSync(indexFile, header + indexContent);
```

#### Version Pinning

```json
// consumer's package.json
{
  "mfTypes": {
    "shared_components": "1.2.3",
    "shared_data": "2.0.1"
  }
}
```

### Monorepo Integration (Turborepo/Nx)

```json
// turbo.json
{
  "pipeline": {
    "build:types": {
      "outputs": ["dist/@mf-types/**", "dist/types/**"]
    },
    "build:prod": {
      "dependsOn": ["^build:prod"],
      "outputs": ["dist/**"]
    }
  }
}
```

## Troubleshooting

### Issue: Type file not found during packaging

**Symptom**: `⚠️ Type file not found: /path/to/file.d.ts`

**Solutions**:
1. Verify `tsc --emitDeclarationOnly` completed successfully
2. Check `package-types.js` paths match your project structure:
   ```javascript
   const TYPES_DIR = path.join(__dirname, '../dist/types'); // or '../src'
   ```
3. Ensure tsconfig.json has:
   ```json
   {
     "compilerOptions": {
       "declaration": true,
       "declarationDir": "dist/types"
     }
   }
   ```

### Issue: Types not recognized by TypeScript

**Symptom**: `Cannot find module 'shared_components/Button'`

**Solutions**:
1. Check `src/federated-types.d.ts` exists and contains module declarations
2. Verify tsconfig.json includes:
   ```json
   {
     "include": ["src/**/*", "src/federated-types.d.ts"]
   }
   ```
3. Restart TypeScript server in your IDE

### Issue: Re-export types not resolving

**Symptom**: `export * from './file'` doesn't resolve in federated types

**Root Cause**: TypeScript preserves relative imports in `.d.ts` files, which don't resolve across Module Federation boundaries.

**Solutions**:
1. Use dynamic imports (see Pattern 2 above)
2. Manually inline type definitions in package-types.js
3. Use `as unknown as T` pattern for known contracts

### Issue: Build fails with "Option 'emitDeclarationOnly' requires 'declaration'"

**Solution**: Always use both flags:
```bash
tsc --emitDeclarationOnly --declaration
```

## Known Limitations

### 1. Re-export Resolution

**Limitation**: TypeScript's `export * from './module'` in `.d.ts` files uses relative paths that don't resolve in federated modules.

**Workaround**:
- Dynamic imports: `const { action } = await import('remote/module')`
- Type widening: `as unknown as KnownType`

**Example**:
```typescript
// shared-data/dist/@mf-types/index.d.ts contains:
declare module 'shared_data/store' {
  export * from './slices/filtersSlice'; // ❌ Won't resolve
}

// Solution:
const handleAction = async () => {
  const { setFilter } = await import('shared_data/store');
  dispatch(setFilter(value));
};
```

### 2. Dynamic Imports in TypeScript

**Limitation**: TypeScript cannot fully type-check dynamic `import()` expressions with Module Federation, as the modules are loaded at runtime.

**Workaround**: Document the runtime contract and use type assertions:
```typescript
// Runtime contract guaranteed by Module Federation build process
const { Component } = m as unknown as { Component: React.FC<Props> };
```

### 3. Generic Type Preservation in Tuples

**Limitation**: TypeScript cannot preserve generic type relationships in mapped tuple types.

**Example**:
```typescript
// Cannot enforce that handler matches event data type in array
subscribeToMultiple([
  ['file:selected', (data) => ...], // data: any, not FileSelectedData
]);
```

**Workaround**: Use single subscriptions for full type safety, or document the limitation.

### 4. CDN Caching

**Challenge**: CDN caching can serve stale type definitions.

**Solution**:
- Include version/hash in type URLs: `@mf-types-v1.2.3.zip`
- Use cache-busting query params: `@mf-types.zip?v=1.2.3`
- Set appropriate cache headers: `Cache-Control: max-age=3600`

## Summary

The Module Federation type distribution system provides:
- ✅ Full TypeScript IntelliSense for federated modules
- ✅ Compile-time type checking
- ✅ Automatic type synchronization between producers and consumers
- ✅ CDN-ready packaging for production deployments

**Key Principles**:
1. **Producers** own their types and distribute them alongside code
2. **Consumers** fetch types at build time, not runtime
3. **Type widening** (via `as unknown as T`) is acceptable when documented
4. **Dynamic imports** solve many Module Federation type issues
5. **Automation** ensures types stay synchronized across the platform

For questions or issues, refer to:
- Module Federation docs: https://module-federation.io/
- TypeScript handbook: https://www.typescriptlang.org/docs/
- Project-specific examples in `/shared-components` and `/shared-data`
