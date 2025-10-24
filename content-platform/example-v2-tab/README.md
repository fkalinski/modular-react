# Search Results Tab - Tab Contract v2 Example

This is a reference implementation of a tab using the enhanced Tab Contract v2 with Platform Context integration.

## Features Demonstrated

### 1. Platform Context Integration
- Uses `usePlatformContext()` hook to access shared state
- Reacts to search query changes
- Uses navigation, selection, and user context

### 2. Event Bus Communication
- Subscribes to platform events:
  - `search:submitted`
  - `file:selected`
  - `navigation:changed`
- Publishes custom events:
  - `tab:activated`
  - `tab:deactivated`
  - `search:exported`
  - `search:refine-requested`

### 3. Filter Contributions
- Contributes "Result Type" filter (select)
- Contributes "Min Relevance" filter (select)
- Filters are automatically integrated into platform UI
- Filter values are applied via Platform Context

### 4. Action Contributions
- "Export Results" button (visible when items selected)
- "Refine Search" button (always visible)
- Actions receive Platform Context for state access

### 5. Lifecycle Hooks
- `onActivate()`: Restores scroll position
- `onDeactivate()`: Saves scroll position
- `getState()`: Exports current tab state
- `setState()`: Restores tab state
- `cleanup()`: Cleans up subscriptions

### 6. Search Integration
- Implements `onSearch()` to return hit count
- Hit count displayed in tab navigation
- Integrates with platform search system

## Running Standalone

```bash
npm install
npm run dev
```

Visit http://localhost:3007

## Using in Content Platform

The tab is automatically loaded by the Content Platform Shell when configured in the tab registry.

## Code Structure

```
src/
├── SearchResultsTab.tsx    # Tab component with UI
├── Plugin.tsx              # v2 Tab Plugin with contributions
└── index.ts                # Exports
```

## Platform Context Usage

```typescript
const platformContext = usePlatformContext();

// Access search state
platformContext.search.query
platformContext.search.filters
platformContext.search.setQuery(query)
platformContext.search.addFilter(filter)

// Access selection state
platformContext.selection.selectedIds
platformContext.selection.toggleSelection(id)

// Access navigation state
platformContext.navigation.currentPath
platformContext.navigation.navigateTo(breadcrumb)

// Access user info
platformContext.user.name
platformContext.user.email
```

## Event Bus Usage

```typescript
import { subscribeToEvent, publishEvent } from '@platform/context';

// Subscribe to events
const unsubscribe = subscribeToEvent('search:submitted', (data) => {
  console.log('Search:', data.query);
});

// Publish events
publishEvent('search:exported', {
  query: 'test',
  count: 5,
  timestamp: new Date(),
});

// Cleanup
unsubscribe();
```

## Filter Contributions

```typescript
contributesFilters: [
  {
    id: 'my-filter',
    label: 'My Filter',
    type: 'select',
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
    defaultValue: 'option1',
    apply: (value, context) => {
      context.search.addFilter({
        id: 'myFilter',
        key: 'myKey',
        value: value,
        label: 'My Filter',
      });
    },
  },
]
```

## Action Contributions

```typescript
contributesActions: [
  {
    id: 'my-action',
    label: 'My Action',
    icon: '🔥',
    onClick: (context) => {
      // Do something with context
      console.log('Selected:', context.selection.selectedIds);
    },
    isVisible: (context) => {
      // Control visibility based on context
      return context.selection.selectedIds.length > 0;
    },
  },
]
```

## Next Steps

To create your own v2 tab:

1. Copy this example as a template
2. Customize the UI in `SearchResultsTab.tsx`
3. Add your filter contributions in `Plugin.tsx`
4. Add your action contributions in `Plugin.tsx`
5. Implement `onSearch()` for hit count integration
6. Subscribe to relevant platform events
7. Publish custom events for cross-tab communication

## Migration from v1

See `COMMUNICATION_INFRASTRUCTURE.md` for the full migration guide from v1 to v2 contract.
