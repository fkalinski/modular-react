import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Filter, publishEvent } from './EventBus';

/**
 * Breadcrumb item for navigation
 */
export interface Breadcrumb {
  id: string;
  label: string;
  path?: string;
  onClick?: () => void;
}

/**
 * User information
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  permissions: string[];
}

/**
 * Platform Context Value
 *
 * This context provides shared state and services to all micro-frontends.
 * It uses React Context for parent-child communication and state that needs
 * to be accessed by multiple tabs.
 *
 * Design Philosophy:
 * - Simple state (search, filters, selection) lives in Context
 * - Complex coordination uses Event Bus
 * - Each tab can also have its own local state
 */
export interface PlatformContextValue {
  // Search & Filters
  search: {
    query: string;
    setQuery: (query: string) => void;
    filters: Filter[];
    setFilters: (filters: Filter[]) => void;
    addFilter: (filter: Filter) => void;
    removeFilter: (filterId: string) => void;
    clearAll: () => void;
  };

  // Navigation
  navigation: {
    currentPath: Breadcrumb[];
    setPath: (path: Breadcrumb[]) => void;
    navigateTo: (breadcrumb: Breadcrumb) => void;
  };

  // Selection (for bulk actions)
  selection: {
    selectedIds: string[];
    setSelection: (ids: string[]) => void;
    toggleSelection: (id: string) => void;
    clearSelection: () => void;
    selectAll: (ids: string[]) => void;
  };

  // User & Auth
  user: User;

  // Services (to be added in future phases)
  // telemetry?: TelemetryService;
  // featureFlags?: FeatureFlagService;
  // data?: DataService;
}

/**
 * Create the Platform Context
 */
export const PlatformContext = createContext<PlatformContextValue | null>(null);

/**
 * Hook to access Platform Context
 * Throws error if used outside PlatformProvider
 */
export const usePlatform = (): PlatformContextValue => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within PlatformProvider');
  }
  return context;
};

/**
 * Platform Provider Props
 */
interface PlatformProviderProps {
  children: ReactNode;
  user: User;
  initialSearch?: string;
  initialFilters?: Filter[];
}

/**
 * Platform Provider Component
 *
 * Wraps the application and provides platform context to all children.
 * Should be placed at the shell level to provide context to all tabs.
 *
 * @example
 * <PlatformProvider user={currentUser}>
 *   <App />
 * </PlatformProvider>
 */
export const PlatformProvider: React.FC<PlatformProviderProps> = ({
  children,
  user,
  initialSearch = '',
  initialFilters = [],
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFiltersState] = useState<Filter[]>(initialFilters);

  // Navigation state
  const [currentPath, setCurrentPath] = useState<Breadcrumb[]>([]);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search methods
  const setQuery = useCallback((query: string) => {
    setSearchQuery(query);
    // Emit event for other tabs to react
    if (query) {
      publishEvent('search:submitted', { query, timestamp: new Date() });
    } else {
      publishEvent('search:cleared', { timestamp: new Date() });
    }
  }, []);

  const setFilters = useCallback((newFilters: Filter[]) => {
    setFiltersState(newFilters);
    publishEvent('filter:changed', { filters: newFilters, timestamp: new Date() });
  }, []);

  const addFilter = useCallback((filter: Filter) => {
    setFiltersState(prev => {
      // Replace if filter with same id exists
      const existing = prev.findIndex(f => f.id === filter.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = filter;
        publishEvent('filter:applied', {
          filterType: filter.type,
          value: filter.value,
          timestamp: new Date(),
        });
        return updated;
      }
      publishEvent('filter:applied', {
        filterType: filter.type,
        value: filter.value,
        timestamp: new Date(),
      });
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((filterId: string) => {
    setFiltersState(prev => {
      const filter = prev.find(f => f.id === filterId);
      if (filter) {
        publishEvent('filter:removed', {
          filterType: filter.type,
          timestamp: new Date(),
        });
      }
      return prev.filter(f => f.id !== filterId);
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setFiltersState([]);
    publishEvent('filter:cleared-all', { timestamp: new Date() });
    publishEvent('search:cleared', { timestamp: new Date() });
  }, []);

  // Navigation methods
  const setPath = useCallback((path: Breadcrumb[]) => {
    setCurrentPath(path);
  }, []);

  const navigateTo = useCallback((breadcrumb: Breadcrumb) => {
    if (breadcrumb.onClick) {
      breadcrumb.onClick();
    }
    publishEvent('navigation:breadcrumb-clicked', {
      itemId: breadcrumb.id,
      path: breadcrumb.path || '',
      timestamp: new Date(),
    });
  }, []);

  // Selection methods
  const setSelection = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    publishEvent('selection:changed', { selectedIds: ids, timestamp: new Date() });
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id];
      publishEvent('selection:changed', {
        selectedIds: newSelection,
        timestamp: new Date(),
      });
      return newSelection;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    publishEvent('selection:cleared', { timestamp: new Date() });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    publishEvent('selection:changed', { selectedIds: ids, timestamp: new Date() });
  }, []);

  // Construct context value
  const value: PlatformContextValue = {
    search: {
      query: searchQuery,
      setQuery,
      filters,
      setFilters,
      addFilter,
      removeFilter,
      clearAll: clearAllFilters,
    },
    navigation: {
      currentPath,
      setPath,
      navigateTo,
    },
    selection: {
      selectedIds,
      setSelection,
      toggleSelection,
      clearSelection,
      selectAll,
    },
    user,
  };

  return (
    <PlatformContext.Provider value={value}>
      {children}
    </PlatformContext.Provider>
  );
};

/**
 * Convenience hooks for specific context slices
 */

export const useSearch = () => {
  const { search } = usePlatform();
  return search;
};

export const useNavigation = () => {
  const { navigation } = usePlatform();
  return navigation;
};

export const useSelection = () => {
  const { selection } = usePlatform();
  return selection;
};

export const useUser = () => {
  const { user } = usePlatform();
  return user;
};
