# Modular React Platform - Usage Guide

## Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation

```bash
# Install root dependencies
npm install

# Install all package dependencies
npm run install:all
```

**Note:** Since this is a PoC using a monorepo to simulate separate repositories, we haven't published packages to npm. In production, shared libraries would be published and consumed via package.json dependencies.

### Running the Platform

#### Option 1: Run Everything

```bash
# Start all services concurrently (requires concurrently package)
npm run dev
```

This will start:
- Shared Components (http://localhost:3001)
- Shared Data (http://localhost:3002)
- Top-Level Shell (http://localhost:3000) ← **Main entry point**
- Content Shell (http://localhost:3003)
- Files Tab (http://localhost:3004)
- Reports Tab (http://localhost:3006)
- User Tab (http://localhost:3007)

#### Option 2: Run Individually

```bash
# Terminal 1: Shared Components
cd packages/shared-components && npm install && npm run dev

# Terminal 2: Shared Data
cd packages/shared-data && npm install && npm run dev

# Terminal 3: Top-Level Shell
cd packages/top-level-shell && npm install && npm run dev

# Terminal 4: Content Shell
cd packages/content-platform/shell && npm install && npm run dev

# Terminal 5: Files Tab
cd packages/content-platform/files-folders && npm install && npm run dev
```

### Accessing the Platform

1. **Main Application**: http://localhost:3000
   - Navigate between Content, Reports, and User tabs
   - Each tab is a federated module

2. **Content Platform**: http://localhost:3003 (or via Content tab in main app)
   - Search & filter functionality
   - Files & Folders tab (implementing TabPlugin contract)
   - Demonstrates nested module federation

3. **Component Library**: http://localhost:3001
   - View shared components in action
   - All modules consume these components remotely

4. **Data Layer Demo**: http://localhost:3002
   - Redux store with dynamic reducer injection
   - Event bus demonstration

## Architecture Highlights

### Module Federation Flow

```
Top-Level Shell (localhost:3000)
  ├─> Shared Components (localhost:3001) [federated]
  ├─> Shared Data (localhost:3002) [federated]
  ├─> Reports Tab (localhost:3006) [federated]
  ├─> User Tab (localhost:3007) [federated]
  └─> Content Shell (localhost:3003) [federated]
       ├─> Shared Components [federated]
       ├─> Shared Data [federated]
       └─> Files Tab (localhost:3004) [federated via TabPlugin]
```

### Key Features Demonstrated

1. **Semantic Versioning**
   - All tabs specify `^1.0.0` for shared components
   - Runtime resolves to compatible version
   - Update shared components without rebuilding tabs

2. **Tab Contract (Plugin System)**
   - See: `packages/content-platform/tab-contract/src/index.ts`
   - Files tab implements `TabPlugin` interface
   - Hot-swappable tabs at runtime

3. **Dynamic State Management**
   - Redux store created in shared-data
   - Tabs can inject reducers: `store.injectReducer(key, reducer)`
   - State flows through context to all tabs

4. **Shared Components**
   - Button, Input, Table, Tree components
   - ThemeProvider for consistent styling
   - All federated at runtime, no bundling

5. **Event Bus**
   - Cross-tab communication
   - Filter changes propagate to all tabs
   - Selection state shared

## Creating a New Tab

### 1. Implement the TabPlugin Interface

```typescript
// my-tab/src/plugin.tsx
import type { TabPlugin, TabProps } from '@tab-contract';

const MyTabComponent: React.FC<TabProps> = ({ context, onNavigate, onSelect }) => {
  // Use context.filters, context.selection, etc.
  return <div>My Tab Content</div>;
};

const MyTabPlugin: TabPlugin = {
  config: {
    id: 'my-tab',
    name: 'My Tab',
    version: '1.0.0',
    componentVersion: '^1.0.0', // Compatible with shared-components
  },
  component: MyTabComponent,
  // Optional: actions, dataSource, reducer, lifecycle hooks
};

export default MyTabPlugin;
```

### 2. Configure Module Federation

```javascript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'my_tab',
  exposes: {
    './Plugin': './src/plugin',
  },
  remotes: {
    shared_components: 'shared_components@http://localhost:3001/remoteEntry.js',
  },
})
```

### 3. Register in Content Shell

```typescript
// content-platform/shell/src/ContentPlatform.tsx
const MyTab = lazy(() => import('my_tab/Plugin'));

// Add to webpack remotes:
remotes: {
  my_tab: 'my_tab@http://localhost:3008/remoteEntry.js',
}
```

## Testing Module Federation

### Test Shared Components

1. Start shared-components: `cd packages/shared-components && npm run dev`
2. Open http://localhost:3001
3. View component showcase

### Test Independent Deployment

1. Make changes to shared-components (e.g., change button color)
2. Refresh top-level shell (http://localhost:3000)
3. See changes without rebuilding shell or tabs

### Test Tab Contract

1. Files tab runs standalone: http://localhost:3004
2. Files tab integrates in content shell: http://localhost:3003
3. Same component, different contexts

## Production Build

```bash
# Build everything
npm run build

# Build shared libraries first
npm run build:shared

# Then apps
npm run build:apps
```

Output will be in each package's `dist/` folder.

### Deployment Strategy

1. **Shared Libraries** (CDN)
   ```
   https://cdn.example.com/shared-components/1.0.0/remoteEntry.js
   https://cdn.example.com/shared-data/1.0.0/remoteEntry.js
   ```

2. **Applications** (Static hosting)
   ```
   https://app.example.com/            # Top-level shell
   https://app.example.com/content/    # Content shell
   https://app.example.com/reports/    # Reports tab
   ```

3. **Version Updates**
   - Deploy new shared-components v1.1.0 to CDN
   - Update shell to reference new version
   - All tabs automatically use new version (no rebuild)

## Troubleshooting

### Module not loading

1. Check console for CORS errors
2. Ensure remote service is running
3. Verify `publicPath` in webpack config
4. Check network tab for 404s on remoteEntry.js

### Shared dependencies conflicting

1. Verify `singleton: true` in shared config
2. Check version compatibility
3. Look for multiple React instances in console

### Tab not appearing

1. Check tab contract implementation
2. Verify webpack exposes configuration
3. Check Content Shell remote configuration
4. Look for errors in tab's onActivate lifecycle

## Next Steps

1. **Implement Hubs Tab** (external repository pattern)
2. **Add JSON-based composition** (runtime tab configuration)
3. **GraphQL integration** (mock server → real API)
4. **Enhanced version management** (version registry service)
5. **Performance optimization** (preloading, caching strategies)

## Key Files Reference

- **Tab Contract**: `packages/content-platform/tab-contract/src/index.ts`
- **Files Tab Plugin**: `packages/content-platform/files-folders/src/plugin.tsx`
- **Content Shell**: `packages/content-platform/shell/src/ContentPlatform.tsx`
- **Store with Injection**: `packages/shared-data/src/store/index.ts`
- **Event Bus**: `packages/shared-data/src/events/index.ts`

## Architecture Documentation

See [MODULAR_PLATFORM_DESIGN.md](./MODULAR_PLATFORM_DESIGN.md) for complete architecture details.
