import React, { Suspense, lazy, useState } from 'react';

const Button = lazy(() => import('shared_components/Button').then(m => ({ default: m.Button })));
const Table = lazy(() => import('shared_components/Table').then(m => ({ default: m.Table })));
const Breadcrumbs = lazy(() => import('shared_components/Breadcrumbs').then(m => ({ default: m.Breadcrumbs })));

interface Report {
  id: string;
  name: string;
  type: string;
  lastRun: string;
  status?: 'completed' | 'running' | 'failed';
}

const ReportsApp: React.FC = () => {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  const mockReports: Report[] = [
    { id: '1', name: 'Sales Report Q4', type: 'Sales', lastRun: '2024-01-15', status: 'completed' },
    { id: '2', name: 'User Activity', type: 'Analytics', lastRun: '2024-01-16', status: 'completed' },
    { id: '3', name: 'Revenue Forecast', type: 'Finance', lastRun: '2024-01-17', status: 'completed' },
    { id: '4', name: 'Customer Retention', type: 'Analytics', lastRun: '2024-01-14', status: 'completed' },
    { id: '5', name: 'Marketing ROI', type: 'Marketing', lastRun: '2024-01-13', status: 'failed' },
  ];

  // Box design system styles
  const containerStyles: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f7f7f8',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const toolbarStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e2e2',
  };

  const toolbarLeftStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const toolbarRightStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const contentAreaStyles: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
  };

  const sectionStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '4px',
    border: '1px solid #e2e2e2',
    marginBottom: '20px',
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#222222',
    marginBottom: '12px',
  };

  const sectionDescriptionStyles: React.CSSProperties = {
    fontSize: '13px',
    color: '#767676',
    lineHeight: '18px',
    marginBottom: '16px',
  };

  const quickStatsStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  };

  const statCardStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '4px',
    border: '1px solid #e2e2e2',
  };

  const statValueStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 600,
    color: '#222222',
    marginBottom: '4px',
  };

  const statLabelStyles: React.CSSProperties = {
    fontSize: '12px',
    color: '#767676',
  };

  return (
    <Suspense fallback={<div style={{ padding: '20px' }}>Loading Reports...</div>}>
      {/* Breadcrumbs */}
      <Suspense fallback={null}>
        <Breadcrumbs
          items={[
            { id: 'reports', label: 'Reports', icon: '📊' },
            { id: 'dashboard', label: 'Dashboard' },
          ]}
        />
      </Suspense>

      <div style={containerStyles}>
        {/* Toolbar */}
        <div style={toolbarStyles}>
          <div style={toolbarLeftStyles}>
            <span style={{ fontSize: '13px', color: '#222222', fontWeight: 500 }}>
              {mockReports.length} reports
            </span>
            {selectedReports.length > 0 && (
              <span style={{ fontSize: '12px', color: '#767676' }}>
                • {selectedReports.length} selected
              </span>
            )}
          </div>

          <div style={toolbarRightStyles}>
            <Suspense fallback={null}>
              <Button
                size="small"
                variant="secondary"
                onClick={() => alert('Schedule report')}
              >
                Schedule Report
              </Button>
              <Button
                size="small"
                variant="primary"
                onClick={() => alert('Generate new report')}
              >
                Generate Report
              </Button>
            </Suspense>
          </div>
        </div>

        {/* Content Area */}
        <div style={contentAreaStyles}>
          {/* Quick Stats */}
          <div style={quickStatsStyles}>
            <div style={statCardStyles}>
              <div style={statValueStyles}>5</div>
              <div style={statLabelStyles}>Total Reports</div>
            </div>
            <div style={statCardStyles}>
              <div style={statValueStyles}>4</div>
              <div style={statLabelStyles}>Completed</div>
            </div>
            <div style={statCardStyles}>
              <div style={statValueStyles}>0</div>
              <div style={statLabelStyles}>Running</div>
            </div>
            <div style={statCardStyles}>
              <div style={statValueStyles}>1</div>
              <div style={statLabelStyles}>Failed</div>
            </div>
          </div>

          {/* Description Section */}
          <div style={sectionStyles}>
            <div style={sectionTitleStyles}>Reports Dashboard</div>
            <div style={sectionDescriptionStyles}>
              View and manage reports across your organization. Generate new reports,
              schedule automated runs, or export existing data. Reports are independently
              deployed as a federated module, demonstrating the modular architecture.
            </div>
          </div>

          {/* Reports Table */}
          <div style={sectionStyles}>
            <div style={sectionTitleStyles}>Recent Reports</div>
            <Suspense fallback={<div>Loading table...</div>}>
              <Table
                columns={[
                  { key: 'name', header: 'Report Name', width: '35%' },
                  { key: 'type', header: 'Type', width: '20%' },
                  { key: 'status', header: 'Status', width: '15%' },
                  { key: 'lastRun', header: 'Last Run', width: '20%' },
                  {
                    key: 'actions',
                    header: 'Actions',
                    width: '10%',
                    render: (report: Report) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`View ${report.name}`);
                        }}
                        style={{
                          padding: '4px 12px',
                          fontSize: '12px',
                          border: '1px solid #d3d3d3',
                          borderRadius: '4px',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    ),
                  },
                ]}
                data={mockReports}
                selectedIds={selectedReports}
                onSelectionChange={setSelectedReports}
                showCheckboxes={true}
                onRowClick={(report) => alert(`View report: ${report.name}`)}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default ReportsApp;
