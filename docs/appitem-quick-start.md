# AppItem Architecture - Quick Start Guide

This guide will help you get started implementing the AppItem architecture in your modular React platform.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup Steps](#setup-steps)
3. [Creating Your First AppItem Type](#creating-your-first-appitem-type)
4. [Using AppItem Components](#using-appitem-components)
5. [Adding Aspects](#adding-aspects)
6. [Creating Custom Perspectives](#creating-custom-perspectives)
7. [Integrating with Module Federation](#integrating-with-module-federation)
8. [Testing](#testing)
9. [Next Steps](#next-steps)

---

## Prerequisites

- React 18+
- TypeScript 4.9+
- Module Federation 2.0 (Webpack 5/6 or Rspack)
- Apollo Client (for GraphQL data source)
- Basic understanding of:
  - React hooks
  - Compound components
  - TypeScript generics

---

## Setup Steps

### Step 1: Create the Core Package Structure

```bash
# Create the shared-components package
cd content-platform/packages
mkdir -p shared-components/src/appitem/{components,hooks,core,types}

# Initialize package.json
cd shared-components
npm init -y
npm install react react-dom typescript @types/react @types/react-dom
```

### Step 2: Define Core Types

Create `src/appitem/types/index.ts`:

```typescript
// src/appitem/types/appitem.ts
export interface AppItemBase {
  id: string;
  name: string;
  type: string;
  owner: User;
  enterprise: Enterprise;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface AppItem<TAppData = unknown> extends AppItemBase {
  appData: TAppData;
}

// src/appitem/types/aspect.ts
export interface Aspect<TData = unknown> {
  type: string;
  enabled: boolean;
  data: TData;
}

export interface AppItemWithAspects<TAppData = unknown> extends AppItem<TAppData> {
  aspects: Map<string, Aspect>;
}

// src/appitem/types/meta-model.ts
export interface FieldDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'custom';
  format?: (value: any) => string;
  render?: (value: any, item: AppItem) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface ActionDefinition {
  id: string;
  label: string;
  icon?: string;
  category: 'primary' | 'secondary' | 'contextual' | 'bulk';
  conditions: {
    requiresPermission?: string[];
    requiresAspect?: string[];
    customCondition?: (item: AppItem) => boolean;
  };
  handler?: (items: AppItem[]) => void | Promise<void>;
  navigateTo?: (item: AppItem) => string;
}

export interface DecoratorDefinition {
  id: string;
  slot: 'badge' | 'icon' | 'overlay' | 'footer' | 'inline';
  priority: number;
  condition: (item: AppItem) => boolean;
  render: (item: AppItem) => React.ReactNode;
}

export interface AppItemMeta {
  type: string;
  displayName: string;
  pluralName: string;
  icon: string;
  schema: {
    fields: FieldDefinition[];
  };
  aspects: Record<string, boolean>;
  actions: {
    shared: ActionDefinition[];
    contextual: ActionDefinition[];
  };
  decorators: DecoratorDefinition[];
  navigation: {
    detailsRoute?: (item: AppItem) => string;
    childrenRoute?: (item: AppItem) => string;
  };
  dataSource: {
    graphql?: {
      query: string;
      fragments: string[];
    };
  };
}
```

### Step 3: Create Registries

Create `src/appitem/core/meta-registry.ts`:

```typescript
import { AppItemMeta, ActionDefinition, DecoratorDefinition, AppItem, AppItemWithAspects } from '../types';

export class AppItemMetaRegistry {
  private metaModels = new Map<string, AppItemMeta>();

  register(meta: AppItemMeta): void {
    this.metaModels.set(meta.type, meta);
  }

  get(type: string): AppItemMeta | undefined {
    return this.metaModels.get(type);
  }

  getAll(): AppItemMeta[] {
    return Array.from(this.metaModels.values());
  }

  getActions(type: string, item?: AppItem): ActionDefinition[] {
    const meta = this.get(type);
    if (!meta) return [];

    const allActions = [...meta.actions.shared, ...meta.actions.contextual];

    if (item) {
      return allActions.filter(action =>
        this.evaluateActionConditions(action, item as AppItemWithAspects)
      );
    }

    return allActions;
  }

  getDecorators(type: string, item: AppItem): DecoratorDefinition[] {
    const meta = this.get(type);
    if (!meta) return [];

    return meta.decorators
      .filter(decorator => decorator.condition(item))
      .sort((a, b) => b.priority - a.priority);
  }

  private evaluateActionConditions(
    action: ActionDefinition,
    item: AppItemWithAspects
  ): boolean {
    const { conditions } = action;

    if (conditions.requiresAspect) {
      const hasAspects = conditions.requiresAspect.every(aspectType =>
        item.aspects.has(aspectType) && item.aspects.get(aspectType)?.enabled
      );
      if (!hasAspects) return false;
    }

    if (conditions.customCondition) {
      return conditions.customCondition(item);
    }

    return true;
  }
}

// Global singleton
export const metaRegistry = new AppItemMetaRegistry();
```

### Step 4: Create Data Source Interface

Create `src/appitem/core/data-source.ts`:

```typescript
import { AppItemWithAspects } from '../types';

export interface AppItemQuery {
  type?: string | string[];
  filters?: Record<string, any>;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  pagination?: {
    offset: number;
    limit: number;
  };
  includeAspects?: string[];
}

export interface AppItemQueryResult<TAppData = unknown> {
  items: AppItemWithAspects<TAppData>[];
  total: number;
  hasMore: boolean;
}

export interface AppItemDataSource {
  query<TAppData = unknown>(
    query: AppItemQuery
  ): Promise<AppItemQueryResult<TAppData>>;

  getById<TAppData = unknown>(
    id: string,
    includeAspects?: string[]
  ): Promise<AppItemWithAspects<TAppData> | null>;
}

export class DataSourceRegistry {
  private sources = new Map<string, AppItemDataSource>();

  register(name: string, source: AppItemDataSource): void {
    this.sources.set(name, source);
  }

  get(name: string): AppItemDataSource | undefined {
    return this.sources.get(name);
  }

  getDefault(): AppItemDataSource | undefined {
    return this.sources.get('default');
  }
}

export const dataSourceRegistry = new DataSourceRegistry();
```

### Step 5: Create Core Hook

Create `src/appitem/hooks/useAppItem.ts`:

```typescript
import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppItemWithAspects, Aspect, ActionDefinition, DecoratorDefinition, AppItemMeta } from '../types';
import { dataSourceRegistry } from '../core/data-source';
import { metaRegistry } from '../core/meta-registry';

export interface UseAppItemOptions<TAppData = unknown> {
  itemId?: string;
  item?: AppItemWithAspects<TAppData>;
  dataSource?: string;
  includeAspects?: string[];
}

export interface UseAppItemResult<TAppData = unknown> {
  item: AppItemWithAspects<TAppData> | null;
  isLoading: boolean;
  error: Error | null;
  actions: ActionDefinition[];
  executeAction: (actionId: string) => void | Promise<void>;
  decorators: DecoratorDefinition[];
  aspects: Map<string, Aspect>;
  getAspect: <T extends Aspect>(type: string) => T | undefined;
  meta: AppItemMeta | undefined;
}

export function useAppItem<TAppData = unknown>(
  options: UseAppItemOptions<TAppData>
): UseAppItemResult<TAppData> {
  const [item, setItem] = useState<AppItemWithAspects<TAppData> | null>(
    options.item || null
  );
  const [isLoading, setIsLoading] = useState(!options.item);
  const [error, setError] = useState<Error | null>(null);

  const dataSource = dataSourceRegistry.get(options.dataSource || 'default');
  const meta = item ? metaRegistry.get(item.type) : undefined;

  // Fetch item if only ID is provided
  useEffect(() => {
    if (options.itemId && !options.item && dataSource) {
      setIsLoading(true);
      dataSource
        .getById<TAppData>(options.itemId, options.includeAspects)
        .then(setItem)
        .catch(setError)
        .finally(() => setIsLoading(false));
    }
  }, [options.itemId, options.item, dataSource]);

  // Get available actions
  const actions = useMemo(() => {
    if (!item || !meta) return [];
    return metaRegistry.getActions(item.type, item);
  }, [item, meta]);

  // Get decorators
  const decorators = useMemo(() => {
    if (!item || !meta) return [];
    return metaRegistry.getDecorators(item.type, item);
  }, [item, meta]);

  // Action execution
  const executeAction = useCallback(
    async (actionId: string) => {
      const action = actions.find(a => a.id === actionId);
      if (!action || !item) return;

      if (action.navigateTo) {
        const url = action.navigateTo(item);
        window.location.href = url;
      } else if (action.handler) {
        await action.handler([item]);
      }
    },
    [actions, item]
  );

  // Aspect helpers
  const getAspect = useCallback(
    <T extends Aspect>(type: string): T | undefined => {
      return item?.aspects.get(type) as T | undefined;
    },
    [item]
  );

  return {
    item,
    isLoading,
    error,
    actions,
    executeAction,
    decorators,
    aspects: item?.aspects || new Map(),
    getAspect,
    meta
  };
}
```

---

## Creating Your First AppItem Type

Let's create a "File" AppItem type as an example.

### Step 1: Define the AppData Type

```typescript
// file-meta.ts
export interface FileAppData {
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
  version: number;
}

export type FileItem = AppItem<FileAppData>;
```

### Step 2: Define the Meta-Model

```typescript
// file-meta.ts (continued)
import { AppItemMeta } from 'shared_components/appitem/types';

export const fileMeta: AppItemMeta = {
  type: 'file',
  displayName: 'File',
  pluralName: 'Files',
  icon: '📄',

  schema: {
    fields: [
      {
        key: 'size',
        label: 'Size',
        type: 'number',
        format: (bytes: number) => {
          if (bytes < 1024) return `${bytes} B`;
          if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
          return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        },
        sortable: true,
        filterable: true
      },
      {
        key: 'mimeType',
        label: 'Type',
        type: 'string',
        sortable: true,
        filterable: true
      },
      {
        key: 'version',
        label: 'Version',
        type: 'number',
        sortable: true
      }
    ]
  },

  aspects: {
    sharing: true,
    governance: true,
    classification: true,
    versioning: true
  },

  actions: {
    shared: [
      {
        id: 'file.download',
        label: 'Download',
        icon: '⬇️',
        category: 'primary',
        conditions: {
          requiresPermission: ['can_download']
        },
        handler: async (items) => {
          const file = items[0] as FileItem;
          window.location.href = `/api/files/${file.id}/download`;
        }
      }
    ],
    contextual: [
      {
        id: 'file.preview',
        label: 'Preview',
        icon: '👁️',
        category: 'secondary',
        conditions: {
          customCondition: (item) => {
            const file = item as FileItem;
            return ['image/png', 'image/jpeg', 'application/pdf'].includes(
              file.appData.mimeType
            );
          }
        },
        navigateTo: (item) => `/files/${item.id}/preview`
      }
    ]
  },

  decorators: [
    {
      id: 'file.shared-badge',
      slot: 'badge',
      priority: 10,
      condition: (item) => {
        const sharing = getAspect<SharingAspect>(
          item as AppItemWithAspects,
          'sharing'
        );
        return sharing?.enabled && sharing.data.sharedLinks.length > 0;
      },
      render: () => <span className="badge">🔗 Shared</span>
    }
  ],

  navigation: {
    detailsRoute: (item) => `/files/${item.id}`
  },

  dataSource: {
    graphql: {
      query: 'GetFiles',
      fragments: [
        `
        size
        mimeType
        thumbnailUrl
        version
        `
      ]
    }
  }
};
```

### Step 3: Register the Meta-Model

```typescript
// In your module's bootstrap
import { metaRegistry } from 'shared_components/appitem/core';
import { fileMeta } from './file-meta';

export function bootstrap() {
  metaRegistry.register(fileMeta);
}
```

---

## Using AppItem Components

### Basic Usage

```typescript
import { AppItemCard } from 'shared_components/appitem/components';

function FileCard({ fileId }: { fileId: string }) {
  return (
    <AppItemCard itemId={fileId} includeAspects={['sharing']}>
      <AppItemCard.Header />
      <AppItemCard.Body />
    </AppItemCard>
  );
}
```

### Custom Composition

```typescript
function CustomFileCard({ file }: { file: FileItem }) {
  return (
    <AppItemCard item={file}>
      <AppItemCard.Header>
        <AppItemCard.Icon />
        <AppItemCard.Name />
        <AppItemCard.Decorators slot="badge" />
        <AppItemCard.Actions category="primary" />
      </AppItemCard.Header>

      <AppItemCard.Body>
        <AppItemCard.Fields />
        <AppItemCard.Aspects types={['sharing']} />
      </AppItemCard.Body>

      <div className="custom-footer">
        <AppItemCard.Actions category="secondary" />
      </div>
    </AppItemCard>
  );
}
```

### Using the Hook Directly

```typescript
function MyCustomComponent({ fileId }: { fileId: string }) {
  const {
    item,
    isLoading,
    actions,
    executeAction,
    getAspect
  } = useAppItem<FileAppData>({ itemId: fileId });

  if (isLoading) return <div>Loading...</div>;
  if (!item) return null;

  return (
    <div>
      <h2>{item.name}</h2>
      <p>Size: {item.appData.size} bytes</p>

      <button onClick={() => executeAction('file.download')}>
        Download
      </button>
    </div>
  );
}
```

---

## Adding Aspects

### Step 1: Define Aspect Type

```typescript
export interface SharingAspect extends Aspect<{
  sharedLinks: SharedLink[];
  collaborators: Collaborator[];
  permissions: Permission[];
}> {
  type: 'sharing';
}
```

### Step 2: Enable in Meta-Model

```typescript
const fileMeta: AppItemMeta = {
  // ...
  aspects: {
    sharing: true, // Enable sharing aspect
    governance: false
  }
};
```

### Step 3: Use in Components

```typescript
function SharingPanel() {
  const context = useContext(AppItemCardContext);
  const sharing = context?.getAspect<SharingAspect>('sharing');

  if (!sharing?.enabled) return null;

  return (
    <div>
      <h3>Sharing</h3>
      <p>{sharing.data.collaborators.length} collaborators</p>
      <ul>
        {sharing.data.sharedLinks.map(link => (
          <li key={link.id}>{link.url}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Creating Custom Perspectives

```typescript
// perspectives/file-grid-perspective.ts
import { Perspective } from 'shared_components/appitem/types';

export const fileGridPerspective: Perspective = {
  id: 'file-grid',
  name: 'Grid View',
  description: 'Thumbnail grid for files',
  supportedTypes: ['file'],

  renderItem: (item) => {
    const file = item as FileItem;
    return (
      <div className="file-grid-item">
        <img
          src={file.appData.thumbnailUrl || '/default-icon.png'}
          alt={file.name}
        />
        <div className="file-name">{file.name}</div>
        <AppItemCard.Decorators slot="badge" />
      </div>
    );
  }
};

// Register the perspective
import { perspectiveRegistry } from 'shared_components/appitem/core';
perspectiveRegistry.register(fileGridPerspective);
```

### Using Perspectives

```typescript
function FileListView() {
  const [perspective, setPerspective] = useState('list');

  return (
    <div>
      <PerspectiveSwitcher
        currentPerspective={perspective}
        itemType="file"
        onChange={setPerspective}
      />

      <AppItemsView
        query={{
          type: 'file',
          sort: { field: 'updatedAt', direction: 'desc' }
        }}
        perspectiveId={perspective}
      />
    </div>
  );
}
```

---

## Integrating with Module Federation

### Step 1: Configure Shared Components

```javascript
// shared-components/webpack.config.js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shared_components',
      filename: 'remoteEntry.js',
      exposes: {
        './appitem': './src/appitem/index.ts',
        './appitem/components': './src/appitem/components/index.ts',
        './appitem/hooks': './src/appitem/hooks/index.ts',
        './appitem/core': './src/appitem/core/index.ts'
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' }
      }
    })
  ]
};
```

### Step 2: Configure Consumer Module

```javascript
// files-tab/webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'files_tab',
      remotes: {
        shared_components: 'shared_components@http://localhost:3001/remoteEntry.js'
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true }
      }
    })
  ]
};
```

### Step 3: Bootstrap Pattern

```typescript
// files-tab/src/bootstrap.ts
import { metaRegistry } from 'shared_components/appitem/core';
import { fileMeta } from './file-meta';

export async function bootstrap() {
  metaRegistry.register(fileMeta);

  return {
    tabId: 'files',
    component: () => import('./FilesTab')
  };
}
```

---

## Testing

### Unit Testing Meta-Model

```typescript
// file-meta.test.ts
import { metaRegistry } from 'shared_components/appitem/core';
import { fileMeta } from './file-meta';

describe('File Meta-Model', () => {
  beforeAll(() => {
    metaRegistry.register(fileMeta);
  });

  it('should register file type', () => {
    const meta = metaRegistry.get('file');
    expect(meta).toBeDefined();
    expect(meta?.displayName).toBe('File');
  });

  it('should return download action', () => {
    const actions = metaRegistry.getActions('file');
    expect(actions.find(a => a.id === 'file.download')).toBeDefined();
  });

  it('should show preview action only for supported types', () => {
    const pdfFile: FileItem = {
      id: '1',
      type: 'file',
      name: 'doc.pdf',
      appData: { mimeType: 'application/pdf', size: 1000, version: 1 },
      // ... other fields
    };

    const actions = metaRegistry.getActions('file', pdfFile);
    expect(actions.find(a => a.id === 'file.preview')).toBeDefined();

    const txtFile: FileItem = {
      ...pdfFile,
      appData: { ...pdfFile.appData, mimeType: 'text/plain' }
    };

    const txtActions = metaRegistry.getActions('file', txtFile);
    expect(txtActions.find(a => a.id === 'file.preview')).toBeUndefined();
  });
});
```

### Testing Components

```typescript
// FileCard.test.tsx
import { render, screen } from '@testing-library/react';
import { AppItemCard } from 'shared_components/appitem/components';
import { dataSourceRegistry } from 'shared_components/appitem/core';
import { SnapshotDataSource } from './test-utils';

describe('FileCard', () => {
  const mockFile: FileItem = {
    id: '123',
    type: 'file',
    name: 'test.pdf',
    appData: { size: 1024, mimeType: 'application/pdf', version: 1 },
    aspects: new Map(),
    // ... other fields
  };

  beforeEach(() => {
    dataSourceRegistry.register(
      'default',
      new SnapshotDataSource([mockFile])
    );
  });

  it('should render file name', async () => {
    render(
      <AppItemCard itemId="123">
        <AppItemCard.Header />
      </AppItemCard>
    );

    expect(await screen.findByText('test.pdf')).toBeInTheDocument();
  });

  it('should show download action', async () => {
    render(
      <AppItemCard itemId="123">
        <AppItemCard.Actions category="primary" />
      </AppItemCard>
    );

    expect(await screen.findByText('Download')).toBeInTheDocument();
  });
});
```

---

## Next Steps

Now that you have the basics set up:

1. **Add More AppItem Types**: Create folder, form, hub types
2. **Implement GraphQL Data Source**: Replace snapshot with real GraphQL adapter
3. **Create Aspect Components**: Build reusable UI for sharing, governance, etc.
4. **Build Perspectives**: Create grid, timeline, kanban views
5. **Add Bulk Actions**: Support multi-select and bulk operations
6. **Implement Navigation**: Connect entity relationships
7. **Add Tests**: Comprehensive testing for all meta-models
8. **Document in Storybook**: Create stories for all components

---

## Common Patterns

### Pattern 1: Conditional Rendering Based on Aspects

```typescript
function FileDetails({ file }: { file: FileItem }) {
  const { getAspect } = useAppItem({ item: file });

  const sharing = getAspect<SharingAspect>('sharing');
  const governance = getAspect<GovernanceAspect>('governance');

  return (
    <div>
      <h2>{file.name}</h2>

      {sharing?.enabled && <SharingPanel aspect={sharing} />}
      {governance?.enabled && <GovernancePanel aspect={governance} />}
    </div>
  );
}
```

### Pattern 2: Dynamic Action Menu

```typescript
function ActionMenu({ item }: { item: AppItemWithAspects }) {
  const { actions, executeAction } = useAppItem({ item });

  const primaryActions = actions.filter(a => a.category === 'primary');
  const secondaryActions = actions.filter(a => a.category === 'secondary');

  return (
    <div>
      <div className="primary-actions">
        {primaryActions.map(action => (
          <button key={action.id} onClick={() => executeAction(action.id)}>
            {action.icon} {action.label}
          </button>
        ))}
      </div>

      <DropdownMenu>
        {secondaryActions.map(action => (
          <MenuItem key={action.id} onClick={() => executeAction(action.id)}>
            {action.label}
          </MenuItem>
        ))}
      </DropdownMenu>
    </div>
  );
}
```

### Pattern 3: Bulk Operations

```typescript
function FileList() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { items } = useAppItems({ query: { type: 'file' } });

  const selectedItems = items.filter(item => selectedIds.has(item.id));

  const handleBulkAction = async (actionId: string) => {
    const action = metaRegistry.getActions('file').find(a => a.id === actionId);
    if (action?.handler) {
      await action.handler(selectedItems);
      setSelectedIds(new Set());
    }
  };

  return (
    <div>
      {selectedIds.size > 0 && (
        <BulkActionBar
          count={selectedIds.size}
          onAction={handleBulkAction}
        />
      )}

      {items.map(item => (
        <FileRow
          key={item.id}
          item={item}
          selected={selectedIds.has(item.id)}
          onSelect={(selected) => {
            const newSet = new Set(selectedIds);
            if (selected) {
              newSet.add(item.id);
            } else {
              newSet.delete(item.id);
            }
            setSelectedIds(newSet);
          }}
        />
      ))}
    </div>
  );
}
```

---

## Troubleshooting

### Issue: "Must be used within AppItemCard"

**Cause**: Using sub-components outside of `<AppItemCard>`

**Solution**: Wrap in `<AppItemCard>` or use `useAppItem` hook directly

### Issue: Meta-model not found

**Cause**: Meta-model not registered before component renders

**Solution**: Call `metaRegistry.register()` in bootstrap, before any components render

### Issue: Data source undefined

**Cause**: Data source not registered

**Solution**: Register data source in bootstrap:
```typescript
dataSourceRegistry.register('default', myDataSource);
```

---

## Resources

- [Main Architecture Doc](./appitem-component-architecture.md)
- [Comparison with Similar Solutions](./appitem-architecture-comparison.md)
- [Module Federation Design](./MODULAR_PLATFORM_DESIGN.md)
