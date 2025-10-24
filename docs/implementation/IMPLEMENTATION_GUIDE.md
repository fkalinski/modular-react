# Content Platform - Implementation Guide

**Version:** 1.0.0
**Last Updated:** 2025-10-22
**Status:** MVP Fast - Full Software Patterns

---

## Table of Contents

1. [Team Ownership](#team-ownership)
2. [Quick Start](#quick-start)
3. [State Management Patterns Comparison](#state-management-patterns-comparison)
4. [Data Layer with GraphQL](#data-layer-with-graphql)
5. [Virtual Scrolling & Infinite Scroll](#virtual-scrolling--infinite-scroll)
6. [Async Decoration Attributes](#async-decoration-attributes)
7. [Contract Testing](#contract-testing)
8. [Development Workflow](#development-workflow)
9. [Deployment Strategy](#deployment-strategy)

---

## Team Ownership

### Team Structure

| Team | Ownership | Repository Location |
|------|-----------|---------------------|
| **Platform Team** | Top-level shell, shared infrastructure | `/top-level-shell`, `/platform-context`, `/shared-state`, `/shared-components`, `/graphql-server` |
| **Content Team** | Content platform shell, files-folders, archives, shared components | `/content-platform/shell`, `/content-platform/files-folders`, `/content-platform/archives`, `/content-platform-data` |
| **Hubs Team** | Hubs tab | `/hubs-tab` |
| **Reports Team** | Reports tab | `/reports-tab` |
| **User Team** | User tab | `/user-tab` |

### Ownership Matrix

```
┌──────────────────────────────────────────────────────────────┐
│                     Platform Team                             │
│  - Top-level shell (navigation, auth, routing)               │
│  - @platform/context (React Context + Event Bus)             │
│  - @platform/shared-state (Redux)                            │
│  - @platform/contract-tests (Contract validation)            │
│  - shared-components (Box design system)                     │
│  - graphql-server (Mock GraphQL backend)                     │
└──────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────────┬──────────────────┬─────────────┐
                              ↓                 ↓                  ↓             ↓
┌────────────────────────────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│         Content Team               │  │  Hubs Team   │  │ Reports Team │  │  User Team   │
│  - Content Platform Shell          │  │  - Hubs Tab  │  │ - Reports Tab│  │  - User Tab  │
│  - Files & Folders Tab             │  │              │  │              │  │              │
│  - Archives Tab                    │  │              │  │              │  │              │
│  - @content-platform/data          │  │              │  │              │  │              │
│  - @content-platform/tab-contract  │  │              │  │              │  │              │
└────────────────────────────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### Responsibilities

#### Platform Team
- **Infrastructure**: Shell app, routing, auth, global navigation
- **State Management**: Maintain both Context and Redux patterns
- **Design System**: Box design system, shared components
- **APIs**: GraphQL server, shared data client
- **Testing**: Contract tests, E2E framework
- **CI/CD**: Deployment pipelines, Vercel configuration

#### Content Team
- **Content Platform**: Content tab shell (sub-shell for content tabs)
- **Tabs**: Files & Folders, Archives (future)
- **Data Layer**: GraphQL client, queries, hooks for content domain
- **Contracts**: Tab contract interface definition
- **Features**: Content-specific shared components (file browser, folder tree)

#### Domain Teams (Hubs, Reports, User)
- **Tabs**: Individual tab implementation
- **Features**: Domain-specific functionality
- **Testing**: Contract compliance, unit tests, E2E for their tab
- **Documentation**: Tab-specific documentation

---

## Quick Start

### Running the Platform Locally

#### 1. Start GraphQL Server

```bash
cd graphql-server
npm install
npm start
# Server: http://localhost:4000/graphql
```

#### 2. Start Shell

```bash
cd top-level-shell
npm install
npm start
# App: http://localhost:3000
```

#### 3. Start Tabs (in parallel)

```bash
# Content Platform
cd content-platform/shell
npm install
npm start  # Port 3001

# Files & Folders
cd content-platform/files-folders
npm install
npm start  # Port 3002

# Hubs
cd hubs-tab
npm install
npm start  # Port 3003

# Reports
cd reports-tab
npm install
npm start  # Port 3004

# User
cd user-tab
npm install
npm start  # Port 3005
```

### Development Ports

| Service | Port | URL |
|---------|------|-----|
| GraphQL Server | 4000 | http://localhost:4000/graphql |
| Top-Level Shell | 3000 | http://localhost:3000 |
| Content Platform | 3001 | http://localhost:3001 |
| Files & Folders | 3002 | http://localhost:3002 |
| Hubs Tab | 3003 | http://localhost:3003 |
| Reports Tab | 3004 | http://localhost:3004 |
| User Tab | 3005 | http://localhost:3005 |

---

## State Management Patterns Comparison

The platform supports **TWO state management patterns** for comparison. Teams can choose based on their needs.

### Pattern 1: React Context + Event Bus (@platform/context)

**Best for:** Simple state, parent-child communication, smaller apps

#### Setup in Shell

```tsx
import { PlatformProvider } from '@platform/context';

const user = {
  id: '1',
  name: 'John Doe',
  email: 'john@company.com',
  permissions: ['read', 'write'],
};

function Shell() {
  return (
    <PlatformProvider user={user}>
      <App />
    </PlatformProvider>
  );
}
```

#### Usage in Tabs

```tsx
import { useSearch, useSelection, publishEvent } from '@platform/context';

function FilesTab() {
  // Access search state
  const { query, setQuery, filters, addFilter } = useSearch();

  // Access selection state
  const { selectedIds, toggleSelection } = useSelection();

  // Publish events for other tabs
  const handleFileClick = (fileId, fileName) => {
    toggleSelection(fileId);
    publishEvent('file:selected', { fileId, fileName, timestamp: new Date() });
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search files..."
      />
      <p>{selectedIds.length} files selected</p>
    </div>
  );
}
```

---

### Pattern 2: Redux (@platform/shared-state)

**Best for:** Complex state, DevTools, time-travel debugging, enterprise apps

#### Setup in Shell

```tsx
import { createPlatformStore } from '@platform/shared-state';
import { Provider } from 'react-redux';

const store = createPlatformStore();

function Shell() {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  );
}
```

#### Usage in Tabs

```tsx
import { useReduxSearch, useReduxSelection } from '@platform/shared-state';

function FilesTab() {
  // Access search state (identical API to Context pattern!)
  const { query, setQuery, filters, addFilter } = useReduxSearch();

  // Access selection state
  const { selectedIds, toggleSelection } = useReduxSelection();

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search files..."
      />
      <p>{selectedIds.length} files selected</p>
    </div>
  );
}
```

---

### Pattern Comparison

| Feature | Context + Event Bus | Redux |
|---------|---------------------|-------|
| **API Complexity** | Simple | Moderate |
| **Bundle Size** | ~5KB | ~13KB |
| **DevTools** | ❌ No | ✅ Redux DevTools |
| **Time Travel** | ❌ No | ✅ Yes |
| **Middleware** | ❌ No | ✅ Thunks, Sagas |
| **Performance** | Good | Better (memoization) |
| **Testing** | Moderate | Easier (pure reducers) |
| **Learning Curve** | Low | Higher |

### Recommendation: Hybrid Approach

Use **BOTH patterns** together:

```tsx
import { createPlatformStore } from '@platform/shared-state';
import { PlatformProvider } from '@platform/context';
import { Provider } from 'react-redux';

const store = createPlatformStore();
const user = { id: '1', name: 'John', email: 'john@example.com', permissions: [] };

function Shell() {
  return (
    <Provider store={store}>
      <PlatformProvider user={user}>
        <App />
      </PlatformProvider>
    </Provider>
  );
}
```

**In Tabs:**

```tsx
import { useReduxSearch } from '@platform/shared-state';
import { useUser, publishEvent } from '@platform/context';

function FilesTab() {
  // Redux for complex coordination
  const { query, setQuery } = useReduxSearch();

  // Context for simple read-only data
  const user = useUser();

  // Event Bus for loose cross-tab events
  const handleFileSelect = (fileId) => {
    publishEvent('file:selected', { fileId, timestamp: new Date() });
  };

  return <div>Best of both worlds!</div>;
}
```

---

## Data Layer with GraphQL

### Setup Apollo Client

```tsx
import { ApolloProvider } from '@apollo/client';
import { defaultApolloClient } from '@content-platform/data';

function Shell() {
  return (
    <ApolloProvider client={defaultApolloClient}>
      <App />
    </ApolloProvider>
  );
}
```

### Using Data Hooks

```tsx
import { useFiles, useCreateFolder } from '@content-platform/data';

function FilesTab() {
  const { data, loading, error, refetch } = useFiles(parentId);
  const [createFolder] = useCreateFolder();

  const handleCreateFolder = async () => {
    await createFolder({
      variables: { name: 'New Folder', parentId },
    });
    refetch();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={handleCreateFolder}>Create Folder</button>
      {data.files.map(file => (
        <div key={file.id}>{file.name} - {file.size} bytes</div>
      ))}
    </div>
  );
}
```

### Integrating Data with State Management

```tsx
import { useReduxSearch } from '@platform/shared-state';
import { useSearch as useGraphQLSearch } from '@content-platform/data';

function SearchResults() {
  // Get query from Redux
  const { query, updateResults } = useReduxSearch();

  // Fetch from GraphQL
  const { data, loading } = useGraphQLSearch(query);

  // Update Redux with results
  useEffect(() => {
    if (data?.search) {
      updateResults({
        files: data.search.files.length,
        folders: data.search.folders.length,
        hubs: data.search.hubs.length,
        total: data.search.totalResults,
      });
    }
  }, [data]);

  return <div>Results: {data?.search.totalResults}</div>;
}
```

---

## Virtual Scrolling & Infinite Scroll

### Requirements

1. **Virtualized Tables**: Only render visible rows for performance
2. **Infinite Scroll**: Load more data as user scrolls
3. **Smooth UX**: No lag, no flicker
4. **Minimal Attributes First**: Load core data, then decorate
5. **Async Decorations**: Fetch collaboration icons, sharing status asynchronously

### Implementation with react-window

#### Install Dependencies

```bash
npm install react-window react-window-infinite-loader
```

#### Virtualized File List

```tsx
import { FixedSizeList } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { useFiles } from '@content-platform/data';

interface FileRowProps {
  id: string;
  name: string;
  size: number;
  // Async decorations loaded separately
  collaborators?: User[];
  sharedWith?: string[];
}

function VirtualizedFileList() {
  const [files, setFiles] = useState<FileRowProps[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Load more files
  const loadMoreItems = async (startIndex: number, stopIndex: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const newFiles = await fetchFiles(startIndex, stopIndex);
      setFiles(prev => [...prev, ...newFiles]);
      setHasMore(newFiles.length > 0);
    } finally {
      setLoading(false);
    }
  };

  // Check if item is loaded
  const isItemLoaded = (index: number) => index < files.length;

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={hasMore ? files.length + 1 : files.length}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <FixedSizeList
          height={600}
          itemCount={files.length}
          itemSize={50}
          width="100%"
          onItemsRendered={onItemsRendered}
          ref={ref}
        >
          {({ index, style }) => (
            <FileRow
              style={style}
              file={files[index]}
              index={index}
            />
          )}
        </FixedSizeList>
      )}
    </InfiniteLoader>
  );
}
```

#### File Row Component

```tsx
function FileRow({ file, style }: { file: FileRowProps; style: React.CSSProperties }) {
  // Async: Load decorations after row is rendered
  const decorations = useAsyncDecorations(file.id);

  return (
    <div style={style} className="file-row">
      <span className="file-name">{file.name}</span>
      <span className="file-size">{formatBytes(file.size)}</span>

      {/* Async decorations */}
      {decorations.collaborators && (
        <CollaboratorIcons users={decorations.collaborators} />
      )}
      {decorations.sharedWith && (
        <SharingIcon sharedWith={decorations.sharedWith} />
      )}
    </div>
  );
}
```

---

## Async Decoration Attributes

### Concept

Load minimal data first, then fetch decorations asynchronously:

1. **Phase 1 - Minimal Viable Attributes**: Load core data (id, name, type, size)
2. **Phase 2 - Shared Decorations**: Load collaboration icons, sharing status (shared across all tabs)
3. **Phase 3 - Domain-Specific Decorations**: Load tab-specific metadata (file preview URL, hub member avatars)

### Implementation

#### Shared Decorations Hook

```tsx
// shared-components/src/hooks/useAsyncDecorations.ts
import { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_SHARED_DECORATIONS = gql`
  query GetSharedDecorations($itemId: ID!) {
    item(id: $itemId) {
      collaborators {
        id
        name
        avatar
      }
      sharedWith {
        id
        name
      }
      permissions {
        canEdit
        canShare
        canDelete
      }
    }
  }
`;

export const useAsyncDecorations = (itemId: string) => {
  const { data, loading } = useQuery(GET_SHARED_DECORATIONS, {
    variables: { itemId },
    // Only fetch when item is visible (use IntersectionObserver)
    skip: !itemId,
  });

  return {
    loading,
    collaborators: data?.item.collaborators,
    sharedWith: data?.item.sharedWith,
    permissions: data?.item.permissions,
  };
};
```

#### Domain-Specific Decorations

```tsx
// files-folders/src/hooks/useFileDecorations.ts
export const useFileDecorations = (fileId: string) => {
  const { data, loading } = useQuery(GET_FILE_DECORATIONS, {
    variables: { fileId },
  });

  return {
    loading,
    thumbnail: data?.file.thumbnailUrl,
    previewUrl: data?.file.previewUrl,
    fileType: data?.file.detectedMimeType,
    virusScanStatus: data?.file.virusScanStatus,
  };
};
```

#### Usage in File Row

```tsx
function FileRow({ file }: { file: MinimalFile }) {
  // Shared decorations (for all tabs)
  const sharedDecorations = useAsyncDecorations(file.id);

  // Domain-specific decorations (files only)
  const fileDecorations = useFileDecorations(file.id);

  return (
    <div className="file-row">
      {/* Core attributes (already loaded) */}
      <span>{file.name}</span>
      <span>{formatBytes(file.size)}</span>

      {/* Shared decorations (loading async) */}
      {!sharedDecorations.loading && (
        <>
          <CollaboratorIcons users={sharedDecorations.collaborators} />
          <SharingIcon sharedWith={sharedDecorations.sharedWith} />
        </>
      )}

      {/* Domain-specific decorations (loading async) */}
      {!fileDecorations.loading && (
        <>
          <Thumbnail url={fileDecorations.thumbnail} />
          <FileTypeIcon type={fileDecorations.fileType} />
        </>
      )}
    </div>
  );
}
```

### GraphQL Schema for Decorations

Add decoration queries to GraphQL server:

```graphql
type Item {
  id: ID!
  # Shared decorations
  collaborators: [User!]
  sharedWith: [User!]
  permissions: Permissions
}

type Permissions {
  canEdit: Boolean!
  canShare: Boolean!
  canDelete: Boolean!
}

type File implements Item {
  id: ID!
  name: String!
  size: Int!

  # Shared decorations
  collaborators: [User!]
  sharedWith: [User!]
  permissions: Permissions

  # Domain-specific decorations
  thumbnailUrl: String
  previewUrl: String
  detectedMimeType: String
  virusScanStatus: String
}

query GetSharedDecorations($itemId: ID!) {
  item(id: $itemId) {
    collaborators { id name avatar }
    sharedWith { id name }
    permissions { canEdit canShare canDelete }
  }
}

query GetFileDecorations($fileId: ID!) {
  file(id: $fileId) {
    thumbnailUrl
    previewUrl
    detectedMimeType
    virusScanStatus
  }
}
```

### Performance Optimization

#### 1. Batch Decoration Requests

```tsx
// Load decorations for multiple files at once
const GET_BATCH_DECORATIONS = gql`
  query GetBatchDecorations($itemIds: [ID!]!) {
    items(ids: $itemIds) {
      id
      collaborators { id name avatar }
      sharedWith { id name }
    }
  }
`;

// Load decorations for visible files only
const visibleFileIds = files.slice(startIndex, endIndex).map(f => f.id);
const { data } = useQuery(GET_BATCH_DECORATIONS, {
  variables: { itemIds: visibleFileIds },
});
```

#### 2. Cache Decorations

```tsx
// Apollo Client automatically caches
// Decorations loaded once are reused across tabs
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Item: {
        keyFields: ['id'],
        fields: {
          collaborators: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});
```

#### 3. Only Load Visible Decorations

Use IntersectionObserver to load decorations only for visible rows:

```tsx
function FileRow({ file }: { file: MinimalFile }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Only load decorations when row is visible
  const decorations = useAsyncDecorations(file.id, { skip: !isVisible });

  return <div ref={ref}>...</div>;
}
```

---

## Contract Testing

### Why Contract Tests?

Contract tests ensure tabs comply with platform expectations without E2E integration tests.

### Running Contract Tests

```bash
cd files-folders
npm install --save-dev @platform/contract-tests
npm run test:contract
```

### Example Test

```typescript
// src/__tests__/contract.test.ts
import { validateTabModuleContract, formatValidationErrors } from '@platform/contract-tests';
import tabModule from '../plugin';

describe('FilesTab Contract Compliance', () => {
  it('should pass all contract validation checks', () => {
    const result = validateTabModuleContract(tabModule);

    if (!result.valid) {
      console.error(formatValidationErrors(result.errors));
    }

    expect(result.valid).toBe(true);
  });
});
```

### CI Integration

```yaml
# .github/workflows/tab-ci.yml
- name: Run Contract Tests
  run: npm run test:contract
```

---

## Development Workflow

### Creating a New Tab

#### 1. Scaffold Tab

```bash
mkdir my-new-tab
cd my-new-tab
npm init -y
```

#### 2. Add Dependencies

```json
{
  "dependencies": {
    "@content-platform/tab-contract": "1.0.0",
    "@platform/context": "1.0.0",
    "@content-platform/data": "1.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@platform/contract-tests": "1.0.0",
    "webpack": "^6.0.0",
    "@module-federation/enhanced": "^0.1.0"
  }
}
```

#### 3. Create Tab Plugin

```tsx
// src/plugin.tsx
import type { TabModule } from '@content-platform/tab-contract';
import { MyTab } from './MyTab';

const tabModule: TabModule = {
  id: 'my-tab',
  title: 'My Tab',
  Component: MyTab,
};

export default tabModule;
```

#### 4. Implement Component

```tsx
// src/MyTab.tsx
import { useSearch } from '@platform/context';
import { useMyData } from '@content-platform/data';

export function MyTab() {
  const { query } = useSearch();
  const { data, loading } = useMyData();

  return (
    <div>
      <h1>My Tab</h1>
      <p>Search: {query}</p>
    </div>
  );
}
```

#### 5. Add Contract Test

```tsx
// src/__tests__/contract.test.ts
import { validateTabModuleContract } from '@platform/contract-tests';
import tabModule from '../plugin';

describe('MyTab Contract', () => {
  it('complies with platform contract', () => {
    expect(validateTabModuleContract(tabModule).valid).toBe(true);
  });
});
```

#### 6. Configure Module Federation

```javascript
// webpack.config.js
const { ModuleFederationPlugin } = require('@module-federation/enhanced');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'my_tab',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/plugin',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        '@platform/context': { singleton: true },
        '@content-platform/data': { singleton: true },
      },
    }),
  ],
};
```

#### 7. Test Locally

```bash
npm start  # Port 3006
```

#### 8. Add to Shell

```tsx
// top-level-shell/src/tabs.ts
const tabs = [
  // ... existing tabs
  {
    id: 'my-tab',
    url: 'http://localhost:3006/remoteEntry.js',
    scope: 'my_tab',
    module: './App',
  },
];
```

---

## Deployment Strategy

### 1. Deploy Shared Packages First

```bash
# Deploy in order
cd graphql-server && npm run deploy
cd shared-components && npm run deploy
cd platform-context && npm run deploy
cd shared-state && npm run deploy
cd content-platform-data && npm run deploy
```

### 2. Deploy Tabs

```bash
# Tabs can deploy independently
cd files-folders && npm run deploy
cd hubs-tab && npm run deploy
cd reports-tab && npm run deploy
```

### 3. Deploy Shell Last

```bash
cd top-level-shell && npm run deploy
```

### Vercel Configuration

Each module has `vercel.json`:

```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/remoteEntry.js",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Cache-Control", "value": "no-cache" }
      ]
    }
  ]
}
```

---

## Summary

This guide covers:

✅ Team ownership structure
✅ Two state management patterns (Redux + Context)
✅ GraphQL data layer with Apollo
✅ Virtual scrolling with react-window
✅ Async decoration attributes (shared + domain-specific)
✅ Contract testing for tab compliance
✅ Complete development workflow
✅ Deployment strategy

**Next**: Choose your state management pattern, implement virtual scrolling in your tables, and add contract tests to your CI pipeline!
