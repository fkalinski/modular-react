import React from 'react';
import type { TabModuleV2, TabInstance } from '@content-platform/tab-contract';
import type { PlatformContextValue } from '@platform/context';
import { FormsTab } from './FormsTab';

/**
 * Forms Tab Plugin
 *
 * Implements Tab Contract v2 with Level 3 integration (SDUI):
 * - UI configuration fetched from GraphQL server
 * - Column definitions served by backend
 * - Actions defined by server
 * - Only action implementations in frontend code
 * - Master-detail view (Forms -> Form Submissions)
 */
const FormsTabPlugin: TabModuleV2 = {
  id: 'forms',
  title: 'Forms',
  version: '1.0.0',

  /**
   * Mount the tab with Platform Context
   */
  mount(context: PlatformContextValue): TabInstance {
    const component: React.ComponentType<any> = () => {
      const { search } = context;

      return (
        <FormsTab
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
        console.log('[Forms Tab] Activated');
      },

      /**
       * Lifecycle: Called when tab becomes inactive
       */
      onDeactivate: () => {
        console.log('[Forms Tab] Deactivated');
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
        console.log('[Forms Tab] Restoring state:', state);
      },

      /**
       * Cleanup when tab is unmounted
       */
      cleanup: () => {
        console.log('[Forms Tab] Cleanup');
      },
    };
  },

  /**
   * Contribute filters to the platform
   */
  contributesFilters: [
    {
      id: 'forms-status',
      field: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'draft', label: 'Draft' },
        { value: 'archived', label: 'Archived' },
      ],
      defaultValue: undefined,
      isVisibleForTab: (tabId) => tabId === 'forms',
    },
    {
      id: 'forms-category',
      field: 'category',
      label: 'Category',
      type: 'select',
      options: [
        { value: 'HR', label: 'HR' },
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Product', label: 'Product' },
        { value: 'Customer Success', label: 'Customer Success' },
        { value: 'IT', label: 'IT' },
      ],
      defaultValue: undefined,
      isVisibleForTab: (tabId) => tabId === 'forms',
    },
  ],

  /**
   * Contribute actions to the platform
   */
  contributesActions: [
    {
      id: 'forms-new',
      label: 'New Form',
      icon: '➕',
      onClick: (context) => {
        console.log('Create new form');
        alert('Opening new form builder...');
      },
      isVisible: (context) => {
        return context.navigation.currentTab === 'forms';
      },
    },
    {
      id: 'forms-templates',
      label: 'Templates',
      icon: '📋',
      onClick: (context) => {
        console.log('Browse form templates');
        alert('Opening form templates...');
      },
      isVisible: (context) => {
        return context.navigation.currentTab === 'forms';
      },
    },
  ],

  /**
   * Handle search queries
   * Returns the number of results found
   */
  onSearch: async (query: string, filters: any[]) => {
    console.log('[Forms Tab] Search:', query, filters);
    return 0;
  },
};

export default FormsTabPlugin;
