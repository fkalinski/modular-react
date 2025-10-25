# Data-Driven Tab Architecture

## Overview

This document defines a new data-driven approach for building tabs that focuses on **configuration over code**. Instead of tabs providing full UI implementations, they provide metadata that describes how to query, transform, and display data.

This approach is tested initially with the **Archives tab** while existing tabs (Files, Hubs) remain unchanged to support both patterns.

## Design Principles

1. **Separation of Concerns**: UI rendering logic is centralized in platform components, tabs provide only domain-specific customization
2. **Meta-Model Ready**: Architecture prepares for future Server-Driven UI (SDUI) where server sends UI metadata
3. **GraphQL First**: Leverages GraphQL fragments for composable queries
4. **Progressive Enhancement**: Platform provides sensible defaults, tabs override as needed

## Architecture Comparison

### Traditional Tab Pattern (Files, Hubs - Keep As-Is)

```typescript
// Tab provides full UI
const FilesTab: React.FC<TabProps> = ({ context }) => {
  const [files, setFiles] = useState([]);

  // Custom UI implementation
  return (
    <div>
      <Table data={files} columns={customColumns} />
      <FilePreview />
      <FileActions />
    </div>
  );
};
```

### Data-Driven Tab Pattern (Archives - New)

```typescript
// Tab provides only metadata
const ArchivesTabConfig: DataDrivenTabConfig = {
  id: 'archives',
  title: 'Archives',

  // Query fragment extends base query
  queryFragment: gql`
    fragment ArchiveFields on ContentItem {
      archiveDate
      archiveReason
      originalLocation
      compressionType
      archivedBy {
        id
        name
      }
    }
  `,

  // Table column decorators
  columns: [
    { field: 'name', label: 'Archive Name', sortable: true },
    { field: 'archiveDate', label: 'Archived', formatter: 'date' },
    { field: 'size', label: 'Size', formatter: 'fileSize' },
    { field: 'compressionType', label: 'Type' },
    { field: 'archivedBy.name', label: 'Archived By' },
  ],

  // Field enrichers transform data
  enrichers: [
    {
      field: 'compressionType',
      enrich: (value) => value?.toUpperCase() || 'NONE'
    },
    {
      field: 'archiveDate',
      enrich: (value) => new Date(value)
    }
  ],

  // Actions available on rows
  actions: [
    { id: 'restore', label: 'Restore', icon: '↩️' },
    { id: 'download', label: 'Download', icon: '⬇️' },
    { id: 'delete', label: 'Delete', icon: '🗑️' },
  ]
};
```

## Core Components

### 1. Query Fragment Composition System

**Base Query** (provided by platform):

```typescript
// shared-data/src/graphql/queries/baseQueries.ts
export const BASE_CONTENT_ITEM_FRAGMENT = gql`
  fragment BaseContentItemFields on ContentItem {
    id
    name
    type
    createdAt
    updatedAt
    owner {
      id
      name
      email
    }
  }
`;

export const BASE_CONTENT_ITEMS_QUERY = gql`
  query GetContentItems($filters: ContentFilters) {
    contentItems(filters: $filters) {
      ...BaseContentItemFields
      # Tab-specific fields injected here
    }
  }
  ${BASE_CONTENT_ITEM_FRAGMENT}
`;
```

**Fragment Composition** (automatic):

```typescript
// Platform composes base query + tab fragments
const composedQuery = composeQuery(BASE_CONTENT_ITEMS_QUERY, [
  ArchivesTabConfig.queryFragment,
  // Other active tabs' fragments can be merged
]);

// Results in:
// query GetContentItems($filters: ContentFilters) {
//   contentItems(filters: $filters) {
//     ...BaseContentItemFields
//     ...ArchiveFields
//   }
// }
```

### 2. Generic Table Component

**Component Interface**:

```typescript
// shared-components/src/components/DataTable/DataTable.tsx
export interface ColumnDefinition {
  field: string;              // Path to field (supports nested: "owner.name")
  label: string;              // Display label
  sortable?: boolean;         // Enable sorting
  filterable?: boolean;       // Enable filtering
  formatter?: FormatterType;  // Built-in formatter
  render?: CellRenderer;      // Custom renderer
  width?: number | string;    // Column width
  align?: 'left' | 'center' | 'right';
}

export type FormatterType =
  | 'date'
  | 'datetime'
  | 'fileSize'
  | 'number'
  | 'currency'
  | 'boolean'
  | 'badge';

export type CellRenderer = (value: any, row: any) => React.ReactNode;

export interface DataTableProps<T = any> {
  data: T[];
  columns: ColumnDefinition[];
  loading?: boolean;
  error?: Error;
  onRowClick?: (row: T) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actions?: RowAction[];
}
```

**Built-in Formatters**:

```typescript
// shared-components/src/components/DataTable/formatters.ts
export const formatters = {
  date: (value: string | Date) => {
    return new Date(value).toLocaleDateString();
  },

  datetime: (value: string | Date) => {
    return new Date(value).toLocaleString();
  },

  fileSize: (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  },

  number: (value: number) => {
    return value.toLocaleString();
  },

  currency: (value: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value);
  },

  boolean: (value: boolean) => {
    return value ? '✓' : '✗';
  },

  badge: (value: string) => {
    return <Badge>{value}</Badge>;
  }
};
```

### 3. Field Enricher System

**Enricher Interface**:

```typescript
// shared-data/src/enrichers/types.ts
export interface FieldEnricher<T = any> {
  field: string;
  enrich: (value: any, row: T, context?: PlatformContextValue) => any;
  priority?: number; // For ordering enrichers
}

export interface EnricherRegistry {
  register(enricher: FieldEnricher): void;
  enrich<T>(data: T[], tabId: string): T[];
}
```

**Enricher Implementation**:

```typescript
// shared-data/src/enrichers/EnricherRegistry.ts
export class EnricherRegistry implements IEnricherRegistry {
  private enrichers: Map<string, FieldEnricher[]> = new Map();

  register(tabId: string, enricher: FieldEnricher) {
    if (!this.enrichers.has(tabId)) {
      this.enrichers.set(tabId, []);
    }
    this.enrichers.get(tabId)!.push(enricher);
    // Sort by priority
    this.enrichers.get(tabId)!.sort((a, b) =>
      (b.priority || 0) - (a.priority || 0)
    );
  }

  enrich<T>(data: T[], tabId: string, context?: PlatformContextValue): T[] {
    const tabEnrichers = this.enrichers.get(tabId) || [];

    return data.map(row => {
      let enrichedRow = { ...row };

      for (const enricher of tabEnrichers) {
        const value = getNestedValue(enrichedRow, enricher.field);
        const enrichedValue = enricher.enrich(value, enrichedRow, context);
        setNestedValue(enrichedRow, enricher.field, enrichedValue);
      }

      return enrichedRow;
    });
  }
}

// Utility functions
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  const last = parts.pop()!;
  const target = parts.reduce((acc, part) => {
    if (!acc[part]) acc[part] = {};
    return acc[part];
  }, obj);
  target[last] = value;
}
```

### 4. Data-Driven Tab Contract (v3)

```typescript
// content-platform/tab-contract/src/v3.ts
import { DocumentNode } from 'graphql';
import { ColumnDefinition, RowAction } from '@modular-platform/shared-components';
import { FieldEnricher } from '@modular-platform/shared-data';

export interface DataDrivenTabConfig {
  id: string;
  title: string;
  version: string;

  /**
   * GraphQL fragment to extend base ContentItem query
   * Must be named fragment on ContentItem type
   */
  queryFragment: DocumentNode;

  /**
   * Base variables for the query
   */
  queryVariables?: Record<string, any>;

  /**
   * Column definitions for table display
   */
  columns: ColumnDefinition[];

  /**
   * Field enrichers to transform data after fetch
   */
  enrichers?: FieldEnricher[];

  /**
   * Actions available on rows
   */
  actions?: RowAction[];

  /**
   * Custom filters for this tab
   */
  filters?: FilterDefinition[];

  /**
   * Default sort
   */
  defaultSort?: {
    field: string;
    direction: 'asc' | 'desc';
  };

  /**
   * Row click handler
   */
  onRowClick?: (row: any, context: PlatformContextValue) => void;

  /**
   * Action handlers
   */
  onAction?: (actionId: string, row: any, context: PlatformContextValue) => void | Promise<void>;
}

export interface FilterDefinition {
  id: string;
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: Array<{ value: string; label: string }>;
}

export interface RowAction {
  id: string;
  label: string;
  icon?: string;
  isVisible?: (row: any) => boolean;
  isDisabled?: (row: any) => boolean;
}
```

## Implementation Flow

### Platform Side (Content Shell)

```typescript
// content-platform/shell/src/DataDrivenTabRenderer.tsx
export const DataDrivenTabRenderer: React.FC<{
  config: DataDrivenTabConfig;
}> = ({ config }) => {
  const platformContext = usePlatform();

  // 1. Compose query with fragment
  const composedQuery = useMemo(() =>
    composeQuery(BASE_CONTENT_ITEMS_QUERY, config.queryFragment),
    [config.queryFragment]
  );

  // 2. Execute query
  const { data, loading, error } = useQuery(composedQuery, {
    variables: {
      filters: platformContext.search.filters,
      ...config.queryVariables,
    },
  });

  // 3. Enrich data
  const enrichedData = useMemo(() => {
    if (!data?.contentItems) return [];
    return enricherRegistry.enrich(
      data.contentItems,
      config.id,
      platformContext
    );
  }, [data, config.id, platformContext]);

  // 4. Render generic table
  return (
    <DataTable
      data={enrichedData}
      columns={config.columns}
      loading={loading}
      error={error}
      actions={config.actions}
      onRowClick={(row) => config.onRowClick?.(row, platformContext)}
      onAction={(actionId, row) => config.onAction?.(actionId, row, platformContext)}
      selectedRows={platformContext.selection.selectedIds}
      onSelectionChange={platformContext.selection.setSelection}
    />
  );
};
```

### Tab Side (Archives Tab)

```typescript
// content-platform/archives-tab/src/config.ts
import { gql } from '@apollo/client';
import type { DataDrivenTabConfig } from '@tab-contract/v3';

export const archivesTabConfig: DataDrivenTabConfig = {
  id: 'archives',
  title: 'Archives',
  version: '1.0.0',

  queryFragment: gql`
    fragment ArchiveFields on ContentItem {
      archiveDate
      archiveReason
      originalLocation
      compressionType
      compressedSize
      archivedBy {
        id
        name
        email
      }
    }
  `,

  columns: [
    {
      field: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
    },
    {
      field: 'archiveDate',
      label: 'Archived',
      sortable: true,
      formatter: 'datetime',
    },
    {
      field: 'compressedSize',
      label: 'Size',
      sortable: true,
      formatter: 'fileSize',
      align: 'right',
    },
    {
      field: 'compressionType',
      label: 'Type',
      filterable: true,
    },
    {
      field: 'archivedBy.name',
      label: 'Archived By',
      filterable: true,
    },
    {
      field: 'archiveReason',
      label: 'Reason',
    },
  ],

  enrichers: [
    {
      field: 'compressionType',
      enrich: (value) => value?.toUpperCase() || 'NONE',
    },
    {
      field: 'archiveDate',
      enrich: (value) => new Date(value),
    },
    {
      field: 'originalLocation',
      enrich: (value, row) => {
        // Add computed "restore path" field
        return {
          path: value,
          canRestore: checkRestorePermissions(row),
        };
      },
    },
  ],

  actions: [
    {
      id: 'restore',
      label: 'Restore',
      icon: '↩️',
      isVisible: (row) => row.originalLocation?.canRestore,
    },
    {
      id: 'download',
      label: 'Download',
      icon: '⬇️',
    },
    {
      id: 'delete',
      label: 'Delete Permanently',
      icon: '🗑️',
      isDisabled: (row) => !row.permissions?.includes('delete'),
    },
  ],

  filters: [
    {
      id: 'compressionType',
      field: 'compressionType',
      label: 'Compression Type',
      type: 'select',
      options: [
        { value: 'ZIP', label: 'ZIP' },
        { value: 'TAR', label: 'TAR' },
        { value: 'GZIP', label: 'GZIP' },
        { value: 'NONE', label: 'Uncompressed' },
      ],
    },
    {
      id: 'archiveDate',
      field: 'archiveDate',
      label: 'Archive Date',
      type: 'date',
    },
  ],

  defaultSort: {
    field: 'archiveDate',
    direction: 'desc',
  },

  onRowClick: (row, context) => {
    console.log('[Archives] Row clicked:', row.name);
    // Could open detail view, preview, etc.
  },

  onAction: async (actionId, row, context) => {
    switch (actionId) {
      case 'restore':
        await restoreArchive(row.id, row.originalLocation.path);
        context.selection.clearSelection();
        break;

      case 'download':
        downloadArchive(row.id);
        break;

      case 'delete':
        if (confirm(`Permanently delete "${row.name}"?`)) {
          await deleteArchive(row.id);
          context.selection.clearSelection();
        }
        break;
    }
  },
};
```

## Benefits

### 1. Reduced Code Duplication
- Table rendering logic centralized
- Common formatters reused
- Query composition automatic

### 2. Easier to Maintain
- Changes to table UI apply to all data-driven tabs
- Column definitions are declarative
- Less surface area for bugs

### 3. Meta-Model Ready
- Same structure can be sent from server (SDUI)
- Easy to add UI builder/admin interface
- Configuration can be stored as JSON

### 4. Better Type Safety
- GraphQL fragments are typed
- Column definitions typed
- Enrichers have type inference

### 5. Performance
- Fragments enable precise field selection
- Enrichers run only when data changes
- Table component can optimize rendering

## Migration Path

1. ✅ **Keep existing tabs as-is** (Files, Hubs, Reports, User)
2. ✅ **Create Archives tab** using data-driven pattern
3. **Validate approach** with real usage
4. **Iterate on APIs** based on feedback
5. **Gradually migrate** existing tabs if beneficial
6. **Eventually add SDUI** - server sends configurations

## Future Enhancements

### Phase 1: Current Implementation
- Generic Table component
- Query fragment composition
- Field enrichers
- Archives tab example

### Phase 2: Advanced Features
- Virtual scrolling for large datasets
- Inline editing
- Bulk actions
- Export to CSV/Excel
- Column reordering/hiding
- Saved views

### Phase 3: Server-Driven UI
- Server sends tab configurations
- Admin UI to build configurations
- A/B testing different UIs
- Role-based UI customization

## Files to Create

```
shared-components/src/components/DataTable/
├── DataTable.tsx           # Main table component
├── formatters.ts          # Built-in formatters
├── types.ts               # TypeScript interfaces
└── index.ts               # Exports

shared-data/src/
├── enrichers/
│   ├── EnricherRegistry.ts
│   ├── types.ts
│   └── index.ts
├── graphql/
│   ├── queries/
│   │   └── baseQueries.ts  # Base ContentItem query
│   ├── composition.ts      # Query composition logic
│   └── index.ts
└── hooks/
    └── useDataDrivenTab.ts # Hook for data-driven tabs

content-platform/tab-contract/src/
└── v3.ts                   # Data-driven tab contract

content-platform/archives-tab/
├── src/
│   ├── config.ts           # Tab configuration
│   ├── actions.ts          # Action handlers
│   └── index.ts            # Exports
├── package.json
├── webpack.config.js
└── README.md
```

## Summary

This architecture provides:
- **Two tab patterns**: Traditional (UI-first) and Data-Driven (config-first)
- **GraphQL-first**: Leverages fragments for composable queries
- **Extensibility**: Enrichers, formatters, custom renderers
- **Future-proof**: Ready for SDUI meta-model approach
- **Pragmatic**: Archives tab validates approach before wider adoption
