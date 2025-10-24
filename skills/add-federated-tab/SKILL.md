---
name: add-federated-tab
description: Complete guide for creating and integrating a new federated tab in the modular React platform, including TabPlugin implementation, webpack configuration, and shell registration.
---

# Adding a Federated Tab

This skill guides you through creating a new federated tab that integrates with the content platform shell using the TabPlugin contract.

## When to Use This Skill

Use this skill when you need to:
- Create a new federated tab from scratch
- Implement the TabPlugin interface
- Configure Module Federation for the tab
- Register the tab in the content shell
- Add tab-specific state and actions
- Integrate with shared components and data

## Tab Plugin Contract

Every federated tab must implement the `TabPlugin` interface defined in `content-platform/tab-contract/src/index.ts`:

```typescript
export interface TabPlugin {
  // Required: Metadata
  config: TabConfig;

  // Required: React component
  component: ComponentType<TabProps>;

  // Optional: Data integration
  dataSource?: DataSource;

  // Optional: Redux state
  reducerKey?: string;
  reducer?: Reducer;

  // Optional: Custom actions
  actions?: ActionDefinition[];

  // Optional: Lifecycle hooks
  onActivate?: () => void | Promise<void>;
  onDeactivate?: () => void | Promise<void>;

  // Optional: Search support
  getSearchHitCount?: (searchText: string) => number | Promise<number>;

  // Optional: Context requirements
  contextRequirements?: Array<keyof ContentContext>;
}
```

## Step-by-Step Guide

### Step 1: Create Tab Directory

```bash
# In project root
mkdir my-tab
cd my-tab
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install react react-dom
npm install -D webpack webpack-cli webpack-dev-server
npm install -D @module-federation/enhanced
npm install -D typescript @types/react @types/react-dom
npm install -D ts-loader html-webpack-plugin
```

### Step 3: Create Tab Component

Create `src/MyTab.tsx`:

```typescript
import React from 'react';
import type { TabProps } from './types';

export const MyTab: React.FC<TabProps> = ({ context, onNavigate, onSelect }) => {
  const { filters, selection, navigation } = context;

  return (
    <div>
      <h1>My Tab</h1>

      {/* Access shared filters */}
      <p>Search: {filters.searchText}</p>

      {/* Access selection */}
      <p>Selected: {selection.selectedIds.length} items</p>

      {/* Your tab content here */}
      <div>
        {/* Use shared components */}
        <button onClick={() => onSelect(['item-1', 'item-2'])}>
          Select Items
        </button>
      </div>
    </div>
  );
};
```

### Step 4: Inline TabPlugin Types

Create `src/types.ts` with the complete TabPlugin contract:

```typescript
import { ComponentType, Reducer } from 'react';

export interface TabConfig {
  id: string;
  name: string;
  icon?: string;
  version: string;
  componentVersion: string; // e.g., "^1.0.0"
  description?: string;
}

export interface ContentContext {
  filters: {
    searchText: string;
    active: Array<{ field: string; operator: string; value: any }>;
    dateRange?: { start: string; end: string };
    contentType?: string;
  };
  selection: {
    selectedIds: string[];
    lastSelectedId?: string;
  };
  navigation: {
    currentPath: string;
    breadcrumbs: Array<{ label: string; path: string }>;
  };
}

export interface TabProps {
  context: ContentContext;
  onNavigate: (path: string) => void;
  onSelect: (ids: string[]) => void;
}

export interface ActionDefinition {
  id: string;
  label: string;
  icon?: string;
  handler: (context: ContentContext) => void | Promise<void>;
  disabled?: (context: ContentContext) => boolean;
}

export interface DataSource {
  fetch(filters: any): Promise<ContentItem[]>;
  fetchById(id: string): Promise<ContentItem | null>;
}

export interface ContentItem {
  id: string;
  name: string;
  type: string;
  ownerId: string;
  owner?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface TabPlugin {
  config: TabConfig;
  component: ComponentType<TabProps>;
  dataSource?: DataSource;
  reducerKey?: string;
  reducer?: Reducer;
  actions?: ActionDefinition[];
  onActivate?: () => void | Promise<void>;
  onDeactivate?: () => void | Promise<void>;
  getSearchHitCount?: (searchText: string) => number | Promise<number>;
  contextRequirements?: Array<keyof ContentContext>;
}
```

### Step 5: Create Plugin Export

Create `src/plugin.tsx`:

```typescript
import React from 'react';
import { MyTab } from './MyTab';
import type { TabPlugin, TabConfig, ActionDefinition } from './types';

// Tab configuration
const config: TabConfig = {
  id: 'my-tab',
  name: 'My Tab',
  icon: '📄',
  version: '1.0.0',
  componentVersion: '^1.0.0', // Compatible with shared-components v1.x
  description: 'My custom tab implementation',
};

// Optional: Custom actions
const actions: ActionDefinition[] = [
  {
    id: 'my-action',
    label: 'My Action',
    icon: '⚡',
    handler: async (context) => {
      console.log('Action triggered with context:', context);
      // Your action logic here
    },
    disabled: (context) => context.selection.selectedIds.length === 0,
  },
];

// Optional: Lifecycle hooks
const onActivate = async () => {
  console.log('My tab activated');
  // Initialize tab resources
};

const onDeactivate = async () => {
  console.log('My tab deactivated');
  // Cleanup resources
};

// Assemble plugin
const MyTabPlugin: TabPlugin = {
  config,
  component: MyTab,
  actions,
  onActivate,
  onDeactivate,
  // Optional: Add dataSource, reducer, etc.
};

export default MyTabPlugin;
```

### Step 6: Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 7: Configure Webpack

Create `webpack.config.js`:

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/webpack');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: './src/index.tsx',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
    publicPath: isProduction
      ? 'auto'
      : 'http://localhost:3008/', // Choose unique port
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
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

  plugins: [
    new ModuleFederationPlugin({
      name: 'my_tab',
      filename: 'remoteEntry.js',

      exposes: {
        './Plugin': './src/plugin',
      },

      remotes: {
        shared_components: isProduction
          ? 'shared_components@https://your-cdn.vercel.app/remoteEntry.js'
          : 'shared_components@http://localhost:3001/remoteEntry.js',
      },

      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.0.0',
          strictVersion: false,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0',
          strictVersion: false,
        },
      },

      dts: false, // Disable for production builds
    }),

    new HtmlWebpackPlugin({
      template: './public/index.html',
      title: 'My Tab',
    }),
  ],

  devServer: {
    port: 3008, // Choose unique port
    hot: true,
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
```

### Step 8: Create HTML Template

Create `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Tab</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
```

### Step 9: Create Standalone Entry Point

Create `src/index.tsx` (for standalone testing):

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import MyTabPlugin from './plugin';

// Mock context for standalone testing
const mockContext = {
  filters: {
    searchText: '',
    active: [],
  },
  selection: {
    selectedIds: [],
  },
  navigation: {
    currentPath: '/my-tab',
    breadcrumbs: [{ label: 'Home', path: '/' }],
  },
};

const App = () => {
  const TabComponent = MyTabPlugin.component;

  return (
    <div>
      <h1>My Tab - Standalone</h1>
      <TabComponent
        context={mockContext}
        onNavigate={(path) => console.log('Navigate:', path)}
        onSelect={(ids) => console.log('Select:', ids)}
      />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
```

### Step 10: Add Package Scripts

Update `package.json`:

```json
{
  "name": "my-tab",
  "version": "1.0.0",
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  }
}
```

### Step 11: Register in Content Shell

Update `content-platform/shell/webpack.config.js`:

```javascript
remotes: {
  // Existing remotes...
  my_tab: isProduction
    ? 'my_tab@https://my-tab-xxx.vercel.app/remoteEntry.js'
    : 'my_tab@http://localhost:3008/remoteEntry.js',
}
```

### Step 12: Load Tab in Shell

Update `content-platform/shell/src/ContentPlatform.tsx`:

```typescript
import { lazy } from 'react';

// Lazy load tab plugins
const FilesTabPlugin = lazy(() => import('files_tab/Plugin'));
const MyTabPlugin = lazy(() => import('my_tab/Plugin')); // Add your tab

// In component:
const tabs = [
  { id: 'files', plugin: FilesTabPlugin },
  { id: 'my-tab', plugin: MyTabPlugin }, // Add your tab
];
```

### Step 13: Test Standalone

```bash
cd my-tab
npm install
npm run dev
```

Visit http://localhost:3008 to test your tab standalone.

### Step 14: Test Integrated

```bash
# Start all services including your new tab
./scripts/dev-all.sh start

# Visit the content platform
open http://localhost:3003
```

Your tab should appear in the content shell.

## Adding Advanced Features

### Adding Redux State

Create `src/reducer.ts`:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MyTabState {
  items: string[];
  loading: boolean;
}

const initialState: MyTabState = {
  items: [],
  loading: false,
};

const myTabSlice = createSlice({
  name: 'myTab',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setItems, setLoading } = myTabSlice.actions;
export default myTabSlice.reducer;
```

Update plugin:

```typescript
import myTabReducer from './reducer';

const MyTabPlugin: TabPlugin = {
  config,
  component: MyTab,
  reducerKey: 'myTab', // State will be at state.myTab
  reducer: myTabReducer,
};
```

### Adding Data Source

Create `src/dataSource.ts`:

```typescript
import type { DataSource, ContentItem } from './types';

export const myTabDataSource: DataSource = {
  async fetch(filters: any): Promise<ContentItem[]> {
    // Fetch data from API
    const response = await fetch('/api/my-tab-items', {
      method: 'POST',
      body: JSON.stringify(filters),
    });
    return response.json();
  },

  async fetchById(id: string): Promise<ContentItem | null> {
    const response = await fetch(`/api/my-tab-items/${id}`);
    return response.json();
  },
};
```

Update plugin:

```typescript
import { myTabDataSource } from './dataSource';

const MyTabPlugin: TabPlugin = {
  config,
  component: MyTab,
  dataSource: myTabDataSource,
};
```

## Best Practices

1. **Use inlined types** - Copy TabPlugin interface to avoid external dependencies
2. **Implement lifecycle hooks** - Clean up resources in onDeactivate
3. **Respect context** - Use provided context for filters, selection, navigation
4. **Use shared components** - Import from shared_components remote
5. **Provide actions** - Define custom actions for toolbar integration
6. **Support search** - Implement getSearchHitCount for search integration
7. **Test standalone** - Ensure tab works independently
8. **Test integrated** - Verify tab works within shell
9. **Choose unique port** - Avoid port conflicts with existing services

## Port Allocation

Current ports in use:

| Port | Service |
|------|---------|
| 3000 | top-level-shell |
| 3001 | shared-components |
| 3002 | shared-data |
| 3003 | content-platform/shell |
| 3004 | files-folders |
| 3005 | hubs-tab |
| 3006 | reports-tab |
| 3007 | user-tab |

**Choose port 3008+ for new tabs.**

## Troubleshooting

### Tab Not Loading

1. Check remote is running: `curl http://localhost:3008/remoteEntry.js`
2. Verify webpack remote configuration in shell
3. Check browser console for Module Federation errors
4. Ensure tab exports default plugin

### Type Errors

1. Verify types.ts matches TabPlugin interface exactly
2. Check TypeScript configuration
3. Run `npm run typecheck` to find issues

### Context Not Updating

1. Ensure component uses context from props
2. Check shell is passing context correctly
3. Verify React hooks are used properly

## Quick Reference

```bash
# Create new tab
mkdir my-tab && cd my-tab
npm init -y
npm install react react-dom
npm install -D webpack webpack-cli webpack-dev-server
npm install -D @module-federation/enhanced
npm install -D typescript @types/react @types/react-dom
npm install -D ts-loader html-webpack-plugin

# Directory structure
my-tab/
├── src/
│   ├── index.tsx       # Standalone entry
│   ├── plugin.tsx      # Plugin export
│   ├── MyTab.tsx       # Component
│   ├── types.ts        # Inlined types
│   └── reducer.ts      # Optional state
├── public/
│   └── index.html      # HTML template
├── webpack.config.js   # Module Federation config
├── tsconfig.json       # TypeScript config
└── package.json        # Dependencies & scripts

# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run typecheck       # Check types

# Integration
# Update content-platform/shell/webpack.config.js remotes
# Update content-platform/shell/src/ContentPlatform.tsx tabs array
```

## Related Skills

- **dev-workflow**: For development environment setup
- **module-federation-types**: For handling TypeScript types
- **add-shared-component**: For creating shared components to use in tabs
- **vercel-deployment**: For deploying your tab to production

## References

- Tab contract: `content-platform/tab-contract/src/index.ts`
- Example tab: `content-platform/files-folders/src/plugin.tsx`
- Shell integration: `content-platform/shell/src/ContentPlatform.tsx`
- Usage guide: `USAGE_GUIDE.md`
- Architecture: `docs/architecture/MODULAR_PLATFORM_DESIGN.md`
