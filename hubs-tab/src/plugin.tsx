import React, { Suspense, lazy, useState, useEffect } from 'react';
import type { TabPlugin, TabProps } from './tab-contract';

// Lazy load shared components
const Table = lazy(() => import('shared_components/Table').then(m => ({ default: m.Table })));
const Button = lazy(() => import('shared_components/Button').then(m => ({ default: m.Button })));
const Input = lazy(() => import('shared_components/Input').then(m => ({ default: m.Input })));
const Breadcrumbs = lazy(() => import('shared_components/Breadcrumbs').then(m => ({ default: m.Breadcrumbs })));

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const createHubSectionStyles: React.CSSProperties = {
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
    marginBottom: '16px',
  };

  const hubGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  };

  const hubCardStyles = (isSelected: boolean): React.CSSProperties => ({
    backgroundColor: '#ffffff',
    border: `1px solid ${isSelected ? '#0061d5' : '#e2e2e2'}`,
    borderRadius: '4px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    boxShadow: isSelected ? '0 0 0 2px rgba(0, 97, 213, 0.2)' : 'none',
  });

  const hubTitleStyles: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: '#222222',
    margin: '0 0 8px 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const hubDescriptionStyles: React.CSSProperties = {
    fontSize: '13px',
    color: '#767676',
    lineHeight: '18px',
    marginBottom: '16px',
    minHeight: '36px',
  };

  const hubMetaStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#909090',
  };

  const badgeStyles = (visibility: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    fontSize: '11px',
    fontWeight: 500,
    borderRadius: '2px',
    backgroundColor: visibility === 'public' ? '#e7f5ec' : '#fff3cd',
    color: visibility === 'public' ? '#1e7e34' : '#856404',
  });

  const iconButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    border: '1px solid #d3d3d3',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    color: '#222222',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  const emptyStateStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#767676',
    fontSize: '13px',
  };

  return (
    <Suspense fallback={<div style={{ padding: '20px' }}>Loading Hubs...</div>}>
      {/* Breadcrumbs */}
      <Suspense fallback={null}>
        <Breadcrumbs
          items={[
            { id: 'content', label: 'Content', icon: '📁' },
            { id: 'hubs', label: 'Hubs', icon: '🏢' },
          ]}
        />
      </Suspense>

      <div style={containerStyles}>
        {/* Toolbar */}
        <div style={toolbarStyles}>
          <div style={toolbarLeftStyles}>
            <span style={{ fontSize: '13px', color: '#222222', fontWeight: 500 }}>
              {hubs.length} hub{hubs.length !== 1 ? 's' : ''}
            </span>
            {selectedHubs.length > 0 && (
              <span style={{ fontSize: '12px', color: '#767676' }}>
                • {selectedHubs.length} selected
              </span>
            )}
          </div>

          <div style={toolbarRightStyles}>
            <button
              style={iconButtonStyles}
              onClick={() => setViewMode('grid')}
              disabled={viewMode === 'grid'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="8" y="1" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="1" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="8" y="8" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Grid
            </button>
            <button
              style={iconButtonStyles}
              onClick={() => setViewMode('list')}
              disabled={viewMode === 'list'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" />
                <line x1="1" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" />
                <line x1="1" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              List
            </button>
            {selectedHubs.length > 0 && (
              <Suspense fallback={null}>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    setSelectedHubs([]);
                    onSelect([]);
                  }}
                >
                  Clear Selection
                </Button>
              </Suspense>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div style={contentAreaStyles}>
          {/* Create Hub Section */}
          <div style={createHubSectionStyles}>
            <div style={sectionTitleStyles}>Create New Hub</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Suspense fallback={null}>
                  <Input
                    label="Hub Name"
                    value={newHubName}
                    onChange={setNewHubName}
                    placeholder="Enter hub name..."
                  />
                </Suspense>
              </div>
              <Suspense fallback={null}>
                <Button variant="primary" onClick={handleCreateHub}>
                  Create Hub
                </Button>
              </Suspense>
            </div>
          </div>

          {/* Hubs Grid/List */}
          {viewMode === 'grid' ? (
            <div style={hubGridStyles}>
              {hubs.map((hub) => {
                const isSelected = selectedHubs.includes(hub.id);
                return (
                  <div
                    key={hub.id}
                    style={hubCardStyles(isSelected)}
                    onClick={() => handleHubClick(hub)}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#b8b8b8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#e2e2e2';
                      }
                    }}
                  >
                    <div style={hubTitleStyles}>
                      <span>🏢 {hub.name}</span>
                      <span style={badgeStyles(hub.visibility)}>
                        {hub.visibility}
                      </span>
                    </div>
                    <div style={hubDescriptionStyles}>
                      {hub.description}
                    </div>
                    <div style={hubMetaStyles}>
                      <span>👥 {hub.members} members</span>
                      <span>{hub.updatedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Suspense fallback={<div>Loading table...</div>}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e2e2' }}>
                <Table
                  columns={[
                    { key: 'name', header: 'Name', width: '25%' },
                    { key: 'description', header: 'Description', width: '35%' },
                    { key: 'members', header: 'Members', width: '15%' },
                    { key: 'visibility', header: 'Visibility', width: '15%' },
                    { key: 'updatedAt', header: 'Updated', width: '10%' },
                  ]}
                  data={hubs}
                  selectedIds={selectedHubs}
                  onSelectionChange={setSelectedHubs}
                  showCheckboxes={true}
                  onRowClick={(hub: Hub) => handleHubClick(hub)}
                />
              </div>
            </Suspense>
          )}

          {hubs.length === 0 && (
            <div style={emptyStateStyles}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
              <div>No hubs found</div>
              {context.filters.searchText && (
                <div style={{ marginTop: '8px', color: '#909090' }}>
                  Try adjusting your search: "{context.filters.searchText}"
                </div>
              )}
            </div>
          )}
        </div>
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
