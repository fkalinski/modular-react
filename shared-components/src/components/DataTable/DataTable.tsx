import React, { useState, useMemo, useCallback, CSSProperties } from 'react';
import type { DataTableProps, SortDirection, FilterConfig } from './types';
import { format } from './formatters';
import { getNestedValue, sortByField, filterData, getRowId, getColumnWidth } from './utils';

/**
 * Generic DataTable Component
 *
 * Renders tabular data from column definitions with built-in features:
 * - Sorting
 * - Filtering
 * - Selection
 * - Row actions
 * - Built-in formatters
 * - Custom cell renderers
 */
export function DataTable<T = any>(props: DataTableProps<T>): JSX.Element {
  const {
    data,
    columns,
    loading = false,
    error,
    onRowClick,
    onRowDoubleClick,
    onSort,
    sortConfig,
    onFilter,
    filterConfig,
    selectedRows = [],
    onSelectionChange,
    rowId = 'id',
    actions = [],
    bulkActions = [],
    selectable = false,
    multiSelect = true,
    emptyMessage = 'No data available',
    emptyComponent,
    rowClassName,
    density = 'normal',
    bordered = true,
    striped = true,
    hoverable = true,
    stickyHeader = true,
    className = '',
  } = props;

  // Local state for client-side sorting/filtering
  const [localSort, setLocalSort] = useState<{ field: string; direction: SortDirection } | null>(null);
  const [localFilters, setLocalFilters] = useState<FilterConfig[]>([]);

  const currentSort = sortConfig || localSort;
  const currentFilters = filterConfig || localFilters;

  // Process data: filter → sort
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply filters
    if (currentFilters.length > 0) {
      result = filterData(result, currentFilters);
    }

    // Apply sort
    if (currentSort) {
      result = sortByField(result, currentSort.field, currentSort.direction);
    }

    return result;
  }, [data, currentSort, currentFilters]);

  // Handle sort
  const handleSort = useCallback((field: string) => {
    const newDirection: SortDirection =
      currentSort?.field === field && currentSort?.direction === 'asc' ? 'desc' : 'asc';

    if (onSort) {
      onSort(field, newDirection);
    } else {
      setLocalSort({ field, direction: newDirection });
    }
  }, [currentSort, onSort]);

  // Handle selection
  const handleSelectRow = useCallback((id: string) => {
    if (!onSelectionChange) return;

    if (multiSelect) {
      const newSelection = selectedRows.includes(id)
        ? selectedRows.filter(rowId => rowId !== id)
        : [...selectedRows, id];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange([id]);
    }
  }, [selectedRows, multiSelect, onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;

    if (selectedRows.length === processedData.length) {
      onSelectionChange([]);
    } else {
      const allIds = processedData.map((row, index) => getRowId(row, index, rowId));
      onSelectionChange(allIds);
    }
  }, [processedData, selectedRows, onSelectionChange, rowId]);

  // Visible columns
  const visibleColumns = columns.filter(col => !col.hidden);

  // Styles
  const densityPadding: Record<string, string> = {
    compact: '4px 8px',
    normal: '8px 12px',
    comfortable: '12px 16px',
  };

  const tableStyles: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '13px',
  };

  const theadStyles: CSSProperties = {
    backgroundColor: '#f7f7f8',
    borderBottom: '2px solid #e2e2e2',
    ...(stickyHeader && { position: 'sticky', top: 0, zIndex: 10 }),
  };

  const thStyles: CSSProperties = {
    padding: densityPadding[density],
    textAlign: 'left',
    fontWeight: 600,
    color: '#222222',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const tdStyles: CSSProperties = {
    padding: densityPadding[density],
    borderTop: bordered ? '1px solid #e2e2e2' : 'none',
    color: '#222222',
  };

  // Render loading state
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#767676' }}>
        <div style={{ marginBottom: '8px' }}>Loading...</div>
        <div style={{ fontSize: '12px' }}>Fetching data</div>
      </div>
    );
  }

  // Render error state
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#d32f2f' }}>
        <div style={{ marginBottom: '8px', fontSize: '16px' }}>⚠️ Error</div>
        <div>{errorMessage}</div>
      </div>
    );
  }

  // Render empty state
  if (processedData.length === 0) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }

    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#767676' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
        <div style={{ fontSize: '16px', fontWeight: 500 }}>{emptyMessage}</div>
      </div>
    );
  }

  // Render bulk actions
  const selectedCount = selectedRows.length;
  const visibleBulkActions = bulkActions.filter(action => {
    const selectedRowData = processedData.filter((row, index) =>
      selectedRows.includes(getRowId(row, index, rowId))
    );
    return !action.isVisible || action.isVisible(selectedRowData);
  });

  return (
    <div className={`data-table-container ${className}`}>
      {/* Bulk actions bar */}
      {selectedCount > 0 && visibleBulkActions.length > 0 && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#e3f2fd',
          borderBottom: '1px solid #90caf9',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontWeight: 500, color: '#0061d5' }}>
            {selectedCount} selected
          </span>
          {visibleBulkActions.map(action => {
            const selectedRowData = processedData.filter((row, index) =>
              selectedRows.includes(getRowId(row, index, rowId))
            );
            const disabled = action.isDisabled?.(selectedRowData) ?? false;

            return (
              <button
                key={action.id}
                onClick={async () => {
                  if (action.confirm) {
                    const message = typeof action.confirm === 'function'
                      ? action.confirm(selectedRowData)
                      : `Are you sure you want to perform this action on ${selectedCount} items?`;
                    if (!confirm(message)) return;
                  }
                  await action.onClick(selectedRowData);
                }}
                disabled={disabled}
                style={{
                  padding: '6px 12px',
                  backgroundColor: action.variant === 'danger' ? '#d32f2f' : '#0061d5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.5 : 1,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {action.icon}
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div style={{ overflow: 'auto' }}>
        <table style={tableStyles}>
          <thead style={theadStyles}>
            <tr>
              {/* Selection column */}
              {selectable && (
                <th style={{ ...thStyles, width: '40px' }}>
                  {multiSelect && (
                    <input
                      type="checkbox"
                      checked={selectedRows.length === processedData.length && processedData.length > 0}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                </th>
              )}

              {/* Data columns */}
              {visibleColumns.map(column => {
                const isSorted = currentSort?.field === column.field;
                const sortDirection = isSorted ? currentSort?.direction : null;

                return (
                  <th
                    key={column.field}
                    style={{
                      ...thStyles,
                      width: getColumnWidth(column.width),
                      minWidth: getColumnWidth(column.minWidth),
                      maxWidth: getColumnWidth(column.maxWidth),
                      textAlign: column.align || 'left',
                      cursor: column.sortable ? 'pointer' : 'default',
                    }}
                    className={column.headerClassName}
                    onClick={() => column.sortable && handleSort(column.field)}
                    title={column.tooltip}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {column.label}
                      {column.sortable && (
                        <span style={{ opacity: isSorted ? 1 : 0.3 }}>
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}

              {/* Actions column */}
              {actions.length > 0 && (
                <th style={{ ...thStyles, width: '120px', textAlign: 'right' }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {processedData.map((row, index) => {
              const id = getRowId(row, index, rowId);
              const isSelected = selectedRows.includes(id);
              const rowClasses = rowClassName?.(row, index) || '';

              const rowStyles: CSSProperties = {
                backgroundColor: isSelected
                  ? '#e3f2fd'
                  : striped && index % 2 === 1
                  ? '#f7f7f8'
                  : 'white',
                cursor: onRowClick ? 'pointer' : 'default',
                ...(hoverable && {
                  transition: 'background-color 0.15s',
                }),
              };

              const visibleActions = actions.filter(action =>
                !action.isVisible || action.isVisible(row)
              );

              return (
                <tr
                  key={id}
                  style={rowStyles}
                  className={rowClasses}
                  onClick={() => onRowClick?.(row, index)}
                  onDoubleClick={() => onRowDoubleClick?.(row, index)}
                  onMouseEnter={(e) => {
                    if (hoverable && !isSelected) {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (hoverable && !isSelected) {
                      e.currentTarget.style.backgroundColor = striped && index % 2 === 1 ? '#f7f7f8' : 'white';
                    }
                  }}
                >
                  {/* Selection cell */}
                  {selectable && (
                    <td style={tdStyles}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectRow(id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                  )}

                  {/* Data cells */}
                  {visibleColumns.map(column => {
                    const value = getNestedValue(row, column.field);
                    let cellContent: React.ReactNode;

                    if (column.render) {
                      cellContent = column.render(value, row, index);
                    } else if (column.formatter) {
                      cellContent = format(value, column.formatter, column.formatterOptions);
                    } else {
                      cellContent = value !== null && value !== undefined ? String(value) : '-';
                    }

                    return (
                      <td
                        key={column.field}
                        style={{
                          ...tdStyles,
                          textAlign: column.align || 'left',
                        }}
                        className={column.className}
                      >
                        {cellContent}
                      </td>
                    );
                  })}

                  {/* Actions cell */}
                  {actions.length > 0 && (
                    <td style={{ ...tdStyles, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        {visibleActions.map(action => {
                          const disabled = action.isDisabled?.(row) ?? false;

                          return (
                            <button
                              key={action.id}
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (action.confirm) {
                                  const message = typeof action.confirm === 'function'
                                    ? action.confirm(row)
                                    : `Are you sure?`;
                                  if (!confirm(message)) return;
                                }
                                await action.onClick(row, processedData);
                              }}
                              disabled={disabled}
                              title={action.label}
                              style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                border: '1px solid #d3d3d3',
                                borderRadius: '4px',
                                backgroundColor: 'white',
                                color: action.variant === 'danger' ? '#d32f2f' : '#0061d5',
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                opacity: disabled ? 0.5 : 1,
                              }}
                            >
                              {action.icon || action.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer / Stats */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid #e2e2e2',
        fontSize: '12px',
        color: '#767676',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          Showing {processedData.length} {processedData.length === 1 ? 'row' : 'rows'}
          {currentFilters.length > 0 && ` (filtered from ${data.length})`}
        </div>
        {selectedCount > 0 && (
          <div>
            {selectedCount} selected
          </div>
        )}
      </div>
    </div>
  );
}

export default DataTable;
