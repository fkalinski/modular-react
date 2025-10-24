import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Bootstrap function - App handles all providers internally
async function bootstrap() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);
  root.render(<App />);
}

bootstrap().catch(console.error);
