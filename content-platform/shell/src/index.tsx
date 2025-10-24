import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

// Import store module
const createStoreModule = import('shared_data/store');

// Lazy load components from federated modules
// Note: Type widening is necessary here due to Module Federation limitations:
// - Federated modules use re-exports (`export * from './file'`) which TypeScript
//   cannot fully resolve at compile time since the modules are loaded dynamically
// - The actual runtime types are correct and validated at the producer's build
// - This is the standard pattern for Module Federation with TypeScript
// - Alternative would be to manually maintain duplicate type definitions, which
//   defeats the purpose of the type distribution system
const PlatformContextProvider = lazy(() =>
  import('shared_data/context').then(m => {
    // Runtime: m.PlatformContextProvider exists as React.FC<{children}>
    // Type-safe widening through unknown for dynamic Module Federation imports
    const { PlatformContextProvider } = m as unknown as Record<string, React.ComponentType<{ children: React.ReactNode }>>;
    return { default: PlatformContextProvider };
  })
);

const ThemeProvider = lazy(() =>
  import('shared_components/Theme').then(m => {
    // Runtime: m.ThemeProvider exists as React.FC<{children}>
    // Type-safe widening through unknown for dynamic Module Federation imports
    const { ThemeProvider } = m as unknown as Record<string, React.ComponentType<{ children: React.ReactNode }>>;
    return { default: ThemeProvider };
  })
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
