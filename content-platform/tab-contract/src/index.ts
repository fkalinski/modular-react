import { ComponentType, ReactNode } from 'react';
import { Reducer } from '@reduxjs/toolkit';

/**
 * Tab configuration metadata
 */
export interface TabConfig {
  id: string;
  name: string;
  icon?: string;
  version: string;
  componentVersion: string; // Required shared-components version (e.g., "^1.0.0")
  description?: string;
}

/**
 * Context provided by the content shell to tabs
 */
export interface ContentContext {
  filters: {
    searchText: string;
    active: Array<{ field: string; operator: string; value: any }>;
    dateRange?: { start: string; end: string };
    contentType?: string;
  };
  selection: {
    selectedIds: string[];
    lastSelectedId?: string;
  };
  navigation: {
    currentPath: string;
    breadcrumbs: Array<{ label: string; path: string }>;
  };
}

/**
 * Props passed to tab components
 */
export interface TabProps {
  context: ContentContext;
  onNavigate: (path: string) => void;
  onSelect: (ids: string[]) => void;
}

/**
 * Action definition that tabs can provide
 */
export interface ActionDefinition {
  id: string;
  label: string;
  icon?: string;
  handler: (context: ContentContext) => void | Promise<void>;
  disabled?: (context: ContentContext) => boolean;
}

/**
 * Data source interface for content items
 */
export interface DataSource {
  fetch(filters: any): Promise<ContentItem[]>;
  fetchById(id: string): Promise<ContentItem | null>;
}

/**
 * Base content item interface
 */
export interface ContentItem {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Allow extensions
}

/**
 * Complete tab plugin interface
 * This is what each tab must export
 */
export interface TabPlugin {
  // Metadata
  config: TabConfig;

  // Component
  component: ComponentType<TabProps>;

  // Optional data integration
  dataSource?: DataSource;

  // Optional Redux state
  reducerKey?: string;
  reducer?: Reducer;

  // Optional actions
  actions?: ActionDefinition[];

  // Lifecycle hooks
  onActivate?: () => void | Promise<void>;
  onDeactivate?: () => void | Promise<void>;

  // Search support - returns number of items matching search
  getSearchHitCount?: (searchText: string) => number | Promise<number>;

  // Context requirements (for validation)
  contextRequirements?: Array<keyof ContentContext>;
}

/**
 * Tab registry interface
 */
export interface TabRegistry {
  register(plugin: TabPlugin): void;
  unregister(id: string): void;
  get(id: string): TabPlugin | undefined;
  getAll(): TabPlugin[];
}

/**
 * Tab manifest for runtime loading
 */
export interface TabManifest {
  id: string;
  remoteEntry: string;
  module: string;
  enabled: boolean;
  order: number;
  config?: Record<string, any>;
}
