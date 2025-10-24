# Module Federation TypeScript Types - Cross-Repo Solution

## Problem Statement

**Target Architecture:**
- Multiple separate repositories (Hubs team, Reports team, User team)
- Monorepo only for: Content shell + shared components
- Teams deploy independently to CDN (Vercel)
- Types must work across repository boundaries

**Current Status:**
- ✅ Type generation works in monorepo
- ❌ Type distribution fails for CDN deployment
- ⚠️ Manual declarations work but don't scale cross-repo

## Investigation Summary

### What Works
1. **Type Generation**: `@module-federation/dts-plugin` generates `.d.ts` files in `node_modules/.federation/dist/`
2. **Monorepo Consumption**: Types available locally during monorepo build
3. **Manual Declarations**: Provide compile-time type safety

### What Doesn't Work
1. **Type Packaging**: Creating `@mf-types.zip` fails with ENOENT error
2. **CDN Distribution**: No mechanism to publish/fetch types from production URLs
3. **Cross-Repo Types**: Consumer repos can't fetch types from producer CDNs

## Cross-Repo Solutions

### Option 1: Publish Types to NPM (Recommended for Production)

**Approach**: Publish types as separate npm packages

```bash
# shared-components publishes:
@company/shared-components-types@1.0.0

# Consumers install:
npm install --save-dev @company/shared-components-types
```

**Implementation**:
```json
// shared-components/package.json
{
  "scripts": {
    "build:types": "tsc --emitDeclarationOnly --outDir types",
    "publish:types": "npm publish types --access=public"
  }
}
```

```typescript
// Consumer: hubs-tab/src/types/modules.d.ts
/// <reference types="@company/shared-components-types" />
```

**Pros**:
- ✅ Works across any repo/team boundary
- ✅ Version controlled
- ✅ npm handles distribution
- ✅ TypeScript natively supports this

**Cons**:
- ⚠️ Extra publish step
- ⚠️ Types may lag behind code

### Option 2: Types in Git Submodule

**Approach**: Share types via git submodule

```bash
# shared-components/types/ committed to git
git submodule add https://github.com/company/shared-components hubs-tab/types/shared-components
```

**Pros**:
- ✅ No separate publish step
- ✅ Version tracked with git

**Cons**:
- ❌ Complex submodule management
- ❌ Doesn't scale to many consumers

### Option 3: TypeScript Path Mapping to CDN

**Approach**: Use TypeScript paths to fetch from built artifacts

```json
// hubs-tab/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "shared_components/*": [
        "node_modules/@company/shared-components/dist/types/*"
      ]
    }
  }
}
```

Requires shared-components to include types in published package.

**Pros**:
- ✅ Types bundled with code
- ✅ Single source of truth

**Cons**:
- ⚠️ Increases package size
- ⚠️ Requires careful build configuration

### Option 4: Wait for dts-plugin Maturity

**Status**: `@module-federation/dts-plugin@0.2.8` has issues

**Future Path**:
- Monitor dts-plugin updates
- Test newer versions
- Contribute fixes to upstream

**Pros**:
- ✅ Intended solution
- ✅ Zero configuration when working

**Cons**:
- ❌ Currently not working for zip packaging
- ❌ Unknown timeline for fixes

## Recommended Approach for Blueprint

### Phase 1: Current (Monorepo Demo)
```
✅ Manual type declarations in each consumer
✅ Documents intended approach with dts-plugin
✅ Provides working type safety
✅ Fast for demo/prototype
```

### Phase 2: Production (Cross-Repo)
```
✅ Publish types to npm as @company/*-types packages
✅ Consumers install types as devDependencies
✅ CI/CD publishes types on each release
✅ Versioning matches code versions
```

## Implementation Example

### Producer (shared-components)

**1. Generate types during build:**
```javascript
// webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      dts: {
        generateTypes: true, // Generates to .federation/dist/
      }
    })
  ]
}
```

**2. Copy types to publishable location:**
```json
// package.json
{
  "scripts": {
    "build": "webpack && npm run copy:types",
    "copy:types": "cp -r node_modules/.federation/dist/ dist/types/",
    "publish:types": "cd dist/types && npm publish"
  }
}
```

**3. Create types package.json:**
```json
// dist/types/package.json
{
  "name": "@company/shared-components-types",
  "version": "1.0.0",
  "types": "index.d.ts"
}
```

### Consumer (hubs-tab)

**1. Install types:**
```bash
npm install --save-dev @company/shared-components-types
```

**2. Reference types:**
```typescript
// src/types/modules.d.ts
/// <reference types="@company/shared-components-types" />
```

**3. Use with full type safety:**
```typescript
import { Button } from 'shared_components/Button'; // ✅ Fully typed
```

## Conclusion

**For Technology Research**:
- dts-plugin: Not production-ready for cross-repo CDN deployment
- Manual declarations: Working stopgap for monorepos
- NPM-published types: Production-ready solution for cross-repo

**For This Blueprint**:
- ✅ Document dts-plugin investigation
- ✅ Provide manual declarations (working now)
- ✅ Document npm publishing approach (production path)
- ✅ Show both in README for complete picture

**Verdict**: Module Federation type safety is achievable, but requires traditional type publishing (npm) rather than relying solely on dts-plugin for cross-repo scenarios.

---

**Last Updated**: 2025-10-23
**dts-plugin Version Tested**: 0.2.8
**Recommendation**: Use npm-published types for cross-repo production deployments
