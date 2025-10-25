import React from 'react';
import type { TabModuleV2, TabInstance } from '@content-platform/tab-contract';
import type { PlatformContextValue } from '@platform/context';
import { FileRequestsTab } from './FileRequestsTab';

/**
 * File Requests Tab Plugin
 *
 * Implements Tab Contract v2 with Level 2 integration (custom extensions):
 * - Uses DataTable as base component
 * - Extends with custom cell renderers
 * - Mixes built-in formatters with custom React components
 * - Custom action handlers with complex logic
 */
const FileRequestsTabPlugin: TabModuleV2 = {
  id: 'file-requests',
  title: 'File Requests',
  version: '1.0.0',

  /**
   * Mount the tab with Platform Context
   */
  mount(context: PlatformContextValue): TabInstance {
    const component: React.ComponentType<any> = () => {
      const { search } = context;

      return (
        <FileRequestsTab
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
        console.log('[File Requests Tab] Activated');
      },

      /**
       * Lifecycle: Called when tab becomes inactive
       */
      onDeactivate: () => {
        console.log('[File Requests Tab] Deactivated');
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
        console.log('[File Requests Tab] Restoring state:', state);
      },

      /**
       * Cleanup when tab is unmounted
       */
      cleanup: () => {
        console.log('[File Requests Tab] Cleanup');
      },
    };
  },

  /**
   * Contribute filters to the platform
   */
  contributesFilters: [
    {
      id: 'file-requests-status',
      field: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'overdue', label: 'Overdue' },
      ],
      defaultValue: undefined,
      isVisibleForTab: (tabId) => tabId === 'file-requests',
    },
    {
      id: 'file-requests-priority',
      field: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
      defaultValue: undefined,
      isVisibleForTab: (tabId) => tabId === 'file-requests',
    },
  ],

  /**
   * Contribute actions to the platform
   */
  contributesActions: [
    {
      id: 'file-requests-new',
      label: 'New Request',
      icon: '➕',
      onClick: (context) => {
        console.log('Create new file request');
        alert('Opening new file request form...');
      },
      isVisible: (context) => {
        return context.navigation.currentTab === 'file-requests';
      },
    },
    {
      id: 'file-requests-refresh',
      label: 'Refresh',
      icon: '🔄',
      onClick: (context) => {
        console.log('Refresh file requests');
        // Trigger refetch
        window.location.reload();
      },
      isVisible: (context) => {
        return context.navigation.currentTab === 'file-requests';
      },
    },
  ],

  /**
   * Handle search queries
   * Returns the number of results found
   */
  onSearch: async (query: string, filters: any[]) => {
    console.log('[File Requests Tab] Search:', query, filters);
    return 0;
  },
};

export default FileRequestsTabPlugin;
