import React from 'react';
import type { TabModuleV2, TabInstance, FilterContribution, ActionContribution } from '@tab-contract/v2';
import { PlatformContextValue, publishEvent } from '@platform/context';
import SearchResultsTab from './SearchResultsTab';

/**
 * Example Tab Plugin using Tab Contract v2
 *
 * This demonstrates:
 * - Enhanced mount() method receiving Platform Context
 * - Filter contributions to extend platform UI
 * - Action contributions for toolbar buttons
 * - Lifecycle hooks (onActivate, onDeactivate)
 * - State management (getState, setState)
 * - Search integration with hit count
 */

let tabState = {
  lastQuery: '',
  scrollPosition: 0,
  selectedIds: [] as string[],
};

const SearchResultsPlugin: TabModuleV2 = {
  id: 'search-results',
  title: 'Search Results',
  version: '2.0.0',

  /**
   * Mount function receives Platform Context
   * Returns tab instance with component and lifecycle hooks
   */
  mount(context: PlatformContextValue): TabInstance {
    console.log('[SearchResultsPlugin] Mounting with context:', {
      searchQuery: context.search.query,
      filters: context.search.filters,
      user: context.user.email,
    });

    // Publish tab activation event
    publishEvent('tab:activated', {
      tabId: 'search-results',
      timestamp: new Date(),
    });

    return {
      component: SearchResultsTab,

      /**
       * Called when tab becomes active
       */
      onActivate: () => {
        console.log('[SearchResultsPlugin] Tab activated');
        publishEvent('tab:activated', {
          tabId: 'search-results',
          timestamp: new Date(),
        });

        // Restore scroll position
        setTimeout(() => {
          if (tabState.scrollPosition > 0) {
            window.scrollTo(0, tabState.scrollPosition);
          }
        }, 100);
      },

      /**
       * Called when tab becomes inactive
       */
      onDeactivate: () => {
        console.log('[SearchResultsPlugin] Tab deactivated');
        publishEvent('tab:deactivated', {
          tabId: 'search-results',
          timestamp: new Date(),
        });

        // Save scroll position
        tabState.scrollPosition = window.scrollY;
      },

      /**
       * Get current tab state (for persistence/navigation)
       */
      getState: () => {
        return {
          ...tabState,
          timestamp: new Date().toISOString(),
        };
      },

      /**
       * Restore tab state (from persistence/navigation)
       */
      setState: (state: unknown) => {
        if (state && typeof state === 'object') {
          tabState = { ...tabState, ...(state as any) };
          console.log('[SearchResultsPlugin] State restored:', tabState);
        }
      },

      /**
       * Cleanup when tab is unmounted
       */
      cleanup: () => {
        console.log('[SearchResultsPlugin] Cleaning up');
        // Clear any subscriptions, timers, etc.
      },
    };
  },

  /**
   * Filter contributions - adds filters to platform UI
   * These filters are automatically available in Platform Context
   */
  contributesFilters: [
    {
      id: 'search-type-filter',
      label: 'Result Type',
      type: 'select',
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'document', label: 'Documents' },
        { value: 'folder', label: 'Folders' },
        { value: 'image', label: 'Images' },
        { value: 'video', label: 'Videos' },
      ],
      defaultValue: 'all',
      apply: (value, context) => {
        console.log('[SearchResultsPlugin] Applying type filter:', value);
        if (value !== 'all') {
          context.search.addFilter({
            id: 'type',
            key: 'type',
            value: value,
            label: 'Type',
          });
        }
      },
    },
    {
      id: 'search-relevance-filter',
      label: 'Min Relevance',
      type: 'select',
      options: [
        { value: '0', label: 'Any' },
        { value: '50', label: '50%+' },
        { value: '75', label: '75%+' },
        { value: '90', label: '90%+' },
      ],
      defaultValue: '0',
      apply: (value, context) => {
        console.log('[SearchResultsPlugin] Applying relevance filter:', value);
        if (value !== '0') {
          context.search.addFilter({
            id: 'minRelevance',
            key: 'minRelevance',
            value: value,
            label: 'Min Relevance',
          });
        }
      },
    },
  ],

  /**
   * Action contributions - adds buttons to platform toolbar
   */
  contributesActions: [
    {
      id: 'export-results',
      label: 'Export Results',
      icon: '📥',
      onClick: (context) => {
        console.log('[SearchResultsPlugin] Export results clicked');
        const results = {
          query: context.search.query,
          filters: context.search.filters,
          selectedIds: context.selection.selectedIds,
          timestamp: new Date().toISOString(),
        };

        // Publish export event
        publishEvent('search:exported', {
          query: context.search.query,
          count: context.selection.selectedIds.length,
          timestamp: new Date(),
        });

        alert(`Exporting ${context.selection.selectedIds.length} selected results`);
        console.log('Export data:', results);
      },
      isVisible: (context) => {
        // Only show when there are selected items
        return context.selection.selectedIds.length > 0;
      },
    },
    {
      id: 'refine-search',
      label: 'Refine Search',
      icon: '🔍',
      onClick: (context) => {
        console.log('[SearchResultsPlugin] Refine search clicked');
        // Open advanced search UI
        publishEvent('search:refine-requested', {
          query: context.search.query,
          timestamp: new Date(),
        });
        alert('Advanced search UI would open here');
      },
      isVisible: () => true, // Always visible
    },
  ],

  /**
   * Search integration - returns hit count for this tab
   * Called when search query changes
   */
  onSearch: (query: string, filters: any[]) => {
    console.log('[SearchResultsPlugin] Search requested:', query, filters);

    // Simulate search and return hit count
    if (!query) return 0;

    // Mock calculation based on query length
    const baseCount = Math.floor(Math.random() * 20) + 5;
    const filterMultiplier = filters.length > 0 ? 0.6 : 1;

    return Math.floor(baseCount * filterMultiplier);
  },
};

export default SearchResultsPlugin;
