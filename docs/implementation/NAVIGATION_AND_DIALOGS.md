# Navigation Patterns & Shared Dialogs

## Overview

This document explains how federated modules can:
1. Navigate between sections programmatically
2. Use shared dialog components (like Content Picker)
3. Share reusable UI patterns across the platform

## Architecture

### Navigation Service

The Navigation Service provides a context-based navigation system that works across all federated boundaries. It's exposed from `shared-components` and consumed by all modules.

**Key Features:**
- ✅ Type-safe navigation between sections
- ✅ Works across federated module boundaries
- ✅ Shared context via React Context API
- ✅ Supports programmatic navigation
- ✅ Navigation links with active state

### Content Picker Dialog

The Content Picker is a reusable dialog for selecting locations (folders, hubs, workspaces). It's a shared component that demonstrates how complex UI patterns can be federated and reused.

**Key Features:**
- ✅ Tree-based location browser
- ✅ Single or multi-select mode
- ✅ Search/filter capability
- ✅ Type filtering (folders, hubs, workspaces)
- ✅ Box design system styling
- ✅ Fully accessible

## Navigation Service Implementation

### 1. Provider Setup (Top-Level Shell)

The NavigationProvider wraps the entire application in the top-level shell:

**File**: `top-level-shell/src/App.tsx`

```typescript
import { lazy } from 'react';

const NavigationProvider = lazy(() =>
  import('shared_components/NavigationService').then(m => ({
    default: m.NavigationProvider
  }))
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('content');

  return (
    <ThemeProvider>
      <NavigationProvider
        currentSection={activeTab}
        onNavigate={(target) => setActiveTab(target as TabId)}
      >
        {/* App content */}
      </NavigationProvider>
    </ThemeProvider>
  );
};
```

**How it works:**
- NavigationProvider receives the current active section
- `onNavigate` callback updates the active section
- All child components get access to navigation via context

### 2. Using Navigation in Federated Modules

Any federated module can use the `useNavigation` hook:

**Example - Files Tab**: `content-platform/files-folders/src/plugin.tsx`

```typescript
import { useNavigation } from 'shared_components/NavigationService';

const MyComponent = () => {
  const { navigateTo, currentSection } = useNavigation();

  const handleGenerateReport = () => {
    // Navigate to reports section
    navigateTo('reports', { fileIds: selectedFiles });
  };

  return (
    <button onClick={handleGenerateReport}>
      Generate Report
    </button>
  );
};
```

**Available Navigation Methods:**

```typescript
interface NavigationContextValue {
  // Navigate to a section
  navigateTo: (target: NavigationTarget, params?: Record<string, any>) => void;

  // Current active section
  currentSection: NavigationTarget;

  // Navigate back (optional)
  goBack?: () => void;

  // Navigate with complex state
  navigateWithState?: (target: NavigationTarget, state: any) => void;
}

type NavigationTarget = 'content' | 'reports' | 'user' | 'archives' | 'admin';
```

### 3. Navigation Links

Use `NavigationLink` for declarative navigation:

```typescript
import { NavigationLink } from 'shared_components/NavigationService';

<NavigationLink to="reports" params={{ type: 'sales' }}>
  View Sales Reports
</NavigationLink>
```

**Features:**
- Automatically highlights active section
- Prevents default anchor behavior
- Type-safe navigation targets
- Custom styling support

**Example in Files Tab:**

```typescript
{selectedFiles.length > 0 && (
  <NavigationLink to="reports">
    Generate Report from {selectedFiles.length} file(s) →
  </NavigationLink>
)}
```

## Content Picker Implementation

### 1. Component Exposure

Content Picker is exposed from shared-components:

**File**: `shared-components/webpack.config.js`

```javascript
exposes: {
  './ContentPicker': './src/components/ContentPicker',
  // ... other components
}
```

**File**: `shared-components/src/index.ts`

```typescript
export {
  ContentPicker,
  type ContentPickerProps,
  type ContentLocation
} from './components/ContentPicker';
```

### 2. Using Content Picker

Any tab can import and use the Content Picker:

**Example - Files Tab**:

```typescript
import { lazy, useState } from 'react';

const ContentPicker = lazy(() =>
  import('shared_components/ContentPicker').then(m => ({
    default: m.ContentPicker
  }))
);

const FilesTab = () => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  // Folder tree structure
  const folderLocations = [
    {
      id: 'root',
      name: 'My Documents',
      type: 'folder',
      icon: '📁',
      children: [
        {
          id: 'work',
          name: 'Work',
          type: 'folder',
          icon: '📁',
          children: [
            { id: 'projects', name: 'Projects', type: 'folder', icon: '📁' },
            { id: 'reports', name: 'Reports', type: 'folder', icon: '📁' },
          ],
        },
      ],
    },
  ];

  return (
    <>
      {/* Trigger button */}
      <Button
        onClick={() => setIsPickerOpen(true)}
        disabled={selectedFiles.length === 0}
      >
        Move To...
      </Button>

      {/* Content Picker Dialog */}
      <ContentPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(location) => {
          console.log('Moving files to:', location);
          moveFiles(selectedFiles, location.id);
          setIsPickerOpen(false);
        }}
        title="Choose Destination"
        locations={folderLocations}
        multiSelect={false}
        searchable={true}
        confirmLabel="Move Here"
      />
    </>
  );
};
```

### 3. Content Picker Props

```typescript
interface ContentPickerProps {
  // Control visibility
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: ContentLocation | ContentLocation[]) => void;

  // Content
  title?: string;
  locations: ContentLocation[];

  // Configuration
  multiSelect?: boolean;
  allowedTypes?: ('folder' | 'hub' | 'workspace')[];
  selectedIds?: string[];
  searchable?: boolean;

  // Labels
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ContentLocation {
  id: string;
  name: string;
  type: 'folder' | 'hub' | 'workspace';
  icon?: string;
  children?: ContentLocation[];
  path?: string;
}
```

### 4. Content Picker Features

#### Single Selection

```typescript
<ContentPicker
  locations={folders}
  multiSelect={false}
  onSelect={(location) => {
    // location is a single ContentLocation
    console.log('Selected:', location.name);
  }}
/>
```

#### Multi-Selection

```typescript
<ContentPicker
  locations={folders}
  multiSelect={true}
  onSelect={(locations) => {
    // locations is an array of ContentLocation[]
    console.log('Selected:', locations.map(l => l.name));
  }}
/>
```

#### Type Filtering

Only allow selection of specific types:

```typescript
<ContentPicker
  locations={allLocations}
  allowedTypes={['folder']}  // Only folders selectable
  onSelect={(location) => {
    // Can only be a folder
  }}
/>
```

#### With Search

```typescript
<ContentPicker
  locations={folders}
  searchable={true}  // Shows search input
  onSelect={(location) => {
    // User can search through tree
  }}
/>
```

#### Pre-selected Items

```typescript
<ContentPicker
  locations={folders}
  selectedIds={['work-1', 'work-2']}  // Pre-select these
  multiSelect={true}
  onSelect={(locations) => {
    // ...
  }}
/>
```

## Use Cases

### Use Case 1: Move Files Between Folders

**Files Tab** uses Content Picker to move files:

```typescript
const handleMoveFiles = () => {
  setIsPickerOpen(true);
};

<ContentPicker
  isOpen={isPickerOpen}
  onClose={() => setIsPickerOpen(false)}
  onSelect={(destination) => {
    // Move selected files to destination folder
    moveFilesToFolder(selectedFiles, destination.id);
    setIsPickerOpen(false);
  }}
  title="Move to Folder"
  locations={folderTree}
  allowedTypes={['folder']}  // Only folders
/>
```

### Use Case 2: Choose Hub for Content

**Content Platform** uses Content Picker to choose a hub:

```typescript
<ContentPicker
  isOpen={isHubPickerOpen}
  onClose={() => setIsHubPickerOpen(false)}
  onSelect={(hub) => {
    // Add content to selected hub
    addContentToHub(selectedItems, hub.id);
    setIsHubPickerOpen(false);
  }}
  title="Add to Hub"
  locations={hubsTree}
  allowedTypes={['hub']}  // Only hubs
  searchable={true}
/>
```

### Use Case 3: Multi-Select Locations for Search

**Search Feature** uses Content Picker for choosing search scope:

```typescript
<ContentPicker
  isOpen={isSearchScopeOpen}
  onClose={() => setIsSearchScopeOpen(false)}
  onSelect={(locations) => {
    // Search within selected locations
    performSearch(searchQuery, locations.map(l => l.id));
    setIsSearchScopeOpen(false);
  }}
  title="Choose Search Locations"
  locations={allLocations}
  multiSelect={true}  // Can select multiple
  selectedIds={currentSearchScope}
  searchable={false}
/>
```

### Use Case 4: Navigate to Reports with Context

**Files Tab** navigates to Reports with selected files:

```typescript
import { useNavigation } from 'shared_components/NavigationService';

const { navigateTo } = useNavigation();

const handleGenerateReport = () => {
  navigateTo('reports', {
    fileIds: selectedFiles,
    reportType: 'usage',
  });
};

<button onClick={handleGenerateReport}>
  Generate Usage Report
</button>
```

**Reports Tab** receives the navigation params:

```typescript
// Reports tab can read params from URL or context
const ReportsTab = () => {
  const { fileIds, reportType } = useNavigationParams();

  useEffect(() => {
    if (fileIds) {
      // Generate report for specific files
      generateReport(reportType, fileIds);
    }
  }, [fileIds, reportType]);
};
```

## Styling and Theming

### Content Picker Styling

Content Picker follows Box design system:

- **Colors**: Primary blue (#0061d5), gray backgrounds (#f7f7f8)
- **Typography**: 13px base, -apple-system font stack
- **Spacing**: 8px/12px/16px/20px rhythm
- **Borders**: 1px solid #e2e2e2
- **Radius**: 4px for buttons, 8px for dialog
- **Shadows**: Subtle elevation (0 4px 20px rgba(0,0,0,0.15))

### Custom Styling

While Content Picker doesn't accept custom styles directly, it's designed to match Box design system and will fit seamlessly with other shared components.

## Federation Architecture

### How It Works at Runtime

```
1. User clicks "Move To..." button in Files Tab
   ↓
2. Files Tab sets isPickerOpen = true
   ↓
3. React lazy loads ContentPicker from shared-components remote
   ↓
4. Webpack fetches ContentPicker.js chunk from localhost:3001
   ↓
5. ContentPicker renders with provided locations prop
   ↓
6. User selects folder "Work/Projects"
   ↓
7. onSelect callback fires in Files Tab
   ↓
8. Files Tab moves selected files
   ↓
9. Files Tab sets isPickerOpen = false
   ↓
10. ContentPicker unmounts
```

### Network Requests

```
Initial page load:
- localhost:3000/main.js (shell)
- localhost:3001/remoteEntry.js (shared-components manifest)

User clicks "Move To...":
- localhost:3001/ContentPicker.js (lazy loaded chunk)

User clicks "Generate Report":
- Navigation happens in-memory (no network request)
- Reports tab loads if not already loaded
```

### Shared Dependencies

Both NavigationService and ContentPicker use:
- **React** (singleton, shared across all modules)
- **React-DOM** (singleton, shared across all modules)
- No other dependencies!

This ensures minimal bundle size and no version conflicts.

## Testing

### Manual Testing - Content Picker

1. Start all services
2. Navigate to Content → Files & Folders
3. Select 1+ files
4. Click "Move To..." button
5. Verify Content Picker dialog appears
6. Try searching for folders
7. Try expanding/collapsing tree
8. Select a folder
9. Click "Move Here"
10. Verify dialog closes and action completes

### Manual Testing - Navigation

1. Navigate to Content → Files & Folders
2. Select 1+ files
3. Click "Generate Report" link (bottom right)
4. Verify navigation to Reports section
5. Verify Reports section receives file context

### E2E Testing

```typescript
test('ContentPicker allows moving files', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Content');

  // Select files
  await page.click('[type="checkbox"]', { nth: 0 });

  // Open picker
  await page.click('text=Move To...');

  // Verify dialog
  await expect(page.locator('text=Choose Destination')).toBeVisible();

  // Expand folder
  await page.click('text=My Documents >> svg');

  // Select folder
  await page.click('text=Work');

  // Confirm
  await page.click('text=Move Here');

  // Verify dialog closed
  await expect(page.locator('text=Choose Destination')).not.toBeVisible();
});

test('Navigation link works across sections', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Content');

  // Select files
  await page.click('[type="checkbox"]');

  // Click navigation link
  await page.click('text=Generate Report');

  // Verify navigated to Reports
  await expect(page.locator('text=Reports Dashboard')).toBeVisible();
});
```

## Extension Points

### Creating New Shared Dialogs

Follow the Content Picker pattern to create other shared dialogs:

1. **Create component** in `shared-components/src/components/MyDialog.tsx`
2. **Export** from `shared-components/src/index.ts`
3. **Add to webpack exposes** in `shared-components/webpack.config.js`
4. **Use in tabs** via lazy import

**Example - User Picker Dialog:**

```typescript
// shared-components/src/components/UserPicker.tsx
export interface UserPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (user: User | User[]) => void;
  users: User[];
  multiSelect?: boolean;
}

export const UserPicker: React.FC<UserPickerProps> = ({ ... }) => {
  // Similar implementation to ContentPicker
};

// Usage in any tab:
const UserPicker = lazy(() =>
  import('shared_components/UserPicker').then(m => ({
    default: m.UserPicker
  }))
);
```

### Adding Navigation Targets

To add new navigation targets:

1. **Update type** in `shared-components/src/services/NavigationService.tsx`:

```typescript
export type NavigationTarget =
  | 'content'
  | 'reports'
  | 'user'
  | 'archives'  // ← New target
  | 'admin';
```

2. **Add to top-level shell** sidebar:

```typescript
const tabs: Tab[] = [
  { id: 'content', label: 'Content', component: ContentShell },
  { id: 'reports', label: 'Reports', component: ReportsTab },
  { id: 'archives', label: 'Archives', component: ArchivesTab },  // ← New
  { id: 'user', label: 'User', component: UserTab },
];
```

3. **Use in any module**:

```typescript
const { navigateTo } = useNavigation();

<button onClick={() => navigateTo('archives')}>
  View Archives
</button>
```

## Best Practices

### 1. Always Lazy Load

```typescript
// ✅ Good
const ContentPicker = lazy(() => import('shared_components/ContentPicker'));

// ❌ Bad - loads eagerly, increases initial bundle
import { ContentPicker } from 'shared_components/ContentPicker';
```

### 2. Wrap in Suspense

```typescript
// ✅ Good
<Suspense fallback={null}>
  <ContentPicker isOpen={isOpen} ... />
</Suspense>

// ❌ Bad - will error if component hasn't loaded
<ContentPicker isOpen={isOpen} ... />
```

### 3. Control Dialog State Locally

```typescript
// ✅ Good - state in component that owns the picker
const [isPickerOpen, setIsPickerOpen] = useState(false);

// ❌ Bad - state in global store is unnecessary
const isPickerOpen = useSelector(state => state.ui.isPickerOpen);
```

### 4. Close Dialog on Success

```typescript
// ✅ Good
onSelect={(location) => {
  performAction(location);
  setIsPickerOpen(false);  // ← Close dialog
}}

// ❌ Bad - dialog stays open
onSelect={(location) => {
  performAction(location);
  // Dialog still open, confusing UX
}}
```

### 5. Type-Safe Navigation

```typescript
// ✅ Good - TypeScript catches invalid targets
navigateTo('reports');  // OK
navigateTo('invalid');  // Error: Type '"invalid"' is not assignable

// ❌ Bad - no type safety
navigateTo('reports' as any);
```

## Performance Considerations

### Bundle Sizes

- **ContentPicker**: ~15KB (gzipped)
- **NavigationService**: ~3KB (gzipped)
- Both loaded **on-demand** via lazy loading
- Shared React instance means no duplicate framework code

### Loading Strategy

1. **Initial load**: Shell + shared-components remote manifest
2. **User navigates to Content**: Load Files tab + Tree/Table components
3. **User clicks "Move To..."**: Load ContentPicker chunk
4. **User clicks navigation link**: Load target section (Reports tab)

### Caching

- Webpack caches loaded chunks
- Once ContentPicker is loaded, subsequent opens are instant
- React Suspense handles loading states automatically

## Troubleshooting

### ContentPicker doesn't appear

**Check:**
1. Is `isOpen` prop actually true?
2. Is component wrapped in Suspense?
3. Is shared-components remote running? (localhost:3001)
4. Check browser console for Module Federation errors

### Navigation doesn't work

**Check:**
1. Is NavigationProvider wrapping the app?
2. Is `useNavigation` called inside NavigationProvider?
3. Is target in NavigationTarget type?
4. Check browser console for context errors

### Dialog appears but is unstyled

**Check:**
1. Are Box design system styles loading?
2. Is ThemeProvider wrapping the app?
3. Check for CSS conflicts in browser DevTools

## Summary

**Navigation Patterns:**
- ✅ Type-safe navigation across federated modules
- ✅ Context-based architecture works across boundaries
- ✅ NavigationLink component for declarative navigation
- ✅ Supports navigation with parameters/state

**Content Picker Dialog:**
- ✅ Reusable across all federated tabs
- ✅ Tree-based location browser
- ✅ Single/multi-select modes
- ✅ Search and type filtering
- ✅ Box design system styling

**Module Federation:**
- ✅ Both shared via Module Federation
- ✅ Lazy loaded on demand
- ✅ React singleton ensures no conflicts
- ✅ Production-ready architecture

This architecture demonstrates how complex, interactive UI patterns can be shared across independent federated modules while maintaining type safety and excellent UX.
