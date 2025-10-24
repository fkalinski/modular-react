/**
 * @platform/shared-state
 *
 * Shared Redux store for platform state management
 *
 * This package provides Redux-based state management as an alternative
 * (or complement) to React Context (@platform/context).
 *
 * Usage:
 * 1. Create store in shell: const store = createPlatformStore()
 * 2. Wrap app with Provider: <Provider store={store}>
 * 3. Use hooks in tabs: const { query, setQuery } = useReduxSearch()
 *
 * Compare with @platform/context to choose the right pattern for your use case.
 */

// Export store
export { createPlatformStore } from './store';
export type { PlatformStore, RootState, AppDispatch } from './store';

// Export hooks
export {
  useAppDispatch,
  useAppSelector,
  useReduxSearch,
  useReduxNavigation,
  useReduxSelection,
} from './hooks';

// Export slices
export { searchSlice } from './slices/searchSlice';
export { navigationSlice } from './slices/navigationSlice';
export { selectionSlice } from './slices/selectionSlice';

// Export actions
export {
  setQuery,
  setFilters,
  addFilter,
  removeFilter,
  clearSearch,
  updateResults,
} from './slices/searchSlice';

export {
  setPath,
  navigateToFolder,
  navigateToHub,
  clearNavigation,
} from './slices/navigationSlice';

export {
  setSelection,
  toggleSelection,
  selectAll,
  clearSelection,
  selectRange,
} from './slices/selectionSlice';

// Export selectors
export {
  selectSearchQuery,
  selectFilters,
  selectSearchResults,
} from './slices/searchSlice';

export {
  selectCurrentPath,
  selectCurrentFolderId,
  selectCurrentHubId,
} from './slices/navigationSlice';

export {
  selectSelectedIds,
  selectLastSelectedId,
  selectSelectionCount,
} from './slices/selectionSlice';

// Export types
export type { Filter, SearchState } from './slices/searchSlice';
export type { Breadcrumb, NavigationState } from './slices/navigationSlice';
export type { SelectionState } from './slices/selectionSlice';
