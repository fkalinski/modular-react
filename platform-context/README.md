# @platform/context

Platform context and event bus for cross-micro-frontend communication.

## Overview

This package provides **two complementary patterns** for cross-MFE communication:

1. **React Context** - For parent-child state sharing (simple, direct access)
2. **Event Bus** - For loose coupling between sibling MFEs (pub/sub pattern)

### When to Use Each Pattern

| Pattern | Use Case | Example |
|---------|----------|---------|
| **React Context** | Shell provides state to tabs | Search query, user info, selected items |
| **Event Bus** | Tabs communicate with each other | File selected → update preview, Hub joined → refresh list |

## Installation

```bash
npm install @platform/context
```

## Pattern 1: React Context

### Basic Usage

**In Shell (Provider):**

```tsx
import { PlatformProvider } from '@platform/context';

function Shell() {
  const currentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    permissions: ['read', 'write'],
  };

  return (
    <PlatformProvider user={currentUser}>
      <App />
    </PlatformProvider>
  );
}
```

**In Tab (Consumer):**

```tsx
import { usePlatform, useSearch } from '@platform/context';

function FilesTab() {
  // Access full context
  const platform = usePlatform();

  // Or use convenience hooks for specific slices
  const { query, setQuery, filters, addFilter } = useSearch();

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <p>Current filters: {filters.length}</p>
    </div>
  );
}
```

### Context API

#### Search

```tsx
const { search } = usePlatform();

// Read state
search.query              // Current search query
search.filters            // Active filters

// Update state
search.setQuery('test')                    // Set search query
search.addFilter({                         // Add/update filter
  id: 'type',
  type: 'file-type',
  label: 'Document',
  value: 'pdf'
})
search.removeFilter('type')                // Remove filter by id
search.setFilters([...])                   // Replace all filters
search.clearAll()                          // Clear query and filters
```

#### Navigation

```tsx
const { navigation } = usePlatform();

// Read state
navigation.currentPath    // Breadcrumb array

// Update state
navigation.setPath([
  { id: 'home', label: 'Home' },
  { id: 'docs', label: 'Documents' },
])

navigation.navigateTo({
  id: 'folder-1',
  label: 'My Folder',
  path: '/documents/my-folder',
  onClick: () => handleFolderClick(),
})
```

#### Selection

```tsx
const { selection } = usePlatform();

// Read state
selection.selectedIds     // Array of selected item IDs

// Update state
selection.setSelection(['id1', 'id2'])     // Set selection
selection.toggleSelection('id1')           // Toggle single item
selection.selectAll(['id1', 'id2', 'id3']) // Select all
selection.clearSelection()                 // Clear all
```

#### User

```tsx
const { user } = usePlatform();

// Read user info
user.id
user.name
user.email
user.permissions

// Check permission
const canEdit = user.permissions.includes('write');
```

### Convenience Hooks

```tsx
// Instead of const { search } = usePlatform()
const search = useSearch();

// Instead of const { navigation } = usePlatform()
const navigation = useNavigation();

// Instead of const { selection } = usePlatform()
const selection = useSelection();

// Instead of const { user } = usePlatform()
const user = useUser();
```

## Pattern 2: Event Bus

### Basic Usage

**Publishing Events:**

```tsx
import { publishEvent } from '@platform/context';

function FilesTab() {
  const handleFileClick = (fileId: string, fileName: string) => {
    // Publish event for other tabs to react
    publishEvent('file:selected', {
      fileId,
      fileName,
      timestamp: new Date(),
    });
  };

  return (
    <div onClick={() => handleFileClick('file-1', 'doc.pdf')}>
      Select File
    </div>
  );
}
```

**Subscribing to Events:**

```tsx
import { subscribeToEvent } from '@platform/context';
import { useEffect } from 'react';

function PreviewTab() {
  useEffect(() => {
    // Subscribe to file selection events
    const unsubscribe = subscribeToEvent('file:selected', (data) => {
      console.log('File selected:', data.fileId, data.fileName);
      // Load file preview
      loadPreview(data.fileId);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return <div>Preview Panel</div>;
}
```

### Available Events

#### Tab Lifecycle

```tsx
publishEvent('tab:activated', { tabId: 'files', timestamp: new Date() });
publishEvent('tab:deactivated', { tabId: 'hubs', timestamp: new Date() });
```

#### Search Events

```tsx
publishEvent('search:submitted', { query: 'test', timestamp: new Date() });
publishEvent('search:cleared', { timestamp: new Date() });
publishEvent('search:results-updated', {
  query: 'test',
  results: { files: 5, folders: 2, hubs: 1, total: 8 },
});
```

#### Filter Events

```tsx
publishEvent('filter:applied', {
  filterType: 'file-type',
  value: 'pdf',
  timestamp: new Date(),
});
publishEvent('filter:removed', { filterType: 'file-type', timestamp: new Date() });
publishEvent('filter:cleared-all', { timestamp: new Date() });
```

#### Selection Events

```tsx
publishEvent('selection:changed', {
  selectedIds: ['id1', 'id2'],
  timestamp: new Date(),
});
publishEvent('selection:cleared', { timestamp: new Date() });
```

#### Navigation Events

```tsx
publishEvent('navigation:folder-opened', {
  folderId: 'folder-1',
  path: '/documents/folder-1',
  timestamp: new Date(),
});
```

#### Content Events

```tsx
publishEvent('file:selected', {
  fileId: 'file-1',
  fileName: 'doc.pdf',
  timestamp: new Date(),
});
publishEvent('file:opened', {
  fileId: 'file-1',
  fileName: 'doc.pdf',
  timestamp: new Date(),
});
publishEvent('file:uploaded', {
  fileId: 'file-new',
  fileName: 'new-doc.pdf',
  timestamp: new Date(),
});
```

#### Hub Events

```tsx
publishEvent('hub:selected', {
  hubId: 'hub-1',
  hubName: 'Engineering',
  timestamp: new Date(),
});
```

#### Bulk Actions

```tsx
publishEvent('bulk-action:triggered', {
  action: 'delete',
  itemIds: ['id1', 'id2'],
  timestamp: new Date(),
});
publishEvent('bulk-action:completed', {
  action: 'delete',
  itemIds: ['id1', 'id2'],
  timestamp: new Date(),
});
```

#### Notifications

```tsx
publishEvent('notification:show', {
  message: 'File uploaded successfully',
  type: 'success',
  timestamp: new Date(),
});
```

### Advanced Event Bus Usage

**Subscribe to Multiple Events:**

```tsx
import { subscribeToMultiple } from '@platform/context';

useEffect(() => {
  const unsubscribe = subscribeToMultiple([
    ['file:selected', handleFileSelect],
    ['file:opened', handleFileOpen],
    ['folder:created', handleFolderCreate],
  ]);

  return unsubscribe;
}, []);
```

**Type-Safe Custom Event Handler:**

```tsx
import { PlatformEvents } from '@platform/context';

const handleFileSelect = (data: PlatformEvents['file:selected']) => {
  // data is fully typed
  console.log(data.fileId, data.fileName, data.timestamp);
};
```

## Comparison: Context vs Event Bus

### Example: Search Coordination

**Using Context (Recommended for this case):**

```tsx
// Shell provides search state
<PlatformProvider user={user}>
  <FilesTab />
  <HubsTab />
</PlatformProvider>

// Tabs consume search state
function FilesTab() {
  const { query, filters } = useSearch();

  // Tabs automatically re-render when search changes
  const filteredFiles = filterFiles(files, query, filters);

  return <FileList files={filteredFiles} />;
}
```

**Pros:**
- Direct state access
- Automatic re-renders
- Simple mental model
- TypeScript autocompletion

**Cons:**
- Tighter coupling
- Shell must provide all state upfront

---

**Using Event Bus (Alternative):**

```tsx
// One tab publishes search event
function SearchBar() {
  const handleSearch = (query: string) => {
    publishEvent('search:submitted', { query, timestamp: new Date() });
  };
}

// Other tabs subscribe to event
function FilesTab() {
  const [localQuery, setLocalQuery] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToEvent('search:submitted', (data) => {
      setLocalQuery(data.query);
    });
    return unsubscribe;
  }, []);

  const filteredFiles = filterFiles(files, localQuery);
  return <FileList files={filteredFiles} />;
}
```

**Pros:**
- Complete decoupling
- Tabs don't need to know about each other
- Can add new tabs without changing existing ones

**Cons:**
- More boilerplate
- Manual state management in each tab
- Potential for state inconsistencies

### Example: File Selected → Update Preview

**Using Event Bus (Recommended for this case):**

```tsx
// Files tab publishes event
function FileRow({ file }) {
  const handleClick = () => {
    publishEvent('file:selected', {
      fileId: file.id,
      fileName: file.name,
      timestamp: new Date(),
    });
  };

  return <div onClick={handleClick}>{file.name}</div>;
}

// Preview panel subscribes to event
function PreviewPanel() {
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToEvent('file:selected', (data) => {
      loadFilePreview(data.fileId).then(setPreviewFile);
    });
    return unsubscribe;
  }, []);

  return <div>{previewFile && <Preview file={previewFile} />}</div>;
}
```

**Why Event Bus?**
- Files tab doesn't need to know about preview panel
- Preview panel can be added/removed without affecting files tab
- Other tabs can also react to file selection

---

**Using Context (Alternative):**

```tsx
// Would need to lift state to shell
function Shell() {
  const [selectedFileId, setSelectedFileId] = useState(null);

  return (
    <PlatformProvider user={user} selectedFileId={selectedFileId}>
      <FilesTab onFileSelect={setSelectedFileId} />
      <PreviewPanel fileId={selectedFileId} />
    </PlatformProvider>
  );
}
```

**Why Not Context Here?**
- Requires shell to know about file selection
- Tighter coupling between components
- More props drilling

## Best Practices

### ✅ Do

- **Use Context** for state that the shell owns (search, user, global filters)
- **Use Event Bus** for actions/events between sibling tabs
- **Emit events from Context methods** (already built-in) for hybrid approach
- **Unsubscribe** from events on component unmount
- **Use TypeScript** types for type safety

### ❌ Don't

- Don't use Event Bus for state that should be in Context (creates duplication)
- Don't forget to unsubscribe (memory leaks!)
- Don't use Context for everything (over-coupling)
- Don't emit events without timestamp

## Hybrid Approach (Recommended)

The best approach is to **combine both patterns**:

```tsx
function FilesTab() {
  // Use Context for shell-provided state
  const { query, filters } = useSearch();
  const { selectedIds, toggleSelection } = useSelection();

  // Use Event Bus for cross-tab events
  useEffect(() => {
    const unsubscribe = subscribeToEvent('file:uploaded', (data) => {
      // Refresh file list when another tab uploads
      refetchFiles();
    });
    return unsubscribe;
  }, []);

  const handleFileClick = (fileId: string) => {
    // Update Context (for selection state)
    toggleSelection(fileId);

    // Emit Event (for other tabs to react)
    publishEvent('file:selected', {
      fileId,
      fileName: files.find(f => f.id === fileId)?.name || '',
      timestamp: new Date(),
    });
  };

  return <FileList files={filteredFiles} onFileClick={handleFileClick} />;
}
```

**Note:** Context methods already emit events automatically! When you call `setQuery()`, it publishes `search:submitted` event. So you get both patterns working together.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Shell                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          PlatformProvider (React Context)             │  │
│  │  - Search state                                       │  │
│  │  - Navigation state                                   │  │
│  │  - Selection state                                    │  │
│  │  - User info                                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│    ┌────▼────┐       ┌─────▼─────┐      ┌────▼────┐        │
│    │ Files   │       │   Hubs    │      │ Reports │        │
│    │  Tab    │       │    Tab    │      │   Tab   │        │
│    │         │       │           │      │         │        │
│    │ Context │       │  Context  │      │ Context │        │
│    │    +    │◄─────►│     +     │◄────►│    +    │        │
│    │  Event  │ Events│   Event   │Events│  Event  │        │
│    │   Bus   │       │    Bus    │      │   Bus   │        │
│    └─────────┘       └───────────┘      └─────────┘        │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                 │
│                    Event Bus (mitt)                          │
│                  - file:selected                             │
│                  - hub:joined                                │
│                  - search:submitted                          │
│                  - etc.                                      │
└─────────────────────────────────────────────────────────────┘

Legend:
  │  = Context data flow (parent → child)
  ◄─► = Event Bus (sibling ↔ sibling)
```

## Testing

### Testing Context

```tsx
import { render } from '@testing-library/react';
import { PlatformProvider } from '@platform/context';

const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  permissions: ['read'],
};

function renderWithPlatform(component) {
  return render(
    <PlatformProvider user={mockUser}>
      {component}
    </PlatformProvider>
  );
}

test('component uses search context', () => {
  const { getByPlaceholderText } = renderWithPlatform(<FilesTab />);
  const searchInput = getByPlaceholderText('Search...');
  expect(searchInput).toBeInTheDocument();
});
```

### Testing Event Bus

```tsx
import { publishEvent, subscribeToEvent } from '@platform/context';

test('event bus publishes and receives events', () => {
  const handler = jest.fn();

  const unsubscribe = subscribeToEvent('file:selected', handler);

  publishEvent('file:selected', {
    fileId: 'test-file',
    fileName: 'test.pdf',
    timestamp: new Date(),
  });

  expect(handler).toHaveBeenCalledWith({
    fileId: 'test-file',
    fileName: 'test.pdf',
    timestamp: expect.any(Date),
  });

  unsubscribe();
});
```

## License

MIT
