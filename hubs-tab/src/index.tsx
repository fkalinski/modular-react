import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import HubsTabPlugin from './plugin';

const ThemeProvider = lazy(() =>
  import('shared_components/Theme').then(m => ({ default: m.ThemeProvider }))
);

// Standalone mode for development
const mockContext = {
  filters: {
    searchText: '',
    active: [],
  },
  selection: {
    selectedIds: [],
  },
  navigation: {
    currentPath: '/',
    breadcrumbs: [{ label: 'Home', path: '/' }],
  },
};

const HubsComponent = HubsTabPlugin.component;

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <ThemeProvider>
      <div style={{ padding: '20px' }}>
        <h1 style={{ marginBottom: '20px' }}>Hubs Tab - Standalone Mode</h1>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          This tab is developed in a separate repository and implements the TabPlugin contract.
        </p>
        <HubsComponent
          context={mockContext}
          onNavigate={(path) => console.log('Navigate:', path)}
          onSelect={(ids) => console.log('Select:', ids)}
        />
      </div>
    </ThemeProvider>
  </Suspense>
);

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
