import React, { useState, useEffect, useRef } from 'react';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  activeRowId?: string;
  onActiveRowChange?: (rowId: string | undefined) => void;
  idKey?: keyof T;
  showCheckboxes?: boolean;
  showActions?: boolean;
  onActionClick?: (item: T) => void;
  enableKeyboardNav?: boolean;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  selectedIds = [],
  onSelectionChange,
  activeRowId,
  onActiveRowChange,
  idKey = 'id' as keyof T,
  showCheckboxes = false,
  showActions = false,
  onActionClick,
  enableKeyboardNav = true,
}: TableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNav || !onRowClick) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (data.length === 0) return;

      const currentIndex = activeRowId
        ? data.findIndex(item => String(item[idKey]) === activeRowId)
        : -1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = currentIndex < data.length - 1 ? currentIndex + 1 : 0;
          const nextItem = data[nextIndex];
          if (nextItem && onActiveRowChange) {
            onActiveRowChange(String(nextItem[idKey]));
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : data.length - 1;
          const prevItem = data[prevIndex];
          if (prevItem && onActiveRowChange) {
            onActiveRowChange(String(prevItem[idKey]));
          }
          break;

        case 'Enter':
          if (currentIndex >= 0 && data[currentIndex]) {
            e.preventDefault();
            onRowClick(data[currentIndex]);
          }
          break;

        case 'Escape':
          e.preventDefault();
          if (onActiveRowChange) {
            onActiveRowChange(undefined);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRowId, data, idKey, onRowClick, onActiveRowChange, enableKeyboardNav]);

  const handleCheckboxChange = (itemId: string) => {
    if (!onSelectionChange) return;

    const newSelection = selectedIds.includes(itemId)
      ? selectedIds.filter(id => id !== itemId)
      : [...selectedIds, itemId];

    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedIds.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(item => String(item[idKey])));
    }
  };

  // Box design system styling
  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const thStyles: React.CSSProperties = {
    padding: '8px 12px',
    textAlign: 'left',
    backgroundColor: '#f7f7f8',
    borderBottom: 'none',
    fontWeight: 600,
    fontSize: '12px',
    color: '#222222',
    height: '36px',
  };

  const tdStyles: React.CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid #e2e2e2',
    fontSize: '13px',
    color: '#222222',
    height: '40px',
  };

  const checkboxStyles: React.CSSProperties = {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    accentColor: '#0061d5',
  };

  const actionButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: '#767676',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <table ref={tableRef} style={tableStyles} tabIndex={enableKeyboardNav ? 0 : undefined}>
      <thead>
        <tr>
          {showCheckboxes && (
            <th style={{ ...thStyles, width: '40px' }}>
              <input
                type="checkbox"
                style={checkboxStyles}
                checked={selectedIds.length === data.length && data.length > 0}
                onChange={handleSelectAll}
              />
            </th>
          )}
          {columns.map((column) => (
            <th
              key={column.key}
              style={{ ...thStyles, width: column.width }}
            >
              {column.header}
            </th>
          ))}
          {showActions && (
            <th style={{ ...thStyles, width: '40px' }}></th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => {
          const itemId = String(item[idKey]);
          const isSelected = selectedIds.includes(itemId);
          const isActive = activeRowId === itemId;
          const isHovered = hoveredRow === itemId;

          // Priority: selected > active > hover
          let backgroundColor = 'transparent';
          let borderLeftColor = 'transparent';

          if (isSelected) {
            backgroundColor = '#e7f1ff';
            borderLeftColor = '#0061d5';
          } else if (isActive) {
            backgroundColor = '#f0f4ff';
            borderLeftColor = '#7ba7ff';
          } else if (isHovered) {
            backgroundColor = '#f7f7f8';
          }

          return (
            <tr
              key={itemId || index}
              onClick={() => onRowClick?.(item)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                backgroundColor,
                borderLeft: `2px solid ${borderLeftColor}`,
              }}
              onMouseEnter={() => setHoveredRow(itemId)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              {showCheckboxes && (
                <td style={{ ...tdStyles, width: '40px' }}>
                  <input
                    type="checkbox"
                    style={checkboxStyles}
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCheckboxChange(itemId);
                    }}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} style={tdStyles}>
                  {column.render
                    ? column.render(item)
                    : item[column.key]}
                </td>
              ))}
              {showActions && (
                <td style={{ ...tdStyles, width: '40px' }}>
                  <button
                    style={actionButtonStyles}
                    onClick={(e) => {
                      e.stopPropagation();
                      onActionClick?.(item);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#222222';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#767676';
                    }}
                  >
                    ⋯
                  </button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Table;
