# Communication Infrastructure

**Implementation Date:** 2025-10-24
**Status:** ✅ Implemented
**Priority:** 🔴 Critical Foundation

This document describes the communication infrastructure that enables coordinated behavior across micro-frontends while maintaining their independence.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Platform Context](#platform-context)
4. [Event Bus](#event-bus)
5. [Enhanced Tab Contract](#enhanced-tab-contract)
6. [Error Boundaries](#error-boundaries)
7. [Integration Guide](#integration-guide)
8. [Examples](#examples)
9. [Best Practices](#best-practices)
10. [Migration Guide](#migration-guide)

---

## Overview

### What This Provides

**Two Communication Patterns:**

1. **Platform Context (React Context)**
   - Parent-child state sharing
   - Search, filters, selection, navigation
   - User information and services
   - **Use for:** State that flows down from shell to tabs

2. **Event Bus (mitt)**
   - Loose coupling between sibling components
   - Cross-tab notifications
   - Pub/sub pattern
   - **Use for:** Sibling-to-sibling communication

### Design Philosophy

```
Shell (Platform Provider)
├── Provides Context ↓
├── Subscribes to Events ⟷
└── Tabs
    ├── Consume Context ↑
    ├── Publish Events ⟷
    └── Subscribe to Events ⟷
```

**When to use what:**
- Context: "I need to know the current search query"
- Event Bus: "File was selected, other tabs might care"

---

## Architecture

### Package Structure

```
platform-context/
├── src/
│   ├── PlatformContext.tsx    # React Context + Provider
│   ├── EventBus.ts             # Typed event bus
│   └── index.ts                # Public API
└── package.json
```

### Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "mitt": "^3.0.1"
  }
}
```

---

## Platform Context

### Interface

```typescript
export interface PlatformContextValue {
  // Search & Filters
  search: {
    query: string;
    setQuery: (query: string) => void;
    filters: Filter[];
    setFilters: (filters: Filter[]) => void;
    addFilter: (filter: Filter) => void;
    removeFilter: (filterId: string) => void;
    clearAll: () => void;
  };

  // Navigation
  navigation: {
    currentPath: Breadcrumb[];
    setPath: (path: Breadcrumb[]) => void;
    navigateTo: (breadcrumb: Breadcrumb) => void;
  };

  // Selection (for bulk actions)
  selection: {
    selectedIds: string[];
    setSelection: (ids: string[]) => void;
    toggleSelection: (id: string) => void;
    clearSelection: () => void;
    selectAll: (ids: string[]) => void;
  };

  // User & Auth
  user: User;

  // Services (future)
  // telemetry?: TelemetryService;
  // featureFlags?: FeatureFlagService;
  // data?: DataService;
}
```

### Usage in Shell

```typescript
import { PlatformProvider } from '@platform/context';

function App() {
  const currentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    permissions: ['read', 'write'],
  };

  return (
    <PlatformProvider user={currentUser}>
      <Shell />
    </PlatformProvider>
  );
}
```

### Usage in Tabs

```typescript
import { usePlatform, useSearch, useSelection } from '@platform/context';

function FilesTab() {
  // Option 1: Get entire context
  const platform = usePlatform();
  console.log(platform.search.query);

  // Option 2: Get specific slice (recommended)
  const search = useSearch();
  const selection = useSelection();

  return (
    <div>
      <h1>Search: {search.query}</h1>
      <p>Selected: {selection.selectedIds.length} items</p>

      <button onClick={() => selection.clearSelection()}>
        Clear Selection
      </button>
    </div>
  );
}
```

### Convenience Hooks

```typescript
// Individual hooks for each context slice
const search = useSearch();           // Just search context
const navigation = useNavigation();   // Just navigation
const selection = useSelection();     // Just selection
const user = useUser();               // Just user info
```

---

## Event Bus

### Event Types

All events are typed and documented in `EventBus.ts`:

```typescript
export type PlatformEvents = {
  // Tab lifecycle
  'tab:activated': { tabId: string; timestamp: Date };
  'tab:deactivated': { tabId: string; timestamp: Date };

  // Search events
  'search:submitted': { query: string; timestamp: Date };
  'search:cleared': { timestamp: Date };
  'search:results-updated': {
    query: string;
    results: { files: number; folders: number; hubs: number; total: number };
  };

  // Filter events
  'filter:changed': { filters: Filter[]; timestamp: Date };
  'filter:applied': { filterType: string; value: unknown; timestamp: Date };
  'filter:removed': { filterType: string; timestamp: Date };

  // Selection events
  'selection:changed': { selectedIds: string[]; timestamp: Date };
  'selection:cleared': { timestamp: Date };

  // Navigation events
  'navigation:folder-opened': { folderId: string; path: string; timestamp: Date };
  'navigation:breadcrumb-clicked': { itemId: string; path: string; timestamp: Date };

  // Content events
  'file:selected': { fileId: string; fileName: string; timestamp: Date };
  'file:opened': { fileId: string; fileName: string; timestamp: Date };
  'file:uploaded': { fileId: string; fileName: string; timestamp: Date };

  // Hub events
  'hub:selected': { hubId: string; hubName: string; timestamp: Date };
  'hub:joined': { hubId: string; userId: string; timestamp: Date };

  // Bulk actions
  'bulk-action:triggered': { action: string; itemIds: string[]; timestamp: Date };
  'bulk-action:completed': { action: string; itemIds: string[]; timestamp: Date };

  // Notifications
  'notification:show': { message: string; type: 'success' | 'error' | 'warning' | 'info'; timestamp: Date };
};
```

### Publishing Events

```typescript
import { publishEvent } from '@platform/context';

function FilesList() {
  const handleFileClick = (file: File) => {
    // Publish event - any tab can listen
    publishEvent('file:selected', {
      fileId: file.id,
      fileName: file.name,
      timestamp: new Date(),
    });
  };

  return <div onClick={() => handleFileClick(file)}>...</div>;
}
```

### Subscribing to Events

```typescript
import { subscribeToEvent } from '@platform/context';
import { useEffect } from 'react';

function PreviewPane() {
  useEffect(() => {
    // Subscribe to file selection events
    const unsubscribe = subscribeToEvent('file:selected', (data) => {
      console.log('File selected:', data.fileId, data.fileName);
      // Load preview for selected file
      loadPreview(data.fileId);
    });

    // Cleanup on unmount
    return unsubscribe;
  }, []);

  return <div>Preview...</div>;
}
```

### Subscribe to Multiple Events

```typescript
import { subscribeToMultiple } from '@platform/context';

useEffect(() => {
  const unsubscribe = subscribeToMultiple([
    ['file:selected', handleFileSelect],
    ['file:opened', handleFileOpen],
    ['folder:created', handleFolderCreate],
  ]);

  return unsubscribe; // Unsubscribes from all
}, []);
```

---

## Enhanced Tab Contract

### Tab Module v2

New enhanced contract that works with Platform Context:

```typescript
import { defineTabModule, TabModuleV2 } from '@content-platform/tab-contract';

export default defineTabModule({
  // Identity
  id: 'files-folders',
  title: 'Files & Folders',
  version: '2.0.0',
  icon: 'folder',

  // Mount function receives platform context
  mount(context) {
    return {
      component: FilesTab,

      // Lifecycle hooks
      onActivate: () => {
        console.log('Files tab activated');
        publishEvent('tab:activated', { tabId: 'files-folders', timestamp: new Date() });
      },

      onDeactivate: () => {
        console.log('Files tab deactivated');
        publishEvent('tab:deactivated', { tabId: 'files-folders', timestamp: new Date() });
      },

      // State persistence
      getState: () => ({ currentFolder: '/documents' }),
      setState: (state) => { /* restore state */ },

      // Cleanup
      cleanup: () => {
        console.log('Cleanup files tab');
      },
    };
  },

  // Filter contributions
  contributesFilters: [
    {
      id: 'file-type',
      label: 'File Type',
      type: 'select',
      options: [
        { value: 'pdf', label: 'PDF Documents' },
        { value: 'doc', label: 'Word Documents' },
        { value: 'xls', label: 'Spreadsheets' },
      ],
    },
    {
      id: 'date-range',
      label: 'Date Modified',
      type: 'date-range',
    },
  ],

  // Action contributions
  contributesActions: [
    {
      id: 'delete',
      label: 'Delete',
      icon: 'trash',
      requiresSelection: true,
      bulk: true,
      handler: async (context) => {
        const { selectedIds } = context.selection;
        await deleteFiles(selectedIds);
        publishEvent('bulk-action:completed', {
          action: 'delete',
          itemIds: selectedIds,
          timestamp: new Date(),
        });
      },
      shortcut: 'Delete',
    },
  ],

  // Search support
  onSearch: async (query, filters) => {
    const results = await searchFiles(query, filters);
    return results.length;
  },

  // Requirements
  requiredPlatformVersion: '^1.0.0',
  requiredDependencies: {
    'shared_components': '^2.0.0',
  },
});
```

### Filter Contributions

Tabs can contribute filters to the platform UI:

```typescript
contributesFilters: [
  {
    id: 'owner',
    label: 'Owner',
    type: 'select',
    options: [
      { value: 'me', label: 'My Files' },
      { value: 'shared', label: 'Shared with Me' },
    ],
    validate: (value) => {
      if (!value) return 'Please select an owner';
      return undefined;
    },
  },
]
```

### Action Contributions

Tabs can contribute bulk actions or toolbar actions:

```typescript
contributesActions: [
  {
    id: 'share',
    label: 'Share',
    icon: 'share',
    requiresSelection: true,
    bulk: true,
    handler: async (context) => {
      // Access platform context
      const { selectedIds } = context.selection;
      const { user } = context;

      await shareFiles(selectedIds, user.id);
    },
    disabled: (context) => {
      // Disable if no selection
      return context.selection.selectedIds.length === 0;
    },
    shortcut: 'Ctrl+S',
  },
]
```

### Backwards Compatibility

Old v1 tabs still work via adapter:

```typescript
import { adaptV1ToV2 } from '@content-platform/tab-contract';

// Old v1 tab
const v1Tab = {
  config: { id: 'old-tab', name: 'Old Tab', version: '1.0.0' },
  component: OldTabComponent,
};

// Automatically converted to v2
const v2Tab = adaptV1ToV2(v1Tab);
```

---

## Error Boundaries

### Basic Usage

Wrap federated modules with ErrorBoundary:

```typescript
import { ErrorBoundary } from '@modular-platform/shared-components';
import { lazy } from 'react';

const FilesTab = lazy(() => loadDynamicRemote('files_tab', './App'));

function App() {
  return (
    <ErrorBoundary
      componentName="Files Tab"
      onError={(error, info) => {
        console.error('Files Tab crashed:', error, info);
        // Send to error tracking service
        trackError(error, info);
      }}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <FilesTab />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Custom Fallback UI

```typescript
<ErrorBoundary
  componentName="Hubs Tab"
  fallback={
    <div className="error-fallback">
      <h2>Hubs temporarily unavailable</h2>
      <p>We're working on fixing this. Please try again later.</p>
      <button onClick={() => window.location.reload()}>
        Reload Page
      </button>
    </div>
  }
>
  <HubsTab />
</ErrorBoundary>
```

### Show Error Details (Development Only)

```typescript
<ErrorBoundary
  componentName="Content Platform"
  showDetails={process.env.NODE_ENV === 'development'}
>
  <ContentPlatform />
</ErrorBoundary>
```

### Higher-Order Component

```typescript
import { withErrorBoundary } from '@modular-platform/shared-components';

// Wrap component with error boundary
const SafeFilesTab = withErrorBoundary(FilesTab, {
  componentName: 'Files Tab',
  onError: logError,
});

// Use wrapped component
<SafeFilesTab />
```

---

## Integration Guide

### Step 1: Install Dependencies

```bash
# In your package.json
{
  "dependencies": {
    "@platform/context": "*",
    "@modular-platform/shared-components": "*"
  }
}

npm install
```

### Step 2: Wrap Shell with Provider

```typescript
// top-level-shell/src/App.tsx
import { PlatformProvider } from '@platform/context';

function App() {
  const user = {
    id: getCurrentUserId(),
    name: getCurrentUserName(),
    email: getCurrentUserEmail(),
    permissions: getCurrentUserPermissions(),
  };

  return (
    <PlatformProvider user={user}>
      <Shell />
    </PlatformProvider>
  );
}
```

### Step 3: Use Context in Components

```typescript
// any-component.tsx
import { useSearch, useSelection } from '@platform/context';

function MyComponent() {
  const search = useSearch();
  const selection = useSelection();

  return (
    <div>
      <input
        value={search.query}
        onChange={(e) => search.setQuery(e.target.value)}
      />
      <p>Selected: {selection.selectedIds.length}</p>
    </div>
  );
}
```

### Step 4: Use Events for Cross-Tab Communication

```typescript
// tab-a/Component.tsx
import { publishEvent } from '@platform/context';

function handleAction() {
  publishEvent('file:selected', {
    fileId: '123',
    fileName: 'doc.pdf',
    timestamp: new Date(),
  });
}

// tab-b/Component.tsx
import { subscribeToEvent } from '@platform/context';

useEffect(() => {
  const unsubscribe = subscribeToEvent('file:selected', (data) => {
    console.log('Other tab selected file:', data.fileName);
  });
  return unsubscribe;
}, []);
```

### Step 5: Wrap Federated Modules

```typescript
import { ErrorBoundary } from '@modular-platform/shared-components';

<ErrorBoundary componentName="Files Tab">
  <Suspense fallback={<Loading />}>
    <FilesTab />
  </Suspense>
</ErrorBoundary>
```

---

## Examples

### Example 1: Search Coordination

**Shell provides search input:**
```typescript
function Shell() {
  const search = useSearch();

  return (
    <TopBar>
      <SearchBar
        value={search.query}
        onChange={search.setQuery}
      />
    </TopBar>
  );
}
```

**Tabs respond to search:**
```typescript
function FilesTab() {
  const search = useSearch();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // React to search changes
    searchFiles(search.query, search.filters).then(setFiles);
  }, [search.query, search.filters]);

  return <FileList files={files} />;
}
```

### Example 2: Selection Coordination

**Tab A: Selects items**
```typescript
function FilesList() {
  const selection = useSelection();

  const handleFileClick = (fileId: string) => {
    selection.toggleSelection(fileId);
    publishEvent('file:selected', { fileId, fileName: file.name, timestamp: new Date() });
  };

  return (
    <div>
      {files.map(file => (
        <div
          key={file.id}
          onClick={() => handleFileClick(file.id)}
          className={selection.selectedIds.includes(file.id) ? 'selected' : ''}
        >
          {file.name}
        </div>
      ))}
    </div>
  );
}
```

**Tab B: Shows preview of selected**
```typescript
function PreviewPane() {
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToEvent('file:selected', (data) => {
      setPreviewFileId(data.fileId);
    });
    return unsubscribe;
  }, []);

  return previewFileId ? <Preview fileId={previewFileId} /> : null;
}
```

### Example 3: Breadcrumb Navigation

```typescript
function FilesTab() {
  const navigation = useNavigation();
  const [currentFolder, setCurrentFolder] = useState('/');

  const openFolder = (folder: Folder) => {
    setCurrentFolder(folder.path);

    // Update breadcrumbs
    navigation.setPath([
      { id: 'root', label: 'All Files', path: '/' },
      { id: folder.id, label: folder.name, path: folder.path },
    ]);

    // Publish event
    publishEvent('navigation:folder-opened', {
      folderId: folder.id,
      path: folder.path,
      timestamp: new Date(),
    });
  };

  return <FolderTree onFolderClick={openFolder} />;
}
```

### Example 4: Bulk Actions

```typescript
function FilesList() {
  const selection = useSelection();

  const handleDelete = async () => {
    publishEvent('bulk-action:triggered', {
      action: 'delete',
      itemIds: selection.selectedIds,
      timestamp: new Date(),
    });

    try {
      await deleteFiles(selection.selectedIds);

      publishEvent('bulk-action:completed', {
        action: 'delete',
        itemIds: selection.selectedIds,
        timestamp: new Date(),
      });

      selection.clearSelection();
    } catch (error) {
      publishEvent('bulk-action:failed', {
        action: 'delete',
        error: error.message,
        timestamp: new Date(),
      });
    }
  };

  return (
    <Toolbar>
      <button
        onClick={handleDelete}
        disabled={selection.selectedIds.length === 0}
      >
        Delete ({selection.selectedIds.length})
      </button>
    </Toolbar>
  );
}
```

---

## Best Practices

### 1. Use Context for State, Events for Notifications

**Good:**
```typescript
// Context: Read current search query
const search = useSearch();
const files = await searchFiles(search.query);

// Event: Notify others that search completed
publishEvent('search:results-updated', {
  query: search.query,
  results: { files: files.length, folders: 0, hubs: 0, total: files.length },
});
```

**Avoid:**
```typescript
// ❌ Don't use events for state queries
subscribeToEvent('get:search-query', (callback) => {
  callback(searchQuery); // Anti-pattern!
});
```

### 2. Always Unsubscribe from Events

```typescript
// ✅ Good - cleanup on unmount
useEffect(() => {
  const unsubscribe = subscribeToEvent('file:selected', handler);
  return unsubscribe;
}, []);

// ❌ Bad - memory leak
useEffect(() => {
  subscribeToEvent('file:selected', handler);
  // No cleanup!
}, []);
```

### 3. Use Specific Hooks Over Full Context

```typescript
// ✅ Good - only re-renders on search changes
const search = useSearch();

// ❌ Less optimal - re-renders on any context change
const platform = usePlatform();
const query = platform.search.query;
```

### 4. Wrap All Federated Modules with ErrorBoundary

```typescript
// ✅ Good
<ErrorBoundary componentName="Files Tab">
  <FilesTab />
</ErrorBoundary>

// ❌ Risky - one tab can crash entire app
<FilesTab />
```

### 5. Include Timestamp in Events

```typescript
// ✅ Good
publishEvent('file:selected', {
  fileId: '123',
  fileName: 'doc.pdf',
  timestamp: new Date(), // Helps with debugging
});

// ❌ Missing context
publishEvent('file:selected', { fileId: '123' });
```

### 6. Don't Overuse Events

Events are for notifications, not queries:

```typescript
// ✅ Good - use context for queries
const { selectedIds } = useSelection();

// ❌ Overengineered
publishEvent('get:selection', { callback: (ids) => setIds(ids) });
```

---

## Migration Guide

### From Props to Context

**Before:**
```typescript
function FilesTab({ searchQuery, onSelect }: TabProps) {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    searchFiles(searchQuery).then(setFiles);
  }, [searchQuery]);

  return <FileList files={files} onSelect={onSelect} />;
}

// Usage
<FilesTab searchQuery={search} onSelect={handleSelect} />
```

**After:**
```typescript
function FilesTab() {
  const search = useSearch();
  const selection = useSelection();
  const [files, setFiles] = useState([]);

  useEffect(() => {
    searchFiles(search.query).then(setFiles);
  }, [search.query]);

  const handleSelect = (ids: string[]) => {
    selection.setSelection(ids);
    publishEvent('selection:changed', { selectedIds: ids, timestamp: new Date() });
  };

  return <FileList files={files} onSelect={handleSelect} />;
}

// Usage - no props needed!
<FilesTab />
```

### From Callbacks to Events

**Before:**
```typescript
// Parent passes callback
<FilesTab onFileSelected={(file) => showPreview(file)} />

// Child calls callback
function FilesTab({ onFileSelected }: Props) {
  return <div onClick={() => onFileSelected(file)}>...</div>;
}
```

**After:**
```typescript
// Child publishes event
function FilesTab() {
  return (
    <div onClick={() =>
      publishEvent('file:selected', { fileId: file.id, fileName: file.name, timestamp: new Date() })
    }>
      ...
    </div>
  );
}

// Parent subscribes to event
function PreviewPane() {
  useEffect(() => {
    const unsubscribe = subscribeToEvent('file:selected', (data) => {
      showPreview(data.fileId);
    });
    return unsubscribe;
  }, []);
}
```

---

## Troubleshooting

### Context is undefined

**Problem:** `usePlatform()` throws error

**Solution:** Ensure component is wrapped with `PlatformProvider`:
```typescript
<PlatformProvider user={user}>
  <App />
</PlatformProvider>
```

### Events not received

**Problem:** Published events don't reach subscribers

**Solutions:**
1. Check event name spelling matches exactly
2. Ensure subscription happens before event is published
3. Check browser console for `[EventBus]` logs

### Memory leaks

**Problem:** Subscriptions not cleaned up

**Solution:** Always return unsubscribe function from useEffect:
```typescript
useEffect(() => {
  const unsubscribe = subscribeToEvent(...);
  return unsubscribe; // IMPORTANT!
}, []);
```

---

## Next Steps

**Now that you have communication infrastructure:**

1. **Integrate in Shell** - Wrap app with PlatformProvider
2. **Update Tabs** - Convert from props to context/events
3. **Add Error Boundaries** - Wrap all federated modules
4. **Test Cross-Tab Communication** - Verify events flow correctly
5. **Add Telemetry** (Phase 3) - Track events for analytics
6. **Add Feature Flags** (Phase 3) - Conditional features
7. **Add Data Layer** (Phase 2) - Shared GraphQL/REST client

---

## Related Documentation

- [MODULAR_PLATFORM_DESIGN.md](./MODULAR_PLATFORM_DESIGN.md) - Overall architecture vision
- [ARCHITECTURE_ROADMAP.md](./ARCHITECTURE_ROADMAP.md) - Implementation roadmap
- [FEDERATION_STRATEGY_IMPLEMENTATION.md](./FEDERATION_STRATEGY_IMPLEMENTATION.md) - Module federation details

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-24
**Status:** Foundation Complete, Integration Pending
