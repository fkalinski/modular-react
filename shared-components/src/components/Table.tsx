import React, { useState } from 'react';

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
  idKey?: keyof T;
  showCheckboxes?: boolean;
  showActions?: boolean;
  onActionClick?: (item: T) => void;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  selectedIds = [],
  onSelectionChange,
  idKey = 'id' as keyof T,
  showCheckboxes = false,
  showActions = false,
  onActionClick,
}: TableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

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
    <table style={tableStyles}>
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
          const isHovered = hoveredRow === itemId;

          return (
            <tr
              key={itemId || index}
              onClick={() => !showCheckboxes && onRowClick?.(item)}
              style={{
                cursor: onRowClick && !showCheckboxes ? 'pointer' : 'default',
                backgroundColor: isSelected ? '#e7f1ff' : isHovered ? '#f7f7f8' : 'transparent',
                borderLeft: isSelected ? '2px solid #0061d5' : '2px solid transparent',
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
