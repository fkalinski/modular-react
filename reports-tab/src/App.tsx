import React, { Suspense, lazy } from 'react';

const Card = lazy(() => import('shared_components/Layout').then(m => ({ default: m.Card })));
const Button = lazy(() => import('shared_components/Button').then(m => ({ default: m.Button })));
const Table = lazy(() => import('shared_components/Table').then(m => ({ default: m.Table })));

const ReportsApp: React.FC = () => {
  const mockReports = [
    { id: '1', name: 'Sales Report Q4', type: 'Sales', lastRun: '2024-01-15' },
    { id: '2', name: 'User Activity', type: 'Analytics', lastRun: '2024-01-16' },
    { id: '3', name: 'Revenue Forecast', type: 'Finance', lastRun: '2024-01-17' },
  ];

  return (
    <Suspense fallback={<div>Loading Reports...</div>}>
      <div>
        <Card title="Reports Dashboard">
          <p style={{ marginBottom: '20px', color: '#666' }}>
            This is a simple federated tab demonstrating independent deployment.
            It uses shared components from the component library.
          </p>
          <div style={{ marginBottom: '20px' }}>
            <Button variant="primary" onClick={() => alert('Generate new report')}>
              Generate Report
            </Button>
          </div>
          <Table
            columns={[
              { key: 'name', header: 'Report Name', width: '40%' },
              { key: 'type', header: 'Type', width: '30%' },
              { key: 'lastRun', header: 'Last Run', width: '30%' },
            ]}
            data={mockReports}
            onRowClick={(report) => alert(`View report: ${report.name}`)}
          />
        </Card>
      </div>
    </Suspense>
  );
};

export default ReportsApp;
