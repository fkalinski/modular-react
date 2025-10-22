import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { TabPlugin, ContentContext } from '@tab-contract';

// Lazy load shared components
const Card = lazy(() => import('shared_components/Layout').then(m => ({ default: m.Card })));
const Input = lazy(() => import('shared_components/Input').then(m => ({ default: m.Input })));
const Button = lazy(() => import('shared_components/Button').then(m => ({ default: m.Button })));

// Lazy load tabs
const FilesTab = lazy(() => import('files_tab/Plugin').catch(() => ({
  default: { config: { id: 'files', name: 'Files (unavailable)' }, component: () =>
    <div style={{ padding: '20px', color: '#999' }}>Files tab not available</div>
  }
})));

const HubsTab = lazy(() => import('hubs_tab/Plugin').catch(() => ({
  default: { config: { id: 'hubs', name: 'Hubs (unavailable)' }, component: () =>
    <div style={{ padding: '20px', color: '#999' }}>Hubs tab not available</div>
  }
})));

interface LoadedTab {
  plugin: TabPlugin;
}

const ContentPlatform: React.FC = () => {
  const dispatch = useDispatch();
  const [activeTabId, setActiveTabId] = useState<string>('files');
  const [loadedTabs, setLoadedTabs] = useState<LoadedTab[]>([]);
  const [searchText, setSearchText] = useState('');

  // Get state from Redux (from shared-data)
  const filters = useSelector((state: any) => state.filters || { active: [], searchText: '' });
  const selection = useSelector((state: any) => state.selection || { selectedIds: [] });
  const navigation = useSelector((state: any) => state.navigation || { currentPath: '/', breadcrumbs: [] });

  // Load tabs on mount
  useEffect(() => {
    const loadTabs = async () => {
      try {
        const filesModule = await FilesTab;
        const hubsModule = await HubsTab;

        const tabs: LoadedTab[] = [
          { plugin: filesModule.default as TabPlugin },
          { plugin: hubsModule.default as TabPlugin },
        ];

        // Register tabs and inject reducers if needed
        tabs.forEach(({ plugin }) => {
          if (plugin.reducer && plugin.reducerKey) {
            // Inject reducer (assuming store is available via shared-data)
            console.log(`[ContentPlatform] Would inject reducer: ${plugin.reducerKey}`);
          }

          if (plugin.onActivate) {
            console.log(`[ContentPlatform] Tab ${plugin.config.id} activated`);
          }
        });

        setLoadedTabs(tabs);
      } catch (error) {
        console.error('Error loading tabs:', error);
      }
    };

    loadTabs();
  }, []);

  // Create context to pass to tabs
  const contentContext: ContentContext = {
    filters: {
      searchText: filters.searchText || searchText,
      active: filters.active || [],
      dateRange: filters.dateRange,
      contentType: filters.contentType,
    },
    selection: {
      selectedIds: selection.selectedIds || [],
      lastSelectedId: selection.lastSelectedId,
    },
    navigation: {
      currentPath: navigation.currentPath || '/',
      breadcrumbs: navigation.breadcrumbs || [],
    },
  };

  const handleNavigate = (path: string) => {
    console.log('[ContentPlatform] Navigate to:', path);
    // Dispatch navigation action
  };

  const handleSelect = (ids: string[]) => {
    console.log('[ContentPlatform] Select items:', ids);
    // Dispatch selection action
  };

  const handleSearch = () => {
    console.log('[ContentPlatform] Search:', searchText);
    // Dispatch filter action from shared-data
    if ((window as any).sharedDataActions) {
      dispatch((window as any).sharedDataActions.setSearchText(searchText));
    }
  };

  const activeTab = loadedTabs.find(t => t.plugin.config.id === activeTabId);
  const ActiveTabComponent = activeTab?.plugin.component;

  const headerStyles: React.CSSProperties = {
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '2px solid #e9ecef',
  };

  const tabNavStyles: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    marginTop: '16px',
  };

  const tabButtonStyles = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    backgroundColor: isActive ? '#0066cc' : 'transparent',
    color: isActive ? '#fff' : '#666',
    border: '1px solid',
    borderColor: isActive ? '#0066cc' : '#dee2e6',
    borderRadius: '4px 4px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 400,
    transition: 'all 0.2s',
  });

  return (
    <Suspense fallback={<div>Loading Content Platform...</div>}>
      <div>
        <Card title="Content Platform">
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Extensible content platform with pluggable tabs. Each tab implements the TabPlugin contract
            and can be deployed independently.
          </p>

          {/* Search & Filter Pane */}
          <div style={headerStyles}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>
              Search & Filters
            </h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label="Search"
                  value={searchText}
                  onChange={setSearchText}
                  placeholder="Search content..."
                />
              </div>
              <Button variant="primary" onClick={handleSearch}>
                Apply Filters
              </Button>
              <Button variant="secondary" onClick={() => setSearchText('')}>
                Clear
              </Button>
            </div>

            {/* Tab Navigation */}
            <div style={tabNavStyles}>
              {loadedTabs.map(({ plugin }) => (
                <button
                  key={plugin.config.id}
                  style={tabButtonStyles(activeTabId === plugin.config.id)}
                  onClick={() => setActiveTabId(plugin.config.id)}
                  onMouseEnter={(e) => {
                    if (activeTabId !== plugin.config.id) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTabId !== plugin.config.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {plugin.config.icon && <span style={{ marginRight: '6px' }}>{plugin.config.icon}</span>}
                  {plugin.config.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Tab Content */}
          <div style={{ minHeight: '400px' }}>
            {ActiveTabComponent ? (
              <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading tab...</div>}>
                <ActiveTabComponent
                  context={contentContext}
                  onNavigate={handleNavigate}
                  onSelect={handleSelect}
                />
              </Suspense>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                {loadedTabs.length === 0 ? 'Loading tabs...' : 'No tab selected'}
              </div>
            )}
          </div>

          {/* Debug Info */}
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '12px' }}>
            <strong>Debug:</strong> Loaded {loadedTabs.length} tabs | Active: {activeTabId} |
            Search: "{searchText}" | Selected: {contentContext.selection.selectedIds.length} items
          </div>
        </Card>
      </div>
    </Suspense>
  );
};

export default ContentPlatform;
