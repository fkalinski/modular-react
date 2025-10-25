import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { DataTable } from '@modular-platform/shared-components';
import {
  GET_FILE_REQUESTS_QUERY,
  FILE_REQUEST_COLUMNS,
  FILE_REQUEST_ACTIONS,
  FILE_REQUEST_BULK_ACTIONS,
} from './config';

export interface FileRequestsTabProps {
  searchQuery?: string;
  filters?: any[];
}

/**
 * File Requests Tab Component
 *
 * Demonstrates Level 2 integration with custom extensions:
 * - Base: DataTable component with configuration
 * - Extension: Custom cell renderers for visual enhancement
 * - Extension: Custom action handlers with complex logic
 * - Mix: Built-in formatters and custom React components
 */
export function FileRequestsTab(props: FileRequestsTabProps): JSX.Element {
  const { searchQuery = '', filters = [] } = props;

  // State
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Build GraphQL filters from search and filters
  const graphqlFilters = React.useMemo(() => {
    const result: any = {};

    // Apply status filter if present
    const statusFilter = filters.find((f) => f.field === 'status');
    if (statusFilter) {
      result.status = statusFilter.value;
    }

    // Apply priority filter if present
    const priorityFilter = filters.find((f) => f.field === 'priority');
    if (priorityFilter) {
      result.priority = priorityFilter.value;
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }, [filters]);

  // Fetch file requests from GraphQL
  const { data, loading, error } = useQuery(GET_FILE_REQUESTS_QUERY, {
    variables: { filters: graphqlFilters },
  });

  // Apply client-side search filter
  const filteredData = React.useMemo(() => {
    if (!data?.fileRequests) return [];

    let result = data.fileRequests;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((request: any) => {
        return (
          request.fileName?.toLowerCase().includes(query) ||
          request.requestedBy?.name?.toLowerCase().includes(query) ||
          request.requestedFrom?.name?.toLowerCase().includes(query) ||
          request.message?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [data, searchQuery]);

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
          File Requests
        </h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#767676' }}>
          Manage file upload and download requests
        </p>
      </div>

      {/* DataTable with custom renderers */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <DataTable
          data={filteredData}
          columns={FILE_REQUEST_COLUMNS}
          loading={loading}
          error={error}
          rowId="id"
          actions={FILE_REQUEST_ACTIONS}
          bulkActions={FILE_REQUEST_BULK_ACTIONS}
          selectable={true}
          multiSelect={true}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          density="normal"
          bordered={true}
          striped={true}
          hoverable={true}
          stickyHeader={true}
          emptyMessage="No file requests found"
          rowClassName={(row: any) => {
            // Custom row styling based on status
            if (row.status === 'overdue') return 'row-overdue';
            if (row.status === 'completed') return 'row-completed';
            return '';
          }}
        />
      </div>

      {/* Custom styles */}
      <style>{`
        .row-overdue {
          background-color: #fff1f0 !important;
        }
        .row-overdue:hover {
          background-color: #ffccc7 !important;
        }
        .row-completed {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}

export default FileRequestsTab;
