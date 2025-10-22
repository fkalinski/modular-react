import React, { Suspense, lazy, useState } from 'react';

// Lazy load remote modules
const ThemeProvider = lazy(() => import('shared_components/Theme').then(m => ({ default: m.ThemeProvider })));
const Button = lazy(() => import('shared_components/Button').then(m => ({ default: m.Button })));
const Container = lazy(() => import('shared_components/Layout').then(m => ({ default: m.Container })));
const Card = lazy(() => import('shared_components/Layout').then(m => ({ default: m.Card })));

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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('content');

  const headerStyles: React.CSSProperties = {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: '16px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  };

  const navStyles: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #333',
  };

  const tabButtonStyles = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: isActive ? '#fff' : '#999',
    border: 'none',
    borderBottom: isActive ? '2px solid #0066cc' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isActive ? 600 : 400,
    transition: 'all 0.2s',
    marginBottom: '-2px',
  });

  const contentStyles: React.CSSProperties = {
    minHeight: 'calc(100vh - 120px)',
    padding: '20px 0',
  };

  const ActiveTabComponent = tabs.find(t => t.id === activeTab)?.component || tabs[0].component;

  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading platform...</div>}>
      <ThemeProvider>
        <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          <header style={headerStyles}>
            <Container>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h1 style={{ fontSize: '24px', margin: 0 }}>Modular Platform</h1>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  Module Federation 2.0 PoC
                </div>
              </div>
              <nav style={navStyles}>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    style={tabButtonStyles(activeTab === tab.id)}
                    onClick={() => setActiveTab(tab.id)}
                    onMouseEnter={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.color = '#ccc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== tab.id) {
                        e.currentTarget.style.color = '#999';
                      }
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </Container>
          </header>

          <main style={contentStyles}>
            <Container>
              <Suspense
                fallback={
                  <Card>
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      Loading {tabs.find(t => t.id === activeTab)?.label}...
                    </div>
                  </Card>
                }
              >
                <ActiveTabComponent />
              </Suspense>
            </Container>
          </main>
        </div>
      </ThemeProvider>
    </Suspense>
  );
};

export default App;
