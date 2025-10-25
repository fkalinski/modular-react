# Archives Tab - Level 2 Integration (Data-Driven)

This tab demonstrates **Level 2 integration** in the modular platform architecture, where tabs provide configuration and data requirements but not custom UI implementation.

## Architecture Overview

### Level 2: Data-Driven Approach

The Archives tab showcases a data-driven architecture where:

1. **GraphQL Fragments** - Tab defines what data to fetch
2. **Column Definitions** - Tab specifies how to display data
3. **Field Enrichers** - Tab transforms data after fetching
4. **Actions** - Tab defines available operations
5. **Platform UI** - Platform renders using generic DataTable component

### Key Differences from Traditional Tabs

| Aspect | Traditional (Level 1) | Data-Driven (Level 2) |
|--------|----------------------|----------------------|
| UI Code | Custom components | Generic DataTable |
| Data Fetching | Custom hooks | Config-driven GraphQL |
| Data Transformation | In-component logic | Registered enrichers |
| Column Layout | JSX markup | Column definitions |
| Actions | Custom buttons/menus | Action configurations |

## File Structure

```
archives-tab/
├── src/
│   ├── config.ts           # GraphQL queries, columns, enrichers, actions
│   ├── ArchivesTab.tsx     # Component using DataTable
│   ├── Plugin.tsx          # Tab Contract v2 implementation
│   ├── index.ts            # Development entry point
│   └── federation-types.d.ts # TypeScript declarations
├── public/
│   └── index.html
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

## Configuration (config.ts)

### GraphQL Query

```typescript
export const GET_ARCHIVES_QUERY = gql`
  query GetArchives($filters: ArchiveFilters) {
    archives(filters: $filters) {
      id
      name
      archiveDate
      compressionType
      compressedSize
      originalSize
      # ... more fields
    }
  }
`;
```

### Column Definitions

```typescript
export const ARCHIVE_COLUMNS: ColumnDefinition[] = [
  {
    field: 'name',
    label: 'Archive Name',
    sortable: true,
    width: 250,
  },
  {
    field: 'compressedSize',
    label: 'Size',
    sortable: true,
    formatter: 'fileSize',  // Built-in formatter
    width: 120,
  },
  // ... more columns
];
```

### Field Enrichers

Enrichers transform data after it's fetched from GraphQL:

```typescript
export const ARCHIVE_ENRICHERS = [
  {
    id: 'archives_compressionRatio',
    field: 'compressionRatio',
    enrich: enrichers.computed((row: any) => {
      const ratio = ((row.originalSize - row.compressedSize) / row.originalSize) * 100;
      return `${ratio.toFixed(1)}%`;
    }),
  },
];
```

### Actions

Row and bulk actions defined as configuration:

```typescript
export const ARCHIVE_ACTIONS: RowAction[] = [
  {
    id: 'restore',
    label: 'Restore',
    icon: '↩️',
    onClick: async (archive) => {
      // Restore logic
    },
    confirm: (archive) => `Restore ${archive.name}?`,
  },
];
```

## Integration with Platform

### Tab Contract v2

The Plugin.tsx implements Tab Contract v2:

```typescript
const ArchivesTabPlugin: TabModuleV2 = {
  id: 'archives',
  title: 'Archives',
  version: '1.0.0',

  mount(context: PlatformContextValue): TabInstance {
    return {
      component: ArchivesTabComponent,
      onActivate: () => { /* ... */ },
      onDeactivate: () => { /* ... */ },
    };
  },

  contributesFilters: [
    {
      id: 'archives-compression-type',
      field: 'compressionType',
      type: 'select',
      options: [/* ... */],
    },
  ],

  contributesActions: [/* ... */],
};
```

### Platform Context Integration

The tab receives search and filter state from Platform Context:

```typescript
<ArchivesTab
  searchQuery={context.search.query}
  filters={context.search.filters}
/>
```

## Benefits of Level 2 Integration

1. **Less Code** - No custom UI implementation needed
2. **Consistency** - All tabs use same DataTable component
3. **Maintainability** - Column changes don't require UI updates
4. **Extensibility** - Easy to add new columns, filters, actions
5. **Type Safety** - Column definitions are strongly typed
6. **Built-in Features** - Sorting, filtering, selection, actions out of the box

## Development

### Prerequisites

1. Start GraphQL server:
```bash
cd ../../graphql-server
npm start
```

2. Install dependencies:
```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open http://localhost:3008

### Build for Production

```bash
npm run build
```

## Migration Path

To migrate a traditional tab to Level 2:

1. **Extract GraphQL queries** - Move to config.ts
2. **Define column metadata** - Convert JSX to ColumnDefinition[]
3. **Create enrichers** - Extract data transformation logic
4. **Define actions** - Convert button handlers to action configs
5. **Replace UI** - Use DataTable instead of custom components
6. **Update Plugin** - Implement Tab Contract v2

## Next Steps: Level 3 (Full SDUI)

The next evolution will be Level 3, where:
- UI model comes from backend (not just data)
- Column definitions served by GraphQL
- Actions defined by backend
- Only action implementations in frontend code
- Complete separation of data model and UI model

This enables non-developers to configure UIs through admin panels.
