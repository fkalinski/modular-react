# Content Platform Modular Architecture Design

## 1. Vision and Goals
- Deliver a cohesive, extensible "Content" experience composed of runtime-loaded micro frontends (MFEs) while preserving consistent UX, shared data contracts, and unified application shell.
- Balance autonomy for domain teams with strong platform constraints via shared component library, GraphQL data contracts, and semantic-versioned contracts.
- Enable future low-code composition (JSON-defined layouts) without rebuilding MFEs.

## 2. Architectural Overview

### 2.1 High-Level Topology
- **Parent Shell Application (Standalone Repo)**
  - Hosts navigation chrome, authentication, routing, cross-cutting services (feature flags, telemetry), and shared context providers (search/filter state, user/session context).
  - Consumes remote MFEs via Module Federation (MF) while exposing platform contracts via shared libraries.
- **Content Platform (Separate Repo managed via Nx Monorepo)**
  - Provides the "Content" tab container MFE loaded by the shell.
  - Houses reusable sub-tab MFEs (Files & Folders, Hubs, Form Submissions) and shared utilities.
  - Publishes shared component & data libraries as federated remotes with semantic versioning.
- **External Domain MFEs (e.g., Reports, User, standalone Hubs)**
  - Independently deployed remotes consuming published contracts.

### 2.2 Module Federation Approach
- Adopt **Module Federation 2.0** (Webpack 6) to leverage improved share scopes, streaming compilation, and async boundary optimizations.
- For teams requiring current stability, offer compatibility build targets using **Module Federation 1.5** during transition.
- Evaluate **Native Federation** as a future path: maintain compatibility by wrapping Module Federation builds with the `@module-federation/native-federation` plugin to allow eventual move toward standard ESM-based federation.

### 2.3 Deployment Model
- Each repo builds as an independent artifact (e.g., static bundle served via CDN + manifest).
- Shell loads manifests dynamically, enabling runtime discovery and version negotiation.
- Use a **registry service** (simple JSON manifest or service worker) to map semantic versions to remote URLs.

## 3. Shared Contracts

### 3.1 UI Component Library
- Build with Storybook-driven development, exported as an MF remote (e.g., `@content-platform/ui`).
- Components include navigation elements, layout primitives, data grids, tree controls, action bars, filter panels.
- Enforce design constraints via:
  - Design tokens (CSS variables) pulled from shell.
  - Accessible, theme-aware components using CSS-in-JS or utility classes.
  - Snapshot & visual regression tests in shared repo.

### 3.2 Data Access Layer
- Provide `@content-platform/data` remote exposing:
  - **GraphQL Client** (Apollo) with platform-level cache configuration.
  - **Base Query Fragments** for domain entities (content item, hub, form submission).
  - **Extension API**: MFEs supply additional fragment spreads to extend base types without duplicating queries.
  - **Shared Redux Toolkit slices** for global filter/search state and selected entity context.
- Use typed GraphQL (codegen) to ensure compatibility; publish TypeScript types with versioned contract.

### 3.3 Contract Versioning & Negotiation
- Semantic versioning per contract package (`@content-platform/ui`, `@content-platform/data`, `@content-platform/tab-contract`).
- Shell hosts **version broker**:
  - Maintains list of compatible contract ranges.
  - Negotiates with remote container using `requiredVersion` and `singleton` options in Module Federation share config.
- Provide automated compatibility tests (consumer contract tests) to ensure new contract versions do not break existing MFEs.

## 4. Composition Model

### 4.1 Tab Contract
- Define TypeScript interfaces describing a tab module:
  ```ts
  interface ContentTabModule {
    id: string;
    title: string;
    icon?: React.ReactNode;
    routes: TabRoute[]; // path -> component mapping
    contributesFilters?: FilterContribution[];
    contributesActions?: ActionContribution[];
    mount(context: PlatformContext): TabInstance;
  }
  ```
- `PlatformContext` includes shared Redux store slices, GraphQL client, telemetry, feature flag access, and navigation APIs.

### 4.2 Runtime Composition via JSON
- Shell fetches JSON descriptor (from CMS or config service) describing tab layout and order:
  ```json
  {
    "tabs": [
      { "module": "filesFolders", "version": "^2.0.0", "props": { "defaultView": "tree" } },
      { "module": "hubs", "version": "^1.1.0" }
    ],
    "sharedFilters": ["search", "dateRange", "owner"]
  }
  ```
- Descriptor feeds composition engine that resolves modules via Module Federation loader, instantiates tabs, and wires filters/actions.

### 4.3 Shared State Integration
- Shell owns Redux store with global slices:
  - `searchContext`: query text, filters.
  - `navigationContext`: current folder/hub entity.
  - `selectionContext`: selected items for bulk actions.
- Tab modules receive `PlatformContext.store` (scoped dispatch/selectors) and can register domain-specific slices using `redux-dynamic-modules` pattern.
- Cross-tab communication via store events and pub/sub service (RxJS-based event bus) for non-stateful events.

## 5. Data Flow Patterns
- **GraphQL Query Extension**: base query defined in `@content-platform/data` fetches `ContentItem` fields; tabs supply fragment to extend via GraphQL `...TabSpecificFields` using Apollo `@client` directives when needed.
- **Hydration**: when base data loads, domain-specific hydration functions run to fetch additional data lazily (e.g., on row expansion).
- **Caching Strategy**: normalized cache shared across tabs ensures consistent updates when context changes.

## 6. Extensibility & Governance
- Establish **Design Council** to review shared components, ensuring adherence to design tokens.
- CI pipelines enforce `npm dist-tag` publishing rules and run consumer contract tests against critical MFEs.
- Provide scaffolding CLI (Nx generator) to create new tabs with preconfigured share scopes and testing.

## 7. Plan for Proof of Concept (PoC)

1. **Set Up Repositories**
   - Bootstrap shell repo with Webpack 6 + Module Federation 2.0.
   - Create `content-platform` Nx workspace containing `shell` host and `files-folders` remote.
   - Scaffold separate `hubs` repo as remote consumer.
2. **Implement Shared Libraries**
   - Build `@content-platform/ui` with basic layout components (PageShell, TabBar, FilterPanel, DataTable).
   - Build `@content-platform/data` with Apollo client setup, shared filters slice using Redux Toolkit, and TypeScript interfaces.
   - Publish libraries as federated remotes using semantic versioning (configure share scopes).
3. **Develop Tab Contract**
   - Define `@content-platform/tab-contract` package with TypeScript interface and helper loader function.
   - Implement runtime JSON descriptor loader in shell.
4. **Create PoC Tabs**
   - `files-folders` tab inside monorepo consuming shared UI/data, rendering tree-table with shared filters.
   - `hubs` tab in external repo referencing same contracts, demonstrating remote extension.
5. **Integrate Shared State**
   - Configure shell Redux store with dynamic module loading, share store via React context provider.
   - Demonstrate cross-tab interaction (e.g., search filter affecting both tabs).
6. **Version Negotiation**
   - Configure Module Federation share options with `requiredVersion` and `singleton` for shared libs.
   - Implement simple manifest service returning remote URLs and versions.
7. **Testing & Validation**
   - Add unit tests for tab contract loader and Redux interactions.
   - Use Storybook visual regression for shared UI components.
   - Run end-to-end smoke test demonstrating runtime composition from JSON config.
8. **Documentation & Hand-off**
   - Document onboarding, contract versioning policy, and extension guidelines.

## 8. Future Considerations
- Explore migration to **Native Federation** once browser support matures; maintain compatibility via build adapters.
- Integrate feature flag service to enable/disable tabs dynamically.
- Build low-code builder that writes JSON descriptors and manages remote module versions.

