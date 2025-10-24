# Modular React Platform - Architecture Roadmap

## Executive Summary

This document compares three different architectural approaches for the modular React platform and provides a comprehensive roadmap for implementation with combined extensions from all approaches.

**Three Approaches Analyzed:**
1. **Current Implementation** (claude/modular-frontend-platform branch)
2. **Design Proposal** (codex/design-platform-using-webpack-federated-modules branch)
3. **Jules Implementation** (jules branch)

---

## 1. Architecture Comparison Matrix

| Aspect | Current Implementation | Design Proposal (Codex) | Jules Implementation |
|--------|----------------------|-------------------------|---------------------|
| **Repository Structure** | Flat monorepo (all modules in root) | Parent Shell (standalone) + Nx monorepo for content platform | Shell + Hubs (separate) + Nx monorepo for content platform |
| **Monorepo Tool** | None (manual workspace) | Nx | Nx |
| **Module Federation** | v2.0 (Webpack 6) | v2.0 with v1.5 compatibility | v1.5 (stable) |
| **Build Tool** | Webpack 6 | Webpack 6 | Webpack 5 + Create React App + Craco |
| **Data Layer** | Mock data in each tab | GraphQL + Apollo client, shared queries/fragments | GraphQL fragments, no shared client yet |
| **State Management** | Local React state | Shared Redux store with global slices + redux-dynamic-modules | Independent Redux per MFE |
| **Cross-MFE Communication** | Props + URL params | Redux store + Event bus (RxJS) | React Context + Event bus (tiny-emitter) |
| **Component Library** | `shared-components` (federated) | `@content-platform/ui` (federated, Storybook) | `libs/shared-components` (Nx lib, federated) |
| **Tab Loading** | Static imports | Runtime JSON composition with manifest service | React.lazy with hardcoded remotes |
| **Version Management** | Direct URLs | Semantic versioning + manifest + negotiation | Semantic versioning (planned) |
| **Platform Context** | Basic `TabModule` interface | Rich `PlatformContext` (store, client, telemetry, feature flags) | Simple `ContentContext` (search state) |
| **Package Publishing** | Artifactory strategy documented | Artifactory + version registry | Not addressed |
| **Testing Strategy** | E2E with Playwright | Consumer contract tests + visual regression | E2E with Playwright per app |
| **Navigation** | URL-based with query params + breadcrumbs | Shell-based routing + dynamic tabs | Simple host integration |
| **Design System** | Box design system (colors, spacing, typography) | Design tokens + Design Council governance | Not specified |
| **CI/CD** | Vercel with GitHub Actions | Manifest service + CDN deployment | Not specified |

---

## 2. Key Architectural Differences

### 2.1 State Management Philosophy

**Design Proposal (Shared Redux):**
```typescript
// Shared Redux store with global slices
interface GlobalState {
  searchContext: { query: string; filters: Filter[] };
  navigationContext: { currentFolder: Folder; path: Breadcrumb[] };
  selectionContext: { selectedItems: string[] };
}

// Tabs access shared state
const state = useSelector((state: GlobalState) => state.searchContext);
```

**Pros:**
- Centralized state = easier debugging
- Cross-tab coordination (filters, search, selection)
- Time-travel debugging with Redux DevTools

**Cons:**
- Tight coupling between tabs and shell
- Harder to test tabs in isolation
- Breaks micro-frontend independence principle

---

**Jules Approach (Independent Redux + Context):**
```typescript
// Each MFE has own Redux store
// Shell provides shared data via Context
const ContentContext = React.createContext({
  searchTerm: '',
  setSearchTerm: (term: string) => {},
});

// Tabs consume context
const { searchTerm } = useContext(ContentContext);
```

**Pros:**
- True MFE independence
- Easier to test tabs in isolation
- Can deploy/version tabs independently
- Less coupling

**Cons:**
- No centralized state = harder cross-tab coordination
- Need event bus for complex interactions
- More boilerplate for shared state

---

**Current Implementation (Local React State):**
```typescript
// Simple useState in shell
const [activeTab, setActiveTab] = useState<TabId>('content');
const [searchValue, setSearchValue] = useState('');
```

**Pros:**
- Simplest implementation
- No library dependencies
- Easy to understand

**Cons:**
- Doesn't scale to complex scenarios
- No persistence
- No time-travel debugging

---

### 2.2 Data Access Philosophy

**Design Proposal (Shared GraphQL Client):**
```typescript
// @content-platform/data package
export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink,
});

// Base query in shared package
export const CONTENT_ITEM_FRAGMENT = gql`
  fragment ContentItemFields on ContentItem {
    id
    name
    type
  }
`;

// Tabs extend with fragments
export const GET_FILES = gql`
  query GetFiles {
    files {
      ...ContentItemFields
      size
      mimeType
    }
  }
  ${CONTENT_ITEM_FRAGMENT}
`;
```

**Pros:**
- Shared cache = better performance
- Consistent query patterns
- Type safety with codegen
- Fragment reuse

**Cons:**
- Requires GraphQL backend
- Apollo adds bundle size
- Tight coupling to GraphQL

---

**Jules Approach (GraphQL Fragments, No Shared Client Yet):**
```typescript
// Each MFE has own client (planned)
// Shared fragments library
export const CONTENT_FRAGMENTS = {
  base: gql`fragment BaseFields on Content { id name }`,
};
```

**Pros:**
- MFE independence
- Can use different data fetching strategies
- No forced Apollo dependency

**Cons:**
- Cache duplication
- No coordinated updates
- More network requests

---

**Current Implementation (Mock Data):**
```typescript
// Simple mock arrays in each tab
const files = [
  { id: 1, name: 'Document.pdf', type: 'file' },
];
```

**Pros:**
- No backend required for development
- Fast prototyping
- Easy to test

**Cons:**
- Not production-ready
- No real data integration
- No cache/optimization

---

### 2.3 Communication Patterns

**Design Proposal (Redux + RxJS Event Bus):**
```typescript
// Redux for state
dispatch(updateSearch('query'));

// Event bus for loose coupling
eventBus.publish('file:selected', { id: '123' });
eventBus.subscribe('filter:changed', handleFilterChange);
```

---

**Jules Approach (Context + tiny-emitter):**
```typescript
// Context for parent-child
<ContentContext.Provider value={{ searchTerm, setSearchTerm }}>
  <FilesTab />
</ContentContext.Provider>

// Event bus for sibling communication
emitter.emit('hub:selected', hubId);
emitter.on('hub:selected', handleSelection);
```

---

**Current Implementation (Props + URL):**
```typescript
// URL params for state
const params = new URLSearchParams(window.location.search);
const tab = params.get('tab');

// Props for parent-child
<TabComponent searchValue={searchValue} />
```

---

## 3. Recommended Hybrid Architecture

After analyzing all three approaches, I recommend a **phased hybrid approach** that combines the best of all three:

### Phase 1: Foundation (Current → Jules Structure)
- Migrate to **Nx monorepo** for better tooling
- Keep **Module Federation 2.0** (already working)
- Add **React Context** for platform-provided state
- Add **Event Bus** (tiny-emitter or mitt) for cross-tab events

### Phase 2: Data Layer (Add Design Proposal Data Strategy)
- Add **@content-platform/data** package
- Implement **GraphQL client** (Apollo or urql)
- Create **shared fragments** and base queries
- Add **typed codegen**

### Phase 3: Enhanced State (Hybrid Redux + Context)
- Add **Redux for complex shared state** (search, filters, selection)
- Keep **Context for simple parent-child** data
- Keep **Event Bus for loose coupling** between siblings
- Add **redux-dynamic-modules** for tab-specific slices

### Phase 4: Composition & Governance (Design Proposal Vision)
- Implement **JSON-based tab composition**
- Add **manifest service** for version management
- Add **version negotiation** in Module Federation
- Implement **consumer contract tests**

### Phase 5: Production Readiness
- Add **Storybook** for component library
- Implement **design token** system
- Add **telemetry/analytics** integration
- Add **feature flags** service
- Complete **CI/CD pipeline**

---

## 4. Detailed Roadmap with Action Items

### Phase 1: Foundation (2-3 weeks)

#### 1.1 Repository Restructuring

**Option A: Full Nx Migration (Recommended)**
```
/
├── apps/
│   ├── shell/                    # Top-level navigation
│   ├── content-platform/         # Content tab host
│   ├── files-folders/            # Files tab
│   ├── hubs/                     # Hubs tab
│   ├── reports/                  # Reports tab
│   └── user/                     # User tab
├── libs/
│   ├── shared-components/        # UI components
│   ├── shared-data/              # Data access (future)
│   ├── tab-contract/             # Tab interface
│   └── platform-context/         # Platform services
└── nx.json
```

**Option B: Hybrid Structure (Current + Nx for Content Platform Only)**
```
/
├── content-monorepo/             # Nx workspace
│   ├── apps/
│   │   ├── content-platform/
│   │   └── files-folders/
│   └── libs/
│       └── shared-components/
├── top-level-shell/              # Keep current
├── hubs-tab/                     # Keep current
├── reports-tab/                  # Keep current
└── user-tab/                     # Keep current
```

**Option C: Keep Current Flat Structure (Simplest)**
- Minimal disruption
- Add Nx tooling incrementally
- Defer full migration

**Decision Point:** Choose based on team size and organizational boundaries
- **Single team:** Option A (full Nx)
- **Multiple teams with autonomy:** Option B (hybrid)
- **Prototype/POC:** Option C (current)

**Action Items:**
- [ ] Decide on repository structure (A/B/C)
- [ ] If Nx: Install Nx (`npx create-nx-workspace@latest`)
- [ ] If Nx: Migrate existing modules to Nx structure
- [ ] If Nx: Update webpack configs to use Nx paths
- [ ] Update CI/CD to handle new structure
- [ ] Update documentation

**Estimated Effort:**
- Option A: 1 week
- Option B: 3 days
- Option C: 0 days

---

#### 1.2 Communication Infrastructure

**React Context Setup:**

Create `/libs/platform-context/src/PlatformContext.tsx`:
```typescript
export interface PlatformContextValue {
  // Search & Filters
  search: {
    query: string;
    setQuery: (query: string) => void;
    filters: Filter[];
    setFilters: (filters: Filter[]) => void;
  };

  // Navigation
  navigation: {
    currentPath: Breadcrumb[];
    navigateTo: (path: string) => void;
  };

  // Selection
  selection: {
    selectedIds: string[];
    setSelection: (ids: string[]) => void;
  };

  // User & Auth
  user: {
    id: string;
    name: string;
    permissions: string[];
  };

  // Services (future)
  telemetry?: TelemetryService;
  featureFlags?: FeatureFlagService;
}

export const PlatformContext = React.createContext<PlatformContextValue | null>(null);

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within PlatformProvider');
  }
  return context;
};
```

**Event Bus Setup:**

Create `/libs/platform-context/src/EventBus.ts`:
```typescript
import mitt, { Emitter } from 'mitt';

// Event types
export type PlatformEvents = {
  'tab:activated': { tabId: string };
  'file:selected': { fileId: string };
  'folder:opened': { folderId: string };
  'hub:selected': { hubId: string };
  'search:submitted': { query: string };
  'filter:changed': { filters: Filter[] };
  'bulk-action:triggered': { action: string; itemIds: string[] };
};

// Singleton event bus
export const eventBus: Emitter<PlatformEvents> = mitt<PlatformEvents>();

// Typed helpers
export const publishEvent = <K extends keyof PlatformEvents>(
  event: K,
  data: PlatformEvents[K]
) => {
  eventBus.emit(event, data);
};

export const subscribeToEvent = <K extends keyof PlatformEvents>(
  event: K,
  handler: (data: PlatformEvents[K]) => void
) => {
  eventBus.on(event, handler);
  return () => eventBus.off(event, handler);
};
```

**Action Items:**
- [ ] Install event bus library (`npm install mitt`)
- [ ] Create `platform-context` library with Context + Event Bus
- [ ] Update shell to provide PlatformContext
- [ ] Update all tabs to consume usePlatform() hook
- [ ] Migrate hardcoded props to context
- [ ] Add event bus usage for cross-tab communication
- [ ] Add TypeScript event types
- [ ] Document event contracts

**Estimated Effort:** 2-3 days

---

#### 1.3 Enhanced Tab Contract

Update tab contract to support richer integration:

```typescript
// libs/tab-contract/src/index.ts
import { PlatformContextValue } from '@platform/context';

export interface TabModule {
  // Identity
  id: string;
  title: string;
  icon?: React.ComponentType;

  // Lifecycle
  mount(context: PlatformContextValue): TabInstance;
  unmount?(): void;

  // Routing (optional)
  routes?: TabRoute[];

  // Contributions (optional)
  contributesFilters?: FilterContribution[];
  contributesActions?: ActionContribution[];

  // Metadata
  version: string;
  requiredPlatformVersion?: string;
}

export interface TabInstance {
  // Component to render
  component: React.ComponentType;

  // Lifecycle hooks
  onActivate?: () => void;
  onDeactivate?: () => void;

  // State persistence
  getState?: () => unknown;
  setState?: (state: unknown) => void;
}

export interface FilterContribution {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date-range' | 'multi-select';
  options?: { value: string; label: string }[];
  defaultValue?: unknown;
}

export interface ActionContribution {
  id: string;
  label: string;
  icon?: React.ComponentType;
  handler: (selectedIds: string[]) => void | Promise<void>;
  requiresSelection?: boolean;
  bulk?: boolean;
}
```

**Action Items:**
- [ ] Update tab contract interface
- [ ] Add filter contribution system
- [ ] Add action contribution system
- [ ] Update tabs to implement new contract
- [ ] Add lifecycle hooks (onActivate/onDeactivate)
- [ ] Add state persistence API
- [ ] Document tab contract v2.0

**Estimated Effort:** 2 days

---

### Phase 2: Data Layer (2-3 weeks)

#### 2.1 Choose Data Fetching Strategy

**Option A: GraphQL + Apollo (Design Proposal)**
```typescript
// Pros: Type safety, caching, fragments, ecosystem
// Cons: Bundle size, GraphQL backend required, learning curve
// Bundle: ~40KB (Apollo Client)
```

**Option B: GraphQL + urql (Lighter Alternative)**
```typescript
// Pros: Smaller bundle, simpler API, good caching
// Cons: Smaller ecosystem, less features than Apollo
// Bundle: ~15KB
```

**Option C: REST + React Query (No GraphQL)**
```typescript
// Pros: Works with REST APIs, great DX, small bundle
// Cons: No fragments, manual cache keys, more endpoints
// Bundle: ~12KB
```

**Option D: REST + SWR (Simplest)**
```typescript
// Pros: Minimal API, React-first, tiny bundle
// Cons: Less features, basic caching
// Bundle: ~5KB
```

**Decision Criteria:**
| If you have... | Choose |
|---------------|--------|
| GraphQL backend already | Option A or B |
| REST APIs + need performance | Option C |
| REST APIs + simplicity priority | Option D |

**Action Items:**
- [ ] Audit existing backend APIs (GraphQL or REST?)
- [ ] Decide on data fetching library
- [ ] Install dependencies
- [ ] Set up TypeScript codegen (if GraphQL)
- [ ] Document data fetching patterns

**Estimated Effort:** 1 day (decision + setup)

---

#### 2.2 Implement Shared Data Package

**For GraphQL + Apollo:**

```typescript
// libs/shared-data/src/client.ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const createApolloClient = (config: { uri: string; headers?: Record<string, string> }) => {
  return new ApolloClient({
    link: new HttpLink({
      uri: config.uri,
      headers: config.headers,
    }),
    cache: new InMemoryCache({
      typePolicies: {
        ContentItem: {
          keyFields: ['id'],
        },
        Hub: {
          keyFields: ['id'],
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
};

// libs/shared-data/src/fragments.ts
import { gql } from '@apollo/client';

export const CONTENT_ITEM_FRAGMENT = gql`
  fragment ContentItemFields on ContentItem {
    id
    name
    type
    createdAt
    updatedAt
    owner {
      id
      name
    }
  }
`;

export const HUB_FRAGMENT = gql`
  fragment HubFields on Hub {
    id
    name
    description
    memberCount
  }
`;

// libs/shared-data/src/queries.ts
export const GET_FILES = gql`
  query GetFiles($folderId: ID, $filters: FileFilters) {
    files(folderId: $folderId, filters: $filters) {
      ...ContentItemFields
      size
      mimeType
    }
  }
  ${CONTENT_ITEM_FRAGMENT}
`;

// libs/shared-data/src/hooks.ts
export const useFiles = (folderId?: string) => {
  const { data, loading, error } = useQuery(GET_FILES, {
    variables: { folderId },
  });

  return {
    files: data?.files ?? [],
    loading,
    error,
  };
};
```

**For REST + React Query:**

```typescript
// libs/shared-data/src/client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// libs/shared-data/src/api.ts
export const api = {
  files: {
    list: async (folderId?: string) => {
      const url = folderId
        ? `/api/files?folderId=${folderId}`
        : '/api/files';
      const response = await fetch(url);
      return response.json();
    },
    get: async (id: string) => {
      const response = await fetch(`/api/files/${id}`);
      return response.json();
    },
  },
  hubs: {
    list: async () => {
      const response = await fetch('/api/hubs');
      return response.json();
    },
  },
};

// libs/shared-data/src/hooks.ts
import { useQuery } from '@tanstack/react-query';

export const useFiles = (folderId?: string) => {
  return useQuery({
    queryKey: ['files', folderId],
    queryFn: () => api.files.list(folderId),
  });
};
```

**Action Items:**
- [ ] Create `shared-data` library
- [ ] Implement client configuration
- [ ] Create base fragments/queries (GraphQL) or API client (REST)
- [ ] Add TypeScript types
- [ ] Add typed hooks (useFiles, useHubs, etc.)
- [ ] Add error handling
- [ ] Add loading states
- [ ] Expose via Module Federation
- [ ] Update tabs to use shared data hooks
- [ ] Add tests
- [ ] Document data access patterns

**Estimated Effort:** 1 week

---

#### 2.3 Integrate with Platform Context

Update PlatformContext to provide data client:

```typescript
export interface PlatformContextValue {
  // ... existing fields

  // Data access
  data: {
    client: ApolloClient | QueryClient;  // Depending on choice
    hooks: typeof dataHooks;              // Shared hooks
  };
}
```

**Action Items:**
- [ ] Add data client to PlatformContext
- [ ] Provide client in shell's PlatformProvider
- [ ] Update tabs to access via context
- [ ] Add data client to Module Federation shared config
- [ ] Test cross-tab cache coordination

**Estimated Effort:** 2 days

---

### Phase 3: Enhanced State Management (2 weeks)

#### 3.1 Choose State Strategy

**Option A: Full Shared Redux (Design Proposal)**
```typescript
// Single Redux store shared across all MFEs
// Best for: Strong coordination needed, complex cross-tab state
// Effort: High
// Coupling: High
```

**Option B: Hybrid Redux + Context (Recommended)**
```typescript
// Redux for complex shared state (search, filters, selection)
// Context for simple parent-child props
// Event bus for loose cross-tab events
// Best for: Balance of coordination and independence
// Effort: Medium
// Coupling: Medium
```

**Option C: Context + Event Bus Only (Jules Approach)**
```typescript
// Independent Redux per MFE (if needed)
// Context for shell-provided state
// Event bus for all cross-tab communication
// Best for: Maximum MFE independence
// Effort: Low
// Coupling: Low
```

**Option D: Keep Current React State**
```typescript
// Simple useState in shell
// Best for: Prototypes, simple apps
// Effort: None
// Coupling: Low
```

**Recommendation:** Start with **Option C** (Context + Event Bus), migrate to **Option B** (add Redux) only if you need:
- Complex filter coordination across 3+ tabs
- Undo/redo functionality
- Time-travel debugging
- Persistent state with middleware

**Action Items:**
- [ ] Decide on state strategy
- [ ] Document decision and rationale
- [ ] Plan migration path if starting simple

**Estimated Effort:** 1 day (decision)

---

#### 3.2 Implement Redux (If Option A or B)

**Install Dependencies:**
```bash
npm install @reduxjs/toolkit react-redux redux-dynamic-modules
```

**Create Store Structure:**

```typescript
// libs/shared-state/src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { searchSlice } from './slices/searchSlice';
import { navigationSlice } from './slices/navigationSlice';
import { selectionSlice } from './slices/selectionSlice';

export const createPlatformStore = () => {
  return configureStore({
    reducer: {
      search: searchSlice.reducer,
      navigation: navigationSlice.reducer,
      selection: selectionSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Allow non-serializable (e.g., functions in context)
      }),
  });
};

export type PlatformStore = ReturnType<typeof createPlatformStore>;
export type RootState = ReturnType<PlatformStore['getState']>;
export type AppDispatch = PlatformStore['dispatch'];

// libs/shared-state/src/slices/searchSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Filter {
  id: string;
  type: string;
  value: unknown;
}

interface SearchState {
  query: string;
  filters: Filter[];
  results: {
    files: number;
    hubs: number;
    forms: number;
  };
}

const initialState: SearchState = {
  query: '',
  filters: [],
  results: { files: 0, hubs: 0, forms: 0 },
};

export const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setFilters: (state, action: PayloadAction<Filter[]>) => {
      state.filters = action.payload;
    },
    updateResults: (state, action: PayloadAction<Partial<SearchState['results']>>) => {
      state.results = { ...state.results, ...action.payload };
    },
    clearSearch: (state) => {
      state.query = '';
      state.filters = [];
    },
  },
});

export const { setQuery, setFilters, updateResults, clearSearch } = searchSlice.actions;

// libs/shared-state/src/hooks.ts
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from './store';

export const useAppSelector = <T>(selector: (state: RootState) => T): T => {
  return useSelector(selector);
};

export const useAppDispatch = (): AppDispatch => {
  return useDispatch<AppDispatch>();
};

// Convenience hooks
export const useSearch = () => {
  const search = useAppSelector((state) => state.search);
  const dispatch = useAppDispatch();

  return {
    query: search.query,
    filters: search.filters,
    results: search.results,
    setQuery: (query: string) => dispatch(setQuery(query)),
    setFilters: (filters: Filter[]) => dispatch(setFilters(filters)),
    clearSearch: () => dispatch(clearSearch()),
  };
};
```

**Integrate with Platform Context:**

```typescript
// Update PlatformContext to include store
export interface PlatformContextValue {
  // ... existing

  // State management
  store?: PlatformStore;  // Optional for backwards compatibility
}

// In shell app
import { Provider as ReduxProvider } from 'react-redux';
import { createPlatformStore } from '@platform/shared-state';

const store = createPlatformStore();

<ReduxProvider store={store}>
  <PlatformContext.Provider value={{ store, ... }}>
    {children}
  </PlatformContext.Provider>
</ReduxProvider>
```

**Module Federation Configuration:**

Add Redux to shared dependencies in all webpack configs:

```javascript
shared: {
  react: { singleton: true },
  'react-dom': { singleton: true },
  'react-redux': { singleton: true, requiredVersion: '^8.0.0' },
  '@reduxjs/toolkit': { singleton: true, requiredVersion: '^1.9.0' },
}
```

**Action Items:**
- [ ] Install Redux dependencies
- [ ] Create `shared-state` library
- [ ] Implement search slice
- [ ] Implement navigation slice
- [ ] Implement selection slice
- [ ] Add typed hooks
- [ ] Integrate with PlatformContext
- [ ] Update Module Federation configs
- [ ] Migrate tabs to use Redux hooks
- [ ] Add Redux DevTools integration
- [ ] Add tests
- [ ] Document Redux patterns

**Estimated Effort:** 1 week

---

### Phase 4: Runtime Composition (2-3 weeks)

#### 4.1 Implement Tab Manifest System

**Create Manifest Service:**

```typescript
// libs/platform-services/src/manifestService.ts
export interface TabManifest {
  id: string;
  version: string;
  remoteUrl: string;
  module: string;  // e.g., './App'
  title: string;
  icon?: string;
  props?: Record<string, unknown>;
  requiredPlatformVersion?: string;
}

export interface PlatformManifest {
  version: string;
  tabs: TabManifest[];
  sharedFilters?: string[];
  theme?: {
    primary: string;
    secondary: string;
  };
}

export class ManifestService {
  private manifestCache: Map<string, PlatformManifest> = new Map();

  async fetchManifest(url: string): Promise<PlatformManifest> {
    if (this.manifestCache.has(url)) {
      return this.manifestCache.get(url)!;
    }

    const response = await fetch(url);
    const manifest = await response.json();
    this.manifestCache.set(url, manifest);
    return manifest;
  }

  async loadTab(tabManifest: TabManifest): Promise<TabModule> {
    // Dynamic import of federated module
    const container = await this.loadRemoteContainer(tabManifest.remoteUrl);
    const module = await container.get(tabManifest.module);
    const TabComponent = module();

    return {
      id: tabManifest.id,
      version: tabManifest.version,
      title: tabManifest.title,
      component: TabComponent,
    };
  }

  private async loadRemoteContainer(url: string): Promise<any> {
    // Load remote script
    const script = document.createElement('script');
    script.src = url;

    return new Promise((resolve, reject) => {
      script.onload = () => {
        const containerName = this.extractContainerName(url);
        resolve((window as any)[containerName]);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  private extractContainerName(url: string): string {
    // Extract container name from URL
    // e.g., 'files_folders' from 'http://localhost:3002/remoteEntry.js'
    return url.split('/').pop()?.replace('remoteEntry.js', '') || '';
  }
}
```

**Create Manifest JSON:**

```json
// public/platform-manifest.json
{
  "version": "1.0.0",
  "tabs": [
    {
      "id": "files-folders",
      "version": "^2.0.0",
      "remoteUrl": "http://localhost:3002/remoteEntry.js",
      "module": "./App",
      "title": "Files & Folders",
      "icon": "folder",
      "props": {
        "defaultView": "tree",
        "allowUpload": true
      },
      "requiredPlatformVersion": "^1.0.0"
    },
    {
      "id": "hubs",
      "version": "^1.1.0",
      "remoteUrl": "http://localhost:3003/remoteEntry.js",
      "module": "./App",
      "title": "Hubs",
      "icon": "hub"
    }
  ],
  "sharedFilters": ["search", "dateRange", "owner"],
  "theme": {
    "primary": "#0061d5",
    "secondary": "#f7f7f8"
  }
}
```

**Update Shell to Use Manifest:**

```typescript
// apps/shell/src/App.tsx
import { ManifestService } from '@platform/services';
import { useEffect, useState } from 'react';

export const App = () => {
  const [tabs, setTabs] = useState<TabModule[]>([]);
  const [loading, setLoading] = useState(true);
  const manifestService = new ManifestService();

  useEffect(() => {
    const loadTabs = async () => {
      try {
        const manifest = await manifestService.fetchManifest('/platform-manifest.json');

        // Load all tabs
        const loadedTabs = await Promise.all(
          manifest.tabs.map(tabManifest => manifestService.loadTab(tabManifest))
        );

        setTabs(loadedTabs);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load tabs:', error);
        setLoading(false);
      }
    };

    loadTabs();
  }, []);

  if (loading) {
    return <div>Loading platform...</div>;
  }

  return (
    <PlatformProvider>
      <TabRenderer tabs={tabs} />
    </PlatformProvider>
  );
};
```

**Action Items:**
- [ ] Create ManifestService class
- [ ] Create platform-manifest.json
- [ ] Update shell to load tabs dynamically
- [ ] Add error handling for failed tab loads
- [ ] Add loading states
- [ ] Add fallback UI for missing tabs
- [ ] Support environment-specific manifests (dev/staging/prod)
- [ ] Add manifest validation
- [ ] Add version compatibility checking
- [ ] Document manifest schema
- [ ] Add manifest editor tool (optional)

**Estimated Effort:** 1 week

---

#### 4.2 Implement Version Negotiation

**Update Module Federation Configs:**

```javascript
// All webpack configs
new ModuleFederationPlugin({
  name: 'files_folders',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App',
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^18.0.0',
      strictVersion: false,  // Allow compatible versions
    },
    '@platform/context': {
      singleton: true,
      requiredVersion: '^1.0.0',
      strictVersion: true,   // Enforce exact compatibility
    },
  },
})
```

**Add Version Registry:**

```typescript
// libs/platform-services/src/versionRegistry.ts
export interface VersionCompatibility {
  package: string;
  version: string;
  compatibleWith: string[];  // Semver ranges
}

export class VersionRegistry {
  private compatibilityMatrix: VersionCompatibility[] = [
    {
      package: '@platform/context',
      version: '1.0.0',
      compatibleWith: ['^1.0.0'],
    },
    {
      package: '@platform/shared-components',
      version: '2.1.0',
      compatibleWith: ['^2.0.0', '^1.5.0'],
    },
  ];

  isCompatible(packageName: string, requiredVersion: string, providedVersion: string): boolean {
    const compatibility = this.compatibilityMatrix.find(c => c.package === packageName);
    if (!compatibility) return true;  // Unknown packages are optimistically compatible

    return compatibility.compatibleWith.some(range =>
      this.satisfies(providedVersion, range)
    );
  }

  private satisfies(version: string, range: string): boolean {
    // Use semver library for proper version comparison
    const semver = require('semver');
    return semver.satisfies(version, range);
  }
}
```

**Action Items:**
- [ ] Install semver library
- [ ] Add requiredVersion to all shared packages
- [ ] Create VersionRegistry class
- [ ] Add version compatibility matrix
- [ ] Update ManifestService to check compatibility
- [ ] Add runtime version mismatch warnings
- [ ] Add version to package.json metadata
- [ ] Document versioning strategy
- [ ] Add automated compatibility tests

**Estimated Effort:** 3 days

---

### Phase 5: Production Readiness (3-4 weeks)

#### 5.1 Component Library with Storybook

**Install Storybook:**
```bash
npx storybook@latest init
```

**Create Stories:**

```typescript
// libs/shared-components/src/Button/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
};
```

**Add Visual Regression Testing:**

```bash
npm install @storybook/test-runner @storybook/addon-interactions
```

**Action Items:**
- [ ] Install Storybook
- [ ] Create stories for all shared components
- [ ] Add interaction tests
- [ ] Add visual regression tests (Chromatic or Percy)
- [ ] Set up Storybook deployment
- [ ] Document component API
- [ ] Add design token documentation
- [ ] Create component usage guidelines

**Estimated Effort:** 1 week

---

#### 5.2 Design System & Tokens

**Create Design Token System:**

```typescript
// libs/design-tokens/src/tokens.ts
export const tokens = {
  colors: {
    primary: '#0061d5',
    primaryHover: '#0052b4',
    secondary: '#f7f7f8',
    text: '#222222',
    textSecondary: '#767676',
    border: '#e2e2e2',
    background: '#ffffff',
    backgroundAlt: '#f7f7f8',
    success: '#2d6e2d',
    warning: '#f59b00',
    danger: '#d32f2f',
  },

  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    fontSize: {
      xs: '11px',
      sm: '13px',
      md: '14px',
      lg: '16px',
      xl: '18px',
      xxl: '24px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
  },

  borderRadius: {
    sm: '2px',
    md: '4px',
    lg: '8px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px rgba(0, 0, 0, 0.1)',
    lg: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
};

// Export as CSS variables
export const cssVariables = `
:root {
  --color-primary: ${tokens.colors.primary};
  --color-primary-hover: ${tokens.colors.primaryHover};
  --color-secondary: ${tokens.colors.secondary};
  --color-text: ${tokens.colors.text};
  --color-text-secondary: ${tokens.colors.textSecondary};
  --color-border: ${tokens.colors.border};

  --font-family: ${tokens.typography.fontFamily};
  --font-size-base: ${tokens.typography.fontSize.sm};

  --spacing-sm: ${tokens.spacing.sm};
  --spacing-md: ${tokens.spacing.md};
  --spacing-lg: ${tokens.spacing.lg};
}
`;
```

**Action Items:**
- [ ] Create design-tokens package
- [ ] Document all tokens
- [ ] Generate CSS variables
- [ ] Update all components to use tokens
- [ ] Add token validation
- [ ] Create design system documentation site
- [ ] Establish Design Council governance
- [ ] Create token update process

**Estimated Effort:** 3-4 days

---

#### 5.3 Telemetry & Feature Flags

**Add Telemetry Service:**

```typescript
// libs/platform-services/src/telemetry.ts
export interface TelemetryEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: Date;
}

export interface TelemetryService {
  track(event: TelemetryEvent): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
  page(name: string, properties?: Record<string, unknown>): void;
}

// Implementation for popular services
export class SegmentTelemetry implements TelemetryService {
  track(event: TelemetryEvent): void {
    if (window.analytics) {
      window.analytics.track(event.name, event.properties);
    }
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (window.analytics) {
      window.analytics.identify(userId, traits);
    }
  }

  page(name: string, properties?: Record<string, unknown>): void {
    if (window.analytics) {
      window.analytics.page(name, properties);
    }
  }
}

// Usage in tabs
export const useTracking = () => {
  const { telemetry } = usePlatform();

  return {
    trackEvent: (name: string, properties?: Record<string, unknown>) => {
      telemetry?.track({ name, properties });
    },
  };
};
```

**Add Feature Flags:**

```typescript
// libs/platform-services/src/featureFlags.ts
export interface FeatureFlagService {
  isEnabled(flag: string): boolean;
  getVariant(flag: string): string | undefined;
}

export class LaunchDarklyFlags implements FeatureFlagService {
  private client: any;  // LaunchDarkly client

  constructor(clientSideId: string) {
    this.client = LaunchDarkly.initialize(clientSideId, {
      key: 'anonymous',
    });
  }

  isEnabled(flag: string): boolean {
    return this.client.variation(flag, false);
  }

  getVariant(flag: string): string | undefined {
    return this.client.variation(flag);
  }
}

// Usage
export const useFeatureFlag = (flag: string) => {
  const { featureFlags } = usePlatform();
  return featureFlags?.isEnabled(flag) ?? false;
};
```

**Action Items:**
- [ ] Choose telemetry provider (Segment, Mixpanel, custom)
- [ ] Choose feature flag provider (LaunchDarkly, Unleash, custom)
- [ ] Implement TelemetryService
- [ ] Implement FeatureFlagService
- [ ] Add to PlatformContext
- [ ] Add tracking to key user actions
- [ ] Add feature flags for new features
- [ ] Document telemetry events
- [ ] Document feature flag strategy

**Estimated Effort:** 3-4 days

---

#### 5.4 Testing Strategy

**Consumer Contract Tests:**

```typescript
// tests/contracts/tab-contract.test.ts
import { TabModule } from '@platform/tab-contract';
import { PlatformContextValue } from '@platform/context';

describe('Tab Contract Compliance', () => {
  const mockContext: PlatformContextValue = {
    search: { query: '', setQuery: jest.fn(), filters: [], setFilters: jest.fn() },
    navigation: { currentPath: [], navigateTo: jest.fn() },
    selection: { selectedIds: [], setSelection: jest.fn() },
    user: { id: '1', name: 'Test', permissions: [] },
  };

  const testTabCompliance = (tabModule: TabModule) => {
    it('should have required properties', () => {
      expect(tabModule).toHaveProperty('id');
      expect(tabModule).toHaveProperty('title');
      expect(tabModule).toHaveProperty('mount');
    });

    it('should mount without errors', () => {
      const instance = tabModule.mount(mockContext);
      expect(instance).toHaveProperty('component');
    });

    it('should cleanup on unmount', () => {
      const instance = tabModule.mount(mockContext);
      if (tabModule.unmount) {
        expect(() => tabModule.unmount()).not.toThrow();
      }
    });
  };

  describe('Files & Folders Tab', () => {
    const filesTab = require('../../../apps/files-folders/src/plugin').default;
    testTabCompliance(filesTab);
  });

  // Test all tabs
});
```

**E2E Tests with Cross-MFE Interactions:**

```typescript
// apps/e2e/tests/cross-tab-coordination.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Cross-Tab Coordination', () => {
  test('search should update results in all tabs', async ({ page }) => {
    await page.goto('/');

    // Enter search query
    await page.fill('[data-testid="search-input"]', 'test query');

    // Switch to Files tab
    await page.click('[data-testid="tab-files"]');
    await expect(page.locator('[data-testid="search-results"]')).toContainText('3 results');

    // Switch to Hubs tab
    await page.click('[data-testid="tab-hubs"]');
    await expect(page.locator('[data-testid="search-results"]')).toContainText('1 result');

    // Clear search
    await page.click('[data-testid="clear-search"]');

    // Verify both tabs cleared
    await page.click('[data-testid="tab-files"]');
    await expect(page.locator('[data-testid="search-results"]')).not.toBeVisible();
  });

  test('bulk selection should persist across tab switches', async ({ page }) => {
    await page.goto('/?tab=files');

    // Select items
    await page.click('[data-testid="file-1"]');
    await page.click('[data-testid="file-2"]', { modifiers: ['Control'] });

    // Switch to another tab and back
    await page.click('[data-testid="tab-hubs"]');
    await page.click('[data-testid="tab-files"]');

    // Verify selection persisted
    await expect(page.locator('[data-testid="file-1"]')).toHaveClass(/selected/);
    await expect(page.locator('[data-testid="file-2"]')).toHaveClass(/selected/);
  });
});
```

**Action Items:**
- [ ] Create contract test suite
- [ ] Add contract tests for all tabs
- [ ] Create E2E test suite for cross-MFE scenarios
- [ ] Add visual regression tests
- [ ] Add performance tests
- [ ] Set up CI pipeline for tests
- [ ] Add test coverage reporting
- [ ] Document testing strategy

**Estimated Effort:** 1 week

---

#### 5.5 CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/deploy.yml
name: Deploy Platform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test

      - name: Run contract tests
        run: npm run test:contract

      - name: Build all modules
        run: npm run build:all

      - name: Run E2E tests
        run: npm run test:e2e

  deploy-shared:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        module: [shared-components, shared-data, tab-contract]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Build ${{ matrix.module }}
        run: npm run build --workspace=${{ matrix.module }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets[format('VERCEL_PROJECT_{0}', matrix.module)] }}
          working-directory: ./${{ matrix.module }}

  deploy-apps:
    needs: deploy-shared
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [shell, content-platform, files-folders, hubs, reports, user]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Build ${{ matrix.app }}
        run: npm run build --workspace=${{ matrix.app }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets[format('VERCEL_PROJECT_{0}', matrix.app)] }}
          working-directory: ./${{ matrix.app }}

  update-manifest:
    needs: deploy-apps
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Update production manifest
        run: |
          node scripts/update-manifest.js \
            --env production \
            --version ${{ github.sha }}

      - name: Deploy manifest
        run: aws s3 cp platform-manifest.json s3://platform-manifests/production/
```

**Action Items:**
- [ ] Create GitHub Actions workflow
- [ ] Set up Vercel projects for all modules
- [ ] Add deploy secrets to GitHub
- [ ] Create manifest update script
- [ ] Set up staging environment
- [ ] Configure preview deployments for PRs
- [ ] Add deployment notifications
- [ ] Document deployment process

**Estimated Effort:** 3-4 days

---

## 5. Decision Matrix

### When to Choose Each Approach

| Your Situation | Recommended Approach | Reason |
|---------------|---------------------|---------|
| **POC/Prototype** | Current Implementation | Fast, simple, no infrastructure needed |
| **Single Team, Internal Tool** | Jules + Enhanced Context | Simple governance, good DX, Nx tooling |
| **Multiple Teams, Product** | Design Proposal + Redux | Strong coordination, enterprise-ready |
| **Enterprise, Many Teams** | Full Design Proposal | Governance, versioning, contracts |

### Backend Considerations

| Backend Type | Data Strategy | State Strategy |
|-------------|--------------|----------------|
| **No Backend Yet** | Mock data → REST later | Context only |
| **REST APIs** | React Query or SWR | Context + Event Bus |
| **GraphQL API** | Apollo Client | Redux + Context |
| **Mix of Both** | Apollo + REST adapter | Redux + Context |

### Team Size Impact

| Team Size | Repo Structure | State Strategy |
|-----------|---------------|----------------|
| **1-3 developers** | Flat monorepo | React state or Context |
| **4-8 developers** | Nx monorepo | Context + Event Bus |
| **9-20 developers** | Nx + separate repos | Redux + Context |
| **20+ developers** | Full federation | Redux + Versioning + Contracts |

---

## 6. Risk Assessment

### High Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Version Conflicts** | Apps break in production | Implement strict versioning + contract tests |
| **Performance (Bundle Size)** | Slow load times | Code splitting, lazy loading, shared dependencies |
| **State Synchronization** | Inconsistent UI | Choose Redux if coordination critical |
| **Backend Not Ready** | Blocked development | Mock data layer, swap later |
| **Team Coordination** | Conflicting changes | Clear ownership, contracts, CI/CD |

### Medium Risk Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Learning Curve** | Slower initial development | Training, documentation, examples |
| **Testing Complexity** | Brittle tests | Contract tests, E2E for integration |
| **Deployment Complexity** | Failed deploys | Staging environment, rollback plan |
| **Design System Drift** | Inconsistent UI | Design Council, Storybook, visual tests |

---

## 7. Recommended Phased Approach

### Phase 1 (MVP - 4 weeks)
**Goal:** Working platform with 3 tabs, basic coordination

- [x] Current implementation (Box design, breadcrumbs, URL routing)
- [ ] Add Nx monorepo for content platform
- [ ] Add React Context for shared state
- [ ] Add Event Bus (mitt) for cross-tab events
- [ ] Add enhanced tab contract

**Deliverable:** Demo-ready platform with professional UI

---

### Phase 2 (Data Layer - 3 weeks)
**Goal:** Real data integration

- [ ] Add @content-platform/data package
- [ ] Integrate GraphQL/Apollo or React Query
- [ ] Add shared queries/fragments
- [ ] Add data hooks
- [ ] Update tabs to use real data

**Deliverable:** Platform with real backend integration

---

### Phase 3 (Production Patterns - 3 weeks)
**Goal:** Production-ready state management

- [ ] Add Redux for complex coordination
- [ ] Migrate search/filters/selection to Redux
- [ ] Keep Context for simple props
- [ ] Add telemetry and feature flags
- [ ] Add error boundaries

**Deliverable:** Production-ready state management

---

### Phase 4 (Dynamic Composition - 3 weeks)
**Goal:** Runtime tab loading

- [ ] Implement ManifestService
- [ ] Create platform-manifest.json
- [ ] Add version negotiation
- [ ] Add dynamic tab loading
- [ ] Add loading/error states

**Deliverable:** Data-driven platform composition

---

### Phase 5 (Enterprise Features - 4 weeks)
**Goal:** Governance and tooling

- [ ] Add Storybook with all components
- [ ] Add design token system
- [ ] Add visual regression tests
- [ ] Add contract tests
- [ ] Complete CI/CD pipeline
- [ ] Add monitoring and observability

**Deliverable:** Enterprise-grade platform

---

## 8. Summary of Action Items by Priority

### 🔴 Critical (Do First)
1. ✅ Polish tabs with Box design (DONE)
2. ✅ Add breadcrumbs navigation (DONE)
3. ✅ Add URL-based deep linking (DONE)
4. ✅ Fix Vercel deployment issues (DONE)
5. ✅ Document Artifactory strategy (DONE)
6. [ ] **DECISION:** Choose repository structure (Nx full/hybrid/flat)
7. [ ] **DECISION:** Choose data fetching strategy (GraphQL/REST)
8. [ ] **DECISION:** Choose state management strategy (Redux/Context/Both)

### 🟡 Important (Do Soon)
1. [ ] Add React Context for platform state
2. [ ] Add Event Bus for cross-tab communication
3. [ ] Implement data layer (GraphQL or REST)
4. [ ] Add shared data hooks
5. [ ] Enhance tab contract with filters/actions
6. [ ] Add error boundaries
7. [ ] Add loading states

### 🟢 Nice to Have (Do Later)
1. [ ] Migrate to Nx monorepo
2. [ ] Add Redux for complex state
3. [ ] Implement runtime JSON composition
4. [ ] Add version negotiation
5. [ ] Add Storybook
6. [ ] Add design token system
7. [ ] Add telemetry and feature flags
8. [ ] Add contract tests
9. [ ] Complete CI/CD pipeline

---

## 9. Next Steps

### Immediate Actions (This Week)

1. **Make Key Decisions:**
   - [ ] Repository structure: Full Nx, Hybrid, or Flat?
   - [ ] Data fetching: GraphQL (Apollo/urql) or REST (React Query/SWR)?
   - [ ] State management: Redux now, Context now, or defer?

2. **Foundation Work:**
   - [ ] Create PlatformContext with basic shared state
   - [ ] Add Event Bus library (mitt)
   - [ ] Update tabs to use Context instead of props
   - [ ] Document communication patterns

3. **Data Integration:**
   - [ ] Audit backend APIs (GraphQL or REST?)
   - [ ] Choose and install data fetching library
   - [ ] Create @content-platform/data package
   - [ ] Add first real query (e.g., files)

### Questions to Answer

1. **Do you have a GraphQL backend?**
   - Yes → Use Apollo or urql
   - No, REST only → Use React Query
   - No backend yet → Keep mocks, plan for REST

2. **How many developers will work on this?**
   - 1-3 → Keep flat structure, use Context
   - 4-8 → Migrate to Nx, use Context + Event Bus
   - 9+ → Full Nx, add Redux

3. **What's your timeline?**
   - Demo in 2 weeks → Keep current, polish features
   - Production in 2 months → Add Phase 1-2 (Context, Data)
   - Enterprise rollout 6+ months → Full roadmap

4. **What's your backend status?**
   - APIs ready → Integrate in Phase 2
   - APIs in progress → Mock now, real data later
   - No APIs → Full mock layer

---

## 10. Resources

### Documentation
- Module Federation: https://module-federation.github.io/
- Nx Monorepo: https://nx.dev/
- Redux Toolkit: https://redux-toolkit.js.org/
- React Query: https://tanstack.com/query
- Apollo Client: https://www.apollographql.com/docs/react/

### Examples
- Current Implementation: `claude/modular-frontend-platform-011CUNdLAE8t1SsS4pZ9e25t` branch
- Design Proposal: `codex/design-platform-using-webpack-federated-modules` branch
- Jules Implementation: `jules` branch

### Tools
- Nx Console (VS Code extension)
- Redux DevTools
- Apollo DevTools
- React DevTools
- Webpack Bundle Analyzer

---

## Appendix: Architecture Diagrams

### Current Implementation
```
Shell (top-level-shell)
├── Search Bar (URL params)
├── Tab Navigation
└── Tab Content
    ├── Content Platform (content-platform/shell)
    │   ├── Filters
    │   ├── Breadcrumbs
    │   └── Files & Folders Tab (files-folders)
    ├── Hubs Tab (hubs-tab)
    ├── Reports Tab (reports-tab)
    └── User Tab (user-tab)

Shared:
├── shared-components (Box design system)
└── shared-data (mock data utils)
```

### Design Proposal
```
Parent Shell
├── Navigation Chrome
├── Auth & Session
├── Platform Services (telemetry, feature flags)
└── Content Platform (MFE)
    ├── Redux Store (search, navigation, selection)
    ├── GraphQL Client (Apollo)
    ├── Event Bus (RxJS)
    └── Dynamic Tabs (JSON-driven)
        ├── Files & Folders (MFE)
        ├── Hubs (MFE)
        └── Forms (MFE)

Shared (Federated):
├── @content-platform/ui (Storybook)
├── @content-platform/data (GraphQL + Redux)
└── @content-platform/tab-contract (TypeScript)
```

### Jules Implementation
```
Shell (CRA + Craco)
├── Navigation
└── Content Platform (MFE, Nx app)
    ├── ContentContext (React Context)
    ├── Filters
    └── Tabs
        ├── Files & Folders (MFE, Nx app)
        │   └── Independent Redux Store
        └── Other Tabs

Shared (Nx libs):
├── libs/shared-components (federated)
└── Event Bus (tiny-emitter, planned)
```

### Recommended Hybrid
```
Shell
├── PlatformContext (React Context)
│   ├── Search & Filters
│   ├── Navigation State
│   ├── User Session
│   └── Services (telemetry, feature flags)
├── Event Bus (mitt)
├── Redux Store (complex state)
│   ├── search (query, filters, results)
│   ├── navigation (path, breadcrumbs)
│   └── selection (selectedIds)
└── ManifestService (JSON composition)
    └── Dynamic Tab Loading

Content Platform
├── Consumes PlatformContext
├── Subscribes to Event Bus
└── Dynamic Tabs
    ├── Files & Folders
    │   ├── Uses PlatformContext
    │   ├── Emits events
    │   └── Accesses Redux via Context
    └── Other Tabs

Shared (Federated):
├── @platform/context (TypeScript interfaces)
├── @platform/shared-components (Box design)
├── @platform/shared-data (GraphQL/Apollo)
├── @platform/shared-state (Redux slices)
└── @platform/tab-contract (Tab interface)
```

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-22
**Status:** Draft - Awaiting Decisions
