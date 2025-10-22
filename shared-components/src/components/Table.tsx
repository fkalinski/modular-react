import React from 'react';

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
  idKey?: keyof T;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  selectedIds = [],
  idKey = 'id' as keyof T,
}: TableProps<T>) {
  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  };

  const thStyles: React.CSSProperties = {
    padding: '12px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #dee2e6',
    fontWeight: 600,
    fontSize: '14px',
    color: '#495057',
  };

  const tdStyles: React.CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
    fontSize: '14px',
  };

  return (
    <table style={tableStyles}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              style={{ ...thStyles, width: column.width }}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => {
          const itemId = String(item[idKey]);
          const isSelected = selectedIds.includes(itemId);

          return (
            <tr
              key={itemId || index}
              onClick={() => onRowClick?.(item)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                backgroundColor: isSelected ? '#e7f3ff' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (onRowClick) {
                  e.currentTarget.style.backgroundColor = isSelected
                    ? '#d0e8ff'
                    : '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (onRowClick) {
                  e.currentTarget.style.backgroundColor = isSelected
                    ? '#e7f3ff'
                    : 'transparent';
                }
              }}
            >
              {columns.map((column) => (
                <td key={column.key} style={tdStyles}>
                  {column.render
                    ? column.render(item)
                    : item[column.key]}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Table;
