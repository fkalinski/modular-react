# Modular React Platform - PoC

A proof-of-concept for a modular, extensible React platform using Module Federation 2.0.

## 📚 Documentation

- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - What was built and what's next
- **[Usage Guide](./USAGE_GUIDE.md)** - Quick start and how to create new tabs
- **[Complete Architecture Design](./MODULAR_PLATFORM_DESIGN.md)** - Detailed design document (65 pages)

## 🚀 Quick Start

```bash
# Install and run everything
npm install
npm run install:all
npm run dev

# Access the platform
open http://localhost:3000
```

## Architecture Overview

This PoC demonstrates:
- **Shared component library** with semantic versioning
- **Dynamic state management** with Redux reducer injection
- **Extensible data layer** with GraphQL
- **Tab plugin system** for independent deployment
- **Runtime composition** without rebuilding child apps

## Repository Structure

```
packages/
├── shared-components/       # Federated component library (v1.x)
├── shared-data/            # Federated Redux + GraphQL client
├── top-level-shell/        # Main application shell
├── reports-tab/            # Simple federated tab
├── user-tab/               # Simple federated tab
├── hubs-tab/               # External tab using shared libs
└── content-platform/       # Content platform (monorepo)
    ├── tab-contract/       # Tab plugin interface
    ├── shell/              # Content shell with search/filter
    └── files-folders/      # Files tab implementation
```

## Key Technical Decisions

### 1. Module Federation 2.0
- **Why:** Built-in semantic versioning, better runtime plugin system
- **Alternative considered:** MF 1.5 (mature but manual version management)
- **Trade-off:** Newer tech vs. proven stability

### 2. Semantic Versioning Strategy
- Shared components expose version ranges (e.g., `^1.0.0`)
- Child apps auto-resolve to highest compatible version
- **No rebuild needed** for patch/minor updates
- Breaking changes (major versions) load separately

### 3. Dynamic Redux Store
- Base store provided by shell (filters, selection, navigation)
- Tabs inject reducers at runtime using `store.injectReducer()`
- State shared across federated boundaries via context

### 4. GraphQL Extension Pattern
- Base schema with core `ContentItem` interface
- Domains extend with specific fields (`FileItem`, `HubItem`)
- Queries composed from fragments at runtime

### 5. Tab Contract (Plugin System)
```typescript
interface TabPlugin {
  config: TabConfig;           // Metadata + version requirements
  component: React.Component;  // Tab UI
  dataSource?: DataSource;     // Optional data provider
  reducer?: Reducer;           // Optional state slice
  onActivate?: () => void;     // Lifecycle hooks
}
```

## Development Workflow

### Prerequisites
- Node.js >= 18
- npm >= 9

### Setup
```bash
npm install
npm run install:all
```

### Development
```bash
# Start all services (ports 3000-3007)
npm run dev

# Or individually:
npm run dev:shared-components  # localhost:3001
npm run dev:shared-data        # localhost:3002
npm run dev:shell              # localhost:3000
npm run dev:content            # localhost:3003
npm run dev:files              # localhost:3004
npm run dev:hubs               # localhost:3005
```

### Build
```bash
# Build everything
npm run build

# Build shared libraries first (required)
npm run build:shared

# Then build apps
npm run build:apps
```

## Module Federation Configuration

### Shared Components (Remote)
```javascript
{
  name: 'shared_components',
  exposes: {
    './Button': './src/Button',
    './Table': './src/Table',
    './Tree': './src/Tree'
  },
  shared: { react: { singleton: true } }
}
```

### Content Shell (Host + Remote)
```javascript
{
  name: 'content_shell',
  exposes: {
    './ContentPlatform': './src/ContentPlatform'
  },
  remotes: {
    shared_components: 'shared_components@http://localhost:3001/remoteEntry.js',
    files_tab: 'files_tab@http://localhost:3004/remoteEntry.js'
  }
}
```

## Port Allocation

| Service | Port | Purpose |
|---------|------|---------|
| Top-level Shell | 3000 | Main app entry point |
| Shared Components | 3001 | Component library |
| Shared Data | 3002 | Redux + GraphQL |
| Content Shell | 3003 | Content platform |
| Files Tab | 3004 | Files & Folders |
| Hubs Tab | 3005 | Hubs (external) |
| Reports Tab | 3006 | Reports (simple) |
| User Tab | 3007 | User (simple) |

## State Flow

```
┌─────────────────────────────────────┐
│     Top-Level Shell (Redux)         │
│  - filters, selection, navigation   │
└────────────┬────────────────────────┘
             │ (Context Provider)
             ▼
┌─────────────────────────────────────┐
│       Content Shell (Redux)         │
│  + content-specific state           │
└────────────┬────────────────────────┘
             │ (Context Provider)
             ▼
┌─────────────────────────────────────┐
│      Files Tab (inject reducer)    │
│  + files state → store.files        │
└─────────────────────────────────────┘
```

## Data Flow

1. **User changes filter** in search pane
2. **Shell dispatches** `updateFilters()` action
3. **Redux state updates**, triggers context re-render
4. **All tabs receive** new filter via context
5. **Tabs refetch data** with new filters
6. **GraphQL queries** execute with extended schemas
7. **UI updates** with filtered data

## Version Compatibility Example

Scenario: Shared components update from 1.2.0 → 1.5.0

```javascript
// Shell loads latest
shared_components@1.5.0

// Files tab (requires ^1.0.0)
→ Uses 1.5.0 ✓ (compatible)

// Hubs tab (requires ^1.2.0)
→ Uses 1.5.0 ✓ (compatible)

// Future tab (requires ^2.0.0)
→ Loads 2.0.0 separately (breaking change)
```

**Result:** No rebuild needed for Files or Hubs tabs!

## Future: JSON-Based Composition

The platform will support runtime configuration:

```json
{
  "tabs": [
    {
      "id": "files",
      "remoteEntry": "https://cdn.example.com/files-tab/remoteEntry.js",
      "enabled": true,
      "order": 1
    },
    {
      "id": "hubs",
      "remoteEntry": "https://cdn.example.com/hubs-tab/remoteEntry.js",
      "enabled": true,
      "order": 2
    }
  ]
}
```

This enables:
- Runtime enable/disable of tabs
- Dynamic tab ordering
- A/B testing new features
- Per-tenant configurations

## Implementation Status

See [MODULAR_PLATFORM_DESIGN.md](./MODULAR_PLATFORM_DESIGN.md) for complete architecture.

**Current Phase:** Phase 0 - Setup & Infrastructure

## Next Steps

1. ✓ Repository structure
2. ⏳ Configure Module Federation 2.0
3. ⏳ Build shared component library
4. ⏳ Create top-level shell
5. ⏳ Implement data layer
6. ⏳ Build content platform
7. ⏳ Create first tabs

## References

- [Module Federation 2.0 Docs](https://module-federation.io/)
- [Design Document](./MODULAR_PLATFORM_DESIGN.md)
