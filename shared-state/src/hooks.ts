import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import { useCallback } from 'react';

// Typed hooks for Redux
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Convenience hooks for specific slices
 */

// Search hooks
import {
  setQuery,
  setFilters,
  addFilter as addFilterAction,
  removeFilter as removeFilterAction,
  clearSearch,
  updateResults,
} from './slices/searchSlice';

export const useReduxSearch = () => {
  const dispatch = useAppDispatch();
  const search = useAppSelector((state) => state.search);

  return {
    query: search.query,
    filters: search.filters,
    results: search.results,
    setQuery: useCallback((query: string) => dispatch(setQuery(query)), [dispatch]),
    setFilters: useCallback((filters: typeof search.filters) => dispatch(setFilters(filters)), [dispatch]),
    addFilter: useCallback((filter: typeof search.filters[0]) => dispatch(addFilterAction(filter)), [dispatch]),
    removeFilter: useCallback((filterId: string) => dispatch(removeFilterAction(filterId)), [dispatch]),
    clearAll: useCallback(() => dispatch(clearSearch()), [dispatch]),
    updateResults: useCallback((results: Partial<typeof search.results>) => dispatch(updateResults(results)), [dispatch]),
  };
};

// Navigation hooks
import {
  setPath,
  navigateToFolder,
  navigateToHub,
  clearNavigation,
} from './slices/navigationSlice';

export const useReduxNavigation = () => {
  const dispatch = useAppDispatch();
  const navigation = useAppSelector((state) => state.navigation);

  return {
    currentPath: navigation.currentPath,
    currentFolderId: navigation.currentFolderId,
    currentHubId: navigation.currentHubId,
    setPath: useCallback((path: typeof navigation.currentPath) => dispatch(setPath(path)), [dispatch]),
    navigateToFolder: useCallback(
      (folderId: string, breadcrumbs: typeof navigation.currentPath) =>
        dispatch(navigateToFolder({ folderId, breadcrumbs })),
      [dispatch]
    ),
    navigateToHub: useCallback(
      (hubId: string, breadcrumbs: typeof navigation.currentPath) =>
        dispatch(navigateToHub({ hubId, breadcrumbs })),
      [dispatch]
    ),
    clear: useCallback(() => dispatch(clearNavigation()), [dispatch]),
  };
};

// Selection hooks
import {
  setSelection as setSelectionAction,
  toggleSelection as toggleSelectionAction,
  selectAll as selectAllAction,
  clearSelection as clearSelectionAction,
  selectRange,
} from './slices/selectionSlice';

export const useReduxSelection = () => {
  const dispatch = useAppDispatch();
  const selection = useAppSelector((state) => state.selection);

  return {
    selectedIds: selection.selectedIds,
    lastSelectedId: selection.lastSelectedId,
    count: selection.selectedIds.length,
    setSelection: useCallback((ids: string[]) => dispatch(setSelectionAction(ids)), [dispatch]),
    toggleSelection: useCallback((id: string) => dispatch(toggleSelectionAction(id)), [dispatch]),
    selectAll: useCallback((ids: string[]) => dispatch(selectAllAction(ids)), [dispatch]),
    selectRange: useCallback(
      (allIds: string[], endId: string) => dispatch(selectRange({ allIds, endId })),
      [dispatch]
    ),
    clearSelection: useCallback(() => dispatch(clearSelectionAction()), [dispatch]),
  };
};
