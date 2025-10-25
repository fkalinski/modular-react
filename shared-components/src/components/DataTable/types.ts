import { ReactNode } from 'react';
import type { FormatterType as FormatterTypeImport, FormatterOptions as FormatterOptionsImport } from './formatters';

// Re-export formatter types
export type FormatterType = FormatterTypeImport;
export type FormatterOptions = FormatterOptionsImport;

/**
 * Cell renderer function
 * Receives the cell value and the entire row data
 */
export type CellRenderer<T = any> = (value: any, row: T, index: number) => ReactNode;

/**
 * Column definition for DataTable
 */
export interface ColumnDefinition<T = any> {
  /** Unique field identifier - supports nested paths like "owner.name" */
  field: string;

  /** Display label for column header */
  label: string;

  /** Enable sorting on this column */
  sortable?: boolean;

  /** Enable filtering on this column */
  filterable?: boolean;

  /** Built-in formatter to apply to cell values */
  formatter?: FormatterType;

  /** Formatter options */
  formatterOptions?: FormatterOptions;

  /** Custom cell renderer - overrides formatter */
  render?: CellRenderer<T>;

  /** Column width (CSS value) */
  width?: number | string;

  /** Minimum column width */
  minWidth?: number | string;

  /** Maximum column width */
  maxWidth?: number | string;

  /** Text alignment */
  align?: 'left' | 'center' | 'right';

  /** Column is hidden */
  hidden?: boolean;

  /** Column cannot be hidden by user */
  permanent?: boolean;

  /** Tooltip for column header */
  tooltip?: string;

  /** Custom CSS class for column cells */
  className?: string;

  /** Custom CSS class for column header */
  headerClassName?: string;
}

/**
 * Row action definition
 */
export interface RowAction<T = any> {
  /** Unique action identifier */
  id: string;

  /** Display label */
  label: string;

  /** Icon (emoji or icon component) */
  icon?: ReactNode;

  /** Action handler */
  onClick: (row: T, rows: T[]) => void | Promise<void>;

  /** Determine if action is visible for this row */
  isVisible?: (row: T) => boolean;

  /** Determine if action is disabled for this row */
  isDisabled?: (row: T) => boolean;

  /** Confirm before executing */
  confirm?: boolean | ((row: T) => string);

  /** Action variant for styling */
  variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * Bulk action definition (applies to selected rows)
 */
export interface BulkAction<T = any> {
  /** Unique action identifier */
  id: string;

  /** Display label */
  label: string;

  /** Icon */
  icon?: ReactNode;

  /** Action handler receives all selected rows */
  onClick: (rows: T[]) => void | Promise<void>;

  /** Determine if bulk action is available */
  isVisible?: (rows: T[]) => boolean;

  /** Determine if bulk action is disabled */
  isDisabled?: (rows: T[]) => boolean;

  /** Confirm before executing */
  confirm?: boolean | ((rows: T[]) => string);

  /** Action variant */
  variant?: 'primary' | 'secondary' | 'danger';
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: SortDirection;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  field: string;
  value: any;
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
}

/**
 * DataTable props
 */
export interface DataTableProps<T = any> {
  /** Data rows */
  data: T[];

  /** Column definitions */
  columns: ColumnDefinition<T>[];

  /** Loading state */
  loading?: boolean;

  /** Error state */
  error?: Error | string;

  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;

  /** Row double-click handler */
  onRowDoubleClick?: (row: T, index: number) => void;

  /** Sort change handler */
  onSort?: (field: string, direction: SortDirection) => void;

  /** Current sort configuration */
  sortConfig?: SortConfig;

  /** Filter change handler */
  onFilter?: (filters: FilterConfig[]) => void;

  /** Current filter configuration */
  filterConfig?: FilterConfig[];

  /** Selection */
  selectedRows?: string[];

  /** Selection change handler */
  onSelectionChange?: (ids: string[]) => void;

  /** Row ID field (default: 'id') */
  rowId?: string;

  /** Row actions */
  actions?: RowAction<T>[];

  /** Bulk actions (for selected rows) */
  bulkActions?: BulkAction<T>[];

  /** Enable row selection */
  selectable?: boolean;

  /** Enable multi-select */
  multiSelect?: boolean;

  /** Empty state message */
  emptyMessage?: string;

  /** Empty state component */
  emptyComponent?: ReactNode;

  /** Row class name function */
  rowClassName?: (row: T, index: number) => string;

  /** Table density */
  density?: 'compact' | 'normal' | 'comfortable';

  /** Table height (for virtual scrolling) */
  height?: number | string;

  /** Enable virtual scrolling */
  virtual?: boolean;

  /** Show column borders */
  bordered?: boolean;

  /** Striped rows */
  striped?: boolean;

  /** Hover highlight */
  hoverable?: boolean;

  /** Sticky header */
  stickyHeader?: boolean;

  /** Custom table class name */
  className?: string;

  /** Pagination config */
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
}

/**
 * DataTable state
 */
export interface DataTableState {
  sortField: string | null;
  sortDirection: SortDirection;
  filters: FilterConfig[];
  selectedIds: Set<string>;
  hoveredRow: number | null;
}
