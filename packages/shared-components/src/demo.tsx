import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Table } from './components/Table';
import { Tree } from './components/Tree';
import { Container, Card, Layout } from './components/Layout';
import { ThemeProvider } from './theme/ThemeProvider';

const DemoApp: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [selectedNode, setSelectedNode] = useState<string>();

  const tableData = [
    { id: '1', name: 'Document 1', size: '2.5 MB', modified: '2024-01-15' },
    { id: '2', name: 'Document 2', size: '1.2 MB', modified: '2024-01-16' },
    { id: '3', name: 'Document 3', size: '3.8 MB', modified: '2024-01-17' },
  ];

  const treeData = [
    {
      id: '1',
      label: 'Documents',
      icon: '📁',
      children: [
        { id: '1-1', label: 'Work', icon: '📁' },
        { id: '1-2', label: 'Personal', icon: '📁' },
      ],
    },
    {
      id: '2',
      label: 'Images',
      icon: '📁',
      children: [
        { id: '2-1', label: 'Photos', icon: '📁' },
        { id: '2-2', label: 'Screenshots', icon: '📁' },
      ],
    },
  ];

  return (
    <ThemeProvider>
      <Container>
        <Layout direction="column" gap="24px" padding="20px 0">
          <Card title="Shared Components Library - Demo">
            <p style={{ marginBottom: '16px', color: '#666' }}>
              This is a showcase of the federated shared component library.
              These components are available to all micro-frontends via Module Federation 2.0.
            </p>
            <p style={{ fontSize: '12px', color: '#999' }}>
              <strong>Version:</strong> 1.0.0 | <strong>Port:</strong> 3001
            </p>
          </Card>

          <Card title="Buttons">
            <Layout direction="row" gap="12px">
              <Button variant="primary" onClick={() => alert('Primary clicked!')}>
                Primary Button
              </Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="danger">Danger Button</Button>
              <Button variant="primary" size="small">Small</Button>
              <Button variant="primary" size="large">Large</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </Layout>
          </Card>

          <Card title="Input">
            <Input
              label="Name"
              value={inputValue}
              onChange={setInputValue}
              placeholder="Enter your name..."
            />
            <p style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
              Current value: {inputValue || '(empty)'}
            </p>
          </Card>

          <Card title="Table">
            <Table
              columns={[
                { key: 'name', header: 'Name', width: '40%' },
                { key: 'size', header: 'Size', width: '20%' },
                { key: 'modified', header: 'Modified', width: '40%' },
              ]}
              data={tableData}
              onRowClick={(item) => alert(`Clicked: ${item.name}`)}
            />
          </Card>

          <Card title="Tree">
            <Tree
              nodes={treeData}
              onNodeClick={(node) => {
                setSelectedNode(node.id);
                console.log('Selected node:', node);
              }}
              selectedId={selectedNode}
            />
            {selectedNode && (
              <p style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                Selected node ID: {selectedNode}
              </p>
            )}
          </Card>
        </Layout>
      </Container>
    </ThemeProvider>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<DemoApp />);
}
