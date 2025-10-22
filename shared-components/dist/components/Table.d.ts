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
    onSelectionChange?: (ids: string[]) => void;
    idKey?: keyof T;
    showCheckboxes?: boolean;
    showActions?: boolean;
    onActionClick?: (item: T) => void;
}
export declare function Table<T extends Record<string, any>>({ columns, data, onRowClick, selectedIds, onSelectionChange, idKey, showCheckboxes, showActions, onActionClick, }: TableProps<T>): import("react/jsx-runtime").JSX.Element;
export default Table;
