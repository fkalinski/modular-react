// In a real scenario, this would be: import { TabPlugin } from '@content-platform/tab-contract'
// For this PoC, we copy the types to simulate an external team consuming the contract

import { ComponentType } from 'react';

export interface TabConfig {
  id: string;
  name: string;
  icon?: string;
  version: string;
  componentVersion: string;
  description?: string;
}

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

export interface TabProps {
  context: ContentContext;
  onNavigate: (path: string) => void;
  onSelect: (ids: string[]) => void;
}

export interface ActionDefinition {
  id: string;
  label: string;
  icon?: string;
  handler: (context: ContentContext) => void | Promise<void>;
  disabled?: (context: ContentContext) => boolean;
}

export interface TabPlugin {
  config: TabConfig;
  component: ComponentType<TabProps>;
  dataSource?: any;
  reducerKey?: string;
  reducer?: any;
  actions?: ActionDefinition[];
  onActivate?: () => void | Promise<void>;
  onDeactivate?: () => void | Promise<void>;
  contextRequirements?: Array<keyof ContentContext>;
}
