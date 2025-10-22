import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

const createStoreModule = import('shared_data/store');
const PlatformContextProvider = lazy(() =>
  import('shared_data/context').then(m => ({ default: m.PlatformContextProvider }))
);
const ThemeProvider = lazy(() =>
  import('shared_components/Theme').then(m => ({ default: m.ThemeProvider }))
);

import ContentPlatform from './ContentPlatform';

async function bootstrap() {
  const { createStore } = await createStoreModule;
  const store = createStore();

  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  const root = createRoot(rootElement);
  root.render(
    <Provider store={store}>
      <Suspense fallback={<div style={{ padding: '20px' }}>Loading...</div>}>
        <PlatformContextProvider>
          <ThemeProvider>
            <ContentPlatform />
          </ThemeProvider>
        </PlatformContextProvider>
      </Suspense>
    </Provider>
  );
}

bootstrap().catch(console.error);
