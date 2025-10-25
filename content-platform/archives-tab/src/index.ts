/**
 * Archives Tab - Development Entry Point
 *
 * This file is used for standalone development of the Archives tab.
 * In production, the tab is loaded via Module Federation using Plugin.tsx
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from '@apollo/client';
import { createApolloClient } from '@modular-platform/shared-data';
import { ArchivesTab } from './ArchivesTab';

// Create Apollo client
const client = createApolloClient('http://localhost:4000/graphql');

// Mock Platform Context for development
const mockContext = {
  user: {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    permissions: ['read', 'write', 'admin'],
  },
  search: {
    query: '',
    filters: [],
  },
  selection: {
    selectedIds: [],
  },
  navigation: {
    currentTab: 'archives',
    currentPath: '/archives',
  },
};

// Bootstrap the tab for development
function bootstrap() {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = createRoot(rootElement);

  root.render(
    React.createElement(
      ApolloProvider,
      { client },
      React.createElement(ArchivesTab, {
        searchQuery: mockContext.search.query,
        filters: mockContext.search.filters,
      })
    )
  );
}

bootstrap().catch(console.error);

export {};
