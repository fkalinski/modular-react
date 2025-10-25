import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { DataTable } from '@modular-platform/shared-components';
import { enricherRegistry } from '@modular-platform/shared-data';
import {
  GET_ARCHIVES_QUERY,
  ARCHIVE_COLUMNS,
  ARCHIVE_ENRICHERS,
  ARCHIVE_ACTIONS,
  ARCHIVE_BULK_ACTIONS,
} from './config';

export interface ArchivesTabProps {
  searchQuery?: string;
  filters?: any[];
}

/**
 * Archives Tab Component
 *
 * Demonstrates Level 2 integration (data-driven approach):
 * - Uses GraphQL query from config
 * - Applies enrichers to transform data
 * - Renders using DataTable with column definitions
 * - No custom UI code, everything driven by configuration
 */
export function ArchivesTab(props: ArchivesTabProps): JSX.Element {
  const { searchQuery = '', filters = [] } = props;

  // State
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Register enrichers on mount
  useEffect(() => {
    ARCHIVE_ENRICHERS.forEach((enricher) => {
      enricherRegistry.register(enricher);
    });

    return () => {
      // Clean up enrichers on unmount
      ARCHIVE_ENRICHERS.forEach((enricher) => {
        enricherRegistry.unregister(enricher.id);
      });
    };
  }, []);

  // Build GraphQL filters from search and filters
  const graphqlFilters = React.useMemo(() => {
    const result: any = {};

    // Apply compression type filter if present
    const compressionFilter = filters.find((f) => f.field === 'compressionType');
    if (compressionFilter) {
      result.compressionType = compressionFilter.value;
    }

    // Apply date range filters if present
    const fromDateFilter = filters.find((f) => f.field === 'fromDate');
    if (fromDateFilter) {
      result.fromDate = fromDateFilter.value;
    }

    const toDateFilter = filters.find((f) => f.field === 'toDate');
    if (toDateFilter) {
      result.toDate = toDateFilter.value;
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }, [filters]);

  // Fetch archives from GraphQL
  const { data, loading, error } = useQuery(GET_ARCHIVES_QUERY, {
    variables: { filters: graphqlFilters },
  });

  // Apply enrichers to data
  const enrichedData = React.useMemo(() => {
    if (!data?.archives) return [];

    const result = enricherRegistry.enrich(data.archives, 'Archive');

    if (result.errors && result.errors.length > 0) {
      console.warn('Enrichment errors:', result.errors);
    }

    return result.data;
  }, [data]);

  // Apply client-side search filter
  const filteredData = React.useMemo(() => {
    if (!searchQuery) return enrichedData;

    const query = searchQuery.toLowerCase();
    return enrichedData.filter((archive: any) => {
      return (
        archive.name?.toLowerCase().includes(query) ||
        archive.originalLocation?.toLowerCase().includes(query) ||
        archive.archiveReason?.toLowerCase().includes(query) ||
        archive.archivedBy?.name?.toLowerCase().includes(query)
      );
    });
  }, [enrichedData, searchQuery]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e2e2e2',
          backgroundColor: '#fafafa',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          Archives
        </h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#767676' }}>
          View and manage archived files and folders
        </p>
      </div>

      {/* DataTable */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <DataTable
          data={filteredData}
          columns={ARCHIVE_COLUMNS}
          loading={loading}
          error={error}
          rowId="id"
          actions={ARCHIVE_ACTIONS}
          bulkActions={ARCHIVE_BULK_ACTIONS}
          selectable={true}
          multiSelect={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          density="normal"
          bordered={true}
          striped={true}
          hoverable={true}
          stickyHeader={true}
          emptyMessage="No archives found"
        />
      </div>
    </div>
  );
}

export default ArchivesTab;
