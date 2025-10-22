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

  // Box design system - Content platform styles
  const containerStyles: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const tabNavContainerStyles: React.CSSProperties = {
    borderBottom: '1px solid #e2e2e2',
    backgroundColor: '#ffffff',
    padding: '0 20px',
  };

  const tabNavStyles: React.CSSProperties = {
    display: 'flex',
    gap: '0',
    alignItems: 'center',
  };

  const tabButtonStyles = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 16px',
    backgroundColor: 'transparent',
    color: isActive ? '#0061d5' : '#767676',
    border: 'none',
    borderBottom: isActive ? '2px solid #0061d5' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: isActive ? 600 : 400,
    transition: 'all 0.15s',
    marginBottom: '-1px',
    position: 'relative' as const,
  });

  const contentStyles: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
  };

  const hitCountStyles: React.CSSProperties = {
    marginLeft: '4px',
    color: '#767676',
    fontWeight: 400,
  };

  // Get search hit counts for each tab
  const getTabHitCount = (plugin: any) => {
    const searchQuery = contentContext.filters.searchText;

    if (!searchQuery || searchQuery.trim() === '') {
      return null; // Don't show count when not searching
    }

    if (plugin.getSearchHitCount) {
      try {
        return plugin.getSearchHitCount(searchQuery);
      } catch (error) {
        console.error(`Error getting hit count for ${plugin.config.id}:`, error);
        return null;
      }
    }
    return null;
  };

  return (
    <Suspense fallback={<div style={{ padding: '20px' }}>Loading Content Platform...</div>}>
      <div style={containerStyles}>
        {/* Box design system - Horizontal tab navigation */}
        <div style={tabNavContainerStyles}>
          <div style={tabNavStyles}>
            {loadedTabs.map(({ plugin }) => {
              const hitCount = getTabHitCount(plugin);
              const isActive = activeTabId === plugin.config.id;

              return (
                <button
                  key={plugin.config.id}
                  style={tabButtonStyles(isActive)}
                  onClick={() => setActiveTabId(plugin.config.id)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#222222';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#767676';
                    }
                  }}
                >
                  {plugin.config.icon && <span style={{ marginRight: '6px' }}>{plugin.config.icon}</span>}
                  {plugin.config.name}
                  {hitCount !== null && (
                    <span style={hitCountStyles}>({hitCount})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Tab Content */}
        <div style={contentStyles}>
          {ActiveTabComponent ? (
            <Suspense fallback={
              <div style={{ padding: '40px', textAlign: 'center', color: '#767676' }}>
                Loading tab...
              </div>
            }>
              <ActiveTabComponent
                context={contentContext}
                onNavigate={handleNavigate}
                onSelect={handleSelect}
              />
            </Suspense>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#767676' }}>
              {loadedTabs.length === 0 ? 'Loading tabs...' : 'No tab selected'}
            </div>
          )}
        </div>
      </div>
    </Suspense>
  );
};

export default ContentPlatform;
