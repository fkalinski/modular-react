import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

// Import store creator from shared data
const createStoreModule = import('shared_data/store');
const PlatformContextProvider = lazy(() =>
  import('shared_data/context').then(m => ({ default: m.PlatformContextProvider }))
);

import App from './App';

// Bootstrap function to handle async imports
async function bootstrap() {
  const { createStore } = await createStoreModule;
  const store = createStore();

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  root.render(
    <Provider store={store}>
      <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Initializing platform...</div>}>
        <PlatformContextProvider>
          <App />
        </PlatformContextProvider>
      </Suspense>
    </Provider>
  );
}

bootstrap().catch(console.error);
