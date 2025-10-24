/**
 * Tab Contract v2.0
 *
 * Enhanced tab contract that works with Platform Context and Event Bus.
 * This provides a richer integration model while maintaining backwards compatibility.
 *
 * Migration from v1:
 * - Old TabPlugin still works
 * - New TabModuleV2 provides enhanced capabilities
 * - Tabs can migrate incrementally
 */

import { ComponentType } from 'react';
import type { PlatformContextValue, Filter } from '@modular-platform/platform-context';

/**
 * Filter contribution from a tab
 * Allows tabs to contribute filters to the platform's filter UI
 */
export interface FilterContribution {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date-range' | 'multi-select' | 'number-range';
  options?: Array<{ value: string; label: string }>;
  defaultValue?: unknown;
  placeholder?: string;
  /**
   * Optional validation function
   * Returns error message if invalid, undefined if valid
   */
  validate?: (value: unknown) => string | undefined;
}

/**
 * Action contribution from a tab
 * Allows tabs to contribute bulk actions or toolbar actions
 */
export interface ActionContribution {
  id: string;
  label: string;
  icon?: string;
  /**
   * Handler for the action
   * Receives the platform context for access to selection, etc.
   */
  handler: (context: PlatformContextValue) => void | Promise<void>;
  /**
   * Whether this action requires items to be selected
   */
  requiresSelection?: boolean;
  /**
   * Whether this action works on bulk selections
   */
  bulk?: boolean;
  /**
   * Optional function to determine if action is disabled
   */
  disabled?: (context: PlatformContextValue) => boolean;
  /**
   * Optional keyboard shortcut (e.g., "Ctrl+D" or "Delete")
   */
  shortcut?: string;
}

/**
 * Tab instance returned from mount()
 * Represents a mounted tab with its component and optional lifecycle hooks
 */
export interface TabInstance {
  /**
   * The React component to render for this tab
   */
  component: ComponentType<any>;

  /**
   * Called when tab becomes active
   */
  onActivate?: () => void;

  /**
   * Called when tab becomes inactive (user switches to another tab)
   */
  onDeactivate?: () => void;

  /**
   * Get the tab's current state for persistence
   * Useful for maintaining state across tab switches
   */
  getState?: () => unknown;

  /**
   * Restore previously saved state
   */
  setState?: (state: unknown) => void;

  /**
   * Cleanup function called when tab is unmounted
   */
  cleanup?: () => void;
}

/**
 * Tab Module v2
 *
 * This is the main interface that tabs should implement.
 * It provides a richer integration with the platform compared to v1.
 */
export interface TabModuleV2 {
  // ===== Identity =====

  /**
   * Unique identifier for the tab
   */
  id: string;

  /**
   * Display title for the tab
   */
  title: string;

  /**
   * Optional icon identifier or React component
   */
  icon?: string | ComponentType;

  /**
   * Version of the tab module (semver)
   */
  version: string;

  /**
   * Optional description
   */
  description?: string;

  // ===== Lifecycle =====

  /**
   * Mount the tab and return an instance
   * This is called once when the tab is first loaded
   *
   * @param context - Platform context providing shared state and services
   * @returns TabInstance with component and optional lifecycle hooks
   */
  mount(context: PlatformContextValue): TabInstance;

  /**
   * Optional unmount handler
   * Called when the tab is being removed from the platform
   */
  unmount?(): void;

  // ===== Contributions =====

  /**
   * Optional filter contributions
   * Allows the tab to contribute filters to the platform's filter UI
   */
  contributesFilters?: FilterContribution[];

  /**
   * Optional action contributions
   * Allows the tab to contribute bulk actions or toolbar actions
   */
  contributesActions?: ActionContribution[];

  // ===== Routing (optional) =====

  /**
   * Optional routes for deep linking within the tab
   */
  routes?: TabRoute[];

  // ===== Requirements =====

  /**
   * Required platform version (semver range)
   * e.g., "^1.0.0"
   */
  requiredPlatformVersion?: string;

  /**
   * Required versions of shared dependencies
   * e.g., { "shared_components": "^2.0.0" }
   */
  requiredDependencies?: Record<string, string>;

  // ===== Search Support =====

  /**
   * Optional search handler
   * Returns number of items matching the search query
   * Used to update search result counts in the UI
   */
  onSearch?: (query: string, filters: Filter[]) => Promise<number> | number;
}

/**
 * Route definition for tab-specific routing
 */
export interface TabRoute {
  path: string;
  component: ComponentType<any>;
  /**
   * Optional label for navigation
   */
  label?: string;
}

/**
 * Helper to create a tab module with type safety
 *
 * @example
 * export default defineTabModule({
 *   id: 'files-folders',
 *   title: 'Files & Folders',
 *   version: '2.0.0',
 *   mount(context) {
 *     return {
 *       component: FilesTab,
 *       onActivate: () => console.log('Files tab activated'),
 *     };
 *   },
 *   contributesFilters: [
 *     {
 *       id: 'file-type',
 *       label: 'File Type',
 *       type: 'select',
 *       options: [
 *         { value: 'pdf', label: 'PDF' },
 *         { value: 'doc', label: 'Document' },
 *       ],
 *     },
 *   ],
 * });
 */
export function defineTabModule(module: TabModuleV2): TabModuleV2 {
  return module;
}

/**
 * Type guard to check if a module is v2
 */
export function isTabModuleV2(module: any): module is TabModuleV2 {
  return (
    typeof module === 'object' &&
    module !== null &&
    typeof module.id === 'string' &&
    typeof module.title === 'string' &&
    typeof module.mount === 'function'
  );
}

/**
 * Backwards compatibility adapter
 * Converts v1 TabPlugin to v2 TabModuleV2
 */
export function adaptV1ToV2(v1Plugin: any): TabModuleV2 {
  return {
    id: v1Plugin.config.id,
    title: v1Plugin.config.name,
    version: v1Plugin.config.version,
    description: v1Plugin.config.description,
    icon: v1Plugin.config.icon,

    mount(context: PlatformContextValue): TabInstance {
      // Convert platform context to v1 content context
      const contentContext = {
        filters: {
          searchText: context.search.query,
          active: context.search.filters,
        },
        selection: {
          selectedIds: context.selection.selectedIds,
        },
        navigation: {
          currentPath: context.navigation.currentPath.map(b => b.path || '').join('/'),
          breadcrumbs: context.navigation.currentPath.map(b => ({
            label: b.label,
            path: b.path || '',
          })),
        },
      };

      // Create v1-style props
      const props = {
        context: contentContext,
        onNavigate: (path: string) => {
          console.log('Navigate to:', path);
        },
        onSelect: (ids: string[]) => {
          context.selection.setSelection(ids);
        },
      };

      return {
        component: () => {
          const Component = v1Plugin.component;
          return <Component {...props} />;
        },
        onActivate: v1Plugin.onActivate,
        onDeactivate: v1Plugin.onDeactivate,
      };
    },

    contributesActions: v1Plugin.actions?.map((action: any) => ({
      id: action.id,
      label: action.label,
      icon: action.icon,
      handler: (context: PlatformContextValue) => {
        const contentContext = {
          filters: {
            searchText: context.search.query,
            active: context.search.filters,
          },
          selection: {
            selectedIds: context.selection.selectedIds,
          },
          navigation: {
            currentPath: '',
            breadcrumbs: [],
          },
        };
        return action.handler(contentContext);
      },
      disabled: action.disabled ? (context: PlatformContextValue) => {
        const contentContext = {
          filters: {
            searchText: context.search.query,
            active: context.search.filters,
          },
          selection: {
            selectedIds: context.selection.selectedIds,
          },
          navigation: {
            currentPath: '',
            breadcrumbs: [],
          },
        };
        return action.disabled(contentContext);
      } : undefined,
    })),

    onSearch: v1Plugin.getSearchHitCount,
  };
}
