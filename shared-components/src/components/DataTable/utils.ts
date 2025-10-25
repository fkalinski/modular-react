/**
 * Utility functions for DataTable
 */

/**
 * Get nested value from object using dot notation
 * Supports: "owner.name", "metadata.size", etc.
 */
export function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return undefined;

  return path.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, obj);
}

/**
 * Set nested value in object using dot notation
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  if (!obj || !path) return;

  const parts = path.split('.');
  const last = parts.pop()!;

  const target = parts.reduce((acc, part) => {
    if (!acc[part]) acc[part] = {};
    return acc[part];
  }, obj);

  target[last] = value;
}

/**
 * Compare two values for sorting
 */
export function compareValues(a: any, b: any, direction: 'asc' | 'desc'): number {
  // Handle null/undefined
  if (a === null || a === undefined) return direction === 'asc' ? 1 : -1;
  if (b === null || b === undefined) return direction === 'asc' ? -1 : 1;

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return direction === 'asc'
      ? a.getTime() - b.getTime()
      : b.getTime() - a.getTime();
  }

  // Handle numbers
  if (typeof a === 'number' && typeof b === 'number') {
    return direction === 'asc' ? a - b : b - a;
  }

  // Handle strings (case-insensitive)
  const aStr = String(a).toLowerCase();
  const bStr = String(b).toLowerCase();

  if (aStr < bStr) return direction === 'asc' ? -1 : 1;
  if (aStr > bStr) return direction === 'asc' ? 1 : -1;
  return 0;
}

/**
 * Sort array by field
 */
export function sortByField<T>(
  data: T[],
  field: string,
  direction: 'asc' | 'desc'
): T[] {
  return [...data].sort((a, b) => {
    const aVal = getNestedValue(a, field);
    const bVal = getNestedValue(b, field);
    return compareValues(aVal, bVal, direction);
  });
}

/**
 * Filter data by field and value
 */
export function filterData<T>(data: T[], filters: { field: string; value: any; operator?: string }[]): T[] {
  if (!filters || filters.length === 0) return data;

  return data.filter(row => {
    return filters.every(filter => {
      const value = getNestedValue(row, filter.field);
      const filterValue = filter.value;
      const operator = filter.operator || 'contains';

      switch (operator) {
        case 'eq':
          return value === filterValue;
        case 'ne':
          return value !== filterValue;
        case 'gt':
          return value > filterValue;
        case 'lt':
          return value < filterValue;
        case 'gte':
          return value >= filterValue;
        case 'lte':
          return value <= filterValue;
        case 'contains':
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'startsWith':
          return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
        case 'endsWith':
          return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
        default:
          return true;
      }
    });
  });
}

/**
 * Generate a stable ID for a row
 */
export function getRowId<T>(row: T, index: number, idField: string = 'id'): string {
  const id = getNestedValue(row, idField);
  return id !== undefined ? String(id) : `row-${index}`;
}

/**
 * Calculate column width
 */
export function getColumnWidth(width?: number | string): string | undefined {
  if (!width) return undefined;
  if (typeof width === 'number') return `${width}px`;
  return width;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
