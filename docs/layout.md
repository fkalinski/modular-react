# Plan: Apply Box Design System to Modular Platform

## Overview
Transform the entire platform to match Box's design system (exact replica) with:
- Dark left sidebar navigation (#2d2d2d)
- Hybrid navigation (sidebar + content tabs)
- Box color scheme throughout
- Updated component library
- Restructured Content platform layout

## Design Reference
- **image.png**: Main Box admin interface with dark sidebar
- **image2.png**: Files & Folders view with two-column layout (tree + table)
- **image3.png**: Search results view with breadcrumbs

## Phase 1: Design System & Theme (shared-components)

### 1.1 Update ThemeProvider with Box Colors
**File**: `shared-components/src/theme/ThemeProvider.tsx`

**Add Box design tokens:**
```typescript
colors: {
  // Primary
  primary: '#0061d5',        // Box blue
  primaryHover: '#0053ba',
  primaryLight: '#e7f1ff',

  // Sidebar
  sidebarBg: '#2d2d2d',
  sidebarText: '#ffffff',
  sidebarTextMuted: '#a0a0a0',
  sidebarHover: '#404040',
  sidebarActive: '#0061d5',

  // Background
  background: '#f7f7f8',     // Main bg
  surface: '#ffffff',        // Cards, tables

  // Text
  textPrimary: '#222222',
  textSecondary: '#767676',
  textMuted: '#909090',

  // Borders
  border: '#e2e2e2',
  borderLight: '#f0f0f0',

  // States
  hover: '#f7f7f8',
  selected: '#e7f1ff',
  selectedBorder: '#0061d5',
}

spacing: {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
}

typography: {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: {
    xs: '11px',
    sm: '12px',
    md: '13px',
    lg: '14px',
    xl: '16px',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  }
}
```

### 1.2 Update Button Component
**File**: `shared-components/src/components/Button.tsx`

**Changes:**
- **Primary**: solid #0061d5, white text, hover #0053ba
- **Secondary**: white bg, 1px border #d3d3d3, gray text
- **Tertiary**: transparent, no border, text only
- Size adjustments:
  - small: 6px 12px, 12px font
  - medium: 10px 16px, 13px font
  - large: 12px 20px, 14px font
- Border radius: 4px
- Font weight: 500
- Transition: all 0.15s

### 1.3 Update Input Component
**File**: `shared-components/src/components/Input.tsx`

**Changes:**
- Border: 1px solid #d3d3d3
- Focus border: 2px solid #0061d5
- Background: #ffffff
- Padding: 8px 12px
- Font size: 13px
- Border radius: 4px
- Placeholder color: #909090
- Add search input variant with magnifying glass icon
- Height: 36px

### 1.4 Update Table Component
**File**: `shared-components/src/components/Table.tsx`

**Changes:**
- **Header**:
  - Background: #fafafa
  - Text: #767676, uppercase, 11px, font-weight 600
  - Padding: 12px 16px
  - Border bottom: 1px solid #e2e2e2
- **Rows**:
  - Height: 48px
  - Padding: 12px 16px
  - Border bottom: 1px solid #e2e2e2
  - Hover: #f7f7f8
- **Selected row**:
  - Background: #e7f1ff
  - Left border: 2px solid #0061d5
- **Features to add**:
  - File type icons in name column
  - Row actions on hover (download, share, more)
  - Sorting indicators
  - Checkbox column for selection

### 1.5 Update Tree Component
**File**: `shared-components/src/components/Tree.tsx`

**Changes:**
- Remove box shadow and borders
- **Node styling**:
  - Height: 32px
  - Padding: 6px 8px
  - Border radius: 4px
  - Font size: 13px
- **Selected node**:
  - Background: #e7f1ff
  - Left border: 2px solid #0061d5
  - Font weight: 500
- **Hover**: Background #f7f7f8
- **Indent**: 16px per level
- **Icons**:
  - Folder: blue folder icon (📁)
  - Yellow folder for special types (📂)
  - Expand: chevron right (▶) / down (▼)
- **Trash item**: Add trash icon (🗑️) with special styling

### 1.6 Create New Components

#### Sidebar Component
**New file**: `shared-components/src/components/Sidebar.tsx`

```typescript
interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string; // e.g., "NEW"
}

interface SidebarProps {
  items: SidebarItem[];
  activeId: string;
  onItemClick: (id: string) => void;
}
```

**Styling**:
- Width: 216px
- Background: #2d2d2d
- Fixed position, full height
- Box logo at top (48px height)
- Items:
  - Padding: 12px 20px
  - Color: #ffffff
  - Hover: #404040
  - Active: #0061d5 background
  - Icon size: 20px
  - Font size: 14px
  - Gap: 12px between icon and text

#### TopBar Component
**New file**: `shared-components/src/components/TopBar.tsx`

```typescript
interface TopBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  userName: string;
  userInitials: string;
}
```

**Styling**:
- Height: 56px
- Background: #ffffff
- Border bottom: 1px solid #e2e2e2
- Layout: search (left) | utilities (right)
- Right utilities:
  - Help icon (?)
  - Notifications bell
  - User avatar (circle, blue bg, white text)
  - All icons: 32px diameter, gray hover bg

#### SearchBar Component
**New file**: `shared-components/src/components/SearchBar.tsx`

```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  scope?: string; // e.g., "CONTENT"
}
```

**Styling**:
- Blue pill button on left: "CONTENT" in white on #0061d5
- White input field: 1px border #d3d3d3
- Filter icon button on right
- Clear button (×) when has value
- Height: 36px
- Max width: 600px
- Border radius: pill shape (18px)

#### FileIcon Component
**New file**: `shared-components/src/components/FileIcon.tsx`

```typescript
interface FileIconProps {
  type: 'folder' | 'folder-yellow' | 'excel' | 'word' | 'pdf' | 'file';
  size?: 'small' | 'medium' | 'large';
}
```

**Icon mapping**:
- folder: 📁 (blue)
- folder-yellow: 📂
- excel: green spreadsheet icon
- word: blue document icon
- pdf: red PDF icon
- file: generic gray icon

## Phase 2: Top-Level Shell Restructure

### 2.1 Update App.tsx Layout
**File**: `top-level-shell/src/App.tsx`

**Major structural changes:**

```typescript
// Remove old header with tabs
// New structure:
<div style={{ display: 'flex', height: '100vh' }}>
  <Sidebar
    items={sidebarItems}
    activeId={activeSidebarItem}
    onItemClick={setActiveSidebarItem}
  />
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
    <TopBar
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSearch={handleSearch}
      userName="Filip Kalinski"
      userInitials="FK"
    />
    <main style={{ flex: 1, overflow: 'auto', backgroundColor: '#f7f7f8' }}>
      {renderActiveContent()}
    </main>
  </div>
</div>
```

**Layout structure:**
```
┌─────────┬─────────────────────────────────────────────────────────┐
│         │ TopBar (search, help, notifications, avatar)            │
│         ├─────────────────────────────────────────────────────────┤
│ Sidebar │                                                         │
│ (dark)  │ Content Area                                            │
│         │ (renders active tab: Content/Reports/User)              │
│ 216px   │                                                         │
│         │                                                         │
│         │                                                         │
└─────────┴─────────────────────────────────────────────────────────┘
```

### 2.2 Sidebar Navigation Structure

```typescript
const sidebarItems: SidebarItem[] = [
  { id: 'insights', label: 'Insights', icon: <ChartIcon /> },
  { id: 'users', label: 'Users & Groups', icon: <UsersIcon /> },
  { id: 'content', label: 'Content', icon: <FolderIcon /> },
  { id: 'metadata', label: 'Metadata', icon: <TagIcon /> },
  { id: 'reports', label: 'Reports', icon: <ReportIcon /> },
  { id: 'boxai', label: 'Box AI', icon: <AIIcon />, badge: 'NEW' },
  { id: 'classification', label: 'Classification', icon: <ClassifyIcon /> },
  { id: 'shield', label: 'Shield', icon: <ShieldIcon /> },
  { id: 'governance', label: 'Governance', icon: <GovIcon /> },
  { id: 'relay', label: 'Relay', icon: <RelayIcon /> },
  { id: 'gxp', label: 'GxP', icon: <GxPIcon /> },
  { id: 'platform', label: 'Platform', icon: <PlatformIcon /> },
  { id: 'integrations', label: 'Integrations', icon: <IntegrationsIcon /> },
  { id: 'admin', label: 'Admin Tasks', icon: <AdminIcon /> },
  { id: 'billing', label: 'Account & Billing', icon: <BillingIcon /> },
  { id: 'settings', label: 'Enterprise Settings', icon: <SettingsIcon /> },
];
```

### 2.3 Content Routing
- "Content" sidebar item → renders ContentPlatform component
- "Reports" sidebar item → renders Reports component
- "Users & Groups" sidebar item → renders Users component
- etc.

## Phase 3: Content Platform Restructure

### 3.1 Update ContentPlatform.tsx
**File**: `content-platform/shell/src/ContentPlatform.tsx`

**Major changes:**

1. **Remove search pane** (now in TopBar)
2. **Add horizontal tab navigation at top:**

```typescript
const contentTabs = [
  { id: 'files', label: 'Files & Folders' },  // Was "Content Manager"
  { id: 'recovery', label: 'Content Recovery' },
  { id: 'metadata', label: 'Metadata' },
  { id: 'requests', label: 'File Requests' },
  { id: 'shuttle', label: 'Shuttle' },
  { id: 'hubs', label: 'Hubs' },
];
```

3. **Tab styling** (matching Box):
```css
.tab {
  padding: 16px 20px;
  font-size: 14px;
  color: #767676;
  border-bottom: 3px solid transparent;
  cursor: pointer;
}

.tab:hover {
  color: #222222;
}

.tab.active {
  color: #222222;
  font-weight: 600;
  border-bottom-color: #0061d5;
}
```

4. **Layout structure:**
```
┌─────────────────────────────────────────────────────────────┐
│ Files & Folders | Content Recovery | Metadata | ...  | Hubs │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Active Tab Content                                          │
│ (FilesTab, HubsTab, etc.)                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Remove Card Wrapper
- No more Card component wrapping content
- Full-width, full-height layout
- White background for tab content areas
- Proper borders between sections

### 3.3 Props to Tabs
Update TabProps to receive search from TopBar:

```typescript
interface TabProps {
  context: ContentContext;
  onNavigate: (path: string) => void;
  onSelect: (ids: string[]) => void;
  searchQuery?: string; // From TopBar
}
```

## Phase 4: Files Tab Restructure

### 4.1 Update Files Plugin Layout
**File**: `content-platform/files-folders/src/plugin.tsx`

**New two-column layout matching image2.png:**

```
┌──────────────────┬────────────────────────────────────────────────┐
│ Users | Archives │ 🏠 > Filip Kalinski                            │
├──────────────────┼────────────────────────────────────────────────┤
│ Filter input     │                                                │
├──────────────────┤ NAME              UPDATED              SIZE    │
│ 🗑️ Trash         │ ─────────────────────────────────────────────  │
│ ▼ 📁 <video>     │ 📁 <video...>     Apr 11, 2024        1 FILE  │
│   📁 a folder    │ 📁 a folder       Aug 28, 2025        1 FILE  │
│ ▶ 📁 Box Reports │ 📁 Box Reports    Oct 17, 2025       74 FILES │
│ ▶ 📂 Box Shuttle │ 📂 Box Shuttle    May 23, 2025        1       │
│ ▶ 📁 Collab Test │ 📁 Collab Test    Oct 1, 2021         1 FILE  │
│ ...              │ ...                                            │
└──────────────────┴────────────────────────────────────────────────┘
```

### 4.2 Left Panel (280px width)

**Top section:**
- Toggle pills: **Users** (active) | **Archives**
- Pill styling:
  - Active: #ffffff bg, 1px border, font-weight 600
  - Inactive: transparent, no border, color #767676
  - Border radius: pill (16px)
  - Height: 32px

**Filter input:**
- Placeholder: "Filter users by name or email"
- Width: 100%
- Margin: 12px 0

**Folder tree:**
- Special items at top:
  - 🗑️ Trash (always visible)
  - Then regular folders
- Selected folder highlighted (#e7f1ff, 2px left border)
- Expandable folders show chevron
- Indent 16px per level

### 4.3 Right Panel (flex: 1)

**Breadcrumb:**
- 🏠 icon for root
- Separator: >
- Current path: bold
- Height: 48px
- Background: #ffffff
- Border bottom: 1px solid #e2e2e2
- Padding: 0 20px

**File table:**
- Full width
- Columns: NAME (50%), UPDATED (30%), SIZE (20%)
- Row actions appear on hover:
  - ... (more menu)
  - ⬇ (download)
  - ➤ (share)
  - ☐ (select)

### 4.4 Handle Selection
- Click folder in tree → updates right panel
- Click file in table → shows detail panel (optional)
- Breadcrumb navigation

## Phase 5: Archives Tab

### 5.1 Create Archives Component
**New file**: `content-platform/archives/src/plugin.tsx`

Similar to Files tab but:
- Shows archived content
- Same two-column layout
- Different data source
- May have restore action

This becomes a peer tab to "Files & Folders" at the content platform level.

## Phase 6: Hubs Tab Update

### 6.1 Update Hubs Plugin
**File**: `hubs-tab/src/plugin.tsx`

Apply Box styling:
- Remove card wrappers
- Use white backgrounds
- Apply proper spacing
- Update button/input styling to match theme
- Grid layout for hub cards
- Add hover states

## Phase 7: Search Results View

### 7.1 Create SearchResults Component
**New file**: `content-platform/shell/src/SearchResults.tsx`

**Layout from image3.png:**

```
┌──────────────────────────────────────────────────────────────┐
│ ← Search Result for "results"                                │
├──────────────────────────────────────────────────────────────┤
│ NAME                    UPDATED          SIZE      KEYWORDS  │
│ ──────────────────────────────────────────────────────────── │
│ 📊 gxp_test_results... Dec 13, 2022    3.5 KB    -08T05:..  │
│ 📁 Filip Kalinski / Box Reports / GxP                        │
│ ──────────────────────────────────────────────────────────── │
│ 📊 gxp_test_results... Dec 12, 2022    3.5 KB    -08T05:..  │
│ 📁 Filip Kalinski / Box Reports / GxP                        │
│ ...                                                           │
└──────────────────────────────────────────────────────────────┘
```

**Features:**
- Back arrow button (returns to previous view)
- "Search Result for {query}" heading (24px, bold)
- Table with 4 columns
- File icon + name in first column
- Breadcrumb path (gray, smaller font) under filename
- Folder icon in breadcrumb
- Keywords column shows matching text

### 7.2 Integration
When user searches in TopBar:
- If in Content section → shows SearchResults component
- Results span all content types (files, folders, hubs, etc.)
- Click result → navigates to that item's location

## Phase 8: Reports & User Tabs

### 8.1 Update Reports Tab
**File**: `reports-tab/src/App.tsx`

Apply Box styling:
- Remove Card wrapper
- White background
- Use updated Table component
- Apply proper spacing
- Update buttons

### 8.2 Update User Tab
**File**: `user-tab/src/App.tsx`

Apply Box styling:
- Remove Card wrapper
- White background
- Use updated Input/Button components
- Proper form layout
- Add section dividers

## Implementation Checklist

### Phase 1: Design System (Day 1, 4 hours)
- [ ] Update ThemeProvider with Box tokens
- [ ] Update Button component
- [ ] Update Input component
- [ ] Update Table component (with icons, actions)
- [ ] Update Tree component
- [ ] Create Sidebar component
- [ ] Create TopBar component
- [ ] Create SearchBar component
- [ ] Create FileIcon component

### Phase 2: Top-Level Shell (Day 1, 2 hours)
- [ ] Restructure App.tsx with Sidebar + TopBar
- [ ] Implement sidebar navigation logic
- [ ] Add search state management
- [ ] Update routing for sidebar items
- [ ] Test navigation flow

### Phase 3: Content Platform (Day 2, 2 hours)
- [ ] Update ContentPlatform.tsx
- [ ] Add horizontal tab navigation
- [ ] Remove old search pane
- [ ] Update tab routing
- [ ] Apply Box styling
- [ ] Test tab switching

### Phase 4: Files Tab (Day 2, 3 hours)
- [ ] Restructure to two-column layout
- [ ] Add Users/Archives toggle
- [ ] Update left panel (filter + tree)
- [ ] Update right panel (breadcrumb + table)
- [ ] Add row actions on hover
- [ ] Test folder navigation
- [ ] Test file selection

### Phase 5: Archives Tab (Day 3, 1 hour)
- [ ] Create Archives plugin
- [ ] Implement similar layout to Files
- [ ] Add restore functionality
- [ ] Integrate with Content platform

### Phase 6: Search Results (Day 3, 2 hours)
- [ ] Create SearchResults component
- [ ] Implement back navigation
- [ ] Add breadcrumbs in results
- [ ] Connect to search functionality
- [ ] Test search flow

### Phase 7: Other Tabs (Day 3, 2 hours)
- [ ] Update Hubs tab styling
- [ ] Update Reports tab styling
- [ ] Update User tab styling
- [ ] Verify all tabs use Box theme

### Phase 8: Polish & Testing (Day 3, 2 hours)
- [ ] Add all icons throughout
- [ ] Verify hover states
- [ ] Test responsive behavior
- [ ] Fix any spacing issues
- [ ] Update E2E tests
- [ ] Cross-browser testing

## File Changes Summary

### Modified Files (15)
1. `shared-components/src/theme/ThemeProvider.tsx`
2. `shared-components/src/components/Button.tsx`
3. `shared-components/src/components/Input.tsx`
4. `shared-components/src/components/Table.tsx`
5. `shared-components/src/components/Tree.tsx`
6. `shared-components/src/index.ts` (export new components)
7. `top-level-shell/src/App.tsx`
8. `content-platform/shell/src/ContentPlatform.tsx`
9. `content-platform/files-folders/src/plugin.tsx`
10. `hubs-tab/src/plugin.tsx`
11. `reports-tab/src/App.tsx`
12. `user-tab/src/App.tsx`
13. `shared-components/src/demo.tsx` (update demos)
14. `top-level-shell/public/index.html` (update title, meta)
15. `content-platform/shell/public/index.html`

### New Files (6)
1. `shared-components/src/components/Sidebar.tsx`
2. `shared-components/src/components/TopBar.tsx`
3. `shared-components/src/components/SearchBar.tsx`
4. `shared-components/src/components/FileIcon.tsx`
5. `content-platform/shell/src/SearchResults.tsx`
6. `content-platform/archives/src/plugin.tsx`

### Test Updates
- Update E2E tests for new navigation structure
- Update component snapshots
- Add new tests for Sidebar/TopBar interactions

## Timeline & Effort

**Total Estimated Time: 16 hours (2 working days)**

**Breakdown:**
- Day 1 (8h): Design system + Top-level shell
- Day 2 (8h): Content platform + Files tab + Search
- Day 3 (optional polish): Additional tabs + testing

**Skills Required:**
- React/TypeScript
- CSS/Styling
- Module Federation (already set up)
- Testing (Playwright)

## Success Criteria

✅ Platform visually matches Box screenshots
✅ Dark sidebar navigation (#2d2d2d) works
✅ Hybrid navigation (sidebar + content tabs) implemented
✅ Files & Folders has two-column layout
✅ All components use Box color palette
✅ Typography matches Box (13px base, specific weights)
✅ Spacing matches Box (proper padding/margins)
✅ Hover states work correctly
✅ Selection states use Box blue (#0061d5)
✅ Search functionality integrated with TopBar
✅ Breadcrumb navigation works
✅ All existing functionality preserved
✅ E2E tests pass with updates
✅ No regressions in module federation

## Notes

- This is a **visual redesign** - functionality stays the same
- Module Federation architecture is **unchanged**
- All remotes continue to work
- State management (Redux) is **unchanged**
- Tab contracts remain **compatible**
- Can be done incrementally (component by component)
- Each component update can be tested independently
- Should maintain backwards compatibility during transition

## Next Steps After Completion

1. User testing with new design
2. Accessibility audit (ARIA labels, keyboard nav)
3. Performance testing (bundle sizes)
4. Mobile responsive design
5. Dark mode support (if needed)
6. Additional Box features (if desired)
