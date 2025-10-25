import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { DataTable } from '@modular-platform/shared-components';
import { convertServerTableConfig } from './sdui-utils';

export interface FormsTabProps {
  searchQuery?: string;
  filters?: any[];
}

/**
 * GraphQL queries for Forms tab (Level 3 - SDUI)
 *
 * Note: Fetches both data AND UI configuration from server
 */
const GET_FORMS_WITH_CONFIG = gql`
  query GetFormsWithConfig($filters: FormFilters) {
    # Fetch UI configuration from server
    formsTableConfig {
      columns {
        field
        label
        sortable
        formatter
        width
        align
      }
      actions {
        id
        label
        icon
        variant
      }
      bulkActions {
        id
        label
        icon
        variant
      }
      defaultSort
      defaultSortDirection
    }

    # Fetch data
    forms(filters: $filters) {
      id
      title
      description
      status
      createdBy {
        id
        name
      }
      createdAt
      updatedAt
      submissionCount
      lastSubmissionAt
      category
      isPublic
    }
  }
`;

const GET_FORM_SUBMISSIONS_WITH_CONFIG = gql`
  query GetFormSubmissionsWithConfig($formId: ID!) {
    # Fetch UI configuration from server
    formSubmissionsTableConfig {
      columns {
        field
        label
        sortable
        formatter
        width
        align
      }
      actions {
        id
        label
        icon
        variant
      }
      bulkActions {
        id
        label
        icon
        variant
      }
      defaultSort
      defaultSortDirection
    }

    # Fetch data
    formSubmissions(formId: $formId) {
      id
      formId
      submittedBy {
        id
        name
      }
      submittedAt
      status
      responseData
      ipAddress
    }
  }
`;

/**
 * Forms Tab Component
 *
 * Demonstrates Level 3 integration (Server-Driven UI):
 * - UI configuration comes from GraphQL server
 * - Column definitions fetched from backend
 * - Actions defined by server
 * - Only action implementations in frontend code
 * - Master-detail view (Forms -> Form Submissions)
 */
export function FormsTab(props: FormsTabProps): JSX.Element {
  const { searchQuery = '', filters = [] } = props;

  // State
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedFormsRows, setSelectedFormsRows] = useState<string[]>([]);
  const [selectedSubmissionsRows, setSelectedSubmissionsRows] = useState<string[]>([]);

  // Build GraphQL filters
  const graphqlFilters = React.useMemo(() => {
    const result: any = {};

    const statusFilter = filters.find((f) => f.field === 'status');
    if (statusFilter) {
      result.status = statusFilter.value;
    }

    const categoryFilter = filters.find((f) => f.field === 'category');
    if (categoryFilter) {
      result.category = categoryFilter.value;
    }

    return Object.keys(result).length > 0 ? result : undefined;
  }, [filters]);

  // Fetch forms with UI config from server
  const {
    data: formsData,
    loading: formsLoading,
    error: formsError,
    refetch: refetchForms,
  } = useQuery(GET_FORMS_WITH_CONFIG, {
    variables: { filters: graphqlFilters },
  });

  // Fetch form submissions with UI config from server (only when form is selected)
  const {
    data: submissionsData,
    loading: submissionsLoading,
    error: submissionsError,
    refetch: refetchSubmissions,
  } = useQuery(GET_FORM_SUBMISSIONS_WITH_CONFIG, {
    variables: { formId: selectedFormId },
    skip: !selectedFormId,
  });

  // Apply client-side search
  const filteredForms = React.useMemo(() => {
    if (!formsData?.forms) return [];

    let result = formsData.forms;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((form: any) => {
        return (
          form.title?.toLowerCase().includes(query) ||
          form.description?.toLowerCase().includes(query) ||
          form.category?.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [formsData, searchQuery]);

  // Convert server UI config to DataTable props
  const formsTableConfig = React.useMemo(() => {
    if (!formsData?.formsTableConfig) return null;
    return convertServerTableConfig(formsData.formsTableConfig, refetchForms);
  }, [formsData, refetchForms]);

  const submissionsTableConfig = React.useMemo(() => {
    if (!submissionsData?.formSubmissionsTableConfig) return null;
    return convertServerTableConfig(submissionsData.formSubmissionsTableConfig, refetchSubmissions);
  }, [submissionsData, refetchSubmissions]);

  // Handle row click to show submissions
  const handleFormClick = (form: any) => {
    setSelectedFormId(form.id);
  };

  // Get selected form details
  const selectedForm = filteredForms.find((f: any) => f.id === selectedFormId);

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
          Forms {selectedForm && `→ ${selectedForm.title}`}
        </h2>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#767676' }}>
          {selectedForm
            ? `Viewing submissions for "${selectedForm.title}"`
            : 'Manage forms and their submissions'}
        </p>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Forms Table (Master) */}
        <div
          style={{
            width: selectedFormId ? '40%' : '100%',
            borderRight: selectedFormId ? '1px solid #e2e2e2' : 'none',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease',
          }}
        >
          {formsTableConfig && (
            <DataTable
              data={filteredForms}
              columns={formsTableConfig.columns}
              loading={formsLoading}
              error={formsError}
              rowId="id"
              actions={formsTableConfig.actions}
              bulkActions={formsTableConfig.bulkActions}
              selectable={true}
              multiSelect={true}
              selectedRows={selectedFormsRows}
              onSelectionChange={setSelectedFormsRows}
              onRowClick={handleFormClick}
              density="normal"
              bordered={false}
              striped={true}
              hoverable={true}
              stickyHeader={true}
              emptyMessage="No forms found"
              rowClassName={(row: any) => (row.id === selectedFormId ? 'row-selected' : '')}
            />
          )}
        </div>

        {/* Form Submissions Table (Detail) */}
        {selectedFormId && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {submissionsTableConfig && (
              <DataTable
                data={submissionsData?.formSubmissions || []}
                columns={submissionsTableConfig.columns}
                loading={submissionsLoading}
                error={submissionsError}
                rowId="id"
                actions={submissionsTableConfig.actions}
                bulkActions={submissionsTableConfig.bulkActions}
                selectable={true}
                multiSelect={true}
                selectedRows={selectedSubmissionsRows}
                onSelectionChange={setSelectedSubmissionsRows}
                density="normal"
                bordered={false}
                striped={true}
                hoverable={true}
                stickyHeader={true}
                emptyMessage="No submissions found"
              />
            )}
          </div>
        )}
      </div>

      {/* Custom styles */}
      <style>{`
        .row-selected {
          background-color: #e6f7ff !important;
          border-left: 3px solid #1890ff;
        }
        .row-selected:hover {
          background-color: #bae7ff !important;
        }
      `}</style>
    </div>
  );
}

export default FormsTab;
