/**
 * Server-Driven UI Utilities
 *
 * Converts server UI configuration to DataTable component props.
 * This is the bridge between server metadata and client components.
 */

import type {
  ColumnDefinition,
  RowAction,
  BulkAction,
  FormatterType,
} from '@modular-platform/shared-components';
import { executeAction } from './actions';

/**
 * Server column configuration (from GraphQL)
 */
export interface ServerColumnConfig {
  field: string;
  label: string;
  sortable?: boolean | null;
  formatter?: string | null;
  width?: number | null;
  align?: string | null;
}

/**
 * Server action configuration (from GraphQL)
 */
export interface ServerActionConfig {
  id: string;
  label: string;
  icon?: string | null;
  variant?: string | null;
}

/**
 * Server table UI configuration (from GraphQL)
 */
export interface ServerTableUIConfig {
  columns: ServerColumnConfig[];
  actions?: ServerActionConfig[] | null;
  bulkActions?: ServerActionConfig[] | null;
  defaultSort?: string | null;
  defaultSortDirection?: string | null;
}

/**
 * Convert server column config to DataTable ColumnDefinition
 */
export function convertServerColumn(serverColumn: ServerColumnConfig): ColumnDefinition {
  return {
    field: serverColumn.field,
    label: serverColumn.label,
    sortable: serverColumn.sortable ?? false,
    formatter: (serverColumn.formatter as FormatterType) || undefined,
    width: serverColumn.width || undefined,
    align: (serverColumn.align as 'left' | 'center' | 'right') || undefined,
  };
}

/**
 * Convert server action config to DataTable RowAction
 */
export function convertServerAction(
  serverAction: ServerActionConfig,
  refetch?: () => void
): RowAction {
  return {
    id: serverAction.id,
    label: serverAction.label,
    icon: serverAction.icon || undefined,
    variant: (serverAction.variant as 'primary' | 'secondary' | 'danger') || undefined,
    onClick: async (item: any) => {
      await executeAction(serverAction.id, { item, refetch });
    },
  };
}

/**
 * Convert server bulk action config to DataTable BulkAction
 */
export function convertServerBulkAction(
  serverAction: ServerActionConfig,
  refetch?: () => void
): BulkAction {
  return {
    id: serverAction.id,
    label: serverAction.label,
    icon: serverAction.icon || undefined,
    variant: (serverAction.variant as 'primary' | 'secondary' | 'danger') || undefined,
    onClick: async (items: any[]) => {
      await executeAction(serverAction.id, { items, refetch });
    },
  };
}

/**
 * Convert server table UI config to DataTable props
 *
 * This is the core of SDUI - transforming server configuration
 * into client component props.
 */
export function convertServerTableConfig(
  serverConfig: ServerTableUIConfig,
  refetch?: () => void
) {
  return {
    columns: serverConfig.columns.map(convertServerColumn),
    actions: serverConfig.actions?.map((action) => convertServerAction(action, refetch)) || [],
    bulkActions:
      serverConfig.bulkActions?.map((action) => convertServerBulkAction(action, refetch)) || [],
    defaultSort: serverConfig.defaultSort || undefined,
    defaultSortDirection:
      (serverConfig.defaultSortDirection as 'asc' | 'desc') || undefined,
  };
}
