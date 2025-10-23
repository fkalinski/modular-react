// Type declarations for Module Federation remotes

declare module 'shared_components/Theme' {
  import React from 'react';

  export const ThemeProvider: React.FC<{ children: React.ReactNode }>;
}

declare module 'shared_components/Table' {
  import React from 'react';

  export interface TableColumn {
    key: string;
    header: string;
    width?: string;
    render?: (value: any, row: any) => React.ReactNode;
  }

  export interface TableProps {
    columns: TableColumn[];
    data: any[];
    selectedIds?: string[];
    onSelectionChange?: (ids: string[]) => void;
    showCheckboxes?: boolean;
    onRowClick?: (row: any) => void;
  }

  export const Table: React.FC<TableProps>;
}

declare module 'shared_components/Button' {
  import React from 'react';

  export interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
  }

  export const Button: React.FC<ButtonProps>;
}

declare module 'shared_components/Input' {
  import React from 'react';

  export interface InputProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
    disabled?: boolean;
  }

  export const Input: React.FC<InputProps>;
}

declare module 'shared_components/Breadcrumbs' {
  import React from 'react';

  export interface BreadcrumbItem {
    id: string;
    label: string;
    icon?: string;
    href?: string;
    onClick?: () => void;
  }

  export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    maxItems?: number;
    separator?: React.ReactNode;
    onItemClick?: (item: BreadcrumbItem) => void;
  }

  export const Breadcrumbs: React.FC<BreadcrumbsProps>;
}
