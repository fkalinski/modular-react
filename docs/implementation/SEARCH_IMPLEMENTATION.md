# Search Results Implementation with Tab Hit Counts

## Overview

Instead of a separate search results page, the search functionality is integrated directly into the existing tab structure. When a user searches, hit counts appear next to each tab title showing how many items match in that category.

## User Experience

### Before Search:
```
┌──────────────────────────────────────┐
│ 📁 Files & Folders  |  🏢 Hubs       │  ← Tab navigation
└──────────────────────────────────────┘
```

### During Search (e.g., user types "test"):
```
┌──────────────────────────────────────┐
│ 📁 Files & Folders (23)  |  🏢 Hubs (5)  │  ← Hit counts shown
└──────────────────────────────────────┘
```

### Benefits:
- ✅ No separate search results page needed
- ✅ User stays in familiar tab interface
- ✅ Can see distribution of results across categories
- ✅ Click any tab to see matching items in that category
- ✅ Each tab filters its content based on search
- ✅ Consistent with Box UX patterns

## Architecture

### 1. TabPlugin Contract Extension

**File**: `content-platform/tab-contract/src/index.ts`

Added optional method to TabPlugin interface:

```typescript
export interface TabPlugin {
  // ... existing properties ...

  // Search support - returns number of items matching search
  getSearchHitCount?: (searchText: string) => number | Promise<number>;
}
```

### 2. Tab Implementation

Each tab implements `getSearchHitCount` to count matching items:

**Files Tab** (`content-platform/files-folders/src/plugin.tsx`):

```typescript
const FilesTabPlugin: TabPlugin = {
  // ... config, component, etc ...

  getSearchHitCount: (searchText: string) => {
    if (!searchText || searchText.trim() === '') {
      return mockFiles.length; // Return total when no search
    }

    const lowerSearch = searchText.toLowerCase();
    return mockFiles.filter(file =>
      file.name.toLowerCase().includes(lowerSearch) ||
      file.mimeType?.toLowerCase().includes(lowerSearch)
    ).length;
  },
};
```

**Hubs Tab** (`hubs-tab/src/plugin.tsx`):

```typescript
const HubsTabPlugin: TabPlugin = {
  // ... config, component, etc ...

  getSearchHitCount: (searchText: string) => {
    if (!searchText || searchText.trim() === '') {
      return mockHubs.length; // Return total when no search
    }

    const lowerSearch = searchText.toLowerCase();
    return mockHubs.filter(hub =>
      hub.name.toLowerCase().includes(lowerSearch) ||
      hub.description.toLowerCase().includes(lowerSearch)
    ).length;
  },
};
```

### 3. ContentPlatform Display

**File**: `content-platform/shell/src/ContentPlatform.tsx`

ContentPlatform calls `getSearchHitCount` and displays results:

```typescript
// Get search hit counts for each tab
const getTabHitCount = (plugin: any) => {
  const searchQuery = contentContext.filters.searchText;

  if (!searchQuery || searchQuery.trim() === '') {
    return null; // Don't show count when not searching
  }

  if (plugin.getSearchHitCount) {
    try {
      return plugin.getSearchHitCount(searchQuery);
    } catch (error) {
      console.error(`Error getting hit count for ${plugin.config.id}:`, error);
      return null;
    }
  }
  return null;
};

// In tab rendering:
{loadedTabs.map(({ plugin }) => {
  const hitCount = getTabHitCount(plugin);

  return (
    <button>
      {plugin.config.icon} {plugin.config.name}
      {hitCount !== null && <span>({hitCount})</span>}
    </button>
  );
})}
```

## Search Flow

### 1. User Types in SearchBar (TopBar)

```
User types "test" in TopBar
     ↓
SearchBar updates searchValue state
     ↓
Passed down to ContentPlatform via context
```

### 2. ContentPlatform Gets Search Text

```typescript
const contentContext: ContentContext = {
  filters: {
    searchText: filters.searchText || searchText,  // ← From TopBar
    active: [],
    // ...
  },
  // ...
};
```

### 3. Platform Calls getSearchHitCount

```typescript
// For each tab plugin:
const hitCount = plugin.getSearchHitCount(searchText);

// Files: "test" → searches file names/types → returns 23
// Hubs: "test" → searches hub names/descriptions → returns 5
```

### 4. Display Hit Counts in Tab Titles

```
📁 Files & Folders (23)  |  🏢 Hubs (5)
```

### 5. Tab Filters Content

When user clicks a tab, the tab component filters its content:

```typescript
// In FilesTabComponent:
useEffect(() => {
  if (context.filters.searchText) {
    const filtered = mockFiles.filter(f =>
      f.name.toLowerCase().includes(context.filters.searchText.toLowerCase())
    );
    setFiles(filtered);
  } else {
    setFiles(mockFiles);
  }
}, [context.filters.searchText]);
```

## Implementation Details

### Hit Count Styling

```typescript
const hitCountStyles: React.CSSProperties = {
  marginLeft: '4px',
  color: '#767676',      // Muted gray
  fontWeight: 400,       // Regular weight (tab name is 600)
};

// Applied as:
<span style={hitCountStyles}>({hitCount})</span>
```

### Visual Example:

```
┌─────────────────────────────────────────────────────┐
│  📁 Files & Folders (23)    🏢 Hubs (5)             │
│  ─────────────────────                              │
│     └─ Blue underline (active tab)                  │
│                                                      │
│  Name column shows only matching files...           │
└─────────────────────────────────────────────────────┘
```

## Extension Points

### Adding Search to New Tabs

Any tab can implement search hit counts:

```typescript
const MyNewTabPlugin: TabPlugin = {
  config: { /* ... */ },
  component: MyTabComponent,

  // Add this method:
  getSearchHitCount: (searchText: string) => {
    if (!searchText) return myData.length;

    return myData.filter(item =>
      // Search logic for your data
      item.name.toLowerCase().includes(searchText.toLowerCase())
    ).length;
  },
};
```

### Advanced Search

Tabs can search across multiple fields:

```typescript
getSearchHitCount: (searchText: string) => {
  const lowerSearch = searchText.toLowerCase();

  return items.filter(item =>
    item.name.toLowerCase().includes(lowerSearch) ||
    item.description.toLowerCase().includes(lowerSearch) ||
    item.tags?.some(tag => tag.toLowerCase().includes(lowerSearch)) ||
    item.author?.toLowerCase().includes(lowerSearch)
  ).length;
},
```

### Async Search (Backend)

For tabs with backend data sources:

```typescript
getSearchHitCount: async (searchText: string) => {
  if (!searchText) return 0;

  try {
    const response = await fetch(`/api/search/count?q=${searchText}&type=files`);
    const { count } = await response.json();
    return count;
  } catch (error) {
    console.error('Search count failed:', error);
    return 0;
  }
},
```

## Search Context Flow

```
┌─────────────────────────────────────────────────────────┐
│  Top-Level Shell                                        │
│  ┌───────────────────────────────────────────────┐     │
│  │  TopBar                                        │     │
│  │  ┌──────────────────────────────┐             │     │
│  │  │ SearchBar: "test" ────┐      │             │     │
│  │  └──────────────────────────────┘             │     │
│  └────────────────│──────────────────────────────┘     │
│                   │                                     │
│                   ↓ searchValue state                   │
│                                                          │
│  ┌───────────────────────────────────────────────┐     │
│  │  ContentPlatform                              │     │
│  │                                                │     │
│  │  context.filters.searchText = "test"          │     │
│  │                                                │     │
│  │  Calls:                                        │     │
│  │  - FilesTab.getSearchHitCount("test") → 23    │     │
│  │  - HubsTab.getSearchHitCount("test") → 5      │     │
│  │                                                │     │
│  │  Displays:                                     │     │
│  │  📁 Files (23)  │  🏢 Hubs (5)                 │     │
│  │  ──────────────                                │     │
│  │                                                │     │
│  │  Passes context to active tab ↓               │     │
│  │                                                │     │
│  │  ┌──────────────────────────────────┐         │     │
│  │  │ FilesTab                          │         │     │
│  │  │                                   │         │     │
│  │  │ Filters files by "test":          │         │     │
│  │  │ - test-results.xlsx ✅            │         │     │
│  │  │ - testing-guide.pdf ✅            │         │     │
│  │  │ - budget.xlsx ❌                  │         │     │
│  │  │                                   │         │     │
│  │  │ Shows only 23 matching files      │         │     │
│  │  └──────────────────────────────────┘         │     │
│  └───────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## Advantages Over Separate Search Results Page

### 1. Consistency
- Users stay in familiar tab structure
- No context switching between search view and normal view
- Navigation remains consistent

### 2. Flexibility
- Each tab can implement custom search logic
- Different data sources, different search algorithms
- Async/sync search both supported

### 3. Discoverability
- Hit counts show result distribution across categories
- "Files (23) | Hubs (5)" tells user where matches are
- Can prioritize which tab to check first

### 4. Extensibility
- New tabs automatically get search support by implementing one method
- Platform doesn't need to know about each tab's data structure
- Tabs own their search logic

### 5. Performance
- Only active tab loads/filters data
- Hit counts are fast (just counting)
- No need to load all results at once

## Testing

### Manual Test:

1. Start all services
2. Navigate to Content section
3. Type "test" in TopBar SearchBar
4. Verify hit counts appear: "Files (X) | Hubs (Y)"
5. Click each tab to see filtered results
6. Clear search → counts disappear, see all content

### E2E Test:

```typescript
test('search shows hit counts in tabs', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Content');

  // Search for "test"
  await page.fill('[placeholder*="Search"]', 'test');

  // Check Files tab shows hit count
  const filesTab = page.locator('text=Files & Folders');
  await expect(filesTab).toContainText('(');

  // Check Hubs tab shows hit count
  const hubsTab = page.locator('text=Hubs');
  await expect(hubsTab).toContainText('(');

  // Click Files tab
  await filesTab.click();

  // Verify only matching files shown
  await expect(page.locator('table')).not.toContainText('Budget 2024');
});
```

## Future Enhancements

### 1. Highlight Matching Text

In table cells, highlight the search term:

```typescript
const highlightText = (text: string, search: string) => {
  if (!search) return text;

  const parts = text.split(new RegExp(`(${search})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase()
      ? <mark key={i}>{part}</mark>
      : part
  );
};
```

### 2. Search Suggestions

Show suggestions as user types:

```typescript
getSearchSuggestions?: (searchText: string) => string[];

// Files tab suggests:
- "test-results.xlsx"
- "testing-guide.pdf"
```

### 3. Advanced Filters

Combine search with filters:

```
Search: "test"  +  Type: Excel  +  Modified: Last 7 days
→ Files (3) | Hubs (0)
```

### 4. Search History

Store recent searches:

```typescript
const [searchHistory, setSearchHistory] = useState<string[]>([]);

// Dropdown showing:
- "test results"
- "budget 2024"
- "marketing"
```

## Summary

This implementation provides:
- ✅ Seamless search experience within tab structure
- ✅ Real-time hit counts showing result distribution
- ✅ Extension point for any tab to support search
- ✅ Consistent with Box UX patterns
- ✅ No separate search results page needed
- ✅ Each tab owns its search logic
- ✅ Type-safe via TabPlugin contract

The search results are integrated into the existing navigation, making it intuitive and efficient for users to find content across different categories.
