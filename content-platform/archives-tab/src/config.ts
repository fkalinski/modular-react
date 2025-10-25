import { gql } from '@apollo/client';
import type { ColumnDefinition, RowAction } from '@modular-platform/shared-components';
import { enrichers } from '@modular-platform/shared-data';

/**
 * Archives Tab Configuration
 *
 * This file demonstrates Level 2 integration (data-driven approach):
 * - GraphQL fragments define what data to fetch
 * - Column definitions specify how to display the data
 * - Enrichers transform data after fetching
 * - Actions define what operations are available
 * - The platform renders the UI using DataTable
 */

/**
 * GraphQL fragment for Archive-specific fields
 */
export const ARCHIVE_FRAGMENT_FIELDS = `
  archiveDate
  archiveReason
  originalLocation
  compressionType
  compressedSize
  originalSize
  archivedBy {
    id
    name
    email
  }
`;

/**
 * GraphQL query for archives
 */
export const GET_ARCHIVES_QUERY = gql`
  query GetArchives($filters: ArchiveFilters) {
    archives(filters: $filters) {
      id
      name
      type
      path
      createdAt
      updatedAt
      archiveDate
      archiveReason
      originalLocation
      compressionType
      compressedSize
      originalSize
      archivedBy {
        id
        name
        email
      }
      owner {
        id
        name
        email
      }
    }
  }
`;

/**
 * Column definitions for Archives table
 */
export const ARCHIVE_COLUMNS: ColumnDefinition[] = [
  {
    field: 'name',
    label: 'Archive Name',
    sortable: true,
    width: 250,
  },
  {
    field: 'compressionType',
    label: 'Type',
    sortable: true,
    width: 100,
    align: 'center',
  },
  {
    field: 'compressionRatio',
    label: 'Compression',
    sortable: true,
    width: 120,
    align: 'right',
    tooltip: 'Compression ratio (space saved)',
  },
  {
    field: 'compressedSize',
    label: 'Size',
    sortable: true,
    formatter: 'fileSize',
    width: 120,
    align: 'right',
  },
  {
    field: 'originalSize',
    label: 'Original Size',
    sortable: true,
    formatter: 'fileSize',
    width: 120,
    align: 'right',
  },
  {
    field: 'archiveDate',
    label: 'Archived',
    sortable: true,
    formatter: 'datetime',
    width: 180,
  },
  {
    field: 'archivedBy.name',
    label: 'Archived By',
    sortable: true,
    width: 150,
  },
  {
    field: 'originalLocation',
    label: 'Original Location',
    sortable: true,
    width: 250,
  },
  {
    field: 'archiveReason',
    label: 'Reason',
    sortable: false,
    width: 200,
  },
];

/**
 * Field enrichers for Archive data
 */
export const ARCHIVE_ENRICHERS = [
  {
    id: 'archives_compressionRatio',
    field: 'compressionRatio',
    enrich: enrichers.computed((row: any) => {
      if (!row.originalSize || row.originalSize === 0) {
        return 'N/A';
      }
      const ratio = ((row.originalSize - row.compressedSize) / row.originalSize) * 100;
      return `${ratio.toFixed(1)}%`;
    }),
  },
  {
    id: 'archives_statusBadge',
    field: 'statusBadge',
    enrich: enrichers.map({
      ZIP: '🗜️ Compressed',
      GZIP: '🗜️ Compressed',
      TAR: '📦 Archived',
      NONE: '📄 Uncompressed',
    }),
  },
];

/**
 * Row actions for Archive items
 */
export const ARCHIVE_ACTIONS: RowAction[] = [
  {
    id: 'restore',
    label: 'Restore',
    icon: '↩️',
    onClick: async (archive: any) => {
      console.log('Restore archive:', archive);
      // TODO: Implement restore mutation
      alert(`Restoring ${archive.name} to ${archive.originalLocation}`);
    },
    isVisible: (archive: any) => {
      // Only show restore for archived items
      return archive.type === 'Archive';
    },
  },
  {
    id: 'download',
    label: 'Download',
    icon: '⬇️',
    onClick: async (archive: any) => {
      console.log('Download archive:', archive);
      // TODO: Implement download
      alert(`Downloading ${archive.name}`);
    },
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: '🗑️',
    variant: 'danger',
    onClick: async (archive: any) => {
      console.log('Delete archive:', archive);
      // TODO: Implement delete mutation
    },
    confirm: (archive: any) =>
      `Are you sure you want to permanently delete ${archive.name}? This cannot be undone.`,
    isDisabled: (archive: any) => {
      // Disable delete for certain archives
      return false;
    },
  },
];

/**
 * Bulk actions for Archive items
 */
export const ARCHIVE_BULK_ACTIONS = [
  {
    id: 'restore-all',
    label: 'Restore Selected',
    icon: '↩️',
    onClick: async (archives: any[]) => {
      console.log('Restore archives:', archives);
      alert(`Restoring ${archives.length} archives`);
    },
  },
  {
    id: 'delete-all',
    label: 'Delete Selected',
    icon: '🗑️',
    variant: 'danger' as const,
    onClick: async (archives: any[]) => {
      console.log('Delete archives:', archives);
    },
    confirm: (archives: any[]) =>
      `Are you sure you want to permanently delete ${archives.length} archives? This cannot be undone.`,
  },
];
