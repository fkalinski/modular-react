import React, { Suspense, lazy, useState, useEffect } from 'react';
import type { TabPlugin, TabProps } from './tab-contract';

// Lazy load shared components
const Card = lazy(() => import('shared_components/Layout').then(m => ({ default: m.Card })));
const Table = lazy(() => import('shared_components/Table').then(m => ({ default: m.Table })));
const Button = lazy(() => import('shared_components/Button').then(m => ({ default: m.Button })));
const Layout = lazy(() => import('shared_components/Layout').then(m => ({ default: m.Layout })));
const Input = lazy(() => import('shared_components/Input').then(m => ({ default: m.Input })));

// Mock data for hubs
interface Hub {
  id: string;
  name: string;
  type: string;
  description: string;
  members: number;
  visibility: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
}

const mockHubs: Hub[] = [
  {
    id: 'h1',
    name: 'Engineering Team',
    type: 'hub',
    description: 'Central hub for engineering collaboration',
    members: 42,
    visibility: 'private',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20',
  },
  {
    id: 'h2',
    name: 'Product & Design',
    type: 'hub',
    description: 'Product planning and design discussions',
    members: 28,
    visibility: 'public',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-19',
  },
  {
    id: 'h3',
    name: 'Marketing Hub',
    type: 'hub',
    description: 'Marketing campaigns and content',
    members: 15,
    visibility: 'public',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-18',
  },
  {
    id: 'h4',
    name: 'Customer Success',
    type: 'hub',
    description: 'Customer support and success initiatives',
    members: 19,
    visibility: 'private',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-21',
  },
];

// Tab component implementation
const HubsTabComponent: React.FC<TabProps> = ({ context, onNavigate, onSelect }) => {
  const [hubs, setHubs] = useState<Hub[]>(mockHubs);
  const [selectedHubs, setSelectedHubs] = useState<string[]>([]);
  const [newHubName, setNewHubName] = useState('');

  // React to context changes (filters)
  useEffect(() => {
    if (context.filters.searchText) {
      const filtered = mockHubs.filter(h =>
        h.name.toLowerCase().includes(context.filters.searchText.toLowerCase()) ||
        h.description.toLowerCase().includes(context.filters.searchText.toLowerCase())
      );
      setHubs(filtered);
    } else {
      setHubs(mockHubs);
    }
  }, [context.filters.searchText]);

  // Sync with platform selection
  useEffect(() => {
    setSelectedHubs(context.selection.selectedIds);
  }, [context.selection.selectedIds]);

  const handleHubClick = (hub: Hub) => {
    const newSelection = selectedHubs.includes(hub.id)
      ? selectedHubs.filter(id => id !== hub.id)
      : [...selectedHubs, hub.id];

    setSelectedHubs(newSelection);
    onSelect(newSelection);
    onNavigate(`/hubs/${hub.id}`);
  };

  const handleCreateHub = () => {
    if (newHubName.trim()) {
      alert(`Creating hub: "${newHubName}"`);
      setNewHubName('');
    }
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const hubCardStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    marginTop: '16px',
  };

  const hubItemStyles = (isSelected: boolean): React.CSSProperties => ({
    padding: '20px',
    backgroundColor: isSelected ? '#e7f3ff' : '#fff',
    border: `2px solid ${isSelected ? '#0066cc' : '#e9ecef'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  const getVisibilityBadge = (visibility: string) => ({
    display: 'inline-block',
    padding: '4px 8px',
    fontSize: '11px',
    fontWeight: 600,
    borderRadius: '4px',
    backgroundColor: visibility === 'public' ? '#e7f5ec' : '#fff3cd',
    color: visibility === 'public' ? '#1e7e34' : '#856404',
  });

  return (
    <Suspense fallback={<div>Loading Hubs...</div>}>
      <div style={containerStyles}>
        {/* Create Hub Section */}
        <Suspense>
          <Card title="Create New Hub">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Hub Name"
                  value={newHubName}
                  onChange={setNewHubName}
                  placeholder="Enter hub name..."
                />
              </div>
              <Button variant="primary" onClick={handleCreateHub}>
                Create Hub
              </Button>
            </div>
          </Card>
        </Suspense>

        {/* Hub List */}
        <Suspense>
          <Card title={`Hubs ${context.filters.searchText ? `(filtered: "${context.filters.searchText}")` : ''}`}>
            <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>
                Showing {hubs.length} hub{hubs.length !== 1 ? 's' : ''} | Selected: {selectedHubs.length}
              </span>
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  setSelectedHubs([]);
                  onSelect([]);
                }}
                disabled={selectedHubs.length === 0}
              >
                Clear Selection
              </Button>
            </div>

            <div style={hubCardStyles}>
              {hubs.map((hub) => (
                <div
                  key={hub.id}
                  style={hubItemStyles(selectedHubs.includes(hub.id))}
                  onClick={() => handleHubClick(hub)}
                  onMouseEnter={(e) => {
                    if (!selectedHubs.includes(hub.id)) {
                      e.currentTarget.style.borderColor = '#adb5bd';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selectedHubs.includes(hub.id)) {
                      e.currentTarget.style.borderColor = '#e9ecef';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#212529' }}>
                      {hub.name}
                    </h4>
                    <span style={getVisibilityBadge(hub.visibility)}>
                      {hub.visibility}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px', minHeight: '40px' }}>
                    {hub.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#999' }}>
                    <span>👥 {hub.members} members</span>
                    <span>Updated {hub.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>

            {hubs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                No hubs found matching your search
              </div>
            )}
          </Card>
        </Suspense>

        {/* Selected Hubs Table */}
        {selectedHubs.length > 0 && (
          <Suspense>
            <Card title="Selected Hubs Details">
              <Table
                columns={[
                  { key: 'name', header: 'Name', width: '30%' },
                  { key: 'members', header: 'Members', width: '15%' },
                  { key: 'visibility', header: 'Visibility', width: '15%' },
                  { key: 'updatedAt', header: 'Last Updated', width: '20%' },
                  { key: 'description', header: 'Description', width: '20%' },
                ]}
                data={hubs.filter(h => selectedHubs.includes(h.id))}
                selectedIds={selectedHubs}
                onRowClick={(hub) => alert(`View details: ${hub.name}`)}
              />
            </Card>
          </Suspense>
        )}
      </div>
    </Suspense>
  );
};

// Plugin export
const HubsTabPlugin: TabPlugin = {
  config: {
    id: 'hubs',
    name: 'Hubs',
    icon: '🏢',
    version: '1.0.0',
    componentVersion: '^1.0.0', // Compatible with shared-components v1.x
    description: 'Manage and browse team hubs',
  },

  component: HubsTabComponent,

  // Actions this tab provides
  actions: [
    {
      id: 'create-hub',
      label: 'Create Hub',
      icon: '➕',
      handler: async () => {
        console.log('Create hub action');
      },
    },
    {
      id: 'delete-hubs',
      label: 'Delete Selected',
      icon: '🗑️',
      handler: async (context) => {
        console.log('Delete hubs:', context.selection.selectedIds);
      },
      disabled: (context) => context.selection.selectedIds.length === 0,
    },
    {
      id: 'export-hubs',
      label: 'Export',
      icon: '📤',
      handler: async (context) => {
        console.log('Export hubs:', context.selection.selectedIds);
      },
    },
  ],

  onActivate: () => {
    console.log('[HubsTab] Tab activated - loaded from external repository');
  },

  onDeactivate: () => {
    console.log('[HubsTab] Tab deactivated');
  },

  contextRequirements: ['filters', 'selection', 'navigation'],
};

export default HubsTabPlugin;
