// Store
export { createStore, type DynamicStore, type StoreState, type AppDispatch } from './store';
export * from './store/slices/filtersSlice';
export * from './store/slices/selectionSlice';
export * from './store/slices/navigationSlice';

// Context
export { PlatformContextProvider, usePlatformContext, type PlatformContextValue } from './context/PlatformContext';

// Events
export { eventBus, PlatformEvent, type EventPayload } from './events';

// GraphQL
export { createApolloClient, ApolloProvider, gql, CONTENT_ITEM_FIELDS, GET_CONTENT_ITEMS } from './graphql';
export {
  fragmentRegistry,
  FragmentRegistry,
  createFragment,
  registerTabFragment,
  type QueryFragment,
  type ComposedQuery,
} from './graphql';

// Enrichers
export {
  enricherRegistry,
  EnricherRegistry,
  createEnricher,
  registerTabEnricher,
  enrichers,
  type FieldEnricher,
  type EnricherFunction,
  type EnrichmentResult,
} from './enrichers';

// Module Federation utilities
export {
  loadDynamicRemote,
  preloadRemote,
  getRemoteURL,
  isRemoteOverridden,
  getAllOverrides,
} from './utils/loadDynamicRemote';
export { default as mfDevTools } from './utils/mfDevTools';
