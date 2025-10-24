import React, { Suspense, lazy, useState, useEffect } from 'react';

// Lazy load remote modules - Box design system components
const ThemeProvider = lazy(() => import('shared_components/Theme').then(m => ({ default: m.ThemeProvider })));
const Sidebar = lazy(() => import('shared_components/Sidebar').then(m => ({ default: m.Sidebar })));
const TopBar = lazy(() => import('shared_components/TopBar').then(m => ({ default: m.TopBar })));
const SearchBar = lazy(() => import('shared_components/SearchBar').then(m => ({ default: m.SearchBar })));
const NavigationProvider = lazy(() => import('shared_components/NavigationService').then(m => ({ default: m.NavigationProvider })));

// Lazy load tabs
const ContentShell = lazy(() => import('content_shell/ContentPlatform').catch(() => ({
  default: () => <div style={{ padding: '20px', color: '#999' }}>Content platform not available</div>
})));

const ReportsTab = lazy(() => import('reports_tab/App').catch(() => ({
  default: () => <div style={{ padding: '20px', color: '#999' }}>Reports tab not available</div>
})));

const UserTab = lazy(() => import('user_tab/App').catch(() => ({
  default: () => <div style={{ padding: '20px', color: '#999' }}>User tab not available</div>
})));

type TabId = 'content' | 'reports' | 'user';

interface Tab {
  id: TabId;
  label: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

const tabs: Tab[] = [
  { id: 'content', label: 'Content', component: ContentShell },
  { id: 'reports', label: 'Reports', component: ReportsTab },
  { id: 'user', label: 'User', component: UserTab },
];

// Helper functions for URL state management
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    tab: (params.get('tab') || 'content') as TabId,
    search: params.get('search') || '',
  };
};

const updateUrlParams = (tab: TabId, search: string) => {
  const params = new URLSearchParams();
  params.set('tab', tab);
  if (search) {
    params.set('search', search);
  }
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, '', newUrl);
};

const App: React.FC = () => {
  // Initialize from URL params
  const urlParams = getUrlParams();
  const [activeTab, setActiveTab] = useState<TabId>(urlParams.tab);
  const [searchValue, setSearchValue] = useState(urlParams.search);

  // Update URL when state changes
  useEffect(() => {
    updateUrlParams(activeTab, searchValue);
  }, [activeTab, searchValue]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = getUrlParams();
      setActiveTab(urlParams.tab);
      setSearchValue(urlParams.search);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Box design system - Sidebar items
  const sidebarItems = [
    {
      id: 'content',
      label: 'Content',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M14 2H2C1.44772 2 1 2.44772 1 3V13C1 13.5523 1.44772 14 2 14H14C14.5523 14 15 13.5523 15 13V3C15 2.44772 14.5523 2 14 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M1 6H15" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M13 2H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V3C14 2.44772 13.5523 2 13 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M5 6H11M5 9H11M5 12H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'user',
      label: 'User',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M13 14V12.6667C13 11.9594 12.719 11.2811 12.219 10.781C11.7189 10.281 11.0406 10 10.3333 10H5.66667C4.95942 10 4.28115 10.281 3.78105 10.781C3.28095 11.2811 3 11.9594 3 12.6667V14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 7.33333C9.47276 7.33333 10.6667 6.13943 10.6667 4.66667C10.6667 3.19391 9.47276 2 8 2C6.52724 2 5.33333 3.19391 5.33333 4.66667C5.33333 6.13943 6.52724 7.33333 8 7.33333Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ];

  // Box design system layout styles
  const appContainerStyles: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#f7f7f8',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const mainContentStyles: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const contentAreaStyles: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    backgroundColor: '#f7f7f8',
  };

  const ActiveTabComponent = tabs.find(t => t.id === activeTab)?.component || tabs[0].component;

  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading platform...</div>}>
      <ThemeProvider>
        <NavigationProvider
          currentSection={activeTab}
          onNavigate={(target) => {
            if (target === 'content' || target === 'reports' || target === 'user') {
              setActiveTab(target);
            }
          }}
        >
          <div style={appContainerStyles}>
          {/* Box design system - Dark sidebar navigation */}
          <Sidebar
            items={sidebarItems}
            activeId={activeTab}
            onItemClick={(item: { id: string }) => setActiveTab(item.id as TabId)}
          />

          {/* Main content area with TopBar */}
          <div style={mainContentStyles}>
            {/* Box design system - TopBar with search and utilities */}
            <TopBar
              searchComponent={
                <SearchBar
                  value={searchValue}
                  onChange={setSearchValue}
                  placeholder="Search files, folders, and content"
                />
              }
              onUploadClick={() => console.log('Upload clicked')}
              onNotificationsClick={() => console.log('Notifications clicked')}
              onUserClick={() => console.log('User clicked')}
              userName="Platform User"
              notificationCount={3}
            />

            {/* Content area */}
            <div style={contentAreaStyles}>
              <Suspense
                fallback={
                  <div style={{ padding: '40px', textAlign: 'center', color: '#767676' }}>
                    Loading {tabs.find(t => t.id === activeTab)?.label}...
                  </div>
                }
              >
                <ActiveTabComponent />
              </Suspense>
            </div>
          </div>
        </div>
        </NavigationProvider>
      </ThemeProvider>
    </Suspense>
  );
};

export default App;
