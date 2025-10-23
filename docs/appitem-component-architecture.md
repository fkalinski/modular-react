# AppItem Component Architecture

## Executive Summary

This document outlines a reusable, composable, data-bound component architecture for working with AppItem entities in a modular React platform. The architecture combines several proven patterns to create an expressive yet maintainable system:

- **Headless UI Pattern**: Separates data/logic from presentation
- **Entity-Aspect Pattern**: Extensible entity model with composable aspects
- **Meta-Model Pattern**: Schema-driven component configuration
- **Adapter Pattern**: Unified interface for multiple data sources
- **Slot Pattern**: Flexible component composition with extension points

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Domain Model](#domain-model)
3. [Meta-Model System](#meta-model-system)
4. [Data Source Abstraction](#data-source-abstraction)
5. [Component Architecture](#component-architecture)
6. [Extensibility Mechanisms](#extensibility-mechanisms)
7. [Navigation and Entity Relationships](#navigation-and-entity-relationships)
8. [View Models and Perspectives](#view-models-and-perspectives)
9. [Implementation Examples](#implementation-examples)
10. [Integration with Module Federation](#integration-with-module-federation)

---

## Core Concepts

### The Problem Space

We need components that can:
1. Work with different types of AppItem entities that share common attributes but have different internal structures
2. Support Box-like aspects (sharing, collaboration, governance, classification)
3. Be extended with type-specific actions, decorations, and behaviors
4. Bind to multiple data sources (GraphQL, snapshots, mock data)
5. Support navigation flows and entity relationships
6. Enable multiple views/perspectives on the same underlying model

### Architectural Principles

1. **Separation of Concerns**: Data fetching, business logic, and presentation are separate layers
2. **Composition over Inheritance**: Build complex behaviors by composing simple pieces
3. **Open/Closed Principle**: Open for extension, closed for modification
4. **Single Source of Truth**: Meta-model defines entity types and their capabilities
5. **Progressive Enhancement**: Start with base functionality, add aspects as needed

---

## Domain Model

### Core Entity Hierarchy

```typescript
/**
 * Base attributes shared by all AppItem entities
 */
interface AppItemBase {
  id: string;
  name: string;
  type: AppItemType;
  owner: User;
  enterprise: Enterprise;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * AppItem with typed data payload
 */
interface AppItem<TAppData = unknown> extends AppItemBase {
  appData: TAppData;
}

/**
 * Examples of specific AppItem types
 */
interface FileAppData {
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
  version: number;
}

interface FolderAppData {
  itemCount: number;
  totalSize: number;
  path: string;
}

interface FormSubmissionAppData {
  formId: string;
  fields: Record<string, any>;
  submittedBy: User;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

// Typed AppItems
type FileItem = AppItem<FileAppData>;
type FolderItem = AppItem<FolderAppData>;
type FormSubmissionItem = AppItem<FormSubmissionAppData>;
```

### Aspect System

Aspects are composable behaviors/data that can be attached to AppItems:

```typescript
/**
 * Base aspect interface
 */
interface Aspect<TData = unknown> {
  type: string;
  enabled: boolean;
  data: TData;
}

/**
 * Sharing/Collaboration aspect
 */
interface SharingAspect extends Aspect<{
  sharedLinks: SharedLink[];
  collaborators: Collaborator[];
  permissions: Permission[];
}> {
  type: 'sharing';
}

/**
 * Governance aspect (retention, legal hold, etc.)
 */
interface GovernanceAspect extends Aspect<{
  retentionPolicy?: RetentionPolicy;
  legalHold?: LegalHold;
  dispositionDate?: Date;
}> {
  type: 'governance';
}

/**
 * Classification aspect (security labels, tags)
 */
interface ClassificationAspect extends Aspect<{
  securityLabel?: SecurityLabel;
  tags: string[];
  customMetadata: Record<string, any>;
}> {
  type: 'classification';
}

/**
 * Versioning aspect
 */
interface VersioningAspect extends Aspect<{
  currentVersion: string;
  versions: Version[];
  canRestore: boolean;
}> {
  type: 'versioning';
}

/**
 * AppItem with aspects
 */
interface AppItemWithAspects<TAppData = unknown> extends AppItem<TAppData> {
  aspects: Map<string, Aspect>;
}

// Helper to get typed aspect
function getAspect<T extends Aspect>(
  item: AppItemWithAspects,
  type: string
): T | undefined {
  return item.aspects.get(type) as T | undefined;
}
```

---

## Meta-Model System

The meta-model defines the capabilities, schema, and behavior of each AppItem type.

```typescript
/**
 * Action definition in meta-model
 */
interface ActionDefinition {
  id: string;
  label: string;
  icon?: string;
  category: 'primary' | 'secondary' | 'contextual' | 'bulk';

  // Conditions for when action is available
  conditions: {
    requiresPermission?: string[];
    requiresAspect?: string[];
    customCondition?: (item: AppItem) => boolean;
  };

  // Handler or navigation target
  handler?: (items: AppItem[]) => void | Promise<void>;
  navigateTo?: (item: AppItem) => string;
}

/**
 * Decorator definition - visual enhancements
 */
interface DecoratorDefinition {
  id: string;
  slot: 'badge' | 'icon' | 'overlay' | 'footer' | 'inline';
  priority: number;

  // When to show this decorator
  condition: (item: AppItem) => boolean;

  // What to render
  render: (item: AppItem) => React.ReactNode;
}

/**
 * Field definition for rendering AppData
 */
interface FieldDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'custom';
  format?: (value: any) => string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: AppItem) => React.ReactNode;
}

/**
 * Meta-model for an AppItem type
 */
interface AppItemMeta {
  // Type identification
  type: string;
  displayName: string;
  pluralName: string;
  icon: string;

  // Schema for AppData
  schema: {
    fields: FieldDefinition[];
    validations?: Record<string, ValidationRule[]>;
  };

  // Which aspects are enabled for this type
  aspects: {
    sharing: boolean;
    governance: boolean;
    classification: boolean;
    versioning: boolean;
    // ... extensible for custom aspects
  };

  // Available actions
  actions: {
    shared: ActionDefinition[];      // Common to all instances
    contextual: ActionDefinition[];  // Based on item state
  };

  // Visual decorators
  decorators: DecoratorDefinition[];

  // Navigation configuration
  navigation: {
    detailsRoute?: (item: AppItem) => string;
    childrenRoute?: (item: AppItem) => string;
    relatedEntities?: RelatedEntityDefinition[];
  };

  // Data source configuration
  dataSource: {
    graphql?: {
      query: string;
      fragments: string[];
    };
    adapter?: string; // Reference to adapter
  };
}

/**
 * Meta-model registry
 */
class AppItemMetaRegistry {
  private metaModels = new Map<string, AppItemMeta>();

  register(meta: AppItemMeta): void {
    this.metaModels.set(meta.type, meta);
  }

  get(type: string): AppItemMeta | undefined {
    return this.metaModels.get(type);
  }

  getActions(type: string, item?: AppItem): ActionDefinition[] {
    const meta = this.get(type);
    if (!meta) return [];

    const allActions = [...meta.actions.shared, ...meta.actions.contextual];

    // Filter based on conditions
    if (item) {
      return allActions.filter(action =>
        this.evaluateActionConditions(action, item)
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

// Global registry instance
export const metaRegistry = new AppItemMetaRegistry();
```

---

## Data Source Abstraction

Support multiple data sources through the Adapter pattern.

```typescript
/**
 * Query parameters for fetching items
 */
interface AppItemQuery {
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

/**
 * Result from data source
 */
interface AppItemQueryResult<TAppData = unknown> {
  items: AppItemWithAspects<TAppData>[];
  total: number;
  hasMore: boolean;
}

/**
 * Base data source interface
 */
interface AppItemDataSource {
  /**
   * Fetch multiple items
   */
  query<TAppData = unknown>(
    query: AppItemQuery
  ): Promise<AppItemQueryResult<TAppData>>;

  /**
   * Fetch single item by ID
   */
  getById<TAppData = unknown>(
    id: string,
    includeAspects?: string[]
  ): Promise<AppItemWithAspects<TAppData> | null>;

  /**
   * Subscribe to real-time updates
   */
  subscribe(
    query: AppItemQuery,
    callback: (items: AppItemWithAspects[]) => void
  ): () => void;
}

/**
 * GraphQL-based data source
 */
class GraphQLAppItemDataSource implements AppItemDataSource {
  constructor(
    private client: ApolloClient<any>,
    private metaRegistry: AppItemMetaRegistry
  ) {}

  async query<TAppData>(
    query: AppItemQuery
  ): Promise<AppItemQueryResult<TAppData>> {
    const meta = this.getMetaForQuery(query);
    const gqlQuery = this.buildGraphQLQuery(query, meta);

    const result = await this.client.query({
      query: gql(gqlQuery),
      variables: this.buildVariables(query)
    });

    return this.transformResult(result.data, query);
  }

  async getById<TAppData>(
    id: string,
    includeAspects?: string[]
  ): Promise<AppItemWithAspects<TAppData> | null> {
    const result = await this.query<TAppData>({
      filters: { id },
      includeAspects
    });

    return result.items[0] || null;
  }

  subscribe(
    query: AppItemQuery,
    callback: (items: AppItemWithAspects[]) => void
  ): () => void {
    const meta = this.getMetaForQuery(query);
    const gqlSubscription = this.buildGraphQLSubscription(query, meta);

    const subscription = this.client.subscribe({
      query: gql(gqlSubscription),
      variables: this.buildVariables(query)
    }).subscribe({
      next: (result) => {
        const transformed = this.transformResult(result.data, query);
        callback(transformed.items);
      }
    });

    return () => subscription.unsubscribe();
  }

  private getMetaForQuery(query: AppItemQuery): AppItemMeta | undefined {
    if (typeof query.type === 'string') {
      return this.metaRegistry.get(query.type);
    }
    return undefined;
  }

  private buildGraphQLQuery(query: AppItemQuery, meta?: AppItemMeta): string {
    // Build query from meta-model's GraphQL configuration
    const baseFields = `
      id
      name
      type
      owner { id name email }
      enterprise { id name }
      createdAt
      updatedAt
      deletedAt
    `;

    const appDataFields = meta?.dataSource.graphql?.fragments.join('\n') || '';
    const aspectFields = this.buildAspectFields(query.includeAspects);

    return `
      query GetAppItems($filters: AppItemFilterInput, $sort: SortInput, $pagination: PaginationInput) {
        appItems(filters: $filters, sort: $sort, pagination: $pagination) {
          items {
            ${baseFields}
            appData {
              ${appDataFields}
            }
            ${aspectFields}
          }
          total
          hasMore
        }
      }
    `;
  }

  private buildAspectFields(aspectTypes?: string[]): string {
    if (!aspectTypes || aspectTypes.length === 0) return '';

    return `
      aspects {
        ${aspectTypes.map(type => `
          ${type} {
            type
            enabled
            data
          }
        `).join('\n')}
      }
    `;
  }

  private buildGraphQLSubscription(query: AppItemQuery, meta?: AppItemMeta): string {
    // Similar to buildGraphQLQuery but for subscriptions
    return `
      subscription OnAppItemsChanged($filters: AppItemFilterInput) {
        appItemsChanged(filters: $filters) {
          ${this.buildGraphQLQuery(query, meta)}
        }
      }
    `;
  }

  private buildVariables(query: AppItemQuery): Record<string, any> {
    return {
      filters: query.filters,
      sort: query.sort,
      pagination: query.pagination
    };
  }

  private transformResult<TAppData>(
    data: any,
    query: AppItemQuery
  ): AppItemQueryResult<TAppData> {
    const items = data.appItems.items.map((item: any) => ({
      ...item,
      aspects: new Map(
        Object.entries(item.aspects || {}).filter(([_, aspect]: any) => aspect)
      )
    }));

    return {
      items,
      total: data.appItems.total,
      hasMore: data.appItems.hasMore
    };
  }
}

/**
 * Snapshot-based data source (for cached/offline data)
 */
class SnapshotAppItemDataSource implements AppItemDataSource {
  constructor(private snapshot: AppItemWithAspects[]) {}

  async query<TAppData>(
    query: AppItemQuery
  ): Promise<AppItemQueryResult<TAppData>> {
    let filtered = [...this.snapshot];

    // Apply type filter
    if (query.type) {
      const types = Array.isArray(query.type) ? query.type : [query.type];
      filtered = filtered.filter(item => types.includes(item.type));
    }

    // Apply custom filters
    if (query.filters) {
      filtered = this.applyFilters(filtered, query.filters);
    }

    // Apply sorting
    if (query.sort) {
      filtered = this.applySort(filtered, query.sort);
    }

    // Apply pagination
    const total = filtered.length;
    if (query.pagination) {
      const { offset, limit } = query.pagination;
      filtered = filtered.slice(offset, offset + limit);
    }

    return {
      items: filtered as AppItemWithAspects<TAppData>[],
      total,
      hasMore: query.pagination
        ? query.pagination.offset + query.pagination.limit < total
        : false
    };
  }

  async getById<TAppData>(
    id: string
  ): Promise<AppItemWithAspects<TAppData> | null> {
    const item = this.snapshot.find(item => item.id === id);
    return item as AppItemWithAspects<TAppData> || null;
  }

  subscribe(): () => void {
    // Snapshots don't support real-time updates
    return () => {};
  }

  private applyFilters(
    items: AppItemWithAspects[],
    filters: Record<string, any>
  ): AppItemWithAspects[] {
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        // Support nested paths like "appData.status"
        const itemValue = this.getNestedValue(item, key);
        return itemValue === value;
      });
    });
  }

  private applySort(
    items: AppItemWithAspects[],
    sort: { field: string; direction: 'asc' | 'desc' }
  ): AppItemWithAspects[] {
    return items.sort((a, b) => {
      const aVal = this.getNestedValue(a, sort.field);
      const bVal = this.getNestedValue(b, sort.field);

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

/**
 * Data source registry for managing multiple sources
 */
class DataSourceRegistry {
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

---

## Component Architecture

Headless UI pattern with Slot-based composition for maximum flexibility.

```typescript
/**
 * Core headless hook for AppItem logic
 */
interface UseAppItemOptions<TAppData = unknown> {
  itemId?: string;
  item?: AppItemWithAspects<TAppData>;
  dataSource?: string;
  includeAspects?: string[];
}

interface UseAppItemResult<TAppData = unknown> {
  // Data
  item: AppItemWithAspects<TAppData> | null;
  isLoading: boolean;
  error: Error | null;

  // Actions
  actions: ActionDefinition[];
  executeAction: (actionId: string) => void | Promise<void>;

  // Decorators
  decorators: DecoratorDefinition[];

  // Aspects
  aspects: Map<string, Aspect>;
  getAspect: <T extends Aspect>(type: string) => T | undefined;

  // Meta
  meta: AppItemMeta | undefined;

  // Navigation
  navigate: (target: string) => void;
  getDetailsUrl: () => string | undefined;
  getChildrenUrl: () => string | undefined;
}

function useAppItem<TAppData = unknown>(
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
    if (options.itemId && !options.item) {
      setIsLoading(true);
      dataSource
        ?.getById<TAppData>(options.itemId, options.includeAspects)
        .then(setItem)
        .catch(setError)
        .finally(() => setIsLoading(false));
    }
  }, [options.itemId, options.item]);

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
        navigate(url);
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

  // Navigation helpers
  const navigate = useCallback((url: string) => {
    // Use your router's navigation method
    window.location.href = url;
  }, []);

  const getDetailsUrl = useCallback(() => {
    if (!item || !meta?.navigation.detailsRoute) return undefined;
    return meta.navigation.detailsRoute(item);
  }, [item, meta]);

  const getChildrenUrl = useCallback(() => {
    if (!item || !meta?.navigation.childrenRoute) return undefined;
    return meta.navigation.childrenRoute(item);
  }, [item, meta]);

  return {
    item,
    isLoading,
    error,
    actions,
    executeAction,
    decorators,
    aspects: item?.aspects || new Map(),
    getAspect,
    meta,
    navigate,
    getDetailsUrl,
    getChildrenUrl
  };
}

/**
 * Hook for querying multiple items
 */
interface UseAppItemsOptions {
  query: AppItemQuery;
  dataSource?: string;
}

interface UseAppItemsResult<TAppData = unknown> {
  items: AppItemWithAspects<TAppData>[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  loadMore: () => void;
}

function useAppItems<TAppData = unknown>(
  options: UseAppItemsOptions
): UseAppItemsResult<TAppData> {
  const [result, setResult] = useState<AppItemQueryResult<TAppData>>({
    items: [],
    total: 0,
    hasMore: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const dataSource = dataSourceRegistry.get(options.dataSource || 'default');

  const fetchItems = useCallback(async () => {
    if (!dataSource) return;

    setIsLoading(true);
    try {
      const data = await dataSource.query<TAppData>(options.query);
      setResult(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [dataSource, options.query]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const loadMore = useCallback(async () => {
    if (!dataSource || !result.hasMore) return;

    const nextQuery = {
      ...options.query,
      pagination: {
        offset: result.items.length,
        limit: options.query.pagination?.limit || 20
      }
    };

    const data = await dataSource.query<TAppData>(nextQuery);
    setResult(prev => ({
      items: [...prev.items, ...data.items],
      total: data.total,
      hasMore: data.hasMore
    }));
  }, [dataSource, options.query, result]);

  return {
    items: result.items,
    total: result.total,
    hasMore: result.hasMore,
    isLoading,
    error,
    refetch: fetchItems,
    loadMore
  };
}

/**
 * Component architecture using Compound Components + Slots
 */

// Root component
interface AppItemCardProps<TAppData = unknown> {
  itemId?: string;
  item?: AppItemWithAspects<TAppData>;
  dataSource?: string;
  includeAspects?: string[];
  children?: React.ReactNode;
}

const AppItemCardContext = createContext<UseAppItemResult | null>(null);

function AppItemCard<TAppData = unknown>(props: AppItemCardProps<TAppData>) {
  const itemState = useAppItem(props);

  if (itemState.isLoading) {
    return <AppItemCard.Loading />;
  }

  if (itemState.error) {
    return <AppItemCard.Error error={itemState.error} />;
  }

  if (!itemState.item) {
    return null;
  }

  return (
    <AppItemCardContext.Provider value={itemState}>
      <div className="app-item-card">
        {props.children}
      </div>
    </AppItemCardContext.Provider>
  );
}

// Sub-components using slots pattern
AppItemCard.Header = function AppItemCardHeader({
  children
}: {
  children?: React.ReactNode
}) {
  const context = useContext(AppItemCardContext);
  if (!context) throw new Error('Must be used within AppItemCard');

  return (
    <div className="app-item-card__header">
      {children || (
        <>
          <AppItemCard.Icon />
          <AppItemCard.Name />
          <AppItemCard.Actions />
        </>
      )}
    </div>
  );
};

AppItemCard.Icon = function AppItemCardIcon() {
  const context = useContext(AppItemCardContext);
  if (!context) throw new Error('Must be used within AppItemCard');

  return (
    <div className="app-item-card__icon">
      {context.meta?.icon}
    </div>
  );
};

AppItemCard.Name = function AppItemCardName() {
  const context = useContext(AppItemCardContext);
  if (!context) throw new Error('Must be used within AppItemCard');

  return (
    <div className="app-item-card__name">
      {context.item?.name}
    </div>
  );
};

AppItemCard.Actions = function AppItemCardActions({
  category
}: {
  category?: ActionDefinition['category']
}) {
  const context = useContext(AppItemCardContext);
  if (!context) throw new Error('Must be used within AppItemCard');

  const actions = category
    ? context.actions.filter(a => a.category === category)
    : context.actions;

  return (
    <div className="app-item-card__actions">
      {actions.map(action => (
        <button
          key={action.id}
          onClick={() => context.executeAction(action.id)}
        >
          {action.icon && <span>{action.icon}</span>}
          {action.label}
        </button>
      ))}
    </div>
  );
};

AppItemCard.Body = function AppItemCardBody({
  children
}: {
  children?: React.ReactNode
}) {
  const context = useContext(AppItemCardContext);
  if (!context) throw new Error('Must be used within AppItemCard');

  return (
    <div className="app-item-card__body">
      {children || <AppItemCard.Fields />}
    </div>
  );
};

AppItemCard.Fields = function AppItemCardFields() {
  const context = useContext(AppItemCardContext);
  if (!context?.item || !context.meta) {
    throw new Error('Must be used within AppItemCard');
  }

  return (
    <div className="app-item-card__fields">
      {context.meta.schema.fields.map(field => {
        const value = (context.item!.appData as any)[field.key];
        const displayValue = field.render
          ? field.render(value, context.item!)
          : field.format
          ? field.format(value)
          : String(value);

        return (
          <div key={field.key} className="app-item-card__field">
            <label>{field.label}</label>
            <div>{displayValue}</div>
          </div>
        );
      })}
    </div>
  );
};

AppItemCard.Aspects = function AppItemCardAspects({
  types
}: {
  types?: string[]
}) {
  const context = useContext(AppItemCardContext);
  if (!context) throw new Error('Must be used within AppItemCard');

  const aspectsToShow = types
    ? Array.from(context.aspects.entries()).filter(([type]) => types.includes(type))
    : Array.from(context.aspects.entries());

  return (
    <div className="app-item-card__aspects">
      {aspectsToShow.map(([type, aspect]) => (
        <div key={type} className="app-item-card__aspect">
          <strong>{type}</strong>: {aspect.enabled ? 'Enabled' : 'Disabled'}
        </div>
      ))}
    </div>
  );
};

AppItemCard.Decorators = function AppItemCardDecorators({
  slot
}: {
  slot: DecoratorDefinition['slot']
}) {
  const context = useContext(AppItemCardContext);
  if (!context?.item) throw new Error('Must be used within AppItemCard');

  const decorators = context.decorators.filter(d => d.slot === slot);

  return (
    <div className={`app-item-card__decorators app-item-card__decorators--${slot}`}>
      {decorators.map(decorator => (
        <div key={decorator.id} className="app-item-card__decorator">
          {decorator.render(context.item!)}
        </div>
      ))}
    </div>
  );
};

AppItemCard.Loading = function AppItemCardLoading() {
  return <div className="app-item-card app-item-card--loading">Loading...</div>;
};

AppItemCard.Error = function AppItemCardError({ error }: { error: Error }) {
  return (
    <div className="app-item-card app-item-card--error">
      Error: {error.message}
    </div>
  );
};

export { AppItemCard, useAppItem, useAppItems };
```

---

## Extensibility Mechanisms

### 1. Action Extensions

```typescript
// Example: Adding a custom action to File type
const downloadAction: ActionDefinition = {
  id: 'file.download',
  label: 'Download',
  icon: 'download',
  category: 'primary',
  conditions: {
    requiresPermission: ['can_download'],
    requiresAspect: undefined,
    customCondition: (item) => {
      const file = item as FileItem;
      return file.appData.mimeType !== 'application/vnd.box.folder';
    }
  },
  handler: async (items) => {
    const file = items[0] as FileItem;
    window.location.href = `/api/files/${file.id}/download`;
  }
};

// Register with meta-model
const fileMeta = metaRegistry.get('file');
fileMeta?.actions.contextual.push(downloadAction);
```

### 2. Decorator Extensions

```typescript
// Example: Adding a "Shared" badge decorator
const sharedBadgeDecorator: DecoratorDefinition = {
  id: 'file.shared-badge',
  slot: 'badge',
  priority: 10,
  condition: (item) => {
    const sharing = getAspect<SharingAspect>(item as AppItemWithAspects, 'sharing');
    return sharing?.enabled && sharing.data.sharedLinks.length > 0;
  },
  render: (item) => {
    const sharing = getAspect<SharingAspect>(item as AppItemWithAspects, 'sharing');
    return <span className="badge badge--shared">Shared ({sharing!.data.sharedLinks.length})</span>;
  }
};

// Register with meta-model
const fileMeta = metaRegistry.get('file');
fileMeta?.decorators.push(sharedBadgeDecorator);
```

### 3. Custom Aspects

```typescript
// Define a new aspect type
interface CommentingAspect extends Aspect<{
  commentCount: number;
  latestComment?: Comment;
  allowComments: boolean;
}> {
  type: 'commenting';
}

// Add to meta-model
const fileMeta = metaRegistry.get('file');
if (fileMeta) {
  (fileMeta.aspects as any).commenting = true;
}

// Use in components
function CommentsPanel() {
  const context = useContext(AppItemCardContext);
  const commenting = context?.getAspect<CommentingAspect>('commenting');

  if (!commenting?.enabled) return null;

  return (
    <div>
      <h3>Comments ({commenting.data.commentCount})</h3>
      {/* Render comments UI */}
    </div>
  );
}
```

### 4. Custom Fields with Renderers

```typescript
// Example: Custom renderer for file size
const fileSizeField: FieldDefinition = {
  key: 'size',
  label: 'Size',
  type: 'number',
  format: (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  },
  render: (bytes: number) => {
    const formatted = fileSizeField.format!(bytes);
    return (
      <span className="file-size" title={`${bytes} bytes`}>
        {formatted}
      </span>
    );
  },
  sortable: true,
  filterable: true
};
```

---

## Navigation and Entity Relationships

```typescript
/**
 * Related entity definition
 */
interface RelatedEntityDefinition {
  name: string;
  type: string;
  relationship: 'parent' | 'child' | 'reference';

  // How to fetch related entities
  query: (item: AppItem) => AppItemQuery;

  // Navigation
  route?: (item: AppItem, related: AppItem) => string;
}

/**
 * Example: Files have parent folders
 */
const fileToFolderRelation: RelatedEntityDefinition = {
  name: 'Parent Folder',
  type: 'folder',
  relationship: 'parent',
  query: (item: FileItem) => ({
    type: 'folder',
    filters: { id: item.appData.parentId }
  }),
  route: (item, parent) => `/folders/${parent.id}`
};

/**
 * Example: Folders have child files
 */
const folderToFilesRelation: RelatedEntityDefinition = {
  name: 'Files',
  type: 'file',
  relationship: 'child',
  query: (item: FolderItem) => ({
    type: 'file',
    filters: { parentId: item.id }
  }),
  route: (item, child) => `/files/${child.id}`
};

/**
 * Component for rendering related entities
 */
function RelatedEntities({
  item,
  relationName
}: {
  item: AppItemWithAspects;
  relationName: string;
}) {
  const meta = metaRegistry.get(item.type);
  const relation = meta?.navigation.relatedEntities?.find(r => r.name === relationName);

  const query = relation ? relation.query(item) : null;
  const { items, isLoading } = useAppItems({ query: query! });

  if (!relation || isLoading) return <div>Loading...</div>;

  return (
    <div className="related-entities">
      <h3>{relation.name}</h3>
      <div className="related-entities__list">
        {items.map(relatedItem => (
          <AppItemCard key={relatedItem.id} item={relatedItem}>
            <AppItemCard.Header />
            <AppItemCard.Body />
          </AppItemCard>
        ))}
      </div>
    </div>
  );
}

/**
 * Breadcrumb navigation
 */
function AppItemBreadcrumbs({ item }: { item: AppItemWithAspects }) {
  const [ancestors, setAncestors] = useState<AppItemWithAspects[]>([]);

  useEffect(() => {
    // Fetch parent chain
    async function fetchAncestors() {
      const chain: AppItemWithAspects[] = [];
      let current = item;

      while (current) {
        const meta = metaRegistry.get(current.type);
        const parentRelation = meta?.navigation.relatedEntities?.find(
          r => r.relationship === 'parent'
        );

        if (!parentRelation) break;

        const parentQuery = parentRelation.query(current);
        const dataSource = dataSourceRegistry.getDefault();
        const result = await dataSource?.query(parentQuery);

        if (!result?.items.length) break;

        current = result.items[0];
        chain.unshift(current);
      }

      setAncestors(chain);
    }

    fetchAncestors();
  }, [item]);

  return (
    <nav className="breadcrumbs">
      {ancestors.map((ancestor, index) => (
        <React.Fragment key={ancestor.id}>
          <a href={`/${ancestor.type}s/${ancestor.id}`}>
            {ancestor.name}
          </a>
          {index < ancestors.length && <span> / </span>}
        </React.Fragment>
      ))}
      <span>{item.name}</span>
    </nav>
  );
}
```

---

## View Models and Perspectives

Create different views of the same data using composition.

```typescript
/**
 * Perspective definition - different ways to view AppItems
 */
interface Perspective {
  id: string;
  name: string;
  description: string;

  // Which item types this perspective supports
  supportedTypes: string[];

  // How to render items in this perspective
  renderItem: (item: AppItemWithAspects) => React.ReactNode;

  // Optional: custom query modifications
  queryTransform?: (query: AppItemQuery) => AppItemQuery;

  // Optional: custom grouping
  groupBy?: (items: AppItemWithAspects[]) => Record<string, AppItemWithAspects[]>;
}

/**
 * Example perspectives
 */

// List perspective (default)
const listPerspective: Perspective = {
  id: 'list',
  name: 'List View',
  description: 'Standard list view',
  supportedTypes: ['*'],
  renderItem: (item) => (
    <AppItemCard item={item}>
      <AppItemCard.Header />
      <AppItemCard.Body>
        <AppItemCard.Fields />
      </AppItemCard.Body>
    </AppItemCard>
  )
};

// Grid perspective
const gridPerspective: Perspective = {
  id: 'grid',
  name: 'Grid View',
  description: 'Thumbnail grid view',
  supportedTypes: ['file', 'folder'],
  renderItem: (item) => (
    <AppItemCard item={item}>
      <AppItemCard.Decorators slot="overlay" />
      <div className="thumbnail">
        {/* Render thumbnail */}
      </div>
      <AppItemCard.Name />
      <AppItemCard.Actions category="primary" />
    </AppItemCard>
  )
};

// Timeline perspective
const timelinePerspective: Perspective = {
  id: 'timeline',
  name: 'Timeline View',
  description: 'Chronological timeline',
  supportedTypes: ['*'],
  queryTransform: (query) => ({
    ...query,
    sort: {
      field: 'createdAt',
      direction: 'desc'
    }
  }),
  groupBy: (items) => {
    const groups: Record<string, AppItemWithAspects[]> = {};

    items.forEach(item => {
      const date = new Date(item.createdAt);
      const key = date.toLocaleDateString();

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  },
  renderItem: (item) => (
    <AppItemCard item={item}>
      <div className="timeline-item">
        <span className="timeline-item__time">
          {new Date(item.createdAt).toLocaleTimeString()}
        </span>
        <AppItemCard.Header />
      </div>
    </AppItemCard>
  )
};

// Governance perspective - focuses on compliance aspects
const governancePerspective: Perspective = {
  id: 'governance',
  name: 'Governance View',
  description: 'Focus on retention and compliance',
  supportedTypes: ['*'],
  queryTransform: (query) => ({
    ...query,
    includeAspects: ['governance', 'classification']
  }),
  renderItem: (item) => (
    <AppItemCard item={item}>
      <AppItemCard.Header />
      <AppItemCard.Aspects types={['governance', 'classification']} />
      <div className="governance-details">
        {/* Custom governance UI */}
      </div>
    </AppItemCard>
  )
};

/**
 * Perspective Registry
 */
class PerspectiveRegistry {
  private perspectives = new Map<string, Perspective>();

  register(perspective: Perspective): void {
    this.perspectives.set(perspective.id, perspective);
  }

  get(id: string): Perspective | undefined {
    return this.perspectives.get(id);
  }

  getForType(type: string): Perspective[] {
    return Array.from(this.perspectives.values()).filter(p =>
      p.supportedTypes.includes('*') || p.supportedTypes.includes(type)
    );
  }
}

export const perspectiveRegistry = new PerspectiveRegistry();

/**
 * Component that renders items using a perspective
 */
function AppItemsView({
  query,
  perspectiveId = 'list',
  dataSource
}: {
  query: AppItemQuery;
  perspectiveId?: string;
  dataSource?: string;
}) {
  const perspective = perspectiveRegistry.get(perspectiveId);

  if (!perspective) {
    throw new Error(`Perspective '${perspectiveId}' not found`);
  }

  // Apply perspective's query transform
  const transformedQuery = perspective.queryTransform
    ? perspective.queryTransform(query)
    : query;

  const { items, isLoading, error } = useAppItems({
    query: transformedQuery,
    dataSource
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Apply grouping if specified
  const grouped = perspective.groupBy
    ? perspective.groupBy(items)
    : { '': items };

  return (
    <div className={`app-items-view app-items-view--${perspectiveId}`}>
      {Object.entries(grouped).map(([groupKey, groupItems]) => (
        <div key={groupKey} className="app-items-view__group">
          {groupKey && <h3 className="app-items-view__group-title">{groupKey}</h3>}
          <div className="app-items-view__items">
            {groupItems.map(item => (
              <div key={item.id} className="app-items-view__item">
                {perspective.renderItem(item)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Perspective switcher component
 */
function PerspectiveSwitcher({
  currentPerspective,
  itemType,
  onChange
}: {
  currentPerspective: string;
  itemType: string;
  onChange: (perspectiveId: string) => void;
}) {
  const perspectives = perspectiveRegistry.getForType(itemType);

  return (
    <div className="perspective-switcher">
      {perspectives.map(p => (
        <button
          key={p.id}
          className={currentPerspective === p.id ? 'active' : ''}
          onClick={() => onChange(p.id)}
          title={p.description}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
```

---

## Implementation Examples

### Example 1: Complete File AppItem Setup

```typescript
// 1. Define the meta-model
const fileMeta: AppItemMeta = {
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
        format: (bytes) => `${(bytes / 1024).toFixed(2)} KB`,
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
      },
      {
        id: 'file.share',
        label: 'Share',
        icon: '🔗',
        category: 'primary',
        conditions: {
          requiresAspect: ['sharing']
        },
        navigateTo: (item) => `/files/${item.id}/share`
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
      render: (item) => <span className="badge">🔗 Shared</span>
    },
    {
      id: 'file.retention-badge',
      slot: 'badge',
      priority: 5,
      condition: (item) => {
        const governance = getAspect<GovernanceAspect>(
          item as AppItemWithAspects,
          'governance'
        );
        return governance?.enabled && governance.data.retentionPolicy != null;
      },
      render: (item) => <span className="badge">📋 Retention</span>
    }
  ],

  navigation: {
    detailsRoute: (item) => `/files/${item.id}`,
    childrenRoute: undefined,
    relatedEntities: [
      {
        name: 'Parent Folder',
        type: 'folder',
        relationship: 'parent',
        query: (item) => ({
          type: 'folder',
          filters: { id: (item as FileItem).appData.parentId }
        }),
        route: (item, parent) => `/folders/${parent.id}`
      }
    ]
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
        parentId
        `
      ]
    }
  }
};

// 2. Register the meta-model
metaRegistry.register(fileMeta);

// 3. Register perspectives for files
perspectiveRegistry.register({
  id: 'file-grid',
  name: 'Grid',
  description: 'Thumbnail grid view',
  supportedTypes: ['file'],
  renderItem: (item) => {
    const file = item as FileItem;
    return (
      <div className="file-grid-item">
        <img src={file.appData.thumbnailUrl} alt={file.name} />
        <div className="file-grid-item__name">{file.name}</div>
        <AppItemCard.Decorators slot="badge" />
      </div>
    );
  }
});
```

### Example 2: Using the Components

```typescript
// Simple card
function FileCard({ fileId }: { fileId: string }) {
  return (
    <AppItemCard itemId={fileId} includeAspects={['sharing', 'governance']}>
      <AppItemCard.Header />
      <AppItemCard.Body />
      <AppItemCard.Decorators slot="badge" />
    </AppItemCard>
  );
}

// Custom composition
function DetailedFileCard({ file }: { file: FileItem }) {
  return (
    <AppItemCard item={file}>
      <AppItemCard.Header>
        <div className="custom-header">
          <AppItemCard.Icon />
          <div>
            <AppItemCard.Name />
            <div className="file-metadata">
              {file.appData.mimeType} • {file.appData.size} bytes
            </div>
          </div>
          <AppItemCard.Decorators slot="badge" />
          <AppItemCard.Actions category="primary" />
        </div>
      </AppItemCard.Header>

      <AppItemCard.Body>
        <AppItemCard.Fields />
        <AppItemCard.Aspects types={['sharing', 'governance']} />

        {/* Custom sections */}
        <section className="file-versions">
          <h3>Version History</h3>
          {/* Version list */}
        </section>
      </AppItemCard.Body>

      <div className="card-footer">
        <AppItemCard.Actions category="secondary" />
      </div>
    </AppItemCard>
  );
}

// List view with perspective
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
          includeAspects: ['sharing'],
          sort: { field: 'updatedAt', direction: 'desc' }
        }}
        perspectiveId={perspective}
      />
    </div>
  );
}

// Using headless hook directly
function CustomFileComponent({ fileId }: { fileId: string }) {
  const {
    item,
    isLoading,
    actions,
    executeAction,
    decorators,
    getAspect
  } = useAppItem<FileAppData>({ itemId: fileId });

  if (isLoading) return <div>Loading...</div>;
  if (!item) return null;

  const sharing = getAspect<SharingAspect>('sharing');

  return (
    <div className="custom-file">
      <h2>{item.name}</h2>
      <p>Size: {item.appData.size} bytes</p>

      {sharing?.enabled && (
        <div>
          Shared with {sharing.data.collaborators.length} people
        </div>
      )}

      <div className="actions">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => executeAction(action.id)}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="decorators">
        {decorators
          .filter(d => d.slot === 'badge')
          .map(d => (
            <div key={d.id}>{d.render(item)}</div>
          ))}
      </div>
    </div>
  );
}
```

### Example 3: Extending with Module Federation

```typescript
// In a federated module (e.g., "hubs-tab")
export function registerHubsModule() {
  // 1. Register hub meta-model
  const hubMeta: AppItemMeta = {
    type: 'hub',
    displayName: 'Hub',
    pluralName: 'Hubs',
    icon: '🏢',
    // ... rest of meta definition
  };

  metaRegistry.register(hubMeta);

  // 2. Register custom actions
  const inviteMembersAction: ActionDefinition = {
    id: 'hub.invite',
    label: 'Invite Members',
    icon: '➕',
    category: 'primary',
    conditions: {
      requiresPermission: ['can_manage_members']
    },
    navigateTo: (item) => `/hubs/${item.id}/invite`
  };

  hubMeta.actions.shared.push(inviteMembersAction);

  // 3. Register custom perspective
  const hubMembersPerspective: Perspective = {
    id: 'hub-members',
    name: 'Members View',
    description: 'View hub members',
    supportedTypes: ['hub'],
    renderItem: (item) => {
      const hub = item as HubItem;
      return (
        <div className="hub-members-card">
          <h3>{hub.name}</h3>
          <div>Members: {hub.appData.members.length}</div>
          {/* Member list */}
        </div>
      );
    }
  };

  perspectiveRegistry.register(hubMembersPerspective);

  // 4. Register data source adapter if needed
  const hubDataSource = new GraphQLAppItemDataSource(
    apolloClient,
    metaRegistry
  );

  dataSourceRegistry.register('hubs', hubDataSource);
}

// In your module's entry point
export async function bootstrap() {
  registerHubsModule();

  return {
    name: 'hubs-tab',
    component: HubsTabComponent
  };
}
```

---

## Integration with Module Federation

The AppItem architecture integrates seamlessly with your Module Federation setup:

### 1. Shared Package Structure

```
content-platform/
├── packages/
│   ├── shared-components/
│   │   ├── src/
│   │   │   ├── appitem/
│   │   │   │   ├── components/
│   │   │   │   │   ├── AppItemCard.tsx
│   │   │   │   │   ├── AppItemsView.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useAppItem.ts
│   │   │   │   │   ├── useAppItems.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── core/
│   │   │   │   │   ├── meta-registry.ts
│   │   │   │   │   ├── perspective-registry.ts
│   │   │   │   │   ├── data-source-registry.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── types/
│   │   │   │   │   ├── appitem.ts
│   │   │   │   │   ├── aspect.ts
│   │   │   │   │   ├── meta-model.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── module-federation.config.js  # Expose appitem/*
│   │
│   ├── shared-data/
│   │   ├── src/
│   │   │   ├── graphql/
│   │   │   │   ├── appitem-queries.ts
│   │   │   │   └── fragments/
│   │   │   │       ├── file-fragment.ts
│   │   │   │       ├── folder-fragment.ts
│   │   │   │       └── index.ts
│   │   │   └── adapters/
│   │   │       ├── GraphQLAppItemDataSource.ts
│   │   │       ├── SnapshotAppItemDataSource.ts
│   │   │       └── index.ts
│   │   └── module-federation.config.js
│   │
│   ├── files-tab/
│   │   ├── src/
│   │   │   ├── file-meta.ts              # File meta-model definition
│   │   │   ├── folder-meta.ts            # Folder meta-model definition
│   │   │   ├── FilesTab.tsx              # Uses AppItemsView
│   │   │   └── bootstrap.ts              # Registers meta-models
│   │   └── module-federation.config.js
│   │
│   └── hubs-tab/
│       ├── src/
│       │   ├── hub-meta.ts               # Hub meta-model definition
│       │   ├── HubsTab.tsx
│       │   └── bootstrap.ts
│       └── module-federation.config.js
```

### 2. Module Federation Configuration

```javascript
// shared-components/module-federation.config.js
module.exports = {
  name: 'shared_components',
  filename: 'remoteEntry.js',
  exposes: {
    './appitem': './src/appitem/index.ts',
    './appitem/components': './src/appitem/components/index.ts',
    './appitem/hooks': './src/appitem/hooks/index.ts',
    './appitem/core': './src/appitem/core/index.ts',
    './appitem/types': './src/appitem/types/index.ts'
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true }
  }
};

// files-tab/module-federation.config.js
module.exports = {
  name: 'files_tab',
  filename: 'remoteEntry.js',
  exposes: {
    './FilesTab': './src/FilesTab.tsx',
    './bootstrap': './src/bootstrap.ts'
  },
  remotes: {
    shared_components: 'shared_components@http://localhost:3001/remoteEntry.js',
    shared_data: 'shared_data@http://localhost:3002/remoteEntry.js'
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true },
    '@apollo/client': { singleton: true }
  }
};
```

### 3. Bootstrap Pattern

Each tab/module registers its meta-models during bootstrap:

```typescript
// files-tab/src/bootstrap.ts
import { metaRegistry } from 'shared_components/appitem/core';
import { fileMeta } from './file-meta';
import { folderMeta } from './folder-meta';

export async function bootstrap() {
  // Register meta-models
  metaRegistry.register(fileMeta);
  metaRegistry.register(folderMeta);

  // Register perspectives
  // Register custom actions
  // Register decorators

  return {
    tabId: 'files',
    component: () => import('./FilesTab')
  };
}
```

### 4. Dynamic Loading in Shell

```typescript
// content-platform-shell/src/TabLoader.tsx
import { useEffect } from 'react';

async function loadTab(tabConfig: TabManifest) {
  // Load the remote module
  const container = await loadRemote(tabConfig.remoteEntry);
  const module = await container.get(tabConfig.module);
  const { bootstrap } = await module();

  // Bootstrap registers meta-models, perspectives, etc.
  const tabDefinition = await bootstrap();

  return tabDefinition;
}

function TabLoader({ tabConfig }: { tabConfig: TabManifest }) {
  const [TabComponent, setTabComponent] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    loadTab(tabConfig).then(({ component }) => {
      setTabComponent(component);
    });
  }, [tabConfig]);

  if (!TabComponent) return <div>Loading tab...</div>;

  return <TabComponent />;
}
```

---

## Summary

This architecture provides:

1. **Unified Data Model**: AppItem base + typed AppData + composable Aspects
2. **Meta-Model System**: Schema-driven configuration for types, actions, fields
3. **Flexible Components**: Headless hooks + Compound components + Slots
4. **Extensibility**: Actions, decorators, aspects, perspectives
5. **Data Source Abstraction**: GraphQL, snapshots, or custom adapters
6. **Navigation**: Entity relationships and routing
7. **Multiple Views**: Perspective system for different visualizations
8. **Module Federation Ready**: Clean boundaries, registries, bootstrap pattern

### Key Benefits

- **Expressive**: Rich type system, clear extension points
- **Not Overly Complex**: Each layer is simple, complexity is in composition
- **Well-Contained**: Clear boundaries between concerns
- **Testable**: Headless hooks can be tested independently
- **Type-Safe**: Full TypeScript support
- **Scalable**: New types/modules register via bootstrap

### Next Steps

1. Implement core abstractions in `shared-components` package
2. Create GraphQL data source adapter in `shared-data` package
3. Build first concrete implementation (File meta-model)
4. Create example perspectives (list, grid, timeline)
5. Integrate with Module Federation infrastructure
6. Add documentation and Storybook examples
