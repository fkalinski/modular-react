/**
 * Built-in formatters for DataTable cells
 * These handle common data transformations
 */

export type FormatterType =
  | 'date'
  | 'datetime'
  | 'time'
  | 'fileSize'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'boolean'
  | 'badge'
  | 'email'
  | 'url';

export interface FormatterOptions {
  locale?: string;
  currency?: string;
  decimals?: number;
  dateFormat?: 'short' | 'medium' | 'long' | 'full';
}

/**
 * Format a date value
 */
export const formatDate = (value: string | Date | number, options?: FormatterOptions): string => {
  if (!value) return '-';

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '-';

  const locale = options?.locale || 'en-US';
  const dateStyle = options?.dateFormat || 'medium';

  return new Intl.DateTimeFormat(locale, { dateStyle }).format(date);
};

/**
 * Format a datetime value
 */
export const formatDateTime = (value: string | Date | number, options?: FormatterOptions): string => {
  if (!value) return '-';

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '-';

  const locale = options?.locale || 'en-US';
  const dateStyle = options?.dateFormat || 'medium';

  return new Intl.DateTimeFormat(locale, {
    dateStyle,
    timeStyle: 'short',
  }).format(date);
};

/**
 * Format a time value
 */
export const formatTime = (value: string | Date | number, options?: FormatterOptions): string => {
  if (!value) return '-';

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '-';

  const locale = options?.locale || 'en-US';

  return new Intl.DateTimeFormat(locale, {
    timeStyle: 'medium',
  }).format(date);
};

/**
 * Format bytes to human-readable file size
 */
export const formatFileSize = (bytes: number | null | undefined): string => {
  if (bytes === null || bytes === undefined) return '-';
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let size = Math.abs(bytes);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const formatted = unitIndex === 0
    ? size.toString()
    : size.toFixed(2);

  return `${formatted} ${units[unitIndex]}`;
};

/**
 * Format a number with locale-specific separators
 */
export const formatNumber = (
  value: number | null | undefined,
  options?: FormatterOptions
): string => {
  if (value === null || value === undefined) return '-';
  if (isNaN(value)) return '-';

  const locale = options?.locale || 'en-US';
  const decimals = options?.decimals ?? (Number.isInteger(value) ? 0 : 2);

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format a currency value
 */
export const formatCurrency = (
  value: number | null | undefined,
  options?: FormatterOptions
): string => {
  if (value === null || value === undefined) return '-';
  if (isNaN(value)) return '-';

  const locale = options?.locale || 'en-US';
  const currency = options?.currency || 'USD';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Format a percentage value
 */
export const formatPercentage = (
  value: number | null | undefined,
  options?: FormatterOptions
): string => {
  if (value === null || value === undefined) return '-';
  if (isNaN(value)) return '-';

  const locale = options?.locale || 'en-US';
  const decimals = options?.decimals ?? 1;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Format a boolean value
 */
export const formatBoolean = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) return '-';
  return value ? '✓' : '✗';
};

/**
 * Format an email address
 */
export const formatEmail = (value: string | null | undefined): string => {
  if (!value) return '-';
  return value.toLowerCase();
};

/**
 * Format a URL
 */
export const formatUrl = (value: string | null | undefined): string => {
  if (!value) return '-';
  try {
    const url = new URL(value);
    return url.hostname;
  } catch {
    return value;
  }
};

/**
 * Main formatter function that routes to specific formatters
 */
export const format = (
  value: any,
  type: FormatterType,
  options?: FormatterOptions
): string => {
  switch (type) {
    case 'date':
      return formatDate(value, options);
    case 'datetime':
      return formatDateTime(value, options);
    case 'time':
      return formatTime(value, options);
    case 'fileSize':
      return formatFileSize(value);
    case 'number':
      return formatNumber(value, options);
    case 'currency':
      return formatCurrency(value, options);
    case 'percentage':
      return formatPercentage(value, options);
    case 'boolean':
      return formatBoolean(value);
    case 'email':
      return formatEmail(value);
    case 'url':
      return formatUrl(value);
    case 'badge':
      return String(value || '-');
    default:
      return String(value || '-');
  }
};

/**
 * Registry of all formatters
 */
export const formatters = {
  date: formatDate,
  datetime: formatDateTime,
  time: formatTime,
  fileSize: formatFileSize,
  number: formatNumber,
  currency: formatCurrency,
  percentage: formatPercentage,
  boolean: formatBoolean,
  email: formatEmail,
  url: formatUrl,
  format,
};
