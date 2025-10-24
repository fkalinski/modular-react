# @platform/shared-state

Shared Redux store for platform state management.

## Overview

This package provides **Redux-based state management** as an alternative (or complement) to the React Context pattern in `@platform/context`.

**Choose this package when you need:**
- ✅ Centralized state with Redux DevTools
- ✅ Time-travel debugging
- ✅ Strong state coordination across tabs
- ✅ Redux middleware (thunks, sagas, etc.)
- ✅ Predictable state mutations

**Choose `@platform/context` when you need:**
- ✅ Simpler API
- ✅ Less boilerplate
- ✅ Independent tab state
- ✅ Smaller bundle size

## Installation

```bash
npm install @platform/shared-state react-redux @reduxjs/toolkit
```

## Quick Start

### 1. Create Store in Shell

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

### 2. Use in Tabs

```tsx
import { useReduxSearch } from '@platform/shared-state';

function FilesTab() {
  const { query, filters, setQuery, addFilter } = useReduxSearch();

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <p>Active filters: {filters.length}</p>
    </div>
  );
}
```

## API Reference

### Store

#### `createPlatformStore()`

Creates the Redux store with all platform slices.

```tsx
import { createPlatformStore } from '@platform/shared-state';
import { Provider } from 'react-redux';

const store = createPlatformStore();

<Provider store={store}>
  <App />
</Provider>
```

### Hooks

#### `useReduxSearch()`

Access search state and actions.

```tsx
const {
  query,           // Current search query
  filters,         // Active filters
  results,         // Search results count
  setQuery,        // Set search query
  setFilters,      // Set all filters
  addFilter,       // Add/update a filter
  removeFilter,    // Remove a filter
  clearAll,        // Clear query and filters
  updateResults,   // Update results count
} = useReduxSearch();
```

**Example:**

```tsx
import { useReduxSearch } from '@platform/shared-state';

function SearchBar() {
  const { query, filters, setQuery, addFilter, clearAll } = useReduxSearch();

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const handleAddFilter = () => {
    addFilter({
      id: 'file-type',
      type: 'file-type',
      label: 'PDF Files',
      value: 'pdf',
    });
  };

  return (
    <div>
      <input value={query} onChange={handleSearch} />
      <button onClick={handleAddFilter}>Add Filter</button>
      <button onClick={clearAll}>Clear All</button>
      <p>{filters.length} active filters</p>
    </div>
  );
}
```

#### `useReduxNavigation()`

Access navigation state and actions.

```tsx
const {
  currentPath,       // Breadcrumb array
  currentFolderId,   // Current folder ID
  currentHubId,      // Current hub ID
  setPath,           // Set breadcrumb path
  navigateToFolder,  // Navigate to a folder
  navigateToHub,     // Navigate to a hub
  clear,             // Clear navigation
} = useReduxNavigation();
```

**Example:**

```tsx
import { useReduxNavigation } from '@platform/shared-state';

function FolderView({ folderId }) {
  const { navigateToFolder } = useReduxNavigation();

  const handleFolderClick = () => {
    navigateToFolder(folderId, [
      { id: 'home', label: 'Home' },
      { id: folderId, label: 'My Folder' },
    ]);
  };

  return <div onClick={handleFolderClick}>Open Folder</div>;
}
```

#### `useReduxSelection()`

Access selection state and actions.

```tsx
const {
  selectedIds,       // Array of selected IDs
  lastSelectedId,    // Last selected ID
  count,             // Selection count
  setSelection,      // Set selection
  toggleSelection,   // Toggle single item
  selectAll,         // Select all items
  selectRange,       // Select range (Shift+Click)
  clearSelection,    // Clear selection
} = useReduxSelection();
```

**Example:**

```tsx
import { useReduxSelection } from '@platform/shared-state';

function FileList({ files }) {
  const { selectedIds, toggleSelection, selectAll } = useReduxSelection();

  const handleFileClick = (fileId, event) => {
    if (event.ctrlKey || event.metaKey) {
      toggleSelection(fileId);
    } else {
      setSelection([fileId]);
    }
  };

  const handleSelectAll = () => {
    selectAll(files.map(f => f.id));
  };

  return (
    <div>
      <button onClick={handleSelectAll}>Select All</button>
      {files.map(file => (
        <div
          key={file.id}
          className={selectedIds.includes(file.id) ? 'selected' : ''}
          onClick={(e) => handleFileClick(file.id, e)}
        >
          {file.name}
        </div>
      ))}
    </div>
  );
}
```

### Low-Level Hooks

#### `useAppDispatch()`

Get typed dispatch function.

```tsx
import { useAppDispatch, setQuery } from '@platform/shared-state';

const dispatch = useAppDispatch();
dispatch(setQuery('test'));
```

#### `useAppSelector()`

Get typed selector function.

```tsx
import { useAppSelector, selectSearchQuery } from '@platform/shared-state';

const query = useAppSelector(selectSearchQuery);
```

## Redux vs Context Comparison

### Pattern Comparison

| Feature | Redux (`@platform/shared-state`) | Context (`@platform/context`) |
|---------|----------------------------------|-------------------------------|
| **State Access** | `useReduxSearch()` | `useSearch()` |
| **Boilerplate** | More (actions, reducers) | Less (direct state) |
| **Bundle Size** | ~13KB | ~5KB (with mitt) |
| **DevTools** | ✅ Redux DevTools | ❌ No DevTools |
| **Time Travel** | ✅ Yes | ❌ No |
| **Middleware** | ✅ Thunks, Sagas | ❌ No middleware |
| **Learning Curve** | Higher | Lower |
| **Performance** | Better (selector memoization) | Good (Context API) |
| **Testing** | Easier (pure reducers) | Moderate (context mocking) |

### Code Comparison

**Same Feature - Redux Pattern:**

```tsx
// Shell setup
import { createPlatformStore } from '@platform/shared-state';
import { Provider } from 'react-redux';

const store = createPlatformStore();

<Provider store={store}>
  <FilesTab />
</Provider>

// Tab usage
import { useReduxSearch } from '@platform/shared-state';

function FilesTab() {
  const { query, setQuery, filters, addFilter } = useReduxSearch();

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={() => addFilter({
        id: 'type',
        type: 'file-type',
        label: 'PDF',
        value: 'pdf'
      })}>
        Add Filter
      </button>
    </div>
  );
}
```

**Same Feature - Context Pattern:**

```tsx
// Shell setup
import { PlatformProvider } from '@platform/context';

<PlatformProvider user={user}>
  <FilesTab />
</PlatformProvider>

// Tab usage
import { useSearch } from '@platform/context';

function FilesTab() {
  const { query, setQuery, filters, addFilter } = useSearch();

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <button onClick={() => addFilter({
        id: 'type',
        type: 'file-type',
        label: 'PDF',
        value: 'pdf'
      })}>
        Add Filter
      </button>
    </div>
  );
}
```

**Observation:** The API is nearly identical! The difference is in setup and internal implementation.

### When to Use Redux

✅ **Use Redux when:**

1. **Need Redux DevTools**
   ```tsx
   // See state changes in real-time, time-travel debugging
   ```

2. **Complex State Logic**
   ```tsx
   // Multiple tabs need to coordinate complex state changes
   ```

3. **Middleware Requirements**
   ```tsx
   // Need thunks for async actions, sagas for complex flows
   import { createAsyncThunk } from '@reduxjs/toolkit';

   const fetchFiles = createAsyncThunk('files/fetch', async () => {
     const response = await api.getFiles();
     return response.data;
   });
   ```

4. **Team Familiarity**
   ```tsx
   // Team already knows Redux patterns
   ```

### When to Use Context

✅ **Use Context when:**

1. **Simplicity Priority**
   ```tsx
   // Less code, faster development
   ```

2. **Smaller Apps**
   ```tsx
   // Simple coordination, not much state
   ```

3. **Bundle Size Matters**
   ```tsx
   // Save ~8KB by avoiding Redux
   ```

4. **Independent Tabs**
   ```tsx
   // Tabs don't need to share much state
   ```

## Hybrid Approach (Recommended)

**You can use BOTH patterns together!**

```tsx
import { createPlatformStore } from '@platform/shared-state';
import { PlatformProvider, eventBus } from '@platform/context';
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
  // Use Redux for state coordination
  const { query, setQuery } = useReduxSearch();

  // Use Context for user info
  const user = useUser();

  // Use Event Bus for cross-tab events
  const handleFileSelect = (fileId) => {
    publishEvent('file:selected', {
      fileId,
      fileName: 'doc.pdf',
      timestamp: new Date(),
    });
  };

  return <div>Hybrid approach!</div>;
}
```

### Recommended Usage

| State Type | Pattern | Reason |
|------------|---------|--------|
| Search query | Redux | Needs coordination across tabs |
| Filters | Redux | Complex state, needs DevTools |
| Selection | Redux | Persists across tab switches |
| Navigation | Redux | Shared breadcrumbs |
| User info | Context | Simple, read-only |
| Events | Event Bus | Loose coupling |

## Advanced Usage

### Custom Selectors

```tsx
import { useAppSelector } from '@platform/shared-state';
import { createSelector } from '@reduxjs/toolkit';

const selectFilteredResults = createSelector(
  (state) => state.search.results,
  (state) => state.search.filters,
  (results, filters) => {
    // Custom filtering logic
    return filters.length > 0 ? results : { ...results, total: 0 };
  }
);

function ResultsPanel() {
  const filteredResults = useAppSelector(selectFilteredResults);
  return <div>Results: {filteredResults.total}</div>;
}
```

### Dispatch Multiple Actions

```tsx
import { useAppDispatch, setQuery, clearSelection } from '@platform/shared-state';

function SearchBar() {
  const dispatch = useAppDispatch();

  const handleNewSearch = (query: string) => {
    // Dispatch multiple actions together
    dispatch(setQuery(query));
    dispatch(clearSelection());
  };

  return <input onChange={(e) => handleNewSearch(e.target.value)} />;
}
```

### Listen to State Changes

```tsx
import { useEffect } from 'react';
import { useAppSelector, selectSearchQuery } from '@platform/shared-state';

function SearchLogger() {
  const query = useAppSelector(selectSearchQuery);

  useEffect(() => {
    if (query) {
      console.log('Search query changed:', query);
      // Analytics, logging, etc.
    }
  }, [query]);

  return null;
}
```

## Module Federation

To share Redux store across federated modules:

### Shell webpack.config.js

```javascript
new ModuleFederationPlugin({
  name: 'shell',
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    'react-redux': { singleton: true, requiredVersion: '^8.0.0' },
    '@reduxjs/toolkit': { singleton: true, requiredVersion: '^1.9.0' },
    '@platform/shared-state': { singleton: true, requiredVersion: '^1.0.0' },
  },
})
```

### Tab webpack.config.js

```javascript
new ModuleFederationPlugin({
  name: 'files_tab',
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    'react-redux': { singleton: true },
    '@reduxjs/toolkit': { singleton: true },
    '@platform/shared-state': { singleton: true },
  },
})
```

## Testing

### Testing Components

```tsx
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createPlatformStore } from '@platform/shared-state';

function renderWithStore(component) {
  const store = createPlatformStore();
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
}

test('component uses Redux state', () => {
  const { getByPlaceholderText } = renderWithStore(<SearchBar />);
  const input = getByPlaceholderText('Search...');
  expect(input).toBeInTheDocument();
});
```

### Testing Reducers

```tsx
import { searchSlice, setQuery } from '@platform/shared-state';

test('setQuery action updates state', () => {
  const initialState = { query: '', filters: [], results: { files: 0, folders: 0, hubs: 0, total: 0 } };
  const newState = searchSlice.reducer(initialState, setQuery('test'));
  expect(newState.query).toBe('test');
});
```

### Testing Selectors

```tsx
import { selectSearchQuery } from '@platform/shared-state';

test('selectSearchQuery returns query', () => {
  const state = {
    search: { query: 'test', filters: [], results: { files: 0, folders: 0, hubs: 0, total: 0 } },
  };
  expect(selectSearchQuery(state)).toBe('test');
});
```

## Architecture

```
@platform/shared-state
├── store.ts           # Store configuration
├── hooks.ts           # Convenience hooks
├── slices/
│   ├── searchSlice.ts      # Search state
│   ├── navigationSlice.ts  # Navigation state
│   └── selectionSlice.ts   # Selection state
└── index.ts           # Public API
```

## Migration Guide

### From Context to Redux

**Before (Context):**
```tsx
import { useSearch } from '@platform/context';

const { query, setQuery } = useSearch();
```

**After (Redux):**
```tsx
import { useReduxSearch } from '@platform/shared-state';

const { query, setQuery } = useReduxSearch();
```

**Changes needed:**
1. Install `@platform/shared-state`
2. Wrap shell with Redux `Provider`
3. Change import and hook name
4. API is identical after that!

## License

MIT
