import React from 'react';
import type { TabModuleV2, TabInstance } from '@content-platform/tab-contract';
import type { PlatformContextValue } from '@platform/context';
import { ArchivesTab } from './ArchivesTab';

/**
 * Archives Tab Plugin
 *
 * Implements Tab Contract v2 with data-driven approach (Level 2 integration):
 * - Provides GraphQL fragments, enrichers, and column definitions
 * - Does not provide custom UI, relies on platform's DataTable
 * - Integrates with Platform Context for search and filters
 * - Contributes filters for compression type and date range
 */
const ArchivesTabPlugin: TabModuleV2 = {
  id: 'archives',
  title: 'Archives',
  version: '1.0.0',

  /**
   * Mount the tab with Platform Context
   */
  mount(context: PlatformContextValue): TabInstance {
    const component: React.ComponentType<any> = () => {
      const { search } = context;

      return (
        <ArchivesTab
          searchQuery={search.query}
          filters={search.filters}
        />
      );
    };

    return {
      component,

      /**
       * Lifecycle: Called when tab becomes active
       */
      onActivate: () => {
        console.log('[Archives Tab] Activated');
      },

      /**
       * Lifecycle: Called when tab becomes inactive
       */
      onDeactivate: () => {
        console.log('[Archives Tab] Deactivated');
      },

      /**
       * Get current tab state (for persistence)
       */
      getState: () => {
        return {
          timestamp: Date.now(),
        };
      },

      /**
       * Restore tab state
       */
      setState: (state: unknown) => {
        console.log('[Archives Tab] Restoring state:', state);
      },

      /**
       * Cleanup when tab is unmounted
       */
      cleanup: () => {
        console.log('[Archives Tab] Cleanup');
      },
    };
  },

  /**
   * Contribute filters to the platform
   */
  contributesFilters: [
    {
      id: 'archives-compression-type',
      field: 'compressionType',
      label: 'Compression Type',
      type: 'select',
      options: [
        { value: 'ZIP', label: 'ZIP' },
        { value: 'GZIP', label: 'GZIP' },
        { value: 'TAR', label: 'TAR' },
        { value: 'NONE', label: 'Uncompressed' },
      ],
      defaultValue: undefined,
      isVisibleForTab: (tabId) => tabId === 'archives',
    },
    {
      id: 'archives-date-from',
      field: 'fromDate',
      label: 'Archived From',
      type: 'date',
      defaultValue: undefined,
      isVisibleForTab: (tabId) => tabId === 'archives',
    },
    {
      id: 'archives-date-to',
      field: 'toDate',
      label: 'Archived To',
      type: 'date',
      defaultValue: undefined,
      isVisibleForTab: (tabId) => tabId === 'archives',
    },
  ],

  /**
   * Contribute actions to the platform
   */
  contributesActions: [
    {
      id: 'archives-restore-selected',
      label: 'Restore Selected',
      icon: '↩️',
      onClick: (context) => {
        const selectedIds = context.selection.selectedIds;
        console.log('Restore archives:', selectedIds);
        alert(`Restoring ${selectedIds.length} archives`);
      },
      isVisible: (context) => {
        return (
          context.navigation.currentTab === 'archives' &&
          context.selection.selectedIds.length > 0
        );
      },
      isDisabled: (context) => {
        return context.selection.selectedIds.length === 0;
      },
    },
    {
      id: 'archives-export-list',
      label: 'Export Archive List',
      icon: '📋',
      onClick: (context) => {
        console.log('Export archive list');
        alert('Exporting archive list to CSV...');
      },
      isVisible: (context) => {
        return context.navigation.currentTab === 'archives';
      },
    },
  ],

  /**
   * Handle search queries
   * Returns the number of results found
   */
  onSearch: async (query: string, filters: any[]) => {
    console.log('[Archives Tab] Search:', query, filters);
    // In a real implementation, this would trigger a GraphQL query
    // and return the result count
    return 0;
  },
};

export default ArchivesTabPlugin;
